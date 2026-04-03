import { Inject, Injectable } from '@nestjs/common';

import { UserError } from 'src/common/exceptions';
import { CustomErrorMessages } from 'src/common/messages';
import {
  HASH_SERVICE,
  JWT_SERVICE,
  USERS_REPOSITORY,
} from '../../common/constants';
import type {
  UserSignupInput,
  UserLoginInput,
  UserLoginOutput,
} from '../users/users.type';
import type { IJwtService } from '../../common/interfaces/jwt.interface';
import type { IHashService } from '../../common/interfaces/hash.interface';
import type { IUsersRepository } from '../users/repository/interface.users.repository';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,

    @Inject(HASH_SERVICE)
    private readonly hashService: IHashService,

    @Inject(JWT_SERVICE)
    private readonly jwtService: IJwtService,
  ) {}

  async signup(user: UserSignupInput): Promise<{ accessToken: string }> {
    const hashedPassword = await this.hashService.hash(user.password);
    const data: UserSignupInput = {
      name: user.name,
      email: user.email,
      password: hashedPassword,
    };

    const result = await this.usersRepository.signup(data);
    const accessToken = await this.jwtService.createAccessToken(result[0].id);

    return { accessToken };
  }

  async login(user: UserLoginInput): Promise<{ accessToken: string }> {
    const result: UserLoginOutput[] = await this.usersRepository.login(user);
    if (result.length === 0) {
      throw new UserError(CustomErrorMessages.etc.failedLogin);
    }

    const hashedPassword = result[0].password;
    const isValid = await this.hashService.verify(
      user.password,
      hashedPassword,
    );

    if (!isValid) {
      throw new UserError(CustomErrorMessages.etc.failedLogin);
    }

    const accessToken = await this.jwtService.createAccessToken(result[0].id);

    return { accessToken };
  }
}
