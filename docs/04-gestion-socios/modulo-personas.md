# Módulo de Personas

## Descripción General

El **Módulo de Personas** es un sistema integral diseñado para gestionar los socios de cooperativas de servicios públicos. Proporciona funcionalidades completas de gestión de miembros, validación KYC (Know Your Customer), portal de autogestión y vinculación con sistemas de autenticación.

### Características Principales

- ✅ **Gestión Completa de Socios**: Registro, actualización y administración de datos personales
- ✅ **Sistema KYC Avanzado**: Validación de identidad con flujo de documentos y aprobaciones
- ✅ **Portal de Autogestión**: Interfaz para que los socios gestionen su información
- ✅ **Integración de Autenticación**: Vinculación con cuentas de usuario y reset de contraseñas
- ✅ **Sistema de Notificaciones**: Comunicación automatizada y manual
- ✅ **Auditoría Completa**: Historial de cambios y seguimiento de estados
- ✅ **API REST Completa**: Endpoints administrativos y de autogestión

---

## Arquitectura del Módulo

### Estructura de Archivos

```
src/personas/
├── controllers/
│   └── personas.controller.ts    # Controlador principal con todos los endpoints
├── dto/
│   └── personas.dto.ts          # DTOs de validación para todas las operaciones
├── interfaces/
│   └── personas.interface.ts    # Interfaces TypeScript para tipado
├── personas.service.ts          # Lógica de negocio principal
└── personas.module.ts           # Configuración del módulo NestJS
```

### Dependencias

- **Prisma ORM**: Para acceso a base de datos
- **class-validator**: Para validación de DTOs
- **@nestjs/passport**: Para autenticación
- **@nestjs/platform-express**: Para manejo de archivos

---

## Modelos de Base de Datos

### Enumeraciones

#### EstadoKYC
Estados del proceso de validación Know Your Customer:
- `PENDIENTE`: KYC no iniciado
- `EN_REVISION`: Documentos enviados, en proceso de validación
- `APROBADO`: KYC completado y aprobado
- `RECHAZADO`: KYC rechazado por documentos inválidos
- `REQUIERE_INFORMACION_ADICIONAL`: Necesita documentos adicionales

#### TipoDocumentoKYC
Tipos de documentos requeridos para KYC:
- `DNI_FRENTE`: Frente del DNI
- `DNI_DORSO`: Dorso del DNI
- `COMPROBANTE_INGRESOS`: Recibo de sueldo o declaración de ingresos
- `COMPROBANTE_DOMICILIO`: Factura de servicios o contrato de alquiler
- `CONSTANCIA_CUIL`: Constancia de CUIL/CUIT
- `FOTOGRAFIA_ROSTRO`: Selfie para verificación facial
- `OTRO`: Otros documentos específicos

#### EstadoSocio
Estados administrativos del socio:
- `ACTIVO`: Socio activo en la cooperativa
- `SUSPENDIDO`: Socio temporalmente suspendido
- `DADO_DE_BAJA`: Socio dado de baja definitivamente
- `MOROSO`: Socio con deudas pendientes

### Modelo Principal: Persona

La entidad `Persona` contiene:

#### Información Personal
- Nombre completo, documento (tipo y número)
- Fecha de nacimiento, estado civil, nacionalidad
- Categoría de IVA

#### Información de Contacto
- Teléfonos (fijo y móvil)
- Emails (principal y secundario)
- Domicilios (actual y fiscal completos)

#### Información Laboral
- Ocupación, empresa, ingresos mensuales

#### Datos como Socio
- Número de socio, fecha de alta
- Estado del socio, estado KYC
- Fechas de proceso KYC

#### Preferencias de Comunicación
- Notificaciones por email/SMS
- Recepción de facturas por email

#### Auditoría
- Fechas de creación y actualización
- Historial de cambios

### Modelos Relacionados

#### DocumentoKYC
Gestiona los documentos subidos para validación:
- Tipo de documento, archivo, validación
- Metadata del archivo (tamaño, tipo MIME)
- Estado de validación y observaciones

#### HistorialEstadoKYC
Auditoría de cambios de estado KYC:
- Estados anterior y nuevo
- Motivo y observaciones del cambio
- Usuario que realizó el cambio

#### SolicitudResetPassword
Gestión de recuperación de contraseñas:
- Token único y fecha de expiración
- Tracking de uso y origen de la solicitud

#### NotificacionPersona
Sistema de notificaciones:
- Tipos: EMAIL, SMS, PUSH, SISTEMA
- Categorías: FACTURACION, KYC, GENERAL, EMERGENCIA
- Estado de entrega y lectura

---

## API Endpoints

### Endpoints Administrativos

