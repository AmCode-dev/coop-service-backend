import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {
  TDocumentDefinitions,
  Content,
  TableCell,
  Style,
} from 'pdfmake/interfaces';
import {
  Factura,
  Cuenta,
  Persona,
  Cooperativa,
  ItemFactura,
  ConceptoFacturable,
} from '../../generated/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// Configurar las fuentes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;

/**
 * Factura completa con todas las relaciones necesarias para generar el PDF
 */
export interface FacturaCompleta extends Factura {
  cuenta: Cuenta & {
    titularServicio: Persona;
    cooperativa: Cooperativa;
  };
  items: (ItemFactura & {
    concepto: ConceptoFacturable;
  })[];
}

/**
 * Opciones para la generación del PDF
 */
export interface InvoicePdfOptions {
  logoPath?: string;
  mostrarQR?: boolean;
  mostrarCodigoBarras?: boolean;
  incluirObservaciones?: boolean;
  tema?: 'moderno' | 'clasico' | 'minimalista';
}

/**
 * Clase para generar PDFs de facturas usando pdfmake
 */
export class Invoice {
  private readonly factura: FacturaCompleta;
  private readonly options: InvoicePdfOptions;

  constructor(factura: FacturaCompleta, options: InvoicePdfOptions = {}) {
    this.factura = factura;
    this.options = {
      incluirObservaciones: true,
      mostrarQR: false,
      mostrarCodigoBarras: false,
      tema: 'moderno',
      ...options,
    };
  }

