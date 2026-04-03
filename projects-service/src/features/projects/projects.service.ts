import { Inject, Injectable } from '@nestjs/common';
import {
  NewProjectInput,
  ProjectCursorOutput,
  ProjectOutput,
  ProjectPaginationOutput,
  UpdateProjectInput,
} from './projects.type';
import {
  generateCursorPaginationData,
  generatePaginationData,
} from 'src/common/utils';
import { NotFoundError } from 'src/common/exceptions';
import { type ICollaborationsRepository } from '../collaborations/repository/interface.collaborations.repository';
import { type IProjectsRepository } from './repository/interface.projects.repository';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  PROJECTS_REPOSITORY,
  COLLABORATIONS_REPOSITORY,
} from 'src/common/constants';
import { AuthorizationService } from '../authorization/authorization.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly authorizationService: AuthorizationService,
    @Inject(PROJECTS_REPOSITORY)
    private readonly projectsRepository: IProjectsRepository,
    @Inject(COLLABORATIONS_REPOSITORY)
    private readonly collaborationsRepository: ICollaborationsRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private projectCacheKey(userId: number, page: number, search?: string) {
    return `projects:user:${userId}:page:${page}:search:${search ?? 'all'}`;
  }

  private deletedProjectCacheKey(userId: number, cursor?: number) {
    return `deleted-projects:user:${userId}:cursor:${cursor ?? 'start'}`;
  }

  async handlePostProject(project: NewProjectInput): Promise<number> {
    const result = await this.projectsRepository.addProject(project);
    await this.cacheManager.clear();
    return result[0].id;
  }

  async handleGetAllProjects(
    userId: number,
    page: number = 1,
    search?: string,
  ): Promise<ProjectPaginationOutput> {
    const cached = await this.cacheManager.get<ProjectPaginationOutput>(
      this.projectCacheKey(userId, page, search),
    );

    if (cached) {
      return cached;
    }

    const [allProjects, totalAllProjects] = await Promise.all([
      this.projectsRepository.getAllProjects(userId, page, search),
      this.projectsRepository.getTotalProjects(userId, search),
    ]);

    const { hasMorePage, limit, nextPage, totalPages } = generatePaginationData(
      totalAllProjects,
      page,
    );

    const result: ProjectPaginationOutput = {
      data: allProjects,
      pagination: {
        hasMorePage,
        nextPage,
        page,
        total: totalAllProjects,
        totalPages,
        limit,
      },
    };

    await this.cacheManager.set(
      this.projectCacheKey(userId, page, search),
      result,
    );

    return result;
  }

  async handleGetAllSoftDeletedProjects(
    userId: number,
    cursor?: number,
  ): Promise<ProjectCursorOutput> {
    const cached = await this.cacheManager.get<ProjectCursorOutput>(
      this.deletedProjectCacheKey(userId, cursor),
    );

    if (cached) {
      return cached;
    }

    const res = await this.projectsRepository.getAllSoftDeletedProjects(
      userId,
      cursor,
    );

    const { data, hasMore, nextCursor } = generateCursorPaginationData(res);

    const result: ProjectCursorOutput = {
      data,
      pagination: { hasMore, nextCursor },
    };

    await this.cacheManager.set(
      this.deletedProjectCacheKey(userId, cursor),
      result,
    );

    return result;
  }

  async handleGetProjectById(
    projectId: number,
    userId: number,
  ): Promise<ProjectOutput> {
    await this.authorizationService.checkUserPermission(projectId, userId);

    const [project, collaborator] = await Promise.all([
      this.projectsRepository.getProjectById(projectId),
      this.collaborationsRepository.getListOfCollaborators(projectId),
    ]);

    if (project.length === 0) {
      throw new NotFoundError();
    }

    return {
      id: project[0].id,
      name: project[0].name,
      collaborator,
    };
  }

  async handlePatchProject(
    projectId: number,
    userId: number,
    project: UpdateProjectInput,
  ): Promise<number> {
    await this.authorizationService.verifyProjectOwner(projectId, userId);

    const result = await this.projectsRepository.editProject(
      projectId,
      project,
    );

    if (result.length === 0) {
      throw new NotFoundError();
    }

    await this.cacheManager.clear();

    return result[0].id;
  }

  async handleSoftDeleteProject(
    projectId: number,
    userId: number,
  ): Promise<{
    id: number;
    deletedAt: string | null;
  }> {
    await this.authorizationService.verifyProjectOwner(projectId, userId);

    const result = await this.projectsRepository.softDeleteProject(projectId);

    if (result.length === 0) {
      throw new NotFoundError();
    }

    await this.cacheManager.clear();

    return result[0];
  }

  async handleRestoreSoftDeletedProject(
    projectId: number,
    userId: number,
  ): Promise<{
    id: number;
    updatedAt: string;
  }> {
    await this.authorizationService.verifyProjectOwner(projectId, userId);

    const result =
      await this.projectsRepository.restoreSoftDeletedProject(projectId);

    if (result.length === 0) {
      throw new NotFoundError();
    }
    await this.cacheManager.clear();
    return result[0];
  }

  async handleUserChanged({
    id,
    name,
    email,
    updatedAt,
  }: {
    id: number;
    name?: string;
    email?: string;
    updatedAt: string;
  }) {
    return await this.projectsRepository.updateUserData(
      id,
      updatedAt,
      name,
      email,
    );
  }
}
