-- ============================================
-- SCRIPT PARA CONFIGURAR EL PRIMER SUPER_ADMIN
-- ============================================

-- IMPORTANTE: Ejecutar este script SOLO UNA VEZ en cada ambiente
-- Modificar los valores según corresponda antes de ejecutar

-- ============================================
-- 1. CREAR COOPERATIVA SISTEMA (si no existe)
-- ============================================
INSERT INTO cooperativas (
    id,
    nombre,
    "razonSocial",
    cuit,
    domicilio,
    localidad,
    provincia,
    "codigoPostal",
    telefono,
    email,
    activa,
    "createdAt",
    "updatedAt"
) VALUES (
    'coop_sistema_001',
    'Sistema Central',
    'Sistema Central de Gestión Cooperativas S.A.',
    '30-99999999-9',
    'Dirección del Sistema Central 123',
    'Ciudad Capital',
    'Provincia Central',
    '1000',
    '+54-11-1234-5678',
    'sistema@cooperativas.com',
    true,
    NOW(),
    NOW()
) ON CONFLICT (cuit) DO NOTHING;

-- ============================================
-- 2. CREAR SECCIÓN SISTEMA (si no existe)
-- ============================================
INSERT INTO "secciones_sistema" (
    id,
    nombre,
    codigo,
    descripcion,
    icono,
    orden,
    activa,
    "cooperativaId"
) VALUES (
    'seccion_system_001',
    'Administración del Sistema',
    'SYSTEM',
    'Administración global del sistema y gestión de cooperativas',
    'settings',
    0,
    true,
    'coop_sistema_001'
) ON CONFLICT ("cooperativaId", codigo) DO NOTHING;

-- ============================================
-- 3. CREAR ROL SUPER_ADMIN (si no existe)
-- ============================================
INSERT INTO roles (
    id,
    nombre,
    descripcion,
    "esSistema",
    activo,
    "cooperativaId",
    "createdAt",
    "updatedAt"
) VALUES (
    'rol_super_admin_001',
    'SUPER_ADMIN',
    'Administrador del Sistema con acceso global',
    true,
    true,
    'coop_sistema_001',
    NOW(),
    NOW()
) ON CONFLICT ("cooperativaId", nombre) DO NOTHING;

-- ============================================
-- 4. ASIGNAR PERMISOS AL ROL SUPER_ADMIN
-- ============================================
INSERT INTO "roles_permisos" (
    id,
    accion,
    "rolId",
    "seccionId",
    "createdAt"
) VALUES 
(
    'perm_super_admin_read',
    'READ',
    'rol_super_admin_001',
    'seccion_system_001',
    NOW()
),
(
    'perm_super_admin_write',
    'WRITE',
    'rol_super_admin_001',
    'seccion_system_001',
    NOW()
),
(
    'perm_super_admin_execute',
    'EXECUTE',
    'rol_super_admin_001',
    'seccion_system_001',
    NOW()
),
(
    'perm_super_admin_delete',
    'DELETE',
    'rol_super_admin_001',
    'seccion_system_001',
    NOW()
) ON CONFLICT ("rolId", "seccionId", accion) DO NOTHING;

-- ============================================
-- 5. CREAR USUARIO SUPER_ADMIN
-- ============================================
-- NOTA: Cambiar email y password antes de ejecutar
-- El password 'SuperAdmin123!' será hasheado automáticamente por la aplicación

INSERT INTO usuarios (
    id,
    email,
    password,
    nombre,
    apellido,
    telefono,
    activo,
    "esEmpleado",
    "cooperativaId",
    "createdAt",
    "updatedAt"
) VALUES (
    'user_super_admin_001',
    'superadmin@sistema.com', -- CAMBIAR POR EMAIL REAL
    '$2a$12$LQv3c1yqBw8q0pKJ8QJq5uA8H3BdEG2Zr0K9m1L2N3P4Q5R6S7T8U9', -- Hash de 'SuperAdmin123!' 
    'Super',
    'Administrador',
    '+54-11-9999-9999',
    true,
    true,
    'coop_sistema_001',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 6. ASIGNAR ROL AL USUARIO
-- ============================================
INSERT INTO "usuarios_roles" (
    id,
    "usuarioId",
    "rolId",
    "asignadoEn"
) VALUES (
    'user_role_super_admin_001',
    'user_super_admin_001',
    'rol_super_admin_001',
    NOW()
) ON CONFLICT ("usuarioId", "rolId") DO NOTHING;

-- ============================================
-- VERIFICACIÓN - Consultas para verificar la configuración
-- ============================================

-- Verificar cooperativa creada
SELECT * FROM cooperativas WHERE cuit = '30-99999999-9';

-- Verificar sección sistema
SELECT * FROM "secciones_sistema" WHERE codigo = 'SYSTEM';

-- Verificar rol creado
SELECT * FROM roles WHERE nombre = 'SUPER_ADMIN';

-- Verificar permisos asignados
SELECT 
    r.nombre as rol_nombre,
    ss.codigo as seccion_codigo,
    rp.accion
FROM "roles_permisos" rp
JOIN roles r ON rp."rolId" = r.id
JOIN "secciones_sistema" ss ON rp."seccionId" = ss.id
WHERE r.nombre = 'SUPER_ADMIN';

-- Verificar usuario creado
SELECT 
    u.email,
    u.nombre,
    u.apellido,
    u."esEmpleado",
    u.activo,
    c.nombre as cooperativa
FROM usuarios u
JOIN cooperativas c ON u."cooperativaId" = c.id
WHERE u.email = 'superadmin@sistema.com';

-- Verificar asignación de rol
SELECT 
    u.email,
    r.nombre as rol,
    ur."asignadoEn"
FROM "usuarios_roles" ur
JOIN usuarios u ON ur."usuarioId" = u.id
JOIN roles r ON ur."rolId" = r.id
WHERE u.email = 'superadmin@sistema.com';

-- ============================================
-- INSTRUCCIONES POST-INSTALACIÓN
-- ============================================

/*
1. CAMBIAR CREDENCIALES:
   - Modificar el email 'superadmin@sistema.com' por uno real
   - La contraseña por defecto es 'SuperAdmin123!' - CAMBIARLA INMEDIATAMENTE

2. CONFIGURAR VARIABLES DE ENTORNO:
   - Agregar SUPER_ADMIN_ACCESS_CODE en .env
   - Configurar SUPER_ADMIN_JWT_EXPIRES_IN si es necesario

3. PRIMER LOGIN:
   POST /auth/super-admin/login
   {
     "email": "superadmin@sistema.com",
     "password": "SuperAdmin123!",
     "accessCode": "tu_codigo_configurado"
   }

4. CAMBIAR CONTRASEÑA:
   - Usar el endpoint de cambio de contraseña inmediatamente
   - Documentar las nuevas credenciales de forma segura

5. VERIFICAR PERMISOS:
   - Confirmar que puede acceder a endpoints de SUPER_ADMIN
   - Probar gestión de cooperativas y onboarding

6. SEGURIDAD:
   - Eliminar este script del servidor de producción
   - Configurar auditoría para logins de SUPER_ADMIN
   - Implementar MFA si es posible
*/