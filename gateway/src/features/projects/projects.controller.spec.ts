/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CustomSuccessMessages } from 'src/common/messages';
import { AuthRequest } from 'src/common/types/request.type';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectCursorOutput, ProjectPaginationOutput } from './projects.type';
import { AuthService } from '../auth/auth.service';
import { CollaborationsService } from '../collaborations/collaborations.service';
import { CollaborationProjectPaginationOutput } from '../collaborations/collaborations.type';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let projectsServiceMock: jest.Mocked<ProjectsService>;
  let authService: jest.Mocked<AuthService>;
  let collaborationService: jest.Mocked<CollaborationsService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: {
            handleGetAllSoftDeletedProjects: jest.fn(),
            handleRestoreSoftDeletedProject: jest.fn(),
            handlePostProject: jest.fn(),
            handleGetAllProjects: jest.fn(),
            handleGetProjectById: jest.fn(),
            handlePatchProject: jest.fn(),
            handleSoftDeleteProject: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            handleMe: jest.fn(),
          },
        },
        {
          provide: CollaborationsService,
          useValue: {
            handleGetAllColaborationProjects: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(ProjectsController);
    projectsServiceMock = module.get(ProjectsService);
    authService = module.get(AuthService);
    collaborationService = module.get(CollaborationsService);
  });

  describe('allDeleted', () => {
    it('should return fetch message and deleted projects data', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const query = { cursor: 123 };

      const data = {
        data: [{ id: 1 }],
        pagination: { hasMore: true, nextCursor: 456 },
      } as ProjectCursorOutput;

      projectsServiceMock.handleGetAllSoftDeletedProjects.mockResolvedValue(
        data,
      );

      // Action
      const result = await controller.allDeleted(req, query);

      // Assert
      expect(
        projectsServiceMock.handleGetAllSoftDeletedProjects,
      ).toHaveBeenCalledWith(10, 123);
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data,
      });
    });

    it('should pass undefined cursor when not provided', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const query = {};

      const data = {
        data: [],
        pagination: { hasMore: false, nextCursor: null },
      };

      projectsServiceMock.handleGetAllSoftDeletedProjects.mockResolvedValue(
        data,
      );

      // Action
      const result = await controller.allDeleted(req, query);

      // Assert
      expect(
        projectsServiceMock.handleGetAllSoftDeletedProjects,
      ).toHaveBeenCalledWith(10, undefined);
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data,
      });
    });
  });

  describe('restore', () => {
    it('should return restore message and id', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { project_id: 99 };

      projectsServiceMock.handleRestoreSoftDeletedProject.mockResolvedValue(99);

      // Action
      const result = await controller.restore(req, params);

      // Assert
      expect(
        projectsServiceMock.handleRestoreSoftDeletedProject,
      ).toHaveBeenCalledWith(99, 10);
      expect(result).toEqual({
        message: CustomSuccessMessages.projects.restore,
        data: { id: 99 },
      });
    });
  });

  describe('create', () => {
    it('should call handlePostProject with payload + user_id and return post message', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const payload = { name: 'Project A' };

      projectsServiceMock.handlePostProject.mockResolvedValue(123);
      authService.handleMe.mockResolvedValue({
        email: 'alice@gmail.com',
        id: 10,
        name: 'alice',
      });

      // Action
      const result = await controller.create(payload, req);

      // Assert
      expect(projectsServiceMock.handlePostProject).toHaveBeenCalledWith({
        ...payload,
        user_id: 10,
        user_name: 'alice',
        user_email: 'alice@gmail.com',
      });
      expect(authService.handleMe).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        message: CustomSuccessMessages.projects.post,
        data: { id: 123 },
      });
    });
  });

  describe('allCollaborations', () => {
    it('should return data', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const query = { page: 2 };

      const data = {
        data: [{ id: 1 }],
        pagination: {
          total: 1,
          page: 2,
          totalPages: 1,
          hasMorePage: false,
          nextPage: null,
          limit: 10,
        },
      } as CollaborationProjectPaginationOutput;

      collaborationService.handleGetAllColaborationProjects.mockResolvedValue(
        data,
      );

      // Action
      const result = await controller.allCollaborations(query, req);

      // Assert
      expect(
        collaborationService.handleGetAllColaborationProjects,
      ).toHaveBeenCalledWith(10, 2);
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data,
      });
    });
  });

  describe('all', () => {
    it('should return fetch message and projects data', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const query = { page: 2, search: 'abc' };

      const data = {
        data: [{ id: 1 }],
        pagination: {
          total: 1,
          page: 2,
          totalPages: 1,
          hasMorePage: false,
          nextPage: null,
          limit: 10,
        },
      } as ProjectPaginationOutput;

      projectsServiceMock.handleGetAllProjects.mockResolvedValue(data);

      // Action
      const result = await controller.all(req, query);

      // Assert
      expect(projectsServiceMock.handleGetAllProjects).toHaveBeenCalledWith(
        10,
        2,
        'abc',
      );
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data,
      });
    });

    it('should pass undefined page/search when not provided', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const query = {};

      const data = {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          totalPages: 0,
          hasMorePage: false,
          nextPage: null,
          limit: 10,
        },
      };

      projectsServiceMock.handleGetAllProjects.mockResolvedValue(data);

      // Action
      const result = await controller.all(req, query);

      // Assert
      expect(projectsServiceMock.handleGetAllProjects).toHaveBeenCalledWith(
        10,
        undefined,
        undefined,
      );
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data,
      });
    });
  });

  describe('detail', () => {
    it('should return fetch message and project detail data', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { project_id: 99 };

      const data = { id: 99, name: 'Project A', collaborator: [] };
      projectsServiceMock.handleGetProjectById.mockResolvedValue(data);

      // Action
      const result = await controller.detail(params, req);

      // Assert
      expect(projectsServiceMock.handleGetProjectById).toHaveBeenCalledWith(
        99,
        10,
      );
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data,
      });
    });
  });

  describe('update', () => {
    it('should return patch message and id', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { project_id: 99 };
      const payload = { name: 'New' };

      projectsServiceMock.handlePatchProject.mockResolvedValue(777);

      // Action
      const result = await controller.update(params, req, payload);

      // Assert
      expect(projectsServiceMock.handlePatchProject).toHaveBeenCalledWith(
        99,
        10,
        payload,
      );
      expect(result).toEqual({
        message: CustomSuccessMessages.projects.patch,
        data: { id: 777 },
      });
    });
  });

  describe('delete', () => {
    it('should return delete message and id', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { project_id: 99 };

      projectsServiceMock.handleSoftDeleteProject.mockResolvedValue(99);

      // Action
      const result = await controller.delete(params, req);

      // Assert
      expect(projectsServiceMock.handleSoftDeleteProject).toHaveBeenCalledWith(
        99,
        10,
      );
      expect(result).toEqual({
        message: CustomSuccessMessages.projects.delete,
        data: { id: 99 },
      });
    });
  });
});
