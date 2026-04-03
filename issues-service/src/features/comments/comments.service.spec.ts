/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';

import { AuthorizationError, NotFoundError } from 'src/common/exceptions';
import { generatePaginationData } from 'src/common/utils';

import { type ICommentsRepository } from './repository/interface.comments.repository';
import { type IIssuesRepository } from '../issues/repository/interface.issues.repository';
import { type IssueOutput } from '../issues/issues.type';
import { CommentOutput, type NewCommentInput } from './comments.type';
import { ClientProxy } from '@nestjs/microservices';
import {
  COMMENTS_REPOSITORY,
  ISSUES_REPOSITORY,
  PROJECT_MS,
} from 'src/common/constants';
import { of, throwError } from 'rxjs';

jest.mock('src/common/utils', () => ({
  generatePaginationData: jest.fn(),
}));

describe('CommentsService', () => {
  let service: CommentsService;
  let commentsRepositoryMock: jest.Mocked<ICommentsRepository>;
  let issuesRepositoryMock: jest.Mocked<IIssuesRepository>;
  let projectsClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: COMMENTS_REPOSITORY,
          useValue: {
            addComment: jest.fn(),
            getAllCommentsByIssueId: jest.fn(),
            getTotalComments: jest.fn(),
            getCommentById: jest.fn(),
            deleteComment: jest.fn(),
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

    service = module.get(CommentsService);

    commentsRepositoryMock = module.get(COMMENTS_REPOSITORY);
    issuesRepositoryMock = module.get(ISSUES_REPOSITORY);
    projectsClient = module.get(PROJECT_MS);
  });

  describe('getIssueById', () => {
    it('should return issue when found', async () => {
      // Arrange
      const issueId = 1;
      const issue = [{ id: issueId } as IssueOutput];
      issuesRepositoryMock.getIssueById.mockResolvedValue(issue);

      // Action
      const result = await service.getIssueById(issueId);

      // Assert
      expect(issuesRepositoryMock.getIssueById).toHaveBeenCalledWith(issueId);
      expect(result).toEqual(issue);
    });

    it('should throw NotFoundError when issue not found', async () => {
      // Arrange
      const issueId = 1;
      issuesRepositoryMock.getIssueById.mockResolvedValue([]);

      // Action
      const action = () => service.getIssueById(issueId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('isProjectSoftDeleted', () => {
    it('should not throw when project is not soft deleted', async () => {
      // Arrange
      const projectId = 1;
      const userId = 2;
      projectsClient.send.mockReturnValue(of(undefined));

      // Action
      const result = service.isProjectSoftDeleted(projectId, userId);

      // Assert
      await expect(result).resolves.toBeUndefined();
      expect(projectsClient.send).toHaveBeenCalled();
    });

    it('should throw NotFoundError when project is soft deleted', async () => {
      // Arrange
      const projectId = 1;
      const userId = 2;
      projectsClient.send.mockReturnValue(
        throwError(() => new NotFoundError()),
      );

      // Action
      const action = () => service.isProjectSoftDeleted(projectId, userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('handlePostComment', () => {
    it('should return new comment id when success', async () => {
      // Arrange
      const userId = 10;
      const comment: NewCommentInput = {
        issue_id: 1,
        content: 'hi',
        user_id: userId,
        user_name: 'alice',
      };

      const issue = [
        { id: 1, project_id: 99, user_id: 77, title: 'Issue A' } as any,
      ] as IssueOutput[];

      issuesRepositoryMock.getIssueById.mockResolvedValue(issue);
      projectsClient.send.mockReturnValue(of(undefined));
      projectsClient.send.mockReturnValue(of(undefined));

      commentsRepositoryMock.addComment.mockResolvedValue([{ id: 555 } as any]);

      // Action
      const result = await service.handlePostComment(comment);

      // Assert
      expect(issuesRepositoryMock.getIssueById).toHaveBeenCalledWith(
        comment.issue_id,
      );
      expect(projectsClient.send).toHaveBeenCalledTimes(2);
      expect(commentsRepositoryMock.addComment).toHaveBeenCalledWith(comment);
      expect(result.id).toBe(555);
    });

    it('should throw NotFoundError when issue not found', async () => {
      // Arrange
      const userId = 10;
      const comment: NewCommentInput = {
        issue_id: 1,
        content: 'hi',
        user_id: userId,
        user_name: 'alice',
      };
      issuesRepositoryMock.getIssueById.mockResolvedValue([]);

      // Action
      const action = () => service.handlePostComment(comment);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
      expect(projectsClient.send).not.toHaveBeenCalled();
      expect(commentsRepositoryMock.addComment).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when project is soft deleted', async () => {
      // Arrange
      const userId = 10;
      const comment: NewCommentInput = {
        issue_id: 1,
        content: 'hi',
        user_id: userId,
        user_name: 'alice',
      };

      const issue = [
        { id: 1, project_id: 99, user_id: 77, title: 'Issue A' } as any,
      ] as IssueOutput[];

      issuesRepositoryMock.getIssueById.mockResolvedValue(issue);
      projectsClient.send.mockReturnValueOnce(
        throwError(() => new NotFoundError()),
      );

      // Action
      const action = () => service.handlePostComment(comment);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
      expect(projectsClient.send).toHaveBeenCalledTimes(1);
      expect(projectsClient.send).not.toHaveBeenCalledTimes(2);
      expect(commentsRepositoryMock.addComment).not.toHaveBeenCalled();
    });
  });

  describe('handleGetAllComments', () => {
    it('should return comments with pagination (with orderByDate)', async () => {
      // Arrange
      const issueId = 1;
      const userId = 10;
      const page = 2;
      const orderByDate = 'descending' as const;

      const issue = [
        { id: issueId, project_id: 99, user_id: 77, title: 'Issue A' } as any,
      ] as IssueOutput[];

      const comments = [{ id: 1 } as any, { id: 2 } as any];
      const total = 25;

      issuesRepositoryMock.getIssueById.mockResolvedValue(issue);
      projectsClient.send.mockReturnValueOnce(of(undefined));
      projectsClient.send.mockReturnValueOnce(of(undefined));

      commentsRepositoryMock.getAllCommentsByIssueId.mockResolvedValue(
        comments,
      );
      commentsRepositoryMock.getTotalComments.mockResolvedValue(total);

      (generatePaginationData as jest.Mock).mockReturnValue({
        hasMorePage: true,
        limit: 10,
        nextPage: 3,
        totalPages: 3,
      });

      // Action
      const result = await service.handleGetAllComments(
        issueId,
        userId,
        page,
        orderByDate,
      );

      // Assert
      expect(issuesRepositoryMock.getIssueById).toHaveBeenCalledWith(issueId);
      expect(projectsClient.send).toHaveBeenCalledTimes(2);
      expect(
        commentsRepositoryMock.getAllCommentsByIssueId,
      ).toHaveBeenCalledWith(issueId, page, orderByDate);
      expect(commentsRepositoryMock.getTotalComments).toHaveBeenCalledWith(
        issueId,
      );
      expect(generatePaginationData).toHaveBeenCalledWith(total, page);
      expect(result).toEqual({
        data: comments,
        pagination: {
          hasMorePage: true,
          nextPage: 3,
          page,
          total,
          totalPages: 3,
          limit: 10,
        },
      });
    });

    it('should default page = 1 when not provided', async () => {
      // Arrange
      const issueId = 1;
      const userId = 10;

      const issue = [
        { id: issueId, project_id: 99, user_id: 77, title: 'Issue A' } as any,
      ] as IssueOutput[];

      issuesRepositoryMock.getIssueById.mockResolvedValue(issue);
      projectsClient.send.mockReturnValueOnce(of(undefined));
      projectsClient.send.mockReturnValueOnce(of(undefined));

      commentsRepositoryMock.getAllCommentsByIssueId.mockResolvedValue([]);
      commentsRepositoryMock.getTotalComments.mockResolvedValue(0);

      (generatePaginationData as jest.Mock).mockReturnValue({
        hasMorePage: false,
        limit: 10,
        nextPage: null,
        totalPages: 0,
      });

      // Action
      const result = await service.handleGetAllComments(issueId, userId);

      // Assert
      expect(
        commentsRepositoryMock.getAllCommentsByIssueId,
      ).toHaveBeenCalledWith(issueId, 1, undefined);
      expect(generatePaginationData).toHaveBeenCalledWith(0, 1);
      expect(result.pagination.page).toBe(1);
    });
  });

  describe('handleGetCommentById', () => {
    it('should return comment when success', async () => {
      // Arrange
      const commentId = 1;
      const userId = 10;

      const comment = [{ id: commentId, issue_id: 7, user_id: 10 } as any];
      const issue = [
        { id: 7, project_id: 99, user_id: 77, title: 'Issue A' } as any,
      ] as IssueOutput[];

      commentsRepositoryMock.getCommentById.mockResolvedValue(comment);
      issuesRepositoryMock.getIssueById.mockResolvedValue(issue);
      projectsClient.send.mockReturnValueOnce(of(undefined));
      projectsClient.send.mockReturnValueOnce(of(undefined));

      // Action
      const result = await service.handleGetCommentById(commentId, userId);

      // Assert
      expect(commentsRepositoryMock.getCommentById).toHaveBeenCalledWith(
        commentId,
      );
      expect(issuesRepositoryMock.getIssueById).toHaveBeenCalledWith(7);
      expect(projectsClient.send).toHaveBeenCalledTimes(2);

      expect(result).toEqual(comment[0]);
    });

    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentId = 1;
      const userId = 10;

      commentsRepositoryMock.getCommentById.mockResolvedValue([]);

      // Action
      const action = () => service.handleGetCommentById(commentId, userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(NotFoundError);
      expect(issuesRepositoryMock.getIssueById).not.toHaveBeenCalled();
      expect(projectsClient.send).not.toHaveBeenCalled();
    });
  });

  describe('handleDeleteComment', () => {
    it('should delete comment when comment owner matches userId', async () => {
      // Arrange
      const commentId = 1;
      const userId = 10;

      const comment: CommentOutput = {
        id: commentId,
        issue_id: 7,
        user_id: userId,
        content: 'hi',
        created_at: '',
        user_name: 'alice',
      };
      const issue = [
        { id: 7, project_id: 99, user_id: 77, title: 'Issue A' } as any,
      ] as IssueOutput[];

      commentsRepositoryMock.getCommentById.mockResolvedValue([comment]);
      issuesRepositoryMock.getIssueById.mockResolvedValue(issue);
      projectsClient.send.mockReturnValueOnce(of(undefined));
      projectsClient.send.mockReturnValueOnce(of(undefined));
      commentsRepositoryMock.deleteComment.mockResolvedValue([
        { id: commentId } as any,
      ]);

      // Action
      const result = await service.handleDeleteComment(commentId, userId);

      // Assert
      expect(commentsRepositoryMock.deleteComment).toHaveBeenCalledWith(
        commentId,
      );
      expect(result).toEqual({ id: commentId });
    });

    it('should throw AuthorizationError when comment owner differs from userId', async () => {
      // Arrange
      const commentId = 1;
      const userId = 10;

      const comment: CommentOutput = {
        id: commentId,
        issue_id: 7,
        user_id: 999,
        content: 'hi',
        created_at: '',
        user_name: 'alice',
      };
      const issue = [
        { id: 7, project_id: 99, user_id: 77, title: 'Issue A' } as any,
      ] as IssueOutput[];

      commentsRepositoryMock.getCommentById.mockResolvedValue([comment]);
      issuesRepositoryMock.getIssueById.mockResolvedValue(issue);
      projectsClient.send.mockReturnValueOnce(of(undefined));
      projectsClient.send.mockReturnValueOnce(of(undefined));

      // Action
      const action = () => service.handleDeleteComment(commentId, userId);

      // Assert
      await expect(action()).rejects.toBeInstanceOf(AuthorizationError);
      expect(commentsRepositoryMock.deleteComment).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('should update users correctly', async () => {
      // Arrange
      const payload = {
        userId: 1,
        userName: 'john',
        updatedAt: new Date().toISOString(),
      };
      commentsRepositoryMock.updateUserData.mockResolvedValue();

      // Action
      await service.updateUser(
        payload.userId,
        payload.userName,
        payload.updatedAt,
      );

      // Assert
      expect(commentsRepositoryMock.updateUserData).toHaveBeenCalled();
    });
  });
});
