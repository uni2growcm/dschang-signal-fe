import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { LOCAL_STORAGE_KEYS } from "../utils/localStorage";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: "info" | "warning" | "error" | "success";
  dedupeKey?: string;
};

type NotificationInput = Omit<AppNotification, "id" | "createdAt" | "read">;

type NotificationCenterValue = {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: NotificationInput) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
};

const NotificationCenterContext = createContext<NotificationCenterValue | null>(
  null,
);

const MAX_NOTIFICATIONS = 20;

export function NotificationCenterProvider({ children }: PropsWithChildren) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const storedValue = window.localStorage.getItem(
        LOCAL_STORAGE_KEYS.NOTIFICATIONS,
      );
      if (!storedValue) {
        return [];
      }

      const parsed = JSON.parse(storedValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(
      LOCAL_STORAGE_KEYS.NOTIFICATIONS,
      JSON.stringify(notifications),
    );
  }, [notifications]);

  const value = useMemo<NotificationCenterValue>(() => {
    return {
      notifications,
      unreadCount: notifications.filter((notification) => !notification.read)
        .length,
      addNotification: (notification) => {
        setNotifications((current) => {
          if (
            notification.dedupeKey &&
            current.some(
              (existing) => existing.dedupeKey === notification.dedupeKey,
            )
          ) {
            return current;
          }

          const nextNotification: AppNotification = {
            ...notification,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            createdAt: new Date().toISOString(),
            read: false,
          };

          return [nextNotification, ...current].slice(0, MAX_NOTIFICATIONS);
        });
      },
      markAllAsRead: () => {
        setNotifications((current) =>
          current.map((notification) =>
            notification.read
              ? notification
              : { ...notification, read: true },
          ),
        );
      },
      clearNotifications: () => {
        setNotifications([]);
      },
    };
  }, [notifications]);

  return (
    <NotificationCenterContext.Provider value={value}>
      {children}
    </NotificationCenterContext.Provider>
  );
}

export function useNotificationCenter() {
  const context = useContext(NotificationCenterContext);

  if (!context) {
    throw new Error(
      "useNotificationCenter must be used within a NotificationCenterProvider",
    );
  }

  return context;
}
