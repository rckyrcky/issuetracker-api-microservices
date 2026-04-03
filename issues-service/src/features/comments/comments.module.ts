import { Module } from '@nestjs/common';
import { RmqModule } from 'src/services/broker/rmq.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { COMMENTS_REPOSITORY } from 'src/common/constants';
import { DrizzleCommentsRepository } from './repository/drizzle.comments.repository';
import { IssuesModule } from '../issues/issues.module';
import { IssueHistoriesRepositoryModule } from '../issues-histories/repository/issue-histories.repository.module';

@Module({
  imports: [RmqModule, IssuesModule, IssueHistoriesRepositoryModule],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    { provide: COMMENTS_REPOSITORY, useClass: DrizzleCommentsRepository },
  ],
  exports: [CommentsService, COMMENTS_REPOSITORY],
})
export class CommentsModule {}
