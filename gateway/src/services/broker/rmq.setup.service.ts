import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RmqSetupService implements OnModuleInit {
  async setupDomain(channel: amqp.Channel, name: string) {
    await channel.assertQueue(`${name}_dlq`, { durable: true });
    await channel.bindQueue(`${name}_dlq`, 'dlx_exchange', `${name}_dlq`);

    await channel.assertQueue(`${name}_retry_queue`, {
      durable: true,
      arguments: {
        'x-message-ttl': 5_000,
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': `${name}_queue`,
      },
    });
  }

  async onModuleInit() {
    const conn = await amqp.connect('amqp://localhost:5672');
    const channel = await conn.createChannel();

    await channel.assertExchange('dlx_exchange', 'direct', {
      durable: true,
    });

    await this.setupDomain(channel, 'user');
    await this.setupDomain(channel, 'project');
    await this.setupDomain(channel, 'issue');
    await this.setupDomain(channel, 'notification');

    console.log('RabbitMQ infra setup done');
  }
}
