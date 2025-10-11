import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMedidorDto,
  UpdateMedidorDto,
  VincularMedidorDto,
  DesvincularMedidorDto,
  CreateLecturaDto,
  UpdateLecturaDto,
  BuscarLecturasDto,
} from './dto';
import {
  MedidorDetalle,
  LecturaDetalle,
  EstadisticasMedidor,
  HistorialVinculacion,
  FiltrosMedidores,
  ResultadoPaginado,
  LecturaResumen,
} from './interfaces/medidores.interface';

@Injectable()
export class MedidoresService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // CRUD DE MEDIDORES
  // ============================================

  async crear(
    createMedidorDto: CreateMedidorDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<MedidorDetalle> {
    // Verificar que no exista un medidor con el mismo número en la cooperativa
    const medidorExistente = await this.prisma.medidor.findFirst({
      where: {
        numeroMedidor: createMedidorDto.numeroMedidor,
        cooperativaId,
      },
    });

    if (medidorExistente) {
      throw new ConflictException(
        `Ya existe un medidor con el número ${createMedidorDto.numeroMedidor} en esta cooperativa`,
      );
    }

    // Verificar que el inmueble existe y pertenece a la cooperativa (si se especifica)
    if (createMedidorDto.inmuebleId) {
      const inmueble = await this.prisma.inmueble.findFirst({
        where: {
          id: createMedidorDto.inmuebleId,
          cuentas: {
            some: {
              cooperativaId,
            },
          },
        },
      });

      if (!inmueble) {
        throw new NotFoundException('Inmueble no encontrado o no pertenece a esta cooperativa');
      }
    }

    const medidor = await this.prisma.medidor.create({
      data: {
        ...createMedidorDto,
        cooperativaId,
        fechaInstalacion: createMedidorDto.fechaInstalacion
          ? new Date(createMedidorDto.fechaInstalacion)
          : undefined,
      },
      include: this.getIncludeMedidor(),
    });

    return this.mapMedidorDetalle(medidor);
  }

  async buscarTodos(
    cooperativaId: string,
    filtros: FiltrosMedidores = {},
  ): Promise<ResultadoPaginado<MedidorDetalle>> {
    const {
      limite = 20,
      pagina = 1,
      ordenPor = 'numeroMedidor',
      orden = 'asc',
      ...otrosFiltros
    } = filtros;

    const skip = (pagina - 1) * limite;

    const where = this.construirWhereMedidores(cooperativaId, otrosFiltros);

    const [medidores, total] = await Promise.all([
      this.prisma.medidor.findMany({
        where,
        include: this.getIncludeMedidor(),
        skip,
        take: limite,
        orderBy: { [ordenPor]: orden },
      }),
      this.prisma.medidor.count({ where }),
    ]);

    return {
      items: medidores.map(this.mapMedidorDetalle),
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async buscarPorId(id: string, cooperativaId: string): Promise<MedidorDetalle> {
    const medidor = await this.prisma.medidor.findFirst({
      where: { id, cooperativaId },
      include: {
        ...this.getIncludeMedidor(),
        lecturas: {
          take: 12,
          orderBy: { fechaLectura: 'desc' },
          include: {
            tomadoPor: {
              select: { id: true, nombre: true, apellido: true },
            },
          },
        },
        historialVinculaciones: {
          take: 10,
          orderBy: { fechaOperacion: 'desc' },
          include: {
            operadoPor: {
              select: { id: true, nombre: true, apellido: true },
            },
          },
        },
      },
    });

    if (!medidor) {
      throw new NotFoundException('Medidor no encontrado');
    }

    return this.mapMedidorDetalle(medidor);
  }

  async actualizar(
    id: string,
    updateMedidorDto: UpdateMedidorDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<MedidorDetalle> {
    const medidor = await this.prisma.medidor.findFirst({
      where: { id, cooperativaId },
    });

    if (!medidor) {
      throw new NotFoundException('Medidor no encontrado');
    }

    // Verificar número único si se está cambiando
    if (updateMedidorDto.numeroMedidor && updateMedidorDto.numeroMedidor !== medidor.numeroMedidor) {
      const medidorExistente = await this.prisma.medidor.findFirst({
        where: {
          numeroMedidor: updateMedidorDto.numeroMedidor,
          cooperativaId,
          id: { not: id },
        },
      });

      if (medidorExistente) {
        throw new ConflictException(
          `Ya existe un medidor con el número ${updateMedidorDto.numeroMedidor}`,
        );
      }
    }

    // Verificar inmueble si se está cambiando
    if (updateMedidorDto.inmuebleId) {
      const inmueble = await this.prisma.inmueble.findFirst({
        where: {
          id: updateMedidorDto.inmuebleId,
          cuentas: {
            some: { cooperativaId },
          },
        },
      });

      if (!inmueble) {
        throw new NotFoundException('Inmueble no encontrado');
      }
    }

    const medidorActualizado = await this.prisma.medidor.update({
      where: { id },
      data: {
        ...updateMedidorDto,
        fechaInstalacion: updateMedidorDto.fechaInstalacion
          ? new Date(updateMedidorDto.fechaInstalacion)
          : undefined,
      },
      include: this.getIncludeMedidor(),
    });

    return this.mapMedidorDetalle(medidorActualizado);
  }

  async eliminar(id: string, cooperativaId: string, usuarioId: string): Promise<void> {
    const medidor = await this.prisma.medidor.findFirst({
      where: { id, cooperativaId },
      include: {
        lecturas: true,
        cuentasServicios: true,
      },
    });

    if (!medidor) {
      throw new NotFoundException('Medidor no encontrado');
    }

    if (medidor.lecturas.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar un medidor que tiene lecturas registradas',
      );
    }

    if (medidor.cuentasServicios.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar un medidor que está vinculado a cuentas de servicio',
      );
    }

    await this.prisma.medidor.delete({ where: { id } });
  }

  // ============================================
  // VINCULACIONES DE MEDIDORES
  // ============================================

  async vincular(
    vincularDto: VincularMedidorDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<{ success: boolean; message: string }> {
    const medidor = await this.prisma.medidor.findFirst({
      where: { id: vincularDto.medidorId, cooperativaId },
    });

    if (!medidor) {
      throw new NotFoundException('Medidor no encontrado');
    }

    if (vincularDto.tipoVinculacion === 'INMUEBLE') {
      // Verificar que el inmueble existe
      const inmueble = await this.prisma.inmueble.findFirst({
        where: {
          id: vincularDto.entidadId,
          cuentas: { some: { cooperativaId } },
        },
      });

      if (!inmueble) {
        throw new NotFoundException('Inmueble no encontrado');
      }

      // Actualizar medidor con inmueble
      await this.prisma.medidor.update({
        where: { id: vincularDto.medidorId },
        data: { inmuebleId: vincularDto.entidadId },
      });
    } else if (vincularDto.tipoVinculacion === 'CUENTA_SERVICIO') {
      // Verificar que la cuenta servicio existe
      const cuentaServicio = await this.prisma.cuentaServicio.findFirst({
        where: {
          id: vincularDto.entidadId,
          cuenta: { cooperativaId },
        },
      });

      if (!cuentaServicio) {
        throw new NotFoundException('Cuenta de servicio no encontrada');
      }

      // Actualizar cuenta servicio con medidor
      await this.prisma.cuentaServicio.update({
        where: { id: vincularDto.entidadId },
        data: { medidorId: vincularDto.medidorId },
      });
    }

    // Registrar historial
    await this.prisma.historialVinculacionMedidor.create({
      data: {
        medidorId: vincularDto.medidorId,
        tipoVinculacion: vincularDto.tipoVinculacion as any,
        accion: 'VINCULACION',
        entidadNuevaId: vincularDto.entidadId,
        motivo: vincularDto.motivo,
        observaciones: vincularDto.observaciones,
        operadoPorId: usuarioId,
      },
    });

    return {
      success: true,
      message: `Medidor vinculado exitosamente a ${vincularDto.tipoVinculacion.toLowerCase()}`,
    };
  }

  async desvincular(
    medidorId: string,
    tipoVinculacion: 'INMUEBLE' | 'CUENTA_SERVICIO',
    desvincularDto: DesvincularMedidorDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<{ success: boolean; message: string }> {
    const medidor = await this.prisma.medidor.findFirst({
      where: { id: medidorId, cooperativaId },
      include: {
        cuentasServicios: true,
      },
    });

    if (!medidor) {
      throw new NotFoundException('Medidor no encontrado');
    }

    let entidadAnteriorId: string | undefined;

    if (tipoVinculacion === 'INMUEBLE') {
      if (!medidor.inmuebleId) {
        throw new BadRequestException('El medidor no está vinculado a ningún inmueble');
      }

      entidadAnteriorId = medidor.inmuebleId;

      // Desvincular inmueble
      await this.prisma.medidor.update({
        where: { id: medidorId },
        data: { inmuebleId: null },
      });
    } else if (tipoVinculacion === 'CUENTA_SERVICIO') {
      if (medidor.cuentasServicios.length === 0) {
        throw new BadRequestException('El medidor no está vinculado a ninguna cuenta de servicio');
      }

      // Por simplicidad, desvinculamos todas las cuentas servicio
      // En un caso real, podrías especificar cuál desvincular
      const cuentaServicio = medidor.cuentasServicios[0];
      entidadAnteriorId = cuentaServicio.id;

      await this.prisma.cuentaServicio.update({
        where: { id: cuentaServicio.id },
        data: { medidorId: null },
      });
    }

    // Registrar historial
    await this.prisma.historialVinculacionMedidor.create({
      data: {
        medidorId,
        tipoVinculacion: tipoVinculacion as any,
        accion: 'DESVINCULACION',
        entidadAnteriorId,
        motivo: desvincularDto.motivo,
        observaciones: desvincularDto.observaciones,
        operadoPorId: usuarioId,
      },
    });

    return {
      success: true,
      message: `Medidor desvinculado exitosamente de ${tipoVinculacion.toLowerCase()}`,
    };
  }

  async obtenerHistorialVinculaciones(
    medidorId: string,
    cooperativaId: string,
  ): Promise<HistorialVinculacion[]> {
    const medidor = await this.prisma.medidor.findFirst({
      where: { id: medidorId, cooperativaId },
    });

    if (!medidor) {
      throw new NotFoundException('Medidor no encontrado');
    }

    const historial = await this.prisma.historialVinculacionMedidor.findMany({
      where: { medidorId },
      include: {
        operadoPor: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
      orderBy: { fechaOperacion: 'desc' },
    });

    return historial.map((h) => ({
      id: h.id,
      tipoVinculacion: h.tipoVinculacion as 'CUENTA_SERVICIO' | 'INMUEBLE',
      accion: h.accion as 'VINCULACION' | 'DESVINCULACION' | 'CAMBIO',
      entidadAnteriorId: h.entidadAnteriorId ?? undefined,
      entidadNuevaId: h.entidadNuevaId ?? undefined,
      motivo: h.motivo ?? undefined,
      observaciones: h.observaciones ?? undefined,
      fechaOperacion: h.fechaOperacion,
      medidorId: h.medidorId,
      operadoPorId: h.operadoPorId,
      operadoPor: h.operadoPor,
    }));
  }

  // ============================================
  // LECTURAS DE MEDIDORES
  // ============================================

  async crearLectura(
    createLecturaDto: CreateLecturaDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<LecturaDetalle> {
    const medidor = await this.prisma.medidor.findFirst({
      where: { id: createLecturaDto.medidorId, cooperativaId },
    });

    if (!medidor) {
      throw new NotFoundException('Medidor no encontrado');
    }

    // Si es principal, marcar otras lecturas del mismo mes como no principales
    if (createLecturaDto.esPrincipal) {
      await this.prisma.lectura.updateMany({
        where: {
          medidorId: createLecturaDto.medidorId,
          mes: createLecturaDto.mes,
          anio: createLecturaDto.anio,
        },
        data: { esPrincipal: false },
      });
    }

    // Calcular consumo si hay lectura anterior
    let consumoCalculado: number | undefined;
    const lecturaAnterior = parseFloat(createLecturaDto.lecturaAnterior || '0');
    const lecturaActual = parseFloat(createLecturaDto.valorLectura);

    if (lecturaAnterior > 0 && lecturaActual > lecturaAnterior) {
      consumoCalculado = lecturaActual - lecturaAnterior;
    }

    // Detectar anomalías básicas
    let anomalia = false;
    let tipoAnomalia: string | undefined;

    if (consumoCalculado && consumoCalculado > 0) {
      // Obtener promedio de los últimos 6 meses
      const lecturasAnteriores = await this.prisma.lectura.findMany({
        where: {
          medidorId: createLecturaDto.medidorId,
          consumoCalculado: { not: null },
        },
        orderBy: { fechaLectura: 'desc' },
        take: 6,
      });

      if (lecturasAnteriores.length >= 3) {
        const promedioAnterior = lecturasAnteriores.reduce(
          (sum, l) => sum + (parseFloat(l.consumoCalculado?.toString() || '0')),
          0,
        ) / lecturasAnteriores.length;

        // Detectar crecimiento mayor al 30%
        if (consumoCalculado > promedioAnterior * 1.3) {
          anomalia = true;
          tipoAnomalia = 'CONSUMO_ELEVADO';
        } else if (consumoCalculado < promedioAnterior * 0.3) {
          anomalia = true;
          tipoAnomalia = 'CONSUMO_BAJO';
        }
      }
    }

    const lectura = await this.prisma.lectura.create({
      data: {
        medidorId: createLecturaDto.medidorId,
        fechaLectura: new Date(createLecturaDto.fechaLectura),
        valorLectura: parseFloat(createLecturaDto.valorLectura),
        lecturaAnterior: lecturaAnterior > 0 ? lecturaAnterior : null,
        consumoCalculado,
        mes: createLecturaDto.mes,
        anio: createLecturaDto.anio,
        observaciones: createLecturaDto.observaciones,
        esPrincipal: createLecturaDto.esPrincipal || false,
        anomalia,
        tipoAnomalia,
        tomadoPorId: usuarioId,
      },
      include: {
        medidor: {
          select: { id: true, numeroMedidor: true, marca: true, modelo: true },
        },
        tomadoPor: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    });

    return this.mapLecturaDetalle(lectura);
  }

  async buscarLecturas(
    buscarDto: BuscarLecturasDto,
    cooperativaId: string,
  ): Promise<ResultadoPaginado<LecturaDetalle>> {
    const {
      limite = 20,
      pagina = 1,
      medidorId,
      mes,
      anio,
      fechaDesde,
      fechaHasta,
      soloAnomalias,
      soloPrincipales,
    } = buscarDto;

    const skip = (pagina - 1) * limite;

    const where: any = {
      medidor: { cooperativaId },
    };

    if (medidorId) where.medidorId = medidorId;
    if (mes) where.mes = mes;
    if (anio) where.anio = anio;
    if (soloAnomalias) where.anomalia = true;
    if (soloPrincipales) where.esPrincipal = true;

    if (fechaDesde || fechaHasta) {
      where.fechaLectura = {};
      if (fechaDesde) where.fechaLectura.gte = new Date(fechaDesde);
      if (fechaHasta) where.fechaLectura.lte = new Date(fechaHasta);
    }

    const [lecturas, total] = await Promise.all([
      this.prisma.lectura.findMany({
        where,
        include: {
          medidor: {
            select: { id: true, numeroMedidor: true, marca: true, modelo: true },
          },
          tomadoPor: {
            select: { id: true, nombre: true, apellido: true },
          },
          factura: {
            select: { id: true, numeroFactura: true, periodo: true },
          },
        },
        skip,
        take: limite,
        orderBy: { fechaLectura: 'desc' },
      }),
      this.prisma.lectura.count({ where }),
    ]);

    return {
      items: lecturas.map(this.mapLecturaDetalle),
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async obtenerLecturaPrincipal(
    medidorId: string,
    mes: number,
    anio: number,
    cooperativaId: string,
  ): Promise<LecturaDetalle | null> {
    const medidor = await this.prisma.medidor.findFirst({
      where: { id: medidorId, cooperativaId },
    });

    if (!medidor) {
      throw new NotFoundException('Medidor no encontrado');
    }

    const lectura = await this.prisma.lectura.findFirst({
      where: {
        medidorId,
        mes,
        anio,
        esPrincipal: true,
      },
      include: {
        medidor: {
          select: { id: true, numeroMedidor: true, marca: true, modelo: true },
        },
        tomadoPor: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    });

    return lectura ? this.mapLecturaDetalle(lectura) : null;
  }

  async actualizarLectura(
    id: string,
    updateLecturaDto: UpdateLecturaDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<LecturaDetalle> {
    const lectura = await this.prisma.lectura.findFirst({
      where: {
        id,
        medidor: { cooperativaId },
      },
    });

    if (!lectura) {
      throw new NotFoundException('Lectura no encontrada');
    }

    // Si se está marcando como principal, desmarcar otras del mismo mes
    if (updateLecturaDto.esPrincipal && !lectura.esPrincipal) {
      await this.prisma.lectura.updateMany({
        where: {
          medidorId: lectura.medidorId,
          mes: updateLecturaDto.mes || lectura.mes,
          anio: updateLecturaDto.anio || lectura.anio,
          id: { not: id },
        },
        data: { esPrincipal: false },
      });
    }

    const lecturaActualizada = await this.prisma.lectura.update({
      where: { id },
      data: {
        ...updateLecturaDto,
        fechaLectura: updateLecturaDto.fechaLectura
          ? new Date(updateLecturaDto.fechaLectura)
          : undefined,
        valorLectura: updateLecturaDto.valorLectura
          ? parseFloat(updateLecturaDto.valorLectura)
          : undefined,
        lecturaAnterior: updateLecturaDto.lecturaAnterior
          ? parseFloat(updateLecturaDto.lecturaAnterior)
          : undefined,
      },
      include: {
        medidor: {
          select: { id: true, numeroMedidor: true, marca: true, modelo: true },
        },
        tomadoPor: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    });

    return this.mapLecturaDetalle(lecturaActualizada);
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  async obtenerEstadisticas(
    medidorId: string,
    cooperativaId: string,
  ): Promise<EstadisticasMedidor> {
    const medidor = await this.prisma.medidor.findFirst({
      where: { id: medidorId, cooperativaId },
      include: {
        lecturas: {
          orderBy: { fechaLectura: 'desc' },
          take: 12,
        },
      },
    });

    if (!medidor) {
      throw new NotFoundException('Medidor no encontrado');
    }

    // Calcular tiempo de instalación
    const fechaInstalacion = medidor.fechaInstalacion || medidor.createdAt;
    const ahora = new Date();
    const diferenciaTiempo = ahora.getTime() - fechaInstalacion.getTime();
    const dias = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));
    const años = Math.floor(dias / 365);
    const meses = Math.floor((dias % 365) / 30);

    // Estadísticas de consumo
    const lecturasConConsumo = medidor.lecturas.filter(l => l.consumoCalculado);
    const promedioMensual = lecturasConConsumo.length > 0
      ? lecturasConConsumo.reduce((sum, l) => sum + parseFloat(l.consumoCalculado?.toString() || '0'), 0) / lecturasConConsumo.length
      : 0;

    // Últimos 6 promedios mensuales
    const ultimosSeisPromedios: number[] = [];
    for (let i = 0; i < 6 && i < lecturasConConsumo.length; i++) {
      ultimosSeisPromedios.push(parseFloat(lecturasConConsumo[i].consumoCalculado?.toString() || '0'));
    }

    // Calcular variación y tendencia
    let variacionPorcentual = 0;
    let tendencia: 'CRECIENTE' | 'DECRECIENTE' | 'ESTABLE' = 'ESTABLE';

    if (ultimosSeisPromedios.length >= 2) {
      const consumoReciente = ultimosSeisPromedios[0];
      const consumoAnterior = ultimosSeisPromedios[ultimosSeisPromedios.length - 1];
      
      if (consumoAnterior > 0) {
        variacionPorcentual = ((consumoReciente - consumoAnterior) / consumoAnterior) * 100;
        
        if (variacionPorcentual > 10) tendencia = 'CRECIENTE';
        else if (variacionPorcentual < -10) tendencia = 'DECRECIENTE';
      }
    }

    // Detectar crecimiento anómalo
    const tieneCreceimientoAnomalov = Math.abs(variacionPorcentual) > 30;

    // Estadísticas de lecturas
    const totalLecturas = await this.prisma.lectura.count({
      where: { medidorId },
    });

    const anomaliasDetectadas = await this.prisma.lectura.count({
      where: { medidorId, anomalia: true },
    });

    // Determinar frecuencia de lecturas
    let frecuenciaLecturas: 'REGULAR' | 'IRREGULAR' | 'ESCASA' = 'REGULAR';
    const mesesConLectura = new Set(medidor.lecturas.map(l => `${l.anio}-${l.mes}`)).size;
    
    if (mesesConLectura < 3) frecuenciaLecturas = 'ESCASA';
    else if (medidor.lecturas.length / mesesConLectura < 0.7) frecuenciaLecturas = 'IRREGULAR';

    // Estado general y puntuación de salud
    const motivosAtencion: string[] = [];
    let puntuacionSalud = 100;

    if (años >= 10) {
      motivosAtencion.push('Medidor antiguo (más de 10 años)');
      puntuacionSalud -= 20;
    }

    if (tieneCreceimientoAnomalov) {
      motivosAtencion.push('Variación de consumo superior al 30%');
      puntuacionSalud -= 25;
    }

    if (anomaliasDetectadas > totalLecturas * 0.2) {
      motivosAtencion.push('Alto porcentaje de lecturas anómalas');
      puntuacionSalud -= 15;
    }

    if (frecuenciaLecturas === 'ESCASA') {
      motivosAtencion.push('Pocas lecturas registradas');
      puntuacionSalud -= 10;
    }

    const ultimaLectura = medidor.lecturas[0];
    const lecturaMasAntigua = medidor.lecturas[medidor.lecturas.length - 1];

    return {
      medidorId: medidor.id,
      numeroMedidor: medidor.numeroMedidor,
      tiempoInstalacion: {
        dias,
        meses,
        años,
        necesitaCambio: años >= 10,
      },
      consumo: {
        promedioMensual,
        ultimosSeisPromedios,
        variacionPorcentual,
        tieneCreceimientoAnomalov,
        tendencia,
      },
      lecturas: {
        total: totalLecturas,
        ultimaLectura: ultimaLectura ? this.mapLecturaResumen(ultimaLectura) : undefined,
        lecturaMasAntigua: lecturaMasAntigua ? this.mapLecturaResumen(lecturaMasAntigua) : undefined,
        anomaliasDetectadas,
        frecuenciaLecturas,
      },
      estado: {
        activo: medidor.activo,
        necesitaAtencion: motivosAtencion.length > 0,
        motivosAtencion,
        puntuacionSalud: Math.max(0, puntuacionSalud),
      },
    };
  }

  // ============================================
  // MÉTODOS PRIVADOS Y HELPERS
  // ============================================

  private getIncludeMedidor() {
    return {
      cooperativa: {
        select: { id: true, nombre: true },
      },
      inmueble: {
        select: {
          id: true,
          domicilio: true,
          localidad: true,
          titularInmueble: {
            select: { nombreCompleto: true },
          },
        },
      },
      cuentasServicios: {
        where: { activo: true },
        select: {
          id: true,
          activo: true,
          servicio: {
            select: { nombre: true, codigo: true },
          },
          categoria: {
            select: { nombre: true },
          },
        },
      },
      lecturas: {
        where: { esPrincipal: true },
        orderBy: { fechaLectura: 'desc' as const },
        take: 1,
        select: {
          id: true,
          valorLectura: true,
          fechaLectura: true,
          consumoCalculado: true,
        },
      },
    };
  }

  private construirWhereMedidores(cooperativaId: string, filtros: Partial<FiltrosMedidores>) {
    const where: any = { cooperativaId };

    if (filtros.activo !== undefined) where.activo = filtros.activo;
    if (filtros.inmuebleId) where.inmuebleId = filtros.inmuebleId;
    if (filtros.marca) where.marca = { contains: filtros.marca, mode: 'insensitive' };
    if (filtros.modelo) where.modelo = { contains: filtros.modelo, mode: 'insensitive' };

    if (filtros.fechaInstalacionDesde || filtros.fechaInstalacionHasta) {
      where.fechaInstalacion = {};
      if (filtros.fechaInstalacionDesde) where.fechaInstalacion.gte = filtros.fechaInstalacionDesde;
      if (filtros.fechaInstalacionHasta) where.fechaInstalacion.lte = filtros.fechaInstalacionHasta;
    }

    if (filtros.busqueda) {
      where.OR = [
        { numeroMedidor: { contains: filtros.busqueda, mode: 'insensitive' } },
        { marca: { contains: filtros.busqueda, mode: 'insensitive' } },
        { modelo: { contains: filtros.busqueda, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private mapMedidorDetalle(medidor: any): MedidorDetalle {
    return {
      id: medidor.id,
      numeroMedidor: medidor.numeroMedidor,
      marca: medidor.marca,
      modelo: medidor.modelo,
      fechaInstalacion: medidor.fechaInstalacion,
      activo: medidor.activo,
      observaciones: medidor.observaciones,
      createdAt: medidor.createdAt,
      updatedAt: medidor.updatedAt,
      cooperativaId: medidor.cooperativaId,
      inmuebleId: medidor.inmuebleId,
      cooperativa: medidor.cooperativa,
      inmueble: medidor.inmueble,
      cuentasServicios: medidor.cuentasServicios,
      lecturaActual: medidor.lecturas?.[0],
      ultimasLecturas: medidor.lecturas?.map(this.mapLecturaResumen),
    };
  }

  private mapLecturaDetalle(lectura: any): LecturaDetalle {
    return {
      id: lectura.id,
      fechaLectura: lectura.fechaLectura,
      valorLectura: parseFloat(lectura.valorLectura.toString()),
      consumoCalculado: lectura.consumoCalculado ? parseFloat(lectura.consumoCalculado.toString()) : undefined,
      mes: lectura.mes,
      anio: lectura.anio,
      observaciones: lectura.observaciones,
      esPrincipal: lectura.esPrincipal,
      lecturaAnterior: lectura.lecturaAnterior ? parseFloat(lectura.lecturaAnterior.toString()) : undefined,
      anomalia: lectura.anomalia,
      tipoAnomalia: lectura.tipoAnomalia,
      createdAt: lectura.createdAt,
      medidorId: lectura.medidorId,
      medidor: lectura.medidor,
      tomadoPorId: lectura.tomadoPorId,
      tomadoPor: lectura.tomadoPor,
      facturaId: lectura.facturaId,
      factura: lectura.factura,
    };
  }

  private mapLecturaResumen(lectura: any): LecturaResumen {
    return {
      id: lectura.id,
      fechaLectura: lectura.fechaLectura,
      valorLectura: parseFloat(lectura.valorLectura.toString()),
      consumoCalculado: lectura.consumoCalculado ? parseFloat(lectura.consumoCalculado.toString()) : undefined,
      mes: lectura.mes,
      anio: lectura.anio,
      esPrincipal: lectura.esPrincipal,
      anomalia: lectura.anomalia,
    };
  }
}