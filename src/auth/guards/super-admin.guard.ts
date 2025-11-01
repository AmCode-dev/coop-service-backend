import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from '../interfaces/auth.interface';
import { AuthErrorResponse } from '../responses/auth-error.response';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorators';

interface RequestWithUser {
  user: AuthenticatedUser;
}

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Verificar si el endpoint es público
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        AuthErrorResponse.unauthorized('Usuario no autenticado'),
      );
    }

    // Verificar si el usuario es SUPER_ADMIN
    const isSuperAdmin = this.isSuperAdmin(user);

    if (!isSuperAdmin) {
      throw new ForbiddenException(
        AuthErrorResponse.forbidden('Acceso restringido a SUPER_ADMIN'),
      );
    }

    // Si es SUPER_ADMIN, permitir acceso completo
    return true;
  }

  /**
   * Verifica si un usuario es SUPER_ADMIN
   */
  private isSuperAdmin(user: AuthenticatedUser): boolean {
    return (
      user.roles.some(
        (role) => role.nombre === 'SUPER_ADMIN' || role.esSistema === true,
      ) || user.permisos.some((permiso) => permiso.seccionCodigo === 'SYSTEM')
    );
  }
}
