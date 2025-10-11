# Módulo de Inmuebles - NestJS

Este módulo proporciona una gestión completa de inmuebles con CRUD completo, sistema de permisos granular, gestión de legajos y transferencias de titularidad.

## 📁 Estructura del Módulo

```
src/inmuebles/
├── inmuebles.module.ts                    # Módulo principal de inmuebles
├── index.ts                               # Exportaciones principales
├── controllers/
│   └── inmuebles.controller.ts            # API endpoints para inmuebles y legajos
├── services/
│   ├── inmuebles-simple.service.ts        # Lógica de negocio principal
│   ├── legajos.service.ts                 # Gestión de legajos y documentos
│   └── configuracion-sistema.service.ts   # Configuración inicial del sistema
└── dto/
    ├── create-inmueble.dto.ts             # DTO para crear inmuebles
    ├── update-inmueble.dto.ts             # DTO para actualizar inmuebles
    ├── inmueble-query.dto.ts              # DTOs para filtros y operaciones
    └── index.ts                           # Exportaciones de DTOs
```

## 🚀 Funcionalidades Principales

### 1. CRUD Completo de Inmuebles

#### Crear Inmueble
- **Endpoint**: `POST /cooperativas/:cooperativaId/inmuebles`
- **Permisos**: Solo administradores o usuarios con permisos `EXECUTE` en inmuebles
- **Funcionalidad**:
  - Validación de titular existente en la cooperativa
  - Verificación de domicilio único
  - Creación automática de legajo
  - Datos catastrales opcionales

#### Listar Inmuebles
- **Endpoint**: `GET /cooperativas/:cooperativaId/inmuebles`
- **Permisos**: Todos los usuarios de la cooperativa (con restricciones según rol)
- **Funcionalidad**:
  - Filtrado por búsqueda general, localidad, provincia, titular
  - Paginación configurable
  - Ordenamiento personalizable
  - Acceso restringido: socios solo ven sus inmuebles

#### Obtener Inmueble Específico
- **Endpoint**: `GET /cooperativas/:cooperativaId/inmuebles/:inmuebleId`
- **Permisos**: Todos los usuarios de la cooperativa (con restricciones según rol)
- **Funcionalidad**:
  - Información completa del inmueble
  - Datos del titular
  - Cuentas asociadas
  - Información del legajo

#### Actualizar Inmueble
- **Endpoint**: `PUT /cooperativas/:cooperativaId/inmuebles/:inmuebleId`
- **Permisos**: Solo administradores o usuarios con permisos `EXECUTE` en inmuebles
- **Funcionalidad**:
  - Actualización de datos generales
  - Validación de titular si se cambia
  - Preservación de historial

#### Deshabilitar Inmueble (Baja Lógica)
- **Endpoint**: `DELETE /cooperativas/:cooperativaId/inmuebles/:inmuebleId`
- **Permisos**: Solo administradores o usuarios con permisos `EXECUTE` en inmuebles
- **Funcionalidad**:
  - Verificación de cuentas activas
  - Registro de motivo en legajo
  - Baja lógica sin eliminación física

### 2. Gestión de Titularidad

#### Transferir Titularidad
- **Endpoint**: `POST /cooperativas/:cooperativaId/inmuebles/:inmuebleId/transferir-titularidad`
- **Permisos**: Solo administradores o usuarios con permisos `EXECUTE` en inmuebles
- **Funcionalidad**:
  - Cambio de titular con registro completo
  - Múltiples motivos: compraventa, herencia, donación, etc.
  - Datos notariales opcionales
  - Registro automático en legajo
  - Generación de número de transferencia único

#### Historial de Titularidad
- **Endpoint**: `GET /cooperativas/:cooperativaId/inmuebles/:inmuebleId/historial-titularidad`
- **Permisos**: Todos los usuarios de la cooperativa
- **Funcionalidad**:
  - Historial completo de transferencias
  - Información de titulares anteriores
  - Fechas y motivos de cambios

### 3. Gestión de Cuentas

#### Asociar Cuenta
- **Endpoint**: `POST /cooperativas/:cooperativaId/inmuebles/:inmuebleId/asociar-cuenta`
- **Permisos**: Solo administradores o usuarios con permisos `EXECUTE` en inmuebles
- **Funcionalidad**:
  - Vinculación de cuenta de servicio al inmueble
  - Validación de cuenta existente
  - Prevención de doble asociación

#### Desvincular Cuenta
- **Endpoint**: `DELETE /cooperativas/:cooperativaId/inmuebles/:inmuebleId/cuentas/:cuentaId`
- **Permisos**: Solo administradores o usuarios con permisos `EXECUTE` en inmuebles
- **Funcionalidad**:
  - Desvinculación de cuenta del inmueble
  - Verificación de servicios activos
  - Registro en legajo

