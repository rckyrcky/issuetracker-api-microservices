import { Module } from '@nestjs/common';
import { CollaborationsService } from './collaborations.service';
import { CollaborationsRepositoryModule } from './repository/collaborations.repository.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { ProjectsRepositoryModule } from '../projects/repository/projects.repository.module';
import { CollaborationsController } from './collaborations.controller';
import { RmqModule } from 'src/services/broker/rmq.module';

@Module({
  imports: [
    CollaborationsRepositoryModule,
    AuthorizationModule,
    ProjectsRepositoryModule,
    RmqModule,
  ],
  controllers: [CollaborationsController],
  providers: [CollaborationsService],
  exports: [CollaborationsService],
})
export class CollaborationsModule {}
