/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CollaborationsService } from 'src/features/collaborations/collaborations.service';
import { CustomSuccessMessages } from 'src/common/messages';
import { AuthRequest } from 'src/common/types/request.type';
import { CollaborationsController } from './collaborations.controller';

describe('CollaborationsController', () => {
  let controller: CollaborationsController;
  let collaborationsServiceMock: jest.Mocked<CollaborationsService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollaborationsController],
      providers: [
        {
          provide: CollaborationsService,
          useValue: {
            handleGetAllColaborationProjects: jest.fn(),
            handlePostCollaboration: jest.fn(),
            handleDeleteCollaboration: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(CollaborationsController);
    collaborationsServiceMock = module.get(CollaborationsService);
  });

  describe('create', () => {
    it('should return post message and id', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { project_id: 99 };
      const payload = { email: 'target@mail.com' };

      collaborationsServiceMock.handlePostCollaboration.mockResolvedValue(123);

      // Action
      const result = await controller.create(params, payload, req);

      // Assert
      expect(
        collaborationsServiceMock.handlePostCollaboration,
      ).toHaveBeenCalledWith(99, 'target@mail.com', 10);
      expect(result).toEqual({
        message: CustomSuccessMessages.collaborations.post,
        data: { id: 123 },
      });
    });
  });

  describe('delete', () => {
    it('should return delete message and id', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { project_id: 99 };
      const payload = { email: 'target@mail.com' };

      collaborationsServiceMock.handleDeleteCollaboration.mockResolvedValue(
        456,
      );

      // Action
      const result = await controller.delete(params, payload, req);

      // Assert
      expect(
        collaborationsServiceMock.handleDeleteCollaboration,
      ).toHaveBeenCalledWith(99, 'target@mail.com', 10);
      expect(result).toEqual({
        message: CustomSuccessMessages.collaborations.delete,
        data: { id: 456 },
      });
    });
  });
});
