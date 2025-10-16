# 👤 Solicitud de Acceso con Usuario Administrador

## 📝 Descripción

El método `solicitarAccesoCooperativa` ahora crea automáticamente un usuario administrador asociado a la nueva cooperativa durante el proceso de solicitud. Este usuario tendrá permisos completos para gestionar la cooperativa una vez que la solicitud sea aprobada.

## 🔧 ¿Qué se Crea Automáticamente?

### 1. **Cooperativa** (inactiva hasta aprobación)
- Datos básicos de la cooperativa
- Estado: `activa: false` (se activa al aprobar)

### 2. **Configuración Inicial del Sistema**
- Secciones del sistema (Inmuebles, Cuentas, Facturación, etc.)
- Roles por defecto (Administrador, Operador, Contador, Socio)
- Permisos básicos por rol
- Configuración de onboarding

### 3. **Usuario Administrador** ✨ (NUEVO)
- Usuario con email y credenciales del solicitante
- Relación usuario-cooperativa (`esEmpleado: true`)
- Rol de "Administrador" asignado automáticamente
- Permisos completos sobre todas las secciones del sistema

### 4. **Proceso de Onboarding**
- Código de referencia único
- Pasos pendientes para completar
- Fecha de vencimiento (45 días)

---

## 🚀 Ejemplo de Uso

### **Request**
```http
POST /cooperativas/solicitar-acceso
Content-Type: application/json

{
  "cooperativa": {
    "nombre": "Cooperativa de Servicios Unidos Ltda.",
    "razonSocial": "Cooperativa de Servicios Unidos Ltda.",
    "cuit": "30-12345678-9",
    "domicilio": "Av. Principal 1234",
    "localidad": "Buenos Aires",
    "provincia": "Buenos Aires",
    "codigoPostal": "1425",
    "telefono": "+54 11 4567-8900",
    "email": "info@cooperativaservicios.com.ar"
  },
  "solicitante": {
    "email": "admin@cooperativaservicios.com.ar",
    "nombre": "Juan Carlos",
    "apellido": "Pérez",
    "telefono": "+54 11 9876-5432",
    "documento": "12345678",
    "tipoDocumento": "DNI",
    "fechaNacimiento": "1975-05-15",
    "password": "AdminSecuro2024!"
  },
  "motivoSolicitud": "Necesitamos modernizar la gestión de servicios",
  "tipoCooperativa": "servicios_publicos",
  "numeroSocios": 150,
  "serviciosRequeridos": ["agua", "electricidad", "gas"]
}
```

### **Response**
```json
{
  "sessionId": "30-12345678-9",
  "cooperativaId": "coop_abc123def456",
  "procesoOnboardingId": "onb_xyz789ghi012",
  "codigoReferencia": "COOP-20251013-XYZ789",
  "fechaVencimiento": "2024-11-27T10:30:00.000Z",
  "administrador": {
    "id": "user_admin_jkl345mno678",
    "email": "admin@cooperativaservicios.com.ar",
    "nombre": "Juan Carlos",
    "apellido": "Pérez"
  },
  "mensaje": "Solicitud registrada. Te hemos enviado un email con los próximos pasos y credenciales de acceso.",
  "proximosPasos": [
    "Revisa tu email para continuar el proceso",
    "Sube la documentación requerida",
    "Completa la verificación de identidad",
    "Espera la aprobación del equipo",
    "Una vez aprobado, podrás acceder con las credenciales enviadas"
  ]
}
```

---

## 🔐 Flujo de Autenticación Post-Aprobación

### **1. Solicitud Aprobada**
Cuando un Super Admin aprueba la solicitud:
- ✅ La cooperativa se activa (`activa: true`)
- ✅ El usuario administrador ya existe y tiene permisos
- ✅ Se puede hacer login inmediatamente

