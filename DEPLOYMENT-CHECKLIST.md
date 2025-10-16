# ============================================
# CHECKLIST DE DESPLIEGUE EN PRODUCCIÓN
# COOP-SERVICE-BACKEND
# ============================================

## 📋 **Variables de Entorno - Checklist de Configuración**

### ✅ **CRÍTICAS (Sistema no funciona sin estas)**
- [ ] `DATABASE_URL` - Conexión a PostgreSQL en producción
- [ ] `JWT_SECRET` - Secreto para tokens (mínimo 64 caracteres)
- [ ] `SUPER_ADMIN_ACCESS_CODE` - Código de acceso super admin
- [ ] `NODE_ENV=production` - Modo producción
- [ ] `PORT` - Puerto de la aplicación

### ⚠️ **IMPORTANTES (Funcionalidad limitada sin estas)**  
- [ ] `STORAGE_PATH` - Ruta base para archivos
- [ ] `PAYMENT_ENCRYPTION_KEY` - Encriptación datos de pago
- [ ] `CORS_ORIGINS` - Orígenes permitidos para frontend
- [ ] `JWT_EXPIRES_IN` - Tiempo vida tokens
- [ ] `SUPER_ADMIN_JWT_EXPIRES_IN` - Tiempo vida tokens super admin

### 🔧 **RECOMENDADAS (Mejores prácticas)**
- [ ] `REFRESH_TOKEN_EXPIRES_IN` - Tokens de refresh
- [ ] `JWT_REFRESH_SECRET` - Secreto separado para refresh
- [ ] `LOG_LEVEL` - Nivel de logging
- [ ] `MAX_FILE_SIZE` - Límite tamaño archivos
- [ ] `ALLOWED_FILE_TYPES` - Tipos archivo permitidos

### 📧 **FUTURAS (Para próximas funcionalidades)**
- [ ] `SMTP_*` - Configuración email
- [ ] `SMS_*` - Configuración SMS  
- [ ] Variables de backup S3
- [ ] Variables de monitoreo externo

---

## 🛡️ **Configuraciones de Seguridad Críticas**

### **1. Generación de Secretos Seguros**
```bash
# Generar JWT_SECRET (64 caracteres)
openssl rand -base64 48

# Generar PAYMENT_ENCRYPTION_KEY (32 bytes = 256 bits)
openssl rand -hex 32

# Generar SUPER_ADMIN_ACCESS_CODE
openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
```

### **2. Configuración de Directorios**
```bash
# Crear directorios con permisos correctos
mkdir -p /app/uploads/{kyc,legajos,onboarding}
chmod 755 /app/uploads
chmod 755 /app/uploads/*
chown app:app /app/uploads -R
```

### **3. Configuración CORS**
```javascript
// En producción, especificar orígenes exactos
CORS_ORIGINS="https://app.cooperativas.com,https://admin.cooperativas.com"

// NO usar en producción:
// CORS_ORIGINS="*"  ❌
```

---

## 🗂️ **Variables por Módulo del Sistema**

### **Autenticación (auth/)**
```env
JWT_SECRET=secreto-principal
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=secreto-refresh
REFRESH_TOKEN_EXPIRES_IN=30d
SUPER_ADMIN_ACCESS_CODE=codigo-super-admin
SUPER_ADMIN_JWT_EXPIRES_IN=4h
```

### **Base de Datos (prisma/)**
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
PRISMA_QUERY_LOG=false
```

### **Archivos y Uploads (múltiples módulos)**
```env
STORAGE_PATH=/app/uploads
KYC_UPLOAD_PATH=/app/uploads/kyc
LEGAJOS_UPLOAD_PATH=/app/uploads/legajos
ONBOARDING_UPLOAD_PATH=/app/uploads/onboarding
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

### **Pagos (pagos/)**
```env
PAYMENT_ENCRYPTION_KEY=clave-encriptacion-256bits
```

### **Aplicación Principal (main.ts)**
```env
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://app.cooperativas.com
```

---

## 🚀 **Procedimiento de Despliegue**

### **1. Preparación del Entorno**
```bash
# 1. Clonar repositorio
git clone <repo-url>
cd coop-service-backend

# 2. Copiar template de variables
cp .env.production.template .env

# 3. Editar variables con valores reales
nano .env
```

### **2. Configuración de Base de Datos**
```bash
# 1. Ejecutar migraciones
npx prisma migrate deploy

# 2. Generar cliente Prisma
npx prisma generate

# 3. (Opcional) Ejecutar seeds iniciales
psql $DATABASE_URL -f scripts/setup-super-admin.sql
```

### **3. Build y Start**
```bash
# 1. Instalar dependencias
npm ci --only=production

# 2. Build de la aplicación
npm run build

# 3. Iniciar aplicación
npm run start:prod
```

### **4. Verificación Post-Despliegue**
```bash
# 1. Health check
curl https://api.cooperativas.com/health

# 2. Test de autenticación
curl -X POST https://api.cooperativas.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# 3. Verificar permisos de archivos
ls -la /app/uploads/
```

---

## ⚠️ **Consideraciones Críticas**

### **Seguridad**
1. **Nunca** usar valores por defecto en producción
2. Rotar secretos regularmente (JWT_SECRET, SUPER_ADMIN_ACCESS_CODE)
3. Usar HTTPS obligatorio
4. Configurar rate limiting en proxy/nginx
5. Logs de auditoría para accesos SUPER_ADMIN

### **Rendimiento**
1. Configurar connection pooling en PostgreSQL
2. Límites apropiados para uploads (MAX_FILE_SIZE)
3. Monitoreo de espacio en disco (/app/uploads)
4. Cache de queries frecuentes

### **Monitoreo**
1. Alertas para errores críticos
2. Métricas de uso de la API
3. Monitoring de base de datos
4. Logs centralizados
5. Backup automático diario

### **Disaster Recovery**
1. Backup diario de BD
2. Backup de archivos uploads
3. Procedimiento de restore documentado
4. Rollback plan para deployments

---

## 📞 **Soporte y Contacto**

En caso de problemas durante el despliegue:

1. **Revisar logs**: `tail -f logs/application.log`
2. **Verificar conectividad BD**: `npx prisma db pull`
3. **Verificar variables**: Confirmar que todas las críticas están configuradas
4. **Health endpoint**: Usar `/health` para diagnosticar

**¡Importante!** Mantener este checklist actualizado con nuevas variables que se agreguen al sistema.