import { Module } from '@nestjs/common';
import { IssueHistoriesService } from './issue-histories.service';
import { RmqModule } from 'src/services/broker/rmq.module';
import { IssueHistoriesController } from './issue-histories.controller';

@Module({
  imports: [RmqModule],
  controllers: [IssueHistoriesController],
  providers: [IssueHistoriesService],
  exports: [IssueHistoriesService],
})
export class IssueHistoriesModule {}
