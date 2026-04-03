import { Inject, Injectable } from '@nestjs/common';
import { NotificationInput, NotificationOutput } from '../notifications.type';
import type ILoggingService from 'src/common/interfaces/logging.interface';
import { DrizzleService } from 'src/services/databases/drizzle/drizzle.service';
import { ServerError } from 'src/common/exceptions';
import { generateErrorLogMessage } from 'src/common/utils';
import { and, desc, eq, lt, lte, ne } from 'drizzle-orm';
import { notifications } from 'src/services/databases/drizzle/schema/schema';
import { type INotificationsRepository } from './interface.notifications.repository';
import { LOGGING_SERVICE } from 'src/common/constants';

@Injectable()
export class DrizzleNotificationsRepository implements INotificationsRepository {
  constructor(
    private readonly drizzleService: DrizzleService,
    @Inject(LOGGING_SERVICE)
    private readonly loggingService: ILoggingService,
  ) {}

  private readonly service = this.constructor.name;

  async addNotification(notification: NotificationInput): Promise<void> {
    try {
      const result = await this.drizzleService
        .db()
        .insert(notifications)
        .values({
          userId: notification.user_id,
          userName: notification.user_name,
          message: notification.message,
          type: notification.type,
          actorId: notification.actor_id,
          actorName: notification.actor_name,
          entityType: notification.entity_type,
          entityId: notification.entity_id,
          entityName: notification.entity_name,
        })
        .returning({ id: notifications.id });
      if (result.length !== 0) {
        this.loggingService.info('Insert notifications success', {
          method: this.addNotification.name,
          service: this.service,
          id: result[0].id,
          type: notification.type,
        });
      }
      return;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to insert notifications', error),
        { error, method: this.addNotification.name, service: this.service },
      );
      throw new ServerError();
    }
  }

  async getAllNotifications(
    userId: number,
    cursor?: number,
  ): Promise<NotificationOutput[]> {
    const limit = 10;

    const query = this.drizzleService
      .db()
      .select({
        id: notifications.id,
        actor_name: notifications.actorName,
        type: notifications.type,
        message: notifications.message,
        is_read: notifications.isRead,
        created_at: notifications.createdAt,
        entity_type: notifications.entityType,
        entity_id: notifications.entityId,
        entity_name: notifications.entityName,
      })
      .from(notifications);

    const filterQuery = [
      eq(notifications.userId, userId),
      ne(notifications.userId, notifications.actorId),
    ];

    if (typeof cursor === 'number') {
      filterQuery.push(lt(notifications.id, cursor));
    }

    try {
      const result = await query
        .where(and(...filterQuery.filter(Boolean)))
        .orderBy(desc(notifications.id))
        .limit(limit + 1);

      return result as NotificationOutput[];
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to get notifications', error),
        { error, method: this.getAllNotifications.name, service: this.service },
      );
      throw new ServerError();
    }
  }

  async getAllUnreadNotifications(userId: number): Promise<{ id: number }[]> {
    try {
      const result = await this.drizzleService
        .db()
        .select({ id: notifications.id })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            ne(notifications.userId, notifications.actorId),
            eq(notifications.isRead, false),
          ),
        );
      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to get unread notifications', error),
        {
          error,
          method: this.getAllUnreadNotifications.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }

  async getNotificationById(
    notificationId: number,
    userId: number,
  ): Promise<{ id: number; is_read: boolean }[]> {
    try {
      const result = await this.drizzleService
        .db()
        .select({ id: notifications.id, is_read: notifications.isRead })
        .from(notifications)
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId),
          ),
        );
      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to get notification by id', error),
        {
          error,
          method: this.getNotificationById.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }

  async makeNotificationToBeRead(
    notificationId: number,
    userId: number,
  ): Promise<{ id: number }[]> {
    try {
      const result = this.drizzleService
        .db()
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId),
          ),
        )
        .returning({ id: notifications.id });

      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage(
          'Failed to make notification to be read',
          error,
        ),
        {
          error,
          method: this.makeNotificationToBeRead.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }

  async updateUserData(
    userId: number,
    updatedAt: string,
    name?: string,
  ): Promise<void> {
    const userData: Partial<{
      userName: string;
    }> = {};

    const actorData: Partial<{
      actorName: string;
    }> = {};

    if (name) {
      userData.userName = name;
      actorData.actorName = name;
    }

    if (
      Object.keys(userData).length === 0 &&
      Object.keys(actorData).length === 0
    ) {
      return;
    }

    try {
      const result = await Promise.all([
        this.drizzleService
          .db()
          .update(notifications)
          .set({ ...userData, lastEventUpdatedAt: updatedAt })
          .where(
            and(
              eq(notifications.userId, userId),
              lte(notifications.lastEventUpdatedAt, updatedAt),
            ),
          )
          .returning({ id: notifications.id }),
        this.drizzleService
          .db()
          .update(notifications)
          .set({ ...actorData, lastEventUpdatedAt: updatedAt })
          .where(
            and(
              eq(notifications.actorId, userId),
              lte(notifications.lastEventUpdatedAt, updatedAt),
            ),
          )
          .returning({ id: notifications.id }),
      ]);

      if (result.some((x) => x.length !== 0)) {
        this.loggingService.info('Update user data on notifications success', {
          method: this.updateUserData.name,
          service: this.service,
          userId,
        });
      }
      return;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage(
          'Failed to update user data on notifications',
          error,
        ),
        {
          error,
          service: this.service,
          method: this.updateUserData.name,
        },
      );
      throw new ServerError();
    }
  }
}
