import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsAsRead,
} from "../services/notification";
import type { Notification } from "../api";
import { getAllAuthenticatedUserReports } from "../services";
import { useMe } from "../services/user";
import { isAuth } from "../utils/utils";

export type AppNotification = {
  id: number | string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: string;
  reportId?: number;
  oldStatus?: string;
  newStatus?: string;
  rejectionReason?: string;
};

type NotificationCenterValue = {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (
    notification: Pick<AppNotification, "title" | "message" | "type"> &
      Partial<
        Pick<
          AppNotification,
          "reportId" | "oldStatus" | "newStatus" | "rejectionReason"
        >
      >,
  ) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
};

const NotificationCenterContext = createContext<NotificationCenterValue | null>(
  null,
);

const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;
const UNREAD_COUNT_QUERY_KEY = ["notifications", "unread-count"] as const;
const FALLBACK_REJECTED_REPORTS_QUERY_KEY = ["notifications", "rejected-reports"] as const;
const REFRESH_INTERVAL_MS = 30000;
const MAX_NOTIFICATIONS = 20;
type MarkAllAsReadContext = {
  previousNotifications: AppNotification[];
  previousUnreadCount: number;
};

const getLocalNotificationsStorageKey = (userId: number) =>
  `notification-center-local:${userId}`;

const getRejectedSnapshotStorageKey = (userId: number) =>
  `notification-center-rejected-snapshot:${userId}`;

const readStoredNotifications = (storageKey: string): AppNotification[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue) as AppNotification[];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const readRejectedSnapshot = (storageKey: string): Record<string, string> => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue) as Record<string, string>;
    return parsedValue && typeof parsedValue === "object" ? parsedValue : {};
  } catch {
    return {};
  }
};

const toAppNotification = (
  notification: Notification,
): AppNotification => ({
  id: notification.id ?? 0,
  title: notification.title ?? "",
  message: notification.message ?? "",
  createdAt:
    notification.createdAt instanceof Date
      ? notification.createdAt.toISOString()
      : new Date(0).toISOString(),
  read: notification.read ?? false,
  type: notification.type ?? "info",
  reportId: notification.reportId,
  oldStatus: notification.oldStatus,
  newStatus: notification.newStatus,
  rejectionReason: undefined,
});

