import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  ISSUE_MS,
  NOTIFICATION_MS,
  PROJECT_MS,
  USER_MS,
} from 'src/common/constants';
import { RmqSetupService } from './rmq.setup.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: USER_MS,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'user_queue',
          queueOptions: {
            arguments: {
              'x-dead-letter-exchange': 'dlx_exchange',
              'x-dead-letter-routing-key': 'user_dlq',
            },
          },
        },
      },
      {
        name: PROJECT_MS,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'project_queue',
          queueOptions: {
            arguments: {
              'x-dead-letter-exchange': 'dlx_exchange',
              'x-dead-letter-routing-key': 'project_dlq',
            },
          },
        },
      },
      {
        name: ISSUE_MS,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'issue_queue',
          queueOptions: {
            arguments: {
              'x-dead-letter-exchange': 'dlx_exchange',
              'x-dead-letter-routing-key': 'issue_dlq',
            },
          },
        },
      },
      {
        name: NOTIFICATION_MS,
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'notification_queue',
          queueOptions: {
            arguments: {
              'x-dead-letter-exchange': 'dlx_exchange',
              'x-dead-letter-routing-key': 'notification_dlq',
            },
          },
        },
      },
    ]),
  ],
  providers: [RmqSetupService],
  exports: [ClientsModule],
})
export class RmqModule {}
