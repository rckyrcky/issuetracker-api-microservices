import {
  NewProjectInput,
  ProjectOutput,
  UpdateProjectInput,
} from '../projects.type';

export interface IProjectsRepository {
  /**
   * Creates a new project
   * @param project
   */
  addProject(project: NewProjectInput): Promise<{ id: number }[]>;

  /**
   * Gets all non soft deleted projects by user ID
   * @param userId
   * @param page
   * @param search
   */
  getAllProjects(
    userId: number,
    page?: number,
    search?: string,
  ): Promise<ProjectOutput[]>;

  /**
   * Gets total numbers of projects
   * @param userId
   * @param search
   */
  getTotalProjects(userId: number, search?: string): Promise<number>;

  /**
   * Gets all soft deleted projects by user ID
   * @param userId
   * @param cursor
   */
  getAllSoftDeletedProjects(
    userId: number,
    cursor?: number,
  ): Promise<ProjectOutput[]>;

  /**
   * Gets a non soft deleted project by ID
   * @param projectId
   */
  getProjectById(projectId: number): Promise<ProjectOutput[]>;

  /**
   * Gets a soft deleted project by ID
   * @param projectId
   */
  getSoftDeletedProjectById(projectId: number): Promise<ProjectOutput[]>;

  /**
   * Edits a non soft deleted project by ID
   * @param projectId
   * @param project
   */
  editProject(
    projectId: number,
    project: UpdateProjectInput,
  ): Promise<{ id: number }[]>;

  /**
   * Soft deletes a project by ID
   * @param projectId
   */
  softDeleteProject(
    projectId: number,
  ): Promise<{ id: number; deletedAt: string | null }[]>;

  /**
   * Restores a soft deleted project by ID
   * @param projectId
   */
  restoreSoftDeletedProject(
    projectId: number,
  ): Promise<{ id: number; updatedAt: string }[]>;

  /**
   * Checks the project owner by user ID
   * @param projectId
   * @param userId
   */
  verifyProjectOwner(
    projectId: number,
    userId: number,
  ): Promise<ProjectOutput[]>;

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
