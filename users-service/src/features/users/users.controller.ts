import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import {
  ISSUE_MS,
  NOTIFICATION_MS,
  PROJECT_MS,
  USER_CHANGE_PROFILE,
  USER_CHANGED,
  USER_VIEW_PROFILE,
  USER_VIEW_PROFILE_BY_EMAIL,
} from '../../common/constants';
import { UsersService } from './users.service';
import type { CurrentUserInfo, UserEditInput } from './users.type';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(PROJECT_MS)
    private readonly projectsClient: ClientProxy,
    @Inject(ISSUE_MS)
    private readonly issuesClient: ClientProxy,
    @Inject(NOTIFICATION_MS)
    private readonly notificationClient: ClientProxy,
  ) {}

  @MessagePattern(USER_VIEW_PROFILE)
  async me(@Payload() id: number): Promise<CurrentUserInfo> {
    const { email, name } = await this.usersService.getCurrentUser(id);

    return {
      id,
      name,
      email,
    };
  }

  @MessagePattern(USER_CHANGE_PROFILE)
  async update(
    @Payload('id') id: number,
    @Payload('data') data: UserEditInput,
  ): Promise<{ id: number }> {
    const result = await this.usersService.editUser(id, data);

    this.projectsClient.emit(USER_CHANGED, {
      id: result.id,
      name: data.name,
      email: data.email,
      updatedAt: result.updatedAt,
    });

    this.issuesClient.emit(USER_CHANGED, {
      id: result.id,
      name: data.name,
      email: data.email,
      updatedAt: result.updatedAt,
    });

    this.notificationClient.emit(USER_CHANGED, {
      id: result.id,
      name: data.name,
      email: data.email,
      updatedAt: result.updatedAt,
    });

    return { id: result.id };
  }

  @MessagePattern(USER_VIEW_PROFILE_BY_EMAIL)
  async getUserByEmail(@Payload() email: string): Promise<CurrentUserInfo> {
    return await this.usersService.getUserByEmail(email);
  }
}
