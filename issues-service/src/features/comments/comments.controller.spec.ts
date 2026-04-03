/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import {
  CommentOutput,
  CommentOutputPagination,
  NewCommentInput,
} from './comments.type';
import { ClientProxy } from '@nestjs/microservices';
import { NOTIFICATION_MS } from 'src/common/constants';

describe('CommentsController', () => {
  let commentsController: CommentsController;
  let commentsService: jest.Mocked<CommentsService>;
  let notificationsClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: CommentsService,
          useValue: {
            handleGetCommentById: jest.fn(),
            handleDeleteComment: jest.fn(),
            handlePostComment: jest.fn(),
            handleGetAllComments: jest.fn(),
          },
        },
        {
          provide: NOTIFICATION_MS,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
      controllers: [CommentsController],
    }).compile();

    commentsService = moduleRef.get(CommentsService);
    commentsController = moduleRef.get(CommentsController);
    notificationsClient = moduleRef.get(NOTIFICATION_MS);
  });

  describe('detail', () => {
    it('should return comment detail correctly', async () => {
      // Arrange
      const commentId = 1;
      const userId = 2;
      const expected = {} as CommentOutput;
      commentsService.handleGetCommentById.mockResolvedValue(expected);

      // Action
      const result = await commentsController.detail(commentId, userId);

      // Assert
      expect(result).toStrictEqual(expected);
    });
  });

  describe('delete', () => {
    it('should delete comments correctly', async () => {
      // Arrange
      const commentId = 1;
      const userId = 2;
      commentsService.handleDeleteComment.mockResolvedValue({ id: 1 });

      // Action
      const result = await commentsController.delete(commentId, userId);

      // Assert
      expect(commentsService.handleDeleteComment).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });
  });

  describe('create', () => {
    it('should create comments correctly', async () => {
      // Arrange
      const payload = {} as NewCommentInput;
      commentsService.handlePostComment.mockResolvedValue({
        id: 2,
        actor_id: 3,
        actor_name: 'bob',
        issue_id: 2,
        issue_title: 'dark mode',
        user_id: 1,
        user_name: 'john',
      });

      // Action
      const result = await commentsController.create(payload);

      // Assert
      expect(commentsService.handlePostComment).toHaveBeenCalled();
      expect(result).toBe(2);
      expect(notificationsClient.emit).toHaveBeenCalled();
    });
  });

  describe('all', () => {
    it('should return all comments correctly', async () => {
      // Arrange
      const issueId = 99;
      const userId = 10;
      const expected = {} as CommentOutputPagination;
      commentsService.handleGetAllComments.mockResolvedValue(expected);

      // Action
      const result = await commentsController.all(issueId, userId);

      // Assert
      expect(commentsService.handleGetAllComments).toHaveBeenCalled();
      expect(result).toStrictEqual(expected);
    });
  });
});
