import { Module } from '@nestjs/common';
import { EventController } from './events.controller';
import { IssuesModule } from '../issues/issues.module';
import { CommentsModule } from '../comments/comments.module';
import { IssueHistoriesModule } from '../issues-histories/issue-histories.module';

@Module({
  imports: [IssuesModule, CommentsModule, IssueHistoriesModule],
  controllers: [EventController],
})
export class EventModule {}
