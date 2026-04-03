export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: string;
};

export type UserSignupInput = Pick<User, 'name' | 'email' | 'password'>;

export type UserLoginInput = Pick<User, 'email' | 'password'>;

export type UserLoginOutput = Pick<User, 'id' | 'password'>;

export type CurrentUserInfo = Pick<User, 'id' | 'name' | 'email'>;

export type UserEditInput = Partial<Pick<User, 'name' | 'email' | 'password'>>;
