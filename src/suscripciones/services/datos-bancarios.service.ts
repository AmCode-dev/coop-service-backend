// ============================================
// SERVICIO DE DATOS BANCARIOS
// ============================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfiguracionDatosBancariosDto } from '../dto/suscripciones.dto';

@Injectable()
export class DatosBancariosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear configuración de datos bancarios
   */
  async crearConfiguracionDatosBancarios(
    datos: ConfiguracionDatosBancariosDto,
    superAdminId: string,
  ) {
    // Si se marca como principal, desactivar otras principales
    if (datos.esPrincipal !== false) {
      await this.prisma.configuracionDatosBancarios.updateMany({
        where: { esPrincipal: true },
        data: { esPrincipal: false },
      });
    }

    const configuracion = await this.prisma.configuracionDatosBancarios.create({
      data: {
        nombreCuenta: datos.nombreCuenta,
        nombreBanco: datos.nombreBanco,
        cbu: datos.cbu,
        alias: datos.alias,
        numeroCuenta: datos.numeroCuenta,
        tipoCuenta: datos.tipoCuenta,
        sucursal: datos.sucursal,
        razonSocialTitular: datos.razonSocialTitular,
        cuitTitular: datos.cuitTitular,
        domicilioFiscal: datos.domicilioFiscal,
        esPrincipal: datos.esPrincipal !== false,
        instruccionesPago: datos.instruccionesPago,
        horarioAtencion: datos.horarioAtencion,
        emailContacto: datos.emailContacto,
        telefonoContacto: datos.telefonoContacto,
        creadoPorSuperAdmin: superAdminId,
      },
    });

    return configuracion;
  }

  /**
   * Obtener configuración de datos bancarios activa
   */
  async obtenerConfiguracionDatosBancarios(principal?: boolean) {
    const where: any = { activo: true };
    
    if (principal !== undefined) {
      where.esPrincipal = principal;
    }

    const configuraciones = await this.prisma.configuracionDatosBancarios.findMany({
      where,
      orderBy: [
        { esPrincipal: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return configuraciones;
  }

  /**
   * Obtener configuración principal de datos bancarios
   */
  async obtenerConfiguracionPrincipal() {
    const configuracion = await this.prisma.configuracionDatosBancarios.findFirst({
      where: {
        activo: true,
        esPrincipal: true,
      },
    });

    if (!configuracion) {
      throw new NotFoundException('No se encontró configuración bancaria principal');
    }

    return configuracion;
  }

  /**
   * Actualizar configuración de datos bancarios
   */
  async actualizarConfiguracionDatosBancarios(
    id: string,
    datos: Partial<ConfiguracionDatosBancariosDto>,
    superAdminId: string,
  ) {
    const configuracionExistente = await this.prisma.configuracionDatosBancarios.findUnique({
      where: { id },
    });

    if (!configuracionExistente) {
      throw new NotFoundException('Configuración de datos bancarios no encontrada');
    }

    // Si se marca como principal, desactivar otras principales
    if (datos.esPrincipal === true) {
      await this.prisma.configuracionDatosBancarios.updateMany({
        where: { 
          id: { not: id },
          esPrincipal: true,
        },
        data: { esPrincipal: false },
      });
    }

    const configuracionActualizada = await this.prisma.configuracionDatosBancarios.update({
      where: { id },
      data: {
        ...datos,
        modificadoPorSuperAdmin: superAdminId,
      },
    });

    return configuracionActualizada;
  }

  /**
   * Eliminar configuración de datos bancarios
   */
  async eliminarConfiguracionDatosBancarios(id: string) {
    const configuracion = await this.prisma.configuracionDatosBancarios.findUnique({
      where: { id },
    });

    if (!configuracion) {
      throw new NotFoundException('Configuración de datos bancarios no encontrada');
    }

    if (configuracion.esPrincipal) {
      throw new BadRequestException('No se puede eliminar la configuración principal');
    }

    await this.prisma.configuracionDatosBancarios.update({
      where: { id },
      data: { activo: false },
    });

    return { mensaje: 'Configuración eliminada correctamente' };
  }
}