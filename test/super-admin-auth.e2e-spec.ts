import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('SuperAdmin Login (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/super-admin/login (POST)', () => {
    it('should login successfully with valid super admin credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/super-admin/login')
        .send({
          email: 'superadmin@sistema.com',
          password: 'SuperAdmin123!',
          accessCode: process.env.SUPER_ADMIN_ACCESS_CODE,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user).toHaveProperty('isSuperAdmin', true);
          expect(res.body.permissions).toContain('SYSTEM_GLOBAL_ACCESS');
          expect(res.body.permissions).toContain('COOPERATIVAS_MANAGEMENT');
          expect(res.body.permissions).toContain('ONBOARDING_MANAGEMENT');
          expect(res.body.expiresIn).toBe(8 * 60 * 60); // 8 hours
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/super-admin/login')
        .send({
          email: 'invalid@email.com',
          password: 'SuperAdmin123!',
          accessCode: process.env.SUPER_ADMIN_ACCESS_CODE,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Credenciales de SUPER_ADMIN inválidas');
        });
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/super-admin/login')
        .send({
          email: 'superadmin@sistema.com',
          password: 'wrong_password',
          accessCode: process.env.SUPER_ADMIN_ACCESS_CODE,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Credenciales de SUPER_ADMIN inválidas');
        });
    });

    it('should fail with invalid access code when required', () => {
      if (!process.env.SUPER_ADMIN_ACCESS_CODE) {
        // Skip test if access code is not configured
        return;
      }

      return request(app.getHttpServer())
        .post('/auth/super-admin/login')
        .send({
          email: 'superadmin@sistema.com',
          password: 'SuperAdmin123!',
          accessCode: 'wrong_code',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Código de acceso inválido');
        });
    });

    it('should fail if user does not have super admin permissions', async () => {
      // Create a regular user for testing
      const testUser = await prisma.usuario.create({
        data: {
          email: 'regular@test.com',
          password: '$2a$12$hashedpassword',
          nombre: 'Regular',
          apellido: 'User',
          esEmpleado: true,
          activo: true,
          cooperativaId: 'coop_sistema_001',
        },
      });

      try {
        await request(app.getHttpServer())
          .post('/auth/super-admin/login')
          .send({
            email: 'regular@test.com',
            password: 'test_password',
            accessCode: process.env.SUPER_ADMIN_ACCESS_CODE,
          })
          .expect(401)
          .expect((res) => {
            expect(res.body.message).toContain('Sin permisos de SUPER_ADMIN');
          });
      } finally {
        // Cleanup
        await prisma.usuario.delete({
          where: { id: testUser.id },
        });
      }
    });

    it('should include correct permissions in response', () => {
      return request(app.getHttpServer())
        .post('/auth/super-admin/login')
        .send({
          email: 'superadmin@sistema.com',
          password: 'SuperAdmin123!',
          accessCode: process.env.SUPER_ADMIN_ACCESS_CODE,
        })
        .expect(200)
        .expect((res) => {
          const expectedPermissions = [
            'SYSTEM_GLOBAL_ACCESS',
            'COOPERATIVAS_MANAGEMENT',
            'ONBOARDING_MANAGEMENT',
            'USER_MANAGEMENT',
          ];

          expectedPermissions.forEach(permission => {
            expect(res.body.permissions).toContain(permission);
          });

          // Check that JWT contains SUPER_ADMIN role
          const token = res.body.accessToken;
          const payload = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString()
          );
          expect(payload.roles).toContain('SUPER_ADMIN');
        });
    });

    it('should create session with super admin marking', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/super-admin/login')
        .send({
          email: 'superadmin@sistema.com',
          password: 'SuperAdmin123!',
          accessCode: process.env.SUPER_ADMIN_ACCESS_CODE,
        })
        .expect(200);

      // Verify that the session is marked as SUPER_ADMIN
      const refreshToken = response.body.refreshToken;
      const session = await prisma.refreshToken.findFirst({
        where: { token: refreshToken },
      });

      expect(session?.userAgent).toContain('SUPER_ADMIN');
    });
  });

  describe('Super Admin Token Usage', () => {
    let superAdminToken: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/super-admin/login')
        .send({
          email: 'superadmin@sistema.com',
          password: 'SuperAdmin123!',
          accessCode: process.env.SUPER_ADMIN_ACCESS_CODE,
        });

      superAdminToken = response.body.accessToken;
    });

    it('should access super admin only endpoints', () => {
      return request(app.getHttpServer())
        .get('/cooperativas/solicitudes-pendientes')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
    });

    it('should access onboarding configuration endpoints', () => {
      return request(app.getHttpServer())
        .get('/cooperativas/configuracion-onboarding')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
    });

    it('should access user management endpoints', () => {
      return request(app.getHttpServer())
        .get('/cooperativas')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .expect(200);
    });
  });
});

