/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable } from '@nestjs/common';
import { type IIssueHistoriesRepository } from './repository/interface.issue.histories.repository';
import { type IIssuesRepository } from '../issues/repository/interface.issues.repository';
import { IssueHistoriesCursorOutput } from './issue.histories.type';
import { NotFoundError, ServerError } from 'src/common/exceptions';
import { generateCursorPaginationData } from 'src/common/utils';
import {
  ISSUE_HISTORIES_REPOSITORY,
  ISSUES_REPOSITORY,
  PROJECT_CHECK_PERMISSION,
  PROJECT_MS,
} from 'src/common/constants';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError, timeout } from 'rxjs';

@Injectable()
export class IssueHistoriesService {
  constructor(
    @Inject(ISSUE_HISTORIES_REPOSITORY)
    private readonly issueHistoriesRepository: IIssueHistoriesRepository,
    @Inject(ISSUES_REPOSITORY)
    private readonly issuesRepository: IIssuesRepository,
    @Inject(PROJECT_MS)
    private readonly projectsClient: ClientProxy,
  ) {}

  async handleGetIssueHistories(
    issueId: number,
    userId: number,
    cursor?: number,
  ): Promise<IssueHistoriesCursorOutput> {
    const result = await this.issuesRepository.getIssueById(issueId);
    if (result.length === 0) {
      throw new NotFoundError();
    }

    await firstValueFrom(
      this.projectsClient
        .send<boolean>(PROJECT_CHECK_PERMISSION, {
          project_id: result[0].project_id,
          user_id: userId,
        })
        .pipe(
          timeout({ first: 5_000 }),
          catchError((err) => {
            if (err instanceof RpcException) {
              return throwError(() => err);
            }

            if (err?.statusCode) {
              return throwError(
                () =>
                  new RpcException({
                    statusCode: err.statusCode,
                    message: err.message,
                  }),
              );
            }

            return throwError(() => new ServerError());
          }),
        ),
    );

    const result2 = await this.issueHistoriesRepository.getIssueHistories(
      issueId,
      cursor,
    );

    const { data, hasMore, nextCursor } = generateCursorPaginationData(result2);

    return {
      data,
      pagination: { hasMore, nextCursor },
    };
  }

  async updateUser(
    userId: number,
    userName: string,
    updatedAt: string,
  ): Promise<void> {
    return await this.issueHistoriesRepository.updateUserData(
      userId,
      userName,
      updatedAt,
    );
  }
}
