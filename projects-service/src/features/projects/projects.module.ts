import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsRepositoryModule } from './repository/projects.repository.module';
import { ProjectsController } from './projects.controller';
import { AuthorizationModule } from '../authorization/authorization.module';
import { RmqModule } from 'src/services/broker/rmq.module';
import { CollaborationsRepositoryModule } from '../collaborations/repository/collaborations.repository.module';

@Module({
  imports: [
    ProjectsRepositoryModule,
    AuthorizationModule,
    RmqModule,
    CollaborationsRepositoryModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
