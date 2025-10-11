# 📄 Generación de PDFs de Facturas con pdfmake

Sistema completo para generar PDFs profesionales de facturas utilizando la librería `pdfmake`.

## 🚀 **Clase Invoice**

### **📋 Características Principales:**

- ✅ **Diseño Profesional** - Facturas con formato profesional
- ✅ **Datos Completos** - Información de cooperativa, cliente y conceptos
- ✅ **Cálculos Automáticos** - Subtotales, IVA y totales precisos
- ✅ **Estilos Personalizables** - Temas moderno, clásico y minimalista
- ✅ **Multi-Tenancy** - Soporte completo para múltiples cooperativas
- ✅ **TypeScript** - Tipado completo y validaciones

---

## 💻 **Uso Básico**

### **1. Importar y Usar la Clase Invoice**

```typescript
import { Invoice, FacturaCompleta, InvoicePdfOptions } from './invoice';

// Crear instancia básica
const invoice = new Invoice(facturaCompleta);

// Generar PDF
const pdfBuffer = await invoice.createPdf();

// Guardar archivo
import * as fs from 'fs';
fs.writeFileSync('factura.pdf', pdfBuffer);
```

### **2. Con Opciones Personalizadas**

```typescript
const opciones: InvoicePdfOptions = {
  tema: 'moderno',              // 'moderno' | 'clasico' | 'minimalista'
  incluirObservaciones: true,   // Mostrar observaciones
  mostrarQR: false,            // Código QR (futuro)
  mostrarCodigoBarras: false,  // Código de barras (futuro)
  logoPath: '/ruta/logo.png',  // Logo personalizado (futuro)
};

const invoice = new Invoice(facturaCompleta, opciones);
const pdfBuffer = await invoice.createPdf();
```

---

## 🏗️ **Integración con Servicios**

### **1. Servicio PDF Factura (Incluido)**

```typescript
// Inyectar el servicio
constructor(private readonly pdfFacturaService: PdfFacturaService) {}

// Generar PDF de una factura
const pdfBuffer = await this.pdfFacturaService.generarPdfFactura(
  'factura-id',
  'cooperativa-id'
);

// Generar PDFs múltiples
const pdfs = await this.pdfFacturaService.generarPdfsFacturas(
  ['factura-1', 'factura-2'],
  'cooperativa-id'
);
```

### **2. Endpoint para Descargar PDF**

```typescript
// En tu controller
@Get(':id/pdf')
async descargarPdfFactura(
  @Param('id') facturaId: string,
  @Headers('x-cooperativa-id') cooperativaId: string,
  @Res() res: Response,
) {
  try {
    const pdfBuffer = await this.pdfFacturaService.generarPdfFactura(
      facturaId,
      cooperativaId
    );
    
    const factura = await this.obtenerFactura(facturaId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Factura-${factura.numeroFactura}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    
    res.end(pdfBuffer);
  } catch (error) {
    throw new NotFoundException('Factura no encontrada');
  }
}
```

---

## 🎨 **Estructura del PDF Generado**

### **📋 Contenido del PDF:**

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEADER                                  │
├─────────────────────────────────────────────────────────────────┤
│  [LOGO]              COOPERATIVA EJEMPLO S.A.                  │
│                      Razón Social: Cooperativa Ejemplo         │
│                      CUIT: 30-12345678-9                       │
│                      Domicilio: Av. Principal 123              │
│                      Localidad, Provincia - CP: 1234           │
│                      Tel: (011) 1234-5678                      │
│                      Email: info@cooperativa.com               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    INFORMACIÓN FACTURA                         │
├─────────────────────────────────────────────────────────────────┤
│  FACTURA                           │ Número: FAC-2024-10-000001│
│                                    │ Período: 10/2024          │
│                                    │ Emisión: 15/10/2024       │
│                                    │ Vencimiento: 15/11/2024   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     DATOS DEL CLIENTE                          │
├─────────────────────────────────────────────────────────────────┤
│  Cuenta:    001-0027038-001                                    │
│  Titular:   Juan Pérez                                         │
│  Documento: DNI: 12345678                                      │
│  Email:     juan.perez@email.com                               │
│  Teléfono:  (011) 9876-5432                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DETALLE ITEMS                             │
├─────────────────────────────────────────────────────────────────┤
│ Descripción               │Cant.│P.Unit.│Subtotal│ IVA │Total   │
├─────────────────────────────────────────────────────────────────┤
│ Servicio de Agua - 35.5m³│35.50│$1250.50│$44392.75│$0.00│$44392.75│
│ Tasa Municipal            │ 1.00│ $850.00│  $850.00│$178.50│$1028.50│
│ Mantenimiento Red         │ 1.00│ $500.00│  $500.00│$0.00│ $500.00│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        TOTALES                                 │
├─────────────────────────────────────────────────────────────────┤
│                                   Subtotal:         $45,742.75 │
│                                   IVA Total:            $178.50 │
│                              ═══════════════════════════════════ │
│                              TOTAL A PAGAR:         $45,921.25 │
│                                   Saldo Pendiente:  $45,921.25 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     OBSERVACIONES                              │
├─────────────────────────────────────────────────────────────────┤
│  Facturación correspondiente al período octubre 2024           │
│  Para consultas, comuníquese con la cooperativa                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        FOOTER                                  │
├─────────────────────────────────────────────────────────────────┤
│  Este documento ha sido generado electrónicamente.             │
│  Para consultas, comuníquese con la cooperativa.               │
│                                               Estado: PENDIENTE │
│                                    Generado: 15/10/2024 14:30  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 **Configuración Avanzada**

