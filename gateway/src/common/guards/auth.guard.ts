import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AuthenticationError } from 'src/common/exceptions';
import type { IJwtService } from 'src/common/interfaces/jwt.interface';
import { AuthData, AuthRequest } from '../types/request.type';
import { Reflector } from '@nestjs/core';
import { SKIP_AUTH_GUARD } from '../decorators';
import { JWT_SERVICE } from '../constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(JWT_SERVICE)
    private readonly jwtService: IJwtService,
    private readonly reflector: Reflector,
  ) {}

  private async isUserAuthenticated(req: AuthRequest): Promise<AuthData> {
    const accessToken = (req.cookies as Record<string, string>)?.accessToken;

    if (!accessToken) {
      return { isLogin: false, id: null };
    }

    const validatedAccessToken =
      await this.jwtService.verifyAccessToken(accessToken);

    if (!validatedAccessToken.isValid) {
      return { isLogin: false, id: null };
    }

    return {
      isLogin: true,
      id: validatedAccessToken.data!.id,
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipAuthGuard = this.reflector.getAllAndOverride<boolean>(
      SKIP_AUTH_GUARD,
      [context.getHandler(), context.getClass()],
    );

    if (skipAuthGuard) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const authData = await this.isUserAuthenticated(request);

    if (!authData.isLogin) {
      throw new AuthenticationError();
    }

    request.authData = authData;
    return true;
  }
}
