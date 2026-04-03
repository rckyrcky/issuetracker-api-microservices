/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { PROJECT_MS } from 'src/common/constants';
import { of } from 'rxjs';
import { ProjectsService } from './projects.service';
import {
  NewProjectInput,
  ProjectCursorOutput,
  ProjectOutput,
  ProjectPaginationOutput,
  UpdateProjectInput,
} from './projects.type';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectsClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PROJECT_MS,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ProjectsService);
    projectsClient = module.get(PROJECT_MS);
  });

  describe('handlePostProject', () => {
    it('should post projects correctly)', async () => {
      // Arrange
      const payload = {} as NewProjectInput;

      const expected = 2;
      projectsClient.send.mockReturnValue(of(expected));
      // Action
      await service.handlePostProject(payload);

      // Assert
      expect(projectsClient.send).toHaveBeenCalled();
    });
  });

  describe('handleGetAllProjects', () => {
    it('should return all projects correctly', async () => {
      // Arrange
      const userId = 10;

      const expected = {} as ProjectPaginationOutput;
      projectsClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleGetAllProjects(userId);

      // Assert
      expect(projectsClient.send).toHaveBeenCalled();
    });
  });

  describe('handleGetAllSoftDeletedProjects', () => {
    it('should return all soft deleted projects', async () => {
      // Arrange
      const userId = 10;

      const expected = {} as ProjectCursorOutput;
      projectsClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleGetAllSoftDeletedProjects(userId);

      // Assert
      expect(projectsClient.send).toHaveBeenCalled();
    });
  });

  describe('handleGetProjectById', () => {
    it('should return project by id', async () => {
      // Arrange
      const projectId = 10;
      const userId = 10;

      const expected = {} as ProjectOutput;
      projectsClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleGetProjectById(projectId, userId);

      // Assert
      expect(projectsClient.send).toHaveBeenCalled();
    });
  });

  describe('handlePatchProject', () => {
    it('should update project', async () => {
      // Arrange
      const projectId = 10;
      const userId = 10;
      const payload = {} as UpdateProjectInput;

      const expected = 9;
      projectsClient.send.mockReturnValue(of(expected));
      // Action
      await service.handlePatchProject(projectId, userId, payload);

      // Assert
      expect(projectsClient.send).toHaveBeenCalled();
    });
  });

  describe('handleSoftDeleteProject', () => {
    it('should soft delete project by id', async () => {
      // Arrange
      const projectId = 10;
      const userId = 10;

      const expected = 9;
      projectsClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleSoftDeleteProject(projectId, userId);

      // Assert
      expect(projectsClient.send).toHaveBeenCalled();
    });
  });

  describe('handleRestoreSoftDeletedProject', () => {
    it('should restore project by id', async () => {
      // Arrange
      const projectId = 10;
      const userId = 10;

      const expected = 9;
      projectsClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleRestoreSoftDeletedProject(projectId, userId);

      // Assert
      expect(projectsClient.send).toHaveBeenCalled();
    });
  });
});
