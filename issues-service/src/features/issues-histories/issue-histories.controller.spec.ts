import { Test } from '@nestjs/testing';
import { IssueHistoriesController } from './issue-histories.controller';
import { IssueHistoriesService } from './issue-histories.service';
import { IssueHistoriesCursorOutput } from './issue.histories.type';

describe('IssueHistoriesController', () => {
  let issueHistoriesController: IssueHistoriesController;
  let issueHistoriesService: jest.Mocked<IssueHistoriesService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: IssueHistoriesService,
          useValue: {
            handleGetIssueHistories: jest.fn(),
          },
        },
      ],
      controllers: [IssueHistoriesController],
    }).compile();

    issueHistoriesService = moduleRef.get(IssueHistoriesService);
    issueHistoriesController = moduleRef.get(IssueHistoriesController);
  });

  describe('history', () => {
    it('should return issue histories correctly', async () => {
      // Arrange
      const issueId = 1;
      const userId = 2;
      const expected = {} as IssueHistoriesCursorOutput;
      issueHistoriesService.handleGetIssueHistories.mockResolvedValue(expected);

      // Action
      const result = await issueHistoriesController.history(issueId, userId);

      // Assert
      expect(result).toStrictEqual(expected);
    });
  });
});
