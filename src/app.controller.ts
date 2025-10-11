import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  Public,
  RequirePermissions,
  CanRead,
  RequireAdmin,
  EmpleadoOnly,
} from './auth/decorators/auth.decorators';
import {
  GetUser,
  GetUserId,
  GetCooperativaId,
  GetUserInfo,
} from './auth/decorators/user.decorators';
import type { AuthenticatedUser } from './auth/interfaces/auth.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Ejemplo de endpoint público para obtener cooperativas
  @Public()
  @Get('cooperativas')
  async getCooperativas() {
    return this.appService.getCooperativas();
  }

  // Ejemplo de endpoint que requiere autenticación
  @Get('profile')
  getProfile(@GetUser() user: AuthenticatedUser) {
    return {
      message: 'Este endpoint requiere autenticación',
      user: {
        id: user.id,
        nombre: user.nombre,
        cooperativa: user.cooperativaId,
      },
    };
  }

  // Ejemplo de endpoint que requiere permisos específicos
  @CanRead('cuentas')
  @Get('cuentas')
  getCuentas(
    @GetUserId() userId: string,
    @GetCooperativaId() cooperativaId: string,
  ) {
    return {
      message: 'Este endpoint requiere permisos de lectura en cuentas',
      userId,
      cooperativaId,
    };
  }

  // Ejemplo de endpoint solo para administradores
  @RequireAdmin()
  @Get('admin')
  getAdminData(@GetUserInfo() userInfo: unknown) {
    return {
      message: 'Este endpoint es solo para administradores',
      userInfo,
    };
  }

  // Ejemplo de endpoint solo para empleados
  @EmpleadoOnly()
  @Get('empleados')
  getEmpleadosData(@GetUser() user: AuthenticatedUser) {
    return {
      message: 'Este endpoint es solo para empleados',
      esEmpleado: user.esEmpleado,
    };
  }

  // Ejemplo de endpoint con permisos específicos de escritura
  @RequirePermissions('facturas', 'WRITE')
  @Get('facturas/create')
  canCreateFacturas(@GetCooperativaId() cooperativaId: string) {
    return {
      message: 'Puede crear facturas',
      cooperativaId,
    };
  }

  // Health check de la base de datos
  @Public()
  @Get('health/database')
  async healthCheckDatabase() {
    return this.appService.healthCheck();
  }
}
