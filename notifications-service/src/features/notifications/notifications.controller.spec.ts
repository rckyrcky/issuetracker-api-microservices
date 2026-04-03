/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationCursorOutput } from './notifications.type';

describe('NotificationsController', () => {
  let notificationsController: NotificationsController;
  let notificationsService: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            handlePostNotification: jest.fn(),
            handleGetAllUnreadNotifications: jest.fn(),
            handleGetAllNotifications: jest.fn(),
            handlePatchNotification: jest.fn(),
            handleUserChanged: jest.fn(),
          },
        },
      ],
      controllers: [NotificationsController],
    }).compile();

    notificationsService = moduleRef.get(NotificationsService);
    notificationsController = moduleRef.get(NotificationsController);
  });

  describe('allUnread', () => {
    it('should return numbers of unread notifications correctly', async () => {
      // Arrange
      const userId = 2;
      const expected = {} as { unread: number };
      notificationsService.handleGetAllUnreadNotifications.mockResolvedValue(
        expected,
      );

      // Action
      const result = await notificationsController.allUnread(userId);

      // Assert
      expect(result).toStrictEqual(expected);
      expect(
        notificationsService.handleGetAllUnreadNotifications,
      ).toHaveBeenCalled();
    });
  });

  describe('all', () => {
    it('should return all unread correctly', async () => {
      // Arrange
      const userId = 2;
      const expected = {} as NotificationCursorOutput;
      notificationsService.handleGetAllNotifications.mockResolvedValue(
        expected,
      );

      // Action
      const result = await notificationsController.all(userId);

      // Assert
      expect(result).toStrictEqual(expected);
      expect(notificationsService.handleGetAllNotifications).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should mark notification as read correctly', async () => {
      // Arrange
      const notificationId = 1;
      const userId = 2;
      const expected = {} as { id: number };
      notificationsService.handlePatchNotification.mockResolvedValue(expected);

      // Action
      const result = await notificationsController.update(
        notificationId,
        userId,
      );

      // Assert
      expect(result).toStrictEqual(expected);
      expect(notificationsService.handlePatchNotification).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update users correctly', async () => {
      // Arrange
      const payload = {
        id: 1,
        name: 'john',
        updatedAt: new Date().toISOString(),
      };
      notificationsService.handleUserChanged.mockResolvedValue();

      // Action
      await notificationsController.updateUser(payload);

      // Assert
      expect(notificationsService.handleUserChanged).toHaveBeenCalledWith(
        payload,
      );
    });
  });

  describe('addCommentNotification', () => {
    it('should post comment notifications correctly', async () => {
      // Arrange
      const user_id = 1;
      const user_name = 'john';
      const actor_id = 2;
      const actor_name = 'alice';
      const issue_id = 3;
      const issue_title = 'dark mode';

      notificationsService.handlePostNotification.mockResolvedValue();

      // Action
      await notificationsController.addCommentNotification(
        user_id,
        user_name,
        actor_id,
        actor_name,
        issue_id,
        issue_title,
      );

      // Assert
      expect(notificationsService.handlePostNotification).toHaveBeenCalled();
    });
  });

  describe('addCollaborationNotification', () => {
    it('should post collaboration notifications correctly', async () => {
      // Arrange
      const user_id = 1;
      const user_name = 'john';
      const actor_id = 2;
      const actor_name = 'alice';
      const project_id = 3;
      const project_name = 'issuetracker';

      notificationsService.handlePostNotification.mockResolvedValue();

      // Action
      await notificationsController.addCollaborationNotification(
        user_id,
        user_name,
        actor_id,
        actor_name,
        project_id,
        project_name,
      );

      // Assert
      expect(notificationsService.handlePostNotification).toHaveBeenCalled();
    });
  });
});
