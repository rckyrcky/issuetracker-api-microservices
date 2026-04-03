import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError, UserError } from 'src/common/exceptions';
import { AuthorizationService } from '../authorization/authorization.service';
import {
  CollaborationProjectPaginationOutput,
  NewCollaborationInput,
  NewCollaborationOutput,
} from './collaborations.type';
import { generatePaginationData } from 'src/common/utils';
import { type IProjectsRepository } from '../projects/repository/interface.projects.repository';
import { type ICollaborationsRepository } from './repository/interface.collaborations.repository';
import {
  COLLABORATIONS_REPOSITORY,
  PROJECTS_REPOSITORY,
  USER_MS,
  USER_VIEW_PROFILE,
  USER_VIEW_PROFILE_BY_EMAIL,
} from 'src/common/constants';
import { CustomErrorMessages } from 'src/common/messages';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class CollaborationsService {
  constructor(
    @Inject(COLLABORATIONS_REPOSITORY)
    private readonly collaborationsRepository: ICollaborationsRepository,
    @Inject(PROJECTS_REPOSITORY)
    private readonly projectsRepository: IProjectsRepository,
    private readonly authorizationService: AuthorizationService,
    @Inject(USER_MS)
    private readonly usersClient: ClientProxy,
  ) {}

  /**
   * Checks if project is already soft deleted
   * @param projectId
   */
  async isProjectSoftDeleted(projectId: number): Promise<void> {
    const project =
      await this.projectsRepository.getSoftDeletedProjectById(projectId);

    if (project.length !== 0) {
      throw new NotFoundError();
    }
  }

  async handlePostCollaboration({
    email,
    projectId,
    userId,
  }: {
    projectId: number;
    userId: number;
    email: string;
  }): Promise<NewCollaborationOutput> {
    await this.isProjectSoftDeleted(projectId);

    const [projects] = await this.authorizationService.verifyProjectOwner(
      projectId,
      userId,
    );

    const [collaboratorData, ownerData] = await Promise.all([
      firstValueFrom(
        this.usersClient
          .send<{
            name: string;
            email: string;
            id: number;
          }>(USER_VIEW_PROFILE_BY_EMAIL, email)
          .pipe(timeout({ first: 5_000 })),
      ),
      firstValueFrom(
        this.usersClient
          .send<{
            name: string;
            email: string;
            id: number;
          }>(USER_VIEW_PROFILE, userId)
          .pipe(timeout({ first: 5_000 })),
      ),
    ]);

    if (collaboratorData.id === userId) {
      throw new UserError(CustomErrorMessages.etc.collaborateWithSelf);
    }

    const payload: NewCollaborationInput = {
      project_id: projectId,
      owner_id: userId,
      collaborator_email: email,
      owner_email: ownerData.email,
      owner_name: ownerData.name,
      collaborator_id: collaboratorData.id,
      collaborator_name: collaboratorData.name,
    };

    const result =
      await this.collaborationsRepository.addCollaboration(payload);

    const data: NewCollaborationOutput = {
      ...result[0],
      project_name: projects.name,
      collaborator_name: collaboratorData.name,
    };

    return data;
  }

  async handleGetAllColaborationProjects(
    userId: number,
    page: number = 1,
  ): Promise<CollaborationProjectPaginationOutput> {
    const [allCollaborationsProjects, totalAllCollaborationsProjects] =
      await Promise.all([
        this.collaborationsRepository.getListOfCollaborationProjects(
          userId,
          page,
        ),
        this.collaborationsRepository.getTotalListOfCollaborationProjects(
          userId,
        ),
      ]);

    const { hasMorePage, limit, nextPage, totalPages } = generatePaginationData(
      totalAllCollaborationsProjects,
      page,
    );

    return {
      data: allCollaborationsProjects,
      pagination: {
        hasMorePage,
        nextPage,
        limit,
        total: totalAllCollaborationsProjects,
        page,
        totalPages,
      },
    };
  }

  async handleDeleteCollaboration(
    projectId: number,
    email: string,
    userId: number,
  ): Promise<number> {
    await this.isProjectSoftDeleted(projectId);

    await this.authorizationService.verifyProjectOwner(projectId, userId);

    const targetUser = await firstValueFrom(
      this.usersClient
        .send<{
          name: string;
          email: string;
          id: number;
        }>(USER_VIEW_PROFILE_BY_EMAIL, email)
        .pipe(timeout({ first: 5_000 })),
    );

    if (targetUser.id === userId) {
      throw new UserError();
    }

    const result = await this.collaborationsRepository.deleteCollaboration(
      projectId,
      targetUser.id,
    );

    if (result.length === 0) {
      throw new NotFoundError();
    }

    return result[0].id;
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
    return await this.collaborationsRepository.updateUserData(
      id,
      updatedAt,
      name,
      email,
    );
  }
}
