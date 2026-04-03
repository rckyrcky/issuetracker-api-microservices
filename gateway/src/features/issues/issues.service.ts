import { Inject, Injectable } from '@nestjs/common';
import {
  IssueOutput,
  IssueOutputPagination,
  IssuePriorityType,
  IssueStatusType,
  NewIssueInput,
  UpdateIssueInput,
} from './issues.type';
import {
  ISSUE_CHANGE,
  ISSUE_CREATE,
  ISSUE_MS,
  ISSUE_VIEW_ALL,
  ISSUE_VIEW_DETAIL,
  USER_MS,
  USER_VIEW_PROFILE,
} from 'src/common/constants';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { NewIssueInputDto } from './issues.dto';

@Injectable()
export class IssuesService {
  constructor(
    @Inject(ISSUE_MS) private readonly issuesClient: ClientProxy,
    @Inject(USER_MS) private readonly usersClient: ClientProxy,
  ) {}

  async handlePostIssue(
    issue: NewIssueInputDto,
    projectId: number,
    userId: number,
  ): Promise<number> {
    const { name } = await firstValueFrom(
      this.usersClient
        .send<{
          id: number;
          name: string;
          email: string;
        }>(USER_VIEW_PROFILE, userId)
        .pipe(timeout({ first: 5_000 })),
    );

    const payload: NewIssueInput = {
      description: issue.description,
      priority: issue.priority,
      project_id: projectId,
      status: 'open',
      title: issue.title,
      user_id: userId,
      user_name: name,
    };

    return await firstValueFrom(
      this.issuesClient
        .send<number>(ISSUE_CREATE, payload)
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handleGetAllIssues(
    projectId: number,
    userId: number,
    page: number = 1,
    status?: IssueStatusType,
    priority?: IssuePriorityType,
  ): Promise<IssueOutputPagination> {
    return await firstValueFrom(
      this.issuesClient
        .send<IssueOutputPagination>(ISSUE_VIEW_ALL, {
          project_id: projectId,
          user_id: userId,
          page,
          status,
          priority,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handleGetIssueById(
    issueId: number,
    userId: number,
  ): Promise<IssueOutput> {
    return await firstValueFrom(
      this.issuesClient
        .send<IssueOutput>(ISSUE_VIEW_DETAIL, {
          issue_id: issueId,
          user_id: userId,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handlePatchIssue(
    issueId: number,
    userId: number,
    issue: UpdateIssueInput,
  ): Promise<number> {
    return await firstValueFrom(
      this.issuesClient
        .send<number>(ISSUE_CHANGE, {
          issue_id: issueId,
          user_id: userId,
          data: issue,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }
}