  /**
   * Crea el PDF de la factura
   * @returns Buffer del PDF generado
   */
  async createPdf(): Promise<Buffer> {
    const docDefinition = this.buildDocumentDefinition();
    
    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        
        pdfDoc.getBuffer((buffer: Buffer) => {
          resolve(buffer);
        });
      } catch (error) {
        reject(new Error(`Error generando PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`));
      }
    });
  }

  /**
   * Construye la definición completa del documento PDF
   */
  private buildDocumentDefinition(): TDocumentDefinitions {
    return {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      
      info: {
        title: `Factura ${this.factura.numeroFactura}`,
        subject: `Factura del período ${this.factura.periodo}`,
        author: this.factura.cuenta.cooperativa.nombre,
        creator: 'Sistema de Facturación Cooperativa',
        producer: 'pdfmake',
      },

      content: this.buildContent(),
      styles: this.getStyles(),
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10,
        lineHeight: 1.2,
      },
    };
  }

  /**
   * Construye el contenido principal del PDF
   */
  private buildContent(): Content[] {
    const content: Content[] = [];

    // Header con logo y datos de la cooperativa
    content.push(this.buildHeader());
    
    // Espacio
    content.push({ text: '', margin: [0, 10] });
    
    // Información de la factura
    content.push(this.buildFacturaInfo());
    
    // Espacio
    content.push({ text: '', margin: [0, 15] });
    
    // Datos del cliente
    content.push(this.buildClienteInfo());
    
    // Espacio
    content.push({ text: '', margin: [0, 15] });
    
    // Tabla de items
    content.push(this.buildItemsTable());
    
    // Espacio
    content.push({ text: '', margin: [0, 15] });
    
    // Totales
    content.push(this.buildTotales());
    
    // Observaciones (opcional)
    if (this.options.incluirObservaciones && this.factura.observaciones) {
      content.push({ text: '', margin: [0, 10] });
      content.push(this.buildObservaciones());
    }
    
    // Footer
    content.push({ text: '', margin: [0, 20] });
    content.push(this.buildFooter());

    return content;
  }

  /**
   * Header con logo y datos de la cooperativa
   */
  private buildHeader(): Content {
    const cooperativa = this.factura.cuenta.cooperativa;
    
    return {
      columns: [
        {
          width: 'auto',
          stack: [
            // Logo placeholder - se puede agregar imagen después
            {
              text: cooperativa.nombre.charAt(0).toUpperCase(),
              style: 'logoPlaceholder',
            },
          ],
        },
        {
          width: '*',
          stack: [
            {
              text: cooperativa.nombre.toUpperCase(),
              style: 'cooperativaNombre',
            },
            {
              text: cooperativa.razonSocial,
              style: 'cooperativaRazon',
            },
            {
              text: `CUIT: ${cooperativa.cuit}`,
              style: 'cooperativaCuit',
            },
            {
              text: `${cooperativa.domicilio}, ${cooperativa.localidad}`,
              style: 'cooperativaDomicilio',
            },
            {
              text: `${cooperativa.provincia} - CP: ${cooperativa.codigoPostal}`,
              style: 'cooperativaDomicilio',
            },
            ...(cooperativa.telefono ? [{
              text: `Tel: ${cooperativa.telefono}`,
              style: 'cooperativaContacto',
            }] : []),
            ...(cooperativa.email ? [{
              text: `Email: ${cooperativa.email}`,
              style: 'cooperativaContacto',
            }] : []),
          ],
        },
      ],
    };
  }

  /**
   * Información de la factura
   */
  private buildFacturaInfo(): Content {
    return {
      columns: [
        {
          width: '*',
          stack: [
            {
              text: 'FACTURA',
              style: 'facturaTitle',
            },
          ],
        },
        {
          width: 200,
          table: {
            widths: ['auto', '*'],
            body: [
              [
                { text: 'Número:', style: 'facturaLabel' },
                { text: this.factura.numeroFactura, style: 'facturaValue' },
              ],
              [
                { text: 'Período:', style: 'facturaLabel' },
                { text: this.factura.periodo, style: 'facturaValue' },
              ],
              [
                { text: 'Emisión:', style: 'facturaLabel' },
                { 
                  text: this.formatearFecha(this.factura.fechaEmision), 
                  style: 'facturaValue' 
                },
              ],
              [
                { text: 'Vencimiento:', style: 'facturaLabel' },
                { 
                  text: this.formatearFecha(this.factura.fechaVencimiento), 
                  style: 'facturaVencimiento' 
                },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#ddd',
            vLineColor: () => '#ddd',
          },
        },
      ],
    };
  }

  /**
   * Información del cliente
   */
  private buildClienteInfo(): Content {
    const titular = this.factura.cuenta.titularServicio;
    
    return {
      table: {
        widths: ['auto', '*'],
        body: [
          [
            { 
              text: 'DATOS DEL CLIENTE', 
              style: 'sectionTitle',
              colSpan: 2,
            },
            {},
          ],
          [
            { text: 'Cuenta:', style: 'clienteLabel' },
            { text: this.factura.cuenta.numeroCuenta, style: 'clienteValue' },
          ],
          [
            { text: 'Titular:', style: 'clienteLabel' },
            { 
              text: titular.nombreCompleto, 
              style: 'clienteValue' 
            },
          ],
          [
            { text: 'Documento:', style: 'clienteLabel' },
            { text: `${titular.tipoDocumento}: ${titular.numeroDocumento}`, style: 'clienteValue' },
          ],
          [
            { text: 'Email:', style: 'clienteLabel' },
            { text: titular.email || 'N/A', style: 'clienteValue' },
          ],
          [
            { text: 'Teléfono:', style: 'clienteLabel' },
            { text: titular.telefono || 'N/A', style: 'clienteValue' },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#ddd',
        vLineColor: () => '#ddd',
      },
    };
  }

  /**
   * Tabla de items de la factura
   */
  private buildItemsTable(): Content {
    const headers: TableCell[] = [
      { text: 'Descripción', style: 'tableHeader' },
      { text: 'Cantidad', style: 'tableHeader', alignment: 'center' },
      { text: 'P. Unitario', style: 'tableHeader', alignment: 'right' },
      { text: 'Subtotal', style: 'tableHeader', alignment: 'right' },
      { text: 'IVA', style: 'tableHeader', alignment: 'right' },
      { text: 'Total', style: 'tableHeader', alignment: 'right' },
    ];

    const rows = this.factura.items
      .sort((a, b) => a.orden - b.orden)
      .map(item => [
        { 
          text: item.descripcion,
          style: 'tableCell',
        },
        { 
          text: this.formatearNumero(item.cantidad, 2),
          style: 'tableCell',
          alignment: 'center' as const,
        },
        { 
          text: `$ ${this.formatearNumero(item.precioUnitario, 2)}`,
          style: 'tableCell',
          alignment: 'right' as const,
        },
        { 
          text: `$ ${this.formatearNumero(item.subtotal, 2)}`,
          style: 'tableCell',
          alignment: 'right' as const,
        },
        { 
          text: item.aplicaIVA 
            ? `$ ${this.formatearNumero(item.montoIVA, 2)}` 
            : '$ 0.00',
          style: 'tableCell',
          alignment: 'right' as const,
        },
        { 
          text: `$ ${this.formatearNumero(item.total, 2)}`,
          style: 'tableCell',
          alignment: 'right' as const,
        },
      ]);

    return {
      table: {
        headerRows: 1,
        widths: ['*', 60, 80, 80, 60, 80],
        body: [headers, ...rows],
      },
      layout: {
        hLineWidth: (i: number, node: any) => i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#333',
        vLineColor: () => '#ddd',
        fillColor: (rowIndex: number) => rowIndex === 0 ? '#f5f5f5' : null,
      },
    };
  }

  /**
   * Sección de totales
   */
  private buildTotales(): Content {
    return {
      columns: [
        { width: '*', text: '' }, // Espacio a la izquierda
        {
          width: 200,
          table: {
            widths: ['*', 'auto'],
            body: [
              [
                { text: 'Subtotal:', style: 'totalLabel' },
                { 
                  text: `$ ${this.formatearNumero(this.factura.subtotal, 2)}`,
                  style: 'totalValue',
                },
              ],
              [
                { text: 'IVA Total:', style: 'totalLabel' },
                { 
                  text: `$ ${this.formatearNumero(this.factura.totalIVA, 2)}`,
                  style: 'totalValue',
                },
              ],
              [
                { text: 'TOTAL A PAGAR:', style: 'totalFinalLabel' },
                { 
                  text: `$ ${this.formatearNumero(this.factura.total, 2)}`,
                  style: 'totalFinalValue',
                },
              ],
              [
                { text: 'Saldo Pendiente:', style: 'saldoLabel' },
                { 
                  text: `$ ${this.formatearNumero(this.factura.saldoPendiente, 2)}`,
                  style: 'saldoValue',
                },
              ],
            ],
          },
          layout: {
            hLineWidth: (i: number) => i === 2 ? 2 : 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#333',
            vLineColor: () => '#333',
          },
        },
      ],
    };
  }

  /**
   * Observaciones
   */
  private buildObservaciones(): Content {
    return {
      table: {
        widths: ['*'],
        body: [
          [
            { 
              text: 'OBSERVACIONES', 
              style: 'sectionTitle',
            },
          ],
          [
            { 
              text: this.factura.observaciones || '',
              style: 'observacionesText',
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#ddd',
        vLineColor: () => '#ddd',
      },
    };
  }

  /**
   * Footer del documento
   */
  private buildFooter(): Content {
    return {
      columns: [
        {
          width: '*',
          text: [
            { text: 'Este documento ha sido generado electrónicamente.\n', style: 'footerText' },
            { text: 'Para consultas, comuníquese con la cooperativa.\n', style: 'footerText' },
          ],
        },
        {
          width: 'auto',
          text: [
            { text: `Estado: ${this.factura.estado}\n`, style: 'footerText' },
            { text: `Generado: ${this.formatearFecha(new Date())}`, style: 'footerText' },
          ],
        },
      ],
    };
  }

  /**
   * Estilos del documento
   */
  private getStyles(): { [key: string]: Style } {
    return {
      // Header styles
      logoPlaceholder: {
        fontSize: 24,
        bold: true,
        color: '#2563eb',
        alignment: 'center',
        margin: [0, 5, 10, 0],
      },
      cooperativaNombre: {
        fontSize: 16,
        bold: true,
        color: '#1f2937',
        margin: [0, 0, 0, 2],
      },
      cooperativaRazon: {
        fontSize: 12,
        color: '#4b5563',
        margin: [0, 0, 0, 2],
      },
      cooperativaCuit: {
        fontSize: 10,
        color: '#6b7280',
        margin: [0, 0, 0, 1],
      },
      cooperativaDomicilio: {
        fontSize: 9,
        color: '#6b7280',
        margin: [0, 0, 0, 1],
      },
      cooperativaContacto: {
        fontSize: 9,
        color: '#6b7280',
        margin: [0, 0, 0, 1],
      },

      // Factura info styles
      facturaTitle: {
        fontSize: 24,
        bold: true,
        color: '#dc2626',
        alignment: 'center',
        margin: [0, 10, 0, 0],
      },
      facturaLabel: {
        fontSize: 10,
        bold: true,
        color: '#374151',
      },
      facturaValue: {
        fontSize: 10,
        color: '#1f2937',
      },
      facturaVencimiento: {
        fontSize: 10,
        bold: true,
        color: '#dc2626',
      },

      // Section styles
      sectionTitle: {
        fontSize: 12,
        bold: true,
        color: '#1f2937',
        fillColor: '#f3f4f6',
        margin: [5, 5, 5, 5],
      },

      // Cliente styles
      clienteLabel: {
        fontSize: 9,
        bold: true,
        color: '#374151',
        margin: [5, 3, 5, 3],
      },
      clienteValue: {
        fontSize: 9,
        color: '#1f2937',
        margin: [5, 3, 5, 3],
      },

      // Table styles
      tableHeader: {
        fontSize: 10,
        bold: true,
        color: '#1f2937',
        fillColor: '#f3f4f6',
        margin: [5, 5, 5, 5],
      },
      tableCell: {
        fontSize: 9,
        color: '#374151',
        margin: [5, 3, 5, 3],
      },

      // Totales styles
      totalLabel: {
        fontSize: 10,
        bold: true,
        color: '#374151',
        alignment: 'right',
        margin: [5, 3, 5, 3],
      },
      totalValue: {
        fontSize: 10,
        color: '#1f2937',
        alignment: 'right',
        margin: [5, 3, 5, 3],
      },
      totalFinalLabel: {
        fontSize: 12,
        bold: true,
        color: '#dc2626',
        alignment: 'right',
        margin: [5, 5, 5, 5],
      },
      totalFinalValue: {
        fontSize: 12,
        bold: true,
        color: '#dc2626',
        alignment: 'right',
        margin: [5, 5, 5, 5],
      },
      saldoLabel: {
        fontSize: 9,
        bold: true,
        color: '#059669',
        alignment: 'right',
        margin: [5, 3, 5, 3],
      },
      saldoValue: {
        fontSize: 9,
        bold: true,
        color: '#059669',
        alignment: 'right',
        margin: [5, 3, 5, 3],
      },

      // Observaciones styles
      observacionesText: {
        fontSize: 9,
        color: '#374151',
        margin: [5, 5, 5, 5],
        lineHeight: 1.3,
      },

      // Footer styles
      footerText: {
        fontSize: 8,
        color: '#6b7280',
        italics: true,
      },
    };
  }

  /**
   * Formatea una fecha al formato DD/MM/YYYY
   */
  private formatearFecha(fecha: Date | string): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Formatea un número con decimales y separadores de miles
   */
  private formatearNumero(numero: number | string | Decimal, decimales: number = 2): string {
    let num: number;
    
    if (typeof numero === 'string') {
      num = parseFloat(numero);
    } else if (typeof numero === 'number') {
      num = numero;
    } else {
      // Es un Decimal de Prisma
      num = numero.toNumber();
    }
    
    return num.toLocaleString('es-AR', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    });
  }
}