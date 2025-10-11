import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RefreshTokenService } from './refresh-token.service';
import { AuthErrorResponse } from '../responses/auth-error.response';
import {
  AuthenticatedUser,
  JwtPayload,
  LoginDto,
  AuthResponse,
  RefreshTokenDto,
  SessionInfo,
  UserPermission,
  SuperAdminLoginDto,
  SuperAdminAuthResponse,
} from '../interfaces/auth.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async login(
    loginDto: LoginDto,
    sessionInfo: SessionInfo,
  ): Promise<AuthResponse> {
    const { email, password, cooperativaId } = loginDto;

    // Buscar usuario y verificar que pertenece a la cooperativa
    const usuarioCooperativa = await this.prisma.usuarioCooperativa.findFirst({
      where: {
        usuario: { 
          email,
          activo: true 
        },
        cooperativaId,
        activo: true,
      },
      include: {
        usuario: true,
        cooperativa: {
          select: {
            id: true,
            nombre: true,
            activa: true,
          },
        },
        roles: {
          where: { activo: true },
          include: {
            rol: {
              include: {
                permisos: {
                  include: {
                    seccion: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!usuarioCooperativa) {
      throw new UnauthorizedException(
        AuthErrorResponse.userNotFound('Credenciales inválidas'),
      );
    }

    if (!usuarioCooperativa.cooperativa.activa) {
      throw new UnauthorizedException(
        AuthErrorResponse.invalidCooperativa('La cooperativa está inactiva'),
      );
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuarioCooperativa.usuario.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        AuthErrorResponse.unauthorized('Credenciales inválidas'),
      );
    }

    // Crear payload del JWT
    const payload: JwtPayload = {
      sub: usuarioCooperativa.usuario.id,
      email: usuarioCooperativa.usuario.email,
      cooperativaId: usuarioCooperativa.cooperativaId,
      esEmpleado: usuarioCooperativa.esEmpleado,
      roles: usuarioCooperativa.roles.map((ur) => ur.rol.nombre),
    };

    // Generar tokens
    const accessToken = this.jwtService.sign(payload);
    
    // Generar refresh token
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      usuarioCooperativa.usuario.id,
      sessionInfo,
    );

    return {
      success: true,
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: usuarioCooperativa.usuario.id,
        email: usuarioCooperativa.usuario.email,
        nombre: usuarioCooperativa.usuario.nombre,
        apellido: usuarioCooperativa.usuario.apellido,
        esEmpleado: usuarioCooperativa.esEmpleado,
        cooperativa: {
          id: usuarioCooperativa.cooperativa.id,
          nombre: usuarioCooperativa.cooperativa.nombre,
        },
      },
      expiresIn: 3600, // 1 hora para access token
      refreshExpiresIn: 30 * 24 * 60 * 60, // 30 días para refresh token
    };
  }

  async validateUser(payload: JwtPayload): Promise<AuthenticatedUser | null> {
    const usuarioCooperativa = await this.prisma.usuarioCooperativa.findFirst({
      where: {
        usuario: { 
          id: payload.sub,
          activo: true 
        },
        cooperativaId: payload.cooperativaId,
        activo: true,
      },
      include: {
        usuario: true,
        cooperativa: {
          select: {
            id: true,
            nombre: true,
            activa: true,
          },
        },
        roles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: {
                    seccion: true,
                  },
                },
              },
            },
          },
          where: {
            rol: {
              activo: true,
            },
          },
        },
      },
    });

    if (!usuarioCooperativa || !usuarioCooperativa.cooperativa.activa) {
      return null;
    }

    // Agrupar permisos por sección
    const permissionsMap = new Map<string, UserPermission>();

    usuarioCooperativa.roles.forEach((userRole) => {
      userRole.rol.permisos.forEach((rolePermiso) => {
        const sectionCode = rolePermiso.seccion.codigo;
        
        if (!permissionsMap.has(sectionCode)) {
          permissionsMap.set(sectionCode, {
            seccionId: rolePermiso.seccion.id,
            seccionCodigo: rolePermiso.seccion.codigo,
            seccionNombre: rolePermiso.seccion.nombre,
            acciones: [],
          });
        }

        const permission = permissionsMap.get(sectionCode)!;
        if (!permission.acciones.includes(rolePermiso.accion)) {
          permission.acciones.push(rolePermiso.accion);
        }
      });
    });

    return {
      id: usuarioCooperativa.usuario.id,
      email: usuarioCooperativa.usuario.email,
      nombre: usuarioCooperativa.usuario.nombre,
      apellido: usuarioCooperativa.usuario.apellido,
      cooperativaId: usuarioCooperativa.cooperativaId,
      esEmpleado: usuarioCooperativa.esEmpleado,
      activo: usuarioCooperativa.usuario.activo,
      roles: usuarioCooperativa.roles.map((ur) => ({
        id: ur.rol.id,
        nombre: ur.rol.nombre,
        descripcion: ur.rol.descripcion || undefined,
        esSistema: ur.rol.esSistema,
        activo: ur.rol.activo,
      })),
      permisos: Array.from(permissionsMap.values()),
    };
  }

  /**
   * Refresca el access token usando un refresh token válido
   */
  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
    sessionInfo: SessionInfo,
  ): Promise<AuthResponse> {
    const { refreshToken } = refreshTokenDto;

    // Validar y rotar el refresh token
    const newRefreshToken = await this.refreshTokenService.rotateRefreshToken(
      refreshToken,
      sessionInfo,
    );

    if (!newRefreshToken) {
      throw new UnauthorizedException(
        AuthErrorResponse.unauthorized('Refresh token inválido o expirado'),
      );
    }

    // Obtener información del usuario
    const usuarioCooperativa = await this.prisma.usuarioCooperativa.findFirst({
      where: {
        usuario: { 
          id: (newRefreshToken as any).usuarioId,
          activo: true 
        },
        activo: true,
      },
      include: {
        usuario: true,
        cooperativa: {
          select: {
            id: true,
            nombre: true,
            activa: true,
          },
        },
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });

    if (!usuarioCooperativa || !usuarioCooperativa.usuario.activo || !usuarioCooperativa.cooperativa.activa) {
      await this.refreshTokenService.revokeRefreshToken(
        (newRefreshToken as any).id,
      );
      throw new UnauthorizedException(
        AuthErrorResponse.unauthorized('Usuario o cooperativa inactivos'),
      );
    }

    // Crear payload del JWT
    const payload: JwtPayload = {
      sub: usuarioCooperativa.usuario.id,
      email: usuarioCooperativa.usuario.email,
      cooperativaId: usuarioCooperativa.cooperativaId,
      esEmpleado: usuarioCooperativa.esEmpleado,
      roles: usuarioCooperativa.roles.map((ur) => ur.rol.nombre),
    };

    // Generar nuevo access token
    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      accessToken,
      refreshToken: (newRefreshToken as any).token,
      user: {
        id: usuarioCooperativa.usuario.id,
        email: usuarioCooperativa.usuario.email,
        nombre: usuarioCooperativa.usuario.nombre,
        apellido: usuarioCooperativa.usuario.apellido,
        esEmpleado: usuarioCooperativa.esEmpleado,
        cooperativa: {
          id: usuarioCooperativa.cooperativa.id,
          nombre: usuarioCooperativa.cooperativa.nombre,
        },
      },
      expiresIn: 3600, // 1 hora para access token
      refreshExpiresIn: 30 * 24 * 60 * 60, // 30 días para refresh token
    };
  }

  /**
   * Cierra sesión revocando el refresh token
   */
  async logout(refreshToken: string): Promise<{ success: boolean }> {
    await this.refreshTokenService.revokeTokenByValue(refreshToken);
    return { success: true };
  }

  /**
   * Cierra todas las sesiones de un usuario
   */
  async logoutAll(userId: string): Promise<{ success: boolean }> {
    await this.refreshTokenService.revokeAllUserTokens(userId);
    return { success: true };
  }

  /**
   * Obtiene las sesiones activas de un usuario
   */
  async getUserSessions(userId: string) {
    return this.refreshTokenService.getUserActiveSessions(userId);
  }

  /**
   * Revoca una sesión específica de un usuario
   */
  async revokeUserSession(
    userId: string,
    sessionId: string,
  ): Promise<boolean> {
    return this.refreshTokenService.revokeUserSession(userId, sessionId);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Verifica si un usuario tiene permisos específicos
   */
  hasPermission(
    user: AuthenticatedUser,
    sectionCode: string,
    action: string,
  ): boolean {
    const permission = user.permisos.find(
      (p) => p.seccionCodigo === sectionCode,
    );
    
    if (!permission) {
      return false;
    }

    return permission.acciones.some(
      (a) => a.toString() === action.toUpperCase(),
    );
  }

  /**
   * Verifica si un usuario tiene al menos uno de los roles especificados
   */
  hasRole(user: AuthenticatedUser, roles: string[]): boolean {
    return user.roles.some((role) => roles.includes(role.nombre));
  }

  /**
   * Verifica si un usuario pertenece a la misma cooperativa
   */
  belongsToCooperativa(
    user: AuthenticatedUser,
    cooperativaId: string,
  ): boolean {
    return user.cooperativaId === cooperativaId;
  }

  /**
   * Login especial para SUPER_ADMIN - Acceso global al sistema
   */
  async superAdminLogin(
    loginDto: SuperAdminLoginDto,
    sessionInfo: SessionInfo,
  ): Promise<SuperAdminAuthResponse> {
    const { email, password, accessCode } = loginDto;

    // Verificar código de acceso adicional si está configurado
    const requiredAccessCode = process.env.SUPER_ADMIN_ACCESS_CODE;
    if (requiredAccessCode && accessCode !== requiredAccessCode) {
      throw new UnauthorizedException(
        AuthErrorResponse.unauthorized('Código de acceso inválido'),
      );
    }

    // Buscar usuario con email específico para SUPER_ADMIN
    const usuarioCooperativa = await this.prisma.usuarioCooperativa.findFirst({
      where: {
        usuario: {
          email,
          activo: true,
        },
        esEmpleado: true,
        cooperativa: {
          activa: true,
        },
        activo: true,
      },
      include: {
        usuario: true,
        cooperativa: {
          select: {
            id: true,
            nombre: true,
            activa: true,
          },
        },
        roles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: {
                    seccion: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!usuarioCooperativa) {
      throw new UnauthorizedException(
        AuthErrorResponse.userNotFound('Credenciales de SUPER_ADMIN inválidas'),
      );
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuarioCooperativa.usuario.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        AuthErrorResponse.unauthorized('Credenciales de SUPER_ADMIN inválidas'),
      );
    }

    // Verificar que el usuario tenga rol de SUPER_ADMIN o permisos de SYSTEM
    const isSuperAdmin = usuarioCooperativa.roles.some((ur) => 
      ur.rol.nombre === 'SUPER_ADMIN' || 
      ur.rol.esSistema === true ||
      ur.rol.permisos.some((p) => p.seccion.codigo === 'SYSTEM')
    );

    if (!isSuperAdmin) {
      throw new UnauthorizedException(
        AuthErrorResponse.unauthorized('Sin permisos de SUPER_ADMIN'),
      );
    }

    // Crear payload especial del JWT con permisos extendidos
    const payload: JwtPayload = {
      sub: usuarioCooperativa.usuario.id,
      email: usuarioCooperativa.usuario.email,
      cooperativaId: usuarioCooperativa.cooperativaId,
      esEmpleado: true,
      roles: ['SUPER_ADMIN', ...usuarioCooperativa.roles.map((ur) => ur.rol.nombre)],
    };

    // Generar tokens con tiempo extendido para SUPER_ADMIN
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.SUPER_ADMIN_JWT_EXPIRES_IN || '8h', // 8 horas por defecto
    });
    
    // Generar refresh token
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      usuarioCooperativa.usuario.id,
      {
        ...sessionInfo,
        userAgent: `SUPER_ADMIN - ${sessionInfo.userAgent}`,
      },
    );

    // Obtener todos los permisos disponibles en el sistema
    const allPermissions = await this.prisma.seccionSistema.findMany({
      select: {
        codigo: true,
      },
    });

    return {
      success: true,
      accessToken,
      refreshToken: (refreshToken as any).token,
      user: {
        id: usuarioCooperativa.usuario.id,
        email: usuarioCooperativa.usuario.email,
        nombre: usuarioCooperativa.usuario.nombre,
        apellido: usuarioCooperativa.usuario.apellido,
        isSuperAdmin: true,
      },
      permissions: [
        'SYSTEM_GLOBAL_ACCESS',
        'COOPERATIVAS_MANAGEMENT',
        'ONBOARDING_MANAGEMENT',
        'USER_MANAGEMENT',
        ...allPermissions.map(p => p.codigo.toUpperCase()),
      ],
      expiresIn: 8 * 60 * 60, // 8 horas
      refreshExpiresIn: 30 * 24 * 60 * 60, // 30 días
    };
  }
}