export function NotificationCenterProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const enabled = isAuth();
  const { data: currentUser } = useMe();
  const [localNotifications, setLocalNotifications] = useState<AppNotification[]>(
    [],
  );

  useEffect(() => {
    if (typeof currentUser?.id !== "number") {
      setLocalNotifications([]);
      return;
    }

    setLocalNotifications(
      readStoredNotifications(getLocalNotificationsStorageKey(currentUser.id)),
    );
  }, [currentUser?.id]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof currentUser?.id !== "number") {
      return;
    }

    window.localStorage.setItem(
      getLocalNotificationsStorageKey(currentUser.id),
      JSON.stringify(localNotifications),
    );
  }, [currentUser?.id, localNotifications]);

  const notificationsQuery = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const page = await getUserNotifications({ page: 0, size: 20 });
      return (page.content ?? []).map(toAppNotification);
    },
    enabled,
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: REFRESH_INTERVAL_MS / 2,
  });

  const unreadCountQuery = useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: getUnreadNotificationCount,
    enabled,
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: REFRESH_INTERVAL_MS / 2,
  });

  const rejectedReportsQuery = useQuery({
    queryKey: FALLBACK_REJECTED_REPORTS_QUERY_KEY,
    queryFn: getAllAuthenticatedUserReports,
    enabled,
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: REFRESH_INTERVAL_MS / 2,
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof currentUser?.id !== "number") {
      return;
    }

    const snapshotStorageKey = getRejectedSnapshotStorageKey(currentUser.id);
    const previousSnapshot = readRejectedSnapshot(snapshotStorageKey);
    const currentSnapshot: Record<string, string> = {};
    const backendNotifications = notificationsQuery.data ?? [];

    if (Object.keys(previousSnapshot).length === 0) {
      (rejectedReportsQuery.data ?? []).forEach((report) => {
        if (report.moderationStatus !== "REJECTED" || typeof report.id !== "number") {
          return;
        }

        currentSnapshot[String(report.id)] =
          report.reviewedAt?.toISOString?.() ||
          report.updatedAt?.toISOString?.() ||
          report.createdAt?.toISOString?.() ||
          "rejected";
      });

      window.localStorage.setItem(
        snapshotStorageKey,
        JSON.stringify(currentSnapshot),
      );
      return;
    }

    (rejectedReportsQuery.data ?? []).forEach((report) => {
      if (report.moderationStatus !== "REJECTED" || typeof report.id !== "number") {
        return;
      }

      const reportKey = String(report.id);
      const snapshotValue =
        report.reviewedAt?.toISOString?.() ||
        report.updatedAt?.toISOString?.() ||
        report.createdAt?.toISOString?.() ||
        "rejected";

      currentSnapshot[reportKey] = snapshotValue;

      const hasBackendNotification = backendNotifications.some(
        (notification) =>
          notification.reportId === report.id &&
          (notification.newStatus === "REJECTED" ||
            notification.type.toUpperCase().includes("REJECT")),
      );

      const localNotificationId = `local-rejected-${report.id}-${snapshotValue}`;
      const hasLocalNotification = localNotifications.some(
        (notification) => notification.id === localNotificationId,
      );
      const isNewRejection = previousSnapshot[reportKey] !== snapshotValue;

      if (!hasBackendNotification && !hasLocalNotification && isNewRejection) {
        setLocalNotifications((current) =>
          [
            {
              id: localNotificationId,
              title: "Report rejected",
              message: report.rejectionReason
                ? `Your report "${report.title?.trim() || `#${report.id}`}" was rejected by moderation. Reason: ${report.rejectionReason}`
                : `Your report "${report.title?.trim() || `#${report.id}`}" was rejected by moderation.`,
              createdAt: snapshotValue,
              read: false,
              type: "REPORT_REJECTED_FALLBACK",
              reportId: report.id,
              newStatus: "REJECTED",
              rejectionReason: report.rejectionReason ?? undefined,
            },
            ...current,
          ].slice(0, MAX_NOTIFICATIONS),
        );
      }
    });

    window.localStorage.setItem(snapshotStorageKey, JSON.stringify(currentSnapshot));
  }, [
    currentUser?.id,
    localNotifications,
    notificationsQuery.data,
    rejectedReportsQuery.data,
  ]);

  const notifications = [...localNotifications, ...(notificationsQuery.data ?? [])]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    )
    .slice(0, MAX_NOTIFICATIONS);
  const unreadCount =
    (unreadCountQuery.data ?? 0) +
    localNotifications.filter((notification) => !notification.read).length;

  const markAllAsReadMutation = useMutation<
    number,
    Error,
    void,
    MarkAllAsReadContext
  >({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
        queryClient.cancelQueries({ queryKey: UNREAD_COUNT_QUERY_KEY }),
      ]);

      const previousNotifications =
        queryClient.getQueryData<AppNotification[]>(NOTIFICATIONS_QUERY_KEY) ??
        [];
      const previousUnreadCount =
        queryClient.getQueryData<number>(UNREAD_COUNT_QUERY_KEY) ?? 0;

      queryClient.setQueryData<AppNotification[]>(
        NOTIFICATIONS_QUERY_KEY,
        previousNotifications.map((notification) =>
          notification.read ? notification : { ...notification, read: true },
        ),
      );
      queryClient.setQueryData<number>(UNREAD_COUNT_QUERY_KEY, 0);

      return { previousNotifications, previousUnreadCount };
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(
        NOTIFICATIONS_QUERY_KEY,
        context.previousNotifications,
      );
      queryClient.setQueryData(
        UNREAD_COUNT_QUERY_KEY,
        context.previousUnreadCount,
      );
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY }),
      ]);
    },
  });

  const value = useMemo<NotificationCenterValue>(() => {
    return {
      notifications,
      unreadCount,
      isLoading: notificationsQuery.isLoading || unreadCountQuery.isLoading,
      addNotification: (notification) => {
        setLocalNotifications((current) =>
          [
            {
              id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
              title: notification.title,
              message: notification.message,
              createdAt: new Date().toISOString(),
              read: false,
              type: notification.type,
              reportId: notification.reportId,
              oldStatus: notification.oldStatus,
              newStatus: notification.newStatus,
              rejectionReason: notification.rejectionReason,
            },
            ...current,
          ].slice(0, MAX_NOTIFICATIONS),
        );
      },
      markAllAsRead: () => {
        setLocalNotifications((current) =>
          current.map((notification) =>
            notification.read ? notification : { ...notification, read: true },
          ),
        );

        if (enabled && unreadCount > 0 && !markAllAsReadMutation.isPending) {
          markAllAsReadMutation.mutate();
        }
      },
      clearNotifications: () => {
        setLocalNotifications([]);
        queryClient.removeQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
        queryClient.removeQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
        queryClient.removeQueries({ queryKey: FALLBACK_REJECTED_REPORTS_QUERY_KEY });

        if (typeof window !== "undefined" && typeof currentUser?.id === "number") {
          window.localStorage.removeItem(
            getLocalNotificationsStorageKey(currentUser.id),
          );
          window.localStorage.removeItem(
            getRejectedSnapshotStorageKey(currentUser.id),
          );
        }
      },
    };
  }, [
    currentUser?.id,
    enabled,
    localNotifications,
    markAllAsReadMutation,
    notifications,
    notificationsQuery.isLoading,
    queryClient,
    unreadCount,
    unreadCountQuery.isLoading,
  ]);

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
