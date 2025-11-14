import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CooperativasService } from '../cooperativas.service';
import { CooperativasProgressService } from '../cooperativas-progress.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  RequirePermissions,
  Public,
} from '../../auth/decorators/auth.decorators';
import { GetUser } from '../../auth/decorators/user.decorators';
import type { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import type { SolicitudAccesoCooperativaDto } from '../cooperativas.service';

@Controller('cooperativas')
@UseGuards(JwtAuthGuard)
export class CooperativasController {
  constructor(
    private readonly cooperativasService: CooperativasService,
    private readonly progressService: CooperativasProgressService,
  ) {}

  /**
   * Endpoint SSE para seguimiento de progreso en tiempo real
   * Endpoint público para monitorear el progreso de creación
   */
  @Public()
  @Sse('progress/:sessionId')
  getProgress(@Param('sessionId') sessionId: string): Observable<MessageEvent> {
    return this.progressService.getProgressStream(sessionId);
  }

  /**
   * Solicitar acceso con eventos SSE en tiempo real
   * Recibe datos por query parameters (encoded) y retorna stream de eventos
   * Uso: GET /cooperativas/solicitar-acceso-event?data=base64EncodedJson
   */
  @Public()
  @Sse('solicitar-acceso-event')
  solicitarAccesoEvent(
    @Query('data') encodedData: string,
  ): Observable<MessageEvent> {
    // Decodificar los datos de la solicitud
    let solicitudDto: SolicitudAccesoCooperativaDto;

    try {
      const decodedData = Buffer.from(encodedData, 'base64').toString('utf-8');
      solicitudDto = JSON.parse(decodedData) as SolicitudAccesoCooperativaDto;
    } catch {
      // Retornar observable con error si no se pueden decodificar los datos
      return new Observable<MessageEvent>((observer) => {
        observer.next({
          data: JSON.stringify({
            step: 'ERROR_DECODE',
            message: 'Error al decodificar los datos de la solicitud',
            progress: 0,
            status: 'error',
            data: { error: 'Invalid encoded data' },
          }),
          type: 'error',
          id: Date.now().toString(),
        } as MessageEvent);
        observer.error(new Error('Invalid encoded data'));
      });
    }

    const sessionId = solicitudDto.cooperativa.cuit; // Usar CUIT como sessionId

    // Crear observable que ejecute el proceso y emita eventos
    return new Observable<MessageEvent>((observer) => {
      // Función para emitir eventos al cliente
      const emitEvent = (data: unknown) => {
        observer.next({
          data: JSON.stringify(data),
          type: 'progress',
          id: Date.now().toString(),
        } as MessageEvent);
      };

      const emitError = (error: unknown) => {
        emitEvent({
          sessionId,
          step: 'ERROR',
          message: 'Error durante el proceso',
          progress: 0,
          status: 'error',
          data: {
            error:
              error && typeof error === 'object' && 'message' in error
                ? (error as { message: string }).message
                : String(error),
          },
        });
        observer.error(error);
      };

      // Función para completar el stream
      const complete = (finalData: unknown) => {
        emitEvent({
          sessionId,
          step: 'STREAM_COMPLETE',
          message: 'Stream finalizado exitosamente',
          progress: 100,
          status: 'success',
          data: finalData,
        });
        observer.complete();
      };

      // Ejecutar el proceso de solicitud
      this.ejecutarSolicitudAccesoConEventos(solicitudDto, sessionId, emitEvent)
        .then((resultado) => {
          complete(resultado);
        })
        .catch((error) => {
          emitError(error);
        });

      // Cleanup cuando el cliente se desconecta
      return () => {
        console.log(`🔌 Cliente desconectado del stream: ${sessionId}`);
      };
    });
  }

  /**
   * Método privado que ejecuta la solicitud y emite eventos
   */
  private async ejecutarSolicitudAccesoConEventos(
    solicitudDto: SolicitudAccesoCooperativaDto,
    sessionId: string,
    emitEvent: (data: unknown) => void,
  ) {
    try {
      // Emitir evento de inicio
      emitEvent({
        sessionId,
        step: 'INICIADO',
        message: 'Iniciando proceso de solicitud de acceso...',
        progress: 0,
        status: 'info',
        data: { cuit: solicitudDto.cooperativa.cuit },
      });

      // Ejecutar el proceso usando el servicio existente
      const resultado =
        await this.cooperativasService.solicitarAccesoCooperativa(solicitudDto);

      // Emitir evento final con resultado
      emitEvent({
        sessionId,
        step: 'PROCESO_COMPLETADO',
        message: 'Solicitud de acceso procesada exitosamente',
        progress: 100,
        status: 'success',
        data: resultado,
      });

      return resultado;
    } catch (error) {
      // Emitir evento de error
      emitEvent({
        sessionId,
        step: 'ERROR_PROCESO',
        message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        progress: 0,
        status: 'error',
        data: { error: String(error) },
      });
      throw error;
    }
  }

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
    const parseredId = parseInt(id);
    if (
      user.cooperativaId !== parseredId &&
      !user.roles.some((r) => r.nombre === 'SUPER_ADMIN')
    ) {
      throw new Error('No autorizado para ver esta cooperativa');
    }

    return {
      success: true,
      data: await this.cooperativasService.findOne(parseredId),
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
    const parseredId = parseInt(id);
    if (
      user.cooperativaId !== parseredId &&
      !user.roles.some((r) => r.nombre === 'SUPER_ADMIN')
    ) {
      throw new Error(
        'No autorizado para ver estadísticas de esta cooperativa',
      );
    }

    return {
      success: true,
      data: await this.cooperativasService.getStats(parseredId),
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
   * Solicitar acceso: Inicia proceso de onboarding para una nueva cooperativa
   * Este endpoint permite que una cooperativa solicite acceso al sistema
   * a través del proceso completo de onboarding con validaciones
   */
  @Public()
  @Post('solicitar-acceso')
  @HttpCode(HttpStatus.CREATED)
  async solicitarAcceso(@Body() solicitudDto: SolicitudAccesoCooperativaDto) {
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
}
