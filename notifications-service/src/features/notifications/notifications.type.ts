import { CursorPagination } from 'src/common/types/pagination.type';

export type NotificationTypeInput = 'new_comment' | 'add_collaboration';
export type NotificationMessageInput =
  | 'left a comment on your issue'
  | 'added you as a collaborator on';
export type NotificationEntityTypeInput = 'issue' | 'project';

export type Notification = {
  id: number;
  user_id: number;
  user_name: string;
  actor_id: number;
  actor_name: string;
  type: NotificationTypeInput;
  entity_type: NotificationEntityTypeInput;
  entity_id: number;
  entity_name: string;
  message: NotificationMessageInput;
  is_read: boolean;
  created_at: string;
  last_event_updated_at: string;
};

export type NotificationInput = Pick<
  Notification,
  | 'user_id'
  | 'user_name'
  | 'type'
  | 'message'
  | 'actor_id'
  | 'actor_name'
  | 'entity_type'
  | 'entity_id'
  | 'entity_name'
>;

export type NotificationOutput = Omit<
  Notification,
  'user_id' | 'actor_id' | 'user_name' | 'last_event_updated_at'
>;

export type NotificationCursorOutput = {
  data: NotificationOutput[];
  pagination: CursorPagination;
};