#### Gestión de Personas

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| `POST` | `/personas` | Crear nueva persona | `CanWrite` |
| `GET` | `/personas` | Listar personas con filtros | `CanRead` |
| `GET` | `/personas/:id` | Obtener persona por ID | `CanRead` |
| `GET` | `/personas/documento/:tipoDocumento/:numeroDocumento` | Buscar por documento | `CanRead` |
| `PUT` | `/personas/:id` | Actualizar persona | `CanWrite` |
| `DELETE` | `/personas/:id` | Eliminar persona | `CanExecute` |

#### Gestión KYC

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| `PUT` | `/personas/:id/kyc/estado` | Actualizar estado KYC | `CanWrite` |
| `POST` | `/personas/:id/kyc/documentos` | Subir documentos KYC | `CanWrite` |
| `PUT` | `/personas/kyc/documentos/:documentoId/validar` | Validar documentos | `CanWrite` |
| `GET` | `/personas/:id/kyc/documentos` | Ver documentos KYC | `CanRead` |
| `GET` | `/personas/:id/kyc/historial` | Historial KYC | `CanRead` |
| `GET` | `/personas/estadisticas/kyc` | Estadísticas KYC | `CanRead` |

#### Gestión de Usuarios y Notificaciones

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| `GET` | `/personas/:id/resumen-socio` | Resumen del socio | `CanRead` |
| `POST` | `/personas/:id/vincular-usuario` | Vincular usuario | `CanWrite` |
| `POST` | `/personas/:id/notificaciones` | Enviar notificaciones | `CanWrite` |
| `GET` | `/personas/dashboard/resumen` | Dashboard administrativo | `CanRead` |

#### Sistema de Reset de Contraseñas

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| `POST` | `/personas/reset-password/solicitar` | Solicitar reset | Público |
| `POST` | `/personas/reset-password/confirmar` | Confirmar reset | Público |

### Endpoints de Autogestión (Socios)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/personas/mi-perfil` | Ver mi perfil | JWT requerido |
| `PUT` | `/personas/mi-perfil` | Actualizar mi perfil | JWT requerido |
| `GET` | `/personas/mi-resumen` | Ver mi resumen completo | JWT requerido |
| `POST` | `/personas/mi-perfil/kyc/documentos` | Subir documentos KYC | JWT requerido |

---

## DTOs y Validaciones

### CreatePersonaDto

```typescript
class CreatePersonaDto {
  @IsString() @Length(2, 100)
  nombreCompleto: string;

  @IsEnum(['DNI', 'CUIL', 'CUIT', 'PASAPORTE', 'CI'])
  tipoDocumento: string;

  @IsString() @Length(6, 20) @Matches(/^[0-9]+$/)
  numeroDocumento: string;

  @IsEnum(['RESPONSABLE_INSCRIPTO', 'MONOTRIBUTISTA', 'EXENTO', 'CONSUMIDOR_FINAL', 'NO_CATEGORIZADO'])
  @IsOptional()
  categoriaIVA?: string;

  // Datos personales opcionales
  @IsOptional() @IsDateString()
  fechaNacimiento?: string;

  @IsOptional() @IsEnum(['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO'])
  estadoCivil?: string;

  // Contacto
  @IsOptional() @IsPhoneNumber('AR')
  telefono?: string;

  @IsOptional() @IsEmail()
  email?: string;

  // Domicilio fiscal (obligatorio)
  @IsString()
  domicilioFiscal: string;

  @IsString()
  localidadFiscal: string;

  @IsString()
  provinciaFiscal: string;

  // Más campos disponibles...
}
```

### Filtros de Búsqueda

```typescript
interface FiltrosPersonas {
  busqueda?: string;           // Búsqueda en nombre, documento, email
  estadoKYC?: string;         // Filtrar por estado KYC
  estadoSocio?: string;       // Filtrar por estado de socio
  tipoDocumento?: string;     // Tipo de documento
  localidad?: string;         // Localidad
  provincia?: string;         // Provincia
  fechaAltaDesde?: string;    // Rango de fechas
  fechaAltaHasta?: string;
  requiereActualizacionKYC?: boolean;
  soloConCuentas?: boolean;   // Solo personas con cuentas asociadas
  soloSinUsuario?: boolean;   // Solo personas sin usuario vinculado

  // Paginación
  pagina?: number;
  limite?: number;
  ordenarPor?: 'nombre' | 'numeroSocio' | 'fechaAlta' | 'estadoKYC';
  ordenDireccion?: 'asc' | 'desc';
}
```

---

## Funcionalidades Principales

### 1. Sistema KYC (Know Your Customer)

#### Flujo de Validación

