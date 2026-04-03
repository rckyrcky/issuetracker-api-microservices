import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserError } from '../exceptions';
import { CustomErrorMessages } from '../messages';
import { Request } from 'express';

@Injectable()
export class GuestGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = (request.cookies as Record<string, string>)
      ?.accessToken;

    if (accessToken || accessToken === '') {
      throw new UserError(CustomErrorMessages.etc.loggedIn);
    }

    return true;
  }
}
