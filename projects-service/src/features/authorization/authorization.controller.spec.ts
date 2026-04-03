/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { AuthorizationController } from './authorization.controller';
import { AuthorizationService } from './authorization.service';
import { AuthorizationError } from 'src/common/exceptions';

describe('AuthorizationController', () => {
  let controller: AuthorizationController;
  let service: jest.Mocked<AuthorizationService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: AuthorizationService,
          useValue: {
            checkUserPermission: jest.fn(),
          },
        },
      ],
      controllers: [AuthorizationController],
    }).compile();

    service = moduleRef.get(AuthorizationService);
    controller = moduleRef.get(AuthorizationController);
  });

  describe('checkUserPermission', () => {
    it('should working correctly', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;
      service.checkUserPermission.mockResolvedValue(true);

      // Action
      await controller.checkUserPermission(projectId, userId);

      // Assert
      expect(service.checkUserPermission).toHaveBeenCalledWith(
        projectId,
        userId,
      );
    });

    it('should throw error', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;
      service.checkUserPermission.mockRejectedValue(new AuthorizationError());

      // Assert
      await expect(
        controller.checkUserPermission(projectId, userId),
      ).rejects.toThrow(AuthorizationError);
      expect(service.checkUserPermission).toHaveBeenCalledWith(
        projectId,
        userId,
      );
    });
  });
});
