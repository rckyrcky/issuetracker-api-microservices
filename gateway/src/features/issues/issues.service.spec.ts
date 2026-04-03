/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { ISSUE_MS, USER_MS } from 'src/common/constants';
import { of } from 'rxjs';
import { IssuesService } from './issues.service';
import {
  IssueOutput,
  IssueOutputPagination,
  UpdateIssueInput,
} from './issues.type';
import { NewIssueInputDto } from './issues.dto';

describe('IssuesService', () => {
  let service: IssuesService;
  let issuesClient: jest.Mocked<ClientProxy>;
  let usersClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssuesService,
        {
          provide: ISSUE_MS,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: USER_MS,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(IssuesService);
    issuesClient = module.get(ISSUE_MS);
    usersClient = module.get(USER_MS);
  });

  describe('handlePostIssue', () => {
    it('should post issues correctly)', async () => {
      // Arrange
      const payload = {} as NewIssueInputDto;

      const expected = 2;
      usersClient.send.mockReturnValueOnce(
        of({
          name: 'alice',
        }),
      );
      issuesClient.send.mockReturnValue(of(expected));
      // Action
      await service.handlePostIssue(payload, 1, 2);

      // Assert
      expect(issuesClient.send).toHaveBeenCalled();
      expect(usersClient.send).toHaveBeenCalled();
    });
  });

  describe('handleGetAllIssues', () => {
    it('should return all issues correctly', async () => {
      // Arrange
      const userId = 10;
      const projectId = 2;

      const expected = {} as IssueOutputPagination;
      issuesClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleGetAllIssues(projectId, userId);

      // Assert
      expect(issuesClient.send).toHaveBeenCalled();
    });
  });

  describe('handleGetIssueById', () => {
    it('should return issues by id', async () => {
      // Arrange
      const issueId = 10;
      const userId = 10;

      const expected = {} as IssueOutput;
      issuesClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleGetIssueById(issueId, userId);

      // Assert
      expect(issuesClient.send).toHaveBeenCalled();
    });
  });

  describe('handlePatchIssue', () => {
    it('should update issue', async () => {
      // Arrange
      const issueId = 10;
      const userId = 10;
      const payload = {} as UpdateIssueInput;

      const expected = 9;
      issuesClient.send.mockReturnValue(of(expected));
      // Action
      await service.handlePatchIssue(issueId, userId, payload);

      // Assert
      expect(issuesClient.send).toHaveBeenCalled();
    });
  });
});
