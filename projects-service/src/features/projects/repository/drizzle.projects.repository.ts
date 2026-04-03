import { Inject, Injectable } from '@nestjs/common';
import type ILoggingService from 'src/common/interfaces/logging.interface';
import { DrizzleService } from 'src/services/databases/drizzle/drizzle.service';
import {
  NotFoundError,
  postgreErrorCode,
  ServerError,
} from 'src/common/exceptions';
import { generateErrorLogMessage, isPostgreError } from 'src/common/utils';
import {
  NewProjectInput,
  ProjectOutput,
  UpdateProjectInput,
} from '../projects.type';
import {
  collaborations,
  projects,
} from 'src/services/databases/drizzle/schema/schema';
import {
  and,
  count,
  desc,
  DrizzleQueryError,
  eq,
  exists,
  ilike,
  isNotNull,
  isNull,
  lt,
  or,
  sql,
  SQL,
} from 'drizzle-orm';
import { IProjectsRepository } from './interface.projects.repository';
import { LOGGING_SERVICE } from 'src/common/constants';

@Injectable()
export class DrizzleProjectsRepository implements IProjectsRepository {
  constructor(
    private readonly drizzleService: DrizzleService,
    @Inject(LOGGING_SERVICE)
    private readonly loggingService: ILoggingService,
  ) {}

  private readonly service = this.constructor.name;

