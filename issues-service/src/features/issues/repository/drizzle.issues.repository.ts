import { Inject, Injectable } from '@nestjs/common';
import type ILoggingService from 'src/common/interfaces/logging.interface';
import { DrizzleService } from 'src/services/databases/drizzle/drizzle.service';
import {
  IssueOutput,
  IssuePriorityType,
  IssueStatusType,
  NewIssueInput,
  UpdateIssueInput,
} from '../issues.type';
import { generateErrorLogMessage, isPostgreError } from 'src/common/utils';
import {
  postgreErrorCode,
  ServerError,
  UserError,
} from 'src/common/exceptions';

import { IIssuesRepository } from './interface.issues.repository';
import { issues } from 'src/services/databases/drizzle/schema/schema';
import { and, count, desc, DrizzleQueryError, eq, lt } from 'drizzle-orm';

import {
  ISSUE_HISTORIES_REPOSITORY,
  LOGGING_SERVICE,
} from 'src/common/constants';
import type { IIssueHistoriesRepository } from 'src/features/issues-histories/repository/interface.issue.histories.repository';
import { IssueHistoriesTypeInput } from 'src/features/issues-histories/issue.histories.type';

@Injectable()
export class DrizzleIssuesRepository implements IIssuesRepository {
  constructor(
    private readonly drizzleService: DrizzleService,
    @Inject(ISSUE_HISTORIES_REPOSITORY)
    private readonly issueHistorieRepository: IIssueHistoriesRepository,
    @Inject(LOGGING_SERVICE)
    private readonly loggingService: ILoggingService,
  ) {}

  private readonly service = this.constructor.name;

