import { TipoAccion } from '../../../generated/prisma';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  cooperativaId: number | string;
  esEmpleado: boolean;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  cooperativaId: number;
  esEmpleado: boolean;
  activo: boolean;
  roles: UserRole[];
  permisos: UserPermission[];
}

export interface UserRole {
  id: string;
  nombre: string;
  descripcion?: string;
  esSistema: boolean;
  activo: boolean;
}

export interface UserPermission {
  seccionId: string;
  seccionCodigo: string;
  seccionNombre: string;
  acciones: TipoAccion[];
}

export interface LoginDto {
  email: string;
  password: string;
  cooperativaId?: number; // Opcional si el email es único globalmente
}

export interface SuperAdminLoginDto {
  email: string;
  password: string;
  accessCode?: string; // Código de acceso especial opcional
}

export interface SuperAdminAuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    isSuperAdmin: true;
  };
  permissions: string[];
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    esEmpleado: boolean;
    cooperativa: {
      id: number;
      nombre: string;
    };
  };
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface LogoutDto {
  refreshToken: string;
}

export interface SessionInfo {
  userAgent?: string;
  ipAddress?: string;
  deviceId?: string;
}

export interface PermissionContext {
  userId: string;
  cooperativaId: string;
  roles: string[];
  permisos: UserPermission[];
}