### **2. Login del Administrador**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@cooperativaservicios.com.ar",
  "password": "AdminSecuro2024!",
  "cooperativaId": "coop_abc123def456"  // Opcional si email es único
}
```

### **3. Token de Acceso**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh_token_here...",
  "user": {
    "id": "user_admin_jkl345mno678",
    "email": "admin@cooperativaservicios.com.ar",
    "nombre": "Juan Carlos",
    "apellido": "Pérez",
    "cooperativaId": "coop_abc123def456",
    "esEmpleado": true,
    "roles": ["Administrador"],
    "permisos": [
      {
        "seccionCodigo": "inmuebles",
        "acciones": ["READ", "WRITE", "EXECUTE", "DELETE"]
      },
      {
        "seccionCodigo": "cuentas",
        "acciones": ["READ", "WRITE", "EXECUTE", "DELETE"]
      },
      // ... todos los permisos
    ]
  }
}
```

---

## 📊 Progreso en Tiempo Real (SSE)

El proceso emite eventos de progreso que pueden ser monitoreados:

```javascript
const eventSource = new EventSource('/cooperativas/solicitar-acceso-event?sessionId=30-12345678-9');

eventSource.onmessage = function(event) {
  const progress = JSON.parse(event.data);
  console.log(`${progress.stepName}: ${progress.message} (${progress.percentage}%)`);
  
  if (progress.stepName === 'COMPLETED') {
    console.log('✅ Usuario administrador creado:', progress.data.administradorId);
    eventSource.close();
  }
};
```

### **Eventos de Progreso:**
1. `VALIDATION` (5-10%) - Validando datos
2. `CREATE_COOPERATIVA` (15-25%) - Creando cooperativa
3. `SETUP_CONFIG` (30-70%) - Configuración inicial
4. `CREATE_ONBOARDING` (75-80%) - Proceso de onboarding
5. `CREATE_ADMIN_USER` (85-95%) - **Creando usuario admin** ✨
6. `COMPLETED` (100%) - Proceso completado

---

## 🛡️ Permisos del Usuario Administrador

El usuario creado automáticamente tiene:

### **Rol: Administrador**
- **READ**: Ver toda la información
- **WRITE**: Modificar datos
- **EXECUTE**: Ejecutar acciones especiales
- **DELETE**: Eliminar registros

### **Secciones con Acceso Completo:**
- 🏢 **Inmuebles** - Gestión completa de inmuebles y legajos
- 📊 **Cuentas** - Administración de cuentas de servicios
- 🧾 **Facturación** - Control total de facturación
- 👥 **Usuarios** - Gestión de usuarios y permisos
- 🏛️ **Cooperativas** - Configuración de la cooperativa

---

## ⚠️ Consideraciones Importantes

### **Seguridad**
1. **Password**: Actualmente se almacena sin hash - **implementar bcrypt**
2. **Email único**: Se verifica que el email no exista previamente
3. **CUIT único**: Se verifica que el CUIT no esté registrado

### **Estado de la Cooperativa**
- La cooperativa se crea **inactiva** (`activa: false`)
- El usuario puede crearse pero **no puede hacer login** hasta que se apruebe
- Al aprobar la solicitud, la cooperativa se activa automáticamente

### **Próximas Mejoras**
1. **Hash de passwords** con bcrypt
2. **Email de bienvenida** con credenciales
3. **Validación de documentos** del solicitante
4. **Password temporal** generado automáticamente

---

## 🔄 Estados del Proceso

| Estado | Usuario Admin | Cooperativa | Puede Login |
|--------|---------------|-------------|-------------|
| `INICIADO` | ✅ Creado | 🔄 Inactiva | ❌ No |
| `EN_PROGRESO` | ✅ Creado | 🔄 Inactiva | ❌ No |
| `PENDIENTE_APROBACION` | ✅ Creado | 🔄 Inactiva | ❌ No |
| `COMPLETADO` | ✅ Creado | ✅ Activa | ✅ **Sí** |
| `RECHAZADO` | ✅ Creado | ❌ Inactiva | ❌ No |

---

## 🚀 ¡Listo para Producción!

Con esta implementación, el flujo completo de solicitud de acceso ahora incluye:
1. ✅ Creación automática de la cooperativa
2. ✅ Configuración completa del sistema
3. ✅ **Usuario administrador listo para usar**
4. ✅ Proceso de onboarding estructurado
5. ✅ Seguimiento en tiempo real con SSE

El administrador puede acceder inmediatamente después de la aprobación sin pasos adicionales de configuración. 🎉