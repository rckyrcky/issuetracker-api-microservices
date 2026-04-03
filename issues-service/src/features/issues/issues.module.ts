import { Module } from '@nestjs/common';
import { RmqModule } from 'src/services/broker/rmq.module';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';
import { ISSUES_REPOSITORY } from 'src/common/constants';
import { DrizzleIssuesRepository } from './repository/drizzle.issues.repository';
import { IssueHistoriesRepositoryModule } from '../issues-histories/repository/issue-histories.repository.module';

@Module({
  imports: [RmqModule, IssueHistoriesRepositoryModule],
  controllers: [IssuesController],
  providers: [
    IssuesService,
    { provide: ISSUES_REPOSITORY, useClass: DrizzleIssuesRepository },
  ],
  exports: [IssuesService, ISSUES_REPOSITORY],
})
export class IssuesModule {}
