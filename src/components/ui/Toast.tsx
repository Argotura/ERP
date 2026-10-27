// ============================================================
// ARGOTURO ERP — Toast Notification Component
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type ToastType = 'success' | 'error' | 'danger' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  visible: boolean;
}

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={16} />,
  error: <XCircle size={16} />,
  danger: <XCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  info: <Info size={16} />,
};

export default function Toast() {
  const { toasts, dismissToast } = useApp();
  const [localToasts, setLocalToasts] = useState<ToastItem[]>([]);

  // Sync incoming toasts from context into local state
  useEffect(() => {
    setLocalToasts((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const newItems = toasts
        .filter((t) => !existingIds.has(t.id))
        .map((t) => ({ ...t, visible: true }));

      if (newItems.length === 0) return prev;
      return [...prev, ...newItems];
    });
  }, [toasts]);

  // Remove toasts that have been dismissed from context
  useEffect(() => {
    const contextIds = new Set(toasts.map((t) => t.id));
    setLocalToasts((prev) => prev.filter((t) => contextIds.has(t.id) || !t.visible));
  }, [toasts]);

  const handleDismiss = useCallback(
    (id: string) => {
      dismissToast(id);
      setLocalToasts((prev) => prev.filter((t) => t.id !== id));
    },
    [dismissToast]
  );

  const visibleToasts = localToasts.filter((t) => t.visible);

  if (visibleToasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {visibleToasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type === 'danger' ? 'error' : toast.type}`}
          role="alert"
        >
          <span className="toast-icon">{TOAST_ICONS[toast.type]}</span>
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            type="button"
            onClick={() => handleDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
