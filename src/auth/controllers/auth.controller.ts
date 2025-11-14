import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Delete,
  Param,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../services/auth.service';
import type {
  LoginDto,
  AuthResponse,
  AuthenticatedUser,
  RefreshTokenDto,
  SessionInfo,
  SuperAdminLoginDto,
  SuperAdminAuthResponse,
} from '../interfaces/auth.interface';
import { Public } from '../decorators/auth.decorators';
import { GetUser, GetUserInfo } from '../decorators/user.decorators';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthResponse> {
    const sessionInfo: SessionInfo = {
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
      deviceId: req.headers['x-device-id'] as string,
    };
    console.log(sessionInfo);
    console.log(loginDto);
    return this.authService.login(loginDto, sessionInfo);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<AuthResponse> {
    const sessionInfo: SessionInfo = {
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
      deviceId: req.headers['x-device-id'] as string,
    };

    return this.authService.refreshToken(refreshTokenDto, sessionInfo);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: { refreshToken: string }) {
    return this.authService.logout(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(@GetUser() user: AuthenticatedUser) {
    return this.authService.logoutAll(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getUserSessions(@GetUser() user: AuthenticatedUser) {
    const sessions = await this.authService.getUserSessions(user.id);
    return {
      success: true,
      sessions,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:sessionId')
  async revokeSession(
    @GetUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
  ) {
    const revoked = await this.authService.revokeUserSession(
      user.id,
      sessionId,
    );

    return {
      success: revoked,
      message: revoked
        ? 'Sesión revocada exitosamente'
        : 'No se pudo revocar la sesión',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: AuthenticatedUser) {
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        esEmpleado: user.esEmpleado,
        cooperativaId: user.cooperativaId,
        roles: user.roles.map((role) => role.nombre),
        permisos: user.permisos,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@GetUserInfo() userInfo: unknown) {
    return {
      success: true,
      data: userInfo,
    };
  }

  @Public()
  @Get('health')
  healthCheck() {
    return {
      success: true,
      message: 'Auth service is running',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('super-admin/login')
  @HttpCode(HttpStatus.OK)
  async superAdminLogin(
    @Body() loginDto: SuperAdminLoginDto,
    @Req() req: Request,
  ): Promise<SuperAdminAuthResponse> {
    const sessionInfo: SessionInfo = {
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
      deviceId: req.headers['x-device-id'] as string,
    };

    return this.authService.superAdminLogin(loginDto, sessionInfo);
  }
}
