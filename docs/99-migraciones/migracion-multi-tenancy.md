# 🔄 Migración a Multi-Tenancy: Un Usuario en Múltiples Cooperativas

## 📋 Descripción General

Esta migración permite que un usuario pueda pertenecer a múltiples cooperativas, manteniendo su email único global pero con diferentes roles y permisos en cada cooperativa.

---

## 🎯 Objetivos de la Migración

- ✅ **Multi-tenancy**: Un usuario puede ser socio/empleado en varias cooperativas
- ✅ **Email único global**: Mantener la unicidad del email a nivel sistema
- ✅ **Roles por cooperativa**: Diferentes permisos en cada cooperativa
- ✅ **Backward compatibility**: Mantener funcionalidad existente
- ✅ **Auditoría**: Registrar fechas de alta en cada cooperativa

---

## 🏗️ Cambios en el Schema

### 📊 Modelo Actual vs Nuevo

#### **ANTES:**
```prisma
model Usuario {
  id         String   @id @default(cuid())
  email      String   @unique
  cooperativaId String  // <- Relación directa 1:1
  cooperativa   Cooperativa @relation(fields: [cooperativaId], references: [id])
  persona   Persona? @relation("UsuarioPersona", fields: [personaId], references: [id])
  personaId String?
  roles     UsuarioRol[]
}
```

#### **DESPUÉS:**
```prisma
model Usuario {
  id         String   @id @default(cuid())
  email      String   @unique
  // cooperativaId eliminado
  // cooperativa eliminado
  cooperativas UsuarioCooperativa[]  // <- Relación many-to-many
}

model UsuarioCooperativa {
  id            String   @id @default(cuid())
  usuarioId     String
  cooperativaId String
  esEmpleado    Boolean  @default(false)
  activo        Boolean  @default(true)
  fechaAlta     DateTime @default(now())
  
  usuario      Usuario      @relation(fields: [usuarioId], references: [id])
  cooperativa  Cooperativa  @relation(fields: [cooperativaId], references: [id])
  roles        UsuarioRol[]
  persona      Persona?     @relation(fields: [personaId], references: [id])
  personaId    String?

  @@unique([usuarioId, cooperativaId])
}
```

---

## 🔄 Pasos de Migración

### Paso 1: Crear Nuevo Modelo
```sql
-- Crear tabla intermedia
CREATE TABLE "usuarios_cooperativas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cooperativaId" TEXT NOT NULL,
    "esEmpleado" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaAlta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "personaId" TEXT,

    CONSTRAINT "usuarios_cooperativas_pkey" PRIMARY KEY ("id")
);

-- Índices y constraints
CREATE UNIQUE INDEX "usuarios_cooperativas_usuarioId_cooperativaId_key" 
ON "usuarios_cooperativas"("usuarioId", "cooperativaId");

CREATE INDEX "usuarios_cooperativas_usuarioId_idx" 
ON "usuarios_cooperativas"("usuarioId");

CREATE INDEX "usuarios_cooperativas_cooperativaId_idx" 
ON "usuarios_cooperativas"("cooperativaId");

-- Foreign keys
ALTER TABLE "usuarios_cooperativas" 
ADD CONSTRAINT "usuarios_cooperativas_usuarioId_fkey" 
FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "usuarios_cooperativas" 
ADD CONSTRAINT "usuarios_cooperativas_cooperativaId_fkey" 
FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "usuarios_cooperativas" 
ADD CONSTRAINT "usuarios_cooperativas_personaId_fkey" 
FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

### Paso 2: Migrar Datos Existentes
```sql
-- Insertar relaciones existentes en la nueva tabla
INSERT INTO "usuarios_cooperativas" (
    "id",
    "usuarioId", 
    "cooperativaId", 
    "esEmpleado", 
    "activo",
    "fechaAlta",
    "personaId"
)
SELECT 
    gen_random_uuid() as "id",
    u."id" as "usuarioId",
    u."cooperativaId",
    u."esEmpleado",
    u."activo",
    u."createdAt" as "fechaAlta",
    u."personaId"
FROM "usuarios" u;
```

### Paso 3: Migrar Roles
```sql
-- Crear nueva tabla para roles por cooperativa
CREATE TABLE "usuarios_cooperativas_roles" (
    "id" TEXT NOT NULL,
    "usuarioCooperativaId" TEXT NOT NULL,
    "rolId" TEXT NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuarios_cooperativas_roles_pkey" PRIMARY KEY ("id")
);

