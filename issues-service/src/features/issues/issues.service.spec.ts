/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { IssuesService } from './issues.service';
import { NotFoundError } from 'src/common/exceptions';
import { generatePaginationData } from 'src/common/utils';
import { type IIssuesRepository } from './repository/interface.issues.repository';
import { type NewIssueInput, type UpdateIssueInput } from './issues.type';
import { ClientProxy } from '@nestjs/microservices';
import { ISSUES_REPOSITORY, PROJECT_MS } from 'src/common/constants';
import { of, throwError } from 'rxjs';

jest.mock('src/common/utils', () => ({
  generatePaginationData: jest.fn(),
}));

describe('IssuesService', () => {
  let service: IssuesService;
  let issuesRepositoryMock: jest.Mocked<IIssuesRepository>;
  let projectsClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssuesService,
        {
          provide: PROJECT_MS,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: ISSUES_REPOSITORY,
          useValue: {
            addIssue: jest.fn(),
            getAllIssues: jest.fn(),
            getTotalIssues: jest.fn(),
            getIssueById: jest.fn(),
            editIssue: jest.fn(),
            updateUserData: jest.fn(),
            updateProjectData: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(IssuesService);
    projectsClient = module.get(PROJECT_MS);
    issuesRepositoryMock = module.get(ISSUES_REPOSITORY);
  });

  describe('isProjectSoftDeleted', () => {
    it('should not throw when project is not soft deleted', async () => {
      // Arrange
      const projectId = 1;
      const userId = 2;
      projectsClient.send.mockReturnValue(of(undefined));

      // Action
      await service.isProjectSoftDeleted(projectId, userId);

      // Assert
      expect(projectsClient.send).toHaveBeenCalled();
    });
  });

  describe('checkUserPermission', () => {
    it('should not throw when check user permission is valid', async () => {
      // Arrange
      const projectId = 1;
      const userId = 2;
      projectsClient.send.mockReturnValue(of(undefined));

      // Action
      await service.checkUserPermission(projectId, userId);

      // Assert
      expect(projectsClient.send).toHaveBeenCalled();
    });
  });

  describe('handlePostIssue', () => {
    it('should return new issue id when success', async () => {
      // Arrange
      const issue = {
        user_id: 1,
        project_id: 99,
        title: 'Issue A',
      } as NewIssueInput;

      projectsClient.send.mockReturnValueOnce(of(undefined));
      projectsClient.send.mockReturnValueOnce(of(undefined));

      issuesRepositoryMock.addIssue.mockResolvedValue([{ id: 777 } as any]);

      // Action
      const result = await service.handlePostIssue(issue);

      // Assert
      expect(projectsClient.send).toHaveBeenCalledTimes(2);
      expect(issuesRepositoryMock.addIssue).toHaveBeenCalledWith(issue);
      expect(result).toBe(777);
    });

    it('should throw NotFoundError when project is soft deleted', async () => {
      // Arrange
      const issue = {
        project_id: 99,
        title: 'Issue A',
        user_id: 10,
      } as NewIssueInput;

      projectsClient.send.mockReturnValueOnce(
        throwError(() => new NotFoundError()),
      );

      // Action
      const action = () => service.handlePostIssue(issue);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
      expect(projectsClient.send).toHaveBeenCalledTimes(1);
      expect(issuesRepositoryMock.addIssue).not.toHaveBeenCalled();
    });
  });

  describe('handleGetAllIssues', () => {
    it('should return issues with pagination (with filters)', async () => {
      // Arrange
      const projectId = 99;
      const userId = 10;
      const page = 2;
      const status = 'open';
      const priority = 'high';

      projectsClient.send.mockReturnValueOnce(of(undefined));
      projectsClient.send.mockReturnValueOnce(of(undefined));

      const issues = [{ id: 1 } as any, { id: 2 } as any];
      const total = 25;

      issuesRepositoryMock.getAllIssues.mockResolvedValue(issues);
      issuesRepositoryMock.getTotalIssues.mockResolvedValue(total);

      (generatePaginationData as jest.Mock).mockReturnValue({
        hasMorePage: true,
        nextPage: 3,
        totalPages: 3,
        limit: 10,
      });

      // Action
      const result = await service.handleGetAllIssues(
        projectId,
        userId,
        page,
        status,
        priority,
      );

      // Assert
      expect(projectsClient.send).toHaveBeenCalledTimes(2);
      expect(issuesRepositoryMock.getAllIssues).toHaveBeenCalledWith(
        projectId,
        page,
        status,
        priority,
      );
      expect(issuesRepositoryMock.getTotalIssues).toHaveBeenCalledWith(
        projectId,
        status,
        priority,
      );
      expect(generatePaginationData).toHaveBeenCalledWith(total, page);
      expect(result).toEqual({
        data: issues,
        pagination: {
          total,
          page,
          totalPages: 3,
          hasMorePage: true,
          nextPage: 3,
          limit: 10,
        },
      });
    });

    it('should default page = 1 when not provided', async () => {
      // Arrange
      const projectId = 99;
      const userId = 10;

      projectsClient.send.mockReturnValueOnce(of(undefined));
      projectsClient.send.mockReturnValueOnce(of(undefined));

      issuesRepositoryMock.getAllIssues.mockResolvedValue([]);
      issuesRepositoryMock.getTotalIssues.mockResolvedValue(0);

      (generatePaginationData as jest.Mock).mockReturnValue({
        hasMorePage: false,
        nextPage: null,
        totalPages: 0,
        limit: 10,
      });

      // Action
      const result = await service.handleGetAllIssues(projectId, userId);

      // Assert
      expect(issuesRepositoryMock.getAllIssues).toHaveBeenCalledWith(
        projectId,
        1,
        undefined,
        undefined,
      );
      expect(issuesRepositoryMock.getTotalIssues).toHaveBeenCalledWith(
        projectId,
        undefined,
        undefined,
      );
      expect(generatePaginationData).toHaveBeenCalledWith(0, 1);
      expect(result.pagination.page).toBe(1);
    });
  });

  describe('handleGetIssueById', () => {
    it('should return issue when found and user has permission', async () => {
      // Arrange
      const issueId = 1;
      const userId = 10;

      issuesRepositoryMock.getIssueById.mockResolvedValue([
        { id: issueId, project_id: 99 } as any,
      ]);
      projectsClient.send.mockReturnValueOnce(of(undefined));

      // Action
      const result = await service.handleGetIssueById(issueId, userId);

      // Assert
      expect(issuesRepositoryMock.getIssueById).toHaveBeenCalledWith(issueId);
      expect(projectsClient.send).toHaveBeenCalled();
      expect(result).toEqual({ id: issueId, project_id: 99 });
    });

    it('should throw NotFoundError when issue not found', async () => {
      // Arrange
      const issueId = 1;
      const userId = 10;

      issuesRepositoryMock.getIssueById.mockResolvedValue([]);

      // Action
      const action = () => service.handleGetIssueById(issueId, userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
      expect(projectsClient.send).not.toHaveBeenCalled();
    });
  });

  describe('handlePatchIssue', () => {
    it('should return edited issue id when success', async () => {
      // Arrange
      const issueId = 1;
      const userId = 10;
      const update = { title: 'New' } as UpdateIssueInput;

      issuesRepositoryMock.getIssueById.mockResolvedValue([
        { id: issueId, project_id: 99 } as any,
      ]);
      projectsClient.send.mockReturnValueOnce(of(undefined));
      issuesRepositoryMock.editIssue.mockResolvedValue([{ id: 555 } as any]);

      // Action
      const result = await service.handlePatchIssue(issueId, userId, update);

      // Assert
      expect(issuesRepositoryMock.getIssueById).toHaveBeenCalledWith(issueId);
      expect(projectsClient.send).toHaveBeenCalled();
      expect(issuesRepositoryMock.editIssue).toHaveBeenCalledWith(
        issueId,
        userId,
        update,
        { id: issueId, project_id: 99 },
      );
      expect(result).toBe(555);
    });

    it('should throw NotFoundError when edit result is empty', async () => {
      // Arrange
      const issueId = 1;
      const userId = 10;
      const update = { title: 'New' } as UpdateIssueInput;

      issuesRepositoryMock.getIssueById.mockResolvedValue([
        { id: issueId, project_id: 99 } as any,
      ]);
      projectsClient.send.mockReturnValueOnce(of(undefined));

      issuesRepositoryMock.editIssue.mockResolvedValue([]);

      // Action
      const action = () => service.handlePatchIssue(issueId, userId, update);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      // Arrange
      issuesRepositoryMock.updateUserData.mockResolvedValue();

      // Action
      await service.updateUser(1, 'alice', new Date().toISOString());

      // Assert
      expect(issuesRepositoryMock.updateUserData).toHaveBeenCalled();
    });
  });

  describe('updateProject', () => {
    it('should update project', async () => {
      // Arrange
      issuesRepositoryMock.updateProjectData.mockResolvedValue();

      // Action
      await service.updateProject(1, true, new Date().toISOString());

      // Assert
      expect(issuesRepositoryMock.updateProjectData).toHaveBeenCalled();
    });
  });
});
