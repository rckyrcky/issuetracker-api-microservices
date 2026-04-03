/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { AuthorizationService } from '../authorization/authorization.service';
import { NotFoundError } from 'src/common/exceptions';
import {
  generateCursorPaginationData,
  generatePaginationData,
} from 'src/common/utils';
import {
  PROJECTS_REPOSITORY,
  COLLABORATIONS_REPOSITORY,
} from 'src/common/constants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { type IProjectsRepository } from './repository/interface.projects.repository';
import { type ICollaborationsRepository } from '../collaborations/repository/interface.collaborations.repository';
import { type Cache } from 'cache-manager';
import {
  ProjectOutput,
  type NewProjectInput,
  type UpdateProjectInput,
} from './projects.type';

jest.mock('src/common/utils', () => ({
  generatePaginationData: jest.fn(),
  generateCursorPaginationData: jest.fn(),
}));

describe('ProjectsService', () => {
  let service: ProjectsService;

  let authorizationServiceMock: jest.Mocked<AuthorizationService>;
  let projectsRepositoryMock: jest.Mocked<IProjectsRepository>;
  let collaborationsRepositoryMock: jest.Mocked<ICollaborationsRepository>;
  let cacheManagerMock: jest.Mocked<Cache>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: AuthorizationService,
          useValue: {
            checkUserPermission: jest.fn(),
            verifyProjectOwner: jest.fn(),
          },
        },
        {
          provide: PROJECTS_REPOSITORY,
          useValue: {
            addProject: jest.fn(),
            getAllProjects: jest.fn(),
            getTotalProjects: jest.fn(),
            getAllSoftDeletedProjects: jest.fn(),
            getProjectById: jest.fn(),
            editProject: jest.fn(),
            softDeleteProject: jest.fn(),
            restoreSoftDeletedProject: jest.fn(),
            updateUserData: jest.fn(),
          },
        },
        {
          provide: COLLABORATIONS_REPOSITORY,
          useValue: {
            getListOfCollaborators: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            clear: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ProjectsService);

    authorizationServiceMock = module.get(AuthorizationService);
    projectsRepositoryMock = module.get(PROJECTS_REPOSITORY);
    collaborationsRepositoryMock = module.get(COLLABORATIONS_REPOSITORY);
    cacheManagerMock = module.get(CACHE_MANAGER);
  });

  describe('handlePostProject', () => {
    it('should create project, clear cache, and return id', async () => {
      // Arrange
      const project: NewProjectInput = {
        name: 'Project A',
        user_id: 10,
        user_email: 'john@test.com',
        user_name: 'john',
      };
      projectsRepositoryMock.addProject.mockResolvedValue([{ id: 1 } as any]);

      // Action
      const result = await service.handlePostProject(project);

      // Assert
      expect(projectsRepositoryMock.addProject).toHaveBeenCalledWith(project);
      expect(cacheManagerMock.clear).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('handleGetAllProjects', () => {
    it('should return cached value when cache exists', async () => {
      // Arrange
      const userId = 10;
      const page = 1;
      const search = 'abc';

      const cached = {
        data: [{ id: 1 } as any],
        pagination: {
          hasMorePage: false,
          nextPage: null,
          page,
          total: 1,
          totalPages: 1,
          limit: 10,
        },
      };

      cacheManagerMock.get.mockResolvedValue(cached as any);

      // Action
      const result = await service.handleGetAllProjects(userId, page, search);

      // Assert
      expect(cacheManagerMock.get).toHaveBeenCalledWith(
        `projects:user:${userId}:page:${page}:search:${search}`,
      );
      expect(projectsRepositoryMock.getAllProjects).not.toHaveBeenCalled();
      expect(projectsRepositoryMock.getTotalProjects).not.toHaveBeenCalled();
      expect(cacheManagerMock.set).not.toHaveBeenCalled();
      expect(result).toEqual(cached);
    });

    it('should fetch, paginate, set cache, and return result when cache miss (with search)', async () => {
      // Arrange
      const userId = 10;
      const page = 2;
      const search = 'abc';

      cacheManagerMock.get.mockResolvedValue(undefined as any);

      const allProjects = [
        { id: 1, name: 'A' } as any,
        { id: 2, name: 'B' } as any,
      ] as ProjectOutput[];
      const totalAllProjects = 25;

      projectsRepositoryMock.getAllProjects.mockResolvedValue(allProjects);
      projectsRepositoryMock.getTotalProjects.mockResolvedValue(
        totalAllProjects,
      );

      (generatePaginationData as jest.Mock).mockReturnValue({
        hasMorePage: true,
        limit: 10,
        nextPage: 3,
        totalPages: 3,
      });

      // Action
      const result = await service.handleGetAllProjects(userId, page, search);

      // Assert
      expect(cacheManagerMock.get).toHaveBeenCalledWith(
        `projects:user:${userId}:page:${page}:search:${search}`,
      );
      expect(projectsRepositoryMock.getAllProjects).toHaveBeenCalledWith(
        userId,
        page,
        search,
      );
      expect(projectsRepositoryMock.getTotalProjects).toHaveBeenCalledWith(
        userId,
        search,
      );
      expect(generatePaginationData).toHaveBeenCalledWith(
        totalAllProjects,
        page,
      );
      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        `projects:user:${userId}:page:${page}:search:${search}`,
        {
          data: allProjects,
          pagination: {
            hasMorePage: true,
            nextPage: 3,
            page,
            total: totalAllProjects,
            totalPages: 3,
            limit: 10,
          },
        },
      );
      expect(result).toEqual({
        data: allProjects,
        pagination: {
          hasMorePage: true,
          nextPage: 3,
          page,
          total: totalAllProjects,
          totalPages: 3,
          limit: 10,
        },
      });
    });

    it('should default page = 1 and cache key search=all when search is undefined', async () => {
      // Arrange
      const userId = 10;

      cacheManagerMock.get.mockResolvedValue(undefined as any);
      projectsRepositoryMock.getAllProjects.mockResolvedValue([]);
      projectsRepositoryMock.getTotalProjects.mockResolvedValue(0);

      (generatePaginationData as jest.Mock).mockReturnValue({
        hasMorePage: false,
        limit: 10,
        nextPage: null,
        totalPages: 0,
      });

      // Action
      const result = await service.handleGetAllProjects(userId);

      // Assert
      expect(cacheManagerMock.get).toHaveBeenCalledWith(
        `projects:user:${userId}:page:1:search:all`,
      );
      expect(projectsRepositoryMock.getAllProjects).toHaveBeenCalledWith(
        userId,
        1,
        undefined,
      );
      expect(projectsRepositoryMock.getTotalProjects).toHaveBeenCalledWith(
        userId,
        undefined,
      );
      expect(cacheManagerMock.set).toHaveBeenCalled();
      expect(result.pagination.page).toBe(1);
    });
  });

  describe('handleGetAllSoftDeletedProjects', () => {
    it('should return cached value when cache exists', async () => {
      // Arrange
      const userId = 10;
      const cursor = 123;

      const cached = {
        data: [{ id: 1 } as any],
        pagination: { hasMore: true, nextCursor: 456 },
      };

      cacheManagerMock.get.mockResolvedValue(cached as any);

      // Action
      const result = await service.handleGetAllSoftDeletedProjects(
        userId,
        cursor,
      );

      // Assert
      expect(cacheManagerMock.get).toHaveBeenCalledWith(
        `deleted-projects:user:${userId}:cursor:${cursor}`,
      );
      expect(
        projectsRepositoryMock.getAllSoftDeletedProjects,
      ).not.toHaveBeenCalled();
      expect(cacheManagerMock.set).not.toHaveBeenCalled();
      expect(result).toEqual(cached);
    });

    it('should fetch, cursor-paginate, set cache, and return result when cache miss (without cursor)', async () => {
      // Arrange
      const userId = 10;

      cacheManagerMock.get.mockResolvedValue(undefined as any);

      const raw = [{ id: 1 } as any, { id: 2 } as any];
      projectsRepositoryMock.getAllSoftDeletedProjects.mockResolvedValue(raw);

      (generateCursorPaginationData as jest.Mock).mockReturnValue({
        data: [{ id: 1 } as any],
        hasMore: true,
        nextCursor: 2,
      });

      // Action
      const result = await service.handleGetAllSoftDeletedProjects(userId);

      // Assert
      expect(cacheManagerMock.get).toHaveBeenCalledWith(
        `deleted-projects:user:${userId}:cursor:start`,
      );
      expect(
        projectsRepositoryMock.getAllSoftDeletedProjects,
      ).toHaveBeenCalledWith(userId, undefined);
      expect(generateCursorPaginationData).toHaveBeenCalledWith(raw);
      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        `deleted-projects:user:${userId}:cursor:start`,
        {
          data: [{ id: 1 }],
          pagination: { hasMore: true, nextCursor: 2 },
        },
      );
      expect(result).toEqual({
        data: [{ id: 1 }],
        pagination: { hasMore: true, nextCursor: 2 },
      });
    });
  });

  describe('handleGetProjectById', () => {
    it('should return project with collaborators when found', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;

      authorizationServiceMock.checkUserPermission.mockResolvedValue(undefined);

      projectsRepositoryMock.getProjectById.mockResolvedValue([
        { id: projectId, name: 'Project A' } as any,
      ]);

      collaborationsRepositoryMock.getListOfCollaborators.mockResolvedValue([
        { id: 100, email: 'a@mail.com' } as any,
      ]);

      // Action
      const result = await service.handleGetProjectById(projectId, userId);

      // Assert
      expect(authorizationServiceMock.checkUserPermission).toHaveBeenCalledWith(
        projectId,
        userId,
      );
      expect(projectsRepositoryMock.getProjectById).toHaveBeenCalledWith(
        projectId,
      );
      expect(
        collaborationsRepositoryMock.getListOfCollaborators,
      ).toHaveBeenCalledWith(projectId);
      expect(result).toEqual({
        id: projectId,
        name: 'Project A',
        collaborator: [{ id: 100, email: 'a@mail.com' }],
      });
    });

    it('should throw NotFoundError when project not found', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;

      authorizationServiceMock.checkUserPermission.mockResolvedValue(undefined);
      projectsRepositoryMock.getProjectById.mockResolvedValue([]);
      collaborationsRepositoryMock.getListOfCollaborators.mockResolvedValue([]);

      // Action
      const action = () => service.handleGetProjectById(projectId, userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('handlePatchProject', () => {
    it('should edit project, clear cache, and return id when success', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;
      const project: UpdateProjectInput = { name: 'New' };

      authorizationServiceMock.verifyProjectOwner.mockResolvedValue([
        { id: 1 } as any,
      ]);
      projectsRepositoryMock.editProject.mockResolvedValue([
        { id: 123 } as any,
      ]);

      // Action
      const result = await service.handlePatchProject(
        projectId,
        userId,
        project,
      );

      // Assert
      expect(authorizationServiceMock.verifyProjectOwner).toHaveBeenCalledWith(
        projectId,
        userId,
      );
      expect(projectsRepositoryMock.editProject).toHaveBeenCalledWith(
        projectId,
        project,
      );
      expect(cacheManagerMock.clear).toHaveBeenCalled();
      expect(result).toBe(123);
    });

    it('should throw NotFoundError when edit result is empty', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;
      const project: UpdateProjectInput = { name: 'New' };

      authorizationServiceMock.verifyProjectOwner.mockResolvedValue([
        { id: 1 } as any,
      ]);
      projectsRepositoryMock.editProject.mockResolvedValue([]);

      // Action
      const action = () =>
        service.handlePatchProject(projectId, userId, project);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
      expect(cacheManagerMock.clear).not.toHaveBeenCalled();
    });
  });

  describe('handleSoftDeleteProject', () => {
    it('should soft delete project, clear cache, and return id when success', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;

      authorizationServiceMock.verifyProjectOwner.mockResolvedValue([
        { id: 1 } as any,
      ]);
      projectsRepositoryMock.softDeleteProject.mockResolvedValue([
        { id: 200 } as any,
      ]);

      // Action
      const result = await service.handleSoftDeleteProject(projectId, userId);

      // Assert
      expect(authorizationServiceMock.verifyProjectOwner).toHaveBeenCalledWith(
        projectId,
        userId,
      );
      expect(projectsRepositoryMock.softDeleteProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(cacheManagerMock.clear).toHaveBeenCalled();
      expect(result.id).toBe(200);
    });

    it('should throw NotFoundError when delete result is empty', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;

      authorizationServiceMock.verifyProjectOwner.mockResolvedValue([
        { id: 1 } as any,
      ]);
      projectsRepositoryMock.softDeleteProject.mockResolvedValue([]);

      // Action
      const action = () => service.handleSoftDeleteProject(projectId, userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
      expect(cacheManagerMock.clear).not.toHaveBeenCalled();
    });
  });

  describe('handleRestoreSoftDeletedProject', () => {
    it('should restore project, clear cache, and return id when success', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;

      authorizationServiceMock.verifyProjectOwner.mockResolvedValue([
        { id: 1 } as any,
      ]);
      projectsRepositoryMock.restoreSoftDeletedProject.mockResolvedValue([
        { id: 300 } as any,
      ]);

      // Action
      const result = await service.handleRestoreSoftDeletedProject(
        projectId,
        userId,
      );

      // Assert
      expect(authorizationServiceMock.verifyProjectOwner).toHaveBeenCalledWith(
        projectId,
        userId,
      );
      expect(
        projectsRepositoryMock.restoreSoftDeletedProject,
      ).toHaveBeenCalledWith(projectId);
      expect(cacheManagerMock.clear).toHaveBeenCalled();
      expect(result.id).toBe(300);
    });

    it('should throw NotFoundError when restore result is empty', async () => {
      // Arrange
      const projectId = 1;
      const userId = 10;

      authorizationServiceMock.verifyProjectOwner.mockResolvedValue([
        { id: 1 } as any,
      ]);
      projectsRepositoryMock.restoreSoftDeletedProject.mockResolvedValue([]);

      // Action
      const action = () =>
        service.handleRestoreSoftDeletedProject(projectId, userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
      expect(cacheManagerMock.clear).not.toHaveBeenCalled();
    });
  });

  describe('handleUserChanged', () => {
    it('should update users correctly', async () => {
      // Arrange
      const payload = {
        id: 1,
        name: 'john',
        updatedAt: new Date().toISOString(),
      };
      projectsRepositoryMock.updateUserData.mockResolvedValue();

      // Action
      await service.handleUserChanged(payload);

      // Assert
      expect(projectsRepositoryMock.updateUserData).toHaveBeenCalledWith(
        payload.id,
        payload.updatedAt,
        payload.name,
        undefined,
      );
    });
  });
});
