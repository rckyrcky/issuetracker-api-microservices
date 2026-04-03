import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  COLLABORATION_CREATE,
  COLLABORATION_DELETE,
  PROJECT_MS,
  PROJECT_VIEW_ALL_COLLABORATION,
} from 'src/common/constants';
import { CollaborationProjectPaginationOutput } from './collaborations.type';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class CollaborationsService {
  constructor(
    @Inject(PROJECT_MS)
    private readonly projectsClient: ClientProxy,
  ) {}

  async handlePostCollaboration(
    projectId: number,
    email: string,
    userId: number,
  ): Promise<number> {
    return await firstValueFrom(
      this.projectsClient
        .send<number>(COLLABORATION_CREATE, {
          project_id: projectId,
          email,
          user_id: userId,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handleGetAllColaborationProjects(
    userId: number,
    page?: number,
  ): Promise<CollaborationProjectPaginationOutput> {
    return await firstValueFrom(
      this.projectsClient
        .send<CollaborationProjectPaginationOutput>(
          PROJECT_VIEW_ALL_COLLABORATION,
          {
            user_id: userId,
            page,
          },
        )
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handleDeleteCollaboration(
    projectId: number,
    email: string,
    userId: number,
  ): Promise<number> {
    return await firstValueFrom(
      this.projectsClient
        .send<number>(COLLABORATION_DELETE, {
          user_id: userId,
          project_id: projectId,
          email,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }
}
