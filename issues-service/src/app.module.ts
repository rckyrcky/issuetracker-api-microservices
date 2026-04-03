import { Module } from '@nestjs/common';
import { IssueHistoriesModule } from './features/issues-histories/issue-histories.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RmqActInterceptor } from './common/interceptors/rmqack.interceptor';
import { DatabaseModule } from './services/databases/database.module';
import { LoggingModule } from './services/logging/logging.module';
import { IssuesModule } from './features/issues/issues.module';
import { CommentsModule } from './features/comments/comments.module';
import { ConfigModule } from '@nestjs/config';
import { EventModule } from './features/events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    LoggingModule,
    IssuesModule,
    IssueHistoriesModule,
    CommentsModule,
    EventModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RmqActInterceptor,
    },
  ],
})
export class AppModule {}
