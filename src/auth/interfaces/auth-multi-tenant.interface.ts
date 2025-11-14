import { TipoAccion } from '../../../generated/prisma';

// ==========================================
// JWT PAYLOAD (Multi-Tenant)
// ==========================================

export interface JwtPayload {
  sub: string; // userId
  email: string;
  cooperativaId?: number; // Opcional para super admin
  esEmpleado?: boolean;
  personaId?: string;
  roles?: string[];
  tipo?: 'NORMAL' | 'SUPER_ADMIN';
  cooperativas?: CooperativaBasica[]; // Para super admin
  iat?: number;
  exp?: number;
}

// ==========================================
// USUARIO AUTENTICADO (Multi-Tenant)
// ==========================================

export interface AuthenticatedUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  avatar?: string;
  esEmpleado: boolean;
  cooperativa: CooperativaBasica;
  persona?: PersonaBasica;
  roles: string[];
  permisos: UserPermission[];
}

export interface SuperAdminUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  tipo: 'SUPER_ADMIN';
  cooperativas: CooperativaConRoles[];
}

// ==========================================
// COOPERATIVAS Y PERSONAS
// ==========================================

export interface CooperativaBasica {
  id: number;
  nombre: string;
  razonSocial?: string;
  activa: boolean;
}

export interface CooperativaConRoles extends CooperativaBasica {
  roles: string[];
}

export interface PersonaBasica {
  id: string;
  nombreCompleto: string;
  numeroSocio?: string;
  estadoSocio: string;
}

// ==========================================
// ROLES Y PERMISOS
// ==========================================

export interface UserRole {
  id: string;
  nombre: string;
  descripcion?: string;
  esSistema: boolean;
  activo: boolean;
}

export interface UserPermission {
  seccion: string; // código de la sección
  accion: TipoAccion;
}

// ==========================================
// DTOs DE LOGIN
// ==========================================

export interface LoginDto {
  email: string;
  password: string;
  cooperativaId: string; // Requerido en multi-tenant
}

export interface SuperAdminLoginDto {
  email: string;
  password: string;
  accessCode?: string; // Código de acceso especial opcional
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// ==========================================
// RESPUESTAS DE AUTENTICACIÓN
// ==========================================

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthenticatedUser;
    tokens: TokenPair;
  };
}

export interface SuperAdminAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: SuperAdminUser;
    tokens: TokenPair;
  };
}

// ==========================================
// INFORMACIÓN DE SESIÓN
// ==========================================

export interface SessionInfo {
  userAgent?: string;
  ipAddress?: string;
  deviceId?: string;
}

// ==========================================
// COOPERATIVAS DEL USUARIO
// ==========================================

export interface UserCooperativasResponse {
  success: boolean;
  data: {
    cooperativas: Array<{
      id: string;
      nombre: string;
      razonSocial: string;
      activa: boolean;
      roles: string[];
      persona?: PersonaBasica;
      fechaAlta: Date;
      activo: boolean;
    }>;
  };
}

// ==========================================
// CAMBIO DE COOPERATIVA
// ==========================================

export interface SwitchCooperativaDto {
  cooperativaId: string;
}

// ==========================================
// REGISTRO MULTI-TENANT
// ==========================================

export interface RegisterUserCooperativaDto {
  email: string;
  password?: string; // Opcional si el usuario ya existe
  nombre?: string; // Opcional si el usuario ya existe
  apellido?: string; // Opcional si el usuario ya existe
  telefono?: string;
  esEmpleado?: boolean;
  personaId?: string; // Para vincular con socio existente
  generarPassword?: boolean; // Para generar password automáticamente
  enviarCredenciales?: boolean; // Para enviar credenciales por email
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    usuarioId: string;
    usuarioCooperativaId: string;
    esNuevoUsuario: boolean;
    credencialesGeneradas?: {
      email: string;
      password: string;
      credencialesEnviadas: boolean;
    };
  };
}

// ==========================================
// TIPOS PARA OPERACIONES INTERNAS
// ==========================================

export interface UsuarioCooperativaDetalle {
  usuario: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    telefono: string | null;
    avatar: string | null;
  };
  esEmpleado: boolean;
  cooperativa: {
    id: number;
    nombre: string;
    activa: boolean;
  };
  persona: {
    id: string;
    nombreCompleto: string;
    numeroSocio: string | null;
  } | null;
  roles: {
    rol: { nombre: string };
  }[];
  personaId: string | null;
}

export interface RolConPermisos {
  rol: {
    permisos: {
      seccion: { codigo: string };
      accion: TipoAccion;
    }[];
  };
}
