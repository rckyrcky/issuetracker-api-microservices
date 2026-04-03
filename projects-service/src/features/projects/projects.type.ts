import { CursorPagination, Pagination } from 'src/common/types/pagination.type';
import { CollaboratorOutput } from '../collaborations/collaborations.type';

export type Project = {
  id: number;
  name: string;
  user_id: number;
  user_name: string;
  user_email: string;
  created_at: string;
  deleted_at: string | null;
  updated_at: string;
  last_event_updated_at: string;
};

export type NewProjectInput = Pick<
  Project,
  'name' | 'user_id' | 'user_name' | 'user_email'
>;

export type UpdateProjectInput = Pick<Project, 'name'>;

export type ProjectOutput = {
  id: number;
  name: string;
  collaborator?: CollaboratorOutput[];
};

export type ProjectPaginationOutput = {
  data: ProjectOutput[];
  pagination: Pagination;
};

export type ProjectCursorOutput = {
  data: ProjectOutput[];
  pagination: CursorPagination;
};
