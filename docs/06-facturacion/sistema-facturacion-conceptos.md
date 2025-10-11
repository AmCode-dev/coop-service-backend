# 💰 Sistema de Facturación y Conceptos Facturables

Sistema completo para gestión de conceptos facturables, períodos de facturación mensual e historial de precios con multi-tenancy.

## 📋 **Funcionalidades Implementadas**

### 🧾 **Conceptos Facturables**
- ✅ Crear y gestionar conceptos por cooperativa (Agua, Luz, Tasas, IVA, etc.)
- ✅ Tipos de concepto (TARIFA_BASE, TARIFA_EXTRA, TASA, IMPUESTO, etc.)
- ✅ Tipos de cálculo (POR_CANTIDAD, PORCENTUAL, FIJO, AGREGADO)
- ✅ Gestión de IVA configurable por concepto
- ✅ Historial completo de cambios de valores con auditoría
- ✅ Códigos únicos por cooperativa

### 📅 **Períodos Facturables**
- ✅ Gestión mensual de períodos (10/2024, 11/2024, etc.)
- ✅ Estados de período (ABIERTO, CERRADO, FACTURADO)
- ✅ Control de modificaciones según estado
- ✅ Auditoría de creación y cierre

### 🏠 **Conceptos Aplicados por Cuenta**
- ✅ Aplicar conceptos a cuentas específicas por período
- ✅ Cálculo automático de subtotales, IVA y totales
- ✅ Soporte para cuentas de servicios específicos
- ✅ Prevención de duplicados por período/concepto/cuenta
- ✅ Operaciones masivas (aplicar a múltiples cuentas)

### 📊 **Análisis y Reportes**
- ✅ Resúmenes de facturación por período
- ✅ Totalizaciones por tipo de concepto
- ✅ Resúmenes por cuenta individual
- ✅ Estadísticas de conceptos facturables
- ✅ Análisis de evolución de precios

---

## 🚀 **API Endpoints Disponibles**

### **Conceptos Facturables** (`/conceptos-facturables`)

#### **Crear Concepto Facturable**
```http
POST /conceptos-facturables
Headers:
  x-cooperativa-id: "uuid-cooperativa"
  x-usuario-id: "uuid-usuario"
Content-Type: application/json

{
  "nombre": "Servicio de Agua Potable",
  "codigo": "servicio-agua",
  "descripcion": "Tarifa base por suministro de agua potable",
  "tipoConcepto": "TARIFA_BASE",
  "tipoCalculo": "POR_CANTIDAD",
  "valorActual": "1250.5000",
  "aplicaIVA": true,
  "porcentajeIVA": "21.00",
  "esConfigurable": true,
  "activo": true
}
```

#### **Listar Conceptos Facturables**
```http
GET /conceptos-facturables?includeInactive=false&tipoConcepto=TARIFA_BASE&search=agua
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Obtener Concepto por ID**
```http
GET /conceptos-facturables/{id}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Buscar por Código**
```http
GET /conceptos-facturables/codigo/{codigo}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Actualizar Concepto**
```http
PATCH /conceptos-facturables/{id}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
Content-Type: application/json

{
  "nombre": "Servicio de Agua Potable Premium",
  "valorActual": "1350.7500",
  "observaciones": "Actualización por inflación"
}
```

#### **Eliminar Concepto (Soft Delete)**
```http
DELETE /conceptos-facturables/{id}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Estadísticas de Conceptos**
```http
GET /conceptos-facturables/estadisticas
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

### **Historial de Conceptos** (`/conceptos-facturables/historial`)

#### **Crear Registro de Historial**
```http
POST /conceptos-facturables/historial
Headers:
  x-cooperativa-id: "uuid-cooperativa"
  x-usuario-id: "uuid-usuario"
Content-Type: application/json

{
  "valor": "1450.0000",
  "vigenciaDesde": "2024-11-01T00:00:00.000Z",
  "vigenciaHasta": "2024-11-30T23:59:59.999Z",
  "observaciones": "Ajuste por inflación según resolución de asamblea",
  "motivo": "Ajuste inflación",
  "conceptoId": "uuid-concepto"
}
```

#### **Obtener Historial de un Concepto**
```http
GET /conceptos-facturables/{conceptoId}/historial
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Obtener Valor Vigente en una Fecha**
```http
GET /conceptos-facturables/{conceptoId}/valor-vigente?fecha=2024-10-15
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Actualizar Registro de Historial**
```http
PATCH /conceptos-facturables/historial/{historialId}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
Content-Type: application/json

