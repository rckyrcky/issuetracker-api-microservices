import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule } from './services/logging/logging.module';
import { RateLimitModule } from './services/rate-limit/rate-limit.module';
import { JwtModule } from './services/jwt/jwt.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptors } from './common/interceptors/logging.interceptors';
import { AuthGuard } from './common/guards/auth.guard';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { AuthModule } from './features/auth/auth.module';
import { ProjectsModule } from './features/projects/projects.module';
import { CollaborationsModule } from './features/collaborations/collaborations.module';
import { IssuesModule } from './features/issues/issues.module';
import { CommentsModule } from './features/comments/comments.module';
import { IssueHistoriesModule } from './features/issue-histories/issue-histories.module';
import { NotificationsModule } from './features/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule,
    LoggingModule,
    RateLimitModule,
    AuthModule,
    ProjectsModule,
    CollaborationsModule,
    IssuesModule,
    CommentsModule,
    IssueHistoriesModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptors,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule {}
