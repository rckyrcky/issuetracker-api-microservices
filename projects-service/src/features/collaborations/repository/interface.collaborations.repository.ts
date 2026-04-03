import {
  NewCollaborationInput,
  CollaboratorOutput,
  CollaborationProjectOutput,
  NewCollaborationOutput,
} from '../collaborations.type';

export interface ICollaborationsRepository {
  /**
   * Creates a new collaboration
   * @param collaboration
   */
  addCollaboration(
    collaboration: NewCollaborationInput,
  ): Promise<NewCollaborationOutput[]>;

  /**
   * Gets list of collaborator by project ID
   * @param projectId
   */
  getListOfCollaborators(projectId: number): Promise<CollaboratorOutput[]>;

  /**
   * Gets list of collaboration project by user ID
   * @param userId
   * @param page
   */
  getListOfCollaborationProjects(
    userId: number,
    page?: number,
  ): Promise<CollaborationProjectOutput[]>;

  /**
   * Gets total numbers
   * @param userId
   */
  getTotalListOfCollaborationProjects(userId: number): Promise<number>;

  /**
   * Deletes a collaboration of project
   * @param projectId
   * @param userId
   */
  deleteCollaboration(
    projectId: number,
    userId: number,
  ): Promise<{ id: number }[]>;

  /**
   * Verifies if there is a collaboration with other user
   * @param projectId
   * @param userId
   */
  verifyCollaboration(
    projectId: number,
    userId: number,
  ): Promise<{ id: number }[]>;

  /**
   * Update user data
   * @param userId
   * @param updatedAt
   * @param name
   * @param email
   */
  updateUserData(
    userId: number,
    updatedAt: string,
    name?: string,
    email?: string,
  ): Promise<void>;
}
