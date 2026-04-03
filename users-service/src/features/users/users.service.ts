import { Inject, Injectable } from '@nestjs/common';
import { CurrentUserInfo, UserEditInput } from './users.type';
import { NotFoundError, UserError } from 'src/common/exceptions';
import { CustomErrorMessages } from 'src/common/messages';
import { ConfigService } from '@nestjs/config';
import type { IHashService } from 'src/common/interfaces/hash.interface';
import {
  USERS_REPOSITORY,
  HASH_SERVICE,
  APP_STATUS,
} from 'src/common/constants';
import type { IUsersRepository } from './repository/interface.users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: IUsersRepository,
    @Inject(HASH_SERVICE)
    private readonly hashService: IHashService,
  ) {}

  async getCurrentUser(id: number): Promise<CurrentUserInfo> {
    const result: CurrentUserInfo[] =
      await this.usersRepository.getUserById(id);

    if (result.length === 0) {
      throw new NotFoundError();
    }

    return result[0];
  }

  async editUser(
    id: number,
    user: UserEditInput,
  ): Promise<{ id: number; updatedAt: string }> {
    const demoIds = id === 1 || id === 2 || id === 3 || id === 4;
    if (demoIds && this.configService.get(APP_STATUS) === 'production') {
      throw new UserError('Demo account only!');
    }

    if (user.email) {
      const existingUser = await this.usersRepository.getUserIdByEmail(
        user.email,
      );

      if (existingUser.length !== 0 && existingUser[0].id !== id) {
        throw new UserError(CustomErrorMessages.unique('email'));
      }
    }

    const newData = {
      ...user,
    };

    if (user.password) {
      const hashedPassword = await this.hashService.hash(user.password);
      newData.password = hashedPassword;
    }

    const result = await this.usersRepository.editUser(id, newData);

    if (result?.length === 0) {
      throw new NotFoundError();
    }

    return result![0];
  }

  async getUserByEmail(email: string): Promise<CurrentUserInfo> {
    const result: CurrentUserInfo[] =
      await this.usersRepository.getUserIdByEmail(email);

    if (result.length === 0) {
      throw new NotFoundError();
    }

    return result[0];
  }
}
