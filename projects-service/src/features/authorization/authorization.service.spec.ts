/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationService } from './authorization.service';
import { AuthorizationError } from 'src/common/exceptions';
import {
  PROJECTS_REPOSITORY,
  COLLABORATIONS_REPOSITORY,
} from 'src/common/constants';
import { type IProjectsRepository } from '../projects/repository/interface.projects.repository';
import { type ICollaborationsRepository } from '../collaborations/repository/interface.collaborations.repository';
import { type ProjectOutput } from '../projects/projects.type';

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let projectsRepositoryMock: jest.Mocked<IProjectsRepository>;
  let collaborationsRepositoryMock: jest.Mocked<ICollaborationsRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationService,
        {
          provide: PROJECTS_REPOSITORY,
          useValue: {
            verifyProjectOwner: jest.fn(),
          },
        },
        {
          provide: COLLABORATIONS_REPOSITORY,
          useValue: {
            verifyCollaboration: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthorizationService);
    projectsRepositoryMock = module.get(PROJECTS_REPOSITORY);
    collaborationsRepositoryMock = module.get(COLLABORATIONS_REPOSITORY);
  });

  describe('verifyProjectOwner', () => {
    it('should return project when user is owner', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;
      const project = [{ id: projectId } as ProjectOutput];
      projectsRepositoryMock.verifyProjectOwner.mockResolvedValue(project);

      // Action
      const result = await service.verifyProjectOwner(projectId, userId);

      // Assert
      expect(projectsRepositoryMock.verifyProjectOwner).toHaveBeenCalledWith(
        projectId,
        userId,
      );
      expect(result).toEqual(project);
    });

    it('should throw AuthorizationError when user is not owner', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;
      projectsRepositoryMock.verifyProjectOwner.mockResolvedValue([]);

      // Action
      const action = () => service.verifyProjectOwner(projectId, userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(AuthorizationError);
    });
  });

  describe('verifyProjectCollaboration', () => {
    it('should not throw when user is collaborator', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;
      collaborationsRepositoryMock.verifyCollaboration.mockResolvedValue([
        { id: 123 } as any,
      ]);

      // Action
      const result = service.verifyProjectCollaboration(projectId, userId);

      // Assert
      await expect(result).resolves.toBeUndefined();
      expect(
        collaborationsRepositoryMock.verifyCollaboration,
      ).toHaveBeenCalledWith(projectId, userId);
    });

    it('should throw AuthorizationError when user is not collaborator', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;
      collaborationsRepositoryMock.verifyCollaboration.mockResolvedValue([]);

      // Action
      const action = () =>
        service.verifyProjectCollaboration(projectId, userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(AuthorizationError);
    });
  });

  describe('checkUserPermission', () => {
    it('should not throw when user is owner', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;
      projectsRepositoryMock.verifyProjectOwner.mockResolvedValue([
        { id: projectId } as ProjectOutput,
      ]);
      collaborationsRepositoryMock.verifyCollaboration.mockResolvedValue([]);

      // Action
      const result = service.checkUserPermission(projectId, userId);

      // Assert
      await expect(result).resolves.toBe(true);
      expect(projectsRepositoryMock.verifyProjectOwner).toHaveBeenCalledWith(
        projectId,
        userId,
      );
      expect(
        collaborationsRepositoryMock.verifyCollaboration,
      ).toHaveBeenCalledWith(projectId, userId);
    });

    it('should not throw when user is collaborator', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;
      projectsRepositoryMock.verifyProjectOwner.mockResolvedValue([]);
      collaborationsRepositoryMock.verifyCollaboration.mockResolvedValue([
        { id: 123 } as any,
      ]);

      // Action
      const result = service.checkUserPermission(projectId, userId);

      // Assert
      await expect(result).resolves.toBe(true);
      expect(projectsRepositoryMock.verifyProjectOwner).toHaveBeenCalledWith(
        projectId,
        userId,
      );
      expect(
        collaborationsRepositoryMock.verifyCollaboration,
      ).toHaveBeenCalledWith(projectId, userId);
    });

    it('should throw AuthorizationError when user is neither owner nor collaborator', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;
      projectsRepositoryMock.verifyProjectOwner.mockResolvedValue([]);
      collaborationsRepositoryMock.verifyCollaboration.mockResolvedValue([]);

      // Action
      const action = () => service.checkUserPermission(projectId, userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(AuthorizationError);
    });
  });
});
