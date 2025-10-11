# 🏢 Flujo de Solicitud de Acceso para Cooperativas

## 📖 Descripción General

Este documento describe el proceso completo para que una cooperativa solicite acceso al sistema y cómo un SUPER_ADMIN puede gestionar estas solicitudes. El flujo incluye desde la solicitud inicial hasta la activación completa de la cooperativa en el sistema.

## 🔄 Proceso Completo

### 1️⃣ **Cooperativa Solicita Acceso**

**Endpoint:** `POST /cooperativas/solicitar-acceso`

```http
POST /cooperativas/solicitar-acceso
Content-Type: application/json

{
  "cooperativa": {
    "nombre": "Cooperativa Agua Limpia",
    "razonSocial": "Cooperativa de Agua Limpia Ltda.",
    "cuit": "30-12345678-9",
    "domicilio": "Av. Principal 123",
    "localidad": "Villa Nueva",
    "provincia": "Córdoba",
    "codigoPostal": "5000",
    "telefono": "0351-123-4567",
    "email": "info@aguialimpia.coop"
  },
  "administrador": {
    "nombre": "Juan Carlos",
    "apellido": "González",
    "email": "admin@aguialimpia.coop",
    "telefono": "0351-987-6543"
  }
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Solicitud de acceso enviada correctamente",
  "codigoReferencia": "REF-2024-001234",
  "cooperativaId": "coop_abc123",
  "procesoOnboardingId": "proc_xyz789",
  "estadoInicial": "PENDIENTE_VALIDACION",
  "instrucciones": "Su solicitud ha sido registrada. Recibirá un email con los próximos pasos.",
  "tiempoEstimado": "3-5 días hábiles"
}
```

### 2️⃣ **SUPER_ADMIN Login**

**Endpoint:** `POST /auth/super-admin/login`

```http
POST /auth/super-admin/login
Content-Type: application/json

{
  "email": "superadmin@sistema.com",
  "password": "tu_password_seguro",
  "accessCode": "codigo_super_secreto_2024"
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "user_super_admin_001",
    "email": "superadmin@sistema.com",
    "nombre": "Super",
    "apellido": "Administrador",
    "isSuperAdmin": true
  },
  "permissions": [
    "SYSTEM_GLOBAL_ACCESS",
    "COOPERATIVAS_MANAGEMENT",
    "ONBOARDING_MANAGEMENT",
    "USER_MANAGEMENT"
  ],
  "expiresIn": 28800,
  "refreshExpiresIn": 2592000
}
```

### 3️⃣ **Ver Solicitudes Pendientes (SUPER_ADMIN)**

**Endpoint:** `GET /cooperativas/solicitudes-pendientes`

```http
GET /cooperativas/solicitudes-pendientes
Authorization: Bearer tu_super_admin_token
```

**Respuesta:**
```json
{
  "success": true,
  "solicitudes": [
    {
      "procesoId": "proc_xyz789",
      "codigoReferencia": "REF-2024-001234",
      "estado": "PENDIENTE_VALIDACION",
      "fechaCreacion": "2024-10-09T10:30:00Z",
      "fechaVencimiento": "2024-11-08T10:30:00Z",
      "cooperativa": {
        "nombre": "Cooperativa Agua Limpia",
        "cuit": "30-12345678-9",
        "domicilio": "Av. Principal 123",
        "localidad": "Villa Nueva",
        "provincia": "Córdoba",
        "activa": false
      },
      "solicitante": {
        "nombre": "Juan Carlos",
        "apellido": "González",
        "email": "admin@aguialimpia.coop",
        "telefono": "0351-987-6543"
      },
      "diasRestantes": 30
    }
  ],
  "total": 1,
  "filtros": {
    "estados": ["PENDIENTE_VALIDACION", "PENDIENTE_APROBACION"],
    "ordenadoPor": "fechaCreacion",
    "orden": "desc"
  }
}
```

### 4️⃣ **Aprobar Solicitud (SUPER_ADMIN)**

**Endpoint:** `POST /cooperativas/decidir-solicitud/{codigoReferencia}`

#### ✅ **Aprobación:**

```http
POST /cooperativas/decidir-solicitud/REF-2024-001234
Authorization: Bearer tu_super_admin_token
Content-Type: application/json

{
  "aprobado": true,
  "observaciones": "Documentación completa y verificada. Cooperativa aprobada para el sistema."
}
```

