import { Body, Controller, Delete, Param, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ParamsDto } from 'src/common/dto/params.dto';
import { CustomSuccessMessages } from 'src/common/messages';
import { type AuthRequest } from 'src/common/types/request.type';
import {
  NewCollaborationInputDto,
  UpdateCollaborationInputDto,
} from 'src/features/collaborations/collaborations.dto';
import { CollaborationsService } from 'src/features/collaborations/collaborations.service';

@ApiTags('Collaborations')
@Controller()
export class CollaborationsController {
  constructor(private readonly collaborationsService: CollaborationsService) {}

  @Post('projects/:project_id/collaborations')
  async create(
    @Param() params: ParamsDto,
    @Body() payload: NewCollaborationInputDto,
    @Req() req: AuthRequest,
  ) {
    const id = await this.collaborationsService.handlePostCollaboration(
      params.project_id!,
      payload.email,
      req.authData!.id!,
    );
    return {
      message: CustomSuccessMessages.collaborations.post,
      data: { id },
    };
  }

  @Delete('projects/:project_id/collaborations')
  async delete(
    @Param() params: ParamsDto,
    @Body() payload: UpdateCollaborationInputDto,
    @Req() req: AuthRequest,
  ) {
    const id = await this.collaborationsService.handleDeleteCollaboration(
      params.project_id!,
      payload.email,
      req.authData!.id!,
    );

    return {
      message: CustomSuccessMessages.collaborations.delete,
      data: { id },
    };
  }
}
