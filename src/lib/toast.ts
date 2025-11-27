import { emitToast } from "@/components/ui/Toast";

export function toastSuccess(message: string) {
  if (typeof window === "undefined") return;
  emitToast(message, "success");
}

export function toastError(message: string) {
  if (typeof window === "undefined") return;
  emitToast(message, "error");
}
