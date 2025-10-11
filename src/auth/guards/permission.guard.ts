import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../services/auth.service';
import { AuthErrorResponse } from '../responses/auth-error.response';
import { AuthenticatedUser } from '../interfaces/auth.interface';
import {
  IS_PUBLIC_KEY,
  REQUIRED_PERMISSIONS_KEY,
  REQUIRED_ROLES_KEY,
} from '../decorators/auth.decorators';

interface RequestWithUser {
  user: AuthenticatedUser;
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

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

    // Verificar restricciones de empleado/socio
    const empleadoOnly = this.reflector.getAllAndOverride<boolean>(
      'empleadoOnly',
      [context.getHandler(), context.getClass()],
    );

    const socioOnly = this.reflector.getAllAndOverride<boolean>('socioOnly', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (empleadoOnly && !user.esEmpleado) {
      throw new ForbiddenException(
        AuthErrorResponse.forbidden('Acceso restringido a empleados'),
      );
    }

    if (socioOnly && user.esEmpleado) {
      throw new ForbiddenException(
        AuthErrorResponse.forbidden('Acceso restringido a socios'),
      );
    }

    // Verificar roles requeridos
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = this.authService.hasRole(user, requiredRoles);
      if (!hasRole) {
        throw new ForbiddenException(
          AuthErrorResponse.forbidden(
            `Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`,
            { requiredRoles, userRoles: user.roles.map((r) => r.nombre) },
          ),
        );
      }
    }

    // Verificar permisos requeridos
    const requiredPermissions = this.reflector.getAllAndOverride<{
      section: string;
      actions: string[];
    }>(REQUIRED_PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (requiredPermissions) {
      const { section, actions } = requiredPermissions;
      
      for (const action of actions) {
        const hasPermission = this.authService.hasPermission(
          user,
          section,
          action,
        );
        
        if (!hasPermission) {
          throw new ForbiddenException(
            AuthErrorResponse.insufficientPermissions(section, action, {
              userPermissions: user.permisos.map((p) => ({
                seccion: p.seccionCodigo,
                acciones: p.acciones,
              })),
            }),
          );
        }
      }
    }

    return true;
  }
}