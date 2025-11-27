"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, X } from "lucide-react";

export type ToastVariant = "success" | "error";

interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  push: (msg: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const push = useCallback((msg: Omit<ToastMessage, "id">) => {
    setToasts((prev) => [...prev, { ...msg, id: idCounter++ }]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (event: CustomEvent<ToastMessage>) => {
      push({ message: event.detail.message, variant: event.detail.variant });
    };

    window.addEventListener("ic-toast", handler as EventListener);
    return () => window.removeEventListener("ic-toast", handler as EventListener);
  }, [push]);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => remove(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("ToastProvider is missing");
  return ctx;
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isSuccess = toast.variant === "success";

  return (
    <div
      className={cn(
        "flex min-w-[260px] items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg",
        isSuccess ? "border-emerald-200" : "border-rose-200"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full",
          isSuccess ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
        )}
      >
        {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      </div>
      <div className="flex-1 text-sm text-slate-800">{toast.message}</div>
      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 transition hover:text-slate-600"
        aria-label="Close toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function emitToast(message: string, variant: ToastVariant) {
  if (typeof window === "undefined") return;
  const event = new CustomEvent<ToastMessage>("ic-toast", {
    detail: { id: 0, message, variant },
  });
  window.dispatchEvent(event);
}
