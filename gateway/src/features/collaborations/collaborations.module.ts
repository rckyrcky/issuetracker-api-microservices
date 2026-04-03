import { Module } from '@nestjs/common';
import { RmqModule } from 'src/services/broker/rmq.module';
import { CollaborationsService } from './collaborations.service';
import { CollaborationsController } from './collaborations.controller';

@Module({
  imports: [RmqModule],
  providers: [CollaborationsService],
  controllers: [CollaborationsController],
  exports: [CollaborationsService],
})
export class CollaborationsModule {}
