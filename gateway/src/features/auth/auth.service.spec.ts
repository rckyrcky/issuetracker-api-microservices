/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { USER_MS } from 'src/common/constants';
import { of } from 'rxjs';
import {
  CurrentUserInfo,
  UserEditInput,
  UserLoginInput,
  UserSignupInput,
} from './users.type';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let usersClient: jest.Mocked<ClientProxy>;
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: USER_MS,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    usersClient = module.get(USER_MS);
    service = module.get(AuthService);
  });

  describe('handleSignup', () => {
    it('should signup user correctly)', async () => {
      // Arrange
      const payload = {} as UserSignupInput;

      const expected = {
        accessToken: 'alice',
      };
      usersClient.send.mockReturnValueOnce(of(expected));

      // Action
      await service.handleSignup(payload);

      // Assert
      expect(usersClient.send).toHaveBeenCalled();
    });
  });

  describe('handleLogin', () => {
    it('should login user', async () => {
      // Arrange
      const payload = {} as UserLoginInput;

      const expected = { accessToken: 'secret' };
      usersClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleLogin(payload);

      // Assert
      expect(usersClient.send).toHaveBeenCalled();
    });
  });

  describe('handleMe', () => {
    it('should return user info', async () => {
      // Arrange
      const id = 10;

      const expected = {} as CurrentUserInfo;
      usersClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleMe(id);

      // Assert
      expect(usersClient.send).toHaveBeenCalled();
    });
  });

  describe('handleUpdate', () => {
    it('should update user', async () => {
      // Arrange
      const userId = 10;
      const payload = {} as UserEditInput;

      const expected = 9;
      usersClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleUpdate(userId, payload);

      // Assert
      expect(usersClient.send).toHaveBeenCalled();
    });
  });

  describe('handleGetUserByEmail', () => {
    it('should return user info', async () => {
      // Arrange
      const email = 'alice@gmail.com';

      const expected = {} as CurrentUserInfo;
      usersClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleGetUserByEmail(email);

      // Assert
      expect(usersClient.send).toHaveBeenCalled();
    });
  });
});
