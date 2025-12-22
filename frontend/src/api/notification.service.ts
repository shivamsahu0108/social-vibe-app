import { apiFetch } from "./client";
import { useAuthStore } from "@/store";
import type { NotificationResponse } from "@/types/NotificationType";

export interface CreateNotificationRequest {
  recipientId: number;
  actorId: number;
  type: string;
  message?: string;
  sourceId?: string;
}

export const notificationService = {
  // Create (manual) — useful for testing
  createAndSend: async (
    req: CreateNotificationRequest
  ): Promise<NotificationResponse> => {
    return apiFetch<NotificationResponse>("/api/notifications", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  // Get all notifications for a user
  getNotificationsForUser: async (
    userId: number
  ): Promise<NotificationResponse[]> => {
    return apiFetch<NotificationResponse[]>(
      `/api/notifications/user/${userId}`
    );
  },

  // Get unread only
  getUnreadNotifications: async (
    userId: number
  ): Promise<NotificationResponse[]> => {
    return apiFetch<NotificationResponse[]>(
      `/api/notifications/user/${userId}/unread`
    );
  },

  // Mark one read
  markAsRead: async (id: number): Promise<void> => {
    return apiFetch<void>(`/api/notifications/${id}/read`, {
      method: "POST",
    });
  },

  // Mark all read for user
  markAllAsRead: async (userId: number): Promise<void> => {
    return apiFetch<void>(`/api/notifications/user/${userId}/read-all`, {
      method: "POST",
    });
  },

  // Real-time subscription (SSE)
  subscribe: (
    userId: number,
    onMessage: (notification: NotificationResponse) => void
  ) => {
    const { accessToken } = useAuthStore.getState();
    const url = `${
      import.meta.env.VITE_API_URL || ""
    }/api/notifications/stream/${userId}?token=${accessToken || ""}`;

    const eventSource = new EventSource(url);

    eventSource.onopen = () => {};

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error("[SSE] Failed to parse message", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[SSE] Error:", error);
      // EventSource automatically tries to reconnect, but you might want to close on fatal errors
      // eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  },
};
