import { SetMetadata } from '@nestjs/common';

// Constantes para metadatos
export const IS_PUBLIC_KEY = 'isPublic';
export const REQUIRED_PERMISSIONS_KEY = 'requiredPermissions';
export const REQUIRED_ROLES_KEY = 'requiredRoles';

/**
 * Marca un endpoint o controller como público (no requiere autenticación)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Marca un endpoint o controller como privado (requiere autenticación)
 * Este es el comportamiento por defecto, pero se puede usar para claridad
 */
export const Private = () => SetMetadata(IS_PUBLIC_KEY, false);

/**
 * Requiere permisos específicos para acceder al endpoint
 * @param section - Código de la sección del sistema
 * @param actions - Acciones requeridas en esa sección
 */
export const RequirePermissions = (section: string, ...actions: string[]) =>
  SetMetadata(REQUIRED_PERMISSIONS_KEY, { section, actions });

/**
 * Requiere roles específicos para acceder al endpoint
 * @param roles - Nombres de los roles requeridos
 */
export const RequireRoles = (...roles: string[]) =>
  SetMetadata(REQUIRED_ROLES_KEY, roles);

/**
 * Decoradores de conveniencia para permisos comunes
 */
export const CanRead = (section: string) => RequirePermissions(section, 'READ');

export const CanWrite = (section: string) => RequirePermissions(section, 'WRITE');

export const CanDelete = (section: string) => RequirePermissions(section, 'DELETE');

export const CanExecute = (section: string) => RequirePermissions(section, 'EXECUTE');

/**
 * Decoradores para roles comunes
 */
export const RequireAdmin = () => RequireRoles('Administrador');

export const RequireOperador = () => RequireRoles('Operador');

export const RequireContador = () => RequireRoles('Contador');

/**
 * Permite acceso solo a empleados de la cooperativa
 */
export const EmpleadoOnly = () => SetMetadata('empleadoOnly', true);

/**
 * Permite acceso solo a socios de la cooperativa
 */
export const SocioOnly = () => SetMetadata('socioOnly', true);