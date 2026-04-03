import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { CollaborationsModule } from '../collaborations/collaborations.module';
import { EventController } from './events.controller';

@Module({
  imports: [ProjectsModule, CollaborationsModule],
  controllers: [EventController],
})
export class EventModule {}
