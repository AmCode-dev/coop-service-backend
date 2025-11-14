import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RefreshTokenService } from './refresh-token.service';
import {
  JwtPayload,
  LoginDto,
  AuthResponse,
  RefreshTokenDto,
  SessionInfo,
  UserPermission,
  SuperAdminLoginDto,
  SuperAdminAuthResponse,
  UsuarioCooperativaDetalle,
  RolConPermisos,
} from '../interfaces/auth-multi-tenant.interface';
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
          activo: true,
        },
        cooperativaId: Number(cooperativaId),
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
        persona: {
          select: {
            id: true,
            nombreCompleto: true,
            numeroSocio: true,
            estadoSocio: true,
          },
        },
      },
    });

    if (!usuarioCooperativa) {
      throw new UnauthorizedException(
        'Usuario no encontrado en esta cooperativa o credenciales inválidas',
      );
    }

    if (!usuarioCooperativa?.cooperativaId) {
      throw new UnauthorizedException('La cooperativa no está activa');
    }

    // Verificar password
    const isPasswordValid = await bcrypt.compare(
      password,
      usuarioCooperativa.usuario.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar tokens
    const tokens = await this.generateTokens(usuarioCooperativa, sessionInfo);

    return {
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: usuarioCooperativa.usuario.id,
          email: usuarioCooperativa.usuario.email,
          nombre: usuarioCooperativa.usuario.nombre,
          apellido: usuarioCooperativa.usuario.apellido,
          telefono: usuarioCooperativa.usuario.telefono || undefined,
          avatar: usuarioCooperativa.usuario.avatar || undefined,
          esEmpleado: usuarioCooperativa.esEmpleado,
          cooperativa: usuarioCooperativa.cooperativa,
          persona: usuarioCooperativa.persona
            ? {
                ...usuarioCooperativa.persona,
                numeroSocio:
                  usuarioCooperativa.persona.numeroSocio || undefined,
              }
            : undefined,
          roles: usuarioCooperativa.roles.map((ur) => ur.rol.nombre),
          permisos: this.extractUserPermissions(usuarioCooperativa.roles),
        },
        tokens: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token.token,
        },
      },
    };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
    sessionInfo: SessionInfo,
  ): Promise<AuthResponse> {
    const { refreshToken } = refreshTokenDto;

    // Validar refresh token
    const tokenData =
      await this.refreshTokenService.validateRefreshToken(refreshToken);

    if (!tokenData) {
      throw new UnauthorizedException('Token de actualización inválido');
    }

    // Buscar usuario actual con sus relaciones multi-tenant
    const usuarioCooperativa = await this.prisma.usuarioCooperativa.findFirst({
      where: {
        usuarioId: tokenData.usuarioId,
        // cooperativaId: tokenData.cooperativaId, // FIXME: Extraer del token
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
        persona: {
          select: {
            id: true,
            nombreCompleto: true,
            numeroSocio: true,
            estadoSocio: true,
          },
        },
      },
    });

    if (!usuarioCooperativa || !usuarioCooperativa.usuario.activo) {
      throw new UnauthorizedException('Usuario no activo o no autorizado');
    }

    // Revocar token actual y generar nuevos
    await this.refreshTokenService.revokeTokenByValue(refreshToken);
    const newTokens = await this.generateTokens(
      usuarioCooperativa,
      sessionInfo,
    );

    return {
      success: true,
      message: 'Token actualizado exitosamente',
      data: {
        user: {
          id: usuarioCooperativa.usuario.id,
          email: usuarioCooperativa.usuario.email,
          nombre: usuarioCooperativa.usuario.nombre,
          apellido: usuarioCooperativa.usuario.apellido,
          telefono: usuarioCooperativa.usuario.telefono || undefined,
          avatar: usuarioCooperativa.usuario.avatar || undefined,
          esEmpleado: usuarioCooperativa.esEmpleado,
          cooperativa: usuarioCooperativa.cooperativa,
          persona: usuarioCooperativa.persona
            ? {
                ...usuarioCooperativa.persona,
                numeroSocio:
                  usuarioCooperativa.persona.numeroSocio || undefined,
              }
            : undefined,
          roles: usuarioCooperativa.roles.map((ur) => ur.rol.nombre),
          permisos: this.extractUserPermissions(usuarioCooperativa.roles),
        },
        tokens: {
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token.token,
        },
      },
    };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.refreshTokenService.revokeTokenByValue(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.refreshTokenService.revokeAllUserTokens(userId);
  }

  // ==========================================
  // SUPER ADMIN LOGIN
  // ==========================================

  async superAdminLogin(
    loginDto: SuperAdminLoginDto,
    sessionInfo: SessionInfo,
  ): Promise<SuperAdminAuthResponse> {
    const { email, password } = loginDto;

    // Buscar usuario con email específico para SUPER_ADMIN
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: {
        cooperativas: {
          include: {
            cooperativa: {
              select: {
                id: true,
                nombre: true,
                razonSocial: true,
                activa: true,
              },
            },
            roles: {
              where: { activo: true },
              include: {
                rol: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que tiene permisos de super admin en al menos una cooperativa
    const isSuperAdmin = user.cooperativas.some((uc) =>
      uc.roles.some((r) => r.rol.nombre === 'SUPER_ADMIN'),
    );

    if (!isSuperAdmin) {
      throw new UnauthorizedException(
        'No tiene permisos de super administrador',
      );
    }

    // Verificar password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token especial para super admin
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tipo: 'SUPER_ADMIN',
      cooperativas: user.cooperativas.map((uc) => ({
        id: uc.cooperativa.id,
        nombre: uc.cooperativa.nombre,
        activa: uc.cooperativa.activa,
        roles: uc.roles.map((r) => r.rol.nombre),
      })),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
      sessionInfo,
    );

    return {
      success: true,
      message: 'Super Admin login exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          tipo: 'SUPER_ADMIN',
          cooperativas: user.cooperativas.map((uc) => ({
            id: uc.cooperativa.id,
            nombre: uc.cooperativa.nombre,
            razonSocial: uc.cooperativa.razonSocial,
            activa: uc.cooperativa.activa,
            roles: uc.roles.map((r) => r.rol.nombre),
          })),
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken.token,
        },
      },
    };
  }

  // ==========================================
  // REGISTRO DE USUARIOS MULTI-TENANT
  // ==========================================

  async registerUserInCooperativa(
    email: string,
    password: string,
    nombre: string,
    apellido: string,
    cooperativaId: number,
    esEmpleado: boolean = false,
    personaId?: string,
  ): Promise<{ usuarioId: string; usuarioCooperativaId: string }> {
    // Verificar si el usuario ya existe
    let usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      // Crear nuevo usuario
      const hashedPassword = await bcrypt.hash(password, 10);
      usuario = await this.prisma.usuario.create({
        data: {
          email,
          password: hashedPassword,
          nombre,
          apellido,
          activo: true,
        },
      });
    }

    // Verificar si ya está en esta cooperativa
    const usuarioCooperativaExiste =
      await this.prisma.usuarioCooperativa.findUnique({
        where: {
          usuarioId_cooperativaId: {
            usuarioId: usuario.id,
            cooperativaId,
          },
        },
      });

    if (usuarioCooperativaExiste) {
      throw new ConflictException(
        'El usuario ya está registrado en esta cooperativa',
      );
    }

    // Crear relación usuario-cooperativa
    const usuarioCooperativa = await this.prisma.usuarioCooperativa.create({
      data: {
        usuarioId: usuario.id,
        cooperativaId,
        esEmpleado,
        personaId,
        activo: true,
      },
    });

    return {
      usuarioId: usuario.id,
      usuarioCooperativaId: usuarioCooperativa.id,
    };
  }

  // ==========================================
  // UTILIDADES PRIVADAS
  // ==========================================

  private async generateTokens(
    usuarioCooperativa: UsuarioCooperativaDetalle,
    sessionInfo: SessionInfo,
  ) {
    const payload: JwtPayload = {
      sub: usuarioCooperativa.usuario.id,
      email: usuarioCooperativa.usuario.email,
      cooperativaId: usuarioCooperativa.cooperativa.id,
      esEmpleado: usuarioCooperativa.esEmpleado,
      personaId: usuarioCooperativa.personaId ?? '',
      roles: usuarioCooperativa.roles.map((ur) => ur.rol.nombre),
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      usuarioCooperativa.usuario.id,
      sessionInfo,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private extractUserPermissions(roles: RolConPermisos[]): UserPermission[] {
    const permissions: UserPermission[] = [];

    roles.forEach((userRole) => {
      userRole.rol.permisos.forEach((permiso) => {
        permissions.push({
          seccion: permiso.seccion.codigo,
          accion: permiso.accion,
        });
      });
    });

    return permissions;
  }

  // ==========================================
  // MÉTODOS AUXILIARES PARA COOPERATIVAS
  // ==========================================

  async getUserCooperativas(userId: string) {
    return this.prisma.usuarioCooperativa.findMany({
      where: {
        usuarioId: userId,
        activo: true,
      },
      include: {
        cooperativa: {
          select: {
            id: true,
            nombre: true,
            razonSocial: true,
            activa: true,
          },
        },
        roles: {
          where: { activo: true },
          include: {
            rol: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        persona: {
          select: {
            id: true,
            nombreCompleto: true,
            numeroSocio: true,
          },
        },
      },
    });
  }

  // async switchCooperativa(
  //   userId: string,
  //   cooperativaId: string,
  //   sessionInfo: SessionInfo,
  // ): Promise<AuthResponse> {
  //   const usuarioCooperativa = await this.prisma.usuarioCooperativa.findUnique({
  //     where: {
  //       usuarioId_cooperativaId: {
  //         usuarioId: userId,
  //         cooperativaId,
  //       },
  //     },
  //     include: {
  //       usuario: true,
  //       cooperativa: {
  //         select: {
  //           id: true,
  //           nombre: true,
  //           activa: true,
  //         },
  //       },
  //       roles: {
  //         where: { activo: true },
  //         include: {
  //           rol: {
  //             include: {
  //               permisos: {
  //                 include: {
  //                   seccion: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //       persona: {
  //         select: {
  //           id: true,
  //           nombreCompleto: true,
  //           numeroSocio: true,
  //           estadoSocio: true,
  //         },
  //       },
  //     },
  //   });

  //   if (!usuarioCooperativa || !usuarioCooperativa.activo) {
  //     throw new UnauthorizedException('No tiene acceso a esta cooperativa');
  //   }

  //   if (!usuarioCooperativa?.cooperativa.activa) {
  //     throw new UnauthorizedException('La cooperativa no está activa');
  //   }

  //   // Generar nuevos tokens para la nueva cooperativa
  //   const tokens = await this.generateTokens(usuarioCooperativa, sessionInfo);

  //   return {
  //     success: true,
  //     message: 'Cambio de cooperativa exitoso',
  //     data: {
  //       user: {
  //         id: (usuarioCooperativa as any).usuario.id,
  //         email: (usuarioCooperativa as any).usuario.email,
  //         nombre: (usuarioCooperativa as any).usuario.nombre,
  //         apellido: (usuarioCooperativa as any).usuario.apellido,
  //         telefono: (usuarioCooperativa as any).usuario.telefono || undefined,
  //         avatar: (usuarioCooperativa as any).usuario.avatar || undefined,
  //         esEmpleado: usuarioCooperativa.esEmpleado,
  //         cooperativa: (usuarioCooperativa)?.cooperativa,
  //         persona: (usuarioCooperativa as any).persona
  //           ? {
  //               ...(usuarioCooperativa as any).persona,
  //               numeroSocio:
  //                 (usuarioCooperativa as any).persona.numeroSocio || undefined,
  //             }
  //           : undefined,
  //         roles: (usuarioCooperativa as any).roles.map((ur) => ur.rol.nombre),
  //         permisos: this.extractUserPermissions((usuarioCooperativa as any).roles),
  //       },
  //       tokens,
  //     },
  //   };
  // }
}
