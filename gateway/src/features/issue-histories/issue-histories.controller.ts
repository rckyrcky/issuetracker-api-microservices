import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ParamsDto } from 'src/common/dto/params.dto';
import { QueryDto } from 'src/common/dto/query.dto';
import { CustomSuccessMessages } from 'src/common/messages';
import { type AuthRequest } from 'src/common/types/request.type';
import { IssueHistoriesService } from 'src/features/issue-histories/issue-histories.service';

@ApiTags('Issue Histories')
@Controller()
export class IssueHistoriesController {
  constructor(private readonly issueHistoriesService: IssueHistoriesService) {}

  @Get('projects/issues/:issue_id/history')
  async history(
    @Req() req: AuthRequest,
    @Query() query: QueryDto,
    @Param() params: ParamsDto,
  ) {
    const data = await this.issueHistoriesService.handleGetIssueHistories(
      params.issue_id!,
      req.authData!.id!,
      query.cursor,
    );

    return {
      message: CustomSuccessMessages.fetch,
      data,
    };
  }
}
