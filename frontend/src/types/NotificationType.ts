export type NotificationType = "LIKE" | "COMMENT" | "FOLLOW" | "MESSAGE";

export interface NotificationResponse {
  id: number;
  recipientId: number;
  actorId: number;
  actorUsername: string;
  type: NotificationType;
  message?: string;
  sourceId?: string; // Corresponds to backend String sourceId
  readFlag: boolean;
  createdAt: string;
}
