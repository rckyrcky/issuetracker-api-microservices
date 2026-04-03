import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import {
  USER_CHANGE_PROFILE,
  USER_LOGIN,
  USER_MS,
  USER_SIGNUP,
  USER_VIEW_PROFILE,
  USER_VIEW_PROFILE_BY_EMAIL,
} from 'src/common/constants';
import {
  CurrentUserInfo,
  UserEditInput,
  UserLoginInput,
  UserSignupInput,
} from './users.type';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_MS)
    private readonly client: ClientProxy,
  ) {}

  async handleSignup(payload: UserSignupInput): Promise<{
    accessToken: string;
  }> {
    return await firstValueFrom(
      this.client
        .send<{ accessToken: string }>(USER_SIGNUP, payload)
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handleLogin(payload: UserLoginInput) {
    return await firstValueFrom(
      this.client
        .send<{ accessToken: string }>(USER_LOGIN, payload)
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handleMe(id: number): Promise<CurrentUserInfo> {
    return await firstValueFrom(
      this.client
        .send<CurrentUserInfo>(USER_VIEW_PROFILE, id)
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handleUpdate(id: number, payload: UserEditInput) {
    return await firstValueFrom(
      this.client
        .send<{ id: number }>(USER_CHANGE_PROFILE, {
          id,
          data: payload,
        })
        .pipe(timeout({ first: 5_000 })),
    );
  }

  async handleGetUserByEmail(email: string): Promise<CurrentUserInfo> {
    return await firstValueFrom(
      this.client
        .send<CurrentUserInfo>(USER_VIEW_PROFILE_BY_EMAIL, email)
        .pipe(timeout({ first: 5_000 })),
    );
  }
}
