import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import {
  COMMENT_CREATE,
  COMMENT_CREATED,
  COMMENT_DELETE,
  COMMENT_VIEW_ALL,
  COMMENT_VIEW_DETAIL,
  NOTIFICATION_MS,
} from 'src/common/constants';
import { CommentsService } from 'src/features/comments/comments.service';
import type {
  CommentOutput,
  CommentOutputPagination,
  NewCommentInput,
} from './comments.type';

@Controller()
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    @Inject(NOTIFICATION_MS) private readonly notificationsClient: ClientProxy,
  ) {}

  @MessagePattern(COMMENT_VIEW_DETAIL)
  async detail(
    @Payload('comment_id') commentId: number,
    @Payload('user_id') userId: number,
  ): Promise<CommentOutput> {
    return await this.commentsService.handleGetCommentById(commentId, userId);
  }

  @MessagePattern(COMMENT_DELETE)
  async delete(
    @Payload('comment_id') commentId: number,
    @Payload('user_id') userId: number,
  ): Promise<{
    id: number;
  }> {
    return await this.commentsService.handleDeleteComment(commentId, userId);
  }

  @MessagePattern(COMMENT_CREATE)
  async create(@Payload() data: NewCommentInput): Promise<number> {
    const result = await this.commentsService.handlePostComment(data);
    this.notificationsClient.emit(COMMENT_CREATED, result);
    return result.id;
  }

  @MessagePattern(COMMENT_VIEW_ALL)
  async all(
    @Payload('issue_id') issueId: number,
    @Payload('user_id') userId: number,
    @Payload('page') page?: number,
    @Payload('orderByDate') orderByDate?: 'ascending' | 'descending',
  ): Promise<CommentOutputPagination> {
    return await this.commentsService.handleGetAllComments(
      issueId,
      userId,
      page,
      orderByDate,
    );
  }
}
