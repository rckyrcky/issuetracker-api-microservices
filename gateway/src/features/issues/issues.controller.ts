import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ParamsDto } from 'src/common/dto/params.dto';
import { QueryDto } from 'src/common/dto/query.dto';
import { CustomSuccessMessages } from 'src/common/messages';
import { type AuthRequest } from 'src/common/types/request.type';
import {
  NewIssueInputDto,
  UpdateIssueInputDto,
} from 'src/features/issues/issues.dto';
import { IssuesService } from 'src/features/issues/issues.service';

@ApiTags('Issues')
@Controller()
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Get('projects/issues/:issue_id')
  async detail(@Param() params: ParamsDto, @Req() req: AuthRequest) {
    const data = await this.issuesService.handleGetIssueById(
      params.issue_id!,
      req.authData!.id!,
    );

    return {
      message: CustomSuccessMessages.fetch,
      data,
    };
  }

  @Patch('projects/issues/:issue_id')
  async update(
    @Param() params: ParamsDto,
    @Req() req: AuthRequest,
    @Body() payload: UpdateIssueInputDto,
  ) {
    const id = await this.issuesService.handlePatchIssue(
      params.issue_id!,
      req.authData!.id!,
      payload,
    );

    return {
      message: CustomSuccessMessages.issues.patch,
      data: {
        id,
      },
    };
  }

  @Post('projects/:project_id/issues')
  async create(
    @Body() payload: NewIssueInputDto,
    @Param() params: ParamsDto,
    @Req() req: AuthRequest,
  ) {
    const id = await this.issuesService.handlePostIssue(
      payload,
      params.project_id!,
      req.authData!.id!,
    );

    return {
      message: CustomSuccessMessages.issues.post,
      data: {
        id,
      },
    };
  }

  @Get('projects/:project_id/issues')
  async all(
    @Query() query: QueryDto,
    @Param() params: ParamsDto,
    @Req() req: AuthRequest,
  ) {
    const data = await this.issuesService.handleGetAllIssues(
      params.project_id!,
      req.authData!.id!,
      query.page,
      query.status,
      query.priority,
    );
    return {
      message: CustomSuccessMessages.fetch,
      data,
    };
  }
}
