# 📊 Endpoints de Consumo para Socios - Cooperativas

## 🚀 Implementación Completada

Se han implementado exitosamente los endpoints para que los **socios** puedan consultar su historial de consumo y información de medidores.

### 🛡️ Autenticación
- Todos los endpoints requieren autenticación JWT
- Solo accesible para usuarios con rol de **SOCIO** (`@SocioOnly()`)
- Los datos están aislados por cooperativa y persona

## 📋 Endpoints Disponibles

### Base URL: `/socios-consumo`

---

### 1. 📍 **Obtener Mis Medidores**
```
GET /socios-consumo/mis-medidores
```

**Descripción**: Retorna todos los medidores asociados al socio autenticado.

**Respuesta**:
```json
{
  "success": true,
  "message": "Se encontraron 2 medidores",
  "medidores": [
    {
      "id": "medidor-uuid",
      "numeroMedidor": "12345678",
      "servicio": "Agua Potable (AP)",
      "activo": true,
      "ultimaLectura": {
        "fecha": "2024-10-01T00:00:00.000Z",
        "valor": 156.5,
        "consumo": 12.3
      }
    }
  ]
}
```

---

### 2. 📈 **Historial de Lecturas**
```
GET /socios-consumo/historial-lecturas?medidorId=uuid&mes=10&anio=2024&limite=20
```

**Parámetros de consulta**:
- `medidorId` (opcional): ID específico del medidor
- `mes` (opcional): Mes a consultar (1-12)
- `anio` (opcional): Año a consultar
- `limite` (opcional): Número máximo de resultados (default: 20)

**Respuesta**:
```json
{
  "success": true,
  "message": "Se encontraron 15 lecturas",
  "lecturas": [
    {
      "id": "lectura-uuid",
      "fecha": "2024-10-01T00:00:00.000Z",
      "valor": 156.5,
      "consumo": 12.3,
      "periodo": "OCT/2024",
      "medidor": {
        "numeroMedidor": "12345678",
        "servicio": "Agua Potable (AP)"
      },
      "anomalia": false
    }
  ],
  "total": 150
}
```

---

### 3. 📊 **Resumen de Consumo**
```
GET /socios-consumo/resumen-consumo
```

**Descripción**: Proporciona un resumen general del consumo del socio.

**Respuesta**:
```json
{
  "success": true,
  "message": "Resumen obtenido correctamente",
  "resumen": {
    "totalMedidores": 3,
    "medidoresActivos": 2,
    "ultimoMes": {
      "periodo": "OCT/2024",
      "consumoTotal": 45.6,
      "lecturas": 3
    },
    "alertas": {
      "sinLecturasRecientes": 0,
      "conAnomalias": 1
    }
  }
}
```

---

### 4. 📉 **Comparativo Mensual**
```
GET /socios-consumo/comparativo-mensual?meses=6
```

**Parámetros de consulta**:
- `meses` (opcional): Número de meses a comparar (default: 6)

**Respuesta**:
```json
{
  "success": true,
  "message": "Comparativo de 6 meses obtenido correctamente",
  "comparativo": [
    {
      "periodo": "MAY/2024",
      "mes": 5,
      "anio": 2024,
      "consumoTotal": 38.2,
      "lecturas": 3,
      "variacion": -12.5
    },
    {
      "periodo": "JUN/2024",
      "mes": 6,
      "anio": 2024,
      "consumoTotal": 42.8,
      "lecturas": 3,
      "variacion": 12.04
    }
  ]
}
```

---

## 🔒 Seguridad y Aislamiento de Datos

### ✅ Controles Implementados:
- **Autenticación JWT**: Token válido requerido
- **Autorización por Rol**: Solo socios pueden acceder
- **Aislamiento por Cooperativa**: Los datos están filtrados por `cooperativaId`
- **Aislamiento por Persona**: Solo se muestran medidores del titular del servicio
- **Validación de Relaciones**: Verificación de que el usuario tiene persona vinculada

### 🔍 Filtros de Seguridad:
```typescript
// Ejemplo de filtro aplicado en cada consulta
where: {
  medidor: {
    cuentasServicios: {
      some: {
        cuenta: {
          titularServicioId: usuario.persona.id,  // Solo del socio autenticado
          cooperativaId,                          // Solo de su cooperativa
        },
      },
    },
  },
}
```

---

## 🚀 Uso desde Frontend

### Ejemplo con Axios:
```typescript
// Configurar interceptor para JWT
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Obtener medidores del socio
const medidores = await axios.get('/socios-consumo/mis-medidores');

// Historial de lecturas con filtros
const historial = await axios.get('/socios-consumo/historial-lecturas', {
  params: {
    medidorId: 'uuid-del-medidor',
    mes: 10,
    anio: 2024,
    limite: 50
  }
});

// Resumen de consumo para dashboard
const resumen = await axios.get('/socios-consumo/resumen-consumo');
```

---

## 📋 Próximos Pasos Sugeridos

### 🎯 Mejoras Futuras:
1. **Alertas Personalizadas**: Configuración de umbrales de consumo
2. **Exportación de Datos**: PDF/Excel del historial de consumo
3. **Gráficos de Tendencias**: API para datos de visualización
4. **Predicciones**: Estimación de consumo futuro basado en histórico
5. **Comparación con Promedio**: Comparar consumo individual vs promedio de la cooperativa
6. **Notificaciones Push**: Alertas en tiempo real por consumo anómalo

### 🔧 Optimizaciones Técnicas:
1. **Cache Redis**: Para consultas frecuentes
2. **Paginación Avanzada**: Cursor-based pagination
3. **Índices de BD**: Optimización de consultas
4. **Rate Limiting**: Protección contra abuso de API
5. **Compresión**: Reducir tamaño de respuestas

---

## ✅ Estado: **COMPLETADO Y FUNCIONAL**

- ✅ Autenticación y autorización implementada
- ✅ Aislamiento de datos por cooperativa y persona
- ✅ 4 endpoints principales funcionando
- ✅ Compilación exitosa
- ✅ Servidor en ejecución
- ✅ Documentación completa

### 🔗 URLs de Prueba:
- **Base URL**: `http://localhost:3000/socios-consumo`
- **Swagger**: `http://localhost:3000/api` (si está configurado)

**Nota**: Todos los endpoints requieren un token JWT válido de un usuario con rol SOCIO.