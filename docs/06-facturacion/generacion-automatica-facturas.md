# 📄 Generación Automática de Facturas

Sistema completo para generar facturas automáticamente desde conceptos facturables aplicados por período.

## 🚀 **Flujo Completo de Generación**

### **📋 1. Proceso Paso a Paso:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE FACTURACIÓN                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📅 1. Crear Período (ABIERTO)                                │
│           ↓                                                     │
│  🧾 2. Aplicar Conceptos a Cuentas                            │
│           ↓                                                     │
│  🔒 3. Cerrar Período (CERRADO)                               │
│           ↓                                                     │
│  👀 4. Preview de Facturas                                    │
│           ↓                                                     │
│  📄 5. Generar Facturas (FACTURADO)                           │
│           ↓                                                     │
│  💰 6. Facturación Completa                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **🏠 2. Por Cada Cuenta/Socio:**

Cada socio recibirá **UNA factura mensual** con todos sus conceptos:

```typescript
// Factura Final del Socio
{
  numeroFactura: "FAC-2024-10-000001",
  periodo: "10/2024",
  titular: "Juan Pérez",
  cuenta: "001-0027038-001",
  
  // Items detallados
  items: [
    {
      descripcion: "Servicio de Agua - 35.50 m³",
      cantidad: 35.50,
      precioUnitario: 1250.50,
      subtotal: 44392.75,
      aplicaIVA: false,
      montoIVA: 0.00,
      total: 44392.75
    },
    {
      descripcion: "Tasa Municipal",
      cantidad: 1.00,
      precioUnitario: 850.00,
      subtotal: 850.00,
      aplicaIVA: true,
      montoIVA: 178.50,
      total: 1028.50
    },
    {
      descripcion: "Mantenimiento Red",
      cantidad: 1.00,
      precioUnitario: 500.00,
      subtotal: 500.00,
      aplicaIVA: false,
      montoIVA: 0.00,
      total: 500.00
    }
  ],
  
  // Totales finales
  subtotal: 45742.75,    // Suma de subtotales
  totalIVA: 178.50,      // Suma de IVA
  total: 45921.25,       // Subtotal + IVA
  saldoPendiente: 45921.25,
  fechaVencimiento: "2024-11-15"
}
```

---

## 🚀 **API Endpoints de Generación**

### **📄 Generar Facturas Completas** (`/generar-facturas`)

#### **Generar Todas las Facturas del Período**
```http
POST /generar-facturas/periodo
Headers:
  x-cooperativa-id: "uuid-cooperativa"
  x-usuario-id: "uuid-usuario"
Content-Type: application/json

{
  "periodoId": "uuid-periodo-oct-2024",
  "fechaVencimiento": "2024-11-15T23:59:59.999Z",
  "observaciones": "Facturación correspondiente a octubre 2024",
  "sobreescribirExistentes": false
}

// Respuesta
{
  "periodoId": "uuid-periodo-oct-2024",
  "periodo": "10/2024",
  "totalCuentas": 150,
  "facturasGeneradas": 148,
  "facturasActualizadas": 0,
  "errores": 2,
  "facturasCreadas": [
    {
      "facturaId": "uuid-factura-1",
      "numeroFactura": "FAC-2024-10-000001",
      "cuentaId": "uuid-cuenta-1",
      "numeroCuenta": "001-0027038-001",
      "titularServicio": "Juan Pérez",
      "total": "45921.25",
      "totalConceptos": 3
    },
    // ... más facturas
  ],
  "erroresDetalle": [
    {
      "cuentaId": "uuid-cuenta-error",
      "numeroCuenta": "001-0027038-099",
      "error": "No hay conceptos aplicados para esta cuenta"
    }
  ]
}
```

#### **Generar Factura Individual**
```http
POST /generar-facturas/individual
Headers:
  x-cooperativa-id: "uuid-cooperativa"
  x-usuario-id: "uuid-usuario"
Content-Type: application/json

{
  "periodoId": "uuid-periodo-oct-2024",
  "cuentaId": "uuid-cuenta-juan-perez",
  "fechaVencimiento": "2024-11-15T23:59:59.999Z",
  "observaciones": "Factura individual para Juan Pérez",
  "sobreescribirExistente": false
}

// Respuesta: Factura completa generada
{
  "id": "uuid-factura",
  "numeroFactura": "FAC-2024-10-000001",
  "mes": 10,
  "anio": 2024,
  "periodo": "10/2024",
  "subtotal": "45742.75",
  "totalIVA": "178.50",
  "total": "45921.25",
  "saldoPendiente": "45921.25",
  "fechaVencimiento": "2024-11-15T23:59:59.999Z",
  "estado": "PENDIENTE"
}
```

