import { Module } from '@nestjs/common';
import { DrizzleCollaborationsRepository } from './drizzle.collaborations.repository';
import { COLLABORATIONS_REPOSITORY } from 'src/common/constants';

@Module({
  providers: [
    {
      provide: COLLABORATIONS_REPOSITORY,
      useClass: DrizzleCollaborationsRepository,
    },
  ],
  exports: [COLLABORATIONS_REPOSITORY],
})
export class CollaborationsRepositoryModule {}
