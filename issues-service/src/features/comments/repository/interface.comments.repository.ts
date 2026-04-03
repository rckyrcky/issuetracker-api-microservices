import { NewCommentInput, CommentOutput } from '../comments.type';

export interface ICommentsRepository {
  /**
   * Creates a new comment
   * @param comment
   * @param issueOwnerId
   * @param issueTitle
   */
  addComment(comment: NewCommentInput): Promise<{ id: number }[]>;

  /**
   * Gets all comments by issue ID
   * @param issueId
   * @param page
   * @param orderByDate
   */
  getAllCommentsByIssueId(
    issueId: number,
    page?: number,
    orderByDate?: 'ascending' | 'descending',
  ): Promise<CommentOutput[]>;

  /**
   * Gets total number of comments
   * @param issueId
   */
  getTotalComments(issueId: number): Promise<number>;

  /**
   * Gets an comment by ID
   * @param commentId
   */
  getCommentById(commentId: number): Promise<CommentOutput[]>;

  /**
   * Deletes an comment by ID
   * @param commentId
   */
  deleteComment(commentId: number): Promise<{ id: number }[]>;

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
