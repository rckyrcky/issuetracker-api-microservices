import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ParamsDto } from 'src/common/dto/params.dto';
import { QueryDto } from 'src/common/dto/query.dto';
import { CustomSuccessMessages } from 'src/common/messages';
import { type AuthRequest } from 'src/common/types/request.type';
import { NewCommentInputDto } from 'src/features/comments/comments.dto';
import { CommentsService } from 'src/features/comments/comments.service';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('projects/issues/comments/:comment_id')
  async detail(@Req() req: AuthRequest, @Param() params: ParamsDto) {
    const data = await this.commentsService.handleGetCommentById(
      params.comment_id!,
      req.authData!.id!,
    );

    return {
      message: CustomSuccessMessages.fetch,
      data,
    };
  }

  @Delete('projects/issues/comments/:comment_id')
  async delete(@Req() req: AuthRequest, @Param() params: ParamsDto) {
    const data = await this.commentsService.handleDeleteComment(
      params.comment_id!,
      req.authData!.id!,
    );

    return {
      message: CustomSuccessMessages.comments.delete,
      data,
    };
  }

  @Post('projects/issues/:issue_id/comments')
  async create(
    @Body() payload: NewCommentInputDto,
    @Req() req: AuthRequest,
    @Param() params: ParamsDto,
  ) {
    const id = await this.commentsService.handlePostComment(
      payload,
      params.issue_id!,
      req.authData!.id!,
    );

    return {
      message: CustomSuccessMessages.comments.post,
      data: {
        id,
      },
    };
  }

  @Get('projects/issues/:issue_id/comments')
  async all(
    @Req() req: AuthRequest,
    @Param() params: ParamsDto,
    @Query() query: QueryDto,
  ) {
    const data = await this.commentsService.handleGetAllComments(
      params.issue_id!,
      req.authData!.id!,
      query.page,
      query.orderByDate,
    );

    return {
      message: CustomSuccessMessages.fetch,
      data,
    };
  }
}
