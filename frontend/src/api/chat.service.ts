import { apiFetch } from "./client";
import type {
  ConversationResponse,
  MessageDTO,
  ChatRequest,
} from "@/types/ChatType";

export const chatService = {
  getConversations: async (): Promise<ConversationResponse[]> => {
    return apiFetch<ConversationResponse[]>("/api/chat/conversations");
  },

  createOrGetConversation: async (
    request: ChatRequest
  ): Promise<ConversationResponse> => {
    return apiFetch<ConversationResponse>("/api/chat/conversation", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  getMessages: async (conversationId: number): Promise<MessageDTO[]> => {
    return apiFetch<MessageDTO[]>(`/api/chat/messages/${conversationId}`);
  },

  uploadAttachment: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<{ url: string }>("/api/chat/attachment", {
      method: "POST",
      body: formData,
    });
  },
};
