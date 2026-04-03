import {
  UserSignupInput,
  UserLoginInput,
  UserLoginOutput,
  CurrentUserInfo,
  UserEditInput,
} from '../users.type';

export interface IUsersRepository {
  /**
   * Handles user signup
   * @param user
   */
  signup(user: UserSignupInput): Promise<{ id: number }[]>;

  /**
   * Handles user login
   * @param userId
   */
  login(user: UserLoginInput): Promise<UserLoginOutput[]>;

  /**
   * Gets user by email
   * @param email
   */
  getUserIdByEmail(email: string): Promise<CurrentUserInfo[]>;

  /**
   * Gets user by ID
   * @param id
   */
  getUserById(id: number): Promise<CurrentUserInfo[]>;

  /**
   * Edits user
   * @param id
   * @param user
   */
  editUser(
    id: number,
    user: UserEditInput,
  ): Promise<{ id: number; updatedAt: string }[] | null>;
}
