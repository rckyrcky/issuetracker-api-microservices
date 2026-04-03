import { Controller } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PROJECT_CHECK_PERMISSION } from 'src/common/constants';

@Controller()
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  @MessagePattern(PROJECT_CHECK_PERMISSION)
  async checkUserPermission(
    @Payload('project_id') projectId: number,
    @Payload('user_id') userId: number,
  ): Promise<boolean> {
    return await this.authorizationService.checkUserPermission(
      projectId,
      userId,
    );
  }
}
