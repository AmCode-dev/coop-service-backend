import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConfiguracionSistemaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear configuración de legajos por defecto
   */
  async crearConfiguracionLegajosDefecto(cooperativaId: number) {
    const configuracionExistente =
      await this.prisma.configuracionLegajos.findUnique({
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
          formatosPermitidos: [
            'pdf',
            'jpg',
            'jpeg',
            'png',
            'tiff',
            'doc',
            'docx',
          ],
          diasRetencionArchivados: 3650, // 10 años
          notificarTransferencias: true,
          notificarVencimientos: true,
          diasAvisoVencimiento: 30,
        },
      });
    }
  }
}
