/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CollaborationsService } from './collaborations.service';
import { AuthorizationService } from '../authorization/authorization.service';
import {
  COLLABORATIONS_REPOSITORY,
  PROJECTS_REPOSITORY,
  USER_MS,
} from 'src/common/constants';
import {
  AuthorizationError,
  NotFoundError,
  UserError,
} from 'src/common/exceptions';
import { generatePaginationData } from 'src/common/utils';

import { type ICollaborationsRepository } from './repository/interface.collaborations.repository';
import { type IProjectsRepository } from '../projects/repository/interface.projects.repository';
import {
  NewCollaborationInput,
  NewCollaborationOutput,
} from './collaborations.type';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

jest.mock('src/common/utils', () => ({
  generatePaginationData: jest.fn(),
}));

describe('CollaborationsService', () => {
  let service: CollaborationsService;

  let collaborationsRepositoryMock: jest.Mocked<ICollaborationsRepository>;
  let projectsRepositoryMock: jest.Mocked<IProjectsRepository>;
  let authorizationServiceMock: jest.Mocked<AuthorizationService>;
  let usersClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollaborationsService,
        {
          provide: COLLABORATIONS_REPOSITORY,
          useValue: {
            addCollaboration: jest.fn(),
            deleteCollaboration: jest.fn(),
            getListOfCollaborationProjects: jest.fn(),
            getTotalListOfCollaborationProjects: jest.fn(),
            verifyCollaboration: jest.fn(),
            updateUserData: jest.fn(),
          },
        },
        {
          provide: PROJECTS_REPOSITORY,
          useValue: {
            getSoftDeletedProjectById: jest.fn(),
            getProjectById: jest.fn(),
          },
        },
        {
          provide: AuthorizationService,
          useValue: {
            verifyProjectOwner: jest.fn(),
          },
        },
        { provide: USER_MS, useValue: { send: jest.fn() } },
      ],
    }).compile();

    service = module.get(CollaborationsService);

    collaborationsRepositoryMock = module.get(COLLABORATIONS_REPOSITORY);
    projectsRepositoryMock = module.get(PROJECTS_REPOSITORY);
    authorizationServiceMock = module.get(AuthorizationService);
    usersClient = module.get(USER_MS);
  });

  describe('isProjectSoftDeleted', () => {
    it('should not throw when project is not soft deleted', async () => {
      // Arrange
      const projectId = 1;
      projectsRepositoryMock.getSoftDeletedProjectById.mockResolvedValue([]);

      // Action
      const result = service.isProjectSoftDeleted(projectId);

      // Assert
      await expect(result).resolves.toBeUndefined();
      expect(
        projectsRepositoryMock.getSoftDeletedProjectById,
      ).toHaveBeenCalledWith(projectId);
    });

    it('should throw NotFoundError when project is soft deleted', async () => {
      // Arrange
      const projectId = 1;
      projectsRepositoryMock.getSoftDeletedProjectById.mockResolvedValue([
        { id: projectId } as any,
      ]);

      // Action
      const action = () => service.isProjectSoftDeleted(projectId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('handlePostCollaboration', () => {
    it('should return new collaboration id when success', async () => {
      // Arrange
      const collaboration: NewCollaborationInput = {
        collaborator_email: 'alice@test.com',
        collaborator_id: 2,
        collaborator_name: 'alice',
        owner_email: 'john@test.com',
        owner_id: 1,
        owner_name: 'john',
        project_id: 1,
      };

      const expectedResult: NewCollaborationOutput = {
        collaborator_id: collaboration.collaborator_id,
        id: 999,
        owner_id: collaboration.owner_id,
        owner_name: collaboration.owner_name,
        project_id: collaboration.project_id,
        project_name: 'Project A',
        collaborator_name: 'alice',
      };

      projectsRepositoryMock.getSoftDeletedProjectById.mockResolvedValue([]);
      projectsRepositoryMock.getProjectById.mockResolvedValue([
        { id: expectedResult.project_id, name: expectedResult.project_name! },
      ]);
      authorizationServiceMock.verifyProjectOwner.mockResolvedValue([
        { id: 1, name: 'Project A' } as any,
      ]);
      collaborationsRepositoryMock.addCollaboration.mockResolvedValue([
        expectedResult,
      ]);
      usersClient.send.mockReturnValueOnce(
        of({
          id: collaboration.collaborator_id,
          name: collaboration.collaborator_name,
          email: collaboration.collaborator_email,
        }),
      );

      usersClient.send.mockReturnValueOnce(
        of({
          id: collaboration.owner_id,
          name: collaboration.owner_name,
          email: collaboration.owner_email,
        }),
      );

      // Action
      const result = await service.handlePostCollaboration({
        email: collaboration.collaborator_email,
        projectId: collaboration.project_id,
        userId: collaboration.owner_id,
      });

      // Assert
      expect(
        projectsRepositoryMock.getSoftDeletedProjectById,
      ).toHaveBeenCalledWith(collaboration.project_id);
      expect(authorizationServiceMock.verifyProjectOwner).toHaveBeenCalledWith(
        collaboration.project_id,
        collaboration.owner_id,
      );
      expect(
        collaborationsRepositoryMock.addCollaboration,
      ).toHaveBeenCalledWith(collaboration);
      expect(result).toStrictEqual(expectedResult);
      expect(usersClient.send).toHaveBeenCalled();
    });

    it('should throw NotFoundError when project is soft deleted', async () => {
      // Arrange
      const collaboration: NewCollaborationInput = {
        collaborator_email: 'alice@test.com',
        collaborator_id: 2,
        collaborator_name: 'alice',
        owner_email: 'john@test.com',
        owner_id: 1,
        owner_name: 'john',
        project_id: 1,
      };

      projectsRepositoryMock.getSoftDeletedProjectById.mockResolvedValue([
        { id: 1 } as any,
      ]);

      // Action
      const action = () =>
        service.handlePostCollaboration({
          email: collaboration.collaborator_email,
          projectId: collaboration.project_id,
          userId: collaboration.owner_id,
        });

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
      expect(
        authorizationServiceMock.verifyProjectOwner,
      ).not.toHaveBeenCalled();
      expect(
        collaborationsRepositoryMock.addCollaboration,
      ).not.toHaveBeenCalled();
    });

    it('should throw AuthorizationError when user is not owner', async () => {
      // Arrange
      const collaboration: NewCollaborationInput = {
        collaborator_email: 'alice@test.com',
        collaborator_id: 2,
        collaborator_name: 'alice',
        owner_email: 'john@test.com',
        owner_id: 1,
        owner_name: 'john',
        project_id: 1,
      };

      projectsRepositoryMock.getSoftDeletedProjectById.mockResolvedValue([]);
      authorizationServiceMock.verifyProjectOwner.mockRejectedValue(
        new AuthorizationError(),
      );

      // Action
      const action = () =>
        service.handlePostCollaboration({
          email: collaboration.collaborator_email,
          projectId: collaboration.project_id,
          userId: collaboration.owner_id,
        });

      // Assert
      await expect(action()).rejects.toBeInstanceOf(AuthorizationError);
      expect(authorizationServiceMock.verifyProjectOwner).toHaveBeenCalled();
      expect(
        collaborationsRepositoryMock.addCollaboration,
      ).not.toHaveBeenCalled();
    });

    it('should throw UserError when user is self collaborating', async () => {
      // Arrange
      const collaboration: NewCollaborationInput = {
        collaborator_email: 'alice@test.com',
        collaborator_id: 2,
        collaborator_name: 'alice',
        owner_email: 'john@test.com',
        owner_id: 2,
        owner_name: 'alice',
        project_id: 1,
      };

      projectsRepositoryMock.getSoftDeletedProjectById.mockResolvedValue([]);
      authorizationServiceMock.verifyProjectOwner.mockResolvedValue([]);
      usersClient.send.mockReturnValue(of({ id: 2 }));

      // Action
      const action = () =>
        service.handlePostCollaboration({
          email: collaboration.collaborator_email,
          projectId: collaboration.project_id,
          userId: collaboration.owner_id,
        });

      // Assert
      await expect(action()).rejects.toBeInstanceOf(UserError);
      expect(authorizationServiceMock.verifyProjectOwner).toHaveBeenCalled();
      expect(
        collaborationsRepositoryMock.addCollaboration,
      ).not.toHaveBeenCalled();
    });
  });

  describe('handleGetAllColaborationProjects', () => {
    it('should return data with pagination', async () => {
      // Arrange
      const userId = 10;
      const page = 2;

      const list = [{ id: 1 } as any, { id: 2 } as any];
      const total = 25;

      collaborationsRepositoryMock.getListOfCollaborationProjects.mockResolvedValue(
        list,
      );
      collaborationsRepositoryMock.getTotalListOfCollaborationProjects.mockResolvedValue(
        total,
      );

      (generatePaginationData as jest.Mock).mockReturnValue({
        hasMorePage: true,
        limit: 10,
        nextPage: 3,
        totalPages: 3,
      });

      // Action
      const result = await service.handleGetAllColaborationProjects(
        userId,
        page,
      );

      // Assert
      expect(
        collaborationsRepositoryMock.getListOfCollaborationProjects,
      ).toHaveBeenCalledWith(userId, page);
      expect(
        collaborationsRepositoryMock.getTotalListOfCollaborationProjects,
      ).toHaveBeenCalledWith(userId);
      expect(generatePaginationData).toHaveBeenCalledWith(total, page);
      expect(result).toEqual({
        data: list,
        pagination: {
          hasMorePage: true,
          nextPage: 3,
          limit: 10,
          total,
          page,
          totalPages: 3,
        },
      });
    });

    it('should use default page = 1 when page is not provided', async () => {
      // Arrange
      const userId = 10;

      collaborationsRepositoryMock.getListOfCollaborationProjects.mockResolvedValue(
        [],
      );
      collaborationsRepositoryMock.getTotalListOfCollaborationProjects.mockResolvedValue(
        0,
      );

      (generatePaginationData as jest.Mock).mockReturnValue({
        hasMorePage: false,
        limit: 10,
        nextPage: null,
        totalPages: 0,
      });

      // Action
      const result = await service.handleGetAllColaborationProjects(userId);

      // Assert
      expect(
        collaborationsRepositoryMock.getListOfCollaborationProjects,
      ).toHaveBeenCalledWith(userId, 1);
      expect(generatePaginationData).toHaveBeenCalledWith(0, 1);
      expect(result.pagination.page).toBe(1);
    });
  });

  describe('handleDeleteCollaboration', () => {
    it('should return deleted collaboration id when success', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;
      const email = 'john@test.com';

      projectsRepositoryMock.getSoftDeletedProjectById.mockResolvedValue([]);
      authorizationServiceMock.verifyProjectOwner.mockResolvedValue([
        { id: projectId } as any,
      ]);

      collaborationsRepositoryMock.deleteCollaboration.mockResolvedValue([
        { id: 555 } as any,
      ]);
      usersClient.send.mockReturnValue(of({ id: 11, name: 'john', email }));

      // Action
      const result = await service.handleDeleteCollaboration(
        projectId,
        email,
        userId,
      );

      // Assert
      expect(
        projectsRepositoryMock.getSoftDeletedProjectById,
      ).toHaveBeenCalledWith(projectId);
      expect(authorizationServiceMock.verifyProjectOwner).toHaveBeenCalledWith(
        projectId,
        userId,
      );

      expect(
        collaborationsRepositoryMock.deleteCollaboration,
      ).toHaveBeenCalledWith(projectId, 11);
      expect(result).toBe(555);
      expect(usersClient.send).toHaveBeenCalled();
    });

    it('should throw NotFoundError when project is soft deleted', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;

      projectsRepositoryMock.getSoftDeletedProjectById.mockResolvedValue([
        { id: projectId } as any,
      ]);

      // Action
      const action = () =>
        service.handleDeleteCollaboration(projectId, 'john@test,com', userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
      expect(
        authorizationServiceMock.verifyProjectOwner,
      ).not.toHaveBeenCalled();
    });

    it('should throw AuthorizationError when user is not owner', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;

      projectsRepositoryMock.getSoftDeletedProjectById.mockResolvedValue([]);
      authorizationServiceMock.verifyProjectOwner.mockRejectedValue(
        new AuthorizationError(),
      );

      // Action
      const action = () =>
        service.handleDeleteCollaboration(projectId, 'john@test,com', userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(AuthorizationError);
      expect(authorizationServiceMock.verifyProjectOwner).toHaveBeenCalled();

      expect(
        collaborationsRepositoryMock.addCollaboration,
      ).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when delete result is empty', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;

      projectsRepositoryMock.getSoftDeletedProjectById.mockResolvedValue([]);
      authorizationServiceMock.verifyProjectOwner.mockResolvedValue([
        { id: projectId } as any,
      ]);

      collaborationsRepositoryMock.deleteCollaboration.mockResolvedValue([]);
      usersClient.send.mockReturnValueOnce(
        of({
          id: 2,
        }),
      );

      // Action
      const action = () =>
        service.handleDeleteCollaboration(projectId, 'john@test.com', userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
    });

    it('should throw UserError when user uncollaborate himself', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;

      projectsRepositoryMock.getSoftDeletedProjectById.mockResolvedValue([]);
      authorizationServiceMock.verifyProjectOwner.mockResolvedValue([
        { id: projectId } as any,
      ]);

      collaborationsRepositoryMock.deleteCollaboration.mockResolvedValue([]);
      usersClient.send.mockReturnValueOnce(
        of({
          id: userId,
        }),
      );

      // Action
      const action = () =>
        service.handleDeleteCollaboration(projectId, 'john@test.com', userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(UserError);
    });

    describe('handleUserChanged', () => {
      it('should update users correctly', async () => {
        // Arrange
        const payload = {
          id: 1,
          name: 'john',
          updatedAt: new Date().toISOString(),
        };
        collaborationsRepositoryMock.updateUserData.mockResolvedValue();

        // Action
        await service.handleUserChanged(payload);

        // Assert
        expect(
          collaborationsRepositoryMock.updateUserData,
        ).toHaveBeenCalledWith(
          payload.id,
          payload.updatedAt,
          payload.name,
          undefined,
        );
      });
    });
  });
});
