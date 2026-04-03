import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  ISSUE_CHANGE,
  ISSUE_CREATE,
  ISSUE_VIEW_ALL,
  ISSUE_VIEW_DETAIL,
  PROJECT_DELETED,
  PROJECT_RESTORED,
} from 'src/common/constants';
import { IssuesService } from 'src/features/issues/issues.service';
import type {
  IssueOutput,
  IssueOutputPagination,
  IssuePriorityType,
  IssueStatusType,
  NewIssueInput,
  UpdateIssueInput,
} from './issues.type';

@Controller()
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @MessagePattern(ISSUE_VIEW_DETAIL)
  async detail(
    @Payload('issue_id') issueId: number,
    @Payload('user_id') userId: number,
  ): Promise<IssueOutput> {
    return await this.issuesService.handleGetIssueById(issueId, userId);
  }

  @MessagePattern(ISSUE_CHANGE)
  async update(
    @Payload('issue_id') issueId: number,
    @Payload('user_id') userId: number,
    @Payload('data') payload: UpdateIssueInput,
  ): Promise<number> {
    return await this.issuesService.handlePatchIssue(issueId, userId, payload);
  }

  @MessagePattern(ISSUE_CREATE)
  async create(@Payload() payload: NewIssueInput): Promise<number> {
    return await this.issuesService.handlePostIssue({
      ...payload,
      status: 'open',
    });
  }

  @MessagePattern(ISSUE_VIEW_ALL)
  async all(
    @Payload('project_id') projectId: number,
    @Payload('user_id') userId: number,
    @Payload('page') page?: number,
    @Payload('status') status?: IssueStatusType,
    @Payload('priority') priority?: IssuePriorityType,
  ): Promise<IssueOutputPagination> {
    return await this.issuesService.handleGetAllIssues(
      projectId,
      userId,
      page,
      status,
      priority,
    );
  }

  @EventPattern(PROJECT_DELETED)
  async updateProjectDeleted(
    @Payload()
    data: {
      id: number;
      deletedAt: string | null;
    },
  ) {
    return await this.issuesService.updateProject(
      data.id,
      true,
      data.deletedAt!,
    );
  }

  @EventPattern(PROJECT_RESTORED)
  async updateProjectRestored(
    @Payload()
    data: {
      id: number;
      updatedAt: string;
    },
  ) {
    return await this.issuesService.updateProject(
      data.id,
      false,
      data.updatedAt,
    );
  }
}
