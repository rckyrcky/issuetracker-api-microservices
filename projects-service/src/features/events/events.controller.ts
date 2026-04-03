import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { USER_CHANGED } from 'src/common/constants';
import { CollaborationsService } from '../collaborations/collaborations.service';
import { ProjectsService } from '../projects/projects.service';

@Controller()
export class EventController {
  constructor(
    private readonly collaborationsService: CollaborationsService,
    private readonly projectsService: ProjectsService,
  ) {}

  @EventPattern(USER_CHANGED)
  async updateUser(
    @Payload()
    data: {
      id: number;
      name?: string;
      email?: string;
      updatedAt: string;
    },
  ) {
    await Promise.all([
      this.projectsService.handleUserChanged(data),
      this.collaborationsService.handleUserChanged(data),
    ]);
  }
}
