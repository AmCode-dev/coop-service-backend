# Módulo de Autenticación y Autorización - NestJS

Sistema completo de autenticación y autorización con JWT, roles y permisos granulares para el sistema de gestión de cooperativas.

## 🔐 Características

- ✅ **Autenticación JWT** con estrategia Passport
- ✅ **Autorización basada en roles** (RBAC)
- ✅ **Permisos granulares** por sección y acción
- ✅ **Decoradores personalizados** para endpoints públicos/privados
- ✅ **Guards automáticos** aplicados globalmente
- ✅ **Gestión de sesiones** con información del usuario
- ✅ **Respuestas de error** estructuradas y personalizables
- ✅ **Multi-tenant** por cooperativa
- ✅ **Diferenciación** entre empleados y socios

## 📁 Estructura del Módulo

```
src/auth/
├── auth.module.ts                  # Módulo global de autenticación
├── index.ts                        # Exportaciones principales
├── controllers/
│   └── auth.controller.ts          # Endpoints de login y perfil
├── services/
│   └── auth.service.ts             # Lógica de autenticación
├── guards/
│   ├── jwt-auth.guard.ts           # Guard de JWT
│   ├── permission.guard.ts         # Guard de permisos
│   └── auth.guard.ts               # Guard combinado
├── strategies/
│   └── jwt.strategy.ts             # Estrategia Passport JWT
├── decorators/
│   ├── auth.decorators.ts          # Decoradores de autorización
│   └── user.decorators.ts          # Decoradores para obtener datos del usuario
├── interfaces/
│   └── auth.interface.ts           # Tipos e interfaces
└── responses/
    └── auth-error.response.ts      # Respuestas de error personalizadas
```

## 🚀 Configuración

### Variables de Entorno

```env
# JWT Authentication
JWT_SECRET="tu-clave-secreta-super-segura"
JWT_EXPIRES_IN="1h"
```

### Importar el Módulo

```typescript
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
  // ...
})
export class AppModule {}
```

## 🎯 Uso de Decoradores

### Decoradores de Acceso

```typescript
import { 
  Public, 
  Private,
  RequirePermissions,
  CanRead,
  CanWrite,
  RequireAdmin,
  EmpleadoOnly
} from './auth/decorators/auth.decorators';

// Endpoint público (no requiere autenticación)
@Public()
@Get('public-data')
getPublicData() {
  return { message: 'Datos públicos' };
}

// Endpoint privado (requiere autenticación) - por defecto
@Get('private-data')
getPrivateData() {
  return { message: 'Datos privados' };
}

// Requiere permisos específicos
@CanRead('cuentas')
@Get('cuentas')
getCuentas() {
  return { message: 'Lista de cuentas' };
}

@CanWrite('facturas')
@Post('facturas')
createFactura() {
  return { message: 'Factura creada' };
}

// Permisos múltiples
@RequirePermissions('operaciones', 'READ', 'WRITE')
@Get('operaciones')
getOperaciones() {
  return { message: 'Operaciones' };
}

// Solo administradores
@RequireAdmin()
@Get('admin-panel')
getAdminPanel() {
  return { message: 'Panel de administración' };
}

// Solo empleados
@EmpleadoOnly()
@Get('empleados-data')
getEmpleadosData() {
  return { message: 'Datos de empleados' };
}
```

### Decoradores para Obtener Datos del Usuario

```typescript
import { 
  GetUser,
  GetUserId,
  GetCooperativaId,
  GetUserEmail,
  IsEmpleado,
  GetUserRoles,
  GetUserInfo
} from './auth/decorators/user.decorators';

@Get('profile')
getProfile(
  @GetUser() user: AuthenticatedUser,           // Usuario completo
  @GetUserId() userId: string,                  // Solo ID del usuario
  @GetCooperativaId() cooperativaId: string,    // ID de la cooperativa
  @GetUserEmail() email: string,               // Email del usuario
  @IsEmpleado() esEmpleado: boolean,           // Si es empleado
  @GetUserRoles() roles: string[],             // Roles del usuario
  @GetUserInfo() userInfo: any                 // Info básica para logs
) {
  return {
    userId,
    email,
    cooperativaId,
    esEmpleado,
    roles,
    fullUser: user,
    logInfo: userInfo
  };
}
```

