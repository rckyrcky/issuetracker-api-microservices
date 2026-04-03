export type RateLimitKey = 'login' | 'signup' | 'mutation';

export interface IRateLimitService {
  checkRateLimit(key: RateLimitKey, identifier: string): Promise<boolean>;
}
