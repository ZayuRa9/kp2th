import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ToastNotification } from '../types';

interface ToastContextType {
  toasts: ToastNotification[];
  history: ToastNotification[];
  unreadCount: number;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
  showToast: (notification: Omit<ToastNotification, 'id' | 'timestamp'>) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  markHistoryAsRead: () => void;
  clearHistory: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const STORAGE_KEY = 'kp2_notification_history_v1';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [history, setHistory] = useState<ToastNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Sync history to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 40)));
    } catch {
      // ignore
    }
  }, [history]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const markHistoryAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setUnreadCount(0);
  }, []);

  const showToast = useCallback((notif: Omit<ToastNotification, 'id' | 'timestamp'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastNotification = {
      ...notif,
      id,
      timestamp: Date.now(),
      duration: notif.duration ?? 6500,
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // max 5 toasts on screen
    setHistory((prev) => [newToast, ...prev.slice(0, 39)]); // keep recent 40
    setUnreadCount((prev) => prev + 1);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, newToast.duration);
    }

    return id;
  }, [dismissToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        history,
        unreadCount,
        isHistoryOpen,
        setIsHistoryOpen,
        showToast,
        dismissToast,
        clearAllToasts,
        markHistoryAsRead,
        clearHistory,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
