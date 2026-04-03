/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import {
  NewProjectInput,
  ProjectCursorOutput,
  ProjectOutput,
  ProjectPaginationOutput,
  UpdateProjectInput,
} from './projects.type';
import { ClientProxy } from '@nestjs/microservices';
import { ISSUE_MS } from 'src/common/constants';

describe('ProjectsController', () => {
  let projectsController: ProjectsController;
  let projectsService: jest.Mocked<ProjectsService>;
  let issuesClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
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
            handleUserChanged: jest.fn(),
          },
        },
        {
          provide: ISSUE_MS,
          useValue: { emit: jest.fn() },
        },
      ],
      controllers: [ProjectsController],
    }).compile();

    projectsService = moduleRef.get(ProjectsService);
    projectsController = moduleRef.get(ProjectsController);
    issuesClient = moduleRef.get(ISSUE_MS);
  });

  describe('allDeleted', () => {
    it('should return all soft deleted projects correctly', async () => {
      // Arrange
      const userId = 1;
      const cursor = 10;
      const expectedResult: ProjectCursorOutput = {
        data: [{ id: 1, name: 'Deleted Project' }],
        pagination: { hasMore: true, nextCursor: 21 },
      };
      projectsService.handleGetAllSoftDeletedProjects.mockResolvedValue(
        expectedResult,
      );

      // Action
      const result = await projectsController.allDeleted(userId, cursor);

      // Assert
      expect(
        projectsService.handleGetAllSoftDeletedProjects,
      ).toHaveBeenCalledWith(userId, cursor);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('restore', () => {
    it('should restore a soft deleted project and return affected rows/id', async () => {
      // Arrange
      const projectId = 5;
      const userId = 1;
      const expectedResult = { id: 1, updatedAt: '2026-03-27T04:54:53.790Z' };
      projectsService.handleRestoreSoftDeletedProject.mockResolvedValue(
        expectedResult,
      );

      // Action
      const result = await projectsController.restore(projectId, userId);

      // Assert
      expect(
        projectsService.handleRestoreSoftDeletedProject,
      ).toHaveBeenCalledWith(projectId, userId);
      expect(result).toEqual(expectedResult.id);
      expect(issuesClient.emit).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new project and return the project id', async () => {
      // Arrange
      const payload: NewProjectInput = {
        name: 'New Project',
        user_id: 1,
        user_email: 'john@test.com',
        user_name: 'john',
      };
      const expectedProjectId = 99;
      projectsService.handlePostProject.mockResolvedValue(expectedProjectId);

      // Action
      const result = await projectsController.create(payload);

      // Assert
      expect(projectsService.handlePostProject).toHaveBeenCalledWith(payload);
      expect(result).toEqual(expectedProjectId);
    });
  });

  describe('all', () => {
    it('should return all owned projects with pagination', async () => {
      // Arrange
      const userId = 1;
      const page = 1;
      const search = 'test';
      const expectedResult = {
        data: [{ id: 1, name: 'Active Project' }],
        pagination: {},
      } as ProjectPaginationOutput;
      projectsService.handleGetAllProjects.mockResolvedValue(expectedResult);

      // Action
      const result = await projectsController.all(userId, page, search);

      // Assert
      expect(projectsService.handleGetAllProjects).toHaveBeenCalledWith(
        userId,
        page,
        search,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('detail', () => {
    it('should return project detail correctly', async () => {
      // Arrange
      const projectId = 5;
      const userId = 1;
      const expectedResult = {
        id: 5,
        name: 'Project Detail',
      } as ProjectOutput;
      projectsService.handleGetProjectById.mockResolvedValue(expectedResult);

      // Action
      const result = await projectsController.detail(projectId, userId);

      // Assert
      expect(projectsService.handleGetProjectById).toHaveBeenCalledWith(
        projectId,
        userId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a project and return affected rows/id', async () => {
      // Arrange
      const projectId = 5;
      const userId = 1;
      const payload = {
        name: 'Updated Name',
      } as UpdateProjectInput;
      const expectedResult = 1;
      projectsService.handlePatchProject.mockResolvedValue(expectedResult);

      // Action
      const result = await projectsController.update(
        projectId,
        userId,
        payload,
      );

      // Assert
      expect(projectsService.handlePatchProject).toHaveBeenCalledWith(
        projectId,
        userId,
        payload,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('delete', () => {
    it('should soft delete a project and return affected rows/id', async () => {
      // Arrange
      const projectId = 5;
      const userId = 1;
      const expectedResult = { id: 1, deletedAt: '2026-03-27T04:54:53.790Z' };
      projectsService.handleSoftDeleteProject.mockResolvedValue(expectedResult);

      // Action
      const result = await projectsController.delete(projectId, userId);

      // Assert
      expect(projectsService.handleSoftDeleteProject).toHaveBeenCalledWith(
        projectId,
        userId,
      );
      expect(result).toEqual(expectedResult.id);
      expect(issuesClient.emit).toHaveBeenCalled();
    });
  });
});
