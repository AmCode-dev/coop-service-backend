# 📊 Módulo de Medidores - Sistema de Cooperativas

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Modelos de Datos](#modelos-de-datos)
4. [API Endpoints](#api-endpoints)
5. [DTOs y Validaciones](#dtos-y-validaciones)
6. [Funcionalidades Avanzadas](#funcionalidades-avanzadas)
7. [Casos de Uso](#casos-de-uso)
8. [Ejemplos de Implementación](#ejemplos-de-implementación)

---

## 🎯 Descripción General

El **Módulo de Medidores** es un sistema completo para la gestión de medidores de servicios públicos en cooperativas. Proporciona funcionalidades avanzadas para:

- **Gestión CRUD** completa de medidores
- **Sistema de lecturas** con detección automática de anomalías
- **Análisis estadístico** de consumos y tendencias
- **Auditoría completa** de vinculaciones y operaciones
- **Dashboard integrado** con métricas en tiempo real
- **Multi-tenancy** con aislamiento por cooperativa

### 🌟 Características Principales

- ✅ **Detección de Anomalías**: Identifica automáticamente variaciones de consumo >30%
- ✅ **Gestión de Vinculaciones**: Control total del ciclo de vida de medidores
- ✅ **Estadísticas Avanzadas**: Análisis de tendencias y patrones de consumo
- ✅ **Auditoría Completa**: Historial detallado de todas las operaciones
- ✅ **Sistema de Permisos**: Control granular de acceso por roles
- ✅ **Lecturas Principales**: Sistema de lecturas oficiales mensuales

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    MedidoresController                      │
│  • Autenticación JWT                                       │
│  • Validación de permisos granulares                       │
│  • Endpoints RESTful organizados por funcionalidad         │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    MedidoresService                         │
│  • Lógica de negocio completa                              │
│  • Detección automática de anomalías                       │
│  • Cálculos estadísticos avanzados                         │
│  • Gestión de vinculaciones con auditoría                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 Base de Datos (Prisma)                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐ │
│  │    Medidor      │ │     Lectura     │ │   Historial   │ │
│  │                 │ │                 │ │  Vinculacion  │ │
│  │ • numeroMedidor │ │ • valorLectura  │ │ • tipoAccion  │ │
│  │ • cooperativaId │ │ • anomalia      │ │ • motivoAccion│ │
│  │ • inmuebleId    │ │ • esPrincipal   │ │ • fechaAccion │ │
│  │ • activo        │ │ • consumoCalc.  │ │ • operadoPor  │ │
│  └─────────────────┘ └─────────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 🔧 Componentes Principales

#### **1. MedidoresController**
- Maneja todas las rutas HTTP del módulo
- Implementa autenticación JWT obligatoria
- Valida permisos granulares (CanRead, CanWrite, CanExecute)
- Organiza endpoints por funcionalidad (CRUD, lecturas, estadísticas, etc.)

#### **2. MedidoresService**
- Contiene toda la lógica de negocio
- Implementa detección automática de anomalías
- Realiza cálculos estadísticos complejos
- Gestiona el historial de auditoría

#### **3. DTOs (Data Transfer Objects)**
- Validación automática de entrada
- Transformación de datos
- Documentación implícita de la API

---

## 🗃️ Modelos de Datos

### 📊 Medidor

```prisma
model Medidor {
  id                String   @id @default(cuid())
  numeroMedidor     String   // Número físico del medidor
  marca             String?  // Marca del fabricante
  modelo            String?  // Modelo específico
  fechaInstalacion  DateTime? // Fecha de instalación física
  activo            Boolean  @default(true)
  observaciones     String?  // Notas adicionales
  
  // Relaciones
  cooperativaId     String
  cooperativa       Cooperativa @relation(fields: [cooperativaId], references: [id])
  inmuebleId        String?
  inmueble          Inmueble? @relation(fields: [inmuebleId], references: [id])
  
  // Lecturas y servicios
  lecturas          Lectura[]
  cuentasServicios  CuentaServicio[]
  historialVinculaciones HistorialVinculacionMedidor[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([cooperativaId, numeroMedidor]) // Un medidor por cooperativa
  @@index([numeroMedidor])
  @@index([cooperativaId, activo])
  @@map("medidores")
}
```

### 📈 Lectura

```prisma
model Lectura {
  id                String   @id @default(cuid())
  medidorId         String
  medidor           Medidor  @relation(fields: [medidorId], references: [id])
  
  // Datos de la lectura
  fechaLectura      DateTime
  valorLectura      Decimal  @db.Decimal(10,3)
  lecturaAnterior   Decimal? @db.Decimal(10,3)
  consumoCalculado  Decimal? @db.Decimal(10,3)
  
  // Clasificación temporal
  mes               Int      // 1-12
  anio              Int      // Año de la lectura
  esPrincipal       Boolean  @default(false) // Lectura oficial del mes
  
  // Detección de anomalías
  anomalia          Boolean  @default(false)
  tipoAnomalia      String?  // "CONSUMO_ALTO", "CONSUMO_BAJO", "LECTURA_INCONSISTENTE"
  porcentajeVariacion Decimal? @db.Decimal(5,2)
  
  // Auditoría
  observaciones     String?
  operadoPorId      String?
  operadoPor        Usuario? @relation(fields: [operadoPorId], references: [id])
  
  // Facturación
  facturaId         String?
  factura           Factura? @relation(fields: [facturaId], references: [id])
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([medidorId, mes, anio, esPrincipal]) // Una lectura principal por mes
  @@index([medidorId, fechaLectura])
  @@index([anomalia])
  @@index([mes, anio])
  @@map("lecturas")
}
```

### 📋 Historial de Vinculaciones

```prisma
model HistorialVinculacionMedidor {
  id                  String   @id @default(cuid())
  medidorId           String
  medidor             Medidor  @relation(fields: [medidorId], references: [id])
  
  // Tipo de operación
  tipoVinculacion     String   // "INMUEBLE" | "CUENTA_SERVICIO"
  accion              String   // "VINCULACION" | "DESVINCULACION" | "CAMBIO"
  
  // Entidades involucradas
  entidadAnteriorId   String?  // ID de la entidad anterior (en cambios)
  entidadNuevaId      String?  // ID de la nueva entidad
  
  // Detalles de la operación
  motivo              String?
  observaciones       String?
  fechaOperacion      DateTime @default(now())
  
  // Auditoría
  operadoPorId        String
  operadoPor          Usuario  @relation(fields: [operadoPorId], references: [id])
  
  @@index([medidorId, fechaOperacion])
  @@index([tipoVinculacion])
  @@map("historial_vinculacion_medidores")
}
```

---

## 🔌 API Endpoints

### 🏷️ CRUD de Medidores

#### **POST /medidores**
Crea un nuevo medidor en la cooperativa.

**Permisos requeridos:** `CanWrite('MEDIDORES')`

**Request Body:**
```json
{
  "numeroMedidor": "M001-2024",
  "marca": "Elster",
  "modelo": "A100",
  "fechaInstalacion": "2024-01-15T10:00:00Z",
  "observaciones": "Medidor nuevo instalado",
  "inmuebleId": "uuid-inmueble" // Opcional
}
```

**Response:**
```json
{
  "id": "uuid-medidor",
  "numeroMedidor": "M001-2024",
  "marca": "Elster",
  "modelo": "A100",
  "fechaInstalacion": "2024-01-15T10:00:00Z",
  "activo": true,
  "observaciones": "Medidor nuevo instalado",
  "cooperativa": {
    "id": "uuid-cooperativa",
    "nombre": "Cooperativa San Martín"
  },
  "inmueble": {
    "id": "uuid-inmueble",
    "domicilio": "Av. San Martín 123",
    "localidad": "Buenos Aires",
    "titularInmueble": {
      "nombreCompleto": "Juan Pérez"
    }
  },
  "lecturaActual": null,
  "cuentasServicios": [],
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

#### **GET /medidores**
Obtiene la lista paginada de medidores con filtros opcionales.

**Permisos requeridos:** `CanRead('MEDIDORES')`

**Query Parameters:**
```
?activo=true
&inmuebleId=uuid-inmueble
&marca=Elster
&modelo=A100
&numeroMedidor=M001
&fechaInstalacionDesde=2024-01-01
&fechaInstalacionHasta=2024-12-31
&necesitaAtencion=true
&limite=20
&pagina=1
```

**Response:**
```json
{
  "items": [
    {
      "id": "uuid-medidor",
      "numeroMedidor": "M001-2024",
      "marca": "Elster",
      "activo": true,
      "inmueble": { "domicilio": "Av. San Martín 123" },
      "lecturaActual": {
        "valorLectura": "1250.500",
        "fechaLectura": "2024-10-01T09:00:00Z"
      }
    }
  ],
  "total": 45,
  "pagina": 1,
  "limite": 20,
  "totalPaginas": 3
}
```

#### **GET /medidores/:id**
Obtiene el detalle completo de un medidor específico.

**Permisos requeridos:** `CanRead('MEDIDORES')`

**Response:** Mismo formato que POST con todos los detalles.

#### **PUT /medidores/:id**
Actualiza los datos de un medidor existente.

**Permisos requeridos:** `CanWrite('MEDIDORES')`

**Request Body:**
```json
{
  "marca": "Siemens",
  "modelo": "B200",
  "activo": false,
  "observaciones": "Medidor reemplazado por falla"
}
```

#### **DELETE /medidores/:id**
Elimina un medidor (soft delete).

**Permisos requeridos:** `CanExecute('MEDIDORES')`

**Response:** `204 No Content`

---

### 🔗 Gestión de Vinculaciones

#### **POST /medidores/:id/vincular**
Vincula un medidor a un inmueble o cuenta de servicio.

**Permisos requeridos:** `CanExecute('MEDIDORES')`

**Request Body:**
```json
{
  "entidadId": "uuid-inmueble",
  "tipoVinculacion": "INMUEBLE",
  "motivo": "Instalación inicial",
  "observaciones": "Vinculación realizada según orden de trabajo #123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Medidor vinculado exitosamente al inmueble"
}
```

#### **POST /medidores/:id/desvincular/:tipo**
Desvincula un medidor de un inmueble o cuenta.

**Permisos requeridos:** `CanExecute('MEDIDORES')`

**Parameters:**
- `tipo`: "INMUEBLE" | "CUENTA_SERVICIO"

**Request Body:**
```json
{
  "motivo": "Reubicación de medidor",
  "observaciones": "Medidor movido a nueva ubicación según orden #456"
}
```

#### **GET /medidores/:id/historial-vinculaciones**
Obtiene el historial completo de vinculaciones de un medidor.

**Permisos requeridos:** `CanRead('MEDIDORES')`

**Response:**
```json
[
  {
    "id": "uuid-historial",
    "tipoVinculacion": "INMUEBLE",
    "accion": "VINCULACION",
    "entidadNuevaId": "uuid-inmueble",
    "motivo": "Instalación inicial",
    "fechaOperacion": "2024-01-15T10:00:00Z",
    "operadoPor": {
      "id": "uuid-usuario",
      "nombre": "Juan",
      "apellido": "González"
    }
  }
]
```

---

### 📊 Sistema de Lecturas

#### **POST /medidores/lecturas**
Registra una nueva lectura de medidor.

**Permisos requeridos:** `CanWrite('MEDIDORES')`

**Request Body:**
```json
{
  "medidorId": "uuid-medidor",
  "fechaLectura": "2024-10-01T09:00:00Z",
  "valorLectura": "1250.500",
  "lecturaAnterior": "1180.300",
  "mes": 10,
  "anio": 2024,
  "esPrincipal": true,
  "observaciones": "Lectura tomada por técnico certificado"
}
```

**Response:**
```json
{
  "id": "uuid-lectura",
  "medidorId": "uuid-medidor",
  "fechaLectura": "2024-10-01T09:00:00Z",
  "valorLectura": "1250.500",
  "lecturaAnterior": "1180.300",
  "consumoCalculado": "70.200",
  "mes": 10,
  "anio": 2024,
  "esPrincipal": true,
  "anomalia": false,
  "tipoAnomalia": null,
  "porcentajeVariacion": "8.50",
  "observaciones": "Lectura tomada por técnico certificado",
  "medidor": {
    "numeroMedidor": "M001-2024",
    "inmueble": {
      "domicilio": "Av. San Martín 123"
    }
  },
  "operadoPor": {
    "nombre": "Ana",
    "apellido": "Martínez"
  }
}
```

#### **GET /medidores/lecturas**
Busca lecturas con filtros avanzados.

**Permisos requeridos:** `CanRead('MEDIDORES')`

**Query Parameters:**
```
?medidorId=uuid-medidor
&mes=10
&anio=2024
&fechaDesde=2024-10-01
&fechaHasta=2024-10-31
&soloAnomalias=true
&soloPrincipales=true
&limite=50
&pagina=1
```

#### **GET /medidores/:medidorId/lectura-principal/:mes/:anio**
Obtiene la lectura principal oficial de un mes específico.

**Permisos requeridos:** `CanRead('MEDIDORES')`

**Response:** Lectura con formato detallado o `null` si no existe.

#### **PUT /medidores/lecturas/:id**
Actualiza una lectura existente.

**Permisos requeridos:** `CanWrite('MEDIDORES')`

---

### 📈 Estadísticas y Análisis

#### **GET /medidores/:id/estadisticas**
Obtiene estadísticas completas de un medidor.

**Permisos requeridos:** `CanRead('MEDIDORES')`

**Response:**
```json
{
  "medidorId": "uuid-medidor",
  "consumo": {
    "promedioMensual": "68.750",
    "ultimosMesesPromedio": ["70.2", "65.8", "72.1", "66.9", "69.3", "71.5"],
    "tendencia": "ESTABLE",
    "variacionPorcentual": "2.45"
  },
  "lecturas": {
    "total": 24,
    "conAnomalias": 2,
    "ultimaFecha": "2024-10-01T09:00:00Z",
    "proximaLecturaEsperada": "2024-11-01T00:00:00Z"
  },
  "estado": {
    "operativo": true,
    "necesitaAtencion": false,
    "motivosAtencion": [],
    "puntuacionSalud": 92,
    "diasSinLectura": 9
  },
  "anomalias": {
    "recientes": 0,
    "tiposDetectados": [],
    "ultimaAnomalia": null
  }
}
```

#### **GET /medidores/:id/ultimas-lecturas/:cantidad**
Obtiene las últimas N lecturas de un medidor.

**Permisos requeridos:** `CanRead('MEDIDORES')`

#### **GET /medidores/:id/lecturas-anomalas**
Obtiene solo las lecturas con anomalías detectadas.

**Permisos requeridos:** `CanRead('MEDIDORES')`

---

### 🎯 Dashboard y Reportes

#### **GET /medidores/resumen/necesitan-atencion**
Lista medidores que requieren atención inmediata.

**Permisos requeridos:** `CanRead('MEDIDORES')`

**Response:**
```json
{
  "total": 5,
  "medidores": [
    {
      "medidor": {
        "id": "uuid-medidor",
        "numeroMedidor": "M005-2024",
        "inmueble": { "domicilio": "Calle Falsa 123" }
      },
      "motivosAtencion": [
        "Lecturas con anomalías recurrentes",
        "Más de 45 días sin lectura"
      ],
      "puntuacionSalud": 35
    }
  ]
}
```

#### **GET /medidores/dashboard/resumen**
Resumen ejecutivo para el dashboard principal.

**Permisos requeridos:** `CanRead('MEDIDORES')`

**Response:**
```json
{
  "totalMedidores": 150,
  "medidoresActivos": 142,
  "medidoresInactivos": 8,
  "conLecturasRecientes": 135,
  "necesitanAtencion": 5,
  "lecturasDelMes": 128,
  "anomaliasDetectadas": 12
}
```

---

## 📋 DTOs y Validaciones

### CreateMedidorDto
```typescript
export class CreateMedidorDto {
  @IsString()
  numeroMedidor: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsDateString()
  fechaInstalacion?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsUUID()
  inmuebleId?: string;
}
```

### CreateLecturaDto
```typescript
export class CreateLecturaDto {
  @IsUUID()
  medidorId: string;

  @IsDateString()
  fechaLectura: string;

  @IsDecimal()
  valorLectura: string;

  @IsOptional()
  @IsDecimal()
  lecturaAnterior?: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  mes: number;

  @IsNumber()
  @Min(2020)
  anio: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;
}
```

### VincularMedidorDto
```typescript
export class VincularMedidorDto {
  @IsUUID()
  medidorId: string;

  @IsUUID()
  entidadId: string;

  @IsString()
  tipoVinculacion: 'INMUEBLE' | 'CUENTA_SERVICIO';

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}
```

---

## 🚀 Funcionalidades Avanzadas

### 🔍 Detección Automática de Anomalías

El sistema implementa detección inteligente de anomalías en las lecturas:

#### **Algoritmo de Detección**
1. **Cálculo de Variación**: Compara el consumo actual con el promedio histórico
2. **Umbrales Configurables**: Detecta variaciones >30% por defecto
3. **Clasificación Automática**: Categoriza las anomalías por tipo
4. **Marcado Automático**: Marca lecturas anómalas en la base de datos

#### **Tipos de Anomalías Detectadas**
- `CONSUMO_ALTO`: Consumo significativamente superior al promedio
- `CONSUMO_BAJO`: Consumo anormalmente bajo (posible fuga o error)
- `LECTURA_INCONSISTENTE`: Lectura que no sigue el patrón histórico

#### **Ejemplo de Detección**
```typescript
// El sistema calcula automáticamente:
const promedioHistorico = 68.5; // kWh
const consumoActual = 95.2; // kWh
const variacion = ((95.2 - 68.5) / 68.5) * 100; // 38.9%

if (variacion > 30) {
  lectura.anomalia = true;
  lectura.tipoAnomalia = 'CONSUMO_ALTO';
  lectura.porcentajeVariacion = 38.9;
}
```

### 📊 Sistema de Lecturas Principales

Implementa un sistema de lecturas oficiales para facturación:

#### **Características**
- **Una lectura principal por mes**: Garantiza unicidad
- **Validación automática**: Previene duplicados
- **Priorización**: Las lecturas principales tienen precedencia
- **Auditoría**: Rastrea quién designó cada lectura como principal

#### **Lógica de Negocio**
```sql
-- Restricción a nivel de base de datos
@@unique([medidorId, mes, anio, esPrincipal])
```

### 🏥 Sistema de Salud de Medidores

Calcula automáticamente la "salud" de cada medidor:

#### **Factores de Puntuación (0-100)**
- **Lecturas regulares**: +30 puntos si tiene lecturas recientes
- **Ausencia de anomalías**: +25 puntos si no tiene anomalías recurrentes
- **Datos completos**: +20 puntos si tiene metadatos completos
- **Vinculación activa**: +15 puntos si está vinculado correctamente
- **Operatividad**: +10 puntos si está marcado como activo

#### **Interpretación de Puntuaciones**
- **90-100**: Excelente estado, funcionamiento óptimo
- **70-89**: Buen estado, monitoreo regular
- **50-69**: Estado regular, requiere atención
- **30-49**: Estado deficiente, intervención necesaria
- **0-29**: Estado crítico, reemplazo recomendado

### 🔄 Auditoría Completa

Sistema de auditoría que registra todas las operaciones:

#### **Eventos Auditados**
- Creación y modificación de medidores
- Vinculaciones y desvinculaciones
- Registro y actualización de lecturas
- Cambios de estado y configuración

#### **Información Registrada**
- Usuario que realizó la operación
- Timestamp exacto
- Valores anteriores y nuevos
- Motivo de la operación
- Observaciones adicionales

---

## 💼 Casos de Uso

### 1. Instalación de Nuevo Medidor

```typescript
// 1. Crear el medidor
const medidor = await POST('/medidores', {
  numeroMedidor: 'M001-2024',
  marca: 'Elster',
  modelo: 'A100',
  fechaInstalacion: '2024-01-15T10:00:00Z'
});

// 2. Vincularlo a un inmueble
await POST(`/medidores/${medidor.id}/vincular`, {
  entidadId: 'uuid-inmueble',
  tipoVinculacion: 'INMUEBLE',
  motivo: 'Instalación inicial'
});

// 3. Registrar primera lectura
await POST('/medidores/lecturas', {
  medidorId: medidor.id,
  fechaLectura: '2024-01-15T10:30:00Z',
  valorLectura: '0.000',
  mes: 1,
  anio: 2024,
  esPrincipal: true,
  observaciones: 'Lectura inicial - medidor nuevo'
});
```

### 2. Proceso Mensual de Lecturas

```typescript
// 1. Obtener medidores activos
const medidores = await GET('/medidores?activo=true&limite=1000');

// 2. Para cada medidor, registrar lectura
for (const medidor of medidores.items) {
  const lectura = await POST('/medidores/lecturas', {
    medidorId: medidor.id,
    fechaLectura: new Date().toISOString(),
    valorLectura: lecturaObtenida,
    mes: mesActual,
    anio: anioActual,
    esPrincipal: true
  });
  
  // 3. Verificar si hay anomalías
  if (lectura.anomalia) {
    console.log(`Anomalía detectada en ${medidor.numeroMedidor}: ${lectura.tipoAnomalia}`);
    // Enviar alerta al supervisor
  }
}
```

### 3. Análisis de Consumos Anómalos

```typescript
// 1. Obtener medidores que necesitan atención
const atencion = await GET('/medidores/resumen/necesitan-atencion');

// 2. Para cada medidor problemático
for (const item of atencion.medidores) {
  // Obtener lecturas anómalas
  const anomalias = await GET(`/medidores/${item.medidor.id}/lecturas-anomalas`);
  
  // Obtener estadísticas detalladas
  const stats = await GET(`/medidores/${item.medidor.id}/estadisticas`);
  
  console.log(`Medidor ${item.medidor.numeroMedidor}:`);
  console.log(`- Salud: ${item.puntuacionSalud}%`);
  console.log(`- Anomalías: ${anomalias.total}`);
  console.log(`- Tendencia: ${stats.consumo.tendencia}`);
}
```

### 4. Reubicación de Medidor

```typescript
// 1. Desvincular del inmueble actual
await POST(`/medidores/${medidorId}/desvincular/INMUEBLE`, {
  motivo: 'Reubicación según orden de trabajo #456',
  observaciones: 'Medidor movido por remodelación del inmueble'
});

// 2. Actualizar ubicación física
await PUT(`/medidores/${medidorId}`, {
  inmuebleId: nuevoInmuebleId,
  observaciones: 'Reubicado a nueva dirección'
});

// 3. Vincular al nuevo inmueble
await POST(`/medidores/${medidorId}/vincular`, {
  entidadId: nuevoInmuebleId,
  tipoVinculacion: 'INMUEBLE',
  motivo: 'Reubicación completada',
  observaciones: 'Nueva ubicación confirmada por técnico'
});

// 4. Verificar historial
const historial = await GET(`/medidores/${medidorId}/historial-vinculaciones`);
console.log('Historial completo:', historial);
```

---

## 🛠️ Ejemplos de Implementación

### Frontend - Dashboard de Medidores

```typescript
interface DashboardData {
  resumen: {
    totalMedidores: number;
    medidoresActivos: number;
    necesitanAtencion: number;
    lecturasDelMes: number;
  };
  medidoresAtencion: Array<{
    medidor: MedidorDetalle;
    motivosAtencion: string[];
    puntuacionSalud: number;
  }>;
}

const MedidoresDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>();

  useEffect(() => {
    const cargarDatos = async () => {
      const [resumen, atencion] = await Promise.all([
        GET('/medidores/dashboard/resumen'),
        GET('/medidores/resumen/necesitan-atencion')
      ]);
      
      setData({ resumen, medidoresAtencion: atencion.medidores });
    };
    
    cargarDatos();
  }, []);

  return (
    <div className="dashboard-medidores">
      <div className="metricas-principales">
        <MetricaCard
          titulo="Total Medidores"
          valor={data?.resumen.totalMedidores}
          icono="📊"
        />
        <MetricaCard
          titulo="Activos"
          valor={data?.resumen.medidoresActivos}
          icono="✅"
          color="green"
        />
        <MetricaCard
          titulo="Necesitan Atención"
          valor={data?.resumen.necesitanAtencion}
          icono="⚠️"
          color="orange"
        />
        <MetricaCard
          titulo="Lecturas del Mes"
          valor={data?.resumen.lecturasDelMes}
          icono="📈"
          color="blue"
        />
      </div>
      
      <div className="alertas-atencion">
        <h3>Medidores que Requieren Atención</h3>
        {data?.medidoresAtencion.map(item => (
          <AlertaMedidor
            key={item.medidor.id}
            medidor={item.medidor}
            motivos={item.motivosAtencion}
            salud={item.puntuacionSalud}
          />
        ))}
      </div>
    </div>
  );
};
```

### Cliente HTTP - Servicio de Medidores

```typescript
class MedidoresService {
  private baseURL = '/api/medidores';

  async crearMedidor(data: CreateMedidorDto): Promise<MedidorDetalle> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }
    
    return response.json();
  }

  async obtenerEstadisticas(medidorId: string): Promise<EstadisticasMedidor> {
    const response = await fetch(`${this.baseURL}/${medidorId}/estadisticas`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    return response.json();
  }

  async registrarLectura(data: CreateLecturaDto): Promise<LecturaDetalle> {
    const response = await fetch(`${this.baseURL}/lecturas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    
    const lectura = await response.json();
    
    // Manejar anomalías automáticamente
    if (lectura.anomalia) {
      this.notificarAnomalia(lectura);
    }
    
    return lectura;
  }

  private notificarAnomalia(lectura: LecturaDetalle): void {
    console.warn(`🚨 Anomalía detectada:`, {
      medidor: lectura.medidor.numeroMedidor,
      tipo: lectura.tipoAnomalia,
      variacion: lectura.porcentajeVariacion + '%'
    });
    
    // Enviar notificación al supervisor
    // showNotification({...});
  }
}
```

### Utilidades - Análisis de Datos

```typescript
class AnalisisMedidores {
  static calcularTendencia(consumos: number[]): 'CRECIENTE' | 'DECRECIENTE' | 'ESTABLE' {
    if (consumos.length < 2) return 'ESTABLE';
    
    const primero = consumos[consumos.length - 1];
    const ultimo = consumos[0];
    const variacion = ((ultimo - primero) / primero) * 100;
    
    if (variacion > 10) return 'CRECIENTE';
    if (variacion < -10) return 'DECRECIENTE';
    return 'ESTABLE';
  }

  static detectarAnomalias(
    valorActual: number, 
    historicoConsumos: number[]
  ): { esAnomalia: boolean; tipo?: string; variacion: number } {
    const promedio = historicoConsumos.reduce((a, b) => a + b, 0) / historicoConsumos.length;
    const variacion = ((valorActual - promedio) / promedio) * 100;
    
    if (Math.abs(variacion) > 30) {
      return {
        esAnomalia: true,
        tipo: variacion > 0 ? 'CONSUMO_ALTO' : 'CONSUMO_BAJO',
        variacion: Math.abs(variacion)
      };
    }
    
    return { esAnomalia: false, variacion: Math.abs(variacion) };
  }

  static calcularSaludMedidor(medidor: MedidorDetalle, estadisticas: EstadisticasMedidor): number {
    let puntuacion = 0;
    
    // Lecturas regulares (30 puntos)
    if (estadisticas.estado.diasSinLectura <= 35) {
      puntuacion += 30;
    } else if (estadisticas.estado.diasSinLectura <= 50) {
      puntuacion += 15;
    }
    
    // Ausencia de anomalías (25 puntos)
    const ratioAnomalias = estadisticas.anomalias.recientes / estadisticas.lecturas.total;
    if (ratioAnomalias === 0) {
      puntuacion += 25;
    } else if (ratioAnomalias < 0.1) {
      puntuacion += 15;
    } else if (ratioAnomalias < 0.2) {
      puntuacion += 8;
    }
    
    // Datos completos (20 puntos)
    if (medidor.marca && medidor.modelo && medidor.fechaInstalacion) {
      puntuacion += 20;
    } else if ((medidor.marca && medidor.modelo) || medidor.fechaInstalacion) {
      puntuacion += 10;
    }
    
    // Vinculación activa (15 puntos)
    if (medidor.inmueble || medidor.cuentasServicios.length > 0) {
      puntuacion += 15;
    }
    
    // Operatividad (10 puntos)
    if (medidor.activo) {
      puntuacion += 10;
    }
    
    return Math.min(puntuacion, 100);
  }
}
```

---

## 🔐 Seguridad y Permisos

### Sistema de Autenticación
- **JWT obligatorio** en todos los endpoints
- **Validación de cooperativa** en cada request
- **Aislamiento multi-tenant** automático

### Permisos Granulares
- `CanRead('MEDIDORES')`: Lectura de datos
- `CanWrite('MEDIDORES')`: Creación y edición
- `CanExecute('MEDIDORES')`: Operaciones críticas (vincular/desvincular/eliminar)

### Validación de Datos
- **DTOs con validaciones estrictas**
- **Sanitización automática** de entradas
- **Validación de relaciones** entre entidades

---

## 📊 Métricas y Monitoreo

### KPIs Principales
- **Cobertura de Lecturas**: % de medidores con lecturas del mes actual
- **Tasa de Anomalías**: % de lecturas con anomalías detectadas
- **Salud Promedio**: Puntuación promedio de salud de medidores
- **Tiempo de Respuesta**: Latencia promedio de endpoints críticos

### Alertas Automáticas
- Medidores sin lecturas por >45 días
- Detección de anomalías recurrentes
- Medidores con puntuación de salud <50
- Vinculaciones pendientes por >7 días

---

## 🚀 Próximas Funcionalidades

### Versión 2.0 (Planificada)
- [ ] **Integración IoT**: Lecturas automáticas desde medidores inteligentes
- [ ] **Machine Learning**: Predicción de consumos y detección avanzada de anomalías
- [ ] **Geolocalización**: Mapas interactivos de medidores
- [ ] **Facturación Automática**: Integración directa con sistema de facturación
- [ ] **Mantenimiento Predictivo**: Alertas de mantenimiento basadas en datos históricos

### Mejoras Técnicas
- [ ] **Cache Redis**: Optimización de consultas frecuentes
- [ ] **Export/Import**: Funcionalidades de migración masiva
- [ ] **APIs GraphQL**: Consultas más flexibles para frontend
- [ ] **Webhooks**: Notificaciones en tiempo real de eventos críticos

---

## 📞 Soporte y Contacto

Para soporte técnico, reportes de bugs o solicitudes de nuevas funcionalidades:

- **GitHub Issues**: [Reportar problema](https://github.com/DelgadoElias/coop-service-backend/issues)
- **Documentación**: [Wiki del proyecto](https://github.com/DelgadoElias/coop-service-backend/wiki)
- **Email**: soporte@cooperativas-system.com

---

*Documentación generada automáticamente - Versión 1.0 - Octubre 2024*