import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/common/constants';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { CryptoService } from '../src/auth/crypto.service';

describe('Phase 2G: Cross-Module Integration & Zero-Mock Verification E2E Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let cryptoService: CryptoService;

  let orgId: string;
  let otherOrgId: string;
  let adminToken: string;
  let otherOrgToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new TransformResponseInterceptor(reflector));

    await app.init();
    prisma = app.get(PrismaService);
    authService = app.get(AuthService);
    cryptoService = app.get(CryptoService);

    const defaultPassword = 'Password@123456';
    const passwordHash = await cryptoService.hashPassword(defaultPassword);

    // Bootstrap Org 1
    const org1 = await prisma.runInSystemContext(async (tx) => {
      let org = await tx.organization.findFirst({ where: { code: 'ORG-P2G-MAIN' } });
      if (!org) {
        org = await tx.organization.create({
          data: {
            code: 'ORG-P2G-MAIN',
            name: 'BizPro+ Phase 2G Integration Corp',
            taxCode: '0109988776',
            email: 'main.p2g@bizpro.vn',
            status: 'ACTIVE',
          },
        });
      }

      let user = await tx.user.findFirst({ where: { email: 'admin.p2g@bizpro.vn' } });
      if (!user) {
        user = await tx.user.create({
          data: {
            organizationId: org.id,
            email: 'admin.p2g@bizpro.vn',
            passwordHash,
            fullName: 'Admin P2G Lead',
            status: 'ACTIVE',
          },
        });
      }

      // Assign all permissions
      const allPerms = await tx.permission.findMany({ select: { id: true } });
      let adminRole = await tx.role.findFirst({
        where: { organizationId: org.id, code: 'ADMIN_P2G_ROLE' },
      });
      if (!adminRole) {
        adminRole = await tx.role.create({
          data: {
            organizationId: org.id,
            code: 'ADMIN_P2G_ROLE',
            name: 'Admin P2G Role',
            description: 'Phase 2G Super Admin',
            rolePermissions: {
              create: allPerms.map((p) => ({ permissionId: p.id })),
            },
          },
        });
      }

      const userRole = await tx.userRole.findFirst({
        where: { userId: user.id, roleId: adminRole.id },
      });
      if (!userRole) {
        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: adminRole.id,
          },
        });
      }

      return { org, user };
    });

    orgId = org1.org.id;
    const loginRes = await authService.login(
      { email: 'admin.p2g@bizpro.vn', password: defaultPassword },
      { ipAddress: '127.0.0.1', userAgent: 'TestAgent' },
    );
    adminToken = loginRes.accessToken;

    // Bootstrap Org 2 for Tenant Isolation Check
    const org2 = await prisma.runInSystemContext(async (tx) => {
      let org = await tx.organization.findFirst({ where: { code: 'ORG-P2G-OTHER' } });
      if (!org) {
        org = await tx.organization.create({
          data: {
            code: 'ORG-P2G-OTHER',
            name: 'Competitor Corp Isolator',
            taxCode: '0109988999',
            email: 'competitor.p2g@bizpro.vn',
            status: 'ACTIVE',
          },
        });
      }

      let user = await tx.user.findFirst({ where: { email: 'other.p2g@bizpro.vn' } });
      if (!user) {
        user = await tx.user.create({
          data: {
            organizationId: org.id,
            email: 'other.p2g@bizpro.vn',
            passwordHash,
            fullName: 'Other Org Lead',
            status: 'ACTIVE',
          },
        });
      }

      return { org, user };
    });

    otherOrgId = org2.org.id;
    const loginRes2 = await authService.login(
      { email: 'other.p2g@bizpro.vn', password: defaultPassword },
      { ipAddress: '127.0.0.1', userAgent: 'TestAgent' },
    );
    otherOrgToken = loginRes2.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('TC-P2G-01: Dashboard Metrics Aggregation (/api/reports/dashboard)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/reports/dashboard`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();

    const data = res.body.data;
    expect(data.summary).toBeDefined();
    expect(typeof data.summary.totalRevenue).toBe('number');
    expect(typeof data.summary.totalOrders).toBe('number');
    expect(typeof data.summary.totalCustomers).toBe('number');
    expect(typeof data.summary.availableStock).toBe('number');

    expect(Array.isArray(data.revenueChart)).toBe(true);
    expect(data.revenueChart.length).toBe(12);

    expect(data.crmFunnel).toBeDefined();
    expect(typeof data.crmFunnel.leads).toBe('number');
    expect(typeof data.crmFunnel.winRate).toBe('number');

    expect(data.hrOverview).toBeDefined();
    expect(typeof data.hrOverview.totalEmployees).toBe('number');
  });

  it('TC-P2G-02: CRM Lead to Customer & Deal Conversion', async () => {
    const leadRes = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/crm/leads`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        contactName: 'Trần Thị Thảo',
        companyName: 'Công ty Cổ phần Thảo Nguyên Xanh',
        phone: '0988776655',
        email: 'thao@thaonguyen.vn',
        source: 'Website',
      });

    expect(leadRes.status).toBe(201);
    const leadId = leadRes.body.data.id;

    // Convert Lead
    const convertRes = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/crm/leads/${leadId}/convert`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(convertRes.status).toBe(201);
    expect(convertRes.body.data.customer).toBeDefined();
    expect(convertRes.body.data.deal).toBeDefined();
    expect(convertRes.body.data.customer.name).toBe('Công ty Cổ phần Thảo Nguyên Xanh');
  });

  it('TC-P2G-03: Multi-Tenant Data Isolation (RLS Security)', async () => {
    // Org 2 cannot read Org 1 Dashboard
    const resOrg2 = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/reports/dashboard`)
      .set('Authorization', `Bearer ${otherOrgToken}`);

    expect(resOrg2.status).toBe(200);
    // Org 2 total customers must be isolated (0 for new org)
    expect(resOrg2.body.data.summary.totalCustomers).toBe(0);
  });

  it('TC-P2G-04: Performance Benchmark P95 < 150ms on Reports', async () => {
    const iterations = 5;
    const durations: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      const res = await request(app.getHttpServer())
        .get(`/${API_PREFIX}/reports/dashboard`)
        .set('Authorization', `Bearer ${adminToken}`);
      const duration = Date.now() - start;
      durations.push(duration);
      expect(res.status).toBe(200);
    }

    durations.sort((a, b) => a - b);
    const p95 = durations[Math.floor(durations.length * 0.95)];
    expect(p95).toBeLessThan(150);
  });
});
