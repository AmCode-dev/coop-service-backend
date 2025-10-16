import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  Public,
  RequirePermissions,
} from '../../auth/decorators/auth.decorators';
import { GetUser } from '../../auth/decorators/user.decorators';
import type { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { CooperativasSuperadminsService } from '../cooperativas-superadmins.service';

@Controller('cooperativas-supadmin')
@UseGuards(JwtAuthGuard)
export class CooperativasSuperadminsController {
  constructor(
    private readonly cooperativasSuperadminsService: CooperativasSuperadminsService,
  ) {}

  // ============================================
  // ENDPOINTS PROTEGIDOS PARA SUPER_ADMIN
  // ============================================

  /**
   * Listar todas las solicitudes de acceso pendientes
   * Solo SUPER_ADMIN puede ver todas las solicitudes
   */
  @Get('solicitudes-pendientes')
  @RequirePermissions('SYSTEM', 'READ')
  async listarSolicitudesPendientes(@GetUser() user: AuthenticatedUser) {
    // Solo SUPER_ADMIN puede ver todas las solicitudes
    if (!user.roles.some((r) => r.nombre === 'SUPER_ADMIN')) {
      throw new Error(
        'Solo los Super Administradores pueden ver todas las solicitudes',
      );
    }

    return {
      success: true,
      data: await this.cooperativasSuperadminsService.listarSolicitudesPendientes(),
    };
  }

  /**
   * Aprobar o rechazar una solicitud de cooperativa
   * Solo SUPER_ADMIN puede tomar decisiones
   */
  @Post('solicitudes/:codigoReferencia/decision')
  @RequirePermissions('SYSTEM', 'EXECUTE')
  async decidirSolicitud(
    @Param('codigoReferencia') codigoReferencia: string,
    @Body()
    decision: {
      aprobado: boolean;
      observaciones?: string;
      motivoRechazo?: string;
    },
    @GetUser() user: AuthenticatedUser,
  ) {
    // Solo SUPER_ADMIN puede aprobar/rechazar solicitudes
    if (!user.roles.some((r) => r.nombre === 'SUPER_ADMIN')) {
      throw new Error(
        'Solo los Super Administradores pueden aprobar o rechazar solicitudes',
      );
    }

    return {
      success: true,
      data: await this.cooperativasSuperadminsService.decidirSolicitudAcceso(
        codigoReferencia,
        decision,
        user.id,
      ),
      message: decision.aprobado
        ? 'Solicitud aprobada exitosamente'
        : 'Solicitud rechazada',
    };
  }

  /**
   * Crear SUPER_ADMIN inicial del sistema
   * Endpoint especial para configuración inicial - SOLO UNA VEZ
   * Requiere código de seguridad especial
   */
  @Public()
  @Post('setup/super-admin')
  @HttpCode(HttpStatus.CREATED)
  async crearSuperAdmin(
    @Body()
    setupDto: {
      email: string;
      password: string;
      nombre: string;
      apellido: string;
      telefono?: string;
      setupCode: string; // Código especial para setup inicial
    },
  ) {
    return {
      success: true,
      data: await this.cooperativasSuperadminsService.crearSuperAdminInicial(
        setupDto,
      ),
      message: 'SUPER_ADMIN creado exitosamente. ¡Sistema listo para usar!',
    };
  }
}
