import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EstadoLegajo, TipoDocumentoLegajo } from 'generated/prisma';

export interface DocumentoLegajoDto {
  nombre: string;
  tipoDocumento: TipoDocumentoLegajo;
  descripcion?: string;
  archivo: Express.Multer.File;
  numeroDocumento?: string;
  fechaDocumento?: string;
  fechaVencimiento?: string;
  requiereOriginal?: boolean;
}

export interface AnotacionLegajoDto {
  titulo?: string;
  contenido: string;
  importante?: boolean;
}

@Injectable()
export class LegajosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtener legajo por inmueble ID
   */
  async obtenerLegajoPorInmueble(inmuebleId: number, cooperativaId: number) {
    const legajo = await this.prisma.legajo.findFirst({
      where: {
        inmuebleId,
        cooperativaId,
      },
      include: {
        inmueble: {
          include: {
            titularInmueble: true,
          },
        },
        transferencias: {
          include: {
            titularAnterior: true,
            titularNuevo: true,
            registradoPor: true,
            verificadoPor: true,
            documentos: true,
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
          orderBy: {
            createdAt: 'desc',
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
    });

    if (!legajo) {
      throw new NotFoundException('Legajo no encontrado para este inmueble');
    }

    return legajo;
  }

  /**
   * Agregar documento al legajo
   */
  async agregarDocumento(
    legajoId: string,
    data: DocumentoLegajoDto,
    usuarioId: string,
  ) {
    // Verificar que el legajo existe
    const legajo = await this.prisma.legajo.findUnique({
      where: { id: legajoId },
    });

    if (!legajo) {
      throw new NotFoundException('Legajo no encontrado');
    }

    // Generar hash del archivo (simplified)
    const hashArchivo = `${Date.now()}-${data.archivo.originalname}`;

    // Crear el documento
    const documento = await this.prisma.documentoLegajo.create({
      data: {
        nombre: data.nombre,
        tipoDocumento: data.tipoDocumento, // Cast temporal
        descripcion: data.descripcion,
        nombreArchivo: data.archivo.originalname,
        urlArchivo: data.archivo.path,
        tipoMIME: data.archivo.mimetype,
        tamanoBytes: data.archivo.size,
        hashArchivo,
        numeroDocumento: data.numeroDocumento,
        fechaDocumento: data.fechaDocumento
          ? new Date(data.fechaDocumento)
          : null,
        fechaVencimiento: data.fechaVencimiento
          ? new Date(data.fechaVencimiento)
          : null,
        requiereOriginal: data.requiereOriginal || false,
        legajoId,
        subidoPorId: usuarioId,
      },
    });

    return documento;
  }

  /**
   * Validar documento
   */
  async validarDocumento(
    documentoId: string,
    validadoPorId: string,
    observaciones?: string,
  ) {
    const documento = await this.prisma.documentoLegajo.update({
      where: { id: documentoId },
      data: {
        validado: true,
        fechaValidacion: new Date(),
        validadoPorId,
        observaciones,
      },
    });

    return documento;
  }

  /**
   * Agregar anotación al legajo
   */
  async agregarAnotacion(
    legajoId: string,
    data: AnotacionLegajoDto,
    usuarioId: string,
  ) {
    // Verificar que el legajo existe
    const legajo = await this.prisma.legajo.findUnique({
      where: { id: legajoId },
    });

    if (!legajo) {
      throw new NotFoundException('Legajo no encontrado');
    }

    const anotacion = await this.prisma.anotacionLegajo.create({
      data: {
        titulo: data.titulo,
        contenido: data.contenido,
        importante: data.importante || false,
        legajoId,
        anotadoPorId: usuarioId,
      },
    });

    return anotacion;
  }

  /**
   * Obtener historial de titularidad de un inmueble
   */
  async obtenerHistorialTitularidad(inmuebleId: number) {
    return await this.prisma.historialTitularidadView.findMany({
      where: { inmuebleId },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  /**
   * Cambiar estado del legajo
   */
  async cambiarEstadoLegajo(
    legajoId: string,
    nuevoEstado: EstadoLegajo,
    observaciones?: string,
    usuarioId?: string,
  ) {
    const legajo = await this.prisma.legajo.update({
      where: { id: legajoId },
      data: {
        estado: nuevoEstado, // Cast temporal
      },
    });

    // Agregar anotación del cambio de estado
    if (usuarioId) {
      await this.agregarAnotacion(
        legajoId,
        {
          titulo: 'Cambio de estado',
          contenido: `Estado cambiado a: ${nuevoEstado}. ${observaciones || ''}`,
          importante: true,
        },
        usuarioId,
      );
    }

    return legajo;
  }
}