1. **Inicio**: Nueva persona creada con estado `PENDIENTE`
2. **Subida de Documentos**: Socio/admin sube documentos requeridos
3. **Revisión**: Admin revisa y valida documentos
4. **Decisión**: 
   - ✅ **Aprobado**: KYC completado
   - ❌ **Rechazado**: Documentos inválidos
   - ⚠️ **Requiere Información**: Documentos adicionales necesarios

#### Documentos Requeridos

- **Básicos**: DNI (frente y dorso)
- **Comprobantes**: Ingresos y domicilio
- **Adicionales**: CUIL, fotografía (según configuración)

#### Auditoría KYC

- Historial completo de cambios de estado
- Registro de validaciones de documentos
- Observaciones y motivos de cada cambio

### 2. Portal de Autogestión

Los socios pueden:

- ✅ **Ver y actualizar** su perfil personal
- ✅ **Subir documentos** para validación KYC
- ✅ **Consultar resumen** de facturas, pagos y consumo
- ✅ **Solicitar reset** de contraseña
- ✅ **Gestionar preferencias** de comunicación

### 3. Sistema de Notificaciones

#### Tipos de Notificación

- **EMAIL**: Notificaciones por correo electrónico
- **SMS**: Mensajes de texto (requiere integración)
- **PUSH**: Notificaciones push (app móvil)
- **SISTEMA**: Notificaciones internas del sistema

#### Categorías

- **FACTURACION**: Facturas, vencimientos, pagos
- **KYC**: Cambios de estado, documentos requeridos
- **GENERAL**: Comunicaciones generales
- **EMERGENCIA**: Alertas urgentes

### 4. Integración con Autenticación

#### Vinculación de Usuarios

- Una persona puede tener múltiples usuarios vinculados
- Sistema de invitaciones por email
- Gestión de permisos por usuario

#### Reset de Contraseñas

- Tokens únicos con expiración
- Tracking de solicitudes y uso
- Registro de IP de origen

---

## Casos de Uso

### Administrador de Cooperativa

1. **Registro de Nuevo Socio**
   ```http
   POST /personas
   {
     "nombreCompleto": "Juan Pérez",
     "tipoDocumento": "DNI",
     "numeroDocumento": "12345678",
     "domicilioFiscal": "Av. Principal 123",
     "localidadFiscal": "Ciudad",
     "provinciaFiscal": "Provincia"
   }
   ```

2. **Consulta con Filtros**
   ```http
   GET /personas?estadoKYC=PENDIENTE&pagina=1&limite=10
   ```

3. **Actualizar Estado KYC**
   ```http
   PUT /personas/123/kyc/estado
   {
     "nuevoEstado": "APROBADO",
     "observaciones": "Documentos validados correctamente"
   }
   ```

### Socio (Autogestión)

1. **Ver Mi Perfil**
   ```http
   GET /personas/mi-perfil
   Authorization: Bearer <token>
   ```

2. **Actualizar Mis Datos**
   ```http
   PUT /personas/mi-perfil
   {
     "telefono": "+5491234567890",
     "email": "nuevo@email.com"
   }
   ```

3. **Subir Documento KYC**
   ```http
   POST /personas/mi-perfil/kyc/documentos
   Content-Type: multipart/form-data
   
   tipoDocumento: DNI_FRENTE
   archivo: [archivo binario]
   ```

### Sistema Automatizado

1. **Solicitar Reset de Contraseña**
   ```http
   POST /personas/reset-password/solicitar
   {
     "tipoDocumento": "DNI",
     "numeroDocumento": "12345678",
     "email": "socio@email.com"
   }
   ```

2. **Enviar Notificación**
   ```http
   POST /personas/123/notificaciones
   {
     "tipo": "EMAIL",
     "categoria": "KYC",
     "titulo": "Documentos Validados",
     "mensaje": "Su KYC ha sido aprobado"
   }
   ```

---

## Respuestas de la API

### Respuesta Exitosa - Persona Detalle