{
  "valor": "1500.0000",
  "observaciones": "Corrección de valor"
}
```

#### **Eliminar Registro de Historial**
```http
DELETE /conceptos-facturables/historial/{historialId}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

### **Períodos Facturables** (`/periodos-facturables`)

#### **Crear Período Facturable**
```http
POST /periodos-facturables
Headers:
  x-cooperativa-id: "uuid-cooperativa"
  x-usuario-id: "uuid-usuario"
Content-Type: application/json

{
  "mes": 10,
  "anio": 2024,
  "fechaInicio": "2024-10-01T00:00:00.000Z",
  "fechaFin": "2024-10-31T23:59:59.999Z",
  "observaciones": "Período de facturación octubre 2024"
}
```

#### **Listar Períodos Facturables**
```http
GET /periodos-facturables?mes=10&anio=2024&estado=ABIERTO
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Obtener Período por ID**
```http
GET /periodos-facturables/{id}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Actualizar Período (Cerrar/Abrir)**
```http
PATCH /periodos-facturables/{id}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
  x-usuario-id: "uuid-usuario"
Content-Type: application/json

{
  "estado": "CERRADO",
  "observaciones": "Período cerrado para facturación"
}
```

#### **Eliminar Período**
```http
DELETE /periodos-facturables/{id}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

### **Conceptos Aplicados** (`/periodos-facturables/conceptos-aplicados`)

#### **Aplicar Concepto a una Cuenta**
```http
POST /periodos-facturables/conceptos-aplicados
Headers:
  x-cooperativa-id: "uuid-cooperativa"
  x-usuario-id: "uuid-usuario"
Content-Type: application/json

{
  "cantidad": "35.5000",
  "valorUnitario": "1250.5000",
  "aplicaIVA": true,
  "porcentajeIVA": "21.00",
  "observaciones": "Consumo octubre 2024",
  "periodoId": "uuid-periodo",
  "conceptoId": "uuid-concepto",
  "cuentaId": "uuid-cuenta",
  "cuentaServicioId": "uuid-cuenta-servicio"
}
```

#### **Listar Conceptos Aplicados**
```http
GET /periodos-facturables/conceptos-aplicados?periodoId=uuid&includeFacturados=false
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Actualizar Concepto Aplicado**
```http
PATCH /periodos-facturables/conceptos-aplicados/{id}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
Content-Type: application/json

{
  "cantidad": "38.0000",
  "observaciones": "Corrección de lectura de medidor"
}
```

#### **Eliminar Concepto Aplicado**
```http
DELETE /periodos-facturables/conceptos-aplicados/{id}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Aplicación Masiva a Múltiples Cuentas**
```http
POST /periodos-facturables/conceptos-aplicados/bulk
Headers:
  x-cooperativa-id: "uuid-cooperativa"
  x-usuario-id: "uuid-usuario"
Content-Type: application/json

{
  "periodoId": "uuid-periodo",
  "conceptoId": "uuid-concepto",
  "valorUnitario": "150.0000",
  "aplicaIVA": false,
  "observaciones": "Tasa municipal octubre 2024",
  "cuentasConceptos": [
    {
      "cuentaId": "uuid-cuenta-1",
      "cantidad": "1.0000"
    },
    {
      "cuentaId": "uuid-cuenta-2",
      "cantidad": "1.0000"
    },
    {
      "cuentaId": "uuid-cuenta-3",
      "cantidad": "1.0000",
      "cuentaServicioId": "uuid-servicio"
    }
  ]
}
```

### **Análisis y Resúmenes** (`/periodos-facturables`)

#### **Calcular Resumen de Facturación**
```http
POST /periodos-facturables/calcular-facturacion
Headers:
  x-cooperativa-id: "uuid-cooperativa"
Content-Type: application/json

