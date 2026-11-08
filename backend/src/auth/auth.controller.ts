import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RequestUnlockDto } from './dto/request-unlock.dto';
import { UnlockAccountDto } from './dto/unlock-account.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './guards/public.decorator';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    organizationId: string;
    sessionId: string;
  };
}

@Controller(['auth', 'v1/auth'])
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshTokenCookie(res: Response, token: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/v1/auth',
    };

    res.cookie('bizpro_refresh_token', token, cookieOptions);
    res.cookie('refreshToken', token, cookieOptions);
  }

  private clearRefreshTokenCookie(res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    const clearOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
      path: '/api/v1/auth',
    };

    res.clearCookie('bizpro_refresh_token', clearOptions);
    res.clearCookie('refreshToken', clearOptions);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const metadata = {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      deviceId: loginDto.deviceId || (req.headers['x-device-id'] as string),
    };

    const result = await this.authService.login(loginDto, metadata);

    // Set HttpOnly refresh token cookie
    this.setRefreshTokenCookie(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      tokenType: 'Bearer',
      expiresIn: 900,
      user: result.user,
      session: {
        id: result.sessionId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
  }

  @Public()
  @Post('refresh/web')
  @HttpCode(HttpStatus.OK)
  async refreshWeb(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    // Phase 1D Web Refresh: Transport MUST be Cookie ONLY
    if (req.body && req.body.refreshToken) {
      throw new BadRequestException({
        code: 'AUTH_CREDENTIAL_TRANSPORT_INVALID',
        message: 'Endpoint Web chỉ chấp nhận Refresh Token qua Cookie. Không được gửi trong body.',
      });
    }

    const cookieToken =
      req.cookies?.['bizpro_refresh_token'] || req.cookies?.['refreshToken'];

    if (!cookieToken) {
      throw new BadRequestException({
        code: 'AUTH_REFRESH_TOKEN_REQUIRED',
        message: 'Không tìm thấy Refresh Token trong Cookie.',
      });
    }

    const result = await this.authService.refresh(
      cookieToken,
      idempotencyKey,
      req.originalUrl || '/api/v1/auth/refresh/web',
    );

    // Rotate Cookie
    this.setRefreshTokenCookie(res, result.refreshToken);

    if (result.fromIdempotentRecovery) {
      res.setHeader('X-Idempotency-Replay', 'true');
    }

    return {
      accessToken: result.accessToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    };
  }

  @Public()
  @Post('refresh/mobile')
  @HttpCode(HttpStatus.OK)
  async refreshMobile(
    @Req() req: Request,
    @Body() body: RefreshDto,
    @Headers('authorization') authHeader?: string,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    // Native Mobile: Token provided via Bearer or body
    let token = body?.refreshToken;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }

    if (!token) {
      throw new BadRequestException({
        code: 'AUTH_REFRESH_TOKEN_REQUIRED',
        message: 'Refresh token là bắt buộc đối với client Mobile.',
      });
    }

    const result = await this.authService.refresh(
      token,
      idempotencyKey,
      req.originalUrl || '/api/v1/auth/refresh/mobile',
    );

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Body() body: RefreshDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    // General refresh endpoint accepting either cookie or body
    const token =
      req.cookies?.['bizpro_refresh_token'] ||
      req.cookies?.['refreshToken'] ||
      body?.refreshToken;

    if (!token) {
      throw new BadRequestException({
        code: 'AUTH_REFRESH_TOKEN_REQUIRED',
        message: 'Vui lòng cung cấp Refresh Token trong Cookie hoặc request body.',
      });
    }

    const result = await this.authService.refresh(
      token,
      idempotencyKey,
      req.originalUrl || '/api/v1/auth/refresh',
    );

    this.setRefreshTokenCookie(res, result.refreshToken);

    if (result.fromIdempotentRecovery) {
      res.setHeader('X-Idempotency-Replay', 'true');
    }

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900,
    };
  }

  @Public()
  @Post('request-unlock')
  @HttpCode(HttpStatus.OK)
  async requestUnlock(@Body() dto: RequestUnlockDto) {
    return this.authService.requestUnlock(dto.email);
  }

  @Public()
  @Post('unlock')
  @HttpCode(HttpStatus.OK)
  async unlock(@Body() dto: UnlockAccountDto) {
    return this.authService.unlockAccount(dto.email, dto.otpCode);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = req.user?.sessionId;
    this.clearRefreshTokenCookie(res);

    if (sessionId) {
      await this.authService.logout(sessionId);
    }

    return {
      message: 'Đăng xuất thành công',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user?.userId;
    this.clearRefreshTokenCookie(res);

    if (userId) {
      await this.authService.logoutAll(userId);
    }

    return {
      message: 'Đăng xuất tất cả thiết bị thành công',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: RequestWithUser) {
    const userId = req.user?.userId;
    const orgId = req.user?.organizationId;

    if (!userId || !orgId) {
      throw new BadRequestException({
        code: 'AUTH_SESSION_INVALID',
        message: 'Không tìm thấy thông tin phiên làm việc hợp lệ.',
      });
    }

    return this.authService.getMe(userId, orgId);
  }
}
