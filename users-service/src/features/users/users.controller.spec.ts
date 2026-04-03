/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ClientProxy } from '@nestjs/microservices';
import { ISSUE_MS, NOTIFICATION_MS, PROJECT_MS } from 'src/common/constants';

describe('UsersController', () => {
  let userController: UsersController;
  let usersService: jest.Mocked<UsersService>;
  let projectsClient: jest.Mocked<ClientProxy>;
  let issuesClient: jest.Mocked<ClientProxy>;
  let notificationClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: UsersService,
          useValue: {
            getCurrentUser: jest.fn(),
            editUser: jest.fn(),
            getUserByEmail: jest.fn(),
          },
        },
        {
          provide: PROJECT_MS,
          useValue: { emit: jest.fn() },
        },
        {
          provide: ISSUE_MS,
          useValue: { emit: jest.fn() },
        },
        {
          provide: NOTIFICATION_MS,
          useValue: { emit: jest.fn() },
        },
      ],
      controllers: [UsersController],
    }).compile();

    userController = moduleRef.get(UsersController);
    usersService = moduleRef.get(UsersService);
    projectsClient = moduleRef.get(PROJECT_MS);
    issuesClient = moduleRef.get(ISSUE_MS);
    notificationClient = moduleRef.get(NOTIFICATION_MS);
  });

  describe('me', () => {
    it('should return user profile correctly', async () => {
      // Arrange
      usersService.getCurrentUser.mockResolvedValue({
        email: 'john@gmail.com',
        id: 1,
        name: 'john',
      });

      // Action
      const result = await userController.me(1);

      // Assert
      expect(result).toStrictEqual({
        email: 'john@gmail.com',
        id: 1,
        name: 'john',
      });
      expect(usersService.getCurrentUser).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update user profile correctly and return id', async () => {
      // Arrange
      usersService.editUser.mockResolvedValue({
        id: 1,
        updatedAt: new Date().toISOString(),
      });

      // Action
      const result = await userController.update(1, {
        email: 'john@gmail.com',
        name: 'john',
      });

      // Assert
      expect(result).toStrictEqual({
        id: 1,
      });
      expect(projectsClient.emit).toHaveBeenCalled();
      expect(issuesClient.emit).toHaveBeenCalled();
      expect(notificationClient.emit).toHaveBeenCalled();
    });
  });

  describe('getUserByEmail', () => {
    it('should get user by email correctly', async () => {
      // Arrange
      usersService.getUserByEmail.mockResolvedValue({
        id: 1,
        email: 'john@gmail.com',
        name: 'john',
      });

      // Action
      const result = await userController.getUserByEmail('john@gmail.com');

      // Assert
      expect(result).toStrictEqual({
        id: 1,
        email: 'john@gmail.com',
        name: 'john',
      });
      expect(usersService.getUserByEmail).toHaveBeenCalled();
    });
  });
});