#### **Preview de Facturas (Sin Generar)**
```http
POST /generar-facturas/preview
Headers:
  x-cooperativa-id: "uuid-cooperativa"
Content-Type: application/json

{
  "periodoId": "uuid-periodo-oct-2024",
  "cuentasEspecificas": ["uuid-cuenta-1", "uuid-cuenta-2"] // Opcional
}

// Respuesta: Vista previa de cómo quedarían las facturas
[
  {
    "cuentaId": "uuid-cuenta-1",
    "numeroCuenta": "001-0027038-001",
    "titularServicio": {
      "nombre": "Juan",
      "apellido": "Pérez"
    },
    "conceptosAplicados": [
      {
        "conceptoId": "uuid-concepto-agua",
        "nombreConcepto": "Servicio de Agua",
        "cantidad": "35.50",
        "valorUnitario": "1250.50",
        "subtotal": "44392.75",
        "aplicaIVA": false,
        "montoIVA": "0.00",
        "total": "44392.75"
      },
      {
        "conceptoId": "uuid-concepto-tasa",
        "nombreConcepto": "Tasa Municipal",
        "cantidad": "1.00",
        "valorUnitario": "850.00",
        "subtotal": "850.00",
        "aplicaIVA": true,
        "montoIVA": "178.50",
        "total": "1028.50"
      }
    ],
    "resumenFactura": {
      "subtotal": "45242.75",
      "totalIVA": "178.50",
      "total": "45421.25",
      "totalConceptos": 2
    }
  }
]
```

#### **Preview Individual por Cuenta**
```http
GET /generar-facturas/periodo/{periodoId}/preview/cuenta/{cuentaId}
Headers:
  x-cooperativa-id: "uuid-cooperativa"

// Respuesta: Preview de una sola factura
{
  "cuentaId": "uuid-cuenta-1",
  "numeroCuenta": "001-0027038-001",
  "titularServicio": {
    "nombre": "Juan",
    "apellido": "Pérez"
  },
  "conceptosAplicados": [...],
  "resumenFactura": {
    "subtotal": "45242.75",
    "totalIVA": "178.50", 
    "total": "45421.25",
    "totalConceptos": 2
  }
}
```

#### **Preview Completo del Período**
```http
GET /generar-facturas/periodo/{periodoId}/preview
Headers:
  x-cooperativa-id: "uuid-cooperativa"

// Respuesta: Array con preview de todas las facturas del período
```

#### **Eliminar Facturas del Período**
```http
DELETE /generar-facturas/periodo/{periodoId}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
  x-usuario-id: "uuid-usuario"

// Respuesta
{
  "facturasEliminadas": 148,
  "conceptosLiberados": 450  // Conceptos marcados como no facturados
}
```

---

## 💼 **Casos de Uso Prácticos**

### **📋 Para Administradores**

#### **1. Flujo Completo Mensual**
```bash
# Paso 1: Crear período octubre 2024
curl -X POST http://localhost:3000/periodos-facturables \
  -H "x-cooperativa-id: coop-123" \
  -H "x-usuario-id: admin-456" \
  -H "Content-Type: application/json" \
  -d '{
    "mes": 10,
    "anio": 2024,
    "fechaInicio": "2024-10-01T00:00:00.000Z",
    "fechaFin": "2024-10-31T23:59:59.999Z"
  }'

# Paso 2: Durante el mes, aplicar conceptos...
# (Ver documentación anterior de conceptos aplicados)

# Paso 3: Cerrar período al final del mes
curl -X PATCH http://localhost:3000/periodos-facturables/periodo-id \
  -H "x-cooperativa-id: coop-123" \
  -H "x-usuario-id: admin-456" \
  -H "Content-Type: application/json" \
  -d '{"estado": "CERRADO"}'

# Paso 4: Preview antes de generar facturas
curl -X GET http://localhost:3000/generar-facturas/periodo/periodo-id/preview \
  -H "x-cooperativa-id: coop-123"

# Paso 5: Generar todas las facturas
curl -X POST http://localhost:3000/generar-facturas/periodo \
  -H "x-cooperativa-id: coop-123" \
  -H "x-usuario-id: admin-456" \
  -H "Content-Type: application/json" \
  -d '{
    "periodoId": "periodo-id",
    "fechaVencimiento": "2024-11-15T23:59:59.999Z"
  }'
```

#### **2. Generar Facturas para Cuentas Específicas**
```bash
# Solo para ciertas cuentas
curl -X POST http://localhost:3000/generar-facturas/periodo \
  -H "x-cooperativa-id: coop-123" \
  -H "x-usuario-id: admin-456" \
  -H "Content-Type: application/json" \
  -d '{
    "periodoId": "periodo-id",
    "fechaVencimiento": "2024-11-15T23:59:59.999Z",
    "cuentasEspecificas": ["cuenta-1", "cuenta-2", "cuenta-3"]
  }'
```

#### **3. Corregir Errores y Regenerar**
```bash
# Si hubo errores, eliminar facturas del período
curl -X DELETE http://localhost:3000/generar-facturas/periodo/periodo-id \
  -H "x-cooperativa-id: coop-123" \
  -H "x-usuario-id: admin-456"

# Corregir conceptos aplicados...
# Volver a generar facturas
```