{
  "periodoId": "uuid-periodo",
  "cuentaId": "uuid-cuenta" // Opcional: para una cuenta específica
}
```

#### **Resumen de un Período**
```http
GET /periodos-facturables/{id}/resumen
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Resumen de un Período para una Cuenta**
```http
GET /periodos-facturables/{id}/resumen/cuenta/{cuentaId}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

---

## 📊 **Casos de Uso Prácticos**

### **💼 Para Administradores de Cooperativas**

#### **1. Configurar Conceptos Facturables Básicos**
```bash
# Crear concepto de agua
curl -X POST http://localhost:3000/conceptos-facturables \
  -H "x-cooperativa-id: coop-123" \
  -H "x-usuario-id: admin-456" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Servicio de Agua Potable",
    "codigo": "agua-potable",
    "tipoConcepto": "TARIFA_BASE",
    "tipoCalculo": "POR_CANTIDAD",
    "valorActual": "1250.50",
    "aplicaIVA": false
  }'

# Crear concepto de IVA
curl -X POST http://localhost:3000/conceptos-facturables \
  -H "x-cooperativa-id: coop-123" \
  -H "x-usuario-id: admin-456" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "IVA 21%",
    "codigo": "iva-21",
    "tipoConcepto": "IVA",
    "tipoCalculo": "PORCENTUAL",
    "valorActual": "21.00",
    "aplicaIVA": false
  }'
```

#### **2. Crear Período Mensual**
```bash
# Crear período octubre 2024
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
```

#### **3. Aplicar Conceptos a Cuentas**
```bash
# Aplicar agua a una cuenta específica
curl -X POST http://localhost:3000/periodos-facturables/conceptos-aplicados \
  -H "x-cooperativa-id: coop-123" \
  -H "x-usuario-id: admin-456" \
  -H "Content-Type: application/json" \
  -d '{
    "cantidad": "35.5",
    "valorUnitario": "1250.50",
    "periodoId": "periodo-oct-2024",
    "conceptoId": "concepto-agua",
    "cuentaId": "cuenta-123",
    "observaciones": "Consumo de agua octubre"
  }'

# Aplicar tasa municipal a múltiples cuentas
curl -X POST http://localhost:3000/periodos-facturables/conceptos-aplicados/bulk \
  -H "x-cooperativa-id: coop-123" \
  -H "x-usuario-id: admin-456" \
  -H "Content-Type: application/json" \
  -d '{
    "periodoId": "periodo-oct-2024",
    "conceptoId": "tasa-municipal",
    "valorUnitario": "150.00",
    "cuentasConceptos": [
      {"cuentaId": "cuenta-1", "cantidad": "1"},
      {"cuentaId": "cuenta-2", "cantidad": "1"},
      {"cuentaId": "cuenta-3", "cantidad": "1"}
    ]
  }'
```

#### **4. Actualizar Precios y Crear Historial**
```bash
# Registrar nuevo precio en historial
curl -X POST http://localhost:3000/conceptos-facturables/historial \
  -H "x-cooperativa-id: coop-123" \
  -H "x-usuario-id: admin-456" \
  -H "Content-Type: application/json" \
  -d '{
    "valor": "1350.00",
    "vigenciaDesde": "2024-11-01T00:00:00.000Z",
    "motivo": "Ajuste inflación",
    "observaciones": "Aumento del 8% por inflación",
    "conceptoId": "concepto-agua"
  }'
```

#### **5. Generar Resúmenes de Facturación**
```bash
# Resumen completo del período
curl -X GET http://localhost:3000/periodos-facturables/periodo-id/resumen \
  -H "x-cooperativa-id: coop-123"

# Resumen para una cuenta específica
curl -X GET http://localhost:3000/periodos-facturables/periodo-id/resumen/cuenta/cuenta-id \
  -H "x-cooperativa-id: coop-123"
```

### **📈 Para Operadores de Facturación**

#### **1. Consultar Conceptos Vigentes**
```bash
# Ver todos los conceptos activos
curl -X GET http://localhost:3000/conceptos-facturables \
  -H "x-cooperativa-id: coop-123"

# Precio vigente de un concepto en una fecha
curl -X GET "http://localhost:3000/conceptos-facturables/concepto-id/valor-vigente?fecha=2024-10-15" \
  -H "x-cooperativa-id: coop-123"
```

#### **2. Gestionar Períodos**
```bash
# Ver períodos abiertos
curl -X GET "http://localhost:3000/periodos-facturables?estado=ABIERTO" \
  -H "x-cooperativa-id: coop-123"

