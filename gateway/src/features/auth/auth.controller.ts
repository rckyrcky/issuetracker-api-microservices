import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { CustomSuccessMessages } from 'src/common/messages';
import { GuestGuard } from 'src/common/guards/guest.guard';
import type { AuthRequest } from 'src/common/types/request.type';
import { SkipAuthGuard } from 'src/common/decorators';
import { APP_STATUS } from 'src/common/constants';
import {
  UserEditInputDto,
  UserLoginInputDto,
  UserSignupInputDto,
} from './users.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @SkipAuthGuard()
  @UseGuards(GuestGuard)
  @Post('signup')
  async signup(
    @Body() payload: UserSignupInputDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken } = await this.authService.handleSignup(payload);

    res.cookie('accessToken', accessToken, this.generateCookieOption());

    return { message: CustomSuccessMessages.signup };
  }

  @SkipAuthGuard()
  @UseGuards(GuestGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() payload: UserLoginInputDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken } = await this.authService.handleLogin(payload);

    res.cookie('accessToken', accessToken, this.generateCookieOption());

    return { message: CustomSuccessMessages.login };
  }

  @Get('me')
  async me(@Req() req: AuthRequest) {
    const { email, name } = await this.authService.handleMe(req.authData!.id!);

    return {
      message: CustomSuccessMessages.fetch,
      data: {
        id: req.authData!.id,
        name,
        email,
      },
    };
  }

  @Patch('me')
  async update(@Body() payload: UserEditInputDto, @Req() req: AuthRequest) {
    const data = await this.authService.handleUpdate(
      req.authData!.id!,
      payload,
    );

    return {
      data,
      message: CustomSuccessMessages.users.patch,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('accessToken', '', this.generateCookieOption({ maxAge: 0 }));

    return { message: CustomSuccessMessages.logout };
  }

  private generateCookieOption(cookieOptions?: CookieOptions): CookieOptions {
    return {
      httpOnly: true,
      secure: this.configService.get(APP_STATUS) === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      ...cookieOptions,
    };
  }
}
