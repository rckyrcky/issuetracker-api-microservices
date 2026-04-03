import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ParamsDto } from 'src/common/dto/params.dto';
import { QueryDto } from 'src/common/dto/query.dto';
import { CustomSuccessMessages } from 'src/common/messages';
import type { AuthRequest } from 'src/common/types/request.type';
import { NewProjectInputDto, UpdateProjectInputDto } from './projects.dto';
import { AuthService } from '../auth/auth.service';
import { CollaborationsService } from '../collaborations/collaborations.service';

@Controller()
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly authService: AuthService,
    private readonly collaborationsService: CollaborationsService,
  ) {}

  @Get('projects/restore')
  async allDeleted(@Req() req: AuthRequest, @Query() query: QueryDto) {
    const data = await this.projectsService.handleGetAllSoftDeletedProjects(
      req.authData!.id!,
      query.cursor,
    );

    return {
      message: CustomSuccessMessages.fetch,
      data,
    };
  }

  @Get('projects/collaborations')
  async allCollaborations(@Query() query: QueryDto, @Req() req: AuthRequest) {
    const data =
      await this.collaborationsService.handleGetAllColaborationProjects(
        req.authData!.id!,
        query.page,
      );

    return {
      message: CustomSuccessMessages.fetch,
      data,
    };
  }

  @Patch('projects/:project_id/restore')
  async restore(@Req() req: AuthRequest, @Param() params: ParamsDto) {
    const id = await this.projectsService.handleRestoreSoftDeletedProject(
      params.project_id!,
      req.authData!.id!,
    );

    return {
      message: CustomSuccessMessages.projects.restore,
      data: {
        id,
      },
    };
  }

  @Post('projects')
  async create(@Body() payload: NewProjectInputDto, @Req() req: AuthRequest) {
    const { email: user_email, name: user_name } =
      await this.authService.handleMe(req.authData!.id!);

    const id = await this.projectsService.handlePostProject({
      ...payload,
      user_email,
      user_name,
      user_id: req.authData!.id!,
    });

    return {
      message: CustomSuccessMessages.projects.post,
      data: {
        id,
      },
    };
  }

  @Get('projects')
  async all(@Req() req: AuthRequest, @Query() query: QueryDto) {
    const data = await this.projectsService.handleGetAllProjects(
      req.authData!.id!,
      query.page,
      query.search,
    );

    return {
      message: CustomSuccessMessages.fetch,
      data,
    };
  }

  @Get('projects/:project_id')
  async detail(@Param() params: ParamsDto, @Req() req: AuthRequest) {
    const data = await this.projectsService.handleGetProjectById(
      params.project_id!,
      req.authData!.id!,
    );

    return {
      message: CustomSuccessMessages.fetch,
      data,
    };
  }

  @Patch('projects/:project_id')
  async update(
    @Param() params: ParamsDto,
    @Req() req: AuthRequest,
    @Body() payload: UpdateProjectInputDto,
  ) {
    const id = await this.projectsService.handlePatchProject(
      params.project_id!,
      req.authData!.id!,
      payload,
    );

    return {
      message: CustomSuccessMessages.projects.patch,
      data: { id },
    };
  }

  @Delete('projects/:project_id')
  async delete(@Param() params: ParamsDto, @Req() req: AuthRequest) {
    const id = await this.projectsService.handleSoftDeleteProject(
      params.project_id!,
      req.authData!.id!,
    );

    return {
      message: CustomSuccessMessages.projects.delete,
      data: { id },
    };
  }
}
