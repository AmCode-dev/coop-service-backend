import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CooperativasService } from '../cooperativas.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  RequirePermissions,
  Public,
} from '../../auth/decorators/auth.decorators';
import { GetUser } from '../../auth/decorators/user.decorators';
import type { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import type {
  CreateCooperativaDto,
  UpdateCooperativaDto,
  BootstrapCooperativaDto,
  SolicitudAccesoCooperativaDto,
} from '../cooperativas.service';

@Controller('cooperativas')
@UseGuards(JwtAuthGuard)
export class CooperativasController {
  constructor(private readonly cooperativasService: CooperativasService) {}

  /**
   * Obtiene todas las cooperativas
   */
  @Get()
  @RequirePermissions('COOPERATIVAS', 'READ')
  async findAll() {
    return {
      success: true,
      data: await this.cooperativasService.findAll(),
    };
  }

  /**
   * Obtiene una cooperativa específica
   */
  @Get(':id')
  @RequirePermissions('COOPERATIVAS', 'READ')
  async findOne(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    // Los usuarios solo pueden ver su propia cooperativa
    if (
      user.cooperativaId !== id &&
      !user.roles.some((r) => r.nombre === 'SUPER_ADMIN')
    ) {
      throw new Error('No autorizado para ver esta cooperativa');
    }

    return {
      success: true,
      data: await this.cooperativasService.findOne(id),
    };
  }

  /**
   * Crea una nueva cooperativa
   */
  @Post()
  @RequirePermissions('COOPERATIVAS', 'CREATE')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCooperativaDto: CreateCooperativaDto) {
    return {
      success: true,
      data: await this.cooperativasService.create(createCooperativaDto),
      message: 'Cooperativa creada exitosamente',
    };
  }

  /**
   * Actualiza una cooperativa
   */
  @Put(':id')
  @RequirePermissions('COOPERATIVAS', 'UPDATE')
  async update(
    @Param('id') id: string,
    @Body() updateCooperativaDto: UpdateCooperativaDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    // Los usuarios solo pueden actualizar su propia cooperativa
    if (
      user.cooperativaId !== id &&
      !user.roles.some((r) => r.nombre === 'SUPER_ADMIN')
    ) {
      throw new Error('No autorizado para actualizar esta cooperativa');
    }

    return {
      success: true,
      data: await this.cooperativasService.update(id, updateCooperativaDto),
      message: 'Cooperativa actualizada exitosamente',
    };
  }

  /**
   * Elimina (desactiva) una cooperativa
   */
  @Delete(':id')
  @RequirePermissions('COOPERATIVAS', 'DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    // Solo super admin puede eliminar cooperativas
    if (!user.roles.some((r) => r.nombre === 'SUPER_ADMIN')) {
      throw new Error('No autorizado para eliminar cooperativas');
    }

    await this.cooperativasService.remove(id);

    return {
      success: true,
      message: 'Cooperativa desactivada exitosamente',
    };
  }

  /**
   * Busca cooperativa por CUIT
   */
  @Get('buscar/cuit/:cuit')
  @RequirePermissions('COOPERATIVAS', 'READ')
  async findByCuit(@Param('cuit') cuit: string) {
    return {
      success: true,
      data: await this.cooperativasService.findByCuit(cuit),
    };
  }

  /**
   * Obtiene estadísticas de una cooperativa
   */
  @Get(':id/estadisticas')
  @RequirePermissions('COOPERATIVAS', 'READ')
  async getStats(@Param('id') id: string, @GetUser() user: AuthenticatedUser) {
    // Los usuarios solo pueden ver estadísticas de su propia cooperativa
    if (
      user.cooperativaId !== id &&
      !user.roles.some((r) => r.nombre === 'SUPER_ADMIN')
    ) {
      throw new Error(
        'No autorizado para ver estadísticas de esta cooperativa',
      );
    }

    return {
      success: true,
      data: await this.cooperativasService.getStats(id),
    };
  }

  // ============================================
  // ENDPOINTS PÚBLICOS PARA BOOTSTRAP INICIAL
  // ============================================

  /**
   * Verifica si una cooperativa con el CUIT ya existe
   * Endpoint público para validaciones en el frontend
   */
  @Public()
  @Get('verificar-cuit/:cuit')
  async verificarCuit(@Param('cuit') cuit: string) {
    const existe = await this.cooperativasService.existeByCuit(cuit);
    return {
      success: true,
      existe,
      message: existe
        ? 'Ya existe una cooperativa con este CUIT'
        : 'CUIT disponible',
    };
  }

  /**
   * Endpoint público para bootstrap: crear cooperativa + admin inicial
   * Este endpoint NO requiere autenticación
   */
  @Public()
  @Post('bootstrap')
  @HttpCode(HttpStatus.CREATED)
  async bootstrapCooperativa(@Body() bootstrapDto: BootstrapCooperativaDto) {
    return {
      success: true,
      data: await this.cooperativasService.bootstrapCooperativa(bootstrapDto),
      message: 'Cooperativa y administrador creados exitosamente',
    };
  }

  /**
   * Solicitar acceso: Inicia proceso de onboarding para una nueva cooperativa
   * Este endpoint permite que una cooperativa solicite acceso al sistema
   * a través del proceso completo de onboarding con validaciones
   */
  @Public()
  @Post('solicitar-acceso')
  @HttpCode(HttpStatus.CREATED)
  async solicitarAcceso(@Body() solicitudDto: SolicitudAccesoCooperativaDto) {
    console.log('Solicitud de acceso recibida:', solicitudDto);
    return {
      success: true,
      data: await this.cooperativasService.solicitarAccesoCooperativa(
        solicitudDto,
      ),
      message:
        'Solicitud de acceso iniciada. Revisa tu email para continuar el proceso.',
    };
  }

  /**
   * Obtener estado de solicitud de acceso
   * Endpoint público para verificar el progreso de una solicitud
   */
  @Public()
  @Get('solicitud-acceso/:codigoReferencia')
  async obtenerEstadoSolicitud(
    @Param('codigoReferencia') codigoReferencia: string,
  ) {
    return {
      success: true,
      data: await this.cooperativasService.obtenerEstadoSolicitud(
        codigoReferencia,
      ),
    };
  }

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
      data: await this.cooperativasService.listarSolicitudesPendientes(),
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
      data: await this.cooperativasService.decidirSolicitudAcceso(
        codigoReferencia,
        decision,
        user.id,
      ),
      message: decision.aprobado
        ? 'Solicitud aprobada exitosamente'
        : 'Solicitud rechazada',
    };
  }
}
