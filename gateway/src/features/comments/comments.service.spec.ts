/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';
import { ISSUE_MS, USER_MS } from 'src/common/constants';
import { of } from 'rxjs';
import { CommentsService } from './comments.service';
import { NewCommentInputDto } from './comments.dto';
import { CommentOutput, CommentOutputPagination } from './comments.type';

describe('CommentsService', () => {
  let service: CommentsService;
  let issuesClient: jest.Mocked<ClientProxy>;
  let usersClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
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

    service = module.get(CommentsService);
    issuesClient = module.get(ISSUE_MS);
    usersClient = module.get(USER_MS);
  });

  describe('handlePostComment', () => {
    it('should post comment correctly)', async () => {
      // Arrange
      const payload = {} as NewCommentInputDto;
      const issueId = 1;
      const userId = 2;

      const expected = 2;
      usersClient.send.mockReturnValueOnce(
        of({
          name: 'alice',
        }),
      );
      issuesClient.send.mockReturnValue(of(expected));
      // Action
      await service.handlePostComment(payload, issueId, userId);

      // Assert
      expect(issuesClient.send).toHaveBeenCalled();
      expect(usersClient.send).toHaveBeenCalled();
    });
  });

  describe('handleGetAllComments', () => {
    it('should return all comments correctly', async () => {
      // Arrange
      const userId = 10;
      const issueId = 2;

      const expected = {} as CommentOutputPagination;
      issuesClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleGetAllComments(issueId, userId);

      // Assert
      expect(issuesClient.send).toHaveBeenCalled();
    });
  });

  describe('handleGetCommentById', () => {
    it('should return comments by id', async () => {
      // Arrange
      const commentId = 10;
      const userId = 10;

      const expected = {} as CommentOutput;
      issuesClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleGetCommentById(commentId, userId);

      // Assert
      expect(issuesClient.send).toHaveBeenCalled();
    });
  });

  describe('handleDeleteComment', () => {
    it('should delete comment', async () => {
      // Arrange
      const commentId = 10;
      const userId = 10;

      const expected = 9;
      issuesClient.send.mockReturnValue(of(expected));
      // Action
      await service.handleDeleteComment(commentId, userId);

      // Assert
      expect(issuesClient.send).toHaveBeenCalled();
    });
  });
});
