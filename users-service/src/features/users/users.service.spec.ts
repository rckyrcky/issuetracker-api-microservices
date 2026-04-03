/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundError, UserError } from 'src/common/exceptions';
import { CustomErrorMessages } from 'src/common/messages';
import { type IUsersRepository } from './repository/interface.users.repository';
import { type IHashService } from 'src/common/interfaces/hash.interface';
import { type UserEditInput } from './users.type';
import { USERS_REPOSITORY, HASH_SERVICE } from 'src/common/constants';

describe('UsersService', () => {
  let service: UsersService;

  let configServiceMock: jest.Mocked<ConfigService>;
  let usersRepositoryMock: jest.Mocked<IUsersRepository>;
  let hashServiceMock: jest.Mocked<IHashService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: USERS_REPOSITORY,
          useValue: {
            getUserById: jest.fn(),
            getUserIdByEmail: jest.fn(),
            editUser: jest.fn(),
          },
        },
        {
          provide: HASH_SERVICE,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);

    configServiceMock = module.get(ConfigService);
    usersRepositoryMock = module.get(USERS_REPOSITORY);
    hashServiceMock = module.get(HASH_SERVICE);
  });

  describe('getCurrentUser', () => {
    it('should return current user when found', async () => {
      // Arrange
      const id = 10;
      const user = [{ id, email: 'a@mail.com' } as any];
      usersRepositoryMock.getUserById.mockResolvedValue(user);

      // Action
      const result = await service.getCurrentUser(id);

      // Assert
      expect(usersRepositoryMock.getUserById).toHaveBeenCalledWith(id);
      expect(result).toEqual(user[0]);
    });

    it('should throw NotFoundError when user not found', async () => {
      // Arrange
      const id = 10;
      usersRepositoryMock.getUserById.mockResolvedValue([]);

      // Action
      const action = () => service.getCurrentUser(id);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('editUser', () => {
    it('should throw UserError when demo account in production', async () => {
      // Arrange
      const id = 1;
      const payload: UserEditInput = { name: 'New' };
      configServiceMock.get.mockReturnValue('production' as any);

      // Action
      const action = () => service.editUser(id, payload);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(UserError);
      await expect(action()).rejects.toMatchObject({
        message: 'Demo account only!',
      });
      expect(usersRepositoryMock.editUser).not.toHaveBeenCalled();
    });

    it('should throw UserError when email already used by other user', async () => {
      // Arrange
      const id = 10;
      const payload: UserEditInput = { email: 'taken@mail.com' };

      configServiceMock.get.mockReturnValue('development' as any);
      usersRepositoryMock.getUserIdByEmail.mockResolvedValue([
        { id: 99 } as any,
      ]);

      // Action
      const action = () => service.editUser(id, payload);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(UserError);
      await expect(action()).rejects.toMatchObject({
        message: CustomErrorMessages.unique('email'),
      });
      expect(usersRepositoryMock.editUser).not.toHaveBeenCalled();
    });

    it('should hash password when provided and edit user', async () => {
      // Arrange
      const id = 10;
      const payload: UserEditInput = {
        email: 'new@mail.com',
        password: 'plain',
      };

      configServiceMock.get.mockReturnValue('development' as any);
      usersRepositoryMock.getUserIdByEmail.mockResolvedValue([]);
      hashServiceMock.hash.mockResolvedValue('hashed');
      usersRepositoryMock.editUser.mockResolvedValue([{ id } as any]);

      // Action
      const result = await service.editUser(id, payload);

      // Assert
      expect(usersRepositoryMock.getUserIdByEmail).toHaveBeenCalledWith(
        'new@mail.com',
      );
      expect(hashServiceMock.hash).toHaveBeenCalledWith('plain');
      expect(usersRepositoryMock.editUser).toHaveBeenCalledWith(id, {
        ...payload,
        password: 'hashed',
      });
      expect(result).toEqual({ id });
    });

    it('should not hash password when not provided and edit user', async () => {
      // Arrange
      const id = 10;
      const payload: UserEditInput = { name: 'New' };

      configServiceMock.get.mockReturnValue('development');
      usersRepositoryMock.editUser.mockResolvedValue([{ id } as any]);

      // Action
      const result = await service.editUser(id, payload);

      // Assert
      expect(hashServiceMock.hash).not.toHaveBeenCalled();
      expect(usersRepositoryMock.getUserIdByEmail).not.toHaveBeenCalled();
      expect(usersRepositoryMock.editUser).toHaveBeenCalledWith(id, payload);
      expect(result).toEqual({ id });
    });

    it('should throw NotFoundError when edit result is empty array', async () => {
      // Arrange
      const id = 10;
      const payload: UserEditInput = { name: 'New' };

      configServiceMock.get.mockReturnValue('development' as any);
      usersRepositoryMock.editUser.mockResolvedValue([]);

      // Action
      const action = () => service.editUser(id, payload);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found', async () => {
      // Arrange
      const id = 10;
      const user = [{ id, email: 'a@mail.com' } as any];
      usersRepositoryMock.getUserIdByEmail.mockResolvedValue(user);

      // Action
      const result = await service.getUserByEmail('a@mail.com');

      // Assert
      expect(usersRepositoryMock.getUserIdByEmail).toHaveBeenCalledWith(
        'a@mail.com',
      );
      expect(result).toEqual(user[0]);
    });

    it('should throw NotFoundError when user not found', async () => {
      // Arrange
      usersRepositoryMock.getUserIdByEmail.mockResolvedValue([]);

      // Action
      const action = () => service.getUserByEmail('a@a.com');

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
