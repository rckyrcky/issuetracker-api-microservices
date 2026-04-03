/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { EventController } from './events.controller';
import { IssuesService } from '../issues/issues.service';
import { CommentsService } from '../comments/comments.service';
import { IssueHistoriesService } from '../issues-histories/issue-histories.service';

describe('EventController', () => {
  let controller: EventController;
  let issuesService: jest.Mocked<IssuesService>;
  let commentsService: jest.Mocked<CommentsService>;
  let issueHistoriesService: jest.Mocked<IssueHistoriesService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: IssuesService,
          useValue: {
            updateUser: jest.fn(),
          },
        },
        {
          provide: CommentsService,
          useValue: {
            updateUser: jest.fn(),
          },
        },
        {
          provide: IssueHistoriesService,
          useValue: {
            updateUser: jest.fn(),
          },
        },
      ],
      controllers: [EventController],
    }).compile();

    issueHistoriesService = moduleRef.get(IssueHistoriesService);
    commentsService = moduleRef.get(CommentsService);
    issuesService = moduleRef.get(IssuesService);
    controller = moduleRef.get(EventController);
  });

  describe('updateUser', () => {
    it('should update users correctly', async () => {
      // Arrange
      const payload = {
        id: 1,
        name: 'john',
        updatedAt: new Date().toISOString(),
      };
      issueHistoriesService.updateUser.mockResolvedValue();
      commentsService.updateUser.mockResolvedValue();
      issuesService.updateUser.mockResolvedValue();

      // Action
      await controller.updateUser(payload.id, payload.name, payload.updatedAt);

      // Assert
      expect(issueHistoriesService.updateUser).toHaveBeenCalledWith(
        payload.id,
        payload.name,
        payload.updatedAt,
      );
      expect(commentsService.updateUser).toHaveBeenCalledWith(
        payload.id,
        payload.name,
        payload.updatedAt,
      );
      expect(issuesService.updateUser).toHaveBeenCalledWith(
        payload.id,
        payload.name,
        payload.updatedAt,
      );
    });
  });
});
