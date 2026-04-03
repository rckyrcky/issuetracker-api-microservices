import { Module } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { ProjectsRepositoryModule } from '../projects/repository/projects.repository.module';
import { CollaborationsRepositoryModule } from '../collaborations/repository/collaborations.repository.module';
import { AuthorizationController } from './authorization.controller';

@Module({
  imports: [ProjectsRepositoryModule, CollaborationsRepositoryModule],
  controllers: [AuthorizationController],
  providers: [AuthorizationService],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
