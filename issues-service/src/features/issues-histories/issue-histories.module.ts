import { Module } from '@nestjs/common';
import { IssueHistoriesService } from './issue-histories.service';
import { IssuesModule } from '../issues/issues.module';
import { IssueHistoriesRepositoryModule } from './repository/issue-histories.repository.module';
import { RmqModule } from 'src/services/broker/rmq.module';
import { IssueHistoriesController } from './issue-histories.controller';

@Module({
  imports: [IssuesModule, RmqModule, IssueHistoriesRepositoryModule],
  controllers: [IssueHistoriesController],
  providers: [IssueHistoriesService],
  exports: [IssueHistoriesService],
})
export class IssueHistoriesModule {}