### **1. Temas Disponibles**

```typescript
// Tema Moderno (por defecto)
{ tema: 'moderno' }     // Colores azules, diseño limpio

// Tema Clásico
{ tema: 'clasico' }     // Colores tradicionales, formal

// Tema Minimalista
{ tema: 'minimalista' } // Diseño simple, menos colores
```

### **2. Opciones de Configuración**

```typescript
interface InvoicePdfOptions {
  logoPath?: string;           // Ruta al logo (futuro)
  mostrarQR?: boolean;         // Código QR (futuro)
  mostrarCodigoBarras?: boolean; // Código de barras (futuro)
  incluirObservaciones?: boolean; // Incluir observaciones
  tema?: 'moderno' | 'clasico' | 'minimalista';
}
```

### **3. Estilos Personalizables**

Los estilos están definidos en el método `getStyles()` y pueden ser modificados:

```typescript
// Estilos principales
cooperativaNombre: {
  fontSize: 16,
  bold: true,
  color: '#1f2937',
},

facturaTitle: {
  fontSize: 24,
  bold: true,
  color: '#dc2626',
  alignment: 'center',
},

totalFinalValue: {
  fontSize: 12,
  bold: true,
  color: '#dc2626',
  alignment: 'right',
}
```

---

## 📊 **Ejemplos de Uso Prácticos**

### **1. Generar PDF Individual**

```typescript
@Injectable()
export class FacturaController {
  constructor(private readonly pdfService: PdfFacturaService) {}
  
  @Get(':id/pdf')
  async generarPdf(@Param('id') id: string, @Headers('x-cooperativa-id') cooperativaId: string) {
    const pdfBuffer = await this.pdfService.generarPdfFactura(id, cooperativaId);
    
    // Devolver como respuesta HTTP
    return new StreamableFile(pdfBuffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="factura-${id}.pdf"`,
    });
  }
}
```

### **2. Generar PDFs en Lote**

```typescript
@Post('lote/pdf')
async generarPdfsLote(
  @Body() { facturaIds }: { facturaIds: string[] },
  @Headers('x-cooperativa-id') cooperativaId: string,
) {
  const pdfs = await this.pdfService.generarPdfsFacturas(facturaIds, cooperativaId);
  
  // Comprimir múltiples PDFs en un ZIP
  const zip = new JSZip();
  
  pdfs.forEach(({ pdf, numeroFactura }) => {
    zip.file(`${numeroFactura}.pdf`, pdf);
  });
  
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  
  return new StreamableFile(zipBuffer, {
    type: 'application/zip',
    disposition: 'attachment; filename="facturas.zip"',
  });
}
```

### **3. Envío por Email**

```typescript
@Injectable()
export class EmailService {
  async enviarFacturaPorEmail(facturaId: string, cooperativaId: string) {
    // Generar PDF
    const pdfBuffer = await this.pdfService.generarPdfFactura(facturaId, cooperativaId);
    
    // Obtener datos de la factura
    const factura = await this.obtenerFactura(facturaId);
    
    // Enviar email con adjunto
    await this.mailService.sendMail({
      to: factura.cuenta.titularServicio.email,
      subject: `Factura ${factura.numeroFactura} - ${factura.periodo}`,
      text: 'Adjuntamos su factura del período.',
      attachments: [
        {
          filename: `Factura-${factura.numeroFactura}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }
}
```

---

## 🔍 **Validaciones y Manejo de Errores**

### **✅ Validaciones Implementadas:**

- ✅ **Factura completa** con todas las relaciones necesarias
- ✅ **Datos de cooperativa** válidos y completos  
- ✅ **Items de factura** con cálculos correctos
- ✅ **Tipos Decimal** manejados correctamente
- ✅ **Formateo de fechas** en formato argentino
- ✅ **Formateo de números** con separadores de miles

### **🛡️ Manejo de Errores:**

```typescript
try {
  const invoice = new Invoice(facturaCompleta);
  const pdfBuffer = await invoice.createPdf();
  return pdfBuffer;
} catch (error) {
  if (error.message.includes('pdfmake')) {
    throw new Error('Error en la generación del PDF');
  } else if (error.message.includes('datos incompletos')) {
    throw new Error('Datos de factura incompletos');
  } else {
    throw new Error('Error desconocido generando PDF');
  }
}
```

---

## 🎯 **Resultado Final**

**¡Ahora cada factura puede generar su PDF profesional!**

```typescript
// Uso simple y directo
const invoice = new Invoice(facturaCompleta);
const pdfBuffer = await invoice.createPdf();

// PDF generado con:
// ✅ Formato profesional
// ✅ Todos los datos de la factura
// ✅ Cálculos precisos
// ✅ Diseño responsivo
// ✅ Multi-tenancy
```

**¡El sistema de generación de PDFs está completamente funcional!** 📄✨

---

## 📚 **Archivos Relacionados**

- `src/facturacion/invoice.ts` - Clase principal Invoice
- `src/facturacion/pdf-factura.service.ts` - Servicio para generar PDFs
- `src/facturacion/facturacion.module.ts` - Módulo actualizado
- Dependencias: `pdfmake`, `@types/pdfmake`