### **📊 Para Operadores**

#### **1. Verificar Facturas Antes de Generar**
```bash
# Ver preview de todas las facturas
curl -X GET http://localhost:3000/generar-facturas/periodo/periodo-id/preview \
  -H "x-cooperativa-id: coop-123"

# Ver preview de una cuenta específica
curl -X GET "http://localhost:3000/generar-facturas/periodo/periodo-id/preview/cuenta/cuenta-id" \
  -H "x-cooperativa-id: coop-123"
```

#### **2. Generar Factura Individual de Prueba**
```bash
# Generar una sola factura para pruebas
curl -X POST http://localhost:3000/generar-facturas/individual \
  -H "x-cooperativa-id: coop-123" \
  -H "x-usuario-id: admin-456" \
  -H "Content-Type: application/json" \
  -d '{
    "periodoId": "periodo-id",
    "cuentaId": "cuenta-prueba",
    "fechaVencimiento": "2024-11-15T23:59:59.999Z"
  }'
```

---

## 🔒 **Validaciones y Controles**

### **✅ Validaciones Implementadas**
- ✅ El período debe estar **CERRADO** para generar facturas
- ✅ La cuenta debe tener **conceptos aplicados** en el período
- ✅ **Números de factura únicos** por cooperativa/año
- ✅ **Prevención de duplicados** por período/cuenta
- ✅ **Verificación de pagos** antes de eliminar facturas
- ✅ **Aislamiento por cooperativa** completo

### **🔧 Características Técnicas**
- ✅ **Operaciones transaccionales** para consistencia
- ✅ **Generación masiva** optimizada
- ✅ **Cálculos precisos** con Decimal
- ✅ **Auditoría completa** de generación
- ✅ **Recuperación de errores** con detalle

### **📊 Estados del Sistema**
```typescript
PeriodoFacturable {
  estado: "ABIERTO"    // Se pueden modificar conceptos
        → "CERRADO"    // Listo para generar facturas  
        → "FACTURADO"  // Facturas ya generadas
}

ConceptoFacturableAplicado {
  facturado: false → true  // Marca si ya está en factura
}

Factura {
  estado: "PENDIENTE"     // Recién generada
        → "PAGADA"        // Cuando se registra pago
        → "VENCIDA"       // Si pasa fecha vencimiento
}
```

---

## 🧪 **Flujo de Pruebas**

### **Test Completo del Flujo**
```typescript
describe('Generación de Facturas', () => {
  it('debe generar facturas completas desde conceptos aplicados', async () => {
    // 1. Crear período
    const periodo = await crearPeriodo();
    
    // 2. Aplicar conceptos a cuentas
    await aplicarConceptosACuentas(periodo.id);
    
    // 3. Cerrar período
    await cerrarPeriodo(periodo.id);
    
    // 4. Generar facturas
    const resultado = await generarFacturas({
      periodoId: periodo.id,
      fechaVencimiento: '2024-11-15'
    });
    
    expect(resultado.facturasGeneradas).toBeGreaterThan(0);
    expect(resultado.errores).toBe(0);
    
    // 5. Verificar facturas generadas
    const facturas = await obtenerFacturas(periodo);
    expect(facturas.length).toBe(resultado.facturasGeneradas);
    
    // 6. Verificar totales
    for (const factura of facturas) {
      expect(factura.total).toBe(
        Number(factura.subtotal) + Number(factura.totalIVA)
      );
    }
  });
});
```

---

## ✅ **Funcionalidades Completadas**

- [x] **Generación Masiva** - Todas las facturas de un período de una vez
- [x] **Generación Individual** - Una factura específica por cuenta
- [x] **Preview Completo** - Vista previa antes de generar
- [x] **Cálculos Automáticos** - Subtotales, IVA y totales precisos
- [x] **Numeración Única** - Números de factura secuenciales por año
- [x] **Control de Estados** - Solo períodos cerrados pueden facturarse
- [x] **Manejo de Errores** - Detalle de errores por cuenta
- [x] **Eliminación Segura** - Eliminar facturas sin pagos
- [x] **Auditoría Completa** - Quién y cuándo se generó cada factura
- [x] **Multi-Tenancy** - Aislamiento total por cooperativa

---

## 🎯 **Resultado Final**

**¡Ahora cada socio recibe UNA factura mensual con todos sus conceptos!**

```
Factura FAC-2024-10-000001
──────────────────────────────────────
Período: Octubre 2024
Cuenta: 001-0027038-001
Titular: Juan Pérez
Vencimiento: 15/11/2024

DETALLE:
• Servicio de Agua - 35.50 m³    $44,392.75
• Tasa Municipal                 $1,028.50 
• Mantenimiento Red             $500.00

                    ─────────────────────
Subtotal:                      $45,742.75
IVA (21%):                        $178.50
                    ─────────────────────
TOTAL A PAGAR:                 $45,921.25
```

**¡El sistema está completamente funcional para facturación automática!** 🚀