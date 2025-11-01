import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';

import { AuthService } from './services/auth.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { SuperAdminService } from './services/super-admin.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './controllers/auth.controller';
import { SuperAdminController } from './controllers/super-admin.controller';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { AuthGuard } from './guards/auth.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      },
    }),
  ],
  controllers: [AuthController, SuperAdminController],
  providers: [
    AuthService,
    RefreshTokenService,
    SuperAdminService,
    JwtStrategy,
    JwtAuthGuard,
    PermissionGuard,
    AuthGuard,
    SuperAdminGuard,
    // Aplicar el guard de autenticación globalmente
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [
    AuthService,
    RefreshTokenService,
    SuperAdminService,
    JwtAuthGuard,
    PermissionGuard,
    AuthGuard,
    SuperAdminGuard,
  ],
})
export class AuthModule {}
