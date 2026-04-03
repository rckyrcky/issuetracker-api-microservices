import { Pagination } from 'src/common/types/pagination.type';

export type Collaboration = {
  id: number;
  project_id: number;
  collaborator_id: number;
  collaborator_name: string;
  collaborator_email: string;
  owner_id: number;
  owner_name: string;
  owner_email: string;
  status: string;
  created_at: string;
};

export type NewCollaborationInput = Pick<
  Collaboration,
  | 'project_id'
  | 'collaborator_id'
  | 'collaborator_name'
  | 'collaborator_email'
  | 'owner_id'
  | 'owner_name'
  | 'owner_email'
>;

export type NewCollaborationOutput = Pick<
  Collaboration,
  'id' | 'project_id' | 'collaborator_id' | 'owner_id' | 'owner_name'
> & { project_name?: string };

export type CollaborationProjectOutput = {
  id: number;
  name: string;
  project_owner: string;
};

export type CollaborationProjectPaginationOutput = {
  data: CollaborationProjectOutput[];
  pagination: Pagination;
};

export type CollaboratorOutput = {
  collaborator_id: number;
  collaborator_name: string;
  collaborator_email: string;
};
