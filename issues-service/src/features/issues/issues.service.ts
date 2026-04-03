/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable } from '@nestjs/common';
import { type IIssuesRepository } from './repository/interface.issues.repository';
import { NotFoundError, ServerError } from 'src/common/exceptions';
import {
  IssueOutput,
  IssueOutputPagination,
  IssuePriorityType,
  IssueStatusType,
  NewIssueInput,
  UpdateIssueInput,
} from './issues.type';
import { generatePaginationData } from 'src/common/utils';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import {
  ISSUES_REPOSITORY,
  PROJECT_CHECK_PERMISSION,
  PROJECT_MS,
  PROJECT_VIEW_DETAIL,
} from 'src/common/constants';
import { catchError, firstValueFrom, throwError, timeout } from 'rxjs';

@Injectable()
export class IssuesService {
  constructor(
    @Inject(ISSUES_REPOSITORY)
    private readonly issuesRepository: IIssuesRepository,
    @Inject(PROJECT_MS)
    private readonly projectsClient: ClientProxy,
  ) {}

  /**
   * Checks if project is already soft deleted
   * @param projectId
   */
  async isProjectSoftDeleted(projectId: number, userId: number) {
    return await firstValueFrom(
      this.projectsClient
        .send<{ id: number }>(PROJECT_VIEW_DETAIL, {
          project_id: projectId,
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
  }

  /**
   * Check user permission
   * @param projectId
   * @param userId
   * @returns
   */
  async checkUserPermission(projectId: number, userId: number) {
    return await firstValueFrom(
      this.projectsClient
        .send<boolean>(PROJECT_CHECK_PERMISSION, {
          project_id: projectId,
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
  }

  async handlePostIssue(issue: NewIssueInput): Promise<number> {
    await this.isProjectSoftDeleted(issue.project_id, issue.user_id);

    await this.checkUserPermission(issue.project_id, issue.user_id);

    const result = await this.issuesRepository.addIssue(issue);
    return result[0].id;
  }

  async handleGetAllIssues(
    projectId: number,
    userId: number,
    page: number = 1,
    status?: IssueStatusType,
    priority?: IssuePriorityType,
  ): Promise<IssueOutputPagination> {
    await this.isProjectSoftDeleted(projectId, userId);

    await this.checkUserPermission(projectId, userId);

    const [issues, total] = await Promise.all([
      this.issuesRepository.getAllIssues(projectId, page, status, priority),
      this.issuesRepository.getTotalIssues(projectId, status, priority),
    ]);

    const { hasMorePage, nextPage, totalPages, limit } = generatePaginationData(
      total,
      page,
    );

    return {
      data: issues,
      pagination: {
        total,
        page,
        totalPages,
        hasMorePage,
        nextPage,
        limit,
      },
    };
  }

  async handleGetIssueById(
    issueId: number,
    userId: number,
  ): Promise<IssueOutput> {
    const result = await this.issuesRepository.getIssueById(issueId);
    if (result.length === 0) {
      throw new NotFoundError();
    }

    await this.checkUserPermission(result[0].project_id, userId);
    return result[0];
  }

  async handlePatchIssue(
    issueId: number,
    userId: number,
    issue: UpdateIssueInput,
  ): Promise<number> {
    const oldIssue = await this.handleGetIssueById(issueId, userId);
    const result = await this.issuesRepository.editIssue(
      issueId,
      userId,
      issue,
      oldIssue,
    );
    if (result.length === 0) {
      throw new NotFoundError();
    }
    return result[0].id;
  }

  async updateUser(
    userId: number,
    userName: string,
    updatedAt: string,
  ): Promise<void> {
    await this.issuesRepository.updateUserData(userId, userName, updatedAt);
  }

  async updateProject(
    projectId: number,
    isProjectDeleted: boolean,
    eventAt: string,
  ): Promise<void> {
    await this.issuesRepository.updateProjectData(
      projectId,
      isProjectDeleted,
      eventAt,
    );
  }
}
