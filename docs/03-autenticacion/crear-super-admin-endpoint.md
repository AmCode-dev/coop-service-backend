# 🛡️ Endpoint para Crear SUPER_ADMIN

## 📝 Descripción

El endpoint `POST /cooperativas/setup/super-admin` permite crear el primer usuario SUPER_ADMIN del sistema desde la API, sin necesidad de ejecutar scripts SQL manualmente.

## 🚀 Endpoint

```http
POST /cooperativas/setup/super-admin
Content-Type: application/json
```

## 🔓 Características de Seguridad

- **`@Public()`**: No requiere autenticación JWT (solo para setup inicial)
- **Código de Setup**: Requiere código especial configurado en variables de entorno
- **Una sola vez**: Verifica que no exista ya un SUPER_ADMIN
- **Email único**: Verifica que el email no esté en uso

## 📋 Request Body

```json
{
  "email": "admin@tuempresa.com",
  "password": "TuPasswordSeguro2024!",
  "nombre": "Tu Nombre",
  "apellido": "Tu Apellido", 
  "telefono": "+54 11 1234-5678",
  "setupCode": "CODIGO_ULTRA_SECRETO_SETUP_2024"
}
```

### **Campos Requeridos:**
- `email` - Email único del SUPER_ADMIN
- `password` - Contraseña (se hashea automáticamente con bcrypt)
- `nombre` - Nombre del administrador
- `apellido` - Apellido del administrador
- `setupCode` - Código de seguridad para setup inicial

### **Campos Opcionales:**
- `telefono` - Teléfono de contacto

## ⚙️ Configuración Previa

### **1. Variables de Entorno Requeridas**

Agregar a tu `.env`:

```env
# Código para crear el primer SUPER_ADMIN (CAMBIAR en producción)
SUPER_ADMIN_SETUP_CODE="CODIGO_ULTRA_SECRETO_SETUP_2024"

# Código para login posterior de SUPER_ADMIN
SUPER_ADMIN_ACCESS_CODE="CODIGO_ACCESO_SUPER_ADMIN_2024"

# Tiempo de vida de tokens SUPER_ADMIN
SUPER_ADMIN_JWT_EXPIRES_IN="8h"

# JWT principal (ya existente)
JWT_SECRET="tu-clave-secreta-super-segura"
```

### **2. Base de Datos**

Asegurate que las migraciones están aplicadas:

```bash
npx prisma migrate deploy
npx prisma generate
```

## 🎯 Ejemplo de Uso Completo

### **1. Request**
```bash
curl -X POST http://localhost:3000/cooperativas/setup/super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@micooperativa.com",
    "password": "MiPasswordSeguro2024!",
    "nombre": "Juan Carlos",
    "apellido": "Administrador",
    "telefono": "+54 11 9876-5432",
    "setupCode": "CODIGO_ULTRA_SECRETO_SETUP_2024"
  }'
```

### **2. Response Exitosa**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id": "user_clm123abc456",
      "email": "admin@micooperativa.com",
      "nombre": "Juan Carlos",
      "apellido": "Administrador"
    },
    "cooperativaSistema": {
      "id": "coop_system_xyz789",
      "nombre": "Sistema Central"
    },
    "rol": {
      "id": "rol_super_admin_def012",
      "nombre": "SUPER_ADMIN"
    },
    "mensaje": "SUPER_ADMIN creado exitosamente. Sistema listo para usar.",
    "credenciales": {
      "email": "admin@micooperativa.com",
      "nota": "Contraseña configurada según solicitud"
    },
    "proximosPasos": [
      "Configura SUPER_ADMIN_ACCESS_CODE en las variables de entorno",
      "Usa /auth/super-admin/login para acceder",
      "Cambia la contraseña después del primer login"
    ]
  },
  "message": "SUPER_ADMIN creado exitosamente. ¡Sistema listo para usar!"
}
```

## 🛠️ Lo que Crea Automáticamente

### **1. Cooperativa Sistema**
```json
{
  "nombre": "Sistema Central",
  "razonSocial": "Sistema Central de Gestión Cooperativas",
  "cuit": "30-99999999-9",
  "activa": true
}
```

### **2. Sección SYSTEM**
```json
{
  "nombre": "Administración del Sistema",
  "codigo": "SYSTEM",
  "descripcion": "Administración global del sistema y cooperativas"
}
```

### **3. Rol SUPER_ADMIN**
```json
{
  "nombre": "SUPER_ADMIN",
  "descripcion": "Administrador del Sistema con acceso global",
  "esSistema": true,
  "permisos": ["READ", "WRITE", "EXECUTE", "DELETE"]
}
```

### **4. Usuario SUPER_ADMIN**
- Usuario con email y credenciales proporcionadas
- Password hasheado con bcrypt (salt rounds: 12)
- Asociado a la cooperativa sistema
- Rol SUPER_ADMIN asignado automáticamente

## 🔐 Login Post-Creación

Una vez creado el SUPER_ADMIN, puedes hacer login:

```http
POST /auth/super-admin/login
Content-Type: application/json

