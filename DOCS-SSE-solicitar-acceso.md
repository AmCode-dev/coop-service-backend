# 🚀 ENDPOINT SSE: solicitar-acceso-event

## 📝 Descripción
Este endpoint combina la funcionalidad de crear una cooperativa con eventos en tiempo real usando Server-Sent Events (SSE).

## 🔗 URL del Endpoint
```
GET /cooperativas/solicitar-acceso-event?data={base64EncodedData}
```

## 📦 Preparar los datos

### 1. **Datos de la solicitud (JSON):**
```json
{
  "cooperativa": {
    "nombre": "Cooperativa San Martín",
    "razonSocial": "Cooperativa San Martín Ltda.",
    "cuit": "30-12345678-9",
    "domicilio": "Av. Principal 123",
    "localidad": "Buenos Aires",
    "provincia": "Buenos Aires",
    "codigoPostal": "1000"
  },
  "solicitante": {
    "email": "admin@sanmartin.coop",
    "nombre": "Juan",
    "apellido": "Pérez",
    "documento": "12345678"
  }
}
```

### 2. **Convertir a Base64:**
```javascript
// En JavaScript (navegador o Node.js)
const data = { /* objeto de arriba */ };
const jsonString = JSON.stringify(data);
const base64Data = btoa(jsonString); // En navegador
// O en Node.js: Buffer.from(jsonString).toString('base64')
```

### 3. **Base64 generado para el ejemplo:**
```
eyJjb29wZXJhdGl2YSI6eyJub21icmUiOiJDb29wZXJhdGl2YSBTYW4gTWFydMOtbiIsInJhem9uU29jaWFsIjoiQ29vcGVyYXRpdmEgU2FuIE1hcnTDrW4gTHRkYS4iLCJjdWl0IjoiMzAtMTIzNDU2NzgtOSIsImRvbWljaWxpbyI6IkF2LiBQcmluY2lwYWwgMTIzIiwibG9jYWxpZGFkIjoiQnVlbm9zIEFpcmVzIiwicHJvdmluY2lhIjoiQnVlbm9zIEFpcmVzIiwiY29kaWdvUG9zdGFsIjoiMTAwMCJ9LCJzb2xpY2l0YW50ZSI6eyJlbWFpbCI6ImFkbWluQHNhbm1hcnRpbi5jb29wIiwibm9tYnJlIjoiSnVhbiIsImFwZWxsaWRvIjoiUMOpcmV6IiwiZG9jdW1lbnRvIjoiMTIzNDU2NzgifX0=
```

## 🧪 Testing en Postman

### **Configuración de la petición:**
```
Método: GET
URL: http://localhost:3000/cooperativas/solicitar-acceso-event?data=eyJjb29wZXJhdGl2YSI6eyJub21icmUiOiJDb29wZXJhdGl2YSBTYW4gTWFydMOtbiIsInJhem9uU29jaWFsIjoiQ29vcGVyYXRpdmEgU2FuIE1hcnTDrW4gTHRkYS4iLCJjdWl0IjoiMzAtMTIzNDU2NzgtOSIsImRvbWljaWxpbyI6IkF2LiBQcmluY2lwYWwgMTIzIiwibG9jYWxpZGFkIjoiQnVlbm9zIEFpcmVzIiwicHJvdmluY2lhIjoiQnVlbm9zIEFpcmVzIiwiY29kaWdvUG9zdGFsIjoiMTAwMCJ9LCJzb2xpY2l0YW50ZSI6eyJlbWFpbCI6ImFkbWluQHNhbm1hcnRpbi5jb29wIiwibm9tYnJlIjoiSnVhbiIsImFwZWxsaWRvIjoiUMOpcmV6IiwiZG9jdW1lbnRvIjoiMTIzNDU2NzgifX0=

Headers:
Accept: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

### **En Postman - Pasos:**
1. Crear nueva petición GET
2. Pegar la URL completa con el parámetro data
3. En Headers agregar:
   - `Accept: text/event-stream`
   - `Cache-Control: no-cache`
4. En Settings (⚙️):
   - Desactivar "Automatically follow redirects"
   - Poner Request timeout en 0 (sin timeout)
5. Hacer clic en "Send"

## 📨 Eventos que recibirás

### **1. Evento de inicio:**
```
data: {"sessionId":"30-12345678-9","step":"INICIADO","message":"Iniciando proceso de solicitud de acceso...","progress":0,"status":"info","data":{"cuit":"30-12345678-9"}}
```

### **2. Eventos de progreso interno:**
```
data: {"sessionId":"30-12345678-9","step":"VALIDATION","message":"Validando datos de entrada...","progress":5,"status":"info"}

