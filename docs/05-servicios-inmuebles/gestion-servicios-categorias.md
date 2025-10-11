# 🔧 Módulo de Servicios y Categorías

Sistema completo para gestión de servicios, categorías de consumo e historial de precios con multi-tenancy.

## 📋 **Funcionalidades Implementadas**

### 🏗️ **Servicios Disponibles**
- ✅ Crear servicios por cooperativa (Agua, Luz, Gas, Internet, etc.)
- ✅ Gestionar información y códigos únicos
- ✅ Activar/desactivar servicios
- ✅ Validaciones de unicidad por cooperativa
- ✅ Estadísticas de uso

### 📊 **Categorías de Consumo**
- ✅ Crear categorías por servicio (Residencial, Comercial, Industrial)
- ✅ Numeración y códigos únicos
- ✅ Vinculación a servicios específicos
- ✅ Gestión independiente por cooperativa

### 💰 **Historial de Precios**
- ✅ Registrar precios por mes/año
- ✅ Períodos de vigencia
- ✅ Observaciones y motivos de cambio
- ✅ Análisis de evolución de precios
- ✅ Comparación entre categorías
- ✅ Auditoria de cambios (quién y cuándo)

---

## 🚀 **API Endpoints Disponibles**

### **Servicios** (`/servicios`)

#### **Crear Servicio**
```http
POST /servicios
Headers:
  x-cooperativa-id: "uuid-cooperativa"
  x-usuario-id: "uuid-usuario"
Content-Type: application/json

{
  "nombre": "Agua Potable",
  "codigo": "agua-potable",
  "descripcion": "Suministro de agua potable para uso domiciliario",
  "activo": true
}
```

#### **Listar Servicios**
```http
GET /servicios?includeInactive=false
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Obtener Servicio por ID**
```http
GET /servicios/{id}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Actualizar Servicio**
```http
PATCH /servicios/{id}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
Content-Type: application/json

{
  "nombre": "Agua Potable Premium",
  "descripcion": "Descripción actualizada"
}
```

#### **Eliminar Servicio (Soft Delete)**
```http
DELETE /servicios/{id}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Buscar por Código**
```http
GET /servicios/codigo/{codigo}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Estadísticas de Servicios**
```http
GET /servicios/estadisticas
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

### **Categorías** (`/categorias`)

#### **Crear Categoría**
```http
POST /categorias
Headers:
  x-cooperativa-id: "uuid-cooperativa"
  x-usuario-id: "uuid-usuario"
Content-Type: application/json

{
  "nombre": "Categoría Residencial",
  "codigo": "residencial",
  "numero": 1,
  "descripcion": "Para uso domiciliario",
  "servicioId": "uuid-servicio",
  "activo": true
}
```

#### **Listar Todas las Categorías**
```http
GET /categorias?includeInactive=false
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Categorías por Servicio**
```http
GET /categorias/servicio/{servicioId}?includeInactive=false
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Estadísticas por Servicio**
```http
GET /categorias/servicio/{servicioId}/estadisticas
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Obtener Categoría por ID**
```http
GET /categorias/{id}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Actualizar Categoría**
```http
PATCH /categorias/{id}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
Content-Type: application/json

{
  "nombre": "Categoría Residencial Premium",
  "numero": 2
}
```

#### **Eliminar Categoría**
```http
DELETE /categorias/{id}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Buscar por Código**
```http
GET /categorias/servicio/{servicioId}/codigo/{codigo}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

### **Historial de Precios** (`/historial-precios`)

#### **Registrar Nuevo Precio**
```http
POST /historial-precios
Headers:
  x-cooperativa-id: "uuid-cooperativa"
  x-usuario-id: "uuid-usuario"
Content-Type: application/json

{
  "precioBase": 1250.5000,
  "mes": 10,
  "anio": 2024,
  "vigenciaDesde": "2024-10-01T00:00:00.000Z",
  "vigenciaHasta": "2024-10-31T23:59:59.999Z",
  "observaciones": "Aumento por inflación",
  "categoriaId": "uuid-categoria"
}
```

#### **Historial por Categoría**
```http
GET /historial-precios/categoria/{categoriaId}?mes=10&anio=2024
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Precio Vigente Actual**
```http
GET /historial-precios/categoria/{categoriaId}/vigente?fecha=2024-10-10
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Último Precio Registrado**
```http
GET /historial-precios/categoria/{categoriaId}/ultimo
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Evolución de Precios**
```http
GET /historial-precios/categoria/{categoriaId}/evolucion
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Comparación de Precios**
```http
GET /historial-precios/comparacion?fecha=2024-10-10
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

#### **Actualizar Precio**
```http
PATCH /historial-precios/{id}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
Content-Type: application/json

{
  "precioBase": 1300.0000,
  "observaciones": "Corrección de precio"
}
```