## 🔑 Sistema de Autenticación

### Login

```typescript
// POST /auth/login
{
  "email": "usuario@cooperativa.com",
  "password": "password123",
  "cooperativaId": "opcional-si-email-es-unico"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "usuario@cooperativa.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "esEmpleado": true,
    "cooperativa": {
      "id": "coop_id",
      "nombre": "Cooperativa Ejemplo"
    }
  },
  "expiresIn": 3600
}
```

### Endpoints de Autenticación

```typescript
// Información del perfil
GET /auth/profile
Authorization: Bearer <token>

// Información básica del usuario actual
GET /auth/me
Authorization: Bearer <token>

// Health check del servicio
GET /auth/health
```

## ⚙️ Sistema de Roles y Permisos

### Estructura de Permisos

Los permisos se organizan por:
- **Sección**: Área del sistema (ej: "cuentas", "facturas", "usuarios")
- **Acción**: Operación permitida (READ, WRITE, EXECUTE, DELETE)

### Roles Predefinidos

```typescript
// Decoradores para roles comunes
@RequireAdmin()      // Administrador
@RequireOperador()   // Operador
@RequireContador()   // Contador
```

### Validación de Permisos

El sistema valida automáticamente:

1. **Autenticación**: Token JWT válido
2. **Usuario activo**: Usuario no deshabilitado
3. **Cooperativa activa**: Cooperativa no suspendida
4. **Roles requeridos**: Usuario tiene rol necesario
5. **Permisos específicos**: Usuario tiene permisos de sección/acción
6. **Restricciones**: Empleado/Socio según configuración

## 🛡️ Manejo de Errores

### Respuestas de Error Estructuradas

```typescript
// Ejemplo de respuesta de error
{
  "success": false,
  "message": "No tienes permisos para WRITE en la sección facturas",
  "code": "INSUFFICIENT_PERMISSIONS",
  "timestamp": "2025-10-09T15:30:00.000Z",
  "path": "/api/facturas",
  "details": {
    "requiredSection": "facturas",
    "requiredAction": "WRITE",
    "userPermissions": [
      {
        "seccion": "facturas",
        "acciones": ["READ"]
      }
    ]
  }
}
```

### Tipos de Errores

```typescript
// Errores disponibles en AuthErrorResponse
AuthErrorResponse.unauthorized()           // 401 - No autorizado
AuthErrorResponse.forbidden()             // 403 - Acceso denegado
AuthErrorResponse.invalidToken()          // 401 - Token inválido
AuthErrorResponse.expiredToken()          // 401 - Token expirado
AuthErrorResponse.insufficientPermissions() // 403 - Sin permisos
AuthErrorResponse.invalidCooperativa()    // 401 - Cooperativa inválida
AuthErrorResponse.userNotFound()          // 401 - Usuario no encontrado
AuthErrorResponse.inactiveUser()          // 401 - Usuario inactivo
```

## 🔧 Guards Automáticos

El sistema aplica automáticamente:

```typescript
// Guard global aplicado a todos los endpoints
{
  provide: APP_GUARD,
  useClass: AuthGuard,  // Combina JWT + Permisos
}
```

### Flujo de Validación

1. **Verificar si es público**: `@Public()` decorator
2. **Validar JWT**: Token presente y válido
3. **Cargar usuario**: Obtener datos completos del usuario
4. **Verificar restricciones**: Empleado/Socio only
5. **Validar roles**: Roles requeridos
6. **Verificar permisos**: Secciones y acciones específicas

## 📊 Ejemplos Prácticos

### Controller Completo

