type JwtAuthData = {
  isValid: boolean;
  data: { id: number } | null;
};

export interface IJwtService {
  createAccessToken(id: number): Promise<string>;
  verifyAccessToken(token: string): Promise<JwtAuthData>;
}
