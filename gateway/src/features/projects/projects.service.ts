import { Inject, Injectable } from '@nestjs/common';
import {
  PROJECT_CHANGE,
  PROJECT_CREATE,
  PROJECT_DELETE,
  PROJECT_MS,
  PROJECT_RESTORE,
  PROJECT_VIEW_ALL_DELETED,
  PROJECT_VIEW_ALL_OWNED,
  PROJECT_VIEW_DETAIL,
} from 'src/common/constants';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import {
  NewProjectInput,
  ProjectPaginationOutput,
  ProjectCursorOutput,
  ProjectOutput,
  UpdateProjectInput,
} from './projects.type';

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECT_MS)
    private readonly projectsClient: ClientProxy,
  ) {}

  async handlePostProject(project: NewProjectInput): Promise<number> {
    return await firstValueFrom(
      this.projectsClient
        .send<number>(PROJECT_CREATE, project)
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handleGetAllProjects(
    userId: number,
    page: number = 1,
    search?: string,
  ): Promise<ProjectPaginationOutput> {
    const result = await firstValueFrom(
      this.projectsClient
        .send<ProjectPaginationOutput>(PROJECT_VIEW_ALL_OWNED, {
          user_id: userId,
          page,
          search,
        })
        .pipe(timeout({ first: 5_000 })),
    );
    return result;
  }

  async handleGetAllSoftDeletedProjects(
    userId: number,
    cursor?: number,
  ): Promise<ProjectCursorOutput> {
    return await firstValueFrom(
      this.projectsClient
        .send<ProjectCursorOutput>(PROJECT_VIEW_ALL_DELETED, {
          user_id: userId,
          cursor,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handleGetProjectById(
    projectId: number,
    userId: number,
  ): Promise<ProjectOutput> {
    return await firstValueFrom(
      this.projectsClient
        .send<ProjectOutput>(PROJECT_VIEW_DETAIL, {
          project_id: projectId,
          user_id: userId,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handlePatchProject(
    projectId: number,
    userId: number,
    project: UpdateProjectInput,
  ): Promise<number> {
    return await firstValueFrom(
      this.projectsClient
        .send<number>(PROJECT_CHANGE, {
          project_id: projectId,
          user_id: userId,
          payload: project,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handleSoftDeleteProject(
    projectId: number,
    userId: number,
  ): Promise<number> {
    return await firstValueFrom(
      this.projectsClient
        .send<number>(PROJECT_DELETE, {
          project_id: projectId,
          user_id: userId,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handleRestoreSoftDeletedProject(
    projectId: number,
    userId: number,
  ): Promise<number> {
    return await firstValueFrom(
      this.projectsClient
        .send<number>(PROJECT_RESTORE, {
          project_id: projectId,
          user_id: userId,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }
}
