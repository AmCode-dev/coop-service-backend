# 📋 Configuración de Onboarding para Solicitud de Acceso de Cooperativas

## 🎯 **¿Cómo funciona actualmente?**

Cuando una cooperativa usa el flujo de **"Solicitar Acceso"** (`POST /cooperativas/solicitar-acceso`), se crea automáticamente una **configuración de onboarding específica** que define qué datos debe subir y qué pasos debe completar.

---

## ⚙️ **Configuración Automática Creada**

### **📋 Configuración Base**
```json
{
  "activado": true,
  "requiereAprobacionManual": false,
  "tiempoLimiteOnboarding": 30,
  "requiereValidacionEmail": true,
  "requiereValidacionTelefono": false,
  "crearCuentaAutomatica": true
}
```

### **📝 Pasos Obligatorios**
```json
[
  "DATOS_PERSONALES",
  "DOCUMENTACION",
  "ACEPTACION_TERMINOS"
]
```

### **📄 Documentos Requeridos**
```json
[
  "DNI"
]
```

### **📄 Documentos Opcionales**
```json
[
  "COMPROBANTE_DOMICILIO"
]
```

---

## 🔄 **Proceso Específico para Solicitud de Acceso**

### **📋 Pasos que debe completar la cooperativa:**

```json
[
  "DATOS_PERSONALES",
  "DOCUMENTACION_COOPERATIVA", 
  "DOCUMENTACION_PERSONAL",
  "VERIFICACION_IDENTIDAD",
  "VALIDACION_COOPERATIVA",
  "ACEPTACION_TERMINOS"
]
```

### **⏰ Tiempos y configuración:**
- **Tiempo límite:** 45 días (extendido para cooperativas)
- **Requiere aprobación:** SÍ (manual)
- **Estado inicial:** Cooperativa INACTIVA hasta completar

---

## 📊 **Datos que debe subir la cooperativa**

### **1. Datos Iniciales (en la solicitud)**
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
  }
}
```

### **2. Documentación que debe subir después**

#### **📋 Documentación Personal del Solicitante:**
- **DNI** (obligatorio)
- **Comprobante de domicilio** (opcional)

#### **🏢 Documentación de la Cooperativa:**
- **Acta constitutiva**
- **Estatuto de la cooperativa**
- **Inscripción en INAES**
- **CUIT de la cooperativa**
- **Padrón de socios**
- **Acta de elección de autoridades**

#### **📊 Documentación Financiera/Administrativa:**
- **Balance último ejercicio**
- **Memoria y balance**
- **Certificación de no mora fiscal**

---

## 🔧 **Reglas Automáticas que se Ejecutan**

### **1. Validación de Email**
```json
{
  "nombre": "Validación de Email",
  "tipo": "VALIDACION_DATOS",
  "acciones": [
    "Enviar código de verificación",
    "Marcar como validado"
  ],
  "critica": true
}
```

### **2. Verificación de Identidad**
```json
{
  "nombre": "Verificación de Identidad", 
  "tipo": "VERIFICACION_IDENTIDAD",
  "documentos": ["DNI"],
  "acciones": [
    "Validar documento",
    "Comparar datos"
  ],
  "critica": true
}
```

### **3. Creación de Cuenta Automática**
```json
{
  "nombre": "Creación de Cuenta Automática",
  "tipo": "CREACION_CUENTA",
  "acciones": [
    "Crear usuario administrador",
    "Asignar rol ADMINISTRADOR",
    "Enviar credenciales"
  ],
  "critica": true
}
```

### **4. Notificación de Bienvenida**
```json
{
  "nombre": "Notificación de Bienvenida",
  "tipo": "NOTIFICACION", 
  "acciones": [
    "Enviar email de bienvenida",
    "Usar plantilla bienvenida"
  ],
  "critica": false
}
```

---

## 📱 **Endpoints para subir documentos**

### **Subir documento:**
```http
POST /cooperativas/{cooperativaId}/onboarding/{procesoId}/documentos
Content-Type: multipart/form-data

archivo: [archivo.pdf]
nombre: "Acta Constitutiva"
tipoDocumento: "ACTA_CONSTITUTIVA"
descripcion: "Acta constitutiva de la cooperativa"
esObligatorio: true
```

### **Completar paso:**
```http
POST /cooperativas/{cooperativaId}/onboarding/{procesoId}/completar-paso
Content-Type: application/json

{
  "nombrePaso": "DOCUMENTACION_COOPERATIVA",
  "datos": {
    "documentosSubidos": ["ACTA_CONSTITUTIVA", "ESTATUTO", "INSCRIPCION_INAES"],
    "observaciones": "Documentación completa subida"
  }
}
```

### **Validar email:**
```http
POST /cooperativas/{cooperativaId}/onboarding/{procesoId}/validar-email
Content-Type: application/json

{
  "codigo": "123456"
}
```

---

## ⚖️ **Configuración Personalizable**

### **Un administrador puede modificar la configuración:**

```http
PUT /cooperativas/{cooperativaId}/onboarding/configuracion
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "tiempoLimiteOnboarding": 60,
  "documentosRequeridos": [
    "DNI", 
    "ACTA_CONSTITUTIVA", 
    "ESTATUTO",
    "INSCRIPCION_INAES"
  ],
  "pasosObligatorios": [
    "DATOS_PERSONALES",
    "DOCUMENTACION_COOPERATIVA",
    "DOCUMENTACION_PERSONAL", 
    "VERIFICACION_IDENTIDAD",
    "VALIDACION_COOPERATIVA",
    "VERIFICACION_FINANCIERA",
    "ACEPTACION_TERMINOS"
  ],
  "requiereValidacionTelefono": true,
  "integrarConSistemaContable": true
}
```

---

## 📊 **Estados del Proceso**

### **🔄 Flujo de Estados:**
```
INICIADO → EN_PROGRESO → PENDIENTE_VALIDACION → PENDIENTE_APROBACION → COMPLETADO
```

### **📋 Datos disponibles en cada estado:**

#### **INICIADO:**
- Datos de solicitud inicial
- Código de referencia
- Próximos pasos

#### **EN_PROGRESO:**
- Documentos subidos
- Pasos completados
- Validaciones pendientes

#### **PENDIENTE_VALIDACION:**
- Documentación completa
- En revisión técnica
- Observaciones del equipo

#### **PENDIENTE_APROBACION:**
- Validación técnica completa
- En revisión final
- Decisión pendiente

#### **COMPLETADO:**
- Cooperativa activa
- Usuario administrador creado
- Credenciales enviadas

---

## 🎯 **Resumen de Datos Requeridos**

### **✅ Mínimos para Solicitud:**
1. **Datos de cooperativa** (nombre, CUIT, domicilio, etc.)
2. **Datos del solicitante** (presidente/administrador)
3. **DNI del solicitante**

### **📋 Documentación adicional según configuración:**
1. **Documentación legal** (acta, estatuto, INAES)
2. **Documentación administrativa** (padrón socios, autoridades)
3. **Documentación financiera** (balance, memorias)
4. **Documentación fiscal** (certificaciones, CUIT)

### **⚙️ Completamente configurable:**
- Administradores pueden agregar/quitar documentos requeridos
- Pueden modificar pasos obligatorios
- Pueden configurar validaciones adicionales
- Pueden integrar con sistemas externos

El sistema es **flexible y configurable** para adaptarse a las necesidades específicas de cada tipo de cooperativa y los requisitos regulatorios correspondientes. 🚀