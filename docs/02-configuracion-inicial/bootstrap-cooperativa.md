# 🚀 Bootstrap de Cooperativa - Guía de Implementación

## 📋 **Problema Resuelto**

**¿Cómo crear la primera cooperativa si necesitas roles para crear cooperativas?**

El sistema ahora incluye **endpoints públicos especiales** para el bootstrap inicial que permiten crear una cooperativa junto con su usuario administrador **sin requerir autenticación previa**.

---

## 🔧 **Endpoints Disponibles**

### 1. **Verificar CUIT Disponible** (Público)

```http
GET /cooperativas/verificar-cuit/{cuit}
Content-Type: application/json
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/cooperativas/verificar-cuit/30-12345678-9"
```

**Respuesta:**
```json
{
  "success": true,
  "existe": false,
  "message": "CUIT disponible"
}
```

---

### 2. **Bootstrap Cooperativa + Admin** (Público - Directo)

```http
POST /cooperativas/bootstrap
Content-Type: application/json
```

**Para cooperativas que quieren acceso inmediato sin proceso de validación.**

**Body requerido:**
```json
{
  "cooperativa": {
    "nombre": "Cooperativa San Martín",
    "razonSocial": "Cooperativa San Martín Limitada",
    "cuit": "30-12345678-9",
    "domicilio": "Av. San Martín 1234",
    "localidad": "Córdoba",
    "provincia": "Córdoba",
    "codigoPostal": "5000",
    "telefono": "+54351123456",
    "email": "info@coopsanmartin.com",
    "logo": "https://ejemplo.com/logo.png"
  },
  "administrador": {
    "email": "admin@coopsanmartin.com",
    "password": "password123",
    "nombre": "Juan Carlos",
    "apellido": "Pérez",
    "telefono": "+54351123456"
  }
}
```

---

### 3. **Solicitar Acceso con Onboarding** (Público - Con Validación)

```http
POST /cooperativas/solicitar-acceso
Content-Type: application/json
```

**Para cooperativas que prefieren el proceso completo de validación y onboarding.**

**Body requerido:**
```json
{
  "cooperativa": {
    "nombre": "Cooperativa Nueva",
    "razonSocial": "Cooperativa Nueva Limitada",
    "cuit": "30-98765432-1",
    "domicilio": "Calle Nueva 456",
    "localidad": "Rosario",
    "provincia": "Santa Fe", 
    "codigoPostal": "2000",
    "telefono": "+54341987654",
    "email": "info@coopnueva.com"
  },
  "solicitante": {
    "email": "presidente@coopnueva.com",
    "nombre": "María Elena",
    "apellido": "González",
    "telefono": "+54341987654",
    "documento": "87654321",
    "tipoDocumento": "DNI",
    "fechaNacimiento": "1975-03-20"
  },
  "motivoSolicitud": "Digitalización de procesos cooperativos",
  "tipoCooperativa": "Servicios Públicos",
  "numeroSocios": 1500,
  "serviciosRequeridos": ["agua", "luz", "internet"]
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "cooperativaId": "cm2grz789...",
    "procesoOnboardingId": "cm2grz012...",
    "codigoReferencia": "COOP-20241009-ABC123",
    "fechaVencimiento": "2024-11-23T21:00:00.000Z",
    "mensaje": "Solicitud registrada. Te hemos enviado un email con los próximos pasos.",
    "proximosPasos": [
      "Revisa tu email para continuar el proceso",
      "Sube la documentación requerida",
      "Completa la verificación de identidad",
      "Espera la aprobación del equipo"
    ]
  },
  "message": "Solicitud de acceso iniciada. Revisa tu email para continuar el proceso."
}
```

---

### 4. **Consultar Estado de Solicitud** (Público)

```http
GET /cooperativas/solicitud-acceso/{codigoReferencia}
Content-Type: application/json
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/cooperativas/solicitud-acceso/COOP-20241009-ABC123"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "solicitud": {
      "codigoReferencia": "COOP-20241009-ABC123",
      "estado": "EN_PROGRESO",
      "fechaCreacion": "2024-10-09T21:00:00.000Z",
      "fechaVencimiento": "2024-11-23T21:00:00.000Z"
    },
    "cooperativa": {
      "nombre": "Cooperativa Nueva",
      "cuit": "30-98765432-1",
      "activa": false
    },
    "solicitante": {
      "nombre": "María Elena",
      "apellido": "González",
      "email": "presidente@coopnueva.com"
    },
    "mensaje": "Tu solicitud está en progreso. Continúa completando la documentación.",
    "siguientesPasos": [
      "Sube todos los documentos requeridos",
      "Completa la verificación de identidad",
      "Acepta los términos y condiciones"
    ]
  }
}
```