// ============================================
// MANUAL TESTING EXAMPLES
// ============================================

/*
// Using curl for manual testing:

// 1. Login as Super Admin
curl -X POST http://localhost:3000/auth/super-admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@sistema.com",
    "password": "SuperAdmin123!",
    "accessCode": "your_access_code_here"
  }'

// 2. Use the token for super admin operations
curl -X GET http://localhost:3000/cooperativas/solicitudes-pendientes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

// 3. Approve a cooperative request
curl -X POST http://localhost:3000/cooperativas/decidir-solicitud/REF-123456 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "aprobado": true,
    "observaciones": "Documentación verificada y aprobada"
  }'

// 4. Configure onboarding requirements
curl -X PUT http://localhost:3000/cooperativas/configuracion-onboarding \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "documentosRequeridos": ["DNI", "COMPROBANTE_DOMICILIO", "CUIT"],
    "requiereAprobacionManual": true,
    "tiempoLimiteOnboarding": 30
  }'
*/

// ============================================
// POSTMAN COLLECTION EXAMPLE
// ============================================

/*
{
  "info": {
    "name": "Super Admin Login Tests",
    "description": "Collection for testing Super Admin authentication and operations"
  },
  "item": [
    {
      "name": "Super Admin Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"superadmin@sistema.com\",\n  \"password\": \"SuperAdmin123!\",\n  \"accessCode\": \"{{SUPER_ADMIN_ACCESS_CODE}}\"\n}"
        },
        "url": {
          "raw": "{{BASE_URL}}/auth/super-admin/login",
          "host": ["{{BASE_URL}}"],
          "path": ["auth", "super-admin", "login"]
        }
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "if (pm.response.code === 200) {",
              "    const response = pm.response.json();",
              "    pm.environment.set('SUPER_ADMIN_TOKEN', response.accessToken);",
              "    pm.test('Login successful', function () {",
              "        pm.expect(response.success).to.be.true;",
              "        pm.expect(response.user.isSuperAdmin).to.be.true;",
              "    });",
              "}"
            ]
          }
        }
      ]
    },
    {
      "name": "List Pending Cooperative Requests",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{SUPER_ADMIN_TOKEN}}"
          }
        ],
        "url": {
          "raw": "{{BASE_URL}}/cooperativas/solicitudes-pendientes",
          "host": ["{{BASE_URL}}"],
          "path": ["cooperativas", "solicitudes-pendientes"]
        }
      }
    },
    {
      "name": "Approve Cooperative Request",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{SUPER_ADMIN_TOKEN}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"aprobado\": true,\n  \"observaciones\": \"Documentación verificada y aprobada por Super Admin\"\n}"
        },
        "url": {
          "raw": "{{BASE_URL}}/cooperativas/decidir-solicitud/{{REFERENCE_CODE}}",
          "host": ["{{BASE_URL}}"],
          "path": ["cooperativas", "decidir-solicitud", "{{REFERENCE_CODE}}"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "BASE_URL",
      "value": "http://localhost:3000"
    },
    {
      "key": "SUPER_ADMIN_ACCESS_CODE",
      "value": "your_access_code_here"
    }
  ]
}
*/