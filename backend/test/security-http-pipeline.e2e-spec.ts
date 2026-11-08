import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/common/constants';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Security HTTP Pipeline E2E (401 Unauthenticated & 403 Forbidden)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let ordinaryUserToken: string;

  const mockTx: Record<string, any> = new Proxy({} as Record<string, any>, {
    get: (target, prop: string) => {
      if (typeof prop === 'string' && !(prop in target)) {
        target[prop] = {
          findUnique: jest.fn().mockImplementation((args?: any) => {
            if (args?.where?.id === 'session-ord-1') {
              return Promise.resolve({
                id: 'session-ord-1',
                userId: 'user-ord-1',
                organizationId: 'org-test-1',
                status: 'ACTIVE',
                revokedAt: null,
                expiresAt: new Date(Date.now() + 3600000),
                user: {
                  id: 'user-ord-1',
                  email: 'ordinary@bizpro.vn',
                  fullName: 'Ordinary Employee',
                  organizationId: 'org-test-1',
                  status: 'ACTIVE',
                  authVersion: 1,
                  isSuperAdmin: false,
                },
              });
            }
            return Promise.resolve({ id: 'mock-id', code: 'MOCK', status: 'ACTIVE', passwordHash: 'mock-hash' });
          }),
          findFirst: jest.fn().mockResolvedValue({ id: 'mock-id', code: 'BIZPRO-CORP', status: 'ACTIVE', passwordHash: 'mock-hash' }),
          findMany: jest.fn().mockImplementation((args?: any) => {
            if (args?.where?.userId === 'user-ord-1') {
              return Promise.resolve([]); // Ordinary user with zero role permissions
            }
            return Promise.resolve([]);
          }),
          create: jest.fn().mockResolvedValue({ id: 'mock-id', code: 'MOCK' }),
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
          update: jest.fn().mockResolvedValue({ id: 'mock-id', code: 'MOCK' }),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          upsert: jest.fn().mockResolvedValue({ id: 'mock-id', code: 'MOCK' }),
          delete: jest.fn().mockResolvedValue({ id: 'mock-id' }),
          deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
          count: jest.fn().mockResolvedValue(1),
        };
      }
      return target[prop];
    },
  });

  const mockPrisma = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $queryRaw: jest.fn().mockResolvedValue([{ '1': 1 }]),
    runInSystemContext: jest.fn(async (cb) => cb(mockTx)),
    runInTenantContext: jest.fn(async (_orgId, cb) => cb(mockTx)),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    ordinaryUserToken = jwtService.sign({
      sub: 'user-ord-1',
      email: 'ordinary@bizpro.vn',
      orgId: 'org-test-1',
      sessionId: 'session-ord-1',
      authVersion: 1,
    });
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Unauthenticated HTTP Requests strictly return 401 Unauthorized', () => {
    it('/api/crm/leads (GET) returns 401 when unauthenticated', async () => {
      const res = await request(app.getHttpServer()).get(`/${API_PREFIX}/crm/leads`);
      expect(res.status).toBe(401);
    });

    it('/api/crm/leads (POST) returns 401 when unauthenticated', async () => {
      const res = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/crm/leads`)
        .send({ title: 'Test Lead' });
      expect(res.status).toBe(401);
    });

    it('/api/crm/customers (GET) returns 401 when unauthenticated', async () => {
      const res = await request(app.getHttpServer()).get(`/${API_PREFIX}/crm/customers`);
      expect(res.status).toBe(401);
    });

    it('/api/crm/deals (GET) returns 401 when unauthenticated', async () => {
      const res = await request(app.getHttpServer()).get(`/${API_PREFIX}/crm/deals`);
      expect(res.status).toBe(401);
    });

    it('/api/inventory/products (GET) returns 401 when unauthenticated', async () => {
      const res = await request(app.getHttpServer()).get(`/${API_PREFIX}/inventory/products`);
      expect(res.status).toBe(401);
    });

    it('/api/inventory/uoms (GET) returns 401 when unauthenticated', async () => {
      const res = await request(app.getHttpServer()).get(`/${API_PREFIX}/inventory/uoms`);
      expect(res.status).toBe(401);
    });

    it('/api/users (GET) returns 401 when unauthenticated', async () => {
      const res = await request(app.getHttpServer()).get(`/${API_PREFIX}/users`);
      expect(res.status).toBe(401);
    });

    it('/api/departments (GET) returns 401 when unauthenticated', async () => {
      const res = await request(app.getHttpServer()).get(`/${API_PREFIX}/departments`);
      expect(res.status).toBe(401);
    });

    it('/api/rbac/roles (GET) returns 401 when unauthenticated', async () => {
      const res = await request(app.getHttpServer()).get(`/${API_PREFIX}/rbac/roles`);
      expect(res.status).toBe(401);
    });

    it('/api/organization/current (GET) returns 401 when unauthenticated', async () => {
      const res = await request(app.getHttpServer()).get(`/${API_PREFIX}/organization/current`);
      expect(res.status).toBe(401);
    });
  });

  describe('Authenticated Users Lacking Explicit Permissions strictly return 403 Forbidden', () => {
    it('/api/crm/leads (GET) returns 403 when user lacks crm.leads.read', async () => {
      const res = await request(app.getHttpServer())
        .get(`/${API_PREFIX}/crm/leads`)
        .set('Authorization', `Bearer ${ordinaryUserToken}`);
      expect(res.status).toBe(403);
    });

    it('/api/crm/leads (POST) returns 403 when user lacks crm.leads.write', async () => {
      const res = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/crm/leads`)
        .set('Authorization', `Bearer ${ordinaryUserToken}`)
        .send({ title: 'Test Lead' });
      expect(res.status).toBe(403);
    });

    it('/api/inventory/products (POST) returns 403 when user lacks inventory.products.write', async () => {
      const res = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/inventory/products`)
        .set('Authorization', `Bearer ${ordinaryUserToken}`)
        .send({ name: 'New Item', sku: 'ITEM-01' });
      expect(res.status).toBe(403);
    });

    it('/api/users (GET) returns 403 when user lacks users.read', async () => {
      const res = await request(app.getHttpServer())
        .get(`/${API_PREFIX}/users`)
        .set('Authorization', `Bearer ${ordinaryUserToken}`);
      expect(res.status).toBe(403);
    });

    it('/api/rbac/roles (POST) returns 403 when user lacks rbac.roles.manage', async () => {
      const res = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/rbac/roles`)
        .set('Authorization', `Bearer ${ordinaryUserToken}`)
        .send({ name: 'Custom Role', code: 'CUSTOM' });
      expect(res.status).toBe(403);
    });
  });
});
