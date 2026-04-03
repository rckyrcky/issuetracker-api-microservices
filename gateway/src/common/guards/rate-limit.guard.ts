import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { type IRateLimitService } from '../interfaces/rate-limit.interface';
import { ConfigService } from '@nestjs/config';
import { RateLimitError } from '../exceptions';
import { type AuthRequest } from '../types/request.type';
import { RATELIMIT_SERVICE, APP_STATUS } from '../constants';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    @Inject(RATELIMIT_SERVICE)
    private readonly rateLimitService: IRateLimitService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.configService.get(APP_STATUS) !== 'production') {
      return true;
    }

    const req = context.switchToHttp().getRequest<AuthRequest>();
    const isLoginRoute = req.path === '/api/auth/login';
    const isSignupRoute = req.path === '/api/auth/signup';
    const mutationMethods = ['post', 'patch', 'delete'];
    const mutationMethod = mutationMethods.includes(req.method.toLowerCase());
    let success: boolean;

    if (isLoginRoute) {
      success = await this.rateLimitService.checkRateLimit(
        'login',
        `ip:${req.ip}`,
      );
    } else if (isSignupRoute) {
      success = await this.rateLimitService.checkRateLimit(
        'signup',
        `ip:${req.ip}`,
      );
    } else if (mutationMethod) {
      success = await this.rateLimitService.checkRateLimit(
        'mutation',
        `ip:${req.ip}_user-id:${req.authData!.id}`,
      );
    } else {
      return true;
    }

    if (!success) {
      throw new RateLimitError();
    }

    return true;
  }
}
