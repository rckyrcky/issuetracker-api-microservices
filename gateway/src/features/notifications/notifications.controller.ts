import { Controller, Get, Param, Patch, Query, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CustomSuccessMessages } from 'src/common/messages';
import { type AuthRequest } from 'src/common/types/request.type';
import { QueryDto } from 'src/common/dto/query.dto';
import { ParamsDto } from 'src/common/dto/params.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('unread')
  async allUnread(@Req() req: AuthRequest) {
    const data =
      await this.notificationsService.handleGetAllUnreadNotifications(
        req.authData!.id!,
      );
    return {
      message: CustomSuccessMessages.fetch,
      data,
    };
  }

  @Get()
  async all(@Req() req: AuthRequest, @Query() query: QueryDto) {
    const data = await this.notificationsService.handleGetAllNotifications(
      req.authData!.id!,
      query.cursor,
    );

    return {
      message: CustomSuccessMessages.fetch,
      data,
    };
  }

  @Patch(':notification_id')
  async update(@Req() req: AuthRequest, @Param() params: ParamsDto) {
    const data = await this.notificationsService.handlePatchNotification(
      params.notification_id!,
      req.authData!.id!,
    );
    return {
      message: CustomSuccessMessages.update,
      data,
    };
  }
}
