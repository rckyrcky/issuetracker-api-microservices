import { Module } from '@nestjs/common';
import { RmqModule } from 'src/services/broker/rmq.module';
import { AuthModule } from '../auth/auth.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { CollaborationsModule } from '../collaborations/collaborations.module';

@Module({
  imports: [RmqModule, AuthModule, CollaborationsModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
