import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RmqActInterceptor } from './common/interceptors/rmqack.interceptor';
import { LoggingModule } from './services/logging/logging.module';
import { DatabaseModule } from './services/databases/database.module';
import { ConfigModule } from '@nestjs/config';
import { CollaborationsModule } from './features/collaborations/collaborations.module';
import { ProjectsModule } from './features/projects/projects.module';
import { CacheModule } from '@nestjs/cache-manager';
import { EventModule } from './features/events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      ttl: 120 * 1000,
    }),
    LoggingModule,
    DatabaseModule,
    ProjectsModule,
    CollaborationsModule,
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