  async addProject(project: NewProjectInput): Promise<{ id: number }[]> {
    try {
      const result = await this.drizzleService
        .db()
        .insert(projects)
        .values({
          name: project.name,
          userId: project.user_id,
          userName: project.user_name,
          userEmail: project.user_email,
        })
        .returning({ id: projects.id });

      if (result.length !== 0) {
        this.loggingService.info('Create project success', {
          id: result[0].id,
          user_id: project.user_id,
          service: this.service,
          method: this.addProject.name,
        });
      }

      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to create project', error),
        { error, service: this.service, method: this.addProject.name },
      );

      if (
        isPostgreError(
          (error as DrizzleQueryError).cause,
          postgreErrorCode.foreignKey,
        )
      ) {
        throw new NotFoundError();
      }
      throw new ServerError();
    }
  }

  async getAllProjects(
    userId: number,
    page: number = 1,
    search?: string,
  ): Promise<ProjectOutput[]> {
    const limit = 10;
    const offset = (page - 1) * limit;

    const query = this.drizzleService
      .db()
      .select({
        id: projects.id,
        name: projects.name,
      })
      .from(projects);

    const filterQuery: (SQL<unknown> | undefined)[] = [
      isNull(projects.deletedAt),
    ];

    const isOwnerQuery = eq(projects.userId, userId);

    if (search) {
      const isCollaboratorQuery = exists(
        this.drizzleService
          .db()
          .select({ one: sql`1` })
          .from(collaborations)
          .where(
            and(
              eq(collaborations.collaboratorId, userId),
              eq(collaborations.projectId, projects.id),
            ),
          ),
      );
      filterQuery.push(or(isOwnerQuery, isCollaboratorQuery));
      filterQuery.push(ilike(projects.name, `%${search}%`));
    } else {
      filterQuery.push(isOwnerQuery);
    }

    try {
      const result = await query
        .where(and(...filterQuery.filter(Boolean)))
        .orderBy(desc(projects.createdAt))
        .limit(10)
        .offset(offset);
      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to get all projects', error),
        { error, service: this.service, method: this.getAllProjects.name },
      );
      throw new ServerError();
    }
  }

  async getTotalProjects(userId: number, search?: string): Promise<number> {
    const query = this.drizzleService
      .db()
      .select({ count: count() })
      .from(projects);

    const filterQuery: (SQL<unknown> | undefined)[] = [
      isNull(projects.deletedAt),
    ];
    const isOwnerQuery = eq(projects.userId, userId);

    if (search) {
      const isCollaboratorQuery = exists(
        this.drizzleService
          .db()
          .select({ one: sql`1` })
          .from(collaborations)
          .where(
            and(
              eq(collaborations.collaboratorId, userId),
              eq(collaborations.projectId, projects.id),
            ),
          ),
      );
      filterQuery.push(or(isOwnerQuery, isCollaboratorQuery));
      filterQuery.push(ilike(projects.name, `%${search}%`));
    } else {
      filterQuery.push(isOwnerQuery);
    }

    try {
      const result = await query;
      return result[0].count;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to get total projects', error),
        { error, service: this.service, method: this.getTotalProjects.name },
      );
      throw new ServerError();
    }
  }

  async getAllSoftDeletedProjects(
    userId: number,
    cursor?: number,
  ): Promise<ProjectOutput[]> {
    const limit = 10;

    const query = this.drizzleService
      .db()
      .select({ id: projects.id, name: projects.name })
      .from(projects);

    const filterQuery = [
      eq(projects.userId, userId),
      isNotNull(projects.deletedAt),
    ];

    if (typeof cursor === 'number') {
      filterQuery.push(lt(projects.id, cursor));
    }

    try {
      const result = await query
        .where(and(...filterQuery.filter(Boolean)))
        .orderBy(desc(projects.id))
        .limit(limit + 1);
      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to get soft deleted projects', error),
        {
          error,
          service: this.service,
          method: this.getAllSoftDeletedProjects.name,
        },
      );
      throw new ServerError();
    }
  }

  async getProjectById(projectId: number): Promise<ProjectOutput[]> {
    try {
      const result = await this.drizzleService
        .db()
        .select({ id: projects.id, name: projects.name })
        .from(projects)
        .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)));
      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to get project by id', error),
        { error, service: this.service, method: this.getProjectById.name },
      );
      throw new ServerError();
    }
  }

  async getSoftDeletedProjectById(projectId: number): Promise<ProjectOutput[]> {
    try {
      const result = await this.drizzleService
        .db()
        .select({ id: projects.id, name: projects.name })
        .from(projects)
        .where(and(eq(projects.id, projectId), isNotNull(projects.deletedAt)));

      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage(
          'Failed to get soft deleted project by id',
          error,
        ),
        {
          error,
          service: this.service,
          method: this.getSoftDeletedProjectById.name,
        },
      );
      throw new ServerError();
    }
  }

  async editProject(
    projectId: number,
    project: UpdateProjectInput,
  ): Promise<{ id: number }[]> {
    try {
      const result = await this.drizzleService
        .db()
        .update(projects)
        .set({ ...project, updatedAt: new Date().toISOString() })
        .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
        .returning({ id: projects.id });

      if (result.length !== 0) {
        this.loggingService.info('Edit project success', {
          projectId,
          service: this.service,
          method: this.editProject.name,
        });
      }

      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to edit project', error),
        { error, service: this.service, method: this.editProject.name },
      );
      throw new ServerError();
    }
  }

  async softDeleteProject(
    projectId: number,
  ): Promise<{ id: number; deletedAt: string | null }[]> {
    const now = new Date().toISOString();
    try {
      const result = await this.drizzleService
        .db()
        .update(projects)
        .set({ deletedAt: now, updatedAt: now })
        .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
        .returning({ id: projects.id, deletedAt: projects.deletedAt });

      if (result.length !== 0) {
        this.loggingService.info('Soft delete project success', {
          method: this.softDeleteProject.name,
          service: this.service,
          projectId,
        });
      }

      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to soft delete project', error),
        { error, service: this.service, method: this.softDeleteProject.name },
      );
      throw new ServerError();
    }
  }

  async restoreSoftDeletedProject(
    projectId: number,
  ): Promise<{ id: number; updatedAt: string }[]> {
    try {
      const result = await this.drizzleService
        .db()
        .update(projects)
        .set({ deletedAt: null, updatedAt: new Date().toISOString() })
        .where(and(eq(projects.id, projectId), isNotNull(projects.deletedAt)))
        .returning({ id: projects.id, updatedAt: projects.updatedAt });

      if (result.length !== 0) {
        this.loggingService.info('Restore project success', {
          method: this.restoreSoftDeletedProject.name,
          service: this.service,
          projectId,
        });
      }

      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to restore project', error),
        {
          error,
          service: this.service,
          method: this.restoreSoftDeletedProject.name,
        },
      );
      throw new ServerError();
    }
  }

  async verifyProjectOwner(
    projectId: number,
    userId: number,
  ): Promise<ProjectOutput[]> {
    try {
      const result = await this.drizzleService
        .db()
        .select({ id: projects.id, name: projects.name })
        .from(projects)
        .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Verify project owner failed', error),
        { method: this.verifyProjectOwner.name, service: this.service, error },
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
    const newData: Partial<{ userName: string; userEmail: string }> = {};

    if (name) {
      newData['userName'] = name;
    }

    if (email) {
      newData['userEmail'] = email;
    }

    if (Object.keys(newData).length === 0) {
      return;
    }

    try {
      const result = await this.drizzleService
        .db()
        .update(projects)
        .set({ ...newData, lastEventUpdatedAt: updatedAt })
        .where(
          and(
            eq(projects.userId, userId),
            lt(projects.lastEventUpdatedAt, updatedAt),
          ),
        )
        .returning({ id: projects.id });

      if (result.length !== 0) {
        this.loggingService.info('Update user data on project success', {
          method: this.updateUserData.name,
          service: this.service,
          userId,
        });
      } else {
        this.loggingService.info('Skip update user data on project', {
          method: this.updateUserData.name,
          service: this.service,
          userId,
          eventAt: updatedAt,
        });
      }
      return;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to update user data on project', error),
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