{
  "email": "admin@micooperativa.com",
  "password": "MiPasswordSeguro2024!",
  "accessCode": "CODIGO_ACCESO_SUPER_ADMIN_2024"
}
```

## ⚠️ Errores Comunes

### **1. Código de Setup Inválido**
```json
{
  "success": false,
  "error": "Código de setup inválido"
}
```
**Solución**: Verificar que `SUPER_ADMIN_SETUP_CODE` en `.env` coincida con el enviado.

### **2. Ya Existe SUPER_ADMIN**
```json
{
  "success": false,
  "error": "Ya existe un SUPER_ADMIN en el sistema"
}
```
**Solución**: Solo se puede crear un SUPER_ADMIN. Si necesitas cambiar, elimina el existente desde la base de datos.

### **3. Email Ya Existe**
```json
{
  "success": false,
  "error": "Ya existe un usuario con el email admin@ejemplo.com"
}
```
**Solución**: Usar un email diferente que no esté registrado.

## 🛡️ Consideraciones de Seguridad

### **Desarrollo**
1. **Usar códigos simples** para facilitar testing
2. **Documentar credenciales** en el equipo
3. **No versionar** archivos `.env` con códigos reales

### **Producción**
1. **Códigos complejos y únicos**: Mínimo 32 caracteres aleatorios
2. **Cambiar códigos** después del setup inicial
3. **Eliminar endpoint** después del primer setup (opcional)
4. **Auditar accesos** de SUPER_ADMIN
5. **Rotar contraseñas** regularmente

## 🎯 Script de Setup Completo

```bash
#!/bin/bash
# setup-super-admin.sh

echo "🚀 Configurando SUPER_ADMIN para el sistema..."

# 1. Configurar variables de entorno
echo "📝 Configurando variables de entorno..."
cat >> .env << EOF
SUPER_ADMIN_SETUP_CODE="$(openssl rand -base64 32 | tr -d '=+/')"
SUPER_ADMIN_ACCESS_CODE="$(openssl rand -base64 32 | tr -d '=+/')"
SUPER_ADMIN_JWT_EXPIRES_IN="8h"
EOF

# 2. Aplicar migraciones
echo "🗄️ Aplicando migraciones de base de datos..."
npx prisma migrate deploy
npx prisma generate

# 3. Iniciar servidor (background)
echo "🚀 Iniciando servidor..."
npm run start:dev &
SERVER_PID=$!
sleep 5

# 4. Crear SUPER_ADMIN
echo "👤 Creando SUPER_ADMIN..."
SETUP_CODE=$(grep SUPER_ADMIN_SETUP_CODE .env | cut -d'=' -f2 | tr -d '"')

curl -X POST http://localhost:3000/cooperativas/setup/super-admin \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"admin@sistema.com\",
    \"password\": \"AdminSecuro2024!\",
    \"nombre\": \"Super\",
    \"apellido\": \"Administrador\",
    \"telefono\": \"+54 11 0000-0000\",
    \"setupCode\": \"$SETUP_CODE\"
  }"

# 5. Detener servidor
kill $SERVER_PID

echo "✅ SUPER_ADMIN configurado exitosamente!"
echo "📧 Email: admin@sistema.com"
echo "🔑 Password: AdminSecuro2024!"
echo "⚠️  CAMBIAR CONTRASEÑA después del primer login"
```

## 🔄 Flujo Recomendado

1. **Setup Inicial**: Usar este endpoint una sola vez
2. **Login**: Usar `/auth/super-admin/login` 
3. **Cambiar Password**: Cambiar contraseña inmediatamente
4. **Gestión Normal**: Usar funciones de SUPER_ADMIN normalmente
5. **Crear Cooperativas**: Aprobar solicitudes de acceso de cooperativas

¡Con este endpoint tienes todo listo para configurar tu SUPER_ADMIN de forma segura y automatizada! 🎉