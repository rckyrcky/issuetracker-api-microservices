import {
  IssueHistoriesInput,
  IssueHistoriesOutput,
} from '../issue.histories.type';

export interface IIssueHistoriesRepository {
  /**
   * Adds issue history
   * @param data
   * @param client
   */
  addIssueHistory(data: IssueHistoriesInput, client?: unknown): Promise<void>;

  /**
   * Gets all issue histories
   * @param issueId
   * @param cursor
   */
  getIssueHistories(
    issueId: number,
    cursor?: number,
  ): Promise<IssueHistoriesOutput[]>;

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
}
