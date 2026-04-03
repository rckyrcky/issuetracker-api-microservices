import { Controller } from '@nestjs/common';
import { IssueHistoriesService } from './issue-histories.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ISSUE_HISTORIES_VIEW } from 'src/common/constants';
import { IssueHistoriesCursorOutput } from './issue.histories.type';

@Controller()
export class IssueHistoriesController {
  constructor(private readonly issueHistoriesService: IssueHistoriesService) {}

  @MessagePattern(ISSUE_HISTORIES_VIEW)
  async history(
    @Payload('issue_id') issueId: number,
    @Payload('user_id') userId: number,
    @Payload('cursor') cursor?: number,
  ): Promise<IssueHistoriesCursorOutput> {
    return await this.issueHistoriesService.handleGetIssueHistories(
      issueId,
      userId,
      cursor,
    );
  }
}
