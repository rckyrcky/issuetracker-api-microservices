import { Inject, Injectable } from '@nestjs/common';
import { NotificationCursorOutput } from './notifications.type';
import {
  NOTIFICATION_IS_READ,
  NOTIFICATION_MS,
  NOTIFICATION_VIEW_ALL,
  NOTIFICATION_VIEW_UNREAD_NUMBER,
} from 'src/common/constants';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATION_MS)
    private readonly notificationsClient: ClientProxy,
  ) {}

  async handleGetAllNotifications(
    userId: number,
    cursor?: number,
  ): Promise<NotificationCursorOutput> {
    return await firstValueFrom(
      this.notificationsClient
        .send<NotificationCursorOutput>(NOTIFICATION_VIEW_ALL, {
          user_id: userId,
          cursor,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handleGetAllUnreadNotifications(
    userId: number,
  ): Promise<{ unread: number }> {
    return await firstValueFrom(
      this.notificationsClient
        .send<{ unread: number }>(NOTIFICATION_VIEW_UNREAD_NUMBER, userId)
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handlePatchNotification(
    notificationId: number,
    userId: number,
  ): Promise<{ id: number }> {
    return await firstValueFrom(
      this.notificationsClient
        .send<{
          id: number;
        }>(NOTIFICATION_IS_READ, {
          user_id: userId,
          notification_id: notificationId,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }
}
