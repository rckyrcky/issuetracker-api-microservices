import { Inject, Injectable } from '@nestjs/common';
import {
  CommentOutput,
  CommentOutputPagination,
  NewCommentInput,
} from './comments.type';
import {
  COMMENT_CREATE,
  COMMENT_DELETE,
  COMMENT_VIEW_ALL,
  COMMENT_VIEW_DETAIL,
  ISSUE_MS,
  USER_MS,
  USER_VIEW_PROFILE,
} from 'src/common/constants';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { NewCommentInputDto } from './comments.dto';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(ISSUE_MS) private readonly issuesClient: ClientProxy,
    @Inject(USER_MS) private readonly usersClient: ClientProxy,
  ) {}

  async handlePostComment(
    comment: NewCommentInputDto,
    issueId: number,
    userId: number,
  ): Promise<number> {
    const { name } = await firstValueFrom(
      this.usersClient
        .send<{
          id: number;
          name: string;
          email: string;
        }>(USER_VIEW_PROFILE, userId)
        .pipe(timeout({ first: 5_000 })),
    );

    const payload: NewCommentInput = {
      content: comment.content,
      issue_id: issueId,
      user_id: userId,
      user_name: name,
    };

    return await firstValueFrom(
      this.issuesClient
        .send<number>(COMMENT_CREATE, payload)
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handleGetAllComments(
    issueId: number,
    userId: number,
    page: number = 1,
    orderByDate?: 'ascending' | 'descending',
  ): Promise<CommentOutputPagination> {
    return await firstValueFrom(
      this.issuesClient
        .send<CommentOutputPagination>(COMMENT_VIEW_ALL, {
          issue_id: issueId,
          user_id: userId,
          page,
          orderByDate,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handleGetCommentById(
    commentId: number,
    userId: number,
  ): Promise<CommentOutput> {
    return await firstValueFrom(
      this.issuesClient
        .send<CommentOutput>(COMMENT_VIEW_DETAIL, {
          comment_id: commentId,
          user_id: userId,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handleDeleteComment(
    commentId: number,
    userId: number,
  ): Promise<{ id: number }> {
    return await firstValueFrom(
      this.issuesClient
        .send<{ id: number }>(COMMENT_DELETE, {
          comment_id: commentId,
          user_id: userId,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }
}
