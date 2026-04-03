import { Inject, Injectable } from '@nestjs/common';
import type ILoggingService from 'src/common/interfaces/logging.interface';
import { DrizzleService } from 'src/services/databases/drizzle/drizzle.service';
import { TxnClient } from 'src/services/databases/drizzle/drizzle.type';
import { issueHistories } from 'src/services/databases/drizzle/schema/schema';
import {
  IssueHistoriesInput,
  IssueHistoriesOutput,
} from '../issue.histories.type';
import { ServerError } from 'src/common/exceptions';
import { generateErrorLogMessage } from 'src/common/utils';
import { and, desc, eq, lt, ne } from 'drizzle-orm';
import { IIssueHistoriesRepository } from './interface.issue.histories.repository';
import { LOGGING_SERVICE } from 'src/common/constants';

@Injectable()
export class DrizzleIssueHistoriesRepository implements IIssueHistoriesRepository {
  constructor(
    private readonly drizzleService: DrizzleService,
    @Inject(LOGGING_SERVICE)
    private readonly loggingService: ILoggingService,
  ) {}

  private readonly service = this.constructor.name;

  async addIssueHistory(
    data: IssueHistoriesInput,
    client?: TxnClient<{ issueHistories: typeof issueHistories }>,
  ): Promise<void> {
    if (!client) {
      this.loggingService.error('Client is not defined', {
        error: 'client is not defined',
        method: this.addIssueHistory.name,
        service: this.service,
      });
      throw new ServerError();
    }

    await client.insert(issueHistories).values({
      issueId: data.issue_id,
      userId: data.user_id,
      userName: data.user_name,
      type: data.type,
      oldValue: data.old_value ?? null,
      newValue: data.new_value ?? null,
    });
  }

  async getIssueHistories(
    issueId: number,
    cursor?: number,
  ): Promise<IssueHistoriesOutput[]> {
    const limit = 10;

    const query = this.drizzleService
      .db()
      .select({
        id: issueHistories.id,
        type: issueHistories.type,
        old_value: issueHistories.oldValue,
        new_value: issueHistories.newValue,
        created_at: issueHistories.createdAt,
        user_name: issueHistories.userName,
      })
      .from(issueHistories);

    const filterQuery = [
      eq(issueHistories.issueId, issueId),
      ne(issueHistories.type, 'add_comment'),
    ];

    if (typeof cursor === 'number') {
      filterQuery.push(lt(issueHistories.id, cursor));
    }

    try {
      const result = await query
        .where(and(...filterQuery.filter(Boolean)))
        .orderBy(desc(issueHistories.id))
        .limit(limit + 1);
      return result as IssueHistoriesOutput[];
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to get issue histories', error),
        {
          error,
          method: this.getIssueHistories.name,
          service: this.service,
        },
      );
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
        .update(issueHistories)
        .set({ userName, lastEventUpdatedAt: updatedAt })
        .where(
          and(
            eq(issueHistories.userId, userId),
            lt(issueHistories.lastEventUpdatedAt, updatedAt),
          ),
        )
        .returning({ id: issueHistories.id });

      if (result.length !== 0) {
        this.loggingService.info(
          'Update user data on issue histories success',
          {
            method: this.updateUserData.name,
            service: this.service,
            issueId: result[0].id,
          },
        );
      } else {
        this.loggingService.info('Skip update user data on issue histories', {
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
}
