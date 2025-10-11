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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MedidoresService } from '../medidores.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  CanRead,
  CanWrite,
  CanExecute,
} from '../../auth/decorators/auth.decorators';
import {
  GetCooperativaId,
  GetUserId,
} from '../../auth/decorators/user.decorators';
import {
  CreateMedidorDto,
  UpdateMedidorDto,
  VincularMedidorDto,
  DesvincularMedidorDto,
  CreateLecturaDto,
  UpdateLecturaDto,
  BuscarLecturasDto,
} from '../dto';
import type {
  MedidorDetalle,
  LecturaDetalle,
  EstadisticasMedidor,
  HistorialVinculacion,
  FiltrosMedidores,
  ResultadoPaginado,
} from '../interfaces/medidores.interface';

@Controller('medidores')
@UseGuards(JwtAuthGuard)
export class MedidoresController {
  constructor(private readonly medidoresService: MedidoresService) {}

  // ============================================
  // CRUD DE MEDIDORES
  // ============================================

  @Post()
  @CanWrite('MEDIDORES')
  async crear(
    @Body() createMedidorDto: CreateMedidorDto,
    @GetCooperativaId() cooperativaId: string,
    @GetUserId() usuarioId: string,
  ): Promise<MedidorDetalle> {
    return this.medidoresService.crear(
      createMedidorDto,
      cooperativaId,
      usuarioId,
    );
  }

