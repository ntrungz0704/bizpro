import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/common/constants';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Phase 2B: Multi-Tenant & Master Data Management (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let defaultOrgId: string;
  let createdRoleId: string;
  let createdUserId: string;
  let createdDeptId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new TransformResponseInterceptor(reflector));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Get default org in system context
    const org = await prisma.runInSystemContext(async (tx) =>
      tx.organization.findFirst({
        where: { code: 'BIZPRO-CORP' },
      }),
    );
    defaultOrgId = org!.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. Dynamic RBAC APIs', () => {
    it('GET /api/rbac/roles - should return system roles', async () => {
      const res = await request(app.getHttpServer())
        .get(`/${API_PREFIX}/rbac/roles`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const codes = res.body.data.map((r: any) => r.code);
      expect(codes).toContain('SUPER_ADMIN');
      expect(codes).toContain('ORG_ADMIN');
      expect(codes).toContain('MANAGER');
      expect(codes).toContain('STAFF');
    });

    it('GET /api/rbac/permissions - should return structured catalog', async () => {
      const res = await request(app.getHttpServer())
        .get(`/${API_PREFIX}/rbac/permissions`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(20);
      const permCodes = res.body.data.map((p: any) => p.code);
      expect(permCodes).toContain('organization.read');
      expect(permCodes).toContain('users.create');
      expect(permCodes).toContain('rbac.roles.manage');
      expect(permCodes).toContain('departments.read');
    });

    it('POST /api/rbac/roles - should create a custom role', async () => {
      const uniqueCode = `AUDITOR_${Date.now()}`;
      const res = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/rbac/roles`)
        .send({
          name: 'Kiểm toán viên Nội bộ',
          code: uniqueCode,
          description: 'Quyền xem xét nhật ký kiểm toán và báo cáo',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe(uniqueCode);
      createdRoleId = res.body.data.id;
    });

    it('PUT /api/rbac/roles/:id/permissions - should update role permissions', async () => {
      const perms = await prisma.runInSystemContext(async (tx) =>
        tx.permission.findMany({ take: 3 }),
      );
      const permIds = perms.map((p) => p.id);

      const res = await request(app.getHttpServer())
        .put(`/${API_PREFIX}/rbac/roles/${createdRoleId}/permissions`)
        .send({ permissionIds: permIds })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.rolePermissions.length).toBe(3);
    });
  });

  describe('2. Department Management APIs', () => {
    it('GET /api/departments - should list departments', async () => {
      const res = await request(app.getHttpServer())
        .get(`/${API_PREFIX}/departments`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const codes = res.body.data.map((d: any) => d.code);
      expect(codes).toContain('TECH');
      expect(codes).toContain('SALES');
    });

    it('POST /api/departments - should create a department', async () => {
      const uniqueCode = `DEPT_${Date.now()}`;
      const res = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/departments`)
        .send({
          name: 'Bộ phận Trí tuệ Nhân tạo',
          code: uniqueCode,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Bộ phận Trí tuệ Nhân tạo');
      createdDeptId = res.body.data.id;
    });

    it('PATCH /api/departments/:id - should update department', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/${API_PREFIX}/departments/${createdDeptId}`)
        .send({ name: 'Bộ phận AI & Tự động hóa' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Bộ phận AI & Tự động hóa');
    });
  });

  describe('3. User Management & Audit Logging', () => {
    it('POST /api/users - should create a user with password hash and role', async () => {
      const uniqueEmail = `testuser_${Date.now()}@bizpro.vn`;
      const res = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/users`)
        .send({
          fullName: 'Trần Văn Kiểm Thử',
          email: uniqueEmail,
          password: 'Password123!',
          phone: '0988776655',
          roleIds: [createdRoleId],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.fullName).toBe('Trần Văn Kiểm Thử');
      expect(res.body.data.email).toBe(uniqueEmail);
      createdUserId = res.body.data.id;

      // Verify audit log created
      const log = await prisma.runInSystemContext(async (tx) =>
        tx.auditLog.findFirst({
          where: { action: 'CREATE_USER', entityId: createdUserId },
        }),
      );
      expect(log).toBeDefined();
    });

    it('GET /api/users - should return user list with roles', async () => {
      const res = await request(app.getHttpServer())
        .get(`/${API_PREFIX}/users`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const user = res.body.data.find((u: any) => u.id === createdUserId);
      expect(user).toBeDefined();
      expect(user.fullName).toBe('Trần Văn Kiểm Thử');
    });

    it('PATCH /api/users/:id/status - should update status and write audit log', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/${API_PREFIX}/users/${createdUserId}/status`)
        .send({ status: 'INACTIVE' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('INACTIVE');

      const log = await prisma.runInSystemContext(async (tx) =>
        tx.auditLog.findFirst({
          where: { action: 'CHANGE_USER_STATUS', entityId: createdUserId },
        }),
      );
      expect(log).toBeDefined();
      expect((log?.newValues as any)?.status).toBe('INACTIVE');
    });
  });
});
