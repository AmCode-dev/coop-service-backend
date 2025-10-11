import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Invoice, FacturaCompleta, InvoicePdfOptions } from './invoice';

/**
 * Servicio para generar PDFs de facturas
 */
@Injectable()
export class PdfFacturaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera el PDF de una factura específica
   * @param facturaId ID de la factura
   * @param cooperativaId ID de la cooperativa
   * @param options Opciones para el PDF
   * @returns Buffer del PDF generado
   */
  async generarPdfFactura(
    facturaId: string,
    cooperativaId: string,
    options: InvoicePdfOptions = {},
  ): Promise<Buffer> {
    // Obtener la factura completa con todas las relaciones
    const facturaCompleta = await this.obtenerFacturaCompleta(
      facturaId,
      cooperativaId,
    );

    if (!facturaCompleta) {
      throw new Error('Factura no encontrada');
    }

    // Crear instancia de Invoice y generar PDF
    const invoice = new Invoice(facturaCompleta, options);
    return await invoice.createPdf();
  }

  /**
   * Genera PDFs para múltiples facturas
   * @param facturaIds Array de IDs de facturas
   * @param cooperativaId ID de la cooperativa
   * @param options Opciones para el PDF
   * @returns Array de buffers de PDFs generados
   */
  async generarPdfsFacturas(
    facturaIds: string[],
    cooperativaId: string,
    options: InvoicePdfOptions = {},
  ): Promise<{ facturaId: string; pdf: Buffer; numeroFactura: string }[]> {
    const resultados: { facturaId: string; pdf: Buffer; numeroFactura: string }[] = [];

    for (const facturaId of facturaIds) {
      try {
        const facturaCompleta = await this.obtenerFacturaCompleta(
          facturaId,
          cooperativaId,
        );

        if (facturaCompleta) {
          const invoice = new Invoice(facturaCompleta, options);
          const pdf = await invoice.createPdf();

          resultados.push({
            facturaId,
            pdf,
            numeroFactura: facturaCompleta.numeroFactura,
          });
        }
      } catch (error) {
        console.error(`Error generando PDF para factura ${facturaId}:`, error);
        // Continuar con las siguientes facturas
      }
    }

    return resultados;
  }

  /**
   * Obtiene una factura completa con todas las relaciones necesarias
   * @param facturaId ID de la factura
   * @param cooperativaId ID de la cooperativa
   * @returns Factura completa o null si no existe
   */
  private async obtenerFacturaCompleta(
    facturaId: string,
    cooperativaId: string,
  ): Promise<FacturaCompleta | null> {
    return await this.prisma.factura.findFirst({
      where: {
        id: facturaId,
        cuenta: {
          cooperativaId,
        },
      },
      include: {
        cuenta: {
          include: {
            titularServicio: true,
            cooperativa: true,
          },
        },
        items: {
          include: {
            concepto: true,
          },
          orderBy: {
            orden: 'asc',
          },
        },
      },
    }) as FacturaCompleta | null;
  }

  /**
   * Ejemplo de uso completo: generar PDF con configuración personalizada
   */
  async ejemploGenerarPdfPersonalizado(
    facturaId: string,
    cooperativaId: string,
  ): Promise<Buffer> {
    const opciones: InvoicePdfOptions = {
      tema: 'moderno',
      incluirObservaciones: true,
      mostrarQR: false,
      mostrarCodigoBarras: false,
    };

    return await this.generarPdfFactura(facturaId, cooperativaId, opciones);
  }
}

/**
 * Ejemplo de uso directo de la clase Invoice
 */
export class EjemploUsoInvoice {
  /**
   * Ejemplo básico de uso
   */
  static async ejemploBasico(facturaCompleta: FacturaCompleta): Promise<Buffer> {
    // Crear instancia de Invoice
    const invoice = new Invoice(facturaCompleta);
    
    // Generar PDF
    const pdfBuffer = await invoice.createPdf();
    
    return pdfBuffer;
  }

  /**
   * Ejemplo con opciones personalizadas
   */
  static async ejemploPersonalizado(facturaCompleta: FacturaCompleta): Promise<Buffer> {
    // Opciones personalizadas
    const opciones: InvoicePdfOptions = {
      tema: 'minimalista',
      incluirObservaciones: true,
      mostrarQR: true,
      logoPath: '/ruta/al/logo.png',
    };

    // Crear instancia con opciones
    const invoice = new Invoice(facturaCompleta, opciones);
    
    // Generar PDF
    const pdfBuffer = await invoice.createPdf();
    
    return pdfBuffer;
  }

  /**
   * Ejemplo de manejo de errores
   */
  static async ejemploConManejoErrores(facturaCompleta: FacturaCompleta): Promise<Buffer | null> {
    try {
      const invoice = new Invoice(facturaCompleta);
      const pdfBuffer = await invoice.createPdf();
      
      console.log('PDF generado exitosamente');
      return pdfBuffer;
    } catch (error) {
      console.error('Error generando PDF:', error);
      return null;
    }
  }
}