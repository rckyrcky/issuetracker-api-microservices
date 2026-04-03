/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { IUsersRepository } from '../users/repository/interface.users.repository';
import { IHashService } from 'src/common/interfaces/hash.interface';
import { IJwtService } from 'src/common/interfaces/jwt.interface';
import { AuthService } from './auth.service';
import { UserLoginInput, UserSignupInput } from '../users/users.type';
import { UserError } from 'src/common/exceptions';
import {
  USERS_REPOSITORY,
  HASH_SERVICE,
  JWT_SERVICE,
} from 'src/common/constants';

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository: jest.Mocked<IUsersRepository>;
  let hashService: jest.Mocked<IHashService>;
  let jwtService: jest.Mocked<IJwtService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: USERS_REPOSITORY,
          useValue: { signup: jest.fn(), login: jest.fn() },
        },
        {
          provide: HASH_SERVICE,
          useValue: { hash: jest.fn(), verify: jest.fn() },
        },
        {
          provide: JWT_SERVICE,
          useValue: { createAccessToken: jest.fn() },
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    usersRepository = moduleRef.get(USERS_REPOSITORY);
    hashService = moduleRef.get(HASH_SERVICE);
    jwtService = moduleRef.get(JWT_SERVICE);
  });

  describe('signup', () => {
    it('should signup user correctly', async () => {
      // Arrange
      const user: UserSignupInput = {
        email: 'john@example.com',
        name: 'john',
        password: 'halo12345',
      };

      hashService.hash.mockResolvedValue('hashedPassword');
      usersRepository.signup.mockResolvedValue([{ id: 1 }]);
      jwtService.createAccessToken.mockResolvedValue('accessToken');

      // Action
      const { accessToken } = await authService.signup(user);

      // Assert
      expect(accessToken).toBe('accessToken');
      expect(hashService.hash).toHaveBeenCalledWith(user.password);
      expect(usersRepository.signup).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashedPassword' }),
      );
      expect(usersRepository.signup).not.toHaveBeenCalledWith(
        expect.objectContaining({ password: 'halo12345' }),
      );
      expect(jwtService.createAccessToken).toHaveBeenCalledWith(1);
    });
  });

  describe('login', () => {
    it('should login user correctly', async () => {
      // Arrange
      const user: UserLoginInput = {
        email: 'john@example.com',
        password: 'halo12345',
      };

      hashService.verify.mockResolvedValue(true);
      usersRepository.login.mockResolvedValue([
        { id: 1, password: 'hashedPassword' },
      ]);
      jwtService.createAccessToken.mockResolvedValue('accessToken');

      // Action
      const { accessToken } = await authService.login(user);

      // Assert
      expect(accessToken).toBe('accessToken');
      expect(usersRepository.login).toHaveBeenCalledWith(user);
      expect(hashService.verify).toHaveBeenCalledWith(
        user.password,
        'hashedPassword',
      );
      expect(jwtService.createAccessToken).toHaveBeenCalledWith(1);
    });

    it('should throw UserError when payload is incorrect', async () => {
      // Arrange
      const user: UserLoginInput = {
        email: 'john@example.com',
        password: 'halo12345',
      };

      usersRepository.login.mockResolvedValue([]);

      // Assert
      await expect(authService.login(user)).rejects.toThrow(UserError);
      expect(usersRepository.login).toHaveBeenCalledWith(user);
      expect(hashService.verify).not.toHaveBeenCalled();
      expect(jwtService.createAccessToken).not.toHaveBeenCalled();
    });

    it('should throw UserError when password is incorrect', async () => {
      // Arrange
      const user: UserLoginInput = {
        email: 'john@example.com',
        password: 'halo12345',
      };

      usersRepository.login.mockResolvedValue([
        { id: 1, password: 'hashedPassword' },
      ]);

      hashService.verify.mockResolvedValue(false);

      // Assert
      await expect(authService.login(user)).rejects.toThrow(UserError);
      expect(usersRepository.login).toHaveBeenCalledWith(user);
      expect(hashService.verify).toHaveBeenCalled();
      expect(jwtService.createAccessToken).not.toHaveBeenCalled();
    });
  });
});
