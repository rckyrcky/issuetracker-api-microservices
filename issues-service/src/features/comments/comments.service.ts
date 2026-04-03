/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable } from '@nestjs/common';
import {
  AuthorizationError,
  NotFoundError,
  ServerError,
} from 'src/common/exceptions';
import { IssueOutput } from '../issues/issues.type';
import {
  CommentOutput,
  CommentOutputPagination,
  NewCommentInput,
} from './comments.type';
import { generatePaginationData } from 'src/common/utils';
import {
  COMMENTS_REPOSITORY,
  ISSUES_REPOSITORY,
  PROJECT_CHECK_PERMISSION,
  PROJECT_MS,
  PROJECT_VIEW_DETAIL,
} from 'src/common/constants';
import type { ICommentsRepository } from './repository/interface.comments.repository';
import type { IIssuesRepository } from '../issues/repository/interface.issues.repository';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError, timeout } from 'rxjs';
@Injectable()
export class CommentsService {
  constructor(
    @Inject(COMMENTS_REPOSITORY)
    private readonly commentsRepository: ICommentsRepository,
    @Inject(ISSUES_REPOSITORY)
    private readonly issuesRepository: IIssuesRepository,
    @Inject(PROJECT_MS)
    private readonly projectsClient: ClientProxy,
  ) {}

  /**
   * Gets issue by issue ID
   * @param issueId
   */
  async getIssueById(issueId: number): Promise<IssueOutput[]> {
    const issue = await this.issuesRepository.getIssueById(issueId);
    if (issue.length === 0) {
      throw new NotFoundError();
    }
    return issue;
  }

  /**
   * Checks if project is already soft deleted
   * @param projectId
   */
  async isProjectSoftDeleted(
    projectId: number,
    userId: number,
  ): Promise<{ id: number }> {
    return await firstValueFrom(
      this.projectsClient
        .send<{ id: number }>(PROJECT_VIEW_DETAIL, {
          project_id: projectId,
          user_id: userId,
        })
        .pipe(
          timeout({ first: 5_000 }),
          catchError((err) => {
            if (err instanceof RpcException) {
              return throwError(() => err);
            }

            if (err?.statusCode) {
              return throwError(
                () =>
                  new RpcException({
                    statusCode: err.statusCode,
                    message: err.message,
                  }),
              );
            }

            return throwError(() => new ServerError());
          }),
        ),
    );
  }

  /**
   * Check user permission
   * @param projectId
   * @param userId
   * @returns
   */
  async checkUserPermission(
    projectId: number,
    userId: number,
  ): Promise<boolean> {
    return await firstValueFrom(
      this.projectsClient
        .send<boolean>(PROJECT_CHECK_PERMISSION, {
          project_id: projectId,
          user_id: userId,
        })
        .pipe(
          timeout({ first: 5_000 }),
          catchError((err) => {
            if (err instanceof RpcException) {
              return throwError(() => err);
            }

            if (err?.statusCode) {
              return throwError(
                () =>
                  new RpcException({
                    statusCode: err.statusCode,
                    message: err.message,
                  }),
              );
            }

            return throwError(() => new ServerError());
          }),
        ),
    );
  }

  async handlePostComment(comment: NewCommentInput): Promise<{
    id: number;
    user_id: number;
    user_name: string;
    actor_id: number;
    actor_name: string;
    issue_id: number;
    issue_title: string;
  }> {
    const issue = await this.getIssueById(comment.issue_id);

    await this.isProjectSoftDeleted(issue[0].project_id, comment.user_id);

    await this.checkUserPermission(issue[0].project_id, comment.user_id);

    const result = await this.commentsRepository.addComment(comment);

    return {
      id: result[0].id,
      actor_id: comment.user_id,
      actor_name: comment.user_name,
      issue_id: issue[0].id,
      issue_title: issue[0].title,
      user_id: issue[0].user_id,
      user_name: issue[0].user_name,
    };
  }

  async handleGetAllComments(
    issueId: number,
    userId: number,
    page: number = 1,
    orderByDate?: 'ascending' | 'descending',
  ): Promise<CommentOutputPagination> {
    const issue = await this.getIssueById(issueId);

    await this.isProjectSoftDeleted(issue[0].project_id, userId);

    await this.checkUserPermission(issue[0].project_id, userId);

    const [comments, total] = await Promise.all([
      this.commentsRepository.getAllCommentsByIssueId(
        issueId,
        page,
        orderByDate,
      ),
      this.commentsRepository.getTotalComments(issueId),
    ]);

    const { hasMorePage, limit, nextPage, totalPages } = generatePaginationData(
      total,
      page,
    );

    return {
      data: comments,
      pagination: { hasMorePage, nextPage, page, total, totalPages, limit },
    };
  }

  async handleGetCommentById(
    commentId: number,
    userId: number,
  ): Promise<CommentOutput> {
    const _comment = await this.commentsRepository.getCommentById(commentId);

    if (_comment.length === 0) {
      throw new NotFoundError();
    }

    const issue = await this.getIssueById(_comment[0].issue_id);

    await this.isProjectSoftDeleted(issue[0].project_id, userId);

    await this.checkUserPermission(issue[0].project_id, userId);

    return _comment[0];
  }

  async handleDeleteComment(
    commentId: number,
    userId: number,
  ): Promise<{ id: number }> {
    const _comment = await this.handleGetCommentById(commentId, userId);
    if (_comment.user_id !== userId) {
      throw new AuthorizationError();
    }

    const result = await this.commentsRepository.deleteComment(_comment.id);
    return result[0];
  }

  async updateUser(
    userId: number,
    userName: string,
    updatedAt: string,
  ): Promise<void> {
    await this.commentsRepository.updateUserData(userId, userName, updatedAt);
  }
}
