import { CursorPagination } from 'src/common/types/pagination.type';

export type IssueHistoriesTypeInput =
  | 'add_comment'
  | 'add_issue'
  | 'edit_title'
  | 'edit_description'
  | 'edit_status'
  | 'edit_priority';

export type IssueHistories = {
  id: number;
  issue_id: number;
  user_id: number;
  user_name: string;
  type: IssueHistoriesTypeInput;
  old_value?: string;
  new_value?: string;
  created_at: string;
  last_event_updated_at: string;
};

export type IssueHistoriesInput = Pick<
  IssueHistories,
  'issue_id' | 'user_id' | 'user_name' | 'type' | 'old_value' | 'new_value'
>;

export type IssueHistoriesOutput = Pick<
  IssueHistories,
  'id' | 'type' | 'old_value' | 'new_value' | 'created_at' | 'user_name'
>;

export type IssueHistoriesCursorOutput = {
  data: IssueHistoriesOutput[];
  pagination: CursorPagination;
};
