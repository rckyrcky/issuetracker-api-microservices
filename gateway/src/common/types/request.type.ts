import { Request } from 'express';

export type AuthData = {
  isLogin: boolean;
  id: number | null;
};

export type AuthRequest = Request & { authData?: AuthData };
