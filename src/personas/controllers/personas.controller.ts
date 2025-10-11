import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Req,
  Ip,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PersonasService } from '../personas.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  CanRead,
  CanWrite,
  CanExecute,
  SocioOnly,
} from '../../auth/decorators/auth.decorators';
import {
  GetCooperativaId,
  GetUserId,
} from '../../auth/decorators/user.decorators';
import {
  CreatePersonaDto,
  UpdatePersonaDto,
  ActualizarEstadoKYCDto,
  SubirDocumentoKYCDto,
  ValidarDocumentoKYCDto,
  BuscarPersonasDto,
  SolicitudResetPasswordDto,
  ResetPasswordDto,
  VincularUsuarioDto,
  EnviarNotificacionDto,
} from '../dto';
import type {
  PersonaBasica,
  PersonaDetalle,
  DocumentoKYCDetalle,
  EstadisticasKYC,
  ResumenSocio,
  HistorialKYC,
  ResultadoPaginado,
  NotificacionPersona,
} from '../interfaces/personas.interface';

@Controller('personas')
@UseGuards(JwtAuthGuard)
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  // ============================================
  // CRUD DE PERSONAS
  // ============================================

  @Post()
  @CanWrite('PERSONAS')
  async crear(
    @Body() createPersonaDto: CreatePersonaDto,
    @GetCooperativaId() cooperativaId: string,
    @GetUserId() usuarioId: string,
  ): Promise<PersonaDetalle> {
    return this.personasService.crear(
      createPersonaDto,
      cooperativaId,
      usuarioId,
    );
  }

  @Get()
  @CanRead('PERSONAS')
  async buscarTodos(
    @Query() filtros: BuscarPersonasDto,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<ResultadoPaginado<PersonaBasica>> {
    return this.personasService.buscarTodos(cooperativaId, filtros);
  }

  @Get(':id')
  @CanRead('PERSONAS')
  async buscarPorId(
    @Param('id') id: string,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<PersonaDetalle> {
    return this.personasService.buscarPorId(id, cooperativaId);
  }

  @Get('documento/:tipoDocumento/:numeroDocumento')
  @CanRead('PERSONAS')
  async buscarPorDocumento(
    @Param('tipoDocumento') tipoDocumento: string,
    @Param('numeroDocumento') numeroDocumento: string,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<PersonaDetalle> {
    return this.personasService.buscarPorDocumento(
      tipoDocumento,
      numeroDocumento,
      cooperativaId,
    );
  }

  @Put(':id')
  @CanWrite('PERSONAS')
  async actualizar(
    @Param('id') id: string,
    @Body() updatePersonaDto: UpdatePersonaDto,
    @GetCooperativaId() cooperativaId: string,
    @GetUserId() usuarioId: string,
  ): Promise<PersonaDetalle> {
    return this.personasService.actualizar(
      id,
      updatePersonaDto,
      cooperativaId,
      usuarioId,
    );
  }

  @Delete(':id')
  @CanExecute('PERSONAS')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Param('id') id: string,
    @GetCooperativaId() cooperativaId: string,
    @GetUserId() usuarioId: string,
  ): Promise<void> {
    return this.personasService.eliminar(id, cooperativaId, usuarioId);
  }

  // ============================================
  // GESTIÓN KYC
  // ============================================

  @Put(':id/kyc/estado')
  @CanWrite('PERSONAS')
  async actualizarEstadoKYC(
    @Param('id') personaId: string,
    @Body() actualizarEstadoDto: ActualizarEstadoKYCDto,
    @GetCooperativaId() cooperativaId: string,
    @GetUserId() usuarioId: string,
  ): Promise<PersonaDetalle> {
    return this.personasService.actualizarEstadoKYC(
      personaId,
      actualizarEstadoDto,
      cooperativaId,
      usuarioId,
    );
  }

  @Post(':id/kyc/documentos')
  @CanWrite('PERSONAS')
  @UseInterceptors(FileInterceptor('archivo'))
  async subirDocumentoKYC(
    @Param('id') personaId: string,
    @Body() subirDocumentoDto: SubirDocumentoKYCDto,
    @UploadedFile() archivo: Express.Multer.File,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<DocumentoKYCDetalle> {
    return this.personasService.subirDocumentoKYC(
      personaId,
      subirDocumentoDto,
      archivo,
      cooperativaId,
    );
  }

  @Put('kyc/documentos/:documentoId/validar')
  @CanWrite('PERSONAS')
  async validarDocumentoKYC(
    @Param('documentoId') documentoId: string,
    @Body() validarDto: ValidarDocumentoKYCDto,
    @GetCooperativaId() cooperativaId: string,
    @GetUserId() usuarioId: string,
  ): Promise<DocumentoKYCDetalle> {
    return this.personasService.validarDocumentoKYC(
      documentoId,
      validarDto,
      cooperativaId,
      usuarioId,
    );
  }

  @Get(':id/kyc/documentos')
  @CanRead('PERSONAS')
  async obtenerDocumentosKYC(
    @Param('id') personaId: string,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<DocumentoKYCDetalle[]> {
    return this.personasService.obtenerDocumentosKYC(personaId, cooperativaId);
  }

  @Get(':id/kyc/historial')
  @CanRead('PERSONAS')
  async obtenerHistorialKYC(
    @Param('id') personaId: string,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<HistorialKYC[]> {
    return this.personasService.obtenerHistorialKYC(personaId, cooperativaId);
  }

  // ============================================
  // ESTADÍSTICAS Y REPORTES
  // ============================================

  @Get('estadisticas/kyc')
  @CanRead('PERSONAS')
  async obtenerEstadisticasKYC(
    @GetCooperativaId() cooperativaId: string,
  ): Promise<EstadisticasKYC> {
    return this.personasService.obtenerEstadisticasKYC(cooperativaId);
  }

  @Get(':id/resumen-socio')
  @CanRead('PERSONAS')
  async obtenerResumenSocio(
    @Param('id') personaId: string,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<ResumenSocio> {
    return this.personasService.obtenerResumenSocio(personaId, cooperativaId);
  }

  // ============================================
  // GESTIÓN DE USUARIOS Y AUTENTICACIÓN
  // ============================================

  @Post(':id/vincular-usuario')
  @CanExecute('PERSONAS')
  async vincularUsuario(
    @Param('id') personaId: string,
    @Body() vincularDto: VincularUsuarioDto,
    @GetCooperativaId() cooperativaId: string,
    @GetUserId() usuarioId: string,
  ): Promise<PersonaDetalle> {
    return this.personasService.vincularUsuario(
      personaId,
      vincularDto,
      cooperativaId,
      usuarioId,
    );
  }

  @Post('reset-password/solicitar')
  @HttpCode(HttpStatus.OK)
  async solicitudResetPassword(
    @Body() solicitudDto: SolicitudResetPasswordDto,
    @GetCooperativaId() cooperativaId: string,
    @Ip() ip: string,
    @Req() req: any,
  ): Promise<{ success: boolean; message: string }> {
    return this.personasService.solicitudResetPassword(
      solicitudDto,
      cooperativaId,
      ip,
      req.headers['user-agent'],
    );
  }

  @Post('reset-password/confirmar')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetDto: ResetPasswordDto,
    @Ip() ip: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.personasService.resetPassword(resetDto, ip);
  }

  // ============================================
  // NOTIFICACIONES
  // ============================================

  @Post(':id/notificaciones')
  @CanWrite('PERSONAS')
  async enviarNotificacion(
    @Param('id') personaId: string,
    @Body() notificacionDto: EnviarNotificacionDto,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<NotificacionPersona> {
    return this.personasService.enviarNotificacion(
      personaId,
      notificacionDto,
      cooperativaId,
    );
  }

  // ============================================
  // ENDPOINTS ESPECIALES PARA SOCIOS
  // ============================================

  @Get('mi-perfil')
  @CanRead('PERSONAS')
  async obtenerMiPerfil(
    @GetUserId() usuarioId: string,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<PersonaDetalle | null> {
    // Buscar la persona vinculada al usuario autenticado
    const usuarioCooperativa = await this.personasService['prisma'].usuarioCooperativa.findFirst({
      where: { 
        usuario: { id: usuarioId },
        cooperativaId,
        activo: true,
      },
      include: { 
        usuario: true,
        persona: true,
      },
    });

    if (!usuarioCooperativa?.persona) {
      return null;
    }

    return this.personasService.buscarPorId(usuarioCooperativa.persona.id, cooperativaId);
  }

  @Get('mi-resumen')
  @CanRead('PERSONAS')
  async obtenerMiResumen(
    @GetUserId() usuarioId: string,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<ResumenSocio | null> {
    // Buscar la persona vinculada al usuario autenticado
    const usuarioCooperativa = await this.personasService['prisma'].usuarioCooperativa.findFirst({
      where: { usuarioId, cooperativaId, activo: true },
      include: { persona: true },
    });

    if (!usuarioCooperativa?.persona) {
      return null;
    }

    return this.personasService.obtenerResumenSocio(
      usuarioCooperativa.persona.id,
      cooperativaId,
    );
  }

  @Put('mi-perfil')
  @CanWrite('PERSONAS')
  async actualizarMiPerfil(
    @Body() updatePersonaDto: UpdatePersonaDto,
    @GetUserId() usuarioId: string,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<PersonaDetalle> {
    // Buscar la persona vinculada al usuario autenticado
    const usuarioCooperativa = await this.personasService['prisma'].usuarioCooperativa.findFirst({
      where: { usuarioId, cooperativaId, activo: true },
      include: { persona: true },
    });

    if (!usuarioCooperativa?.persona) {
      throw new Error(
        'No tienes una persona vinculada para actualizar el perfil',
      );
    }

    return this.personasService.actualizar(
      usuarioCooperativa.persona.id,
      updatePersonaDto,
      cooperativaId,
      usuarioId,
    );
  }

  @Post('mi-perfil/kyc/documentos')
  @CanWrite('PERSONAS')
  @UseInterceptors(FileInterceptor('archivo'))
  async subirMiDocumentoKYC(
    @Body() subirDocumentoDto: SubirDocumentoKYCDto,
    @UploadedFile() archivo: Express.Multer.File,
    @GetUserId() usuarioId: string,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<DocumentoKYCDetalle> {
    // Buscar la persona vinculada al usuario autenticado
    const usuarioCooperativa = await this.personasService['prisma'].usuarioCooperativa.findFirst({
      where: { usuarioId, cooperativaId, activo: true },
      include: { persona: true },
    });

    if (!usuarioCooperativa?.persona) {
      throw new Error(
        'No tienes una persona vinculada para subir documentos KYC',
      );
    }

    return this.personasService.subirDocumentoKYC(
      usuarioCooperativa.persona.id,
      subirDocumentoDto,
      archivo,
      cooperativaId,
    );
  }

  // ============================================
  // DASHBOARD ADMINISTRATIVO
  // ============================================

  @Get('dashboard/resumen')
  @CanRead('PERSONAS')
  async resumenDashboard(@GetCooperativaId() cooperativaId: string): Promise<{
    totalPersonas: number;
    sociosActivos: number;
    pendientesKYC: number;
    personasConUsuario: number;
    personasSinUsuario: number;
    proximasRevisionesKYC: number;
    documentosPendientesValidacion: number;
  }> {
    const [
      totalPersonas,
      sociosActivos,
      pendientesKYC,
      personasConUsuario,
      personasSinUsuario,
      proximasRevisiones,
      documentosPendientes,
    ] = await Promise.all([
      this.personasService['prisma'].persona.count({
        where: { cooperativaId },
      }),
      this.personasService['prisma'].persona.count({
        where: { cooperativaId, estadoSocio: 'ACTIVO' },
      }),
      this.personasService['prisma'].persona.count({
        where: {
          cooperativaId,
          estadoKYC: { in: ['PENDIENTE', 'EN_REVISION'] },
        },
      }),
      this.personasService['prisma'].persona.count({
        where: { cooperativaId, usuariosCooperativa: { some: {} } },
      }),
      this.personasService['prisma'].persona.count({
        where: { cooperativaId, usuariosCooperativa: { none: {} } },
      }),
      this.personasService['prisma'].persona.count({
        where: {
          cooperativaId,
          proximaRevisionKYC: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Próximos 30 días
          },
        },
      }),
      this.personasService['prisma'].documentoKYC.count({
        where: {
          persona: { cooperativaId },
          validado: false,
        },
      }),
    ]);

    return {
      totalPersonas,
      sociosActivos,
      pendientesKYC,
      personasConUsuario,
      personasSinUsuario,
      proximasRevisionesKYC: proximasRevisiones,
      documentosPendientesValidacion: documentosPendientes,
    };
  }

  // ============================================
  // ENDPOINTS ADICIONALES PARA SOCIOS
  // ============================================

  @Get('mis-servicios')
  @SocioOnly()
  async obtenerMisServicios(
    @GetUserId() usuarioId: string,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<{
    success: boolean;
    servicios: Array<{
      id: string;
      nombre: string;
      codigo: string;
      activo: boolean;
      cuenta: {
        numeroCuenta: string;
        inmueble: {
          domicilio: string;
          localidad: string;
        };
      };
      medidor?: {
        numeroMedidor: string;
        ultimaLectura?: {
          fecha: Date;
          valor: number;
          consumo?: number;
        };
      };
    }>;
  }> {
    // Buscar la persona vinculada al usuario
    const usuarioCooperativa = await this.personasService['prisma'].usuarioCooperativa.findFirst({
      where: { usuarioId, cooperativaId, activo: true },
      include: { persona: true },
    });

    if (!usuarioCooperativa?.persona) {
      throw new Error('No tienes una persona vinculada');
    }

    // Obtener servicios del socio
    const cuentasServicios = await this.personasService['prisma'].cuentaServicio.findMany({
      where: {
        cuenta: {
          titularServicioId: usuarioCooperativa.persona.id,
          cooperativaId,
        },
        activo: true,
      },
      include: {
        servicio: true,
        cuenta: {
          include: {
            inmueble: {
              select: {
                domicilio: true,
                localidad: true,
              },
            },
          },
        },
        medidor: {
          include: {
            lecturas: {
              orderBy: {
                fechaLectura: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    });

    const servicios = cuentasServicios.map((cs) => {
      const ultimaLectura = cs.medidor?.lecturas[0];

      return {
        id: cs.id,
        nombre: cs.servicio.nombre,
        codigo: cs.servicio.codigo,
        activo: cs.activo,
        cuenta: {
          numeroCuenta: cs.cuenta.numeroCuenta,
          inmueble: {
            domicilio: cs.cuenta.inmueble.domicilio,
            localidad: cs.cuenta.inmueble.localidad,
          },
        },
        ...(cs.medidor && {
          medidor: {
            numeroMedidor: cs.medidor.numeroMedidor,
            ...(ultimaLectura && {
              ultimaLectura: {
                fecha: ultimaLectura.fechaLectura,
                valor: Number(ultimaLectura.valorLectura),
                consumo: ultimaLectura.consumoCalculado
                  ? Number(ultimaLectura.consumoCalculado)
                  : undefined,
              },
            }),
          },
        }),
      };
    });

    return {
      success: true,
      servicios,
    };
  }

  @Get('mis-facturas')
  @SocioOnly()
  async obtenerMisFacturas(
    @GetUserId() usuarioId: string,
    @GetCooperativaId() cooperativaId: string,
    @Query('estado') estado?: string,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
    @Query('limite') limite: string = '10',
    @Query('pagina') pagina: string = '1',
  ): Promise<{
    success: boolean;
    facturas: Array<{
      id: string;
      numeroFactura: string;
      periodo: string;
      fechaEmision: Date;
      fechaVencimiento: Date;
      total: number;
      saldoPendiente: number;
      estado: string;
      servicio: {
        nombre: string;
        codigo: string;
      };
      cuenta: {
        numeroCuenta: string;
      };
    }>;
    total: number;
    pagina: number;
    totalPaginas: number;
  }> {
    // Buscar la persona vinculada al usuario
    const usuarioCooperativa = await this.personasService['prisma'].usuarioCooperativa.findFirst({
      where: { usuarioId, cooperativaId, activo: true },
      include: { persona: true },
    });

    if (!usuarioCooperativa?.persona) {
      throw new Error('No tienes una persona vinculada');
    }

    const limiteNum = parseInt(limite, 10);
    const paginaNum = parseInt(pagina, 10);

    // Construir filtros
    const whereClause: any = {
      cuenta: {
        titularServicioId: usuarioCooperativa.persona.id,
        cooperativaId,
      },
    };

    if (estado) {
      whereClause.estado = estado;
    }

    if (mes && anio) {
      whereClause.mes = parseInt(mes, 10);
      whereClause.anio = parseInt(anio, 10);
    }

    const [facturas, total] = await Promise.all([
      this.personasService['prisma'].factura.findMany({
        where: whereClause,
        include: {
          cuenta: {
            select: {
              numeroCuenta: true,
            },
          },
          cuentaServicio: {
            include: {
              servicio: {
                select: {
                  nombre: true,
                  codigo: true,
                },
              },
            },
          },
        },
        orderBy: {
          fechaEmision: 'desc',
        },
        skip: (paginaNum - 1) * limiteNum,
        take: limiteNum,
      }),
      this.personasService['prisma'].factura.count({
        where: whereClause,
      }),
    ]);

    return {
      success: true,
      facturas: facturas.map((f) => ({
        id: f.id,
        numeroFactura: f.numeroFactura,
        periodo: f.periodo,
        fechaEmision: f.fechaEmision,
        fechaVencimiento: f.fechaVencimiento,
        total: Number(f.total),
        saldoPendiente: Number(f.saldoPendiente),
        estado: f.estado,
        servicio: {
          nombre: f.cuentaServicio.servicio.nombre,
          codigo: f.cuentaServicio.servicio.codigo,
        },
        cuenta: {
          numeroCuenta: f.cuenta.numeroCuenta,
        },
      })),
      total,
      pagina: paginaNum,
      totalPaginas: Math.ceil(total / limiteNum),
    };
  }
}
