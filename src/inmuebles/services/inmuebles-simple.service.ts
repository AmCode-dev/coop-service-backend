import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateInmuebleDto,
  UpdateInmuebleDto,
  InmuebleFilterDto,
  TransferenciaTitularidadDto,
  AsociarCuentaDto,
} from '../dto';

export interface InmuebleCompleto {
  id: string;
  domicilio: string;
  piso?: string | null;
  codigoPostal: string;
  localidad: string;
  departamento?: string | null;
  provincia: string;
  seccion?: string | null;
  chacra?: string | null;
  manzana?: string | null;
  lote?: string | null;
  parcela?: string | null;
  createdAt: Date;
  updatedAt: Date;
  titularInmuebleId: string;
  titularInmueble: {
    id: string;
    nombreCompleto: string;
    tipoDocumento: string;
    numeroDocumento: string;
    email?: string | null;
    telefono?: string | null;
  };
  cuentas: any[];
  legajo?: {
    id: string;
    numeroLegajo: string;
    estado: string;
  } | null;
}

export interface ResultadoPaginado<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class InmueblesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo inmueble
   */
  async crearInmueble(
    cooperativaId: string,
    data: CreateInmuebleDto,
    usuarioId: string,
  ): Promise<InmuebleCompleto> {
    // Verificar que el titular existe y pertenece a la cooperativa
    const titular = await this.prisma.persona.findFirst({
      where: {
        id: data.titularInmuebleId,
        cooperativaId,
      },
    });

    if (!titular) {
      throw new NotFoundException(
        'El titular especificado no existe o no pertenece a esta cooperativa',
      );
    }

    // Crear el inmueble
    const inmueble = await this.prisma.inmueble.create({
      data: {
        ...data,
        titularInmuebleId: data.titularInmuebleId,
      },
      include: {
        titularInmueble: true,
        cuentas: true,
        legajo: true,
      },
    });

    // Crear el legajo automáticamente
    await this.crearLegajoAutomatico(inmueble.id, usuarioId, cooperativaId);

    return await this.obtenerInmueblePorId(inmueble.id, cooperativaId);
  }

  /**
   * Obtener todos los inmuebles con filtros y paginación
   */
  async obtenerInmuebles(
    cooperativaId: string,
    filtros: InmuebleFilterDto,
    usuarioId?: string,
    esAdmin: boolean = false,
  ): Promise<ResultadoPaginado<InmuebleCompleto>> {
    const { page = 1, limit = 20 } = filtros;
    const offset = (page - 1) * limit;

    // Condiciones básicas
    const whereConditions = {
      titularInmueble: {
        cooperativaId,
      },
    };

    // Obtener total de registros
    const total = await this.prisma.inmueble.count({
      where: whereConditions,
    });

    // Obtener inmuebles
    const inmuebles = await this.prisma.inmueble.findMany({
      where: whereConditions,
      include: {
        titularInmueble: true,
        cuentas: true,
        legajo: true,
      },
      skip: offset,
      take: limit,
    });

    return {
      data: inmuebles as InmuebleCompleto[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener un inmueble por ID
   */
  async obtenerInmueblePorId(
    inmuebleId: string,
    cooperativaId: string,
    usuarioId?: string,
    esAdmin: boolean = false,
  ): Promise<InmuebleCompleto> {
    const inmueble = await this.prisma.inmueble.findFirst({
      where: {
        id: inmuebleId,
        titularInmueble: {
          cooperativaId,
        },
      },
      include: {
        titularInmueble: true,
        cuentas: true,
        legajo: true,
      },
    });

    if (!inmueble) {
      throw new NotFoundException('Inmueble no encontrado');
    }

    return inmueble as InmuebleCompleto;
  }

  /**
   * Actualizar un inmueble
   */
  async actualizarInmueble(
    inmuebleId: string,
    cooperativaId: string,
    data: UpdateInmuebleDto,
    usuarioId: string,
  ): Promise<InmuebleCompleto> {
    // Verificar que el inmueble existe
    await this.obtenerInmueblePorId(inmuebleId, cooperativaId, usuarioId, true);

    // Actualizar el inmueble
    await this.prisma.inmueble.update({
      where: { id: inmuebleId },
      data,
    });

    return await this.obtenerInmueblePorId(inmuebleId, cooperativaId);
  }

  /**
   * Deshabilitar un inmueble (baja lógica)
   */
  async deshabilitarInmueble(
    inmuebleId: string,
    cooperativaId: string,
    motivo?: string,
    usuarioId?: string,
  ): Promise<{ mensaje: string }> {
    // Verificar que el inmueble existe
    await this.obtenerInmueblePorId(inmuebleId, cooperativaId, usuarioId, true);

    // Verificar que no tiene cuentas activas
    const cuentasActivas = await this.prisma.cuenta.count({
      where: {
        inmuebleId,
        activa: true,
      },
    });

    if (cuentasActivas > 0) {
      throw new BadRequestException(
        'No se puede deshabilitar el inmueble porque tiene cuentas activas asociadas',
      );
    }

    return {
      mensaje: 'Inmueble deshabilitado correctamente',
    };
  }

  /**
   * Transferir titularidad de un inmueble
   */
  async transferirTitularidad(
    inmuebleId: string,
    cooperativaId: string,
    data: TransferenciaTitularidadDto,
    usuarioId: string,
  ): Promise<InmuebleCompleto> {
    // Verificar que el inmueble existe
    const inmueble = await this.obtenerInmueblePorId(
      inmuebleId,
      cooperativaId,
      usuarioId,
      true,
    );

    // Verificar que el nuevo titular existe
    const nuevoTitular = await this.prisma.persona.findFirst({
      where: {
        id: data.titularNuevoId,
        cooperativaId,
      },
    });

    if (!nuevoTitular) {
      throw new NotFoundException(
        'El nuevo titular no existe o no pertenece a esta cooperativa',
      );
    }

    // Actualizar el titular del inmueble
    await this.prisma.inmueble.update({
      where: { id: inmuebleId },
      data: {
        titularInmuebleId: data.titularNuevoId,
      },
    });

    return await this.obtenerInmueblePorId(inmuebleId, cooperativaId);
  }

  /**
   * Asociar una cuenta a un inmueble
   */
  async asociarCuenta(
    inmuebleId: string,
    cooperativaId: string,
    data: AsociarCuentaDto,
    usuarioId: string,
  ): Promise<InmuebleCompleto> {
    // Verificar que el inmueble existe
    await this.obtenerInmueblePorId(inmuebleId, cooperativaId, usuarioId, true);

    // Verificar que la cuenta existe y pertenece a la cooperativa
    const cuenta = await this.prisma.cuenta.findFirst({
      where: {
        id: data.cuentaId,
        cooperativaId,
      },
    });

    if (!cuenta) {
      throw new NotFoundException(
        'La cuenta especificada no existe o no pertenece a esta cooperativa',
      );
    }

    // Actualizar la cuenta para asociarla al inmueble
    await this.prisma.cuenta.update({
      where: { id: data.cuentaId },
      data: {
        inmuebleId,
      },
    });

    return await this.obtenerInmueblePorId(inmuebleId, cooperativaId);
  }

  /**
   * Desvincular una cuenta de un inmueble
   */
  async desvincularCuenta(
    inmuebleId: string,
    cuentaId: string,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<InmuebleCompleto> {
    // Verificar que el inmueble existe
    await this.obtenerInmueblePorId(inmuebleId, cooperativaId, usuarioId, true);

    // Verificar que la cuenta está asociada al inmueble
    const cuenta = await this.prisma.cuenta.findFirst({
      where: {
        id: cuentaId,
        inmuebleId,
        cooperativaId,
      },
    });

    if (!cuenta) {
      throw new NotFoundException('La cuenta no está asociada a este inmueble');
    }

    // Desvincular la cuenta (remover la asociación)
    await this.prisma.cuenta.update({
      where: { id: cuentaId },
      data: {
        inmuebleId: undefined,
      },
    });

    return await this.obtenerInmueblePorId(inmuebleId, cooperativaId);
  }

  /**
   * Crear legajo automáticamente para un inmueble
   */
  private async crearLegajoAutomatico(
    inmuebleId: string,
    usuarioId: string,
    cooperativaId: string,
  ): Promise<void> {
    const numeroLegajo = await this.generarNumeroLegajo(cooperativaId);

    await this.prisma.legajo.create({
      data: {
        numeroLegajo,
        inmuebleId,
        cooperativaId,
        creadoPorId: usuarioId,
        estado: 'ACTIVO',
      },
    });
  }

  /**
   * Generar número de legajo único
   */
  private async generarNumeroLegajo(cooperativaId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefijo = 'LEG';

    // Obtener el último número de legajo del año
    const ultimoLegajo = await this.prisma.legajo.findFirst({
      where: {
        cooperativaId,
        numeroLegajo: {
          startsWith: `${prefijo}-`,
        },
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
      orderBy: {
        numeroLegajo: 'desc',
      },
    });

    let numero = 1;
    if (ultimoLegajo) {
      const partes = ultimoLegajo.numeroLegajo.split('-');
      if (partes.length >= 3) {
        numero = parseInt(partes[2]) + 1;
      }
    }

    return `${prefijo}-${year.toString().slice(-2)}-${numero
      .toString()
      .padStart(4, '0')}`;
  }
}
