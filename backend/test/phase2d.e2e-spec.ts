import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/common/constants';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Phase 2D CRM & Customer Intelligence E2E Test Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let orgId: string;
  let otherOrgId: string;
  let userId: string;

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

    // Bootstrap test organization and user
    await prisma.runInSystemContext(async (tx) => {
      let org = await tx.organization.findFirst({ where: { code: 'BIZPRO-CORP' } });
      if (!org) {
        org = await tx.organization.create({
          data: {
            code: 'BIZPRO-CORP',
            name: 'BizPro Test Corp',
            taxCode: '0109988776',
            email: 'contact@bizpro.vn',
            phone: '02439998888',
          },
        });
      }
      orgId = org.id;

      let otherOrg = await tx.organization.findFirst({ where: { code: 'OTHER-CORP' } });
      if (!otherOrg) {
        otherOrg = await tx.organization.create({
          data: {
            code: 'OTHER-CORP',
            name: 'Other Corp Ltd',
            taxCode: '0309988776',
            email: 'other@corp.vn',
            phone: '02839998888',
          },
        });
      }
      otherOrgId = otherOrg.id;

      let user = await tx.user.findFirst({ where: { organizationId: orgId } });
      if (!user) {
        user = await tx.user.create({
          data: {
            organizationId: orgId,
            email: 'sales.admin@bizpro.vn',
            passwordHash: 'dummy',
            fullName: 'Nguyễn Văn Sales Admin',
          },
        });
      }
      userId = user.id;
    });
  });

  afterAll(async () => {
    await app.close();
  });

  /* --------------------------------------------------------------------------
     1. CUSTOMER & VIETNAMESE MST/PHONE VALIDATION
     -------------------------------------------------------------------------- */
  describe('Customer Management & Validation', () => {
    it('POST /api/crm/customers - should reject non-numeric MST (e.g. "đá")', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/crm/customers')
        .send({
          name: 'Công ty Thử Nghiệm MST Sai',
          taxCode: 'đá', // INVALID: letters
          phone: '0901234567',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(JSON.stringify(res.body)).toContain('Mã số thuế không hợp lệ');
    });

    it('POST /api/crm/customers - should reject invalid phone number', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/crm/customers')
        .send({
          name: 'Công ty Thử Nghiệm SĐT Sai',
          taxCode: '0109988776',
          phone: '123456', // INVALID: not Vietnamese prefix
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(JSON.stringify(res.body)).toContain('Số điện thoại không đúng định dạng');
    });

    it('POST /api/crm/customers - should create a valid customer with 10-digit MST', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/crm/customers')
        .send({
          name: 'Công ty Cổ phần Giải pháp Công nghệ ABC',
          customerType: 'BUSINESS',
          taxCode: '0109988776',
          phone: '0901234567',
          email: 'contact@abc-tech.vn',
          address: '123 Cầu Giấy, Hà Nội',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.customerCode).toMatch(/^KH-/);
      expect(res.body.data.taxCode).toBe('0109988776');
    });

    it('GET /api/crm/customers - should return customer list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/crm/customers')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
    });

    it('Targeted Concurrency Check: 10 concurrent customer creation requests - zero duplicate codes committed', async () => {
      const promises = Array.from({ length: 10 }).map((_, i) =>
        request(app.getHttpServer())
          .post('/api/crm/customers')
          .send({
            name: `Khách hàng đồng thời #${i + 1}`,
            phone: `090100000${i}`,
          }),
      );

      const results = await Promise.allSettled(promises);
      const createdCodes = new Set<string>();

      for (const r of results) {
        if (r.status === 'fulfilled' && r.value.status === 201) {
          const code = r.value.body.data.customerCode;
          expect(createdCodes.has(code)).toBe(false);
          createdCodes.add(code);
        }
      }

      const customersInDb = await prisma.runInSystemContext((tx) =>
        tx.customer.findMany({
          where: { organizationId: orgId, name: { contains: 'Khách hàng đồng thời' } },
        }),
      );
      const dbCodes = customersInDb.map((c) => c.customerCode);
      const uniqueDbCodes = new Set(dbCodes);
      expect(dbCodes.length).toBe(uniqueDbCodes.size);
    });

    it('Cross-tenant Isolation: User in Org A cannot access or modify Customer in Org B', async () => {
      const custB = await prisma.runInSystemContext((tx) =>
        tx.customer.create({
          data: {
            organizationId: otherOrgId,
            customerCode: `KH-ORG-B-${Date.now().toString().slice(-4)}`,
            name: 'Khách hàng của Tổ chức B',
          },
        }),
      );

      const res = await request(app.getHttpServer())
        .get(`/api/crm/customers/${custB.id}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.statusCode).toBe(404);
    });
  });

  /* --------------------------------------------------------------------------
     2. LEAD MANAGEMENT
     -------------------------------------------------------------------------- */
  let testLeadId: string;

  describe('Lead Management & Lifecycle', () => {
    it('POST /api/crm/leads - should create a new Lead', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/crm/leads')
        .send({
          contactName: 'Trần Thị Mai',
          companyName: 'Công ty TNHH Thời Trang Mai Mai',
          email: 'mai.tran@maimai.vn',
          phone: '0987654321',
          source: 'Facebook Ads',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('NEW');
      expect(res.body.data.contactName).toBe('Trần Thị Mai');
      testLeadId = res.body.data.id;
    });

    it('PATCH /api/crm/leads/:id - should update lead status to QUALIFIED', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/crm/leads/${testLeadId}`)
        .send({
          status: 'QUALIFIED',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('QUALIFIED');
    });
  });

  /* --------------------------------------------------------------------------
     3. ATOMIC 1-TRANSACTION LEAD CONVERSION & CONCURRENCY SAFEGUARD
     Lead -> Customer + Contact + Deal
     -------------------------------------------------------------------------- */
  describe('Atomic 1-Transaction Lead Conversion', () => {
    it('POST /api/crm/leads/:id/convert - should convert Lead into Customer + Contact + Deal in 1 transaction', async () => {
      // 1. Create a dedicated lead for conversion
      const leadRes = await request(app.getHttpServer())
        .post('/api/crm/leads')
        .send({
          contactName: 'Lê Hoàng Nam',
          companyName: 'Tập đoàn Nam Hoàng Gia',
          email: 'nam.le@namhoang.vn',
          phone: '0912345678',
          source: 'Google Search',
        })
        .expect(201);

      const targetLeadId = leadRes.body.data.id;

      // 2. Execute conversion
      const convertRes = await request(app.getHttpServer())
        .post(`/api/crm/leads/${targetLeadId}/convert`)
        .send({
          dealTitle: 'Gói ERP Enterprise cho Nam Hoàng Gia',
          dealAmount: 150000000,
        })
        .expect(201);

      expect(convertRes.body.success).toBe(true);
      const { customer, contact, deal, lead } = convertRes.body.data;

      // Customer created
      expect(customer.id).toBeDefined();
      expect(customer.name).toBe('Tập đoàn Nam Hoàng Gia');
      expect(customer.customerCode).toMatch(/^KH-/);

      // Contact created
      expect(contact.id).toBeDefined();
      expect(contact.email).toBe('nam.le@namhoang.vn');

      // Deal created and linked to customer & contact
      expect(deal.id).toBeDefined();
      expect(deal.customerId).toBe(customer.id);
      expect(deal.contactId).toBe(contact.id);
      expect(deal.title).toBe('Gói ERP Enterprise cho Nam Hoàng Gia');
      expect(Number(deal.amount)).toBe(150000000);

      // Lead status updated to CONVERTED
      expect(lead.status).toBe('CONVERTED');
      expect(lead.convertedCustomerId).toBe(customer.id);
      expect(lead.convertedContactId).toBe(contact.id);
    });

    it('Targeted Concurrency Check: 10 concurrent requests to convert the EXACT SAME lead: exactly 1 succeeds, 9 fail with 400', async () => {
      // 1. Create a lead
      const leadRes = await request(app.getHttpServer())
        .post('/api/crm/leads')
        .send({
          contactName: 'Phạm Minh Đức',
          companyName: 'Công ty Cơ Khí Minh Đức',
          email: 'duc.pham@minhduc.vn',
          phone: '0934567890',
        })
        .expect(201);

      const concurrentLeadId = leadRes.body.data.id;

      // 2. Fire 10 concurrent conversion requests
      const promises = Array.from({ length: 10 }).map(() =>
        request(app.getHttpServer())
          .post(`/api/crm/leads/${concurrentLeadId}/convert`)
          .send({ dealTitle: 'Cơ hội đồng thời' }),
      );

      const results = await Promise.allSettled(promises);

      let successCount = 0;
      let failureCount = 0;

      for (const r of results) {
        if (r.status === 'fulfilled') {
          if (r.value.status === 201) successCount++;
          else if (r.value.status === 400) failureCount++;
        }
      }

      // Exactly 1 succeeds, 9 fail with HTTP 400!
      expect(successCount).toBe(1);
      expect(failureCount).toBe(9);

      // 3. Verify exactly 1 deal was created for this lead in the database
      const dealsCount = await prisma.runInSystemContext((tx) =>
        tx.deal.count({ where: { leadId: concurrentLeadId } }),
      );
      expect(dealsCount).toBe(1);
    });
  });

  /* --------------------------------------------------------------------------
     4. DEAL MANAGEMENT & KANBAN STAGE MACHINE
     -------------------------------------------------------------------------- */
  describe('Deal Pipeline & Kanban Stage Machine', () => {
    let dealId: string;
    let wonStageId: string;

    it('GET /api/crm/pipelines - should return default pipeline with stages', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/crm/pipelines')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const pipeline = res.body.data[0];
      expect(pipeline.stages.length).toBeGreaterThanOrEqual(6);

      const wonStage = pipeline.stages.find((s: any) => s.isWon);
      expect(wonStage).toBeDefined();
      wonStageId = wonStage.id;
    });

    it('POST /api/crm/deals - should create a new deal', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/crm/deals')
        .send({
          title: 'Hợp đồng Chuyển đổi số 2026',
          amount: 500000000,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.status).toBe('OPEN');
      dealId = res.body.data.id;
    });

    it('PATCH /api/crm/deals/:id/stage - should move deal to WON stage and record history', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/crm/deals/${dealId}/stage`)
        .send({
          stageId: wonStageId,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('WON');
      expect(res.body.data.stageId).toBe(wonStageId);

      // Check stage history record
      const detail = await request(app.getHttpServer())
        .get(`/api/crm/deals/${dealId}`)
        .expect(200);

      expect(detail.body.data.stageHistories.length).toBeGreaterThanOrEqual(2);
    });

    it('Targeted Concurrency Check: Concurrent stage updates on the same deal remain atomic', async () => {
      const promises = [
        request(app.getHttpServer()).patch(`/api/crm/deals/${dealId}/stage`).send({ stageId: wonStageId }),
        request(app.getHttpServer()).patch(`/api/crm/deals/${dealId}/stage`).send({ stageId: wonStageId }),
      ];

      const results = await Promise.allSettled(promises);
      for (const r of results) {
        if (r.status === 'fulfilled') {
          expect([200, 400]).toContain(r.value.status);
        }
      }

      const deal = await prisma.runInSystemContext((tx) =>
        tx.deal.findFirst({ where: { id: dealId } }),
      );
      expect(deal?.status).toBe('WON');
    });
  });

  /* --------------------------------------------------------------------------
     5. ACTIVITIES
     -------------------------------------------------------------------------- */
  describe('Activity Management', () => {
    it('POST /api/crm/activities - should create a CALL activity', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/crm/activities')
        .send({
          type: 'CALL',
          subject: 'Gọi điện khảo sát nhu cầu ERP',
          description: 'Khách hàng quan tâm phân hệ Kho và CRM',
          relatedEntityType: 'LEAD',
          relatedEntityId: testLeadId,
          status: 'PENDING',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.type).toBe('CALL');
    });
  });

  /* --------------------------------------------------------------------------
     6. CRM DASHBOARD REAL METRICS
     -------------------------------------------------------------------------- */
  describe('CRM Dashboard Real Aggregated Metrics', () => {
    it('GET /api/crm/dashboard - should return real database-derived metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/crm/dashboard')
        .expect(200);

      expect(res.body.success).toBe(true);
      const metrics = res.body.data;

      expect(metrics.leads.total).toBeGreaterThan(0);
      expect(metrics.customers.total).toBeGreaterThan(0);
      expect(metrics.deals.total).toBeGreaterThan(0);
      expect(typeof metrics.deals.pipelineValue).toBe('number');
      expect(typeof metrics.leads.conversionRate).toBe('number');
    });
  });
});
