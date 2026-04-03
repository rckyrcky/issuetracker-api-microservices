/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { CustomSuccessMessages } from 'src/common/messages';
import { AuthController } from './auth.controller';
import { Response } from 'express';
import { AuthRequest } from 'src/common/types/request.type';
import {
  UserEditInputDto,
  UserLoginInputDto,
  UserSignupInputDto,
} from './users.dto';

describe('AuthController', () => {
  let authService: jest.Mocked<AuthService>;
  let configService: jest.Mocked<ConfigService>;
  let authController: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            handleSignup: jest.fn(),
            handleLogin: jest.fn(),
            handleMe: jest.fn(),
            handleUpdate: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    configService = moduleRef.get(ConfigService);
    authController = moduleRef.get(AuthController);
  });

  describe('signup', () => {
    it('should signup user correctly in local', async () => {
      // Arrange
      const payload: UserSignupInputDto = {
        email: 'john@example.com',
        name: 'john',
        password: 'halo12345',
      };

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      authService.handleSignup.mockResolvedValue({
        accessToken: 'accessToken',
      });
      configService.get.mockReturnValue('local');

      // Action
      const result = await authController.signup(payload, res);

      // Assert
      expect(result).toStrictEqual({ message: CustomSuccessMessages.signup });
      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        'accessToken',
        expect.objectContaining({ secure: false }),
      );
    });

    it('should signup user correctly in production', async () => {
      // Arrange
      const payload: UserSignupInputDto = {
        email: 'john@example.com',
        name: 'john',
        password: 'halo12345',
      };

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      authService.handleSignup.mockResolvedValue({
        accessToken: 'accessToken',
      });
      configService.get.mockReturnValue('production');

      // Action
      const result = await authController.signup(payload, res);

      // Assert
      expect(result).toStrictEqual({ message: CustomSuccessMessages.signup });
      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        'accessToken',
        expect.objectContaining({ secure: true }),
      );
    });
  });

  describe('login', () => {
    it('should login user correctly in local', async () => {
      // Arrange
      const payload: UserLoginInputDto = {
        email: 'john@example.com',
        password: 'halo12345',
      };

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      authService.handleLogin.mockResolvedValue({ accessToken: 'accessToken' });
      configService.get.mockReturnValue('local');

      // Action
      const result = await authController.login(payload, res);

      // Assert
      expect(result).toStrictEqual({ message: CustomSuccessMessages.login });
      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        'accessToken',
        expect.objectContaining({ secure: false }),
      );
    });

    it('should login user correctly in production', async () => {
      // Arrange
      const payload: UserLoginInputDto = {
        email: 'john@example.com',
        password: 'halo12345',
      };

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      authService.handleLogin.mockResolvedValue({ accessToken: 'accessToken' });
      configService.get.mockReturnValue('production');

      // Action
      const result = await authController.login(payload, res);

      // Assert
      expect(result).toStrictEqual({ message: CustomSuccessMessages.login });
      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        'accessToken',
        expect.objectContaining({ secure: true }),
      );
    });
  });

  describe('me', () => {
    it('should show user info correctly', async () => {
      // Arrange
      const json = {
        message: CustomSuccessMessages.fetch,
        data: {
          id: 1,
          name: 'john',
          email: 'john@example.com',
        },
      };

      const req = {
        authData: { id: 1 },
      } as unknown as AuthRequest;

      authService.handleMe.mockResolvedValue(json.data);

      // Action
      const result = await authController.me(req);

      // Assert
      expect(result).toStrictEqual(json);
      expect(authService.handleMe).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update user correctly', async () => {
      // Arrange
      const payload: UserEditInputDto = {
        email: 'john@example.com',
        password: 'halo12345',
      };

      const json = {
        data: { id: 1 },
        message: CustomSuccessMessages.users.patch,
      };

      const req = {
        authData: { id: 1 },
      } as unknown as AuthRequest;

      authService.handleUpdate.mockResolvedValue(json.data);

      // Action
      const result = await authController.update(payload, req);

      // Assert
      expect(result).toStrictEqual(json);
      expect(authService.handleUpdate).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout user correctly in local', () => {
      // Arrange
      const json = { message: CustomSuccessMessages.logout };

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      configService.get.mockReturnValue('local');

      // Action
      const result = authController.logout(res);

      // Assert
      expect(result).toStrictEqual(json);
      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        '',
        expect.objectContaining({ secure: false, maxAge: 0 }),
      );
    });

    it('should logout user correctly in production', () => {
      // Arrange
      const json = { message: CustomSuccessMessages.logout };

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      configService.get.mockReturnValue('production');

      // Action
      const result = authController.logout(res);

      // Assert
      expect(result).toStrictEqual(json);
      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        '',
        expect.objectContaining({ secure: true, maxAge: 0 }),
      );
    });
  });
});
