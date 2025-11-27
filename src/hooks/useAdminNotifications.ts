import { useMutation } from "@tanstack/react-query";
import {
  AdminSendNotificationRequest,
  AdminBroadcastNotificationRequest,
  sendTestNotification,
  broadcastNotification,
} from "@/services/admin/notifications";
import { toastError, toastSuccess } from "@/lib/toast";

type AdminNotificationPayload =
  | ({ audience: "single" } & AdminSendNotificationRequest)
  | (AdminBroadcastNotificationRequest & { audience: "all-users" | "all-partners" });

export function useAdminSendNotification() {
  const mutation = useMutation({
    mutationFn: (payload: AdminNotificationPayload) => {
      if (payload.audience === "single") {
        const { userId, title, body, type, data } = payload;
        return sendTestNotification({ userId, title, body, type, data });
      }
      const { audience, title, body, type, data } = payload;
      return broadcastNotification({ audience, title, body, type, data });
    },
    onSuccess: () => {
      toastSuccess("Notification sent");
    },
    onError: () => {
      toastError("Failed to send notification");
    },
  });

  return mutation;
}
