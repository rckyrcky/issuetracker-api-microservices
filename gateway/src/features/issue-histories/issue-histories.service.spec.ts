/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { ISSUE_MS } from 'src/common/constants';
import { of } from 'rxjs';
import { IssueHistoriesService } from './issue-histories.service';
import { IssueHistoriesCursorOutput } from './issue.histories.type';

describe('IssueHistoriesService', () => {
  let service: IssueHistoriesService;
  let issuesClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssueHistoriesService,
        {
          provide: ISSUE_MS,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(IssueHistoriesService);
    issuesClient = module.get(ISSUE_MS);
  });

  describe('handleGetIssueHistories', () => {
    it('should return all issue histories correctly', async () => {
      // Arrange
      const userId = 10;
      const issueId = 2;

      const expected = {} as IssueHistoriesCursorOutput;
      issuesClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleGetIssueHistories(issueId, userId);

      // Assert
      expect(issuesClient.send).toHaveBeenCalled();
    });
  });
});
