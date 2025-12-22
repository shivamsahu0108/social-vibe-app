import { create } from "zustand";
import type {
  ConversationResponse,
  MessageDTO,
  TypingStatus,
  UserStatusUpdate,
} from "@/types/ChatType";

interface ChatState {
  conversations: ConversationResponse[];
  activeConversationId: number | null;
  messages: Record<number, MessageDTO[]>;
  typingStatus: Record<number, Record<string, boolean>>; // conversationId -> {username: isTyping}
  onlineUsers: Record<string, boolean>; // username -> isOnline

  setConversations: (conversations: ConversationResponse[]) => void;
  setActiveConversationId: (id: number | null) => void;
  setMessages: (conversationId: number, messages: MessageDTO[]) => void;
  addMessage: (conversationId: number, message: MessageDTO) => void;
  updateTypingStatus: (status: TypingStatus) => void;
  updateUserStatus: (status: UserStatusUpdate) => void;
  markMessageAsRead: (conversationId: number, messageId: number) => void;
  updateLastMessage: (conversationId: number, message: MessageDTO) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  typingStatus: {},
  onlineUsers: {},

  setConversations: (conversations) => set({ conversations }),

  setActiveConversationId: (id) => set({ activeConversationId: id }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),

  addMessage: (conversationId, message) =>
    set((state) => {
      const currentMessages = state.messages[conversationId] || [];
      // Avoid duplicates
      if (currentMessages.find((m) => m.id === message.id)) return state;

      return {
        messages: {
          ...state.messages,
          [conversationId]: [...currentMessages, message],
        },
      };
    }),

  updateTypingStatus: (status) =>
    set((state) => {
      const { conversationId, username, isTyping } = status;
      const convTyping = state.typingStatus[conversationId] || {};
      return {
        typingStatus: {
          ...state.typingStatus,
          [conversationId]: { ...convTyping, [username]: isTyping },
        },
      };
    }),

  updateUserStatus: (status) =>
    set((state) => ({
      onlineUsers: { ...state.onlineUsers, [status.username]: status.isOnline },
    })),

  markMessageAsRead: (conversationId, messageId) =>
    set((state) => {
      const currentMessages = state.messages[conversationId] || [];
      return {
        messages: {
          ...state.messages,
          [conversationId]: currentMessages.map((m) =>
            m.id === messageId ? { ...m, isRead: true } : m
          ),
        },
      };
    }),

  updateLastMessage: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations
        .map((c) =>
          c.id === conversationId ? { ...c, lastMessage: message } : c
        )
        .sort((a, b) => {
          const timeA = a.lastMessage
            ? new Date(a.lastMessage.timestamp).getTime()
            : 0;
          const timeB = b.lastMessage
            ? new Date(b.lastMessage.timestamp).getTime()
            : 0;
          return timeB - timeA;
        }),
    })),
}));
