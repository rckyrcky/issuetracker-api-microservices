import { Inject, Injectable } from '@nestjs/common';
import {
  NewCollaborationInput,
  CollaboratorOutput,
  CollaborationProjectOutput,
  NewCollaborationOutput,
} from '../collaborations.type';
import type ILoggingService from 'src/common/interfaces/logging.interface';
import { DrizzleService } from 'src/services/databases/drizzle/drizzle.service';
import {
  postgreErrorCode,
  ServerError,
  UserError,
} from 'src/common/exceptions';
import { generateErrorLogMessage, isPostgreError } from 'src/common/utils';
import {
  collaborations,
  projects,
} from 'src/services/databases/drizzle/schema/schema';
import { and, asc, count, desc, eq, isNull, lte } from 'drizzle-orm';
import { CustomErrorMessages } from 'src/common/messages';
import { ICollaborationsRepository } from './interface.collaborations.repository';

import { DrizzleQueryError } from 'drizzle-orm';
import { LOGGING_SERVICE } from 'src/common/constants';

@Injectable()
export class DrizzleCollaborationsRepository implements ICollaborationsRepository {
  constructor(
    private readonly drizzleService: DrizzleService,
    @Inject(LOGGING_SERVICE)
    private readonly loggingService: ILoggingService,
  ) {}
  private readonly service = this.constructor.name;

  async addCollaboration(
    collaboration: NewCollaborationInput,
  ): Promise<NewCollaborationOutput[]> {
    try {
      const result = await this.drizzleService
        .db()
        .insert(collaborations)
        .values({
          projectId: collaboration.project_id,
          ownerId: collaboration.owner_id,
          ownerEmail: collaboration.owner_email,
          ownerName: collaboration.owner_name,
          collaboratorId: collaboration.collaborator_id,
          collaboratorEmail: collaboration.collaborator_email,
          collaboratorName: collaboration.collaborator_name,
        })
        .returning({
          id: collaborations.id,
          project_id: collaborations.projectId,
          owner_id: collaborations.ownerId,
          owner_name: collaborations.ownerName,
          collaborator_id: collaborations.collaboratorId,
        });
      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to add collaboration', error),
        {
          error,
          method: this.addCollaboration.name,
          service: this.service,
        },
      );
      if (
        isPostgreError(
          (error as DrizzleQueryError).cause,
          postgreErrorCode.foreignKey,
        )
      ) {
        throw new UserError();
      }
      if (
        isPostgreError(
          (error as DrizzleQueryError).cause,
          postgreErrorCode.unique,
        )
      ) {
        throw new UserError(CustomErrorMessages.etc.doubleCollaborator);
      }

      throw new ServerError();
    }
  }

  async getListOfCollaborators(
    projectId: number,
  ): Promise<CollaboratorOutput[]> {
    try {
      const result = await this.drizzleService
        .db()
        .select({
          collaborator_id: collaborations.collaboratorId,
          collaborator_name: collaborations.collaboratorName,
          collaborator_email: collaborations.collaboratorEmail,
        })
        .from(collaborations)
        .innerJoin(projects, eq(collaborations.projectId, projects.id))
        .where(
          and(
            eq(collaborations.projectId, projectId),
            isNull(projects.deletedAt),
          ),
        );
      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to get list of collaborators', error),
        {
          error,
          method: this.getListOfCollaborators.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }

  async getListOfCollaborationProjects(
    userId: number,
    page: number = 1,
  ): Promise<CollaborationProjectOutput[]> {
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
      const result = await this.drizzleService
        .db()
        .select({
          id: projects.id,
          name: projects.name,
          project_owner: projects.userName,
        })
        .from(collaborations)
        .innerJoin(projects, eq(collaborations.projectId, projects.id))
        .where(
          and(
            eq(collaborations.collaboratorId, userId),
            isNull(projects.deletedAt),
          ),
        )
        .orderBy(desc(projects.createdAt), asc(projects.name))
        .limit(limit)
        .offset(offset);
      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage(
          'Failed to get list collaboration projects',
          error,
        ),
        {
          error,
          method: this.getListOfCollaborationProjects.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }

  async getTotalListOfCollaborationProjects(userId: number): Promise<number> {
    try {
      const result = await this.drizzleService
        .db()
        .select({ count: count() })
        .from(collaborations)
        .innerJoin(projects, eq(collaborations.projectId, projects.id))
        .where(
          and(
            eq(collaborations.collaboratorId, userId),
            isNull(projects.deletedAt),
          ),
        );
      return result[0].count;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage(
          'Failed to get total list of collaboration projects',
          error,
        ),
        {
          error,
          method: this.getTotalListOfCollaborationProjects.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }

  async deleteCollaboration(
    projectId: number,
    userId: number,
  ): Promise<{ id: number }[]> {
    try {
      const result = await this.drizzleService
        .db()
        .delete(collaborations)
        .where(
          and(
            eq(collaborations.projectId, projectId),
            eq(collaborations.collaboratorId, userId),
          ),
        )
        .returning({ id: collaborations.id });
      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to delete collaboration', error),
        {
          error,
          method: this.deleteCollaboration.name,
          service: this.service,
        },
      );
      if (
        isPostgreError(
          (error as DrizzleQueryError).cause,
          postgreErrorCode.foreignKey,
        )
      ) {
        throw new UserError();
      }
      throw new ServerError();
    }
  }

  async verifyCollaboration(
    projectId: number,
    userId: number,
  ): Promise<{ id: number }[]> {
    try {
      const result = await this.drizzleService
        .db()
        .select({ id: collaborations.id })
        .from(collaborations)
        .where(
          and(
            eq(collaborations.projectId, projectId),
            eq(collaborations.collaboratorId, userId),
          ),
        );
      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Verify collaboration failed', error),
        {
          error,
          method: this.verifyCollaboration.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }

  async updateUserData(
    userId: number,
    updatedAt: string,
    name?: string,
    email?: string,
  ): Promise<void> {
    const collaboratorData: Partial<{
      collaboratorName: string;
      collaboratorEmail: string;
    }> = {};

    const ownerData: Partial<{
      ownerName: string;
      ownerEmail: string;
    }> = {};

    if (name) {
      collaboratorData.collaboratorName = name;
      ownerData.ownerName = name;
    }

    if (email) {
      collaboratorData.collaboratorEmail = email;
      ownerData.ownerEmail = email;
    }

    if (
      Object.keys(collaboratorData).length === 0 &&
      Object.keys(ownerData).length === 0
    ) {
      return;
    }

    try {
      const result = await Promise.all([
        this.drizzleService
          .db()
          .update(collaborations)
          .set({ ...collaboratorData, lastEventUpdatedAt: updatedAt })
          .where(
            and(
              eq(collaborations.collaboratorId, userId),
              lte(collaborations.lastEventUpdatedAt, updatedAt),
            ),
          )
          .returning({ id: collaborations.id }),
        this.drizzleService
          .db()
          .update(collaborations)
          .set({ ...ownerData, lastEventUpdatedAt: updatedAt })
          .where(
            and(
              eq(collaborations.ownerId, userId),
              lte(collaborations.lastEventUpdatedAt, updatedAt),
            ),
          )
          .returning({ id: collaborations.id }),
      ]);

      if (result.some((x) => x.length !== 0)) {
        this.loggingService.info('Update user data on collaborations success', {
          method: this.updateUserData.name,
          service: this.service,
          userId,
        });
      }
      return;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage(
          'Failed to update user data on collaborations',
          error,
        ),
        {
          error,
          service: this.service,
          method: this.updateUserData.name,
        },
      );
      throw new ServerError();
    }
  }
}