**Ejemplo con curl:**
```bash
curl -X POST "http://localhost:3000/cooperativas/bootstrap" \
  -H "Content-Type: application/json" \
  -d '{
    "cooperativa": {
      "nombre": "Mi Cooperativa",
      "razonSocial": "Mi Cooperativa Limitada",
      "cuit": "30-87654321-9",
      "domicilio": "Calle Falsa 123",
      "localidad": "Ciudad",
      "provincia": "Provincia",
      "codigoPostal": "1000"
    },
    "administrador": {
      "email": "admin@micooperativa.com",
      "password": "admin123",
      "nombre": "Admin",
      "apellido": "Usuario"
    }
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "cooperativa": {
      "id": "cm2grz123...",
      "nombre": "Mi Cooperativa",
      "cuit": "30-87654321-9"
    },
    "administrador": {
      "id": "cm2grz456...",
      "email": "admin@micooperativa.com",
      "nombre": "Admin",
      "apellido": "Usuario"
    },
    "mensaje": "Sistema configurado correctamente. Ya puedes iniciar sesión."
  },
  "message": "Cooperativa y administrador creados exitosamente"
}
```

---

## 🎯 **¿Qué se crea automáticamente?**

El endpoint `POST /cooperativas/bootstrap` realiza una **configuración completa** del sistema:

### ✅ **Cooperativa**
- Registro de la cooperativa con todos los datos
- Validación de CUIT único

### ✅ **Usuario Administrador**
- Usuario con rol de "Administrador"
- Email único validado
- Permisos completos sobre la cooperativa

### ✅ **Configuración Inicial**
1. **Secciones del sistema:**
   - Inmuebles
   - Cuentas
   - Facturación
   - Usuarios
   - Cooperativas

2. **Roles por defecto:**
   - **Administrador** (acceso total)
   - **Operador** (gestión operativa)
   - **Contador** (facturación y reportes)
   - **Socio** (acceso limitado)

3. **Permisos por rol:**
   - Administrador: READ, WRITE, EXECUTE, DELETE
   - Operador: READ, WRITE, EXECUTE
   - Contador: READ, WRITE
   - Socio: READ

4. **Configuración de Onboarding:**
   - Activado por defecto
   - Sin aprobación manual requerida
   - 30 días límite para completar
   - Validación de email activada
   - Creación automática de cuentas

---

## 🔐 **Dos Flujos Disponibles**

### **🚀 Flujo 1: Bootstrap Directo**
**Para cooperativas que quieren acceso inmediato**

```
1. POST /cooperativas/bootstrap → Crea cooperativa + admin ✅
2. Login inmediato → Sistema listo para usar
```

**Características:**
- ✅ **Acceso inmediato** al sistema
- ✅ **Sin validación manual** requerida  
- ✅ **Cooperativa activa** desde el primer momento
- ⚠️ **Responsabilidad del solicitante** validar datos

---

### **📋 Flujo 2: Solicitud con Onboarding**
**Para cooperativas que prefieren proceso completo de validación**

```
1. POST /cooperativas/solicitar-acceso → Inicia proceso de validación
2. GET /cooperativas/solicitud-acceso/{codigo} → Consultar progreso
3. Completar proceso de onboarding existente:
   - POST /cooperativas/{id}/onboarding/{procesoId}/documentos
   - POST /cooperativas/{id}/onboarding/{procesoId}/validar-email
   - POST /cooperativas/{id}/onboarding/{procesoId}/completar-paso
4. Aprobación por parte del equipo
5. Activación de cooperativa y acceso al sistema
```

**Características:**
- 🔍 **Validación completa** de documentación
- 👥 **Revisión manual** por equipo especializado
- 📋 **Proceso paso a paso** con seguimiento
- 🏢 **Cooperativa inactiva** hasta completar validación
- ✅ **Mayor seguridad** y compliance

---

## 🎯 **¿Cuál elegir?**

### **Bootstrap Directo cuando:**
- ✅ Eres una cooperativa establecida con documentación en orden
- ✅ Necesitas acceso inmediato al sistema
- ✅ Tienes confianza en la validez de tus datos
- ✅ Quieres simplificar el proceso de alta

