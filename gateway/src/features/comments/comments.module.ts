import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { RmqModule } from 'src/services/broker/rmq.module';
import { CommentsController } from './comments.controller';

@Module({
  imports: [RmqModule],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
