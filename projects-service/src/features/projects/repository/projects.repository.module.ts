import { Module } from '@nestjs/common';
import { DrizzleProjectsRepository } from './drizzle.projects.repository';
import { PROJECTS_REPOSITORY } from 'src/common/constants';

@Module({
  providers: [
    {
      provide: PROJECTS_REPOSITORY,
      useClass: DrizzleProjectsRepository,
    },
  ],
  exports: [PROJECTS_REPOSITORY],
})
export class ProjectsRepositoryModule {}