**Respuesta de Aprobación:**
```json
{
  "success": true,
  "aprobado": true,
  "cooperativaId": "coop_abc123",
  "administrador": {
    "id": "user_def456",
    "email": "admin@aguialimpia.coop",
    "nombre": "Juan Carlos",
    "apellido": "González"
  },
  "mensaje": "Solicitud aprobada. Cooperativa activada y administrador creado.",
  "credencialesTemporales": {
    "email": "admin@aguialimpia.coop",
    "passwordTemporal": "temporal123",
    "instrucciones": "El administrador debe cambiar la contraseña en el primer login"
  },
  "proximosPasos": [
    "La cooperativa está ahora activa en el sistema",
    "El administrador puede hacer login con credenciales temporales",
    "Debe cambiar la contraseña inmediatamente",
    "Puede comenzar a configurar usuarios y servicios"
  ]
}
```

#### ❌ **Rechazo:**

```http
POST /cooperativas/decidir-solicitud/REF-2024-001234
Authorization: Bearer tu_super_admin_token
Content-Type: application/json

{
  "aprobado": false,
  "motivoRechazo": "Documentación incompleta. Falta comprobante de domicilio válido y personería jurídica actualizada."
}
```

**Respuesta de Rechazo:**
```json
{
  "success": true,
  "aprobado": false,
  "motivo": "Documentación incompleta. Falta comprobante de domicilio válido y personería jurídica actualizada.",
  "mensaje": "Solicitud rechazada.",
  "codigoReferencia": "REF-2024-001234",
  "estadoFinal": "RECHAZADO",
  "siguientesPasos": [
    "La cooperativa puede enviar una nueva solicitud",
    "Debe completar la documentación faltante",
    "Contactar soporte para consultas específicas"
  ]
}
```

### 5️⃣ **Login del Administrador de Cooperativa**

**Endpoint:** `POST /auth/login`

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@aguialimpia.coop",
  "password": "temporal123",
  "cooperativaId": "coop_abc123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_cooperativa",
  "user": {
    "id": "user_def456",
    "email": "admin@aguialimpia.coop",
    "nombre": "Juan Carlos",
    "apellido": "González",
    "esEmpleado": true,
    "cooperativa": {
      "id": "coop_abc123",
      "nombre": "Cooperativa Agua Limpia"
    }
  },
  "expiresIn": 3600,
  "refreshExpiresIn": 2592000,
  "requiresPasswordChange": true
}
```

## 🛠️ Endpoints Adicionales para SUPER_ADMIN

### **Ver Detalle de Solicitud Específica**

```http
GET /cooperativas/solicitud/REF-2024-001234
Authorization: Bearer tu_super_admin_token
```

### **Configurar Requisitos de Onboarding**

```http
PUT /cooperativas/configuracion-onboarding
Authorization: Bearer tu_super_admin_token
Content-Type: application/json

{
  "documentosRequeridos": ["DNI", "COMPROBANTE_DOMICILIO", "CUIT", "PERSONERIA_JURIDICA"],
  "requiereAprobacionManual": true,
  "tiempoLimiteOnboarding": 30,
  "emailBienvenida": "Bienvenido al sistema de cooperativas...",
  "emailAprobacion": "Su solicitud ha sido aprobada..."
}
```

### **Ver Configuración Actual de Onboarding**

```http
GET /cooperativas/configuracion-onboarding
Authorization: Bearer tu_super_admin_token
```

### **Ver Historial de Solicitudes**

```http
GET /cooperativas/solicitudes-historial?estado=COMPLETADO&limite=50&pagina=1
Authorization: Bearer tu_super_admin_token
```

**Parámetros de consulta disponibles:**
- `estado`: INICIADO, PENDIENTE_VALIDACION, PENDIENTE_APROBACION, COMPLETADO, RECHAZADO, EXPIRADO
- `limite`: Número de resultados por página (default: 20)
- `pagina`: Página a consultar (default: 1)
- `desde`: Fecha desde (YYYY-MM-DD)
- `hasta`: Fecha hasta (YYYY-MM-DD)

## 📊 Estados del Proceso

| Estado | Descripción | Acción Siguiente |
|--------|-------------|------------------|
| **INICIADO** | Solicitud creada | Validación automática |
| **EN_PROGRESO** | En proceso de validación | Esperar validaciones |
| **PENDIENTE_VALIDACION** | Validaciones completadas | Revisión de SUPER_ADMIN |
| **PENDIENTE_APROBACION** | Lista para decisión | Aprobación/Rechazo de SUPER_ADMIN |
| **COMPLETADO** | Aprobada y activa | Cooperativa operativa |
| **RECHAZADO** | Denegada con motivo | Nueva solicitud posible |
| **CANCELADO** | Cancelada por solicitante | Proceso terminado |
| **EXPIRADO** | Venció el tiempo límite | Nueva solicitud requerida |

## 🔄 Flujo Resumido

```mermaid
graph TD
    A[Cooperativa solicita acceso] --> B[Sistema crea solicitud]
    B --> C[Estado: PENDIENTE_VALIDACION]
    C --> D[SUPER_ADMIN revisa solicitud]
    D --> E{¿Aprobada?}
    E -->|Sí| F[Cooperativa activada]
    E -->|No| G[Solicitud rechazada]
    F --> H[Administrador creado]
    H --> I[Credenciales enviadas]
    I --> J[Administrador hace login]
    G --> K[Puede solicitar nuevamente]
