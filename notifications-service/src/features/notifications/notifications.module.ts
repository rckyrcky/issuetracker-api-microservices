import { Module } from '@nestjs/common';
import { RmqModule } from 'src/services/broker/rmq.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NOTIFICATIONS_REPOSITORY } from 'src/common/constants';
import { DrizzleNotificationsRepository } from './repository/drizzle.notifications.repository';

@Module({
  imports: [RmqModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    {
      provide: NOTIFICATIONS_REPOSITORY,
      useClass: DrizzleNotificationsRepository,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