-- Migrar roles existentes
INSERT INTO "usuarios_cooperativas_roles" (
    "id",
    "usuarioCooperativaId",
    "rolId",
    "fechaAsignacion",
    "activo"
)
SELECT 
    gen_random_uuid() as "id",
    uc."id" as "usuarioCooperativaId",
    ur."rolId",
    ur."fechaAsignacion",
    ur."activo"
FROM "usuarios_roles" ur
JOIN "usuarios_cooperativas" uc ON ur."usuarioId" = uc."usuarioId";
```

### Paso 4: Limpiar Schema Antiguo
```sql
-- Eliminar foreign keys antiguas
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_cooperativaId_fkey";
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_personaId_fkey";

-- Eliminar columnas antiguas
ALTER TABLE "usuarios" DROP COLUMN "cooperativaId";
ALTER TABLE "usuarios" DROP COLUMN "personaId";
ALTER TABLE "usuarios" DROP COLUMN "esEmpleado";

-- Eliminar tabla de roles antigua
DROP TABLE "usuarios_roles";
```

---

## 🔧 Cambios en el Código

### 1. Actualizar DTOs

```typescript
// auth/dto/register.dto.ts
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  // Eliminar cooperativaId - se maneja en el contexto
}

// Nuevo DTO para agregar usuario a cooperativa
export class AgregarUsuarioCooperativaDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password?: string; // Solo si es nuevo usuario

  @IsOptional()
  @IsBoolean()
  esEmpleado?: boolean;

  @IsOptional()
  @IsUUID()
  personaId?: string; // Para vincular con socio existente
}
```

### 2. Actualizar AuthService

```typescript
// auth/services/auth.service.ts
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(registerDto: RegisterDto, cooperativaId: string) {
    // Verificar si el usuario ya existe
    let usuario = await this.prisma.usuario.findUnique({
      where: { email: registerDto.email },
    });

    if (!usuario) {
      // Crear nuevo usuario
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      usuario = await this.prisma.usuario.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          nombre: registerDto.nombre,
          apellido: registerDto.apellido,
          telefono: registerDto.telefono,
        },
      });
    }

    // Verificar si ya está en esta cooperativa
    const usuarioCooperativa = await this.prisma.usuarioCooperativa.findUnique({
      where: {
        usuarioId_cooperativaId: {
          usuarioId: usuario.id,
          cooperativaId,
        },
      },
    });

    if (usuarioCooperativa) {
      throw new ConflictException(
        'El usuario ya está registrado en esta cooperativa'
      );
    }

    // Agregar usuario a la cooperativa
    await this.prisma.usuarioCooperativa.create({
      data: {
        usuarioId: usuario.id,
        cooperativaId,
        esEmpleado: false,
        activo: true,
      },
    });

    return usuario;
  }

  async login(loginDto: LoginDto, cooperativaId: string) {
    // Buscar usuario y verificar que pertenece a la cooperativa
    const usuarioCooperativa = await this.prisma.usuarioCooperativa.findFirst({
      where: {
        usuario: { email: loginDto.email },
        cooperativaId,
        activo: true,
      },
      include: {
        usuario: true,
        roles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: {
                    seccion: true,
                  },
                },
              },
            },
          },
        },
        persona: true,
      },
    });

    if (!usuarioCooperativa) {
      throw new UnauthorizedException(
        'Usuario no encontrado en esta cooperativa'
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      usuarioCooperativa.usuario.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.generateTokens(usuarioCooperativa);
  }

  private async generateTokens(usuarioCooperativa: any) {
    const payload = {
      sub: usuarioCooperativa.usuario.id,
      email: usuarioCooperativa.usuario.email,
      cooperativaId: usuarioCooperativa.cooperativaId,
      esEmpleado: usuarioCooperativa.esEmpleado,
      roles: usuarioCooperativa.roles.map(r => r.rol.nombre),
      personaId: usuarioCooperativa.personaId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
```

### 3. Actualizar Guards y Decorators

```typescript
// auth/guards/jwt-auth.guard.ts
export interface AuthenticatedUser {
  sub: string; // userId
  email: string;
  cooperativaId: string;
  esEmpleado: boolean;
  roles: string[];
  personaId?: string;
}

// auth/decorators/get-cooperativa-id.decorator.ts
export const GetCooperativaId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;
    
    if (!user?.cooperativaId) {
      throw new UnauthorizedException('Usuario no autenticado en cooperativa');
    }
    
    return user.cooperativaId;
  },
);
```

### 4. Actualizar PersonasService

```typescript
// personas/personas.service.ts
async vincularUsuario(
  personaId: string,
  vincularDto: VincularUsuarioDto,
  cooperativaId: string,
  usuarioAdminId: string,
): Promise<PersonaDetalle> {
  const persona = await this.buscarPorId(personaId, cooperativaId);

  // Buscar si el usuario ya existe
  let usuario = await this.prisma.usuario.findUnique({
    where: { email: vincularDto.email },
  });

  if (!usuario) {
    // Crear nuevo usuario
    const password = vincularDto.generarPassword 
      ? this.generateRandomPassword() 
      : vincularDto.password;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    usuario = await this.prisma.usuario.create({
      data: {
        email: vincularDto.email,
        password: hashedPassword,
        nombre: persona.nombreCompleto.split(' ')[0],
        apellido: persona.nombreCompleto.split(' ').slice(1).join(' '),
        telefono: persona.telefono,
      },
    });

    if (vincularDto.enviarCredenciales) {
      await this.enviarCredencialesPorEmail(usuario.email, password);
    }
  }

  // Verificar si ya está vinculado a esta cooperativa
  const usuarioCooperativa = await this.prisma.usuarioCooperativa.findUnique({
    where: {
      usuarioId_cooperativaId: {
        usuarioId: usuario.id,
        cooperativaId,
      },
    },
  });

  if (usuarioCooperativa) {
    if (usuarioCooperativa.personaId === personaId) {
      throw new ConflictException('El usuario ya está vinculado a esta persona');
    } else {
      throw new ConflictException(
        'El usuario ya está vinculado a otra persona en esta cooperativa'
      );
    }
  }

  // Crear vinculación en la cooperativa
  await this.prisma.usuarioCooperativa.create({
    data: {
      usuarioId: usuario.id,
      cooperativaId,
      personaId,
      esEmpleado: false,
      activo: true,
    },
  });

  return this.buscarPorId(personaId, cooperativaId);
}
```

---

## ⚠️ Consideraciones Importantes

### 🔒 Seguridad
- El JWT debe incluir `cooperativaId` para contexto de seguridad
- Todos los endpoints deben validar pertenencia a cooperativa
- Los roles son específicos por cooperativa

### 📊 Performance
- Nuevos índices necesarios para consultas eficientes
- Posible impacto en queries existentes
- Considerar caching de roles por cooperativa

### 🔄 Retrocompatibilidad
- Los endpoints existentes seguirán funcionando
- Los DTOs mantienen la misma estructura
- Los guards automáticamente extraen cooperativaId del token

---

## 🧪 Plan de Testing

### 1. Tests de Migración
- Verificar que todos los datos se migran correctamente
- Validar integridad referencial
- Confirmar que no se pierden datos

### 2. Tests de Funcionalidad
- Login en múltiples cooperativas
- Creación de usuarios existentes en nuevas cooperativas
- Vinculación de personas a usuarios existentes
- Gestión de roles por cooperativa

### 3. Tests de Performance
- Benchmarks antes y después de la migración
- Verificar que las consultas mantienen performance
- Validar índices efectivos

---

## 📅 Cronograma de Implementación

### Fase 1: Preparación (1-2 días)
- [ ] Backup completo de la base de datos
- [ ] Crear entorno de testing
- [ ] Revisar y ajustar el plan de migración

### Fase 2: Implementación del Schema (1 día)
- [ ] Crear nuevos modelos en Prisma
- [ ] Generar y ejecutar migraciones
- [ ] Migrar datos existentes

### Fase 3: Actualización del Código (2-3 días)
- [ ] Actualizar servicios de autenticación
- [ ] Modificar PersonasService
- [ ] Actualizar guards y decorators
- [ ] Ajustar DTOs y responses

### Fase 4: Testing y Validación (2 días)
- [ ] Tests unitarios y de integración
- [ ] Validación manual de funcionalidades
- [ ] Performance testing
- [ ] Documentación de cambios

### Fase 5: Deploy y Monitoreo (1 día)
- [ ] Deploy a staging
- [ ] Validación en ambiente real
- [ ] Deploy a producción
- [ ] Monitoreo post-deploy

---

## 🚀 Beneficios Post-Migración

1. **Flexibilidad**: Usuarios pueden ser socios de múltiples cooperativas
2. **Eficiencia**: Un solo registro de usuario para toda la plataforma
3. **Escalabilidad**: Facilita crecimiento y adquisiciones
4. **UX Mejorada**: Un solo login para múltiples cooperativas
5. **Gestión Centralizada**: Datos de usuario unificados

---

*Documentación de Migración Multi-Tenancy - Sistema de Gestión de Cooperativas v2.0*