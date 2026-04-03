/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from 'src/features/comments/comments.service';
import { CustomSuccessMessages } from 'src/common/messages';
import { AuthRequest } from 'src/common/types/request.type';
import {
  CommentOutput,
  CommentOutputPagination,
} from 'src/features/comments/comments.type';
import { QueryDto } from 'src/common/dto/query.dto';
import { CommentsController } from './comments.controller';

describe('CommentsController', () => {
  let controller: CommentsController;
  let commentsServiceMock: jest.Mocked<CommentsService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
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
      ],
    }).compile();

    controller = module.get(CommentsController);
    commentsServiceMock = module.get(CommentsService);
  });

  describe('detail', () => {
    it('should return fetch message and comment data', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { comment_id: 99 };

      const data = {
        id: 99,
        issue_id: 1,
        user_id: 10,
        content: 'hi',
      } as CommentOutput;
      commentsServiceMock.handleGetCommentById.mockResolvedValue(data);

      // Action
      const result = await controller.detail(req, params);

      // Assert
      expect(commentsServiceMock.handleGetCommentById).toHaveBeenCalledWith(
        99,
        10,
      );
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data,
      });
    });
  });

  describe('delete', () => {
    it('should return delete message and data', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { comment_id: 99 };

      const data = { id: 99 };
      commentsServiceMock.handleDeleteComment.mockResolvedValue(data);

      // Action
      const result = await controller.delete(req, params);

      // Assert
      expect(commentsServiceMock.handleDeleteComment).toHaveBeenCalledWith(
        99,
        10,
      );
      expect(result).toEqual({
        message: CustomSuccessMessages.comments.delete,
        data,
      });
    });
  });

  describe('create', () => {
    it('should call handlePostComment with payload + issue_id + user_id and return post message', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { issue_id: 7 };
      const payload = { content: 'hello' };

      commentsServiceMock.handlePostComment.mockResolvedValue(123);

      // Action
      const result = await controller.create(payload, req, params);

      // Assert
      expect(commentsServiceMock.handlePostComment).toHaveBeenCalledWith(
        payload,
        7,
        10,
      );
      expect(result).toEqual({
        message: CustomSuccessMessages.comments.post,
        data: { id: 123 },
      });
    });
  });

  describe('all', () => {
    it('should return fetch message and comments data', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { issue_id: 7 };
      const query = { page: 2, orderByDate: 'descending' } as QueryDto;

      const data = {
        data: [{ id: 1 }],
        pagination: {
          hasMorePage: true,
          nextPage: 3,
          page: 2,
          total: 25,
          totalPages: 3,
          limit: 10,
        },
      } as CommentOutputPagination;

      commentsServiceMock.handleGetAllComments.mockResolvedValue(data);

      // Action
      const result = await controller.all(req, params, query);

      // Assert
      expect(commentsServiceMock.handleGetAllComments).toHaveBeenCalledWith(
        7,
        10,
        2,
        'descending',
      );
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data,
      });
    });

    it('should pass undefined page/orderByDate when not provided', async () => {
      // Arrange
      const req = { authData: { id: 10 } } as AuthRequest;
      const params = { issue_id: 7 };
      const query = {};

      const data = {
        data: [],
        pagination: {
          hasMorePage: false,
          nextPage: null,
          page: 1,
          total: 0,
          totalPages: 0,
          limit: 10,
        },
      };

      commentsServiceMock.handleGetAllComments.mockResolvedValue(data);

      // Action
      const result = await controller.all(req, params, query);

      // Assert
      expect(commentsServiceMock.handleGetAllComments).toHaveBeenCalledWith(
        7,
        10,
        undefined,
        undefined,
      );
      expect(result).toEqual({
        message: CustomSuccessMessages.fetch,
        data,
      });
    });
  });
});
