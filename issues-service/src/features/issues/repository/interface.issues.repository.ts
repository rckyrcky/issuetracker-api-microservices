import {
  NewIssueInput,
  IssueStatusType,
  IssuePriorityType,
  IssueOutput,
  UpdateIssueInput,
} from '../issues.type';

export interface IIssuesRepository {
  /**
   * Creates a new issue
   * @param issue
   */
  addIssue(issue: NewIssueInput): Promise<{ id: number }[]>;

  /**
   * Gets all issues by project ID
   * @param projectId
   * @param page
   * @param status
   * @param priority
   */
  getAllIssues(
    projectId: number,
    page: number,
    status?: IssueStatusType,
    priority?: IssuePriorityType,
  ): Promise<IssueOutput[]>;

  /**
   * Gets total number of issues by project ID
   * @param projectId
   * @param status
   * @param priority
   */
  getTotalIssues(
    projectId: number,
    status?: IssueStatusType,
    priority?: IssuePriorityType,
  ): Promise<number>;

  /**
   * Gets an issue by issue ID
   * @param issueId
   */
  getIssueById(issueId: number): Promise<IssueOutput[]>;

  /**
   * Edits an issue by issue ID
   * @param issueId
   * @param userId
   * @param editedIssue
   * @param oldIssue
   */
  editIssue(
    issueId: number,
    userId: number,
    editedIssue: UpdateIssueInput,
    oldIssue: IssueOutput,
  ): Promise<{ id: number }[]>;

  /**
   * Update user data
   * @param userId
   * @param userName
   * @param updatedAt
   */
  updateUserData(
    userId: number,
    userName: string,
    updatedAt: string,
  ): Promise<void>;

  /**
   * Update project data
   * @param projectId
   * @param isProjectDeleted
   */
  updateProjectData(
    projectId: number,
    isProjectDeleted: boolean,
    eventAt: string,
  ): Promise<void>;
}