  @Get()
  @CanRead('MEDIDORES')
  async buscarTodos(
    @Query() filtros: FiltrosMedidores,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<ResultadoPaginado<MedidorDetalle>> {
    return this.medidoresService.buscarTodos(cooperativaId, filtros);
  }

  @Get(':id')
  @CanRead('MEDIDORES')
  async buscarPorId(
    @Param('id') id: string,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<MedidorDetalle> {
    return this.medidoresService.buscarPorId(id, cooperativaId);
  }

  @Put(':id')
  @CanWrite('MEDIDORES')
  async actualizar(
    @Param('id') id: string,
    @Body() updateMedidorDto: UpdateMedidorDto,
    @GetCooperativaId() cooperativaId: string,
    @GetUserId() usuarioId: string,
  ): Promise<MedidorDetalle> {
    return this.medidoresService.actualizar(
      id,
      updateMedidorDto,
      cooperativaId,
      usuarioId,
    );
  }

  @Delete(':id')
  @CanExecute('MEDIDORES')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminar(
    @Param('id') id: string,
    @GetCooperativaId() cooperativaId: string,
    @GetUserId() usuarioId: string,
  ): Promise<void> {
    return this.medidoresService.eliminar(id, cooperativaId, usuarioId);
  }

  // ============================================
  // VINCULACIONES DE MEDIDORES
  // ============================================

  @Post(':id/vincular')
  @CanExecute('MEDIDORES')
  async vincular(
    @Param('id') medidorId: string,
    @Body() vincularDto: Omit<VincularMedidorDto, 'medidorId'>,
    @GetCooperativaId() cooperativaId: string,
    @GetUserId() usuarioId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.medidoresService.vincular(
      { ...vincularDto, medidorId },
      cooperativaId,
      usuarioId,
    );
  }

  @Post(':id/desvincular/:tipo')
  @CanExecute('MEDIDORES')
  async desvincular(
    @Param('id') medidorId: string,
    @Param('tipo') tipo: 'INMUEBLE' | 'CUENTA_SERVICIO',
    @Body() desvincularDto: DesvincularMedidorDto,
    @GetCooperativaId() cooperativaId: string,
    @GetUserId() usuarioId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.medidoresService.desvincular(
      medidorId,
      tipo,
      desvincularDto,
      cooperativaId,
      usuarioId,
    );
  }

  @Get(':id/historial-vinculaciones')
  @CanRead('MEDIDORES')
  async obtenerHistorialVinculaciones(
    @Param('id') medidorId: string,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<HistorialVinculacion[]> {
    return this.medidoresService.obtenerHistorialVinculaciones(
      medidorId,
      cooperativaId,
    );
  }

  // ============================================
  // LECTURAS DE MEDIDORES
  // ============================================

  @Post('lecturas')
  @CanWrite('MEDIDORES')
  async crearLectura(
    @Body() createLecturaDto: CreateLecturaDto,
    @GetCooperativaId() cooperativaId: string,
    @GetUserId() usuarioId: string,
  ): Promise<LecturaDetalle> {
    return this.medidoresService.crearLectura(
      createLecturaDto,
      cooperativaId,
      usuarioId,
    );
  }

  @Get('lecturas')
  @CanRead('MEDIDORES')
  async buscarLecturas(
    @Query() buscarDto: BuscarLecturasDto,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<ResultadoPaginado<LecturaDetalle>> {
    return this.medidoresService.buscarLecturas(buscarDto, cooperativaId);
  }

  @Get(':medidorId/lectura-principal/:mes/:anio')
  @CanRead('MEDIDORES')
  async obtenerLecturaPrincipal(
    @Param('medidorId') medidorId: string,
    @Param('mes') mes: string,
    @Param('anio') anio: string,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<LecturaDetalle | null> {
    return this.medidoresService.obtenerLecturaPrincipal(
      medidorId,
      parseInt(mes),
      parseInt(anio),
      cooperativaId,
    );
  }

  @Put('lecturas/:id')
  @CanWrite('MEDIDORES')
  async actualizarLectura(
    @Param('id') id: string,
    @Body() updateLecturaDto: UpdateLecturaDto,
    @GetCooperativaId() cooperativaId: string,
    @GetUserId() usuarioId: string,
  ): Promise<LecturaDetalle> {
    return this.medidoresService.actualizarLectura(
      id,
      updateLecturaDto,
      cooperativaId,
      usuarioId,
    );
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  @Get(':id/estadisticas')
  @CanRead('MEDIDORES')
  async obtenerEstadisticas(
    @Param('id') medidorId: string,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<EstadisticasMedidor> {
    return this.medidoresService.obtenerEstadisticas(medidorId, cooperativaId);
  }

  // ============================================
  // ENDPOINTS ADICIONALES
  // ============================================

  @Get(':id/ultimas-lecturas/:cantidad')
  @CanRead('MEDIDORES')
  async obtenerUltimasLecturas(
    @Param('id') medidorId: string,
    @Param('cantidad') cantidad: string,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<LecturaDetalle[]> {
    const buscarDto: BuscarLecturasDto = {
      medidorId,
      limite: parseInt(cantidad) || 10,
      pagina: 1,
    };

    const resultado = await this.medidoresService.buscarLecturas(
      buscarDto,
      cooperativaId,
    );
    return resultado.items;
  }

  @Get(':id/lecturas-anomalas')
  @CanRead('MEDIDORES')
  async obtenerLecturasAnomalas(
    @Param('id') medidorId: string,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<ResultadoPaginado<LecturaDetalle>> {
    const buscarDto: BuscarLecturasDto = {
      medidorId,
      soloAnomalias: true,
      limite: 50,
      pagina: 1,
    };

    return this.medidoresService.buscarLecturas(buscarDto, cooperativaId);
  }

  @Get('resumen/necesitan-atencion')
  @CanRead('MEDIDORES')
  async medidoresQueNecesitanAtencion(
    @GetCooperativaId() cooperativaId: string,
  ): Promise<{
    total: number;
    medidores: Array<{
      medidor: MedidorDetalle;
      motivosAtencion: string[];
      puntuacionSalud: number;
    }>;
  }> {
    const filtros: FiltrosMedidores = {
      necesitaAtencion: true,
      limite: 100,
      pagina: 1,
    };

    const medidores = await this.medidoresService.buscarTodos(
      cooperativaId,
      filtros,
    );

    // Obtener estadísticas para cada medidor
    const medidoresConEstadisticas = await Promise.all(
      medidores.items.map(async (medidor) => {
        const estadisticas = await this.medidoresService.obtenerEstadisticas(
          medidor.id,
          cooperativaId,
        );

        return {
          medidor,
          motivosAtencion: estadisticas.estado.motivosAtencion,
          puntuacionSalud: estadisticas.estado.puntuacionSalud,
        };
      }),
    );

    return {
      total: medidoresConEstadisticas.length,
      medidores: medidoresConEstadisticas,
    };
  }

  @Get('dashboard/resumen')
  @CanRead('MEDIDORES')
  async resumenDashboard(@GetCooperativaId() cooperativaId: string): Promise<{
    totalMedidores: number;
    medidoresActivos: number;
    medidoresInactivos: number;
    conLecturasRecientes: number;
    necesitanAtencion: number;
    lecturasDelMes: number;
    anomaliasDetectadas: number;
  }> {
    const [
      todosLosMedidores,
      medidoresNecesitanAtencion,
      lecturasDelMes,
      lecturasAnomalas,
    ] = await Promise.all([
      this.medidoresService.buscarTodos(cooperativaId, { limite: 1000 }),
      this.medidoresService.buscarTodos(cooperativaId, {
        necesitaAtencion: true,
        limite: 1000,
      }),
      this.medidoresService.buscarLecturas(
        {
          mes: new Date().getMonth() + 1,
          anio: new Date().getFullYear(),
          limite: 1000,
        },
        cooperativaId,
      ),
      this.medidoresService.buscarLecturas(
        {
          soloAnomalias: true,
          mes: new Date().getMonth() + 1,
          anio: new Date().getFullYear(),
          limite: 1000,
        },
        cooperativaId,
      ),
    ]);

    const medidoresActivos = todosLosMedidores.items.filter(
      (m) => m.activo,
    ).length;
    const conLecturasRecientes = todosLosMedidores.items.filter(
      (m) =>
        m.lecturaActual &&
        new Date(m.lecturaActual.fechaLectura) >
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    ).length;

    return {
      totalMedidores: todosLosMedidores.total,
      medidoresActivos,
      medidoresInactivos: todosLosMedidores.total - medidoresActivos,
      conLecturasRecientes,
      necesitanAtencion: medidoresNecesitanAtencion.total,
      lecturasDelMes: lecturasDelMes.total,
      anomaliasDetectadas: lecturasAnomalas.total,
    };
  }
}