data: {"sessionId":"30-12345678-9","step":"CREATE_COOPERATIVA","message":"Creando cooperativa...","progress":20,"status":"success"}

data: {"sessionId":"30-12345678-9","step":"CREATE_SECTIONS","message":"Creando secciones del sistema...","progress":40,"status":"info"}

data: {"sessionId":"30-12345678-9","step":"CREATE_ROLES","message":"Configurando roles y permisos...","progress":60,"status":"info"}

data: {"sessionId":"30-12345678-9","step":"CREATE_ONBOARDING_CONFIG","message":"Configurando onboarding...","progress":70,"status":"success"}

data: {"sessionId":"30-12345678-9","step":"CREATE_ONBOARDING","message":"Proceso de onboarding configurado","progress":90,"status":"success"}

data: {"sessionId":"30-12345678-9","step":"COMPLETED","message":"Solicitud registrada exitosamente","progress":100,"status":"success"}
```

### **3. Evento de finalización del proceso:**
```
data: {"sessionId":"30-12345678-9","step":"PROCESO_COMPLETADO","message":"Solicitud de acceso procesada exitosamente","progress":100,"status":"success","data":{"sessionId":"30-12345678-9","cooperativaId":"uuid-generado","procesoOnboardingId":"uuid-proceso","codigoReferencia":"COOP-20251011-ABC123","fechaVencimiento":"2025-11-25T...","mensaje":"Solicitud registrada..."}}
```

### **4. Evento de cierre del stream:**
```
data: {"sessionId":"30-12345678-9","step":"STREAM_COMPLETE","message":"Stream finalizado exitosamente","progress":100,"status":"success","data":{...}}
```

## 🧪 Testing con curl

```bash
curl -N -H "Accept: text/event-stream" \
     -H "Cache-Control: no-cache" \
     "http://localhost:3000/cooperativas/solicitar-acceso-event?data=eyJjb29wZXJhdGl2YSI6eyJub21icmUiOiJDb29wZXJhdGl2YSBTYW4gTWFydMOtbiIsInJhem9uU29jaWFsIjoiQ29vcGVyYXRpdmEgU2FuIE1hcnTDrW4gTHRkYS4iLCJjdWl0IjoiMzAtMTIzNDU2NzgtOSIsImRvbWljaWxpbyI6IkF2LiBQcmluY2lwYWwgMTIzIiwibG9jYWxpZGFkIjoiQnVlbm9zIEFpcmVzIiwicHJvdmluY2lhIjoiQnVlbm9zIEFpcmVzIiwiY29kaWdvUG9zdGFsIjoiMTAwMCJ9LCJzb2xpY2l0YW50ZSI6eyJlbWFpbCI6ImFkbWluQHNhbm1hcnRpbi5jb29wIiwibm9tYnJlIjoiSnVhbiIsImFwZWxsaWRvIjoiUMOpcmV6IiwiZG9jdW1lbnRvIjoiMTIzNDU2NzgifX0="
```

## 🌐 Testing con el HTML de ejemplo

1. Abre `ejemplo-sse-solicitar-acceso.html` en el navegador
2. Llena los datos del formulario
3. Haz clic en "📡 Conectar SSE y Procesar"
4. Observa los eventos en tiempo real

## 💡 Ventajas de este endpoint

1. **📡 Una sola conexión:** Todo el proceso se maneja en una sola conexión SSE
2. **🔄 Tiempo real:** Ver progreso paso a paso sin polling
3. **📊 Progreso detallado:** Cada paso del proceso interno es visible
4. **🎯 Fácil testing:** Una sola URL con datos codificados
5. **🔌 Auto-cierre:** El stream se cierra automáticamente al completar

## ⚠️ Notas importantes

- El `sessionId` es el CUIT de la cooperativa
- Los datos deben estar en Base64 válido
- La conexión se cierra automáticamente al completar el proceso
- Si hay error en la decodificación, se retorna un evento de error
- Todos los eventos de progreso interno se propagan al stream principal