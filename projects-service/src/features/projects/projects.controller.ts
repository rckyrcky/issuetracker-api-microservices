import { Controller, Inject } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import {
  ISSUE_MS,
  PROJECT_CHANGE,
  PROJECT_CREATE,
  PROJECT_DELETE,
  PROJECT_DELETED,
  PROJECT_RESTORE,
  PROJECT_RESTORED,
  PROJECT_VIEW_ALL_DELETED,
  PROJECT_VIEW_ALL_OWNED,
  PROJECT_VIEW_DETAIL,
} from 'src/common/constants';
import type {
  NewProjectInput,
  ProjectCursorOutput,
  ProjectOutput,
  ProjectPaginationOutput,
  UpdateProjectInput,
} from './projects.type';

@Controller()
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    @Inject(ISSUE_MS)
    private readonly issueClient: ClientProxy,
  ) {}

  @MessagePattern(PROJECT_VIEW_ALL_DELETED)
  async allDeleted(
    @Payload('user_id') userId: number,
    @Payload('cursor') cursor?: number,
  ): Promise<ProjectCursorOutput> {
    return await this.projectsService.handleGetAllSoftDeletedProjects(
      userId,
      cursor,
    );
  }

  @MessagePattern(PROJECT_RESTORE)
  async restore(
    @Payload('project_id') projectId: number,
    @Payload('user_id') userId: number,
  ): Promise<number> {
    const result = await this.projectsService.handleRestoreSoftDeletedProject(
      projectId,
      userId,
    );
    this.issueClient.emit(PROJECT_RESTORED, result);
    return result.id;
  }

  @MessagePattern(PROJECT_CREATE)
  async create(@Payload() payload: NewProjectInput): Promise<number> {
    return await this.projectsService.handlePostProject(payload);
  }

  @MessagePattern(PROJECT_VIEW_ALL_OWNED)
  async all(
    @Payload('user_id') userId: number,
    @Payload('page') page?: number,
    @Payload('search') search?: string,
  ): Promise<ProjectPaginationOutput> {
    return await this.projectsService.handleGetAllProjects(
      userId,
      page,
      search,
    );
  }

  @MessagePattern(PROJECT_VIEW_DETAIL)
  async detail(
    @Payload('project_id') projectId: number,
    @Payload('user_id') userId: number,
  ): Promise<ProjectOutput> {
    return await this.projectsService.handleGetProjectById(projectId, userId);
  }

  @MessagePattern(PROJECT_CHANGE)
  async update(
    @Payload('project_id') projectId: number,
    @Payload('user_id') userId: number,
    @Payload('payload') payload: UpdateProjectInput,
  ): Promise<number> {
    return await this.projectsService.handlePatchProject(
      projectId,
      userId,
      payload,
    );
  }

  @MessagePattern(PROJECT_DELETE)
  async delete(
    @Payload('project_id') projectId: number,
    @Payload('user_id') userId: number,
  ): Promise<number> {
    const result = await this.projectsService.handleSoftDeleteProject(
      projectId,
      userId,
    );
    this.issueClient.emit(PROJECT_DELETED, result);
    return result.id;
  }
}