  async addIssue(issue: NewIssueInput): Promise<{ id: number }[]> {
    try {
      const result = await this.drizzleService.db().transaction(async (txn) => {
        const res = await txn
          .insert(issues)
          .values({
            ...issue,
            userId: issue.user_id,
            userName: issue.user_name,
            projectId: issue.project_id,
          })
          .returning({ id: issues.id });

        await this.issueHistorieRepository.addIssueHistory(
          {
            issue_id: res[0].id,
            type: 'add_issue',
            user_id: issue.user_id,
            user_name: issue.user_name,
          },
          txn,
        );

        return res;
      });

      if (result.length !== 0) {
        this.loggingService.info('Add issue success', {
          method: this.addIssue.name,
          service: this.service,
          id: result[0].id,
        });
      }
      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to add issue', error),
        { error, method: this.addIssue.name, service: this.service },
      );

      if (
        isPostgreError(
          (error as DrizzleQueryError).cause,
          postgreErrorCode.check,
        ) ||
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

  async getAllIssues(
    projectId: number,
    page: number = 1,
    status?: IssueStatusType,
    priority?: IssuePriorityType,
  ): Promise<IssueOutput[]> {
    const limit = 10;
    const offset = (page - 1) * limit;

    const query = this.drizzleService
      .db()
      .select({
        id: issues.id,
        title: issues.title,
        description: issues.description,
        status: issues.status,
        priority: issues.priority,
        project_id: issues.projectId,
        created_at: issues.createdAt,
        user_id: issues.userId,
        user_name: issues.userName,
      })
      .from(issues);

    const filterQuery = [
      eq(issues.projectId, projectId),
      eq(issues.isProjectDeleted, false),
    ];

    if (status) {
      filterQuery.push(eq(issues.status, status));
    }

    if (priority) {
      filterQuery.push(eq(issues.priority, priority));
    }

    try {
      const result = await query
        .where(and(...filterQuery.filter(Boolean)))
        .orderBy(desc(issues.createdAt))
        .limit(limit)
        .offset(offset);
      return result as IssueOutput[];
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to all issues', error),
        {
          error,
          method: this.getAllIssues.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }

  async getTotalIssues(
    projectId: number,
    status?: IssueStatusType,
    priority?: IssuePriorityType,
  ): Promise<number> {
    const query = this.drizzleService
      .db()
      .select({ count: count() })
      .from(issues);

    const filterQuery = [
      eq(issues.projectId, projectId),
      eq(issues.isProjectDeleted, false),
    ];

    if (status) {
      filterQuery.push(eq(issues.status, status));
    }

    if (priority) {
      filterQuery.push(eq(issues.priority, priority));
    }

    try {
      const result = await query.where(and(...filterQuery.filter(Boolean)));
      return result[0].count;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to get total issues', error),
        {
          error,
          method: this.getTotalIssues.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }

  async getIssueById(issueId: number): Promise<IssueOutput[]> {
    try {
      const result = await this.drizzleService
        .db()
        .select({
          id: issues.id,
          title: issues.title,
          description: issues.description,
          status: issues.status,
          priority: issues.priority,
          project_id: issues.projectId,
          created_at: issues.createdAt,
          user_id: issues.userId,
          user_name: issues.userName,
        })
        .from(issues)
        .where(and(eq(issues.id, issueId), eq(issues.isProjectDeleted, false)));

      return result as IssueOutput[];
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to get issue by id', error),
        {
          error,
          method: this.getIssueById.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }

  async editIssue(
    issueId: number,
    userId: number,
    editedIssue: UpdateIssueInput,
    oldIssue: IssueOutput,
  ): Promise<{ id: number }[]> {
    const changes: {
      field: string;
      oldValue?: string;
      newValue?: string;
    }[] = [];

    const fields: (keyof UpdateIssueInput)[] = [
      'description',
      'priority',
      'status',
      'title',
    ];

    try {
      const result = await this.drizzleService.db().transaction(async (txn) => {
        const res = await txn
          .update(issues)
          .set(editedIssue)
          .where(eq(issues.id, issueId))
          .returning({ id: issues.id, userName: issues.userName });

        for (const field of fields) {
          if (
            oldIssue[field]?.toLowerCase() !== editedIssue[field]?.toLowerCase()
          ) {
            changes.push({
              field: field,
              oldValue: oldIssue[field],
              newValue: editedIssue[field],
            });
          }
        }

        await Promise.all(
          changes.map((c) =>
            this.issueHistorieRepository.addIssueHistory(
              {
                issue_id: issueId,
                type: `edit_${c.field}` as IssueHistoriesTypeInput,
                user_id: userId,
                old_value: c.oldValue,
                new_value: c.newValue,
                user_name: res[0].userName,
              },
              txn,
            ),
          ),
        );

        return res;
      });

      if (result.length !== 0) {
        this.loggingService.info('Edit issue success', {
          method: this.editIssue.name,
          service: this.service,
          issueId,
        });
      }

      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to edit issue', error),
        {
          error,
          method: this.editIssue.name,
          service: this.service,
        },
      );

      if (
        isPostgreError(
          (error as DrizzleQueryError).cause,
          postgreErrorCode.check,
        )
      ) {
        throw new UserError();
      }
      throw new ServerError();
    }
  }

  async updateUserData(
    userId: number,
    userName: string,
    updatedAt: string,
  ): Promise<void> {
    try {
      const result = await this.drizzleService
        .db()
        .update(issues)
        .set({ userName, lastUserEventUpdatedAt: updatedAt })
        .where(
          and(
            eq(issues.userId, userId),
            lt(issues.lastUserEventUpdatedAt, updatedAt),
          ),
        )
        .returning({ id: issues.id });

      if (result.length !== 0) {
        this.loggingService.info('Update user data on issue success', {
          method: this.updateUserData.name,
          service: this.service,
          issueId: result[0].id,
        });
      } else {
        this.loggingService.info('Skip update user data on issue', {
          method: this.updateUserData.name,
          service: this.service,
        });
      }

      return;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to update user data', error),
        {
          error,
          method: this.updateUserData.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }

  async updateProjectData(
    projectId: number,
    isProjectDeleted: boolean,
    eventAt: string,
  ): Promise<void> {
    try {
      const result = await this.drizzleService
        .db()
        .update(issues)
        .set({ isProjectDeleted, lastProjectEventUpdatedAt: eventAt })
        .where(
          and(
            eq(issues.projectId, projectId),
            lt(issues.lastProjectEventUpdatedAt, eventAt),
          ),
        )
        .returning({ id: issues.id });

      if (result.length !== 0) {
        this.loggingService.info('Update project data on issue success', {
          method: this.updateProjectData.name,
          service: this.service,
          issueId: result[0].id,
        });
      } else {
        this.loggingService.info('Skip update project data on issue', {
          method: this.updateProjectData.name,
          service: this.service,
        });
      }

      return;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to update project data', error),
        {
          error,
          method: this.updateProjectData.name,
          service: this.service,
        },
      );
      throw new ServerError();
    }
  }
}
