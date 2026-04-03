import { Inject, Injectable } from '@nestjs/common';
import { IUsersRepository } from './interface.users.repository';
import { DrizzleService } from 'src/services/databases/drizzle/drizzle.service';
import { users } from 'src/services/databases/drizzle/schema/schema';
import { DrizzleQueryError, eq } from 'drizzle-orm';
import {
  postgreErrorCode,
  ServerError,
  UserError,
} from 'src/common/exceptions';
import type ILoggingService from 'src/common/interfaces/logging.interface';
import { LOGGING_SERVICE } from 'src/common/constants';
import { generateErrorLogMessage, isPostgreError } from 'src/common/utils';
import { CustomErrorMessages } from 'src/common/messages';
import {
  UserSignupInput,
  UserLoginInput,
  UserLoginOutput,
  CurrentUserInfo,
  UserEditInput,
} from '../users.type';

@Injectable()
export class DrizzleUsersRepository implements IUsersRepository {
  constructor(
    private readonly drizzleService: DrizzleService,
    @Inject(LOGGING_SERVICE)
    private readonly loggingService: ILoggingService,
  ) {}

  private readonly service = this.constructor.name;

  async signup(user: UserSignupInput): Promise<{ id: number }[]> {
    try {
      const result = await this.drizzleService
        .db()
        .insert(users)
        .values(user)
        .returning({ id: users.id });

      if (result.length !== 0) {
        this.loggingService.info('Signup success', {
          id: result[0].id,
          service: this.service,
          method: this.signup.name,
        });
      }
      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to signup', error),
        { error, service: this.service, method: this.signup.name },
      );

      if (
        isPostgreError(
          (error as DrizzleQueryError).cause,
          postgreErrorCode.unique,
        )
      ) {
        throw new UserError(CustomErrorMessages.unique('email'));
      }

      throw new ServerError();
    }
  }

  async login(user: UserLoginInput): Promise<UserLoginOutput[]> {
    try {
      const result = await this.drizzleService
        .db()
        .select({ id: users.id, password: users.password })
        .from(users)
        .where(eq(users.email, user.email));
      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to login', error),
        {
          error,
          service: this.service,
          method: this.login.name,
        },
      );
      throw new ServerError();
    }
  }

  async getUserIdByEmail(email: string): Promise<CurrentUserInfo[]> {
    try {
      const result = await this.drizzleService
        .db()
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.email, email));

      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to get user id by email', error),
        { error, service: this.service, method: this.getUserIdByEmail.name },
      );
      throw new ServerError();
    }
  }

  async getUserById(id: number): Promise<CurrentUserInfo[]> {
    try {
      const result = await this.drizzleService
        .db()
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(eq(users.id, id));

      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to get user by id', error),
        { error, service: this.service, method: this.getUserById.name },
      );
      throw new ServerError();
    }
  }

  async editUser(
    id: number,
    user: UserEditInput,
  ): Promise<{ id: number; updatedAt: string }[] | null> {
    const fields: UserEditInput = {};

    for (const [key, value] of Object.entries(user)) {
      if (value !== undefined && value !== '') {
        fields[key] = value;
      }
    }

    if (Object.keys(fields).length === 0) return null;

    try {
      const result = await this.drizzleService
        .db()
        .update(users)
        .set({ ...fields, updatedAt: new Date().toISOString() })
        .where(eq(users.id, id))
        .returning({ id: users.id, updatedAt: users.updatedAt });

      if (result.length !== 0) {
        this.loggingService.info('User is updated', {
          method: this.editUser.name,
          service: this.service,
          id,
        });
      }
      return result;
    } catch (error) {
      this.loggingService.error(
        generateErrorLogMessage('Failed to update user', error),
        { error, method: this.editUser.name, service: this.service },
      );
      throw new ServerError();
    }
  }
}
