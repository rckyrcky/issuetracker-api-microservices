import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { USER_CHANGED } from 'src/common/constants';
import { IssuesService } from '../issues/issues.service';
import { CommentsService } from '../comments/comments.service';
import { IssueHistoriesService } from '../issues-histories/issue-histories.service';

@Controller()
export class EventController {
  constructor(
    private readonly issuesService: IssuesService,
    private readonly commentsService: CommentsService,
    private readonly issueHistoriesService: IssueHistoriesService,
  ) {}

  @EventPattern(USER_CHANGED)
  async updateUser(
    @Payload('id') userId: number,
    @Payload('name') userName: string,
    @Payload('updatedAt') updatedAt: string,
  ) {
    await Promise.all([
      this.commentsService.updateUser(userId, userName, updatedAt),
      this.issuesService.updateUser(userId, userName, updatedAt),
      this.issueHistoriesService.updateUser(userId, userName, updatedAt),
    ]);
  }
}
