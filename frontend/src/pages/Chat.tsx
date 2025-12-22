import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Edit,
  Phone,
  Video,
  Send,
  Smile,
  Info,
  Search,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chatStore";
import { useChatSocket } from "@/hooks/useChatSocket";
import { chatService } from "@/api/chat.service";
import { userService } from "@/api/user.service";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { UserResponseType } from "@/types/UserResponseType";
import type { ConversationResponse } from "@/types/ChatType";

export default function Chat() {
  const { user } = useAuthStore();
  const {
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    setMessages,
    typingStatus,
    onlineUsers,
  } = useChatStore();
  const { sendMessage, sendTyping, isConnected } = useChatSocket();
  const [messageInput, setMessageInput] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResponseType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryConversationId = searchParams.get("id");

  // Sync URL param with active conservation
  useEffect(() => {
    if (queryConversationId) {
      const id = parseInt(queryConversationId);
      if (!isNaN(id)) {
        setActiveConversationId(id);
      }
    }
  }, [queryConversationId, setActiveConversationId]);

  // Fetch conversations on mount
  useEffect(() => {
    chatService
      .getConversations()
      .then(setConversations)
      .catch((err) => {
        console.error("Failed to fetch conversations", err);
        toast.error("Failed to load chats");
      });
  }, [setConversations]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      chatService
        .getMessages(activeConversationId)
        .then((msgs) => setMessages(activeConversationId, msgs))
        .catch((err) => console.error("Failed to fetch messages", err));
    }
  }, [activeConversationId, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConversationId]);

  // Search users for new chat
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        userService
          .setSearch(searchQuery)
          .then(setSearchResults)
          .finally(() => setIsSearching(false));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const getChatPartner = (conv: ConversationResponse) => {
    return conv.users.find((u) => u.id !== user?.id);
  };

  const handleCreateChat = async (targetUser: UserResponseType) => {
    try {
      const conv = await chatService.createOrGetConversation({
        recipientId: targetUser.id,
        isGroup: false,
      });

      if (!conversations.find((c) => c.id === conv.id)) {
        setConversations([conv, ...conversations]);
      }

      setActiveConversationId(conv.id);
      setSearchParams({ id: conv.id.toString() });
      setIsNewChatOpen(false);
      setSearchQuery("");
    } catch (err) {
      toast.error("Failed to start conversation");
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!messageInput.trim() && !selectedFile) || !activeConversationId)
      return;

    try {
      setIsUploading(true);
      let attachmentUrl = undefined;
      let messageType: "TEXT" | "IMAGE" | "VIDEO" = "TEXT";

      if (selectedFile) {
        const response = await chatService.uploadAttachment(selectedFile);
        attachmentUrl = response.url;
        messageType = selectedFile.type.startsWith("image/")
          ? "IMAGE"
          : "VIDEO";
      }

      sendMessage(
        activeConversationId,
        messageInput,
        messageType,
        attachmentUrl
      );

      setMessageInput("");
      setSelectedFile(null);
      setFilePreview(null);
      sendTyping(activeConversationId, false);
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatCloudinaryUrl = (url: string) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    // For HEIC and other formats, Cloudinary f_auto handles conversion
    if (url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto/");
    }
    return url;
  };

  const isEmojiOnly = (text: string) => {
    if (!text) return false;
    const emojiRegex =
      /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|\s)+$/g;
    const cleanText = text.replace(/\s/g, "");
    return cleanText.length <= 4 && emojiRegex.test(cleanText);
  };

  const activeTyping =
    activeConversationId && typingStatus[activeConversationId]
      ? Object.entries(typingStatus[activeConversationId])
          .filter(
            ([username, isTyping]) => isTyping && username !== user?.username
          )
          .map(([username]) => username)
      : [];

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-black overflow-hidden border-t border-white/5">
      {/* Sidebar */}
      <div
        className={cn(
          "w-full md:w-[350px] border-r border-white/10 flex flex-col transition-all duration-300",
          activeConversationId ? "hidden md:flex" : "flex"
        )}
      >
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">{user?.username}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsNewChatOpen(true)}
          >
            <Edit className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-2 space-y-1">
            {conversations.map((conv) => {
              const partner = getChatPartner(conv);
              const isPartnerOnline = partner && onlineUsers[partner.username];

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setSearchParams({ id: conv.id.toString() });
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-accent/50 group",
                    activeConversationId === conv.id ? "bg-accent" : ""
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-transparent group-hover:border-pink-500/20 transition-all">
                      <AvatarImage src={partner?.profilePic || ""} />
                      <AvatarFallback className="bg-linear-to-br from-pink-500/10 to-purple-500/10 text-pink-600 font-medium">
                        {partner?.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isPartnerOnline && (
                      <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background shadow-sm" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="font-semibold text-sm truncate">
                        {partner?.username}
                      </p>
                      {conv.lastMessage && (
                        <span className="text-[11px] text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(conv.lastMessage.timestamp),
                            { addSuffix: false }
                          )}
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-sm truncate",
                        conv.lastMessage &&
                          !conv.lastMessage.isRead &&
                          conv.lastMessage.senderId !== user?.id
                          ? "text-foreground font-bold"
                          : "text-muted-foreground"
                      )}
                    >
                      {conv.lastMessage
                        ? `${
                            conv.lastMessage.senderId === user?.id
                              ? "You: "
                              : ""
                          }${
                            conv.lastMessage.content ||
                            (conv.lastMessage.type === "IMAGE"
                              ? "📸 Photo"
                              : conv.lastMessage.type === "VIDEO"
                              ? "🎥 Video"
                              : "Sent an attachment")
                          }`
                        : "Start a conversation"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col bg-black relative",
          !activeConversationId ? "hidden md:flex" : "flex"
        )}
      >
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 sticky top-0 bg-black/80 backdrop-blur-xl z-10">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => {
                    setActiveConversationId(null);
                    setSearchParams({});
                  }}
                >
                  <Search className="h-5 w-5 rotate-180" />
                </Button>
                <div className="relative cursor-pointer">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={getChatPartner(activeConversation)?.profilePic || ""}
                    />
                    <AvatarFallback className="bg-linear-to-br from-pink-500/10 to-purple-500/10 text-pink-600">
                      {getChatPartner(
                        activeConversation
                      )?.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {getChatPartner(activeConversation) &&
                    onlineUsers[
                      getChatPartner(activeConversation)!.username
                    ] && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                    )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold leading-none">
                    {getChatPartner(activeConversation)?.username}
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {getChatPartner(activeConversation) &&
                    onlineUsers[getChatPartner(activeConversation)!.username]
                      ? "Active now"
                      : getChatPartner(activeConversation)?.lastSeen
                      ? `Active ${formatDistanceToNow(
                          new Date(
                            getChatPartner(activeConversation)!.lastSeen!
                          ),
                          { addSuffix: true }
                        )}`
                      : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Video className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Info className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6 max-w-4xl mx-auto">
                {/* Initial Profile Info */}
                <div className="flex flex-col items-center py-8 space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={getChatPartner(activeConversation)?.profilePic || ""}
                    />
                    <AvatarFallback className="text-2xl">
                      {getChatPartner(
                        activeConversation
                      )?.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="font-bold text-lg">
                      {getChatPartner(activeConversation)?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      @{getChatPartner(activeConversation)?.username} ·
                      VibeShare
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-full font-semibold"
                  >
                    View Profile
                  </Button>
                </div>

                {/* Actual Messages */}
                {activeConversationId &&
                  (messages[activeConversationId] || []).map((msg, idx) => {
                    const isMe = msg.senderId === user?.id;
                    const prevMsg =
                      idx > 0 ? messages[activeConversationId][idx - 1] : null;
                    const showTime =
                      !prevMsg ||
                      new Date(msg.timestamp).getTime() -
                        new Date(prevMsg.timestamp).getTime() >
                        1000 * 60 * 30;

                    return (
                      <div key={msg.id} className="space-y-1">
                        {showTime && (
                          <div className="flex justify-center my-6">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest">
                              {format(new Date(msg.timestamp), "MMM d, h:mm a")}
                            </span>
                          </div>
                        )}

                        <div
                          className={cn(
                            "flex items-end gap-2 group",
                            isMe ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          <div
                            className={cn(
                              "relative transition-all duration-200",
                              isMe
                                ? "bg-linear-to-br from-[#a855f7] to-[#ec4899] text-white shadow-md rounded-[22px] rounded-br-[4px]"
                                : "bg-[#262626] text-white rounded-[22px] rounded-bl-[4px]",
                              msg.content && !isEmojiOnly(msg.content)
                                ? "px-4 py-2"
                                : "p-1",
                              "max-w-[85%] md:max-w-[70%]"
                            )}
                          >
                            {msg.attachmentUrl && (
                              <div
                                className={cn(
                                  "rounded-[18px] overflow-hidden bg-black/20",
                                  !msg.content && "mb-0"
                                )}
                              >
                                {msg.type === "IMAGE" ||
                                msg.attachmentUrl
                                  .toLowerCase()
                                  .match(/\.(jpeg|jpg|gif|png|webp|heic)/) ||
                                msg.attachmentUrl.includes("image/upload") ? (
                                  <img
                                    src={formatCloudinaryUrl(msg.attachmentUrl)}
                                    alt="attachment"
                                    className="max-h-[400px] w-full object-contain block"
                                    onLoad={() =>
                                      messagesEndRef.current?.scrollIntoView({
                                        behavior: "smooth",
                                      })
                                    }
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      const parent = target.parentElement;
                                      if (parent) {
                                        const errorMsg =
                                          document.createElement("div");
                                        errorMsg.className =
                                          "p-4 text-xs text-white/50 flex flex-col items-center gap-2 text-center";
                                        errorMsg.innerHTML =
                                          "<span>Failed to load image</span>";
                                        parent.appendChild(errorMsg);
                                      }
                                    }}
                                  />
                                ) : (
                                  <video
                                    src={formatCloudinaryUrl(msg.attachmentUrl)}
                                    controls
                                    className="max-h-[400px] w-full block"
                                    onLoadedData={() =>
                                      messagesEndRef.current?.scrollIntoView({
                                        behavior: "smooth",
                                      })
                                    }
                                  />
                                )}
                              </div>
                            )}

                            {msg.content && (
                              <p
                                className={cn(
                                  "leading-normal",
                                  isEmojiOnly(msg.content)
                                    ? "text-5xl py-2"
                                    : "text-[15px]"
                                )}
                              >
                                {msg.content}
                              </p>
                            )}
                          </div>

                          {isMe &&
                            msg.isRead &&
                            idx ===
                              messages[activeConversationId].length - 1 && (
                              <span className="text-[10px] text-muted-foreground/60 mb-1 select-none">
                                Seen
                              </span>
                            )}
                        </div>
                      </div>
                    );
                  })}

                {/* Typing Indicator */}
                {activeTyping.length > 0 && (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-muted px-4 py-3 rounded-full rounded-bl-sm flex gap-1">
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* File Preview */}
            {filePreview && (
              <div className="px-4 py-2 border-t bg-background animate-in slide-in-from-bottom-2">
                <div className="relative inline-block">
                  {selectedFile?.type.startsWith("image/") ? (
                    <img
                      src={filePreview}
                      alt="preview"
                      className="h-20 w-20 object-cover rounded-lg border border-borderShadow"
                    />
                  ) : (
                    <div className="h-20 w-20 flex items-center justify-center bg-muted rounded-lg border border-borderShadow">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-foreground text-background rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-black">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3 max-w-4xl mx-auto border border-[#363636] rounded-full py-2 px-4 bg-black focus-within:border-white/30 transition-all shadow-lg"
              >
                <PopoverEmoji
                  onEmojiSelect={(emoji: string) =>
                    setMessageInput((prev) => prev + emoji)
                  }
                />

                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,video/*"
                />

                <Input
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    sendTyping(
                      activeConversationId as number,
                      e.target.value.length > 0
                    );
                  }}
                  onBlur={() =>
                    sendTyping(activeConversationId as number, false)
                  }
                  placeholder="Message..."
                  className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-8 text-[15px] placeholder:text-muted-foreground/60"
                />

                <div className="flex items-center gap-2">
                  {!messageInput.trim() && !selectedFile ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full h-8 w-8 text-white hover:text-pink-500 hover:bg-transparent transition-colors"
                      >
                        <ImageIcon className="h-6 w-6" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full h-8 w-8 text-white hover:text-pink-500 hover:bg-transparent transition-colors"
                      >
                        <Video className="h-6 w-6" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!isConnected || isUploading}
                      variant="ghost"
                      className="text-white font-bold px-2 hover:bg-transparent hover:text-pink-500 disabled:opacity-50 transition-colors"
                    >
                      {isUploading ? "..." : "Send"}
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 text-center">
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 flex items-center justify-center animate-pulse">
              <Send className="h-10 w-10 text-pink-500 -rotate-12 translate-x-1 -translate-y-1" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Your Messages
              </h2>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Send private photos and messages to a friend or group.
              </p>
            </div>
            <Button
              onClick={() => setIsNewChatOpen(true)}
              className="bg-linear-to-r from-pink-500 to-purple-600 hover:shadow-lg transition-all rounded-full px-8 font-semibold"
            >
              Send Message
            </Button>
          </div>
        )}
      </div>

      {/* New Chat Dialog */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-center font-bold">
              New message
            </DialogTitle>
          </DialogHeader>
          <div className="p-1 space-y-4">
            <div className="flex items-center px-4 py-2 border-b border-border/50">
              <span className="text-sm font-semibold mr-4">To:</span>
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none focus-visible:ring-0 h-8 text-sm"
              />
            </div>

            <ScrollArea className="h-[400px]">
              <div className="p-2">
                {isSearching ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults
                    .filter((u) => u.id !== user?.id)
                    .map((u) => (
                      <div
                        key={u.id}
                        onClick={() => handleCreateChat(u)}
                        className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer group"
                      >
                        <Avatar className="h-11 w-11 shadow-xs border border-border/30">
                          <AvatarImage src={u.profilePic || ""} />
                          <AvatarFallback>
                            {u.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{u.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {u.name}
                          </p>
                        </div>
                      </div>
                    ))
                ) : searchQuery.length > 0 ? (
                  <div className="text-center p-8 text-muted-foreground text-sm">
                    No users found.
                  </div>
                ) : (
                  <div className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Suggested
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple Emoji Popover Component
function PopoverEmoji({
  onEmojiSelect,
}: {
  onEmojiSelect: (emoji: string) => void;
}) {
  const emojis = ["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"];
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full h-9 w-9 text-muted-foreground hover:text-pink-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Smile className="h-5 w-5" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-12 left-0 p-2 bg-background border border-border rounded-2xl shadow-xl z-50 flex gap-1 animate-in slide-in-from-bottom-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="hover:scale-125 transition-transform p-1.5 bg-accent/20 rounded-lg"
                onClick={() => {
                  onEmojiSelect(emoji);
                  setIsOpen(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
