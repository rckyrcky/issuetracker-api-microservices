/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';

import { IssueHistoriesService } from 'src/features/issue-histories/issue-histories.service';
import { CustomSuccessMessages } from 'src/common/messages';
import { AuthRequest } from 'src/common/types/request.type';
import { IssueHistoriesCursorOutput } from 'src/features/issue-histories/issue.histories.type';
import { IssueHistoriesController } from './issue-histories.controller';

describe('IssueHistoriesController', () => {
  let controller: IssueHistoriesController;
  let issueHistoriesServiceMock: jest.Mocked<IssueHistoriesService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IssueHistoriesController],
      providers: [
        {
          provide: IssueHistoriesService,
          useValue: {
            handleGetIssueHistories: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(IssueHistoriesController);
    issueHistoriesServiceMock = module.get(IssueHistoriesService);
  });

  describe('history', () => {
    it('should return fetch message and histories data (with cursor)', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const query = { cursor: 123 };
      const params = { issue_id: 7 };

      const data = {
        data: [{ id: 1 }],
        pagination: { hasMore: true, nextCursor: 456 },
      } as IssueHistoriesCursorOutput;

      issueHistoriesServiceMock.handleGetIssueHistories.mockResolvedValue(data);

      // Action
      const result = await controller.history(req, query, params);

      // Assert
      expect(
        issueHistoriesServiceMock.handleGetIssueHistories,
      ).toHaveBeenCalledWith(7, 10, 123);
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data,
      });
    });

    it('should pass undefined cursor when not provided', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const query = {};
      const params = { issue_id: 7 };

      const data = {
        data: [],
        pagination: { hasMore: false, nextCursor: null },
      };

      issueHistoriesServiceMock.handleGetIssueHistories.mockResolvedValue(data);

      // Action
      const result = await controller.history(req, query, params);

      // Assert
      expect(
        issueHistoriesServiceMock.handleGetIssueHistories,
      ).toHaveBeenCalledWith(7, 10, undefined);
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data,
      });
    });
  });
});
