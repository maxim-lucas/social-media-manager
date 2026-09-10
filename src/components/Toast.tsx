"use client";

import { useEffect } from "react";

export type ToastVariant = "success" | "error" | "warning";

export type ToastData = {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
};

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-emerald-500/50 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  error: "border-red-500/50 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100",
  warning: "border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
};

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
};

export function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 6000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      className={`flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${VARIANT_STYLES[toast.variant]}`}
    >
      <span aria-hidden className="mt-0.5 text-lg leading-none">
        {VARIANT_ICON[toast.variant]}
      </span>
      <div className="flex-1 text-sm">
        <p className="font-semibold">{toast.title}</p>
        {toast.description && <p className="mt-0.5 break-words opacity-90">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="text-lg leading-none opacity-60 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

export function ToastViewport({ toasts, onDismiss }: { toasts: ToastData[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
