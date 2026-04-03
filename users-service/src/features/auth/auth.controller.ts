import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { USER_LOGIN, USER_SIGNUP } from '../../common/constants';
import type { UserLoginInput, UserSignupInput } from '../users/users.type';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(USER_SIGNUP)
  async signup(
    @Payload() payload: UserSignupInput,
  ): Promise<{ accessToken: string }> {
    return await this.authService.signup(payload);
  }

  @MessagePattern(USER_LOGIN)
  async login(
    @Payload() payload: UserLoginInput,
  ): Promise<{ accessToken: string }> {
    return await this.authService.login(payload);
  }
}
