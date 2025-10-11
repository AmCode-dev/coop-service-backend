# Módulo de Prisma para NestJS - Cooperativas Service Backend

Este proyecto incluye un módulo de Prisma completamente configurado para trabajar con NestJS y una base de datos PostgreSQL para gestión de cooperativas de servicios.

## 🚀 Características

- ✅ Servicio de Prisma completamente configurado
- ✅ Conexión automática a la base de datos
- ✅ Health checks integrados
- ✅ Manejo de transacciones
- ✅ Logging de consultas en desarrollo
- ✅ Estadísticas de base de datos
- ✅ Ejemplo de servicio para Cooperativas

## 📁 Estructura del Módulo

```
src/
├── prisma/
│   ├── prisma.module.ts      # Módulo global de Prisma
│   ├── prisma.service.ts     # Servicio principal con funcionalidades extras
│   └── index.ts              # Exportaciones del módulo
├── health/
│   ├── health.module.ts      # Módulo de health checks
│   └── health.controller.ts  # Endpoints de estado
└── cooperativas/
    └── cooperativas.service.ts # Ejemplo de servicio usando Prisma
```

## 🛠️ Configuración

### 1. Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/coop_db?schema=public"

# App
NODE_ENV=development
PORT=3000

# Prisma
PRISMA_QUERY_LOG=true
```

### 2. Generar el Cliente de Prisma

```bash
npx prisma generate
```

### 3. Ejecutar Migraciones (cuando tengas una base de datos)

```bash
npx prisma migrate dev --name init
```

## 🎯 Uso del Servicio de Prisma

### Inyección en un Servicio

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MiServicio {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerCooperativas() {
    return this.prisma.cooperativa.findMany({
      where: { activa: true },
    });
  }
}
```

### Transacciones

```typescript
async crearCooperativaConUsuario(data: any) {
  return this.prisma.executeTransaction(async (prisma) => {
    const cooperativa = await prisma.cooperativa.create({
      data: data.cooperativa,
    });

    const usuario = await prisma.usuario.create({
      data: {
        ...data.usuario,
        cooperativaId: cooperativa.id,
      },
    });

    return { cooperativa, usuario };
  });
}
```

## 🏥 Health Checks

El módulo incluye endpoints de health check:

### Endpoints Disponibles

- `GET /health` - Estado general de la aplicación
- `GET /health/database` - Estado de la conexión a la base de datos
- `GET /health/stats` - Estadísticas de la base de datos

### Ejemplo de Respuesta

```json
{
  "status": "healthy",
  "timestamp": "2025-10-09T15:30:00.000Z"
}
```

## 🔧 Funcionalidades del PrismaService

### Métodos Disponibles

#### `healthCheck()`
Verifica el estado de la conexión a la base de datos.

```typescript
const health = await this.prisma.healthCheck();
// { status: 'healthy', timestamp: Date }
```

#### `getDatabaseStats()`
Obtiene estadísticas de las tablas de la base de datos.

```typescript
const stats = await this.prisma.getDatabaseStats();
// Array de { table_name, row_count, table_size }
```

#### `executeTransaction(fn)`
Ejecuta operaciones dentro de una transacción.

```typescript
const result = await this.prisma.executeTransaction(async (prisma) => {
  // Operaciones transaccionales
  return result;
});
```

#### `cleanDatabase()` ⚠️ Solo para Testing
Limpia todas las tablas (excepto migraciones).

```typescript
// Solo disponible en NODE_ENV !== 'production'
await this.prisma.cleanDatabase();
```

## 📊 Ejemplo de Servicio Completo

El archivo `cooperativas.service.ts` incluye un ejemplo completo de CRUD con:

- ✅ Operaciones CRUD básicas
- ✅ Manejo de errores específicos de Prisma
- ✅ Validaciones de negocio
- ✅ Consultas con relaciones
- ✅ Conteo de registros
- ✅ Soft deletes

## 🐛 Manejo de Errores

### Errores Comunes de Prisma

```typescript
// P2002: Violación de constraint único
// P2025: Registro no encontrado
// P2003: Violación de foreign key

private isPrismaError(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  );
}
```

## 🚦 Comandos Útiles

```bash
# Validar schema
npx prisma validate

# Generar cliente
npx prisma generate

# Ver base de datos en navegador
npx prisma studio

# Formatear schema
npx prisma format

# Reiniciar base de datos (desarrollo)
npx prisma migrate reset

# Aplicar cambios sin migración
npx prisma db push
```

## 🏗️ Estructura del Schema

El schema incluye modelos para:

- **Cooperativas** - Entidad principal multi-tenant
- **Usuarios** - Sistema de autenticación y roles
- **Personas** - Titulares de servicios
- **Inmuebles** - Propiedades con servicios
- **Servicios** - Agua, luz, internet, etc.
- **Cuentas** - Cuentas de servicios por inmueble
- **Facturas** - Sistema de facturación
- **Pagos** - Gestión de cobranzas
- **Operaciones** - Registro de tareas técnicas
- **Reportes** - Sistema de reportes y auditoría
- **Legajos** - Gestión documental

## 🔐 Consideraciones de Seguridad

- El módulo está marcado como `@Global()` para facilitar el uso
- Las consultas se loguean solo en desarrollo
- Los métodos destructivos verifican el entorno
- Se incluyen validaciones de tipos TypeScript

## 📈 Performance

- Índices optimizados en el schema
- Consultas con `select` específicos
- Uso de transacciones para operaciones complejas
- Conexión persistente con pooling automático

## 🧪 Testing

Para usar en tests, puedes limpiar la base de datos:

```typescript
beforeEach(async () => {
  await prismaService.cleanDatabase();
});
```

---

**¡El módulo está listo para usar!** 🎉

Simplemente importa `PrismaModule` en tu `AppModule` y podrás inyectar `PrismaService` en cualquier servicio de tu aplicación.