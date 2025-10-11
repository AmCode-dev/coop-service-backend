import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConfiguracionSistemaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear secciones del sistema por defecto para una cooperativa
   */
  async crearSeccionesDefecto(cooperativaId: string) {
    const secciones = [
      {
        nombre: 'Inmuebles',
        codigo: 'inmuebles',
        descripcion: 'Gestión de inmuebles, titularidad y legajos',
        icono: 'building',
        orden: 1,
      },
      {
        nombre: 'Cuentas',
        codigo: 'cuentas',
        descripcion: 'Gestión de cuentas de servicios',
        icono: 'account-box',
        orden: 2,
      },
      {
        nombre: 'Facturación',
        codigo: 'facturacion',
        descripcion: 'Gestión de facturación y conceptos',
        icono: 'receipt',
        orden: 3,
      },
      {
        nombre: 'Pagos',
        codigo: 'pagos',
        descripcion: 'Gestión de pagos y cobranzas',
        icono: 'payment',
        orden: 4,
      },
      {
        nombre: 'Usuarios',
        codigo: 'usuarios',
        descripcion: 'Gestión de usuarios y permisos',
        icono: 'account-group',
        orden: 5,
      },
      {
        nombre: 'Reportes',
        codigo: 'reportes',
        descripcion: 'Generación y exportación de reportes',
        icono: 'chart-line',
        orden: 6,
      },
      {
        nombre: 'Configuración',
        codigo: 'configuracion',
        descripcion: 'Configuración general del sistema',
        icono: 'cog',
        orden: 7,
      },
    ];

    for (const seccion of secciones) {
      // Verificar si ya existe
      const existente = await this.prisma.seccionSistema.findFirst({
        where: {
          cooperativaId,
          codigo: seccion.codigo,
        },
      });

      if (!existente) {
        await this.prisma.seccionSistema.create({
          data: {
            ...seccion,
            cooperativaId,
          },
        });
      }
    }
  }

  /**
   * Crear configuración de legajos por defecto
   */
  async crearConfiguracionLegajosDefecto(cooperativaId: string) {
    const configuracionExistente = await this.prisma.configuracionLegajos.findUnique({
      where: { cooperativaId },
    });

    if (!configuracionExistente) {
      await this.prisma.configuracionLegajos.create({
        data: {
          cooperativaId,
          prefijoLegajo: 'LEG',
          prefijoTransferencia: 'TRANS',
          requiereValidacionDocumentos: true,
          requiereDobleVerificacion: false,
          directorioBase: '/legajos',
          maxTamanoArchivoMB: 50,
          formatosPermitidos: ['pdf', 'jpg', 'jpeg', 'png', 'tiff', 'doc', 'docx'],
          diasRetencionArchivados: 3650, // 10 años
          notificarTransferencias: true,
          notificarVencimientos: true,
          diasAvisoVencimiento: 30,
        },
      });
    }
  }

  /**
   * Crear roles por defecto para una cooperativa
   */
  async crearRolesDefecto(cooperativaId: string) {
    const roles = [
      {
        nombre: 'Administrador',
        descripcion: 'Acceso total al sistema',
        esSistema: true,
      },
      {
        nombre: 'Operador',
        descripcion: 'Gestión operativa de inmuebles y cuentas',
        esSistema: true,
      },
      {
        nombre: 'Contador',
        descripcion: 'Gestión de facturación y reportes financieros',
        esSistema: true,
      },
      {
        nombre: 'Socio',
        descripcion: 'Acceso limitado a información personal',
        esSistema: true,
      },
    ];

    for (const rol of roles) {
      // Verificar si ya existe
      const existente = await this.prisma.rol.findFirst({
        where: {
          cooperativaId,
          nombre: rol.nombre,
        },
      });

      if (!existente) {
        const rolCreado = await this.prisma.rol.create({
          data: {
            ...rol,
            cooperativaId,
          },
        });

        // Asignar permisos según el rol
        await this.asignarPermisosDefectoRol(rolCreado.id, rol.nombre, cooperativaId);
      }
    }
  }

  /**
   * Asignar permisos por defecto según el rol
   */
  private async asignarPermisosDefectoRol(
    rolId: string,
    nombreRol: string,
    cooperativaId: string,
  ) {
    // Obtener todas las secciones
    const secciones = await this.prisma.seccionSistema.findMany({
      where: { cooperativaId },
    });

    const permisosPorRol = {
      Administrador: {
        inmuebles: ['READ', 'WRITE', 'EXECUTE', 'DELETE'],
        cuentas: ['READ', 'WRITE', 'EXECUTE', 'DELETE'],
        facturacion: ['READ', 'WRITE', 'EXECUTE', 'DELETE'],
        pagos: ['READ', 'WRITE', 'EXECUTE', 'DELETE'],
        usuarios: ['READ', 'WRITE', 'EXECUTE', 'DELETE'],
        reportes: ['READ', 'WRITE', 'EXECUTE'],
        configuracion: ['READ', 'WRITE', 'EXECUTE'],
      },
      Operador: {
        inmuebles: ['READ', 'WRITE', 'EXECUTE'],
        cuentas: ['READ', 'WRITE', 'EXECUTE'],
        facturacion: ['READ', 'WRITE'],
        pagos: ['READ', 'WRITE'],
        usuarios: ['READ'],
        reportes: ['READ'],
      },
      Contador: {
        inmuebles: ['READ'],
        cuentas: ['READ'],
        facturacion: ['READ', 'WRITE', 'EXECUTE'],
        pagos: ['READ', 'WRITE', 'EXECUTE'],
        usuarios: ['READ'],
        reportes: ['READ', 'WRITE', 'EXECUTE'],
      },
      Socio: {
        inmuebles: ['READ'], // Solo sus propios inmuebles
        cuentas: ['READ'], // Solo sus propias cuentas
        pagos: ['READ'], // Solo sus propios pagos
      },
    };

    const permisos = permisosPorRol[nombreRol] || {};

    for (const seccion of secciones) {
      const accionesPermitidas = permisos[seccion.codigo] || [];

      for (const accion of accionesPermitidas) {
        // Verificar si ya existe el permiso
        const permisoExistente = await this.prisma.rolPermiso.findFirst({
          where: {
            rolId,
            seccionId: seccion.id,
            accion: accion as any, // Cast temporal
          },
        });

        if (!permisoExistente) {
          await this.prisma.rolPermiso.create({
            data: {
              rolId,
              seccionId: seccion.id,
              accion: accion as any, // Cast temporal
            },
          });
        }
      }
    }
  }

  /**
   * Configurar cooperativa completa
   */
  async configurarCooperativaCompleta(cooperativaId: string) {
    await this.crearSeccionesDefecto(cooperativaId);
    await this.crearConfiguracionLegajosDefecto(cooperativaId);
    await this.crearRolesDefecto(cooperativaId);
  }
}