import { NotificationInput, NotificationOutput } from '../notifications.type';

export interface INotificationsRepository {
  /**
   * Adds new notification
   * @param notification
   * @param client
   */
  addNotification(
    notification: NotificationInput,
    client?: unknown,
  ): Promise<void>;

  /**
   * Gets all notifications
   * @param userId
   * @param cursor
   */
  getAllNotifications(
    userId: number,
    cursor?: number,
  ): Promise<NotificationOutput[]>;

  /**
   * Gets all unread notifications
   * @param userId
   */
  getAllUnreadNotifications(userId: number): Promise<{ id: number }[]>;

  /**
   * Gets notification by id
   * @param notificationId
   * @param userId
   */
  getNotificationById(
    notificationId: number,
    userId: number,
  ): Promise<{ id: number; is_read: boolean }[]>;

  /**
   * Makes notification to be read
   * @param notificationId
   * @param userId
   */
  makeNotificationToBeRead(
    notificationId: number,
    userId: number,
  ): Promise<{ id: number }[]>;

  /**
   * Update user data
   * @param userId
   * @param updatedAt
   * @param name
   */
  updateUserData(
    userId: number,
    updatedAt: string,
    name?: string,
  ): Promise<void>;
}
