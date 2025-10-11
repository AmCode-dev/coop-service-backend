export class AuthErrorResponse {
  success: boolean;
  message: string;
  code: string;
  timestamp: string;
  path?: string;
  details?: unknown;

  constructor(message: string, code: string, details?: unknown, path?: string) {
    this.success = false;
    this.message = message;
    this.code = code;
    this.timestamp = new Date().toISOString();
    this.path = path;
    this.details = details;
  }

  static unauthorized(
    message = 'No autorizado',
    details?: unknown,
  ): AuthErrorResponse {
    return new AuthErrorResponse(message, 'UNAUTHORIZED', details);
  }

  static forbidden(
    message = 'Acceso denegado',
    details?: unknown,
  ): AuthErrorResponse {
    return new AuthErrorResponse(message, 'FORBIDDEN', details);
  }

  static invalidToken(
    message = 'Token inválido',
    details?: unknown,
  ): AuthErrorResponse {
    return new AuthErrorResponse(message, 'INVALID_TOKEN', details);
  }

  static expiredToken(
    message = 'Token expirado',
    details?: unknown,
  ): AuthErrorResponse {
    return new AuthErrorResponse(message, 'EXPIRED_TOKEN', details);
  }

  static insufficientPermissions(
    section: string,
    action: string,
    details?: Record<string, unknown>,
  ): AuthErrorResponse {
    return new AuthErrorResponse(
      `No tienes permisos para ${action} en la sección ${section}`,
      'INSUFFICIENT_PERMISSIONS',
      {
        requiredSection: section,
        requiredAction: action,
        ...(details || {}),
      },
    );
  }

  static invalidCooperativa(
    message = 'Cooperativa inválida',
    details?: unknown,
  ): AuthErrorResponse {
    return new AuthErrorResponse(message, 'INVALID_COOPERATIVA', details);
  }

  static userNotFound(
    message = 'Usuario no encontrado',
    details?: unknown,
  ): AuthErrorResponse {
    return new AuthErrorResponse(message, 'USER_NOT_FOUND', details);
  }

  static inactiveUser(
    message = 'Usuario inactivo',
    details?: unknown,
  ): AuthErrorResponse {
    return new AuthErrorResponse(message, 'INACTIVE_USER', details);
  }
}