```json
{
  "id": "uuid",
  "nombreCompleto": "Juan Pérez",
  "tipoDocumento": "DNI",
  "numeroDocumento": "12345678",
  "email": "juan@email.com",
  "telefono": "+5491234567890",
  "numeroSocio": "SOC001",
  "estadoSocio": "ACTIVO",
  "estadoKYC": "APROBADO",
  "categoriaIVA": "CONSUMIDOR_FINAL",
  "fechaNacimiento": "1980-01-01T00:00:00.000Z",
  "estadoCivil": "CASADO",
  "nacionalidad": "Argentina",
  "domicilioFiscal": "Av. Principal 123",
  "localidadFiscal": "Ciudad",
  "provinciaFiscal": "Provincia",
  "ocupacion": "Empleado",
  "ingresosMensuales": 50000,
  "fechaAlta": "2024-01-01T00:00:00.000Z",
  "recibirNotificaciones": true,
  "recibirFacturaPorEmail": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "cooperativa": {
    "id": "coop-uuid",
    "nombre": "Cooperativa Ejemplo"
  },
  "usuarioVinculado": [
    {
      "id": "user-uuid",
      "email": "juan@email.com",
      "activo": true
    }
  ],
  "cuentasAsociadas": [
    {
      "id": "cuenta-uuid",
      "numeroCuenta": "001-001",
      "inmueble": {
        "domicilio": "Av. Principal 123",
        "localidad": "Ciudad"
      }
    }
  ]
}
```

### Respuesta Paginada

```json
{
  "items": [...],
  "total": 250,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 25
}
```

### Estadísticas KYC

```json
{
  "totalPersonas": 1000,
  "pendientes": 50,
  "enRevision": 30,
  "aprobados": 800,
  "rechazados": 20,
  "requierenInformacionAdicional": 100,
  "documentosPendientesValidacion": 75,
  "proximosVencimientos": 15
}
```

---

## Seguridad y Permisos

### Autenticación

- **JWT Tokens**: Para endpoints de autogestión
- **Guards de NestJS**: Para protección de rutas

### Autorización

- **CanRead**: Lectura de datos
- **CanWrite**: Escritura y actualización
- **CanExecute**: Operaciones críticas (eliminación)

### Validación de Datos

- **DTOs con class-validator**: Validación automática
- **Sanitización**: Limpieza de datos de entrada
- **Normalización**: Formato consistente de documentos

### Auditoría

- **Timestamps**: Creación y actualización automática
- **Historial KYC**: Registro completo de cambios
- **Logs de operaciones**: Tracking de acciones críticas

---

## Integración con Otros Módulos

### Módulo de Autenticación
- Vinculación de usuarios
- Sistema de permisos
- Reset de contraseñas

### Módulo de Facturación (Futuro)
- Resumen de facturas
- Estado de pagos
- Historial de consumo

### Módulo de Medidores
- Lecturas de consumo
- Asociación por cuentas
- Estadísticas de uso

### Módulo de Notificaciones (Futuro)
- Envío de emails
- SMS y notificaciones push
- Templates de comunicación

---

## Configuración y Deployment

### Variables de Entorno

```env
# Base de datos
DATABASE_URL="postgresql://..."

# Autenticación
JWT_SECRET="secret"
JWT_EXPIRES_IN="24h"

# Almacenamiento de archivos
STORAGE_PATH="/uploads"
MAX_FILE_SIZE="5MB"
ALLOWED_FILE_TYPES="image/jpeg,image/png,application/pdf"

# Email (futuro)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user"
SMTP_PASS="pass"
```

### Migraciones de Base de Datos

```bash
# Generar migración
npx prisma migrate dev --name "add-personas-kyc-system"

# Aplicar migración en producción
npx prisma migrate deploy
```

---

## Testing

### Unit Tests
- Servicios con mocks de Prisma
- Validación de DTOs
- Lógica de negocio

### Integration Tests
- Endpoints completos
- Base de datos de test
- Flujos de KYC

### E2E Tests
- Casos de uso completos
- Integración entre módulos
- Flujos de usuario

---

## Próximos Desarrollos

### Corto Plazo
- [ ] Implementación de almacenamiento de archivos
- [ ] Sistema de emails transaccionales
- [ ] Integración con módulo de facturación

### Medio Plazo
- [ ] App móvil para socios
- [ ] Notificaciones push
- [ ] Sistema de documentos digitales

### Largo Plazo
- [ ] Validación biométrica
- [ ] Integración con RENAPER
- [ ] IA para validación automática de documentos

---

## Soporte y Documentación

### Logs y Debugging

- Logs estructurados con contexto
- Tracking de operaciones KYC
- Monitoreo de performance

### Métricas

- Tiempo de procesamiento de KYC
- Tasa de aprobación/rechazo
- Uso de endpoints por módulo

### Mantenimiento

- Limpieza de tokens expirados
- Archivado de documentos antiguos
- Optimización de consultas

---

## Conclusión

El **Módulo de Personas** proporciona una base sólida para la gestión integral de socios en cooperativas de servicios públicos. Su diseño modular, sistema KYC robusto y API completa lo convierten en una solución escalable y mantenible para las necesidades actuales y futuras de la organización.

La implementación incluye todas las funcionalidades requeridas para el registro, validación, gestión y autoservicio de socios, con especial énfasis en la seguridad, auditoría y experiencia de usuario.