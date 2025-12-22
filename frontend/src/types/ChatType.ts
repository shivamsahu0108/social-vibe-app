import type { UserResponseType } from "./UserResponseType";

export type MessageType = "TEXT" | "IMAGE" | "VIDEO" | "VOICE";

export interface MessageDTO {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  type: MessageType;
  attachmentUrl?: string;
  isRead: boolean;
}

export interface ConversationResponse {
  id: number;
  isGroup: boolean;
  chatName?: string;
  chatImage?: string;
  users: UserResponseType[];
  lastMessage?: MessageDTO;
  createdAt: string;
}

export interface ChatRequest {
  recipientId?: number;
  userIds?: number[];
  chatName?: string;
  isGroup: boolean;
}

export interface TypingStatus {
  username: string;
  isTyping: boolean;
  conversationId: number;
}

export interface UserStatusUpdate {
  username: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface ReadReceipt {
  messageId: number;
  conversationId: number;
  readerUsername: string;
}
