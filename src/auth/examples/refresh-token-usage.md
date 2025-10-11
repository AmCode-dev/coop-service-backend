# Uso del Sistema de Refresh Tokens

## Descripción General

El sistema de refresh tokens permite a los usuarios mantener sesiones persistentes sin tener que iniciar sesión constantemente. Esto mejora la experiencia del usuario mientras mantiene la seguridad.

## Características Principales

- **JWT Access Token**: Token de corta duración (1 hora) para acceso a la API
- **Refresh Token**: Token de larga duración (30 días) para renovar access tokens
- **Rotación de Tokens**: Cada vez que se usa un refresh token, se genera uno nuevo
- **Gestión de Sesiones**: Los usuarios pueden ver y revocar sesiones activas
- **Información de Dispositivo**: Seguimiento de dispositivos y ubicaciones

## Endpoints Disponibles

### 1. Login con Refresh Token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@cooperativa.com",
  "password": "password123",
  "cooperativaId": "uuid-cooperativa"
}
```

**Headers opcionales:**
- `X-Device-ID`: Identificador único del dispositivo
- `User-Agent`: Información del navegador/dispositivo

**Respuesta:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...",
  "user": {
    "id": "uuid-usuario",
    "email": "usuario@cooperativa.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "esEmpleado": true,
    "cooperativa": {
      "id": "uuid-cooperativa",
      "nombre": "Cooperativa ABC"
    }
  },
  "expiresIn": 3600,
  "refreshExpiresIn": 2592000
}
```

### 2. Renovar Access Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
}
```

**Respuesta:** Igual que el login, pero con nuevos tokens

### 3. Cerrar Sesión
```http
POST /auth/logout
Content-Type: application/json

{
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
}
```

### 4. Cerrar Todas las Sesiones
```http
POST /auth/logout-all
Authorization: Bearer <access_token>
```

### 5. Ver Sesiones Activas
```http
GET /auth/sessions
Authorization: Bearer <access_token>
```

**Respuesta:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "uuid-session",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "ipAddress": "192.168.1.100",
      "deviceId": "device-123",
      "lastUsedAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T08:00:00Z",
      "expiresAt": "2024-02-14T08:00:00Z",
      "usageCount": 5
    }
  ]
}
```

### 6. Revocar Sesión Específica
```http
DELETE /auth/sessions/{sessionId}
Authorization: Bearer <access_token>
```

## Implementación en el Cliente

### Frontend (JavaScript/TypeScript)

```typescript
class AuthManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async login(email: string, password: string, cooperativaId: string) {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': this.getDeviceId(),
      },
      body: JSON.stringify({ email, password, cooperativaId }),
    });

    const data = await response.json();
    
    if (data.success) {
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('accessToken', this.accessToken);
      localStorage.setItem('refreshToken', this.refreshToken);
      
      // Configurar renovación automática
      this.scheduleTokenRefresh(data.expiresIn);
    }
    
    return data;
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': this.getDeviceId(),
      },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    const data = await response.json();
    
    if (data.success) {
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      
      localStorage.setItem('accessToken', this.accessToken);
      localStorage.setItem('refreshToken', this.refreshToken);
      
      this.scheduleTokenRefresh(data.expiresIn);
    } else {
      // Refresh token inválido, redirigir al login
      this.logout();
      window.location.href = '/login';
    }
    
    return data;
  }

  async logout() {
    if (this.refreshToken) {
      await fetch('/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
    }

    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private scheduleTokenRefresh(expiresIn: number) {
    // Renovar 5 minutos antes de que expire
    const refreshTime = (expiresIn - 300) * 1000;
    
    setTimeout(() => {
      this.refreshAccessToken();
    }, refreshTime);
  }

  private getDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = 'device-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  // Interceptor para requests automáticos
  async makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.accessToken}`,
    };

    let response = await fetch(url, { ...options, headers });

    // Si el token expiró, intentar renovarlo
    if (response.status === 401) {
      await this.refreshAccessToken();
      
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      response = await fetch(url, { ...options, headers });
    }

    return response;
  }
}
```

## Consideraciones de Seguridad

1. **Almacenamiento Seguro**
   - Access Token: Memoria (no persistir)
   - Refresh Token: localStorage/sessionStorage (con cuidado)

2. **Renovación Automática**
   - Renovar 5 minutos antes del vencimiento
   - Manejar errores de red y reintentos

3. **Detección de Fraude**
   - Monitorear cambios de IP/dispositivo
   - Límites de sesiones concurrentes

4. **Limpieza Periódica**
   - Ejecutar `cleanExpiredTokens()` regularmente
   - Configurar job cron o tarea programada

## Comandos de Mantenimiento

```typescript
// En un servicio de mantenimiento
export class TokenMaintenanceService {
  constructor(private refreshTokenService: RefreshTokenService) {}

  @Cron('0 2 * * *') // Cada día a las 2 AM
  async cleanExpiredTokens() {
    const deleted = await this.refreshTokenService.cleanExpiredTokens();
    console.log(`Limpiados ${deleted} tokens expirados`);
  }

  async getTokenStats() {
    return this.refreshTokenService.getTokenStats();
  }
}
```

## Migración desde Sistema Sin Refresh Tokens

1. **Actualizar Cliente**
   - Modificar login para manejar refresh token
   - Implementar renovación automática
   - Actualizar storage de tokens

2. **Mantener Compatibilidad**
   - El access token sigue funcionando igual
   - Refresh token es opcional inicialmente

3. **Despliegue Gradual**
   - Activar refresh tokens por usuario/grupo
   - Monitorear métricas de uso
   - Migrar completamente cuando esté estable