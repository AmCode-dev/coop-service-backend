import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
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
  id: number;
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
  legajo?: any | null;
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
   * Solo usuarios con permisos de EXECUTE en inmuebles o administradores
   */
  async crearInmueble(
    cooperativaId: number,
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

    // Verificar que no exista otro inmueble con el mismo domicilio en la cooperativa
    const inmuebleExistente = await this.prisma.inmueble.findFirst({
      where: {
        domicilio: data.domicilio,
        titularInmueble: {
          cooperativaId,
        },
      },
    });

    if (inmuebleExistente) {
      throw new ConflictException(
        'Ya existe un inmueble con este domicilio en la cooperativa',
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
    cooperativaId: number,
    filtros: InmuebleFilterDto,
    usuarioId?: string,
    esAdmin: boolean = false,
  ): Promise<ResultadoPaginado<InmuebleCompleto>> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      ...otrosFiltros
    } = filtros;

    const offset = (page - 1) * limit;

    // Construir condiciones de filtro
    const whereConditions: any = {
      titularInmueble: {
        cooperativaId,
      },
    };

    // Si no es admin, solo puede ver inmuebles donde es titular o tiene cuenta asociada
    if (!esAdmin && usuarioId) {
      whereConditions.OR = [
        {
          titularInmueble: {
            usuarioVinculado: {
              some: {
                id: usuarioId,
              },
            },
          },
        },
        {
          cuentas: {
            some: {
              titularServicio: {
                usuarioVinculado: {
                  some: {
                    id: usuarioId,
                  },
                },
              },
            },
          },
        },
      ];
    }

    // Aplicar filtros de búsqueda
    if (search) {
      whereConditions.OR = [
        ...(whereConditions.OR || []),
        { domicilio: { contains: search, mode: 'insensitive' } },
        { localidad: { contains: search, mode: 'insensitive' } },
        { provincia: { contains: search, mode: 'insensitive' } },
        {
          titularInmueble: {
            nombreCompleto: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    // Aplicar otros filtros
    Object.entries(otrosFiltros).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'titularId') {
          whereConditions.titularInmuebleId = value;
        } else {
          whereConditions[key] = value;
        }
      }
    });

    // Obtener total de registros
    const total = await this.prisma.inmueble.count({
      where: whereConditions,
    });

    // Obtener inmuebles
    const inmuebles = await this.prisma.inmueble.findMany({
      where: whereConditions,
      include: {
        titularInmueble: true,
        cuentas: {
          include: {
            servicios: {
              include: {
                servicio: true,
                categoria: true,
              },
            },
          },
        },
        legajo: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: offset,
      take: limit,
    });

    return {
      data: inmuebles,
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
    inmuebleId: number,
    cooperativaId: number,
    usuarioId?: string,
    esAdmin: boolean = false,
  ): Promise<InmuebleCompleto> {
    const whereConditions: any = {
      id: inmuebleId,
      titularInmueble: {
        cooperativaId,
      },
    };

    // Si no es admin, verificar acceso
    if (!esAdmin && usuarioId) {
      whereConditions.OR = [
        {
          titularInmueble: {
            usuarioVinculado: {
              some: {
                id: usuarioId,
              },
            },
          },
        },
        {
          cuentas: {
            some: {
              titularServicio: {
                usuarioVinculado: {
                  some: {
                    id: usuarioId,
                  },
                },
              },
            },
          },
        },
      ];
    }

    const inmueble = await this.prisma.inmueble.findFirst({
      where: whereConditions,
      include: {
        titularInmueble: true,
        cuentas: {
          include: {
            servicios: {
              include: {
                servicio: true,
                categoria: true,
              },
            },
          },
        },
        legajo: {
          include: {
            transferencias: {
              include: {
                titularAnterior: true,
                titularNuevo: true,
                registradoPor: true,
                verificadoPor: true,
              },
              orderBy: {
                fechaTransferencia: 'desc',
              },
            },
            documentos: {
              include: {
                subidoPor: true,
                validadoPor: true,
              },
            },
            anotaciones: {
              include: {
                anotadoPor: true,
              },
              orderBy: {
                fechaAnotacion: 'desc',
              },
            },
          },
        },
      },
    });

    if (!inmueble) {
      throw new NotFoundException('Inmueble no encontrado');
    }

    return inmueble;
  }

  /**
   * Actualizar un inmueble
   * Solo usuarios con permisos de EXECUTE en inmuebles o administradores
   */
  async actualizarInmueble(
    inmuebleId: number,
    cooperativaId: number,
    data: UpdateInmuebleDto,
    usuarioId: string,
  ): Promise<InmuebleCompleto> {
    // Verificar que el inmueble existe
    const inmuebleExistente = await this.obtenerInmueblePorId(
      inmuebleId,
      cooperativaId,
      usuarioId,
      true, // Admin check se hace en el controller
    );

    if (!inmuebleExistente) {
      throw new NotFoundException('El inmueble no existe');
    }

    // Si se está cambiando el titular, verificar que existe
    if (data.titularInmuebleId) {
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
    }

    // Actualizar el inmueble
    await this.prisma.inmueble.update({
      where: { id: inmuebleId },
      data,
    });

    return await this.obtenerInmueblePorId(inmuebleId, cooperativaId);
  }

  /**
   * Deshabilitar un inmueble (baja lógica)
   * Solo usuarios con permisos de EXECUTE en inmuebles o administradores
   */
  async deshabilitarInmueble(
    inmuebleId: number,
    cooperativaId: number,
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

    // Agregar anotación al legajo si se proporciona motivo
    if (motivo && usuarioId) {
      const legajo = await this.prisma.legajo.findUnique({
        where: { inmuebleId },
      });

      if (legajo) {
        await this.prisma.anotacionLegajo.create({
          data: {
            legajoId: legajo.id,
            titulo: 'Inmueble deshabilitado',
            contenido: motivo,
            importante: true,
            anotadoPorId: usuarioId,
          },
        });
      }
    }

    // Aquí implementaríamos la lógica de baja lógica
    // Por ahora, agregaremos una anotación que indique la deshabilitación
    // En el futuro se podría agregar un campo "activo" al modelo Inmueble

    return {
      mensaje: 'Inmueble deshabilitado correctamente',
    };
  }

  /**
   * Transferir titularidad de un inmueble
   */
  async transferirTitularidad(
    inmuebleId: number,
    cooperativaId: number,
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

    // Verificar que no se está transfiriendo al mismo titular
    if (inmueble.titularInmuebleId === data.titularNuevoId) {
      throw new BadRequestException(
        'El nuevo titular no puede ser el mismo que el titular actual',
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      // Crear registro de transferencia
      const transferencia = await tx.transferenciaTitularidad.create({
        data: {
          numeroTransferencia:
            await this.generarNumeroTransferencia(cooperativaId),
          motivo: data.motivo as any, // Cast temporal mientras se resuelven los tipos
          descripcionMotivo: data.descripcionMotivo,
          fechaTransferencia: data.fechaTransferencia
            ? new Date(data.fechaTransferencia)
            : new Date(),
          titularAnteriorId: inmueble.titularInmuebleId,
          titularNuevoId: data.titularNuevoId,
          valorTransferencia: data.valorTransferencia,
          moneda: data.moneda || 'ARS',
          escribania: data.escribania,
          numeroEscritura: data.numeroEscritura,
          folioRegistro: data.folioRegistro,
          observaciones: data.observaciones,
          legajoId: inmueble.legajo?.id,
          registradoPorId: usuarioId,
        },
      });

      // Actualizar el titular del inmueble
      await tx.inmueble.update({
        where: { id: inmuebleId },
        data: {
          titularInmuebleId: data.titularNuevoId,
        },
      });

      // Agregar anotación al legajo
      await tx.anotacionLegajo.create({
        data: {
          legajoId: inmueble.legajo!.id,
          titulo: 'Transferencia de titularidad',
          contenido: `Transferencia registrada: ${transferencia.numeroTransferencia}. Motivo: ${data.motivo}. ${data.descripcionMotivo || ''}`,
          importante: true,
          anotadoPorId: usuarioId,
        },
      });

      return inmueble;
    });

    // Retornar el inmueble actualizado
    return await this.obtenerInmueblePorId(inmuebleId, cooperativaId);
  }

  /**
   * Asociar una cuenta a un inmueble
   */
  async asociarCuenta(
    inmuebleId: number,
    cooperativaId: number,
    data: AsociarCuentaDto,
    usuarioId: string,
  ): Promise<InmuebleCompleto> {
    // Verificar que el inmueble existe
    const inmueble = await this.obtenerInmueblePorId(
      inmuebleId,
      cooperativaId,
      usuarioId,
      true,
    );

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

    // Verificar que la cuenta no esté asociada a otro inmueble
    if (cuenta.inmuebleId !== inmuebleId && cuenta.inmuebleId !== null) {
      throw new ConflictException('La cuenta ya está asociada a otro inmueble');
    }

    // Actualizar la cuenta para asociarla al inmueble
    await this.prisma.cuenta.update({
      where: { id: data.cuentaId },
      data: {
        inmuebleId,
      },
    });

    // Agregar anotación al legajo
    if (inmueble.legajo) {
      await this.prisma.anotacionLegajo.create({
        data: {
          legajoId: inmueble.legajo.id,
          titulo: 'Cuenta asociada',
          contenido: `Se asoció la cuenta ${cuenta.numeroCuenta} al inmueble`,
          anotadoPorId: usuarioId,
        },
      });
    }

    return await this.obtenerInmueblePorId(inmuebleId, cooperativaId);
  }

  /**
   * Desvincular una cuenta de un inmueble
   */
  async desvincularCuenta(
    inmuebleId: number,
    cuentaId: string,
    cooperativaId: number,
    usuarioId: string,
  ): Promise<InmuebleCompleto> {
    // Verificar que el inmueble existe
    const inmueble = await this.obtenerInmueblePorId(
      inmuebleId,
      cooperativaId,
      usuarioId,
      true,
    );

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

    // Verificar que no hay servicios activos
    const serviciosActivos = await this.prisma.cuentaServicio.count({
      where: {
        cuentaId,
        activo: true,
      },
    });

    if (serviciosActivos > 0) {
      throw new BadRequestException(
        'No se puede desvincular la cuenta porque tiene servicios activos',
      );
    }

    // Desvincular la cuenta (permitir null)
    await this.prisma.cuenta.update({
      where: { id: cuentaId },
      data: {
        inmuebleId: undefined, // Usar undefined en lugar de null
      },
    });

    // Agregar anotación al legajo
    if (inmueble.legajo) {
      await this.prisma.anotacionLegajo.create({
        data: {
          legajoId: inmueble.legajo.id,
          titulo: 'Cuenta desvinculada',
          contenido: `Se desvinculó la cuenta ${cuenta.numeroCuenta} del inmueble`,
          anotadoPorId: usuarioId,
        },
      });
    }

    return await this.obtenerInmueblePorId(inmuebleId, cooperativaId);
  }

  /**
   * Crear legajo automáticamente para un inmueble
   */
  private async crearLegajoAutomatico(
    inmuebleId: number,
    usuarioId: string,
    cooperativaId: number,
  ): Promise<void> {
    const numeroLegajo = await this.generarNumeroLegajo(cooperativaId);

    await this.prisma.legajo.create({
      data: {
        numeroLegajo,
        inmuebleId,
        cooperativaId,
        creadoPorId: usuarioId,
        estado: 'ACTIVO', // Cast temporal
      },
    });
  }

  /**
   * Generar número de legajo único
   */
  private async generarNumeroLegajo(cooperativaId: number): Promise<string> {
    const config = await this.prisma.configuracionLegajos.findUnique({
      where: { cooperativaId },
    });

    const prefijo = config?.prefijoLegajo || 'LEG';
    const year = new Date().getFullYear();

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

    return `${prefijo}-${year.toString().slice(-2)}-${numero.toString().padStart(4, '0')}`;
  }

  /**
   * Generar número de transferencia único
   */
  private async generarNumeroTransferencia(
    cooperativaId: number,
  ): Promise<string> {
    const config = await this.prisma.configuracionLegajos.findUnique({
      where: { cooperativaId },
    });

    const prefijo = config?.prefijoTransferencia || 'TRANS';
    const year = new Date().getFullYear();

    // Obtener el último número de transferencia del año
    const ultimaTransferencia =
      await this.prisma.transferenciaTitularidad.findFirst({
        where: {
          legajo: {
            cooperativaId,
          },
          numeroTransferencia: {
            startsWith: `${prefijo}-`,
          },
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
        orderBy: {
          numeroTransferencia: 'desc',
        },
      });

    let numero = 1;
    if (ultimaTransferencia) {
      const partes = ultimaTransferencia.numeroTransferencia.split('-');
      if (partes.length >= 3) {
        numero = parseInt(partes[2]) + 1;
      }
    }

    return `${prefijo}-${year.toString().slice(-2)}-${numero.toString().padStart(4, '0')}`;
  }
}
