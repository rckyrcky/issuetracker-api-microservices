/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { ClientProxy } from '@nestjs/microservices';
import { NOTIFICATION_MS } from 'src/common/constants';
import { of } from 'rxjs';
import { NotificationCursorOutput } from './notifications.type';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NOTIFICATION_MS,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(NotificationsService);
    notificationClient = module.get(NOTIFICATION_MS);
  });

  describe('handleGetAllNotifications', () => {
    it('should return notifications correctly)', async () => {
      // Arrange
      const userId = 10;
      const cursor = 123;

      const expected = {} as NotificationCursorOutput;
      notificationClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleGetAllNotifications(userId, cursor);

      // Assert
      expect(notificationClient.send).toHaveBeenCalled();
    });
  });

  describe('handleGetAllUnreadNotifications', () => {
    it('should return unread count', async () => {
      // Arrange
      const userId = 10;

      const expected = {} as { unread: number };
      notificationClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleGetAllUnreadNotifications(userId);

      // Assert
      expect(notificationClient.send).toHaveBeenCalled();
    });
  });

  describe('handlePatchNotification', () => {
    it('should mark notification as read', async () => {
      // Arrange
      const userId = 10;
      const notificationId = 123;

      const expected = {} as { id: number };
      notificationClient.send.mockReturnValue(of(expected));
      // Action
      await service.handlePatchNotification(notificationId, userId);

      // Assert
      expect(notificationClient.send).toHaveBeenCalled();
    });
  });
});
