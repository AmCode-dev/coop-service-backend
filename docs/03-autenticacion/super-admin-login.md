# Login Especial para SUPER_ADMIN

## 🔐 Descripción

El sistema cuenta con un endpoint de autenticación especial diseñado exclusivamente para usuarios SUPER_ADMIN, que proporciona acceso global al sistema y permisos elevados para gestionar todas las cooperativas y configuraciones del sistema.

## 🎯 Características Especiales

### 1. **Autenticación Reforzada**
- **Endpoint dedicado**: `POST /auth/super-admin/login`
- **Código de acceso adicional**: Opcional mediante variable de entorno
- **Validación de roles**: Verificación automática de permisos SUPER_ADMIN
- **Sesión extendida**: Token con duración de 8 horas por defecto

### 2. **Permisos Globales**
- **Acceso a todas las cooperativas**: Sin restricciones de tenant
- **Gestión de onboarding**: Control total del proceso de alta de cooperativas
- **Administración de usuarios**: Crear, modificar y gestionar usuarios del sistema
- **Configuración del sistema**: Acceso a configuraciones globales

### 3. **Seguridad Mejorada**
- **Identificación en sesiones**: Las sesiones se marcan como "SUPER_ADMIN"
- **Auditoría extendida**: Logging específico para acciones de SUPER_ADMIN
- **Tokens extendidos**: Mayor tiempo de vida para evitar interrupciones
- **Verificación múltiple**: Email, contraseña y código de acceso opcional

## 🚀 Uso del Endpoint

### Request

```http
POST /auth/super-admin/login
Content-Type: application/json

{
  "email": "superadmin@sistema.com",
  "password": "password_seguro",
  "accessCode": "CODIGO_OPCIONAL"  // Solo si está configurado en env
}
```

### Response Exitosa

```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_string",
  "user": {
    "id": "user_id",
    "email": "superadmin@sistema.com",
    "nombre": "Super",
    "apellido": "Admin",
    "isSuperAdmin": true
  },
  "permissions": [
    "SYSTEM_GLOBAL_ACCESS",
    "COOPERATIVAS_MANAGEMENT",
    "ONBOARDING_MANAGEMENT",
    "USER_MANAGEMENT",
    "CUENTAS",
    "FACTURACION",
    "PAGOS",
    "USUARIOS",
    "..."
  ],
  "expiresIn": 28800,      // 8 horas en segundos
  "refreshExpiresIn": 2592000  // 30 días en segundos
}
```

### Response de Error

```json
{
  "statusCode": 401,
  "message": "Credenciales de SUPER_ADMIN inválidas",
  "error": "Unauthorized"
}
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# Código de acceso adicional (opcional)
SUPER_ADMIN_ACCESS_CODE=mi_codigo_super_secreto

# Tiempo de vida del token de SUPER_ADMIN (opcional, default: 8h)
SUPER_ADMIN_JWT_EXPIRES_IN=8h

# Secret para JWT (requerido)
JWT_SECRET=mi_secret_muy_seguro
```

### Requisitos para ser SUPER_ADMIN

Para que un usuario pueda usar este endpoint debe cumplir:

1. **Usuario activo**: `activo = true`
2. **Es empleado**: `esEmpleado = true`
3. **Cooperativa activa**: La cooperativa del usuario debe estar activa
4. **Rol apropiado**: Debe tener uno de estos:
   - Rol con nombre `SUPER_ADMIN`
   - Rol del sistema (`esSistema = true`)
   - Rol con permisos en sección `SYSTEM`

## 🛡️ Seguridad

### Mejores Prácticas

1. **Variables de entorno seguras**: Mantener secretos en `.env` y nunca en código
2. **Rotación de códigos**: Cambiar `SUPER_ADMIN_ACCESS_CODE` periódicamente
3. **Auditoría**: Monitorear todos los logins de SUPER_ADMIN
4. **Acceso restringido**: Limitar físicamente quién puede acceder a estas credenciales
5. **Tiempo de vida**: Configurar tiempos de token apropiados para el entorno

### Diferencias con Login Normal

| Característica | Login Normal | SUPER_ADMIN Login |
|---------------|--------------|-------------------|
| **Endpoint** | `/auth/login` | `/auth/super-admin/login` |
| **Verificación** | Email + Password | Email + Password + Código opcional |
| **Duración Token** | 1 hora | 8 horas |
| **Permisos** | Limitados a cooperativa | Globales del sistema |
| **Auditoría** | Estándar | Marcado como SUPER_ADMIN |
| **Roles en JWT** | Roles del usuario | SUPER_ADMIN + roles del usuario |

## 🔧 Uso en el Frontend

### Ejemplo de implementación

```typescript
interface SuperAdminLoginData {
  email: string;
  password: string;
  accessCode?: string;
}

async function superAdminLogin(data: SuperAdminLoginData) {
  try {
    const response = await fetch('/auth/super-admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Login de SUPER_ADMIN falló');
    }

    const result = await response.json();
    
    // Guardar token con indicador especial
    localStorage.setItem('access_token', result.accessToken);
    localStorage.setItem('refresh_token', result.refreshToken);
    localStorage.setItem('is_super_admin', 'true');
    localStorage.setItem('super_admin_permissions', JSON.stringify(result.permissions));

    return result;
  } catch (error) {
    console.error('Error en login de SUPER_ADMIN:', error);
    throw error;
  }
}
```

## 📋 Casos de Uso

### 1. **Gestión de Cooperativas Pendientes**
```http
GET /cooperativas/solicitudes-pendientes
Authorization: Bearer {super_admin_token}
```

### 2. **Aprobación de Solicitudes**
```http
POST /cooperativas/decidir-solicitud/REF-123456
Authorization: Bearer {super_admin_token}
Content-Type: application/json

{
  "aprobado": true,
  "observaciones": "Documentación completa y verificada"
}
```

### 3. **Configuración de Onboarding Global**
```http
PUT /cooperativas/configuracion-onboarding
Authorization: Bearer {super_admin_token}
Content-Type: application/json

{
  "documentosRequeridos": ["DNI", "COMPROBANTE_DOMICILIO", "CUIT"],
  "requiereAprobacionManual": true
}
```

## 🚨 Consideraciones Importantes

1. **Uso responsable**: Este endpoint da acceso total al sistema
2. **Logging obligatorio**: Todas las acciones deben ser auditadas
3. **Credenciales seguras**: Usar contraseñas fuertes y MFA cuando sea posible
4. **Acceso limitado**: Solo personal autorizado debe conocer estas credenciales
5. **Monitoreo continuo**: Implementar alertas para actividad inusual

## 🔄 Flujo de Trabajo Recomendado

1. **Login con SUPER_ADMIN**: Usar endpoint especial
2. **Verificar permisos**: Confirmar rol en respuesta
3. **Realizar acciones**: Gestionar cooperativas y configuraciones
4. **Logout seguro**: Cerrar sesión al finalizar
5. **Auditoría**: Revisar logs de actividad periódicamente

---

Este sistema proporciona un acceso controlado pero potente para la administración global del sistema, manteniendo la seguridad y trazabilidad necesarias para un entorno de producción.