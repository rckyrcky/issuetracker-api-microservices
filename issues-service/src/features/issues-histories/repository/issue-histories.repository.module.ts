import { Module } from '@nestjs/common';
import { DrizzleIssueHistoriesRepository } from './drizzle.issue.histories.repository';
import { ISSUE_HISTORIES_REPOSITORY } from 'src/common/constants';

@Module({
  providers: [
    {
      provide: ISSUE_HISTORIES_REPOSITORY,
      useClass: DrizzleIssueHistoriesRepository,
    },
  ],
  exports: [ISSUE_HISTORIES_REPOSITORY],
})
export class IssueHistoriesRepositoryModule {}
