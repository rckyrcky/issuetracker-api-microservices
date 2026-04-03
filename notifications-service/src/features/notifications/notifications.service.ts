import { Inject, Injectable } from '@nestjs/common';
import {
  NotificationCursorOutput,
  NotificationInput,
} from './notifications.type';
import { generateCursorPaginationData } from 'src/common/utils';
import { NotFoundError } from 'src/common/exceptions';
import { type INotificationsRepository } from './repository/interface.notifications.repository';
import { NOTIFICATIONS_REPOSITORY } from 'src/common/constants';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATIONS_REPOSITORY)
    private readonly notificationsRepository: INotificationsRepository,
  ) {}

  async handlePostNotification(
    notifications: NotificationInput,
  ): Promise<void> {
    await this.notificationsRepository.addNotification(notifications);
  }

  async handleGetAllNotifications(
    userId: number,
    cursor?: number,
  ): Promise<NotificationCursorOutput> {
    const result = await this.notificationsRepository.getAllNotifications(
      userId,
      cursor,
    );

    const { data, hasMore, nextCursor } = generateCursorPaginationData(result);

    return {
      data,
      pagination: { hasMore, nextCursor },
    };
  }

  async handleGetAllUnreadNotifications(
    userId: number,
  ): Promise<{ unread: number }> {
    const result =
      await this.notificationsRepository.getAllUnreadNotifications(userId);

    return {
      unread: result.length,
    };
  }

  async handlePatchNotification(
    notificationId: number,
    userId: number,
  ): Promise<{ id: number }> {
    const notification = await this.notificationsRepository.getNotificationById(
      notificationId,
      userId,
    );

    if (notification.length === 0) {
      throw new NotFoundError();
    }

    if (notification[0].is_read) {
      return { id: notification[0].id };
    }

    const result = await this.notificationsRepository.makeNotificationToBeRead(
      notificationId,
      userId,
    );

    if (result.length === 0) {
      throw new NotFoundError();
    }

    return result[0];
  }

  async handleUserChanged({
    id,
    name,
    updatedAt,
  }: {
    id: number;
    name?: string;
    updatedAt: string;
  }) {
    return await this.notificationsRepository.updateUserData(
      id,
      updatedAt,
      name,
    );
  }
}
