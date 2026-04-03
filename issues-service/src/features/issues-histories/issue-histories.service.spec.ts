/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { IssueHistoriesService } from './issue-histories.service';

import { AuthorizationError, NotFoundError } from 'src/common/exceptions';

import { generateCursorPaginationData } from 'src/common/utils';

import { type IIssueHistoriesRepository } from './repository/interface.issue.histories.repository';
import { type IIssuesRepository } from '../issues/repository/interface.issues.repository';
import { ClientProxy } from '@nestjs/microservices';
import {
  ISSUE_HISTORIES_REPOSITORY,
  ISSUES_REPOSITORY,
  PROJECT_MS,
} from 'src/common/constants';
import { of, throwError } from 'rxjs';

jest.mock('src/common/utils', () => ({
  generateCursorPaginationData: jest.fn(),
}));

describe('IssueHistoriesService', () => {
  let service: IssueHistoriesService;

  let issueHistoriesRepositoryMock: jest.Mocked<IIssueHistoriesRepository>;
  let issuesRepositoryMock: jest.Mocked<IIssuesRepository>;
  let projectsClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssueHistoriesService,
        {
          provide: ISSUE_HISTORIES_REPOSITORY,
          useValue: {
            getIssueHistories: jest.fn(),
            updateUserData: jest.fn(),
          },
        },
        {
          provide: ISSUES_REPOSITORY,
          useValue: {
            getIssueById: jest.fn(),
          },
        },
        {
          provide: PROJECT_MS,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(IssueHistoriesService);

    issueHistoriesRepositoryMock = module.get(ISSUE_HISTORIES_REPOSITORY);
    issuesRepositoryMock = module.get(ISSUES_REPOSITORY);
    projectsClient = module.get(PROJECT_MS);
  });

  describe('handleGetIssueHistories', () => {
    it('should return histories with cursor pagination when success (with cursor)', async () => {
      // Arrange
      const issueId = 1;
      const userId = 10;
      const cursor = 123;

      issuesRepositoryMock.getIssueById.mockResolvedValue([
        { id: issueId, project_id: 99 } as any,
      ]);

      projectsClient.send.mockReturnValue(of(undefined));

      const historiesRaw = [{ id: 1 } as any, { id: 2 } as any];
      issueHistoriesRepositoryMock.getIssueHistories.mockResolvedValue(
        historiesRaw,
      );

      (generateCursorPaginationData as jest.Mock).mockReturnValue({
        data: [{ id: 1 } as any],
        hasMore: true,
        nextCursor: 456,
      });

      // Action
      const result = await service.handleGetIssueHistories(
        issueId,
        userId,
        cursor,
      );

      // Assert
      expect(issuesRepositoryMock.getIssueById).toHaveBeenCalledWith(issueId);
      expect(projectsClient.send).toHaveBeenCalled();
      expect(
        issueHistoriesRepositoryMock.getIssueHistories,
      ).toHaveBeenCalledWith(issueId, cursor);
      expect(generateCursorPaginationData).toHaveBeenCalledWith(historiesRaw);
      expect(result).toEqual({
        data: [{ id: 1 }],
        pagination: { hasMore: true, nextCursor: 456 },
      });
    });

    it('should return histories with cursor pagination when success (without cursor)', async () => {
      // Arrange
      const issueId = 1;
      const userId = 10;

      issuesRepositoryMock.getIssueById.mockResolvedValue([
        { id: issueId, project_id: 99 } as any,
      ]);

      projectsClient.send.mockReturnValue(of(undefined));

      const historiesRaw = [{ id: 1 } as any];
      issueHistoriesRepositoryMock.getIssueHistories.mockResolvedValue(
        historiesRaw,
      );

      (generateCursorPaginationData as jest.Mock).mockReturnValue({
        data: historiesRaw,
        hasMore: false,
        nextCursor: null,
      });

      // Action
      const result = await service.handleGetIssueHistories(issueId, userId);

      // Assert
      expect(issuesRepositoryMock.getIssueById).toHaveBeenCalledWith(issueId);
      expect(projectsClient.send).toHaveBeenCalled();
      expect(
        issueHistoriesRepositoryMock.getIssueHistories,
      ).toHaveBeenCalledWith(issueId, undefined);
      expect(generateCursorPaginationData).toHaveBeenCalledWith(historiesRaw);
      expect(result).toEqual({
        data: historiesRaw,
        pagination: { hasMore: false, nextCursor: null },
      });
    });

    it('should throw NotFoundError when issue not found', async () => {
      // Arrange
      const issueId = 1;
      const userId = 10;

      issuesRepositoryMock.getIssueById.mockResolvedValue([]);
      projectsClient.send.mockReturnValue(
        throwError(() => new AuthorizationError()),
      );

      // Action
      const action = () => service.handleGetIssueHistories(issueId, userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
      expect(projectsClient.send).not.toHaveBeenCalled();
      expect(
        issueHistoriesRepositoryMock.getIssueHistories,
      ).not.toHaveBeenCalled();
      expect(generateCursorPaginationData).not.toHaveBeenCalled();
    });

    it('should throw AuthorizationError when checkUserPermission failed', async () => {
      // Arrange
      const issueId = 1;
      const userId = 10;

      issuesRepositoryMock.getIssueById.mockResolvedValue([
        { id: issueId, project_id: 99 } as any,
      ]);
      projectsClient.send.mockReturnValue(
        throwError(() => new AuthorizationError()),
      );

      // Action
      const action = () => service.handleGetIssueHistories(issueId, userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(AuthorizationError);
      expect(projectsClient.send).toHaveBeenCalled();
      expect(
        issueHistoriesRepositoryMock.getIssueHistories,
      ).not.toHaveBeenCalled();
      expect(generateCursorPaginationData).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update user', async () => {
      // Arrange
      issueHistoriesRepositoryMock.updateUserData.mockResolvedValue();

      // Action
      await service.updateUser(1, 'alice', new Date().toISOString());

      // Assert
      expect(issueHistoriesRepositoryMock.updateUserData).toHaveBeenCalled();
    });
  });
});
