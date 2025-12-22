import { useEffect, useRef, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import type { IMessage } from "@stomp/stompjs";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chatStore";
import type {
  MessageDTO,
  TypingStatus,
  UserStatusUpdate,
  ReadReceipt,
} from "@/types/ChatType";
import { toast } from "sonner";

const WS_URL = "/ws";

export const useChatSocket = () => {
  const { accessToken, user } = useAuthStore();
  const {
    addMessage,
    updateTypingStatus,
    updateUserStatus,
    markMessageAsRead,
    updateLastMessage,
    activeConversationId,
  } = useChatStore();

  // Ref to access current activeConversationId inside WebSocket callbacks
  const activeConversationIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const socket = new SockJS(WS_URL);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      onConnect: () => {
        // Subscribe to user status updates (presence)
        client.subscribe("/topic/user.status", (message: IMessage) => {
          const status = JSON.parse(message.body) as UserStatusUpdate;
          updateUserStatus(status);
        });

        // Global subscription for new messages (Toasts & Inbox updates)
        client.subscribe("/user/queue/messages", (message: IMessage) => {
          const newMsg = JSON.parse(message.body) as MessageDTO;

          // Update inbox preview
          updateLastMessage(newMsg.conversationId, newMsg);

          // Show toast if not in this conversation
          if (newMsg.conversationId !== activeConversationIdRef.current) {
            toast(newMsg.senderName, {
              description: newMsg.content,
              action: {
                label: "View",
                onClick: () =>
                  (window.location.href = `/chat?id=${newMsg.conversationId}`),
              },
            });
          }
        });
      },
      onDisconnect: () => {},
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [accessToken]);

  // Handle active conversation subscriptions
  useEffect(() => {
    if (!stompClientRef.current?.connected || !activeConversationId) return;

    const client = stompClientRef.current;

    // Subscribe to new messages in this conversation
    const msgSub = client.subscribe(
      `/topic/conversation/${activeConversationId}`,
      (message: IMessage) => {
        const newMsg = JSON.parse(message.body) as MessageDTO;
        addMessage(activeConversationId, newMsg);
        updateLastMessage(activeConversationId, newMsg);

        // If we are the recipient, send a read receipt
        if (user && newMsg.senderId !== user.id) {
          sendReadReceipt(newMsg.id, activeConversationId);
        }
      }
    );

    // Subscribe to typing indicators
    const typingSub = client.subscribe(
      `/topic/conversation/${activeConversationId}/typing`,
      (message: IMessage) => {
        const status = JSON.parse(message.body) as TypingStatus;
        if (user && status.username !== user.username) {
          updateTypingStatus(status);
        }
      }
    );

    // Subscribe to read receipts
    const readSub = client.subscribe(
      `/topic/conversation/${activeConversationId}/read`,
      (message: IMessage) => {
        const receipt = JSON.parse(message.body) as ReadReceipt;
        markMessageAsRead(receipt.conversationId, receipt.messageId);
      }
    );

    return () => {
      msgSub.unsubscribe();
      typingSub.unsubscribe();
      readSub.unsubscribe();
    };
  }, [
    activeConversationId,
    user,
    addMessage,
    updateTypingStatus,
    markMessageAsRead,
    updateLastMessage,
  ]);

  const sendMessage = useCallback(
    (
      conversationId: number,
      content: string,
      type: MessageDTO["type"] = "TEXT",
      attachmentUrl?: string
    ) => {
      if (stompClientRef.current?.connected) {
        const message = {
          conversationId,
          content,
          type,
          attachmentUrl,
          timestamp: new Date().toISOString(),
        };
        stompClientRef.current.publish({
          destination: "/app/chat.send",
          body: JSON.stringify(message),
        });
      }
    },
    []
  );

  const sendTyping = useCallback(
    (conversationId: number, isTyping: boolean) => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: "/app/chat.typing",
          body: JSON.stringify({ conversationId, isTyping }),
        });
      }
    },
    []
  );

  const sendReadReceipt = useCallback(
    (messageId: number, conversationId: number) => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: "/app/chat.read",
          body: JSON.stringify({ messageId, conversationId }),
        });
      }
    },
    []
  );

  return {
    sendMessage,
    sendTyping,
    sendReadReceipt,
    isConnected: stompClientRef.current?.connected || false,
  };
};