```typescript
@Controller('cooperativas')
export class CooperativasController {
  // Endpoint público
  @Public()
  @Get('activas')
  getCooperativasActivas() {
    return this.service.findActivas();
  }

  // Requiere autenticación básica
  @Get('mi-cooperativa')
  getMiCooperativa(@GetCooperativaId() cooperativaId: string) {
    return this.service.findById(cooperativaId);
  }

  // Solo administradores
  @RequireAdmin()
  @Get()
  getAllCooperativas() {
    return this.service.findAll();
  }

  // Permisos específicos
  @CanWrite('cooperativas')
  @Post()
  createCooperativa(@Body() data: CreateCooperativaDto) {
    return this.service.create(data);
  }

  // Solo empleados con permisos específicos
  @EmpleadoOnly()
  @RequirePermissions('cooperativas', 'DELETE')
  @Delete(':id')
  deleteCooperativa(@Param('id') id: string) {
    return this.service.delete(id);
  }

  // Múltiples validaciones
  @RequireRoles('Administrador', 'Contador')
  @CanRead('reportes')
  @Get('reportes')
  getReportes(
    @GetUser() user: AuthenticatedUser,
    @GetUserInfo() userInfo: any
  ) {
    // Log de acceso a reportes
    this.logService.logAccess('reportes', userInfo);
    return this.reportService.getForCooperativa(user.cooperativaId);
  }
}
```

### Servicio con Validaciones

```typescript
@Injectable()
export class CooperativasService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService
  ) {}

  async updateCooperativa(id: string, data: UpdateDto, user: AuthenticatedUser) {
    // Verificar que pertenece a la misma cooperativa
    if (!this.authService.belongsToCooperativa(user, id)) {
      throw new ForbiddenException(
        AuthErrorResponse.forbidden('No puedes modificar otra cooperativa')
      );
    }

    // Verificar permisos específicos
    if (!this.authService.hasPermission(user, 'cooperativas', 'WRITE')) {
      throw new ForbiddenException(
        AuthErrorResponse.insufficientPermissions('cooperativas', 'WRITE')
      );
    }

    return this.prisma.cooperativa.update({
      where: { id },
      data
    });
  }
}
```

## 🧪 Testing

### Setup para Tests

```typescript
// Mock del usuario autenticado
const mockUser: AuthenticatedUser = {
  id: 'user1',
  email: 'test@coop.com',
  cooperativaId: 'coop1',
  esEmpleado: true,
  roles: [{ nombre: 'Administrador' }],
  permisos: [
    {
      seccionCodigo: 'cuentas',
      acciones: ['READ', 'WRITE']
    }
  ]
};

// Mockear guards en tests
const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

beforeEach(async () => {
  const module = await Test.createTestingModule({
    // ...
  })
  .overrideGuard(AuthGuard)
  .useValue(mockAuthGuard)
  .compile();
});
```

## 🔒 Consideraciones de Seguridad

1. **JWT Secret**: Usar clave segura en producción
2. **HTTPS**: Siempre usar HTTPS en producción
3. **Token Expiration**: Configurar tiempo de expiración apropiado
4. **Rate Limiting**: Implementar límites de requests
5. **Logs de Seguridad**: Registrar intentos de acceso
6. **Validación de Input**: Sanitizar datos de entrada
7. **Principio de Menor Privilegio**: Asignar permisos mínimos necesarios

## 🚀 Próximas Mejoras

- [ ] Refresh Tokens
- [ ] Rate Limiting por usuario
- [ ] Logs de auditoría detallados
- [ ] 2FA (Two-Factor Authentication)
- [ ] Políticas de contraseñas
- [ ] Notificaciones de login
- [ ] Sesiones múltiples por usuario

---

**¡El módulo de autenticación está completamente funcional!** 🎉

Todos los endpoints están protegidos automáticamente, y puedes usar los decoradores para personalizar el acceso según tus necesidades específicas.