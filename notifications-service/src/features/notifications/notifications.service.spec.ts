/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NOTIFICATIONS_REPOSITORY } from 'src/common/constants';
import { NotFoundError } from 'src/common/exceptions';
import { generateCursorPaginationData } from 'src/common/utils';

import { type INotificationsRepository } from './repository/interface.notifications.repository';
import { NotificationInput } from './notifications.type';

jest.mock('src/common/utils', () => ({
  generateCursorPaginationData: jest.fn(),
}));

describe('NotificationsService', () => {
  let service: NotificationsService;

  let notificationsRepositoryMock: jest.Mocked<INotificationsRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NOTIFICATIONS_REPOSITORY,
          useValue: {
            addNotification: jest.fn(),
            getAllNotifications: jest.fn(),
            getAllUnreadNotifications: jest.fn(),
            getNotificationById: jest.fn(),
            makeNotificationToBeRead: jest.fn(),
            updateUserData: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(NotificationsService);
    notificationsRepositoryMock = module.get(NOTIFICATIONS_REPOSITORY);
  });

  describe('handlePostNotification', () => {
    it('should post notification correctly', async () => {
      // Arrange
      const payload = {} as NotificationInput;
      notificationsRepositoryMock.addNotification.mockResolvedValue();

      // Action
      await service.handlePostNotification(payload);

      // Assert
      expect(notificationsRepositoryMock.addNotification).toHaveBeenCalledWith(
        payload,
      );
    });

    it('should return notifications with cursor pagination (without cursor)', async () => {
      // Arrange
      const userId = 10;

      const raw = [{ id: 1 } as any];
      notificationsRepositoryMock.getAllNotifications.mockResolvedValue(raw);

      (generateCursorPaginationData as jest.Mock).mockReturnValue({
        data: raw,
        hasMore: false,
        nextCursor: null,
      });

      // Action
      const result = await service.handleGetAllNotifications(userId);

      // Assert
      expect(
        notificationsRepositoryMock.getAllNotifications,
      ).toHaveBeenCalledWith(userId, undefined);
      expect(generateCursorPaginationData).toHaveBeenCalledWith(raw);
      expect(result).toEqual({
        data: raw,
        pagination: { hasMore: false, nextCursor: null },
      });
    });
  });

  describe('handleGetAllNotifications', () => {
    it('should return notifications with cursor pagination (with cursor)', async () => {
      // Arrange
      const userId = 10;
      const cursor = 123;

      const raw = [{ id: 1 } as any, { id: 2 } as any];
      notificationsRepositoryMock.getAllNotifications.mockResolvedValue(raw);

      (generateCursorPaginationData as jest.Mock).mockReturnValue({
        data: [{ id: 1 } as any],
        hasMore: true,
        nextCursor: 456,
      });

      // Action
      const result = await service.handleGetAllNotifications(userId, cursor);

      // Assert
      expect(
        notificationsRepositoryMock.getAllNotifications,
      ).toHaveBeenCalledWith(userId, cursor);
      expect(generateCursorPaginationData).toHaveBeenCalledWith(raw);
      expect(result).toEqual({
        data: [{ id: 1 }],
        pagination: { hasMore: true, nextCursor: 456 },
      });
    });

    it('should return notifications with cursor pagination (without cursor)', async () => {
      // Arrange
      const userId = 10;

      const raw = [{ id: 1 } as any];
      notificationsRepositoryMock.getAllNotifications.mockResolvedValue(raw);

      (generateCursorPaginationData as jest.Mock).mockReturnValue({
        data: raw,
        hasMore: false,
        nextCursor: null,
      });

      // Action
      const result = await service.handleGetAllNotifications(userId);

      // Assert
      expect(
        notificationsRepositoryMock.getAllNotifications,
      ).toHaveBeenCalledWith(userId, undefined);
      expect(generateCursorPaginationData).toHaveBeenCalledWith(raw);
      expect(result).toEqual({
        data: raw,
        pagination: { hasMore: false, nextCursor: null },
      });
    });
  });

  describe('handleGetAllUnreadNotifications', () => {
    it('should return unread count', async () => {
      // Arrange
      const userId = 10;
      notificationsRepositoryMock.getAllUnreadNotifications.mockResolvedValue([
        { id: 1 } as any,
        { id: 2 } as any,
        { id: 3 } as any,
      ]);

      // Action
      const result = await service.handleGetAllUnreadNotifications(userId);

      // Assert
      expect(
        notificationsRepositoryMock.getAllUnreadNotifications,
      ).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ unread: 3 });
    });

    it('should return 0 when no unread notifications', async () => {
      // Arrange
      const userId = 10;
      notificationsRepositoryMock.getAllUnreadNotifications.mockResolvedValue(
        [],
      );

      // Action
      const result = await service.handleGetAllUnreadNotifications(userId);

      // Assert
      expect(
        notificationsRepositoryMock.getAllUnreadNotifications,
      ).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ unread: 0 });
    });
  });

  describe('handlePatchNotification', () => {
    it('should throw NotFoundError when notification not found', async () => {
      // Arrange
      const notificationId = 1;
      const userId = 10;

      notificationsRepositoryMock.getNotificationById.mockResolvedValue([]);

      // Action
      const action = () =>
        service.handlePatchNotification(notificationId, userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
      expect(
        notificationsRepositoryMock.makeNotificationToBeRead,
      ).not.toHaveBeenCalled();
    });

    it('should return id without updating when notification already read', async () => {
      // Arrange
      const notificationId = 1;
      const userId = 10;

      notificationsRepositoryMock.getNotificationById.mockResolvedValue([
        { id: notificationId, is_read: true } as any,
      ]);

      // Action
      const result = await service.handlePatchNotification(
        notificationId,
        userId,
      );

      // Assert
      expect(
        notificationsRepositoryMock.getNotificationById,
      ).toHaveBeenCalledWith(notificationId, userId);
      expect(result).toEqual({ id: notificationId });
      expect(
        notificationsRepositoryMock.makeNotificationToBeRead,
      ).not.toHaveBeenCalled();
    });

    it('should mark notification as read and return id when success', async () => {
      // Arrange
      const notificationId = 1;
      const userId = 10;

      notificationsRepositoryMock.getNotificationById.mockResolvedValue([
        { id: notificationId, is_read: false } as any,
      ]);

      notificationsRepositoryMock.makeNotificationToBeRead.mockResolvedValue([
        { id: notificationId } as any,
      ]);

      // Action
      const result = await service.handlePatchNotification(
        notificationId,
        userId,
      );

      // Assert
      expect(
        notificationsRepositoryMock.getNotificationById,
      ).toHaveBeenCalledWith(notificationId, userId);
      expect(
        notificationsRepositoryMock.makeNotificationToBeRead,
      ).toHaveBeenCalledWith(notificationId, userId);
      expect(result).toEqual({ id: notificationId });
    });

    it('should throw NotFoundError when update result is empty', async () => {
      // Arrange
      const notificationId = 1;
      const userId = 10;

      notificationsRepositoryMock.getNotificationById.mockResolvedValue([
        { id: notificationId, is_read: false } as any,
      ]);

      notificationsRepositoryMock.makeNotificationToBeRead.mockResolvedValue(
        [],
      );

      // Action
      const action = () =>
        service.handlePatchNotification(notificationId, userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('handleUserChanged', () => {
    it('should update users correctly', async () => {
      // Arrange
      const payload = {
        id: 1,
        name: 'john',
        updatedAt: new Date().toISOString(),
      };
      notificationsRepositoryMock.updateUserData.mockResolvedValue(undefined);

      // Action
      await service.handleUserChanged(payload);

      // Assert
      expect(notificationsRepositoryMock.updateUserData).toHaveBeenCalledWith(
        payload.id,
        payload.updatedAt,
        payload.name,
      );
    });
  });
});