# Cerrar un período
curl -X PATCH http://localhost:3000/periodos-facturables/periodo-id \
  -H "x-cooperativa-id: coop-123" \
  -H "x-usuario-id: admin-456" \
  -H "Content-Type: application/json" \
  -d '{"estado": "CERRADO"}'
```

#### **3. Revisar Conceptos Aplicados**
```bash
# Ver conceptos no facturados
curl -X GET "http://localhost:3000/periodos-facturables/conceptos-aplicados?includeFacturados=false" \
  -H "x-cooperativa-id: coop-123"

# Conceptos de un período específico
curl -X GET "http://localhost:3000/periodos-facturables/conceptos-aplicados?periodoId=periodo-123" \
  -H "x-cooperativa-id: coop-123"
```

---

## 🔒 **Seguridad y Multi-Tenancy**

### **Validaciones Implementadas**
- ✅ **Cooperativa ID obligatorio** en todos los endpoints
- ✅ **Códigos únicos** por cooperativa (no globales)
- ✅ **Aislamiento total** entre cooperativas
- ✅ **Control de estados** (no modificar períodos cerrados)
- ✅ **Prevención de duplicados** (concepto/cuenta/período únicos)

### **Controles de Integridad**
- ✅ No se puede eliminar un concepto con aplicaciones
- ✅ No se puede eliminar un período con conceptos aplicados
- ✅ No se puede modificar conceptos ya facturados
- ✅ Validación de períodos de vigencia sin solapamiento
- ✅ Cálculo automático de IVA y totales

### **Auditoría Completa**
- ✅ Registro de quién creó cada concepto
- ✅ Historial de cambios de precios con usuario
- ✅ Trazabilidad de períodos (creación y cierre)
- ✅ Timestamps automáticos en todas las operaciones

---

## 📋 **Estructura de Datos**

### **Concepto Facturable**
```typescript
interface ConceptoFacturable {
  id: string;
  nombre: string;              // "Servicio de Agua Potable"
  codigo: string;              // "agua-potable"
  descripcion?: string;
  tipoConcepto: TipoConcepto;  // TARIFA_BASE, TARIFA_EXTRA, TASA, etc.
  tipoCalculo: TipoCalculo;    // POR_CANTIDAD, PORCENTUAL, FIJO, AGREGADO
  valorActual?: Decimal;       // Valor actual (puede estar en historial)
  aplicaIVA: boolean;
  porcentajeIVA?: Decimal;
  activo: boolean;
  esConfigurable: boolean;
  cooperativaId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones
  historial: HistorialConcepto[];
  conceptosAplicados: ConceptoFacturableAplicado[];
  itemsFactura: ItemFactura[];
}
```

### **Período Facturable**
```typescript
interface PeriodoFacturable {
  id: string;
  mes: number;                 // 1-12
  anio: number;                // 2024
  periodo: string;             // "10/2024"
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoPeriodo;       // ABIERTO, CERRADO, FACTURADO
  observaciones?: string;
  fechaCierre?: Date;
  cooperativaId: string;
  creadoPorId?: string;
  cerradoPorId?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones
  creadoPor?: Usuario;
  cerradoPor?: Usuario;
  conceptosAplicados: ConceptoFacturableAplicado[];
}
```

### **Concepto Facturable Aplicado**
```typescript
interface ConceptoFacturableAplicado {
  id: string;
  cantidad: Decimal;           // Cantidad consumida/aplicada
  valorUnitario: Decimal;      // Precio por unidad en ese período
  subtotal: Decimal;           // cantidad * valorUnitario
  aplicaIVA: boolean;
  porcentajeIVA?: Decimal;
  montoIVA: Decimal;
  total: Decimal;              // subtotal + IVA
  observaciones?: string;
  facturado: boolean;          // Si ya se incluyó en factura
  fechaAplicacion: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones principales
  periodoId: string;
  conceptoId: string;
  cuentaId: string;
  cuentaServicioId?: string;
  creadoPorId?: string;
  
  periodo: PeriodoFacturable;
  concepto: ConceptoFacturable;
  cuenta: Cuenta;
  cuentaServicio?: CuentaServicio;
  creadoPor?: Usuario;
}
```

### **Historial de Concepto**
```typescript
interface HistorialConcepto {
  id: string;
  valor: Decimal;              // Valor del concepto en este período
  vigenciaDesde: Date;
  vigenciaHasta?: Date;
  observaciones?: string;
  motivo?: string;             // "Ajuste inflación", "Decisión asamblea"
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  conceptoId: string;
  creadoPorId?: string;
  