#### **Eliminar Precio**
```http
DELETE /historial-precios/{id}
Headers:
  x-cooperativa-id: "uuid-cooperativa"
```

---

## 📊 **Casos de Uso Prácticos**

### **💼 Para Administradores de Cooperativas**

#### **1. Configurar Servicios Básicos**
```bash
# Crear servicio de agua
curl -X POST http://localhost:3000/servicios \
  -H "x-cooperativa-id: coop-123" \
  -H "x-usuario-id: admin-456" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Agua Potable",
    "codigo": "agua",
    "descripcion": "Suministro de agua potable"
  }'

# Crear categorías para el servicio
curl -X POST http://localhost:3000/categorias \
  -H "x-cooperativa-id: coop-123" \
  -H "x-usuario-id: admin-456" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Residencial",
    "codigo": "residencial",
    "numero": 1,
    "servicioId": "servicio-agua-id"
  }'
```

#### **2. Actualizar Precios**
```bash
# Registrar nuevo precio
curl -X POST http://localhost:3000/historial-precios \
  -H "x-cooperativa-id: coop-123" \
  -H "x-usuario-id: admin-456" \
  -H "Content-Type: application/json" \
  -d '{
    "precioBase": 1500.00,
    "mes": 11,
    "anio": 2024,
    "vigenciaDesde": "2024-11-01T00:00:00.000Z",
    "observaciones": "Ajuste mensual",
    "categoriaId": "categoria-residencial-id"
  }'
```

#### **3. Análisis de Evolución**
```bash
# Ver evolución de precios
curl -X GET http://localhost:3000/historial-precios/categoria/categoria-id/evolucion \
  -H "x-cooperativa-id: coop-123"

# Comparar todas las categorías
curl -X GET http://localhost:3000/historial-precios/comparacion \
  -H "x-cooperativa-id: coop-123"
```

### **📈 Para Operadores**

#### **1. Consultar Precios Vigentes**
```bash
# Precio actual de una categoría
curl -X GET http://localhost:3000/historial-precios/categoria/categoria-id/vigente \
  -H "x-cooperativa-id: coop-123"

# Precio para una fecha específica
curl -X GET "http://localhost:3000/historial-precios/categoria/categoria-id/vigente?fecha=2024-09-15" \
  -H "x-cooperativa-id: coop-123"
```

#### **2. Verificar Configuraciones**
```bash
# Ver todos los servicios
curl -X GET http://localhost:3000/servicios \
  -H "x-cooperativa-id: coop-123"

# Ver categorías de un servicio
curl -X GET http://localhost:3000/categorias/servicio/servicio-id \
  -H "x-cooperativa-id: coop-123"
```

---

## 🔒 **Seguridad y Multi-Tenancy**

### **Validaciones Implementadas**
- ✅ **Cooperativa ID obligatorio** en todos los endpoints
- ✅ **Códigos únicos** por cooperativa (no globales)
- ✅ **Aislamiento total** entre cooperativas
- ✅ **Validación de existencia** de servicios y categorías
- ✅ **Prevención de eliminación** con dependencias

### **Controles de Integridad**
- ✅ No se puede eliminar un servicio con categorías
- ✅ No se puede eliminar una categoría con cuentas asociadas
- ✅ Validación de períodos de vigencia de precios
- ✅ Prevención de precios duplicados por mes/año

---

## 📋 **Estructura de Datos**

### **Servicio Disponible**
```typescript
interface ServicioDisponible {
  id: string;
  nombre: string;           // "Agua Potable"
  codigo: string;           // "agua-potable"
  descripcion?: string;
  activo: boolean;
  cooperativaId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones
  categorias: CategoriaConsumo[];
  cuentasServicios: CuentaServicio[];
}
```

### **Categoría de Consumo**
```typescript
interface CategoriaConsumo {
  id: string;
  nombre: string;           // "Residencial"
  codigo: string;           // "residencial"
  numero?: number;          // 1, 2, 3...
  descripcion?: string;
  activo: boolean;
  cooperativaId: string;
  servicioId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones
  servicio: ServicioDisponible;
  historialPrecios: HistorialPrecioCategoria[];
  cuentasServicios: CuentaServicio[];
}
```

### **Historial de Precios**
```typescript
interface HistorialPrecioCategoria {
  id: string;
  precioBase: Decimal;      // 1250.5000
  mes: number;              // 1-12
  anio: number;             // 2024
  vigenciaDesde: Date;
  vigenciaHasta?: Date;
  observaciones?: string;
  activo: boolean;
  categoriaId: string;
  creadoPorId?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones
  categoria: CategoriaConsumo;
  creadoPor?: Usuario;
}
```

