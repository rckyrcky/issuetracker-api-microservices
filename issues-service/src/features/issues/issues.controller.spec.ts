/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import {
  IssueOutput,
  IssueOutputPagination,
  NewIssueInput,
  UpdateIssueInput,
} from './issues.type';

describe('IssueController', () => {
  let issuesController: IssuesController;
  let issuesService: jest.Mocked<IssuesService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: IssuesService,
          useValue: {
            handleGetIssueById: jest.fn(),
            handlePatchIssue: jest.fn(),
            handlePostIssue: jest.fn(),
            handleGetAllIssues: jest.fn(),
            updateProject: jest.fn(),
          },
        },
      ],
      controllers: [IssuesController],
    }).compile();

    issuesService = moduleRef.get(IssuesService);
    issuesController = moduleRef.get(IssuesController);
  });

  describe('detail', () => {
    it('should return issue detail correctly', async () => {
      // Arrange
      const issueId = 1;
      const userId = 2;
      const expected = {} as IssueOutput;
      issuesService.handleGetIssueById.mockResolvedValue(expected);

      // Action
      const result = await issuesController.detail(issueId, userId);

      // Assert
      expect(result).toStrictEqual(expected);
    });
  });

  describe('update', () => {
    it('should update issues correctly', async () => {
      // Arrange
      const issueId = 1;
      const userId = 2;
      const payload = {} as UpdateIssueInput;
      issuesService.handlePatchIssue.mockResolvedValue(1);

      // Action
      const result = await issuesController.update(issueId, userId, payload);

      // Assert
      expect(issuesService.handlePatchIssue).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('create', () => {
    it('should create issues correctly', async () => {
      // Arrange
      const payload = {} as NewIssueInput;
      issuesService.handlePostIssue.mockResolvedValue(1);

      // Action
      const result = await issuesController.create(payload);

      // Assert
      expect(issuesService.handlePostIssue).toHaveBeenCalled();
      expect(result).toBe(1);
    });
  });

  describe('all', () => {
    it('should return all issues correctly', async () => {
      // Arrange
      const projectId = 99;
      const userId = 10;
      const expected = {} as IssueOutputPagination;
      issuesService.handleGetAllIssues.mockResolvedValue(expected);

      // Action
      const result = await issuesController.all(projectId, userId);

      // Assert
      expect(issuesService.handleGetAllIssues).toHaveBeenCalled();
      expect(result).toStrictEqual(expected);
    });
  });

  describe('updateProjectDeleted', () => {
    it('should update deleted projects correctly', async () => {
      // Arrange
      const payload = {
        id: 1,
        deletedAt: new Date().toISOString(),
      };
      issuesService.updateProject.mockResolvedValue();

      // Action
      await issuesController.updateProjectDeleted(payload);

      // Assert
      expect(issuesService.updateProject).toHaveBeenCalledWith(
        payload.id,
        true,
        payload.deletedAt,
      );
    });
  });

  describe('updateProjectRestored', () => {
    it('should update restored projects correctly', async () => {
      // Arrange
      const payload = {
        id: 1,
        updatedAt: new Date().toISOString(),
      };
      issuesService.updateProject.mockResolvedValue();

      // Action
      await issuesController.updateProjectRestored(payload);

      // Assert
      expect(issuesService.updateProject).toHaveBeenCalledWith(
        payload.id,
        false,
        payload.updatedAt,
      );
    });
  });
});