### 4. Sistema de Legajos

#### Obtener Legajo
- **Endpoint**: `GET /cooperativas/:cooperativaId/inmuebles/:inmuebleId/legajo`
- **Permisos**: Todos los usuarios de la cooperativa
- **Funcionalidad**:
  - Información completa del legajo
  - Documentos asociados
  - Transferencias registradas
  - Anotaciones históricas

#### Gestión de Documentos
- **Endpoint**: `POST /cooperativas/:cooperativaId/inmuebles/:inmuebleId/legajo/documentos`
- **Permisos**: Solo administradores o usuarios con permisos `EXECUTE` en inmuebles
- **Funcionalidad**:
  - Subida de documentos (PDF, imágenes, Word)
  - Múltiples tipos: escrituras, contratos, planos, etc.
  - Validación de archivos
  - Metadata completa

#### Validar Documentos
- **Endpoint**: `PUT /cooperativas/:cooperativaId/inmuebles/:inmuebleId/legajo/documentos/:documentoId/validar`
- **Permisos**: Solo administradores o usuarios con permisos `EXECUTE` en inmuebles
- **Funcionalidad**:
  - Proceso de validación de documentos
  - Observaciones opcionales
  - Trazabilidad de validaciones

#### Anotaciones
- **Endpoint**: `POST /cooperativas/:cooperativaId/inmuebles/:inmuebleId/legajo/anotaciones`
- **Permisos**: Solo administradores o usuarios con permisos `EXECUTE` en inmuebles
- **Funcionalidad**:
  - Notas administrativas
  - Marcado de importancia
  - Historial cronológico

## 🔐 Sistema de Permisos

### Roles y Permisos por Defecto

#### Administrador
- **Inmuebles**: READ, WRITE, EXECUTE, DELETE
- Acceso total a todas las funcionalidades

#### Operador
- **Inmuebles**: READ, WRITE, EXECUTE
- Gestión completa excepto eliminación

#### Contador
- **Inmuebles**: READ
- Solo consulta de información

#### Socio
- **Inmuebles**: READ (solo propios)
- Acceso limitado a sus inmuebles y cuentas asociadas

### Validaciones de Acceso

1. **Lectura**: Socios solo acceden a inmuebles donde son titulares o tienen cuentas
2. **Escritura/Ejecución**: Solo roles con permisos explícitos
3. **Eliminación**: Solo administradores

## 🗃️ Modelos de Datos

### Inmueble
```typescript
{
  id: string;
  domicilio: string;
  piso?: string;
  codigoPostal: string;
  localidad: string;
  departamento?: string;
  provincia: string;
  // Datos Catastrales
  seccion?: string;
  chacra?: string;
  manzana?: string;
  lote?: string;
  parcela?: string;
  // Relaciones
  titularInmuebleId: string;
  titularInmueble: Persona;
  cuentas: Cuenta[];
  legajo?: Legajo;
}
```

### Legajo
```typescript
{
  id: string;
  numeroLegajo: string; // "LEG-25-0001"
  estado: EstadoLegajo;
  fechaApertura: Date;
  fechaCierre?: Date;
  observaciones?: string;
  ubicacionArchivo?: string;
  // Relaciones
  inmueble: Inmueble;
  transferencias: TransferenciaTitularidad[];
  documentos: DocumentoLegajo[];
  anotaciones: AnotacionLegajo[];
}
```

### Transferencia de Titularidad
```typescript
{
  id: string;
  numeroTransferencia: string; // "TRANS-25-0001"
  motivo: MotivoTransferencia;
  descripcionMotivo?: string;
  fechaTransferencia: Date;
  titularAnterior: Persona;
  titularNuevo: Persona;
  valorTransferencia?: number;
  // Datos Notariales
  escribania?: string;
  numeroEscritura?: string;
  folioRegistro?: string;
  // Control
  verificado: boolean;
  observaciones?: string;
}
```

## 📋 Reglas de Negocio

### Creación de Inmuebles
1. El titular debe existir y pertenecer a la cooperativa
2. No puede haber domicilios duplicados en la misma cooperativa
3. Se crea automáticamente un legajo con número único
4. Los datos catastrales son opcionales

### Transferencias de Titularidad
1. El nuevo titular debe existir en la cooperativa
2. No se puede transferir al mismo titular actual
3. Se genera número único de transferencia
4. Se registra automáticamente en el legajo
5. Soporte para múltiples motivos legales

### Gestión de Cuentas
1. Una cuenta solo puede estar asociada a un inmueble
2. No se puede desvincular si hay servicios activos
3. Todas las operaciones se registran en el legajo

### Legajos
1. Cada inmueble tiene exactamente un legajo
2. Los documentos deben estar en formatos permitidos
3. Se mantiene historial completo de cambios
4. Numeración automática por año

