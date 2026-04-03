import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserLoginInput, UserSignupInput } from '../users/users.type';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { signup: jest.fn(), login: jest.fn() },
        },
      ],
      controllers: [AuthController],
    }).compile();

    authService = moduleRef.get(AuthService);
    authController = moduleRef.get(AuthController);
  });

  describe('signup', () => {
    it('should signup user correctly', async () => {
      // Arrange
      const payload: UserSignupInput = {
        email: 'john@example.com',
        name: 'john',
        password: 'halo1234',
      };
      authService.signup.mockResolvedValue({ accessToken: 'supersecret' });

      // Action
      const result = await authController.signup(payload);

      // Assert
      expect(result).toStrictEqual({ accessToken: 'supersecret' });
    });
  });

  describe('login', () => {
    it('should login user correctly', async () => {
      // Arrange
      const payload: UserLoginInput = {
        email: 'john@example.com',
        password: 'halo1234',
      };
      authService.login.mockResolvedValue({ accessToken: 'supersecret' });

      // Action
      const result = await authController.login(payload);

      // Assert
      expect(result).toStrictEqual({ accessToken: 'supersecret' });
    });
  });
});
