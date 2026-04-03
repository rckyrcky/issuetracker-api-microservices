import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RmqActInterceptor } from './common/interceptors/rmqack.interceptor';
import { DatabaseModule } from './services/databases/database.module';
import { LoggingModule } from './services/logging/logging.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from './features/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    LoggingModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RmqActInterceptor,
    },
  ],
})
export class AppModule {}