## 🛠️ Configuración

### Configuración de Legajos
```typescript
{
  prefijoLegajo: "LEG",
  prefijoTransferencia: "TRANS",
  requiereValidacionDocumentos: true,
  maxTamanoArchivoMB: 50,
  formatosPermitidos: ["pdf", "jpg", "jpeg", "png", "tiff", "doc", "docx"],
  diasRetencionArchivados: 3650, // 10 años
  notificarTransferencias: true,
  diasAvisoVencimiento: 30
}
```

### Configuración de Archivos
- **Destino**: `./uploads/legajos`
- **Tamaño máximo**: 50MB
- **Tipos permitidos**: PDF, imágenes, documentos Word
- **Nomenclatura**: `{fieldname}-{timestamp}-{random}.{ext}`

## 🔧 Instalación y Configuración

### 1. Dependencias
```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-express
npm install @nestjs/mapped-types class-validator class-transformer
npm install multer @types/multer
```

### 2. Configuración del Módulo
```typescript
import { InmueblesModule } from './inmuebles/inmuebles.module';

@Module({
  imports: [
    // ... otros módulos
    InmueblesModule,
  ],
})
export class AppModule {}
```

### 3. Configuración de Secciones
Al crear una cooperativa, se ejecuta automáticamente:
```typescript
const configuracionService = new ConfiguracionSistemaService(prisma);
await configuracionService.configurarCooperativaCompleta(cooperativaId);
```

## 📊 Casos de Uso Principales

### 1. Registro de Nuevo Inmueble
```typescript
// Administrador registra inmueble de nuevo socio
POST /cooperativas/coop123/inmuebles
{
  "domicilio": "Av. San Martín 1234",
  "codigoPostal": "5000",
  "localidad": "Córdoba",
  "provincia": "Córdoba",
  "titularInmuebleId": "persona123",
  "seccion": "A",
  "manzana": "12",
  "lote": "5"
}
```

### 2. Transferencia por Herencia
```typescript
POST /cooperativas/coop123/inmuebles/inm123/transferir-titularidad
{
  "titularNuevoId": "heredero456",
  "motivo": "HERENCIA",
  "descripcionMotivo": "Sucesión de Juan Pérez según expediente 123/2024"
}
```

### 3. Consulta de Socio
```typescript
// Socio consulta sus inmuebles
GET /cooperativas/coop123/inmuebles
// Automáticamente filtrado por sus propiedades
```

## 🧪 Testing

### Casos de Prueba Principales
1. **CRUD básico**: Crear, leer, actualizar, deshabilitar inmuebles
2. **Permisos**: Verificar acceso según roles
3. **Transferencias**: Validar cambios de titularidad
4. **Legajos**: Gestión de documentos y anotaciones
5. **Validaciones**: Reglas de negocio y constraints

### Ejemplo de Test
```typescript
describe('InmueblesController', () => {
  it('should create inmueble with legajo', async () => {
    const result = await controller.crearInmueble(
      'coop123',
      createInmuebleDto,
      adminUser,
    );
    
    expect(result).toBeDefined();
    expect(result.legajo).toBeDefined();
    expect(result.legajo.numeroLegajo).toMatch(/^LEG-\d{2}-\d{4}$/);
  });
});
```

## 📈 Roadmap

### Funcionalidades Futuras
1. **Geolocalización**: Integración con mapas
2. **Workflow de Aprobaciones**: Proceso de validación multi-nivel
3. **Notificaciones**: Alertas por vencimientos y transferencias
4. **Reportes**: Generación de informes estadísticos
5. **API Mobile**: Endpoints optimizados para aplicaciones móviles
6. **Integración Catastral**: Conexión con registros oficiales

### Mejoras Técnicas
1. **Caching**: Redis para consultas frecuentes
2. **Búsqueda Avanzada**: Elasticsearch para filtros complejos
3. **Archivos**: Storage en la nube (AWS S3, etc.)
4. **Versionado**: Control de versiones de documentos
5. **Audit Trail**: Registro detallado de cambios

## ⚠️ Consideraciones Importantes

### Seguridad
- Todos los endpoints requieren autenticación JWT
- Validación granular de permisos por operación
- Sanitización de archivos subidos
- Logs de auditoría para operaciones críticas

### Rendimiento
- Paginación obligatoria en listados
- Índices optimizados en base de datos
- Carga lazy de relaciones complejas
- Compresión de archivos grandes

### Escalabilidad
- Diseño multi-tenant por cooperativa
- Separación lógica de datos
- APIs RESTful stateless
- Preparado para microservicios

Este módulo proporciona una base sólida y extensible para la gestión integral de inmuebles en el sistema de cooperativas, con énfasis en la trazabilidad, seguridad y facilidad de uso.