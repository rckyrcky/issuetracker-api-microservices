import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import {
  COLLABORATION_CREATE,
  COLLABORATION_CREATED,
  COLLABORATION_DELETE,
  NOTIFICATION_MS,
  PROJECT_VIEW_ALL_COLLABORATION,
} from 'src/common/constants';
import { CollaborationsService } from 'src/features/collaborations/collaborations.service';
import type { CollaborationProjectPaginationOutput } from './collaborations.type';

@Controller()
export class CollaborationsController {
  constructor(
    private readonly collaborationsService: CollaborationsService,
    @Inject(NOTIFICATION_MS)
    private readonly notificationsClient: ClientProxy,
  ) {}

  @MessagePattern(PROJECT_VIEW_ALL_COLLABORATION)
  async all(
    @Payload('user_id') userId: number,
    @Payload('page') page?: number,
  ): Promise<CollaborationProjectPaginationOutput> {
    return await this.collaborationsService.handleGetAllColaborationProjects(
      userId,
      page,
    );
  }

  @MessagePattern(COLLABORATION_CREATE)
  async create(
    @Payload('project_id') projectId: number,
    @Payload('user_id') userId: number,
    @Payload('email') email: string,
  ): Promise<number> {
    const result = await this.collaborationsService.handlePostCollaboration({
      projectId,
      userId,
      email,
    });
    this.notificationsClient.emit(COLLABORATION_CREATED, {
      user_id: result.collaborator_id,
      user_name: result.collaborator_name,
      actor_id: result.owner_id,
      actor_name: result.owner_name,
      project_id: projectId,
      project_name: result.project_name,
    });
    return result.id;
  }

  @MessagePattern(COLLABORATION_DELETE)
  async delete(
    @Payload('project_id') projectId: number,
    @Payload('user_id') userId: number,
    @Payload('email') email: string,
  ): Promise<number> {
    return await this.collaborationsService.handleDeleteCollaboration(
      projectId,
      email,
      userId,
    );
  }
}
