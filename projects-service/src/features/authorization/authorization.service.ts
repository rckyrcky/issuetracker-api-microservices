import { Inject, Injectable } from '@nestjs/common';
import { AuthorizationError } from 'src/common/exceptions';
import { ProjectOutput } from '../projects/projects.type';
import { type ICollaborationsRepository } from '../collaborations/repository/interface.collaborations.repository';
import { type IProjectsRepository } from '../projects/repository/interface.projects.repository';
import {
  PROJECTS_REPOSITORY,
  COLLABORATIONS_REPOSITORY,
} from 'src/common/constants';

@Injectable()
export class AuthorizationService {
  constructor(
    @Inject(PROJECTS_REPOSITORY)
    private readonly projectsRepository: IProjectsRepository,
    @Inject(COLLABORATIONS_REPOSITORY)
    private readonly collaborationsRepository: ICollaborationsRepository,
  ) {}

  /**
   * Verify project owner
   * @param projectId
   * @param userId
   */
  async verifyProjectOwner(
    projectId: number,
    userId: number,
  ): Promise<ProjectOutput[]> {
    const _project = await this.projectsRepository.verifyProjectOwner(
      projectId,
      userId,
    );
    if (_project.length === 0) {
      throw new AuthorizationError();
    }

    return _project;
  }

  /**
   * Verify project collaboration
   * @param projectId
   * @param userId
   */
  async verifyProjectCollaboration(
    projectId: number,
    userId: number,
  ): Promise<void> {
    const _collaborations =
      await this.collaborationsRepository.verifyCollaboration(
        projectId,
        userId,
      );
    if (_collaborations.length === 0) {
      throw new AuthorizationError();
    }
  }

  /**
   * Checks whether user is owner or collaborator
   * @param projectId
   * @param userId
   */
  async checkUserPermission(
    projectId: number,
    userId: number,
  ): Promise<boolean> {
    const [owner, collaborator] = await Promise.all([
      this.projectsRepository.verifyProjectOwner(projectId, userId),
      this.collaborationsRepository.verifyCollaboration(projectId, userId),
    ]);

    if (owner.length === 0 && collaborator.length === 0) {
      throw new AuthorizationError();
    }
    return true;
  }
}