---

## 🧪 **Casos de Prueba**

### **Test de Servicios**
```typescript
describe('ServiciosService', () => {
  it('debe crear un servicio para una cooperativa', async () => {
    const servicio = await serviciosService.create({
      nombre: 'Agua Potable',
      codigo: 'agua',
      descripcion: 'Suministro de agua'
    }, 'coop-123', 'user-456');
    
    expect(servicio.codigo).toBe('agua');
    expect(servicio.cooperativaId).toBe('coop-123');
  });

  it('debe prevenir códigos duplicados en la misma cooperativa', async () => {
    await expect(serviciosService.create({
      nombre: 'Otro Agua',
      codigo: 'agua',  // Código ya existe
    }, 'coop-123', 'user-456')).rejects.toThrow(ConflictException);
  });
});
```

### **Test de Categorías**
```typescript
describe('CategoriasService', () => {
  it('debe crear categoría vinculada a servicio', async () => {
    const categoria = await categoriasService.create({
      nombre: 'Residencial',
      codigo: 'residencial',
      servicioId: 'servicio-123'
    }, 'coop-123', 'user-456');
    
    expect(categoria.servicioId).toBe('servicio-123');
  });
});
```

### **Test de Precios**
```typescript
describe('HistorialPreciosService', () => {
  it('debe registrar precio con evolución', async () => {
    const precio = await historialService.create({
      precioBase: 1500.00,
      mes: 10,
      anio: 2024,
      vigenciaDesde: '2024-10-01',
      categoriaId: 'categoria-123'
    }, 'coop-123', 'user-456');
    
    expect(precio.precioBase).toBe(1500.00);
  });

  it('debe calcular evolución de precios correctamente', async () => {
    const evolucion = await historialService.getEvolucionPrecios(
      'categoria-123', 'coop-123'
    );
    
    expect(evolucion.evolucion).toHaveLength(2);
    expect(evolucion.variacionTotal).toBeGreaterThan(0);
  });
});
```

---

## 🔧 **Configuración y Uso**

### **1. Instalación**
```bash
# El módulo ya está integrado en el proyecto principal
# Solo necesitas importarlo en app.module.ts

import { ServiciosModule } from './servicios/servicios.module';

@Module({
  imports: [
    // ... otros módulos
    ServiciosModule,
  ],
})
export class AppModule {}
```

### **2. Variables de Entorno**
```env
# Ya configurado con DATABASE_URL principal
# No requiere configuración adicional
```

### **3. Uso en Frontend**
```typescript
// Servicio de API para frontend
class ServiciosApiService {
  private cooperativaId = getCurrentCooperativaId();

  async getServicios() {
    return this.http.get('/servicios', {
      headers: { 'x-cooperativa-id': this.cooperativaId }
    });
  }

  async getPrecioVigente(categoriaId: string) {
    return this.http.get(`/historial-precios/categoria/${categoriaId}/vigente`, {
      headers: { 'x-cooperativa-id': this.cooperativaId }
    });
  }
}
```

---

## 📈 **Métricas y Monitoreo**

### **Endpoints de Estadísticas**
- 📊 `/servicios/estadisticas` - Resumen de servicios
- 📊 `/categorias/servicio/:id/estadisticas` - Estadísticas por servicio
- 📊 `/historial-precios/categoria/:id/evolucion` - Evolución de precios
- 📊 `/historial-precios/comparacion` - Comparación entre categorías

### **Datos Disponibles**
```typescript
interface EstadisticasServicios {
  totalServicios: number;
  serviciosActivos: number;
  serviciosInactivos: number;
  totalCategorias: number;
  totalCuentasServicios: number;
  promedioCategoriasporServicio: number;
}

interface EvolucionPrecios {
  categoria: { id, nombre, codigo };
  totalRegistros: number;
  precioActual: Decimal;
  precioInicial: Decimal;
  variacionTotal: number;
  evolucion: PrecioConVariacion[];
}
```

---

## ✅ **Funcionalidades Completadas**

- [x] **Servicios Multi-Tenant** - Gestión completa por cooperativa
- [x] **Categorías Flexibles** - Numeración y códigos personalizables
- [x] **Historial de Precios** - Trazabilidad completa de cambios
- [x] **Análisis de Evolución** - Variaciones y tendencias
- [x] **Comparación de Precios** - Vista consolidada
- [x] **Validaciones de Integridad** - Prevención de inconsistencias
- [x] **API RESTful Completa** - CRUD + análisis
- [x] **Documentación Detallada** - Casos de uso y ejemplos
- [x] **Auditoría de Cambios** - Quién y cuándo modificó precios

---

*¡El sistema está listo para gestionar servicios y precios de forma profesional!* 🚀