import { Pagination } from 'src/common/types/pagination.type';

export type Comment = {
  id: number;
  content: string;
  issue_id: number;
  user_id: number;
  user_name: string;
  created_at: string;
  last_event_updated_at: string;
};

export type NewCommentInput = Pick<
  Comment,
  'content' | 'issue_id' | 'user_id' | 'user_name'
>;

export type CommentOutput = Omit<Comment, 'last_event_updated_at'>;

export type CommentOutputPagination = {
  data: CommentOutput[];
  pagination: Pagination;
};
