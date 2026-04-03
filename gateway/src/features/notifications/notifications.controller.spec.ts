/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { CustomSuccessMessages } from 'src/common/messages';
import { AuthRequest } from 'src/common/types/request.type';
import { NotificationCursorOutput } from './notifications.type';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsServiceMock: jest.Mocked<NotificationsService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            handleGetAllUnreadNotifications: jest.fn(),
            handleGetAllNotifications: jest.fn(),
            handlePatchNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(NotificationsController);
    notificationsServiceMock = module.get(NotificationsService);
  });

  describe('allUnread', () => {
    it('should return fetch message and unread data', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      notificationsServiceMock.handleGetAllUnreadNotifications.mockResolvedValue(
        {
          unread: 3,
        },
      );

      // Action
      const result = await controller.allUnread(req);

      // Assert
      expect(
        notificationsServiceMock.handleGetAllUnreadNotifications,
      ).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data: { unread: 3 },
      });
    });
  });

  describe('all', () => {
    it('should return fetch message and notifications data (with cursor)', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const query = { cursor: 123 };

      const data = {
        data: [{ id: 1 }],
        pagination: { hasMore: true, nextCursor: 456 },
      } as NotificationCursorOutput;

      notificationsServiceMock.handleGetAllNotifications.mockResolvedValue(
        data,
      );

      // Action
      const result = await controller.all(req, query);

      // Assert
      expect(
        notificationsServiceMock.handleGetAllNotifications,
      ).toHaveBeenCalledWith(10, 123);
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data,
      });
    });

    it('should return fetch message and notifications data (without cursor)', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const query = {};

      const data = {
        data: [{ id: 1 }],
        pagination: { hasMore: false, nextCursor: null },
      } as NotificationCursorOutput;

      notificationsServiceMock.handleGetAllNotifications.mockResolvedValue(
        data,
      );

      // Action
      const result = await controller.all(req, query);

      // Assert
      expect(
        notificationsServiceMock.handleGetAllNotifications,
      ).toHaveBeenCalledWith(10, undefined);
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data,
      });
    });
  });

  describe('update', () => {
    it('should return update message and updated data', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { notification_id: 99 };

      notificationsServiceMock.handlePatchNotification.mockResolvedValue({
        id: 99,
      });

      // Action
      const result = await controller.update(req, params);

      // Assert
      expect(
        notificationsServiceMock.handlePatchNotification,
      ).toHaveBeenCalledWith(99, 10);
      expect(result).toEqual({
        message: CustomSuccessMessages.update,
        data: { id: 99 },
      });
    });
  });
});
