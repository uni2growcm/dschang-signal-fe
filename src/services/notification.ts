import type { Notification, NotificationPage } from "../api";
import { notificationApi } from "../services";

export const getUserNotifications = async ({
  page = 0,
  size = 20,
}: {
  page?: number;
  size?: number;
} = {}): Promise<NotificationPage> => {
  return await notificationApi.getUserNotifications({ page, size });
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await notificationApi.getUnreadCount();
  return response.count ?? 0;
};

export const markNotificationAsRead = async (
  notificationId: number,
): Promise<Notification> => {
  return await notificationApi.markNotificationAsRead({ id: notificationId });
};

export const markAllNotificationsAsRead = async (): Promise<number> => {
  const response = await notificationApi.markAllNotificationsAsRead();
  return response.updatedCount ?? 0;
};
