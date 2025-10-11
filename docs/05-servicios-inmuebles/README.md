# 🏠 05. Servicios e Inmuebles

Gestión completa de propiedades, servicios y medición de consumos.

## 📋 **Orden de Lectura Recomendado**

### 1. **inmuebles-module.md** 🏗️
- **¿Qué es?** Sistema de gestión de propiedades e inmuebles
- **¿Para quién?** Administradores y empleados técnicos
- **¿Cuándo usar?** Al registrar nuevas propiedades
- **Contenido clave:**
  - Registro de inmuebles
  - Vinculación con titulares
  - Gestión de direcciones
  - Transferencias de titularidad

### 2. **modulo-medidores.md** ⚡
- **¿Qué es?** Sistema de medidores y lectura de consumos
- **¿Para quién?** Personal técnico y operadores
- **¿Cuándo usar?** Para gestionar medición de servicios
- **Contenido clave:**
  - Instalación de medidores
  - Registro de lecturas
  - Cálculo de consumos
  - Detección de anomalías

---

## 🎯 **Conceptos Clave**

### **Jerarquía del Sistema**
```
Cooperativa
    ↓
Inmueble (Propiedad)
    ↓
Cuenta de Servicio
    ↓
Medidor
    ↓
Lecturas/Consumos
```

### **Tipos de Servicios**
- ⚡ **Energía Eléctrica**
- 💧 **Agua Potable** 
- 🌐 **Internet/Cable**
- 🔥 **Gas Natural**
- 📞 **Telefonía**
- 🗑️ **Recolección de Residuos**

---

## 🏠 **Gestión de Inmuebles**

### **Registro de Nueva Propiedad**
```http
POST /inmuebles
{
  "domicilio": "Av. San Martín 1234",
  "localidad": "Buenos Aires", 
  "provincia": "CABA",
  "codigoPostal": "1425",
  "titularInmuebleId": "uuid-persona",
  "numeroLote": "123",
  "numeroManzana": "45"
}
```

### **Transferencia de Titularidad**
```http
POST /inmuebles/123/transferir
{
  "nuevoTitularId": "uuid-nueva-persona",
  "fechaTransferencia": "2024-01-15",
  "motivoTransferencia": "VENTA",
  "observaciones": "Transferencia por venta"
}
```

### **Estados del Inmueble**
- ✅ **ACTIVO** - En servicio normal
- 🔧 **EN_MANTENIMIENTO** - Trabajos en curso
- ⏸️ **SUSPENDIDO** - Servicios suspendidos
- ❌ **DADO_DE_BAJA** - Fuera de servicio

---

## ⚡ **Sistema de Medidores**

### **Instalación de Medidor**
```http
POST /medidores
{
  "numeroMedidor": "ABC123456",
  "tipoMedidor": "ELECTRICO_MONOFASICO",
  "inmuebleId": "uuid-inmueble",
  "fechaInstalacion": "2024-01-01",
  "estadoInicial": 0
}
```

### **Registro de Lectura**
```http
POST /medidores/123/lecturas
{
  "valor": 1250.5,
  "fechaLectura": "2024-01-31",
  "mes": 1,
  "anio": 2024,
  "tomadoPorId": "uuid-empleado",
  "observaciones": "Lectura normal"
}
```

### **Cálculo Automático**
- 📊 **Consumo**: Lectura actual - Lectura anterior
- 💰 **Costo**: Consumo × Tarifa vigente
- 📈 **Estadísticas**: Promedios y tendencias
- ⚠️ **Alertas**: Consumos anómalos

---

## 📊 **Casos de Uso Comunes**

### **👨‍🔧 Para Personal Técnico**

#### **Tomar Lecturas Masivas**
```http
POST /lecturas/masiva
{
  "zona": "CENTRO",
  "mes": 1,
  "anio": 2024,
  "lecturas": [
    {"medidorId": "m1", "valor": 1250.5},
    {"medidorId": "m2", "valor": 890.3}
  ]
}
```

#### **Detectar Anomalías**
```http
GET /medidores/anomalias?tipo=CONSUMO_ALTO&periodo=2024-01
```

#### **Programar Mantenimiento**
```http
POST /operaciones
{
  "tipo": "MANTENIMIENTO_MEDIDOR",
  "medidorId": "uuid-medidor",
  "fechaProgramada": "2024-02-15",
  "descripcion": "Revisión preventiva"
}
```

### **📊 Para Administradores**

#### **Reportes de Consumo**
```http
GET /reportes/consumo?periodo=2024-01&zona=CENTRO
```

#### **Estadísticas por Servicio**
```http
GET /servicios/estadisticas?servicio=AGUA&mes=1&anio=2024
```

#### **Inmuebles sin Medidor**
```http
GET /inmuebles?sinMedidor=true&servicio=ENERGIA
```

---

## 🔍 **Funcionalidades Avanzadas**

### **Gestión de Zonas**
- 🗺️ **Zonificación**: Organización geográfica
- 👨‍🔧 **Asignación**: Personal por zona
- 📅 **Cronogramas**: Rutas de lectura
- 📊 **Estadísticas**: Rendimiento por zona

### **Tipos de Medidores**
- ⚡ **Eléctricos**: Monofásicos, trifásicos
- 💧 **Agua**: Volumétricos, velocidad
- 🌐 **Internet**: Ancho de banda
- 🔥 **Gas**: Diafragma, turbina

### **Validaciones Automáticas**
- 📈 **Consumos Lógicos**: No negativos
- ⚠️ **Alertas Automáticas**: Consumos altos
- 🔄 **Lectura Consecutiva**: Secuencia temporal
- 🎯 **Precisión**: Decimales apropiados

---

## 📱 **Integración con Mobile**

### **App para Lecturas**
```typescript
// Escaneo de código QR del medidor
const medidor = await scanQR();

// Registro rápido de lectura
await registrarLectura({
  medidorId: medidor.id,
  valor: inputValue,
  geolocalizacion: getCurrentLocation(),
  foto: capturedImage
});
```

### **Sincronización Offline**
- 📱 Trabajo sin conexión
- 🔄 Sincronización automática
- 📷 Fotos como evidencia
- 📍 Geolocalización

---

## 📊 **Reportes Disponibles**

### **Operativos**
- 📋 Lecturas pendientes por zona
- ⚡ Consumos por medidor
- 📈 Tendencias de consumo
- 🔧 Medidores que requieren mantenimiento

### **Gerenciales**
- 💰 Facturación por servicio
- 📊 Estadísticas de consumo
- 🎯 Eficiencia del servicio
- 📈 Crecimiento de la red

---

## ⚠️ **Validaciones Importantes**

### **Integridad de Datos**
- 🔢 **Números de Medidor**: Únicos por cooperativa
- 📅 **Fechas Lógicas**: Lecturas cronológicas
- 🏠 **Inmuebles Activos**: Solo medidores en propiedades activas
- 👤 **Titularidad**: Solo personas activas como titulares

### **Reglas de Negocio**
- ⚡ Un medidor por servicio por inmueble
- 📊 Lecturas mensuales obligatorias
- 🔄 Transferencias documentadas
- ⚠️ Anomalías requieren validación

---

## 🚀 **Próximo Paso**

Con servicios e inmuebles configurados:
👉 **06-pagos-facturacion/** para implementar el sistema financiero.

---

*¡La infraestructura es la base del servicio!* 🏗️