  concepto: ConceptoFacturable;
  creadoPor?: Usuario;
}
```

---

## 🧪 **Casos de Prueba**

### **Test de Conceptos Facturables**
```typescript
describe('ConceptosFacturablesService', () => {
  it('debe crear un concepto facturable con historial inicial', async () => {
    const concepto = await service.create({
      nombre: 'Agua Potable',
      codigo: 'agua',
      tipoConcepto: TipoConcepto.TARIFA_BASE,
      tipoCalculo: TipoCalculo.POR_CANTIDAD,
      valorActual: '1250.50'
    }, 'coop-123', 'user-456');
    
    expect(concepto.codigo).toBe('agua');
    expect(concepto.valorActual).toBe('1250.50');
  });

  it('debe prevenir códigos duplicados en la misma cooperativa', async () => {
    await expect(service.create({
      nombre: 'Otro Agua',
      codigo: 'agua' // Código ya existe
    }, 'coop-123', 'user-456')).rejects.toThrow(ConflictException);
  });
});
```

### **Test de Períodos Facturables**
```typescript
describe('PeriodosFacturablesService', () => {
  it('debe crear período mensual único', async () => {
    const periodo = await service.create({
      mes: 10,
      anio: 2024,
      fechaInicio: new Date('2024-10-01'),
      fechaFin: new Date('2024-10-31')
    }, 'coop-123', 'user-456');
    
    expect(periodo.periodo).toBe('10/2024');
    expect(periodo.estado).toBe(EstadoPeriodo.ABIERTO);
  });
});
```

### **Test de Conceptos Aplicados**
```typescript
describe('ConceptosAplicados', () => {
  it('debe calcular totales correctamente con IVA', async () => {
    const aplicado = await service.createConceptoAplicado({
      cantidad: '10.0000',
      valorUnitario: '100.0000',
      aplicaIVA: true,
      porcentajeIVA: '21.00',
      periodoId: 'periodo-123',
      conceptoId: 'concepto-123',
      cuentaId: 'cuenta-123'
    }, 'coop-123', 'user-456');
    
    expect(aplicado.subtotal).toBe('1000.00');
    expect(aplicado.montoIVA).toBe('210.00');
    expect(aplicado.total).toBe('1210.00');
  });
});
```

---

## ✅ **Funcionalidades Completadas**

- [x] **Conceptos Facturables Multi-Tenant** - Gestión completa por cooperativa
- [x] **Tipos de Concepto Flexibles** - TARIFA_BASE, TASA, IMPUESTO, IVA, etc.
- [x] **Tipos de Cálculo** - Por cantidad, porcentual, fijo, agregado
- [x] **Gestión de IVA** - Configurable por concepto con cálculo automático
- [x] **Historial de Precios** - Trazabilidad completa con auditoría
- [x] **Períodos Facturables Mensuales** - Control de estados y modificaciones
- [x] **Conceptos Aplicados por Cuenta** - Registro mensual de consumos/cargos
- [x] **Operaciones Masivas** - Aplicar conceptos a múltiples cuentas
- [x] **Cálculos Automáticos** - Subtotales, IVA y totales
- [x] **Análisis y Resúmenes** - Por período, cuenta y tipo de concepto
- [x] **Validaciones de Integridad** - Prevención de inconsistencias
- [x] **API RESTful Completa** - CRUD + análisis + operaciones masivas
- [x] **Documentación Detallada** - Casos de uso y ejemplos
- [x] **Auditoría Completa** - Quién, cuándo y por qué se modificó

---

*¡El sistema de facturación está listo para gestionar conceptos facturables mensuales de forma profesional!* 🚀

### **🎯 Próximos Pasos Sugeridos:**

1. **Integración con Módulo de Facturas** - Generar facturas automáticamente desde conceptos aplicados
2. **Dashboard de Facturación** - Vista consolidada de períodos y totales
3. **Notificaciones** - Alertas de períodos abiertos/vencidos
4. **Reportes Avanzados** - Comparativas entre períodos y tendencias
5. **Importación Masiva** - Carga de consumos desde archivos CSV/Excel