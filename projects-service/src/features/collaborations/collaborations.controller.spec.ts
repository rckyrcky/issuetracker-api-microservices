import { Test, TestingModule } from '@nestjs/testing';
import { CollaborationsService } from 'src/features/collaborations/collaborations.service';
import { CollaborationsController } from './collaborations.controller';
import {
  CollaborationProjectPaginationOutput,
  NewCollaborationInput,
  NewCollaborationOutput,
} from './collaborations.type';
import { ClientProxy } from '@nestjs/microservices';
import { NOTIFICATION_MS } from 'src/common/constants';

describe('CollaborationsController', () => {
  let controller: CollaborationsController;
  let collaborationsService: jest.Mocked<CollaborationsService>;
  let notificationsClient: ClientProxy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockCollaborationsService = {
      handleGetAllColaborationProjects: jest.fn(),
      handlePostCollaboration: jest.fn(),
      handleDeleteCollaboration: jest.fn(),
      handleUserChanged: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollaborationsController],
      providers: [
        {
          provide: CollaborationsService,
          useValue: mockCollaborationsService,
        },
        { provide: NOTIFICATION_MS, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    controller = module.get(CollaborationsController);
    collaborationsService = module.get(CollaborationsService);
    notificationsClient = module.get(NOTIFICATION_MS);
  });

  describe('all', () => {
    it('should return paginated collaboration projects', async () => {
      // Arrange
      const userId = 1;
      const page = 2;
      const expectedResult = {
        data: [{ id: 1, name: 'Project A' }],
        pagination: { total: 1, page: 2 },
      } as CollaborationProjectPaginationOutput;

      const spy = jest
        .spyOn(collaborationsService, 'handleGetAllColaborationProjects')
        .mockResolvedValue(expectedResult);

      // Action
      const result = await controller.all(userId, page);

      // Assert
      expect(spy).toHaveBeenCalledWith(userId, page);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('create', () => {
    it('should create a collaboration and return an id/status number', async () => {
      // Arrange
      const payload: NewCollaborationInput = {
        collaborator_email: 'alice@test.com',
        collaborator_id: 2,
        collaborator_name: 'alice',
        owner_email: 'john@test.com',
        owner_id: 1,
        owner_name: 'john',
        project_id: 1,
      };
      const expectedResult: NewCollaborationOutput = {
        collaborator_id: payload.collaborator_id,
        id: 999,
        owner_id: payload.owner_id,
        owner_name: payload.owner_name,
        project_id: payload.project_id,
        project_name: 'issuetracker',
      };

      const spy = jest
        .spyOn(collaborationsService, 'handlePostCollaboration')
        .mockResolvedValue(expectedResult);

      const spyNotificationsClient = jest.spyOn(notificationsClient, 'emit');

      // Action
      const result = await controller.create(
        payload.project_id,
        payload.owner_id,
        payload.collaborator_email,
      );

      // Assert
      expect(spy).toHaveBeenCalledWith({
        projectId: payload.project_id,
        userId: payload.owner_id,
        email: payload.collaborator_email,
      });
      expect(result).toEqual(expectedResult.id);
      expect(spyNotificationsClient).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a collaboration and return affected rows/id number', async () => {
      // Arrange
      const projectId = 10;
      const userId = 5;
      const expectedAffectedRows = 1;
      const email = 'john@test.com';

      const spy = jest
        .spyOn(collaborationsService, 'handleDeleteCollaboration')
        .mockResolvedValue(expectedAffectedRows);

      // Action
      const result = await controller.delete(projectId, userId, email);

      // Assert
      expect(spy).toHaveBeenCalledWith(projectId, email, userId);
      expect(result).toEqual(expectedAffectedRows);
    });
  });
});
