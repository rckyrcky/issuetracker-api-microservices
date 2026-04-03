import { Controller } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  COLLABORATION_CREATED,
  COMMENT_CREATED,
  NOTIFICATION_IS_READ,
  NOTIFICATION_VIEW_ALL,
  NOTIFICATION_VIEW_UNREAD_NUMBER,
  USER_CHANGED,
} from 'src/common/constants';
import {
  NotificationCursorOutput,
  NotificationInput,
} from './notifications.type';

@Controller('')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern(NOTIFICATION_VIEW_UNREAD_NUMBER)
  async allUnread(@Payload() userId: number): Promise<{
    unread: number;
  }> {
    return await this.notificationsService.handleGetAllUnreadNotifications(
      userId,
    );
  }

  @MessagePattern(NOTIFICATION_VIEW_ALL)
  async all(
    @Payload('user_id') userId: number,
    @Payload('cursor') cursor?: number,
  ): Promise<NotificationCursorOutput> {
    return await this.notificationsService.handleGetAllNotifications(
      userId,
      cursor,
    );
  }

  @MessagePattern(NOTIFICATION_IS_READ)
  async update(
    @Payload('user_id') userId: number,
    @Payload('notification_id') notificationId: number,
  ): Promise<{
    id: number;
  }> {
    return await this.notificationsService.handlePatchNotification(
      notificationId,
      userId,
    );
  }

  @EventPattern(USER_CHANGED)
  async updateUser(
    @Payload()
    data: {
      id: number;
      name?: string;
      updatedAt: string;
    },
  ): Promise<void> {
    return await this.notificationsService.handleUserChanged(data);
  }

  @EventPattern(COMMENT_CREATED)
  async addCommentNotification(
    @Payload('user_id') user_id: number,
    @Payload('user_name') user_name: string,
    @Payload('actor_id') actor_id: number,
    @Payload('actor_name') actor_name: string,
    @Payload('issue_id') issue_id: number,
    @Payload('issue_title') issue_title: string,
  ) {
    const data: NotificationInput = {
      actor_id,
      actor_name,
      entity_id: issue_id,
      entity_name: issue_title,
      entity_type: 'issue',
      message: 'left a comment on your issue',
      type: 'new_comment',
      user_id,
      user_name,
    };
    return await this.notificationsService.handlePostNotification(data);
  }

  @EventPattern(COLLABORATION_CREATED)
  async addCollaborationNotification(
    @Payload('user_id') user_id: number,
    @Payload('user_name') user_name: string,
    @Payload('actor_id') actor_id: number,
    @Payload('actor_name') actor_name: string,
    @Payload('project_id') project_id: number,
    @Payload('project_name') project_name: string,
  ) {
    const data: NotificationInput = {
      actor_id,
      actor_name,
      entity_id: project_id,
      entity_name: project_name,
      entity_type: 'project',
      message: 'added you as a collaborator on',
      type: 'add_collaboration',
      user_id,
      user_name,
    };
    return await this.notificationsService.handlePostNotification(data);
  }
}
