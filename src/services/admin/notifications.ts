import { apiClient } from "@/lib/apiClient";

export type AdminNotificationType = "info" | "success" | "warning" | "error";

export interface AdminSendNotificationRequest {
  userId: string;
  title: string;
  body?: string;
  type: AdminNotificationType;
  data?: Record<string, any>;
}

export interface AdminBroadcastNotificationRequest {
  audience: "all-users" | "all-partners";
  title: string;
  body?: string;
  type: AdminNotificationType;
  data?: Record<string, any>;
}

export async function sendTestNotification(payload: AdminSendNotificationRequest): Promise<void> {
  await apiClient.post("/api/v1/notifications/test", payload);
}

export async function broadcastNotification(payload: AdminBroadcastNotificationRequest): Promise<void> {
  await apiClient.post("/api/v1/notifications/broadcast", payload);
}