### **Solicitud con Onboarding cuando:**
- 🔍 Prefieres que validen tu documentación
- 📋 Quieres seguir un proceso formal y documentado
- 👥 Necesitas aprobación oficial antes de operar
- 🏢 Tu organización requiere procesos de compliance estrictos

---

## 🚨 **Consideraciones de Seguridad**

### **Para Desarrollo:**
- ✅ Los endpoints bootstrap están disponibles públicamente
- ✅ Permiten crear la primera cooperativa sin autenticación

### **Para Producción:**
Recomendamos implementar una de estas estrategias:

#### **Opción 1: Desactivar después del primer uso**
```typescript
// Agregar validación en el bootstrap
const cooperativasExistentes = await this.prisma.cooperativa.count();
if (cooperativasExistentes > 0) {
  throw new BadRequestException('El sistema ya está inicializado');
}
```

#### **Opción 2: Proteger con API Key**
```typescript
// Requerir header especial
@Headers('x-bootstrap-key') bootstrapKey: string
if (bootstrapKey !== process.env.BOOTSTRAP_API_KEY) {
  throw new UnauthorizedException('Bootstrap key inválida');
}
```

#### **Opción 3: Solo en entorno desarrollo**
```typescript
// Solo disponible en desarrollo
if (process.env.NODE_ENV === 'production') {
  throw new BadRequestException('Bootstrap no disponible en producción');
}
```

---

## 📱 **Integración con Frontend**

### **React/Vue/Angular ejemplo:**

```javascript
// 1. Verificar CUIT
const verificarCuit = async (cuit) => {
  const response = await fetch(`/api/cooperativas/verificar-cuit/${cuit}`);
  const data = await response.json();
  return data.existe;
};

// 2. Crear cooperativa
const crearCooperativa = async (datos) => {
  const response = await fetch('/api/cooperativas/bootstrap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos),
  });
  
  if (!response.ok) {
    throw new Error('Error al crear cooperativa');
  }
  
  return await response.json();
};

// 3. Login automático después del bootstrap
const loginDespuesBootstrap = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.accessToken);
  return data;
};
```

---

## ✅ **Casos de Uso Resueltos**

### ✅ **Nueva Cooperativa desde Cero (Bootstrap Directo)**
- Una cooperativa nueva puede registrarse sin tener usuarios existentes
- Se crea automáticamente el primer administrador
- El sistema queda listo para usar inmediatamente

### ✅ **Nueva Cooperativa con Validación (Solicitud de Acceso)**
- Una cooperativa puede solicitar acceso a través de proceso completo
- Validación de documentación por parte del equipo
- Proceso guiado paso a paso con seguimiento
- Activación después de aprobación

### ✅ **Socios de Cooperativa Existente (Onboarding Regular)**
- Una vez activa la cooperativa, los nuevos socios usan:
- `POST /cooperativas/{id}/onboarding` → Proceso de alta regular
- Configuración personalizable según la cooperativa

### ✅ **Desarrollo y Testing**
- Los desarrolladores pueden crear cooperativas de prueba fácilmente
- Ambos flujos disponibles para diferentes escenarios de test
- No se requiere seed de base de datos manual

### ✅ **Deploy Fresh**
- En un deploy nuevo, el primer cliente puede registrarse sin intervención manual
- Dos opciones: directo o con validación
- El proceso es completamente automatizado

---

## 🎉 **Resumen**

**Antes:** ❌ Necesitabas roles para crear cooperativas → Deadlock

**Ahora:** ✅ **Dos flujos completos disponibles:**

### **🚀 Flujo Bootstrap (Directo)**
```
POST /cooperativas/bootstrap → Sistema listo inmediatamente
```

### **📋 Flujo Solicitud (Con Validación)**
```
1. POST /cooperativas/solicitar-acceso → Inicia proceso
2. GET /cooperativas/solicitud-acceso/{codigo} → Seguimiento
3. Proceso de onboarding completo → Validación
4. Aprobación → Sistema activo
```

**Ambos flujos:**
- ✅ Resuelven el problema del "huevo y la gallina"
- ✅ No requieren autenticación previa
- ✅ Configuran automáticamente todo el sistema
- ✅ Proporcionan experiencia moderna y automatizada

¡El sistema ahora soporta tanto **acceso inmediato** como **validación completa** según las necesidades de cada cooperativa! 🚀