```

## 🎯 Casos de Uso Comunes

### **Caso 1: Aprobación Estándar**
1. Cooperativa envía solicitud completa
2. SUPER_ADMIN revisa y aprueba
3. Sistema activa cooperativa y crea administrador
4. Administrador recibe credenciales y hace login

### **Caso 2: Solicitud Incompleta**
1. Cooperativa envía solicitud con datos faltantes
2. SUPER_ADMIN revisa y rechaza con observaciones
3. Cooperativa corrige datos y envía nueva solicitud

### **Caso 3: Gestión Masiva**
1. SUPER_ADMIN consulta todas las solicitudes pendientes
2. Procesa múltiples solicitudes en lote
3. Configura requisitos globales de onboarding

## 🔧 Configuración del Sistema

### **Variables de Entorno Requeridas**

```bash
# Configuración SUPER_ADMIN
SUPER_ADMIN_ACCESS_CODE=codigo_super_secreto_2024
SUPER_ADMIN_JWT_EXPIRES_IN=8h

# Configuración JWT general
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=1h

# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/cooperativas_db
```

### **Configuración Inicial Recomendada**

```json
{
  "documentosRequeridos": ["DNI", "COMPROBANTE_DOMICILIO", "CUIT"],
  "requiereAprobacionManual": true,
  "tiempoLimiteOnboarding": 30,
  "emailBienvenida": "Bienvenido al sistema...",
  "emailAprobacion": "Su solicitud ha sido aprobada...",
  "emailRechazo": "Su solicitud ha sido rechazada..."
}
```

## 🚨 Consideraciones de Seguridad

### **Para SUPER_ADMIN:**
- Usar credenciales fuertes y únicas
- Configurar el `accessCode` adicional
- Cambiar credenciales periódicamente
- Monitorear logs de acceso
- Limitar acceso físico a las credenciales

### **Para Cooperativas:**
- Validar datos de entrada en solicitudes
- Encriptar comunicaciones sensibles
- Auditar todas las decisiones de aprobación/rechazo
- Implementar límites de tiempo para solicitudes

## 📋 Lista de Verificación

### **Antes de Producción:**
- [ ] Configurar SUPER_ADMIN inicial con script SQL
- [ ] Establecer variables de entorno de seguridad
- [ ] Configurar requisitos de onboarding
- [ ] Probar flujo completo de solicitud
- [ ] Verificar permisos de SUPER_ADMIN
- [ ] Configurar notificaciones por email
- [ ] Establecer políticas de auditoría

### **Para cada Solicitud:**
- [ ] Verificar datos de la cooperativa
- [ ] Validar información del administrador
- [ ] Revisar documentación adjunta
- [ ] Confirmar cumplimiento de requisitos
- [ ] Documentar decisión y motivos
- [ ] Notificar resultado al solicitante

## 🔗 Referencias

- [Documentación de Login SUPER_ADMIN](./SUPER_ADMIN_LOGIN.md)
- [Script de configuración inicial](./scripts/setup-super-admin.sql)
- [Configuración de variables de entorno](/.env.super-admin.example)
- [Tests de integración](./test/super-admin-auth.e2e-spec.ts)

---

**Última actualización:** Octubre 2024  
**Versión:** 1.0  
**Mantenedor:** Sistema de Cooperativas