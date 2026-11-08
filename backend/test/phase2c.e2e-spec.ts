import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Reflector } from '@nestjs/core';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Phase 2C Inventory Management Core E2E & Concurrency Test Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let orgId: string;
  let userId: string;
  let unitId: string;
  let categoryId: string;
  let warehouseId: string;
  let testProductId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new TransformResponseInterceptor(reflector));
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
    prisma = app.get(PrismaService);

    await prisma.runInSystemContext(async (tx) => {
      let org = await tx.organization.findFirst({ where: { code: 'BIZPRO-CORP' } });
      if (!org) {
        org = await tx.organization.create({
          data: {
            code: 'BIZPRO-CORP',
            name: 'Công ty Cổ phần Giải pháp Doanh nghiệp BizPro+',
            taxCode: '0109988776',
            phone: '02439998888',
            email: 'contact@bizpro.vn',
          },
        });
      }
      orgId = org.id;

      let user = await tx.user.findFirst({ where: { organizationId: orgId } });
      if (!user) {
        user = await tx.user.create({
          data: {
            organizationId: orgId,
            email: 'admin@bizpro.vn',
            passwordHash: 'dummy',
            fullName: 'Quản trị viên',
          },
        });
      }
      userId = user.id;

      let uom = await tx.unitOfMeasure.findFirst({ where: { organizationId: orgId } });
      if (!uom) {
        uom = await tx.unitOfMeasure.create({
          data: { organizationId: orgId, name: 'Cái', symbol: 'cai' },
        });
      }
      unitId = uom.id;

      let cat = await tx.productCategory.findFirst({ where: { organizationId: orgId } });
      if (!cat) {
        cat = await tx.productCategory.create({
          data: { organizationId: orgId, code: 'CAT-TEST', name: 'Danh mục Test' },
        });
      }
      categoryId = cat.id;

      let wh = await tx.warehouse.findFirst({ where: { organizationId: orgId } });
      if (!wh) {
        wh = await tx.warehouse.create({
          data: { organizationId: orgId, code: 'WH-TEST-01', name: 'Kho Test' },
        });
      }
      warehouseId = wh.id;
    });
  });

  afterAll(async () => {
    await app.close();
  });

  /* --------------------------------------------------------------------------
     1. UOM & CATEGORIES
     -------------------------------------------------------------------------- */
  describe('Master Data (UOMs & Categories)', () => {
    it('GET /api/inventory/uoms - should return list of UOMs', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/inventory/uoms')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/inventory/categories - should return product categories', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/inventory/categories')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  /* --------------------------------------------------------------------------
     2. PRODUCTS
     -------------------------------------------------------------------------- */
  describe('Product Catalog Management', () => {
    it('POST /api/inventory/products - should create a new product', async () => {
      const sku = `PROD-${Date.now().toString().slice(-6)}`;
      const res = await request(app.getHttpServer())
        .post('/api/inventory/products')
        .send({
          sku,
          name: 'Sản phẩm Test Concurrency',
          categoryId,
          unitId,
          costPrice: 150000,
          sellingPrice: 250000,
          minStockLevel: 5,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toBe(sku);
      testProductId = res.body.data.id;
    });

    it('POST /api/inventory/products - duplicate SKU in same org should return 409 Conflict', async () => {
      const prod = await prisma.runInSystemContext((tx) =>
        tx.product.findFirst({ where: { id: testProductId } }),
      );

      await request(app.getHttpServer())
        .post('/api/inventory/products')
        .send({
          sku: prod?.sku,
          name: 'Trùng SKU',
          categoryId,
          unitId,
        })
        .expect(409);
    });

    it('GET /api/inventory/products - should return paginated list of products', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/inventory/products')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toBeDefined();
      expect(res.body.data.total).toBeGreaterThan(0);
    });
  });

  /* --------------------------------------------------------------------------
     3. STOCK RECEIPTS & LEDGER
     -------------------------------------------------------------------------- */
  describe('Stock Receipts & Double-Entry Ledger', () => {
    let receiptId: string;

    it('POST /api/inventory/receipts - should create a DRAFT receipt', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/inventory/receipts')
        .send({
          warehouseId,
          note: 'Nhập kho thử nghiệm 10 đơn vị',
          items: [{ productId: testProductId, quantity: 10, unitCost: 150000 }],
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('DRAFT');
      receiptId = res.body.data.id;
    });

    it('POST /api/inventory/receipts/:id/post - should post receipt and increase stock balance to 10', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/inventory/receipts/${receiptId}/post`)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('POSTED');

      // Check balance
      const balRes = await request(app.getHttpServer())
        .get(`/api/inventory/stock-balances?warehouseId=${warehouseId}&productId=${testProductId}`)
        .expect(200);

      expect(balRes.body.data.length).toBe(1);
      expect(Number(balRes.body.data[0].quantityOnHand)).toBe(10);
      expect(balRes.body.data[0].availableQuantity).toBe(10);
    });

    it('POST /api/inventory/receipts/:id/post - posting already posted receipt should return 400', async () => {
      await request(app.getHttpServer())
        .post(`/api/inventory/receipts/${receiptId}/post`)
        .expect(400);
    });

    it('Targeted Final Check: 10 concurrent POST requests on the EXACT SAME receipt: exactly 1 succeeds, 9 fail with 400, balance changes only once', async () => {
      // 0. Create a dedicated product for this test to isolate stock state
      const prodRes = await request(app.getHttpServer())
        .post('/api/inventory/products')
        .send({
          sku: `SKU-TGT-${Date.now().toString().slice(-6)}`,
          name: 'Sản phẩm Test Concurrent Post',
          unitId,
          categoryId,
          costPrice: 100000,
          sellingPrice: 150000,
        })
        .expect(201);
      const targetedProdId = prodRes.body.data.id;

      // 1. Create a draft receipt for 5 units
      const createRes = await request(app.getHttpServer())
        .post('/api/inventory/receipts')
        .send({
          warehouseId,
          note: 'Targeted Concurrent Same Document Test',
          items: [{ productId: targetedProdId, quantity: 5, unitCost: 100000 }],
        })
        .expect(201);

      const targetReceiptId = createRes.body.data.id;

      // 2. Read balance before (should be 0 or null)
      const balBefore = await request(app.getHttpServer())
        .get(`/api/inventory/stock-balances?warehouseId=${warehouseId}&productId=${targetedProdId}`)
        .expect(200);
      const onHandBefore = balBefore.body.data.length > 0 ? Number(balBefore.body.data[0].quantityOnHand) : 0;

      // 3. Fire 10 concurrent requests to POST the EXACT SAME receipt
      const promises = Array.from({ length: 10 }).map(() =>
        request(app.getHttpServer()).post(`/api/inventory/receipts/${targetReceiptId}/post`),
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

      // Exactly 1 request succeeds, 9 fail with HTTP 400
      expect(successCount).toBe(1);
      expect(failureCount).toBe(9);

      // 4. Verify balance increased by EXACTLY 5 (only once!)
      const balAfter = await request(app.getHttpServer())
        .get(`/api/inventory/stock-balances?warehouseId=${warehouseId}&productId=${targetedProdId}`)
        .expect(200);
      const onHandAfter = Number(balAfter.body.data[0].quantityOnHand);

      expect(onHandAfter).toBe(onHandBefore + 5);
    });
  });

  /* --------------------------------------------------------------------------
     4. ATOMIC CONCURRENCY TEST (SECTION 8.4 SPEC)
     -------------------------------------------------------------------------- */
  describe('Concurrency & Pessimistic Locking Test (Section 8.4)', () => {
    it('should handle 20 concurrent issue requests for stock = 10: exactly 10 succeed, 10 fail, final stock = 0, no negative balance', async () => {
      // 1. Verify starting stock is exactly 10
      const balBefore = await request(app.getHttpServer())
        .get(`/api/inventory/stock-balances?warehouseId=${warehouseId}&productId=${testProductId}`)
        .expect(200);
      expect(Number(balBefore.body.data[0].quantityOnHand)).toBe(10);

      // 2. Pre-create 20 draft issues, each requesting 1 unit
      const issueIds: string[] = [];
      for (let i = 0; i < 20; i++) {
        const createRes = await request(app.getHttpServer())
          .post('/api/inventory/issues')
          .send({
            warehouseId,
            note: `Concurrent Issue Test #${i + 1}`,
            items: [{ productId: testProductId, quantity: 1, unitCost: 150000 }],
          })
          .expect(201);
        issueIds.push(createRes.body.data.id);
      }

      expect(issueIds.length).toBe(20);

      // 3. Fire all 20 POST requests concurrently using Promise.allSettled
      const concurrentPromises = issueIds.map((id) =>
        request(app.getHttpServer()).post(`/api/inventory/issues/${id}/post`),
      );

      const results = await Promise.allSettled(concurrentPromises);

      // 4. Count successful (HTTP 201) vs failed (HTTP 400 Out of Stock)
      let successCount = 0;
      let failureCount = 0;

      for (const res of results) {
        if (res.status === 'fulfilled') {
          if (res.value.status === 201) {
            successCount++;
          } else if (res.value.status === 400) {
            failureCount++;
          }
        }
      }

      expect(successCount).toBe(10);
      expect(failureCount).toBe(10);

      // 5. Verify final balance: on_hand MUST be EXACTLY 0 (NEVER NEGATIVE)
      const balAfter = await request(app.getHttpServer())
        .get(`/api/inventory/stock-balances?warehouseId=${warehouseId}&productId=${testProductId}`)
        .expect(200);

      expect(Number(balAfter.body.data[0].quantityOnHand)).toBe(0);
      expect(balAfter.body.data[0].availableQuantity).toBe(0);

      // 6. Verify Stock Ledger has exactly 1 receipt and 10 valid issues
      const ledgerRes = await request(app.getHttpServer())
        .get(`/api/inventory/stock-ledger?productId=${testProductId}`)
        .expect(200);

      const issueTransactions = ledgerRes.body.data.items.filter(
        (t: any) => t.transactionType === 'ISSUE',
      );
      expect(issueTransactions.length).toBe(10);
    });
  });

  /* --------------------------------------------------------------------------
     5. STOCKTAKE (KIỂM KÊ KHO)
     -------------------------------------------------------------------------- */
  describe('Stocktake Management', () => {
    it('POST /api/inventory/stocktakes - should create stocktake and adjust inventory balance', async () => {
      // Create stocktake setting countedQuantity to 15
      const createRes = await request(app.getHttpServer())
        .post('/api/inventory/stocktakes')
        .send({
          warehouseId,
          items: [{ productId: testProductId, countedQuantity: 15 }],
        })
        .expect(201);

      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data.status).toBe('DRAFT');
      const stocktakeId = createRes.body.data.id;

      // Post stocktake
      const postRes = await request(app.getHttpServer())
        .post(`/api/inventory/stocktakes/${stocktakeId}/post`)
        .expect(201);

      expect(postRes.body.success).toBe(true);
      expect(postRes.body.data.status).toBe('COMPLETED');

      // Verify balance is now adjusted to 15
      const balAfter = await request(app.getHttpServer())
        .get(`/api/inventory/stock-balances?warehouseId=${warehouseId}&productId=${testProductId}`)
        .expect(200);

      expect(Number(balAfter.body.data[0].quantityOnHand)).toBe(15);
    });
  });
});
