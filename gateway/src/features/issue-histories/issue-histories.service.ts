import { Inject, Injectable } from '@nestjs/common';
import { IssueHistoriesCursorOutput } from './issue.histories.type';
import { ISSUE_HISTORIES_VIEW, ISSUE_MS } from 'src/common/constants';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class IssueHistoriesService {
  constructor(
    @Inject(ISSUE_MS)
    private readonly issuesClient: ClientProxy,
  ) {}

  async handleGetIssueHistories(
    issueId: number,
    userId: number,
    cursor?: number,
  ): Promise<IssueHistoriesCursorOutput> {
    return await firstValueFrom(
      this.issuesClient
        .send<IssueHistoriesCursorOutput>(ISSUE_HISTORIES_VIEW, {
          issue_id: issueId,
          user_id: userId,
          cursor,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }
}
