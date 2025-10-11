import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/auth.interface';

interface RequestWithUser {
  user: AuthenticatedUser;
}

/**
 * Obtiene el usuario autenticado completo de la request
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);

/**
 * Obtiene solo el ID del usuario autenticado
 */
export const GetUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.id;
  },
);

/**
 * Obtiene solo el ID de la cooperativa del usuario autenticado
 */
export const GetCooperativaId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.cooperativaId;
  },
);

/**
 * Obtiene el email del usuario autenticado
 */
export const GetUserEmail = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.email;
  },
);

/**
 * Verifica si el usuario es empleado
 */
export const IsEmpleado = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): boolean => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.esEmpleado || false;
  },
);

/**
 * Obtiene los roles del usuario
 */
export const GetUserRoles = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string[] => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.roles?.map((role) => role.nombre) || [];
  },
);

/**
 * Obtiene información básica del usuario para logging
 */
export const GetUserInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    
    if (!user) return null;
    
    return {
      userId: user.id,
      email: user.email,
      cooperativaId: user.cooperativaId,
      esEmpleado: user.esEmpleado,
      timestamp: new Date().toISOString(),
    };
  },
);