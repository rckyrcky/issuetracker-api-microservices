import { Pagination } from 'src/common/types/pagination.type';

export type IssueStatusType = 'open' | 'in progress' | 'closed';
export type IssuePriorityType = 'low' | 'medium' | 'high';

export type Issue = {
  id: number;
  title: string;
  description: string;
  status: IssueStatusType;
  priority: IssuePriorityType;
  project_id: number;
  is_project_deleted: boolean;
  user_id: number;
  user_name: string;
  created_at: string;
  last_project_event_updated_at: string;
  last_user_event_updated_at: string;
};

export type NewIssueInput = Pick<
  Issue,
  | 'title'
  | 'description'
  | 'status'
  | 'priority'
  | 'project_id'
  | 'user_id'
  | 'user_name'
>;

export type UpdateIssueInput = Pick<
  Issue,
  'title' | 'description' | 'status' | 'priority'
>;

export type IssueOutput = Omit<
  Issue,
  | 'last_project_event_updated_at'
  | 'last_user_event_updated_at'
  | 'is_project_deleted'
>;

export type IssueOutputPagination = {
  data: IssueOutput[];
  pagination: Pagination;
};
