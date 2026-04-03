import { DrizzleService } from 'src/services/databases/drizzle/drizzle.service';
import { ICommentsRepository } from './interface.comments.repository';
import type ILoggingService from 'src/common/interfaces/logging.interface';
import { Inject, Injectable } from '@nestjs/common';
import { CommentOutput, NewCommentInput } from '../comments.type';
import { comments } from 'src/services/databases/drizzle/schema/schema';
import { generateErrorLogMessage, isPostgreError } from 'src/common/utils';
import {
  postgreErrorCode,
  ServerError,
  UserError,
} from 'src/common/exceptions';
import { and, asc, count, desc, DrizzleQueryError, eq, lt } from 'drizzle-orm';
import {
  ISSUE_HISTORIES_REPOSITORY,
  LOGGING_SERVICE,
} from 'src/common/constants';
import type { IIssueHistoriesRepository } from 'src/features/issues-histories/repository/interface.issue.histories.repository';

@Injectable()
export class DrizzleCommentsRepository implements ICommentsRepository {
  constructor(
    private readonly drizzleService: DrizzleService,
    @Inject(ISSUE_HISTORIES_REPOSITORY)
    private readonly issueHistoriesRepository: IIssueHistoriesRepository,
    @Inject(LOGGING_SERVICE)
    private readonly loggingService: ILoggingService,
  ) {}

  private readonly service = this.constructor.name;

  async addComment(comment: NewCommentInput): Promise<{ id: number }[]> {
    try {
      const result = await this.drizzleService.db().transaction(async (txn) => {
        const res = await txn
          .insert(comments)
          .values({
            content: comment.content,
            issueId: comment.issue_id,
            userId: comment.user_id,
            userName: comment.user_name,
          })
          .returning({ id: comments.id });

        await this.issueHistoriesRepository.addIssueHistory(
          {
            issue_id: comment.issue_id,
            user_id: comment.user_id,
            type: 'add_comment',
            user_name: comment.user_name,
          },
          txn,
        );

        return res;
      });

      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to add comment', error),
        {
          error,
          method: this.addComment.name,
          service: this.service,
        },
      );
      if (
        isPostgreError(
          (error as DrizzleQueryError).cause,
          postgreErrorCode.foreignKey,
        )
      ) {
        throw new UserError();
      }
      throw new ServerError();
    }
  }

  async getAllCommentsByIssueId(
    issueId: number,
    page: number = 1,
    orderByDate?: 'ascending' | 'descending',
  ): Promise<CommentOutput[]> {
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
      const result = await this.drizzleService
        .db()
        .select({
          id: comments.id,
          content: comments.content,
          issue_id: comments.issueId,
          user_id: comments.userId,
          user_name: comments.userName,
          created_at: comments.createdAt,
        })
        .from(comments)
        .where(eq(comments.issueId, issueId))
        .orderBy(
          orderByDate === 'descending'
            ? desc(comments.createdAt)
            : asc(comments.createdAt),
        )
        .limit(limit)
        .offset(offset);
      return result as CommentOutput[];
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to get all comments', error),
        {
          error,
          method: this.getAllCommentsByIssueId.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }

  async getTotalComments(issueId: number): Promise<number> {
    try {
      const result = await this.drizzleService
        .db()
        .select({ count: count() })
        .from(comments)
        .where(eq(comments.issueId, issueId));

      return result[0].count;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to get total comments', error),
        {
          error,
          method: this.getTotalComments.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }

  async getCommentById(commentId: number): Promise<CommentOutput[]> {
    try {
      const result = await this.drizzleService
        .db()
        .select({
          id: comments.id,
          content: comments.content,
          issue_id: comments.issueId,
          user_id: comments.userId,
          created_at: comments.createdAt,
        })
        .from(comments)
        .where(eq(comments.id, commentId));
      return result as CommentOutput[];
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to get comment by id', error),
        {
          error,
          method: this.getCommentById.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }

  async deleteComment(commentId: number): Promise<{ id: number }[]> {
    try {
      const result = await this.drizzleService
        .db()
        .delete(comments)
        .where(eq(comments.id, commentId))
        .returning({ id: comments.id });
      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to delete comment', error),
        {
          error,
          method: this.deleteComment.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }

  async updateUserData(
    userId: number,
    userName: string,
    updatedAt: string,
  ): Promise<void> {
    try {
      const result = await this.drizzleService
        .db()
        .update(comments)
        .set({ userName, lastEventUpdatedAt: updatedAt })
        .where(
          and(
            eq(comments.userId, userId),
            lt(comments.lastEventUpdatedAt, updatedAt),
          ),
        )
        .returning({ id: comments.id });

      if (result.length !== 0) {
        this.loggingService.info('Update user data on comment success', {
          method: this.updateUserData.name,
          service: this.service,
          commentId: result[0].id,
        });
      } else {
        this.loggingService.info('Skip update user data on comment', {
          method: this.updateUserData.name,
          service: this.service,
        });
      }

      return;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to update user data', error),
        {
          error,
          method: this.updateUserData.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }
}
