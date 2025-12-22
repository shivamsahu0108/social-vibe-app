import { create } from "zustand";
import { notificationService } from "@/api/notification.service";

interface NotificationStore {
  unreadCount: number;
  fetchUnreadCount: (userId: number) => Promise<void>;
  markAsRead: () => void;
  incrementUnread: () => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  fetchUnreadCount: async (userId: number) => {
    try {
      const list = await notificationService.getUnreadNotifications(userId);
      set({ unreadCount: list.length });
    } catch (error) {
      console.error("Failed to fetch notification count", error);
    }
  },
  markAsRead: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),
  setUnreadCount: (count: number) => set({ unreadCount: count }),
}));
