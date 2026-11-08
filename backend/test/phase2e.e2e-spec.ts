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
import { SalesOrderStatus, ReservationStatus, StockDocStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

describe('Phase 2E: Sales Orders & Fulfillment Core E2E Test Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let cryptoService: CryptoService;

  let orgId: string;
  let otherOrgId: string;
  let adminToken: string;
  let staffToken: string;
  let otherOrgToken: string;

  let customerId: string;
  let otherOrgCustomerId: string;
  let warehouseId: string;
  let otherOrgWarehouseId: string;
  let productAId: string;
  let productBId: string;
  let productCId: string;

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

    await prisma.runInSystemContext(async (tx) => {
      // 1. Primary Organization
      let org = await tx.organization.findFirst({ where: { code: 'BIZPRO-CORP' } });
      if (!org) {
        org = await tx.organization.create({
          data: {
            code: 'BIZPRO-CORP',
            name: 'BizPro Test Corp',
            taxCode: '0109988776',
            email: 'sales-test@bizpro.vn',
            phone: '02439998888',
          },
        });
      }
      orgId = org.id;

      // 2. Secondary Organization for Isolation tests
      let otherOrg = await tx.organization.findFirst({ where: { code: 'OTHER-CORP' } });
      if (!otherOrg) {
        otherOrg = await tx.organization.create({
          data: {
            code: 'OTHER-CORP',
            name: 'Other Corp Ltd',
            taxCode: '0309988776',
            email: 'other-corp@bizpro.vn',
            phone: '02839998888',
          },
        });
      }
      otherOrgId = otherOrg.id;
    });

    await prisma.runInTenantContext(orgId, async (tx) => {

      // Ensure Admin Role in Org A
      let adminRole = await tx.role.findFirst({
        where: { organizationId: orgId, code: 'ADMIN' },
      });
      if (!adminRole) {
        adminRole = await tx.role.create({
          data: {
            organizationId: orgId,
            code: 'ADMIN',
            name: 'Admin',
            isSystem: true,
          },
        });
      }

      // Ensure Staff Role in Org A with limited permissions (no sales.orders.confirm / cancel / fulfillment)
      let staffRole = await tx.role.findFirst({
        where: { organizationId: orgId, code: 'SALES_STAFF' },
      });
      if (!staffRole) {
        staffRole = await tx.role.create({
          data: {
            organizationId: orgId,
            code: 'SALES_STAFF',
            name: 'Nhân viên kinh doanh',
            isSystem: false,
          },
        });
      }

      // Permissions for staff: sales.orders.read, sales.orders.write
      const readPerm = await tx.permission.findFirst({ where: { code: 'sales.orders.read' } });
      const writePerm = await tx.permission.findFirst({ where: { code: 'sales.orders.write' } });
      if (readPerm) {
        await tx.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: staffRole.id, permissionId: readPerm.id } },
          update: {},
          create: { roleId: staffRole.id, permissionId: readPerm.id },
        });
      }
      if (writePerm) {
        await tx.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: staffRole.id, permissionId: writePerm.id } },
          update: {},
          create: { roleId: staffRole.id, permissionId: writePerm.id },
        });
      }

      // Create Admin User
      let adminUser = await tx.user.findFirst({
        where: { email: 'sales.admin@bizpro.vn' },
      });
      if (!adminUser) {
        adminUser = await tx.user.create({
          data: {
            organizationId: orgId,
            email: 'sales.admin@bizpro.vn',
            passwordHash,
            fullName: 'Sales Admin',
          },
        });
      }
      await tx.userRole.upsert({
        where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
        update: {},
        create: { userId: adminUser.id, roleId: adminRole.id },
      });

      // Create Staff User
      let staffUser = await tx.user.findFirst({
        where: { email: 'sales.staff@bizpro.vn' },
      });
      if (!staffUser) {
        staffUser = await tx.user.create({
          data: {
            organizationId: orgId,
            email: 'sales.staff@bizpro.vn',
            passwordHash,
            fullName: 'Sales Staff',
          },
        });
      }
      await tx.userRole.upsert({
        where: { userId_roleId: { userId: staffUser.id, roleId: staffRole.id } },
        update: {},
        create: { userId: staffUser.id, roleId: staffRole.id },
      });



      // Clean up previous test run sales data & reservations in system context
      await tx.fulfillmentItem.deleteMany({ where: { fulfillment: { organizationId: orgId } } });
      await tx.fulfillment.deleteMany({ where: { organizationId: orgId } });
      await tx.inventoryReservation.deleteMany({ where: { organizationId: orgId } });
      await tx.salesOrderStatusHistory.deleteMany({ where: { salesOrder: { organizationId: orgId } } });
      await tx.salesOrderItem.deleteMany({ where: { salesOrder: { organizationId: orgId } } });
      await tx.salesOrder.deleteMany({ where: { organizationId: orgId } });

      // Master data in Org A: Customer, Warehouse, UOM, Category, Products
      let customer = await tx.customer.findFirst({ where: { organizationId: orgId } });
      if (!customer) {
        customer = await tx.customer.create({
          data: {
            organizationId: orgId,
            customerCode: 'KH-TEST-01',
            name: 'Khách Hàng Mua Sắm Test',
            phone: '0901234567',
            address: '123 Phố Huế, Hà Nội',
          },
        });
      }
      customerId = customer.id;

      let warehouse = await tx.warehouse.findFirst({ where: { organizationId: orgId } });
      if (!warehouse) {
        warehouse = await tx.warehouse.create({
          data: {
            organizationId: orgId,
            code: 'KHO-TEST-01',
            name: 'Kho Phân Phối Test',
          },
        });
      }
      warehouseId = warehouse.id;

      let uom = await tx.unitOfMeasure.findFirst({ where: { organizationId: orgId } });
      if (!uom) {
        uom = await tx.unitOfMeasure.create({
          data: { organizationId: orgId, name: 'Cái', symbol: 'cái' },
        });
      }

      let cat = await tx.productCategory.findFirst({ where: { organizationId: orgId } });
      if (!cat) {
        cat = await tx.productCategory.create({
          data: { organizationId: orgId, code: 'DIENTU', name: 'Điện tử' },
        });
      }

      // Products A (stock 100), B (stock 10), C (stock 0)
      let pA = await tx.product.findFirst({ where: { organizationId: orgId, sku: 'SP-A' } });
      if (!pA) {
        pA = await tx.product.create({
          data: {
            organizationId: orgId,
            categoryId: cat.id,
            unitId: uom.id,
            sku: 'SP-A',
            name: 'Sản Phẩm A Cao Cấp',
            sellingPrice: new Decimal(100000),
          },
        });
      }
      productAId = pA.id;

      let pB = await tx.product.findFirst({ where: { organizationId: orgId, sku: 'SP-B' } });
      if (!pB) {
        pB = await tx.product.create({
          data: {
            organizationId: orgId,
            categoryId: cat.id,
            unitId: uom.id,
            sku: 'SP-B',
            name: 'Sản Phẩm B Giới Hạn (Stock 10)',
            sellingPrice: new Decimal(200000),
          },
        });
      }
      productBId = pB.id;

      let pC = await tx.product.findFirst({ where: { organizationId: orgId, sku: 'SP-C' } });
      if (!pC) {
        pC = await tx.product.create({
          data: {
            organizationId: orgId,
            categoryId: cat.id,
            unitId: uom.id,
            sku: 'SP-C',
            name: 'Sản Phẩm C Hết Hàng (Stock 0)',
            sellingPrice: new Decimal(50000),
          },
        });
      }
      productCId = pC.id;

      // Seed inventory balances: A: 100, B: 10, C: 0
      await tx.inventoryBalance.upsert({
        where: {
          organizationId_warehouseId_productId: {
            organizationId: orgId,
            warehouseId,
            productId: productAId,
          },
        },
        update: { quantityOnHand: new Decimal(100) },
        create: {
          organizationId: orgId,
          warehouseId,
          productId: productAId,
          quantityOnHand: new Decimal(100),
        },
      });

      await tx.inventoryBalance.upsert({
        where: {
          organizationId_warehouseId_productId: {
            organizationId: orgId,
            warehouseId,
            productId: productBId,
          },
        },
        update: { quantityOnHand: new Decimal(10) },
        create: {
          organizationId: orgId,
          warehouseId,
          productId: productBId,
          quantityOnHand: new Decimal(10),
        },
      });

      await tx.inventoryBalance.upsert({
        where: {
          organizationId_warehouseId_productId: {
            organizationId: orgId,
            warehouseId,
            productId: productCId,
          },
        },
        update: { quantityOnHand: new Decimal(0) },
        create: {
          organizationId: orgId,
          warehouseId,
          productId: productCId,
          quantityOnHand: new Decimal(0),
        },
      });

      });

    await prisma.runInTenantContext(otherOrgId, async (tx) => {
      // Ensure Other Org Admin Role and user always have ORG_ADMIN role
      let otherAdminRole = await tx.role.findFirst({
        where: { organizationId: otherOrgId, code: 'ORG_ADMIN' },
      });
      if (!otherAdminRole) {
        otherAdminRole = await tx.role.create({
          data: { organizationId: otherOrgId, code: 'ORG_ADMIN', name: 'Org Admin', isSystem: true },
        });
      }

      let otherUser = await tx.user.findFirst({
        where: { email: 'other.user@corp.vn' },
      });
      if (!otherUser) {
        otherUser = await tx.user.create({
          data: {
            organizationId: otherOrgId,
            email: 'other.user@corp.vn',
            passwordHash,
            fullName: 'Other Org User',
          },
        });
      }
      await tx.userRole.upsert({
        where: { userId_roleId: { userId: otherUser.id, roleId: otherAdminRole.id } },
        update: {},
        create: { userId: otherUser.id, roleId: otherAdminRole.id },
      });

      // Master data in Other Org
      let otherCustomer = await tx.customer.findFirst({ where: { organizationId: otherOrgId } });
      if (!otherCustomer) {
        otherCustomer = await tx.customer.create({
          data: {
            organizationId: otherOrgId,
            customerCode: 'KH-OTHER-01',
            name: 'Khách Hàng Other Org',
            phone: '0987654321',
          },
        });
      }
      otherOrgCustomerId = otherCustomer.id;

      let otherWarehouse = await tx.warehouse.findFirst({ where: { organizationId: otherOrgId } });
      if (!otherWarehouse) {
        otherWarehouse = await tx.warehouse.create({
          data: { organizationId: otherOrgId, code: 'KHO-OTHER-01', name: 'Kho Other Org' },
        });
      }
      otherOrgWarehouseId = otherWarehouse.id;
    });

    // Obtain access tokens via AuthService.login
    const adminLogin = await authService.login(
      { email: 'sales.admin@bizpro.vn', password: defaultPassword },
      { userAgent: 'Jest-E2E' },
    );
    adminToken = adminLogin.accessToken;

    const staffLogin = await authService.login(
      { email: 'sales.staff@bizpro.vn', password: defaultPassword },
      { userAgent: 'Jest-E2E' },
    );
    staffToken = staffLogin.accessToken;

    const otherLogin = await authService.login(
      { email: 'other.user@corp.vn', password: defaultPassword },
      { userAgent: 'Jest-E2E' },
    );
    otherOrgToken = otherLogin.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  /* --------------------------------------------------------------------------
     1. CRUD & DECIMAL FINANCIAL ACCURACY
     -------------------------------------------------------------------------- */
  let createdOrderId: string;

  describe('1. CRUD & Financial Calculation (Decimal Accuracy)', () => {
    it('TC-SO-01: Should create a valid DRAFT Sales Order with correct Decimal financials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          warehouseId,
          note: 'Đơn hàng thử nghiệm tài chính chuẩn xác',
          shippingRecipientName: 'Nguyễn Văn Nhận',
          shippingPhone: '0912345678',
          shippingFullAddress: '456 Lê Lợi, Quận 1, TP.HCM',
          items: [
            {
              productId: productAId,
              quantity: 2,
              unitPrice: 100000,
              discountAmount: 10000,
              taxRate: 10,
            },
            {
              productId: productBId,
              quantity: 1,
              unitPrice: 200000,
              discountAmount: 0,
              taxRate: 8,
            },
          ],
        })
        .expect(201);

      const order = res.body.data;
      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
      expect(order.status).toBe(SalesOrderStatus.DRAFT);
      createdOrderId = order.id;

      // Item 1: 2 * 100k = 200k. Disc = 10k -> Base = 190k. Tax 10% = 19k -> Line = 209,000
      // Item 2: 1 * 200k = 200k. Disc = 0k -> Base = 200k. Tax 8% = 16k -> Line = 216,000
      // Subtotal = 400,000 | Discount = 10,000 | Tax = 35,000 | Total = 425,000
      expect(Number(order.subtotal)).toBe(400000);
      expect(Number(order.discountAmount)).toBe(10000);
      expect(Number(order.taxAmount)).toBe(35000);
      expect(Number(order.totalAmount)).toBe(425000);
      expect(Number(order.remainingBalance)).toBe(425000);
      expect(order.items.length).toBe(2);
      expect(order.items[0].skuSnapshot).toBe('SP-A');
      expect(order.items[0].uomSnapshot).toBe('Cái');
    });

    it('TC-SO-02: Should reject sales order with invalid quantity or excessive discount', async () => {
      // Quantity = 0
      await request(app.getHttpServer())
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          warehouseId,
          items: [{ productId: productAId, quantity: 0, unitPrice: 100000 }],
        })
        .expect(400);

      // Discount > Line Base
      await request(app.getHttpServer())
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          warehouseId,
          items: [
            {
              productId: productAId,
              quantity: 1,
              unitPrice: 50000,
              discountAmount: 80000,
            },
          ],
        })
        .expect(400);
    });

    it('GET /api/sales/orders - should list orders with filters and pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/sales/orders?limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.items).toBeInstanceOf(Array);
      expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/sales/orders/:id - should get full order details', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/sales/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.id).toBe(createdOrderId);
      expect(res.body.data.statusHistories.length).toBeGreaterThanOrEqual(1);
    });
  });

  /* --------------------------------------------------------------------------
     2. FUNCTION-LEVEL RBAC ENFORCEMENT
     -------------------------------------------------------------------------- */
  describe('2. Function-Level RBAC Enforcement', () => {
    it('TC-RBAC-01: SALES_STAFF without sales.orders.confirm should receive 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .post(`/api/sales/orders/${createdOrderId}/confirm`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ note: 'Nhân viên kinh doanh cố tình duyệt đơn' })
        .expect(403);
    });

    it('TC-RBAC-02: User with sales.orders.confirm (ADMIN) successfully confirms order', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/sales/orders/${createdOrderId}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ note: 'Quản trị viên duyệt đơn chính thức' })
        .expect(200);

      expect(res.body.data.status).toBe(SalesOrderStatus.CONFIRMED);
      expect(res.body.data.reservations.length).toBe(2);
      expect(res.body.data.reservations[0].status).toBe(ReservationStatus.ACTIVE);
    });
  });

  /* --------------------------------------------------------------------------
     3. MULTI-TENANT ISOLATION (RLS)
     -------------------------------------------------------------------------- */
  describe('3. Multi-Tenant Isolation (Fail-Closed RLS)', () => {
    it('TC-ISO-01: User from Other Org attempting to read Org A order receives 404 Not Found', async () => {
      await request(app.getHttpServer())
        .get(`/api/sales/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${otherOrgToken}`)
        .expect(404);
    });
  });

  /* --------------------------------------------------------------------------
     4. CONCURRENCY & OVERSELLING PREVENTION (POSTGRESQL PESSIMISTIC LOCKING)
     -------------------------------------------------------------------------- */
  describe('4. Concurrency & Overselling Prevention', () => {
    it('TC-CONC-01: 10 concurrent confirmation requests on the SAME order -> exactly 1 succeeds, 9 fail', async () => {
      // Create a fresh draft order with 1 unit of product A
      const createRes = await request(app.getHttpServer())
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          warehouseId,
          items: [{ productId: productAId, quantity: 1, unitPrice: 100000 }],
        })
        .expect(201);

      const targetOrderId = createRes.body.data.id;

      // Fire 10 concurrent confirm requests
      const promises = Array.from({ length: 10 }).map(() =>
        request(app.getHttpServer())
          .post(`/api/sales/orders/${targetOrderId}/confirm`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ note: 'Concurrent test confirm' }),
      );

      const results = await Promise.allSettled(promises);
      const responses = results.map((r) => (r as any).value);

      const successes = responses.filter((res) => res.status === 200);
      const rejections = responses.filter((res) => res.status === 400);

      expect(successes.length).toBe(1);
      expect(rejections.length).toBe(9);

      // Verify DB: exactly 1 ACTIVE reservation
      const reservations = await prisma.runInTenantContext(orgId, (tx) =>
        tx.inventoryReservation.findMany({
          where: { salesOrderId: targetOrderId, status: ReservationStatus.ACTIVE },
        }),
      );
      expect(reservations.length).toBe(1);
    });

    it('TC-CONC-02: Overselling Prevention - Stock = 10, two concurrent orders for 8 units -> exactly 1 succeeds, 1 gets 400 Insufficient Stock', async () => {
      // Product B has onHand = 10
      // Create Order 1 for 8 units
      const o1Res = await request(app.getHttpServer())
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          warehouseId,
          items: [{ productId: productBId, quantity: 8, unitPrice: 200000 }],
        })
        .expect(201);
      const order1Id = o1Res.body.data.id;

      // Create Order 2 for 8 units
      const o2Res = await request(app.getHttpServer())
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          warehouseId,
          items: [{ productId: productBId, quantity: 8, unitPrice: 200000 }],
        })
        .expect(201);
      const order2Id = o2Res.body.data.id;

      // Fire concurrent confirm
      const [res1, res2] = await Promise.all([
        request(app.getHttpServer())
          .post(`/api/sales/orders/${order1Id}/confirm`)
          .set('Authorization', `Bearer ${adminToken}`),
        request(app.getHttpServer())
          .post(`/api/sales/orders/${order2Id}/confirm`)
          .set('Authorization', `Bearer ${adminToken}`),
      ]);

      const statuses = [res1.status, res2.status].sort();
      expect(statuses).toEqual([200, 400]);

      const failedRes = res1.status === 400 ? res1 : res2;
      expect(failedRes.body.message).toContain('không đủ tồn kho khả dụng');

      // Verify that active reserved quantity on product B for these two orders is exactly 8 (not 16!)
      const activeRes = await prisma.runInTenantContext(orgId, (tx) =>
        tx.inventoryReservation.findMany({
          where: {
            salesOrderId: { in: [order1Id, order2Id] },
            status: ReservationStatus.ACTIVE,
          },
        }),
      );
      const totalReserved = activeRes.reduce((sum, r) => sum + Number(r.quantity), 0);
      expect(totalReserved).toBe(8); // Exactly 8 reserved, not 16!

      // Total reserved across all orders for Product B must not exceed on-hand (10)
      const allProductBRes = await prisma.runInTenantContext(orgId, (tx) =>
        tx.inventoryReservation.findMany({
          where: { productId: productBId, status: ReservationStatus.ACTIVE },
        }),
      );
      const grandTotalReserved = allProductBRes.reduce((sum, r) => sum + Number(r.quantity), 0);
      expect(grandTotalReserved).toBeLessThanOrEqual(10);
    });
  });

  /* --------------------------------------------------------------------------
     5. CANCELLATION, WAREHOUSE ACKNOWLEDGMENT & RESERVATION RELEASE
     -------------------------------------------------------------------------- */
  describe('5. Cancellation & Warehouse Acknowledgment', () => {
    it('TC-RES-01: Cancelling CONFIRMED order releases active reservations to RELEASED', async () => {
      // Create and confirm an order for 2 units of product A
      const createRes = await request(app.getHttpServer())
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          warehouseId,
          items: [{ productId: productAId, quantity: 2, unitPrice: 100000 }],
        })
        .expect(201);
      const orderId = createRes.body.data.id;

      await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderId}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Cancel order
      const cancelRes = await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Khách hàng đổi ý muốn hủy đơn' })
        .expect(200);

      expect(cancelRes.body.data.status).toBe(SalesOrderStatus.CANCELLED);

      // Verify reservations in DB are RELEASED
      const releasedRes = await prisma.runInTenantContext(orgId, (tx) =>
        tx.inventoryReservation.findMany({
          where: { salesOrderId: orderId },
        }),
      );
      expect(releasedRes.every((r) => r.status === ReservationStatus.RELEASED)).toBe(true);
    });

    it('TC-WA-01: PROCESSING order cancellation requires persisted Warehouse Acknowledgment', async () => {
      // Create and confirm order
      const createRes = await request(app.getHttpServer())
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          warehouseId,
          items: [{ productId: productAId, quantity: 3, unitPrice: 100000 }],
        })
        .expect(201);
      const orderId = createRes.body.data.id;

      await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderId}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Transition to PROCESSING
      await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderId}/process`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Attempt to cancel without warehouse ack -> 400 Bad Request
      const cancelAttempt = await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Hủy đơn đang đóng gói' })
        .expect(400);

      expect(cancelAttempt.body.message).toContain('bộ phận kho xác nhận dừng nhặt hàng');

      // Warehouse staff records acknowledgment
      await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderId}/warehouse-ack-cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ note: 'Hàng chưa lên xe tải, dừng đóng gói thành công' })
        .expect(200);

      // Now cancel succeeds
      const successfulCancel = await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Đã có xác nhận kho, hủy chính thức' })
        .expect(200);

      expect(successfulCancel.body.data.status).toBe(SalesOrderStatus.CANCELLED);
    });

    it('TC-WA-SEC-01: User without sales.fulfillment.manage receives 403 Forbidden on warehouse-ack-cancel', async () => {
      // Create and confirm order to PROCESSING
      const createRes = await request(app.getHttpServer())
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          warehouseId,
          items: [{ productId: productAId, quantity: 1, unitPrice: 100000 }],
        })
        .expect(201);
      const orderId = createRes.body.data.id;

      await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderId}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderId}/process`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Staff user lacks sales.fulfillment.manage -> 403 Forbidden
      await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderId}/warehouse-ack-cancel`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ note: 'Staff attempt to ack warehouse' })
        .expect(403);
    });

    it('TC-WA-SEC-02: Acknowledgment on Order A cannot be used to cancel Order B', async () => {
      // Create Order A and Order B
      const orderARes = await request(app.getHttpServer())
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          warehouseId,
          items: [{ productId: productAId, quantity: 1, unitPrice: 100000 }],
        })
        .expect(201);
      const orderAId = orderARes.body.data.id;

      const orderBRes = await request(app.getHttpServer())
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          warehouseId,
          items: [{ productId: productAId, quantity: 1, unitPrice: 100000 }],
        })
        .expect(201);
      const orderBId = orderBRes.body.data.id;

      // Confirm & Process both
      await request(app.getHttpServer()).post(`/api/sales/orders/${orderAId}/confirm`).set('Authorization', `Bearer ${adminToken}`).expect(200);
      await request(app.getHttpServer()).post(`/api/sales/orders/${orderAId}/process`).set('Authorization', `Bearer ${adminToken}`).expect(200);
      await request(app.getHttpServer()).post(`/api/sales/orders/${orderBId}/confirm`).set('Authorization', `Bearer ${adminToken}`).expect(200);
      await request(app.getHttpServer()).post(`/api/sales/orders/${orderBId}/process`).set('Authorization', `Bearer ${adminToken}`).expect(200);

      // Ack ONLY Order A
      await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderAId}/warehouse-ack-cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ note: 'Only Ack Order A' })
        .expect(200);

      // Cancelling Order B MUST FAIL because it has no persisted ack
      const cancelB = await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderBId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Attempt to cancel Order B without ack' })
        .expect(400);

      expect(cancelB.body.message).toContain('bộ phận kho xác nhận dừng nhặt hàng');
    });

    it('TC-WA-SEC-03: Client sending warehouseAcknowledged=true in payload is IGNORED without DB record', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          warehouseId,
          items: [{ productId: productAId, quantity: 1, unitPrice: 100000 }],
        })
        .expect(201);
      const orderId = createRes.body.data.id;

      await request(app.getHttpServer()).post(`/api/sales/orders/${orderId}/confirm`).set('Authorization', `Bearer ${adminToken}`).expect(200);
      await request(app.getHttpServer()).post(`/api/sales/orders/${orderId}/process`).set('Authorization', `Bearer ${adminToken}`).expect(200);

      // Client sends forged warehouseAcknowledged flag in cancel body
      const cancelAttempt = await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Spoof attempt', warehouseAcknowledged: true, warehouseAck: true })
        .expect(400);

      expect(cancelAttempt.body.message).toContain('bộ phận kho xác nhận dừng nhặt hàng');
    });

    it('TC-WA-SEC-04: Cross-tenant acknowledgment attempt receives 404 Not Found', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          warehouseId,
          items: [{ productId: productAId, quantity: 1, unitPrice: 100000 }],
        })
        .expect(201);
      const orderId = createRes.body.data.id;

      await request(app.getHttpServer()).post(`/api/sales/orders/${orderId}/confirm`).set('Authorization', `Bearer ${adminToken}`).expect(200);
      await request(app.getHttpServer()).post(`/api/sales/orders/${orderId}/process`).set('Authorization', `Bearer ${adminToken}`).expect(200);

      // User from other Org tries to ack Order of Org A -> 404 Not Found
      await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderId}/warehouse-ack-cancel`)
        .set('Authorization', `Bearer ${otherOrgToken}`)
        .send({ note: 'Cross-tenant ack attack' })
        .expect(404);
    });

    it('TC-WA-SEC-05: Identity Spoofing Prevention - Backend ignores client-sent userId/orgId/changedBy and enforces authenticated JWT identity', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          warehouseId,
          items: [{ productId: productAId, quantity: 1, unitPrice: 100000 }],
        })
        .expect(201);
      const orderId = createRes.body.data.id;

      await request(app.getHttpServer()).post(`/api/sales/orders/${orderId}/confirm`).set('Authorization', `Bearer ${adminToken}`).expect(200);
      await request(app.getHttpServer()).post(`/api/sales/orders/${orderId}/process`).set('Authorization', `Bearer ${adminToken}`).expect(200);

      const fakeUserId = '00000000-0000-0000-0000-000000000000';
      const fakeOrgId = '11111111-1111-1111-1111-111111111111';

      // Attacker attempts to spoof identity by passing forged userId, orgId, and changedBy in body
      await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderId}/warehouse-ack-cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          note: 'Warehouse ack with spoofed body fields',
          userId: fakeUserId,
          organizationId: fakeOrgId,
          changedBy: fakeUserId,
        })
        .expect(200);

      // Verify the recorded acknowledgment in database
      const ackHistory = await prisma.runInTenantContext(orgId, (tx) =>
        tx.salesOrderStatusHistory.findFirst({
          where: {
            salesOrderId: orderId,
            note: { contains: '[WAREHOUSE_ACK_CANCEL]' },
          },
        }),
      );

      expect(ackHistory).toBeDefined();
      // It MUST match the authentic adminUser.id from JWT, NEVER the spoofed fakeUserId!
      const adminUser = await prisma.runInTenantContext(orgId, (tx) =>
        tx.user.findFirst({ where: { email: 'sales.admin@bizpro.vn' } }),
      );
      expect(ackHistory!.changedBy).toBe(adminUser!.id);
      expect(ackHistory!.changedBy).not.toBe(fakeUserId);
    });

    it('TC-PART-CANCEL-01: Partial cancellation - Ordered 100, Fulfill 40, Cancel 60 -> Res 60 RELEASED, 40 StockIssue intact, CANCELLED, further fulfillment blocked', async () => {
      // 1. Create a dedicated product with 100 stock
      const partProd = await prisma.runInTenantContext(orgId, async (tx) => {
        const refProd = await tx.product.findUnique({ where: { id: productAId } });
        const prod = await tx.product.create({
          data: {
            organizationId: orgId,
            categoryId: refProd!.categoryId,
            unitId: refProd!.unitId,
            sku: `SP-PART-${Date.now()}`,
            name: 'Sản phẩm Test Partial Cancellation',
            sellingPrice: new Decimal(50000),
          },
        });
        await tx.inventoryBalance.create({
          data: {
            organizationId: orgId,
            warehouseId,
            productId: prod.id,
            quantityOnHand: new Decimal(100),
          },
        });
        return prod;
      });

      // 2. Create order for 100 units
      const createRes = await request(app.getHttpServer())
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          warehouseId,
          items: [{ productId: partProd.id, quantity: 100, unitPrice: 50000 }],
        })
        .expect(201);
      const partOrderId = createRes.body.data.id;

      // 3. Confirm order -> creates ACTIVE reservation of 100
      await request(app.getHttpServer())
        .post(`/api/sales/orders/${partOrderId}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const resAfterConfirm = await prisma.runInTenantContext(orgId, (tx) =>
        tx.inventoryReservation.findFirst({
          where: { salesOrderId: partOrderId, productId: partProd.id },
        }),
      );
      expect(Number(resAfterConfirm!.quantity)).toBe(100);
      expect(resAfterConfirm!.status).toBe(ReservationStatus.ACTIVE);

      // 4. Fulfill 40 units -> partial delivery
      const fulfillRes = await request(app.getHttpServer())
        .post(`/api/sales/orders/${partOrderId}/fulfill`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          carrierName: 'GHTK',
          trackingNumber: 'GHTK-PART-40',
          items: [{ productId: partProd.id, quantity: 40 }],
        })
        .expect(200);

      expect(fulfillRes.body.data.order.status).toBe(SalesOrderStatus.PARTIALLY_FULFILLED);
      expect(Number(fulfillRes.body.data.order.items[0].fulfilledQuantity)).toBe(40);
      const stockIssueId = fulfillRes.body.data.stockIssue.id;

      // Check remaining ACTIVE reservation is 60
      const resAfterFulfill = await prisma.runInTenantContext(orgId, (tx) =>
        tx.inventoryReservation.findFirst({
          where: { salesOrderId: partOrderId, productId: partProd.id, status: ReservationStatus.ACTIVE },
        }),
      );
      expect(Number(resAfterFulfill!.quantity)).toBe(60);

      // 5. Cancel order -> remaining 60 must be RELEASED
      const cancelRes = await request(app.getHttpServer())
        .post(`/api/sales/orders/${partOrderId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Khách hàng hủy 60 cái còn lại' })
        .expect(200);

      expect(cancelRes.body.data.status).toBe(SalesOrderStatus.CANCELLED);

      // Verify the 60 reservation is now RELEASED
      const releasedRes = await prisma.runInTenantContext(orgId, (tx) =>
        tx.inventoryReservation.findFirst({
          where: { salesOrderId: partOrderId, productId: partProd.id, status: ReservationStatus.RELEASED },
        }),
      );
      expect(releasedRes).toBeDefined();
      expect(Number(releasedRes!.quantity)).toBe(60);

      // 6. Verify StockIssue and Stock Ledger of the 40 already delivered are KEPT INTACT
      const issueInDb = await prisma.runInTenantContext(orgId, (tx) =>
        tx.stockIssue.findUnique({
          where: { id: stockIssueId },
          include: { items: true },
        }),
      );
      expect(issueInDb).toBeDefined();
      expect(issueInDb!.status).toBe(StockDocStatus.POSTED);
      expect(Number(issueInDb!.items[0].quantity)).toBe(40);

      const ledgerEntries = await prisma.runInTenantContext(orgId, (tx) =>
        tx.inventoryTransaction.findMany({
          where: { referenceId: issueInDb!.issueCode, productId: partProd.id },
        }),
      );
      expect(ledgerEntries.length).toBeGreaterThan(0);
      expect(Number(ledgerEntries[0].quantityChange)).toBe(-40);

      // 7. Verify NO FURTHER FULFILLMENT is possible after order is CANCELLED
      await request(app.getHttpServer())
        .post(`/api/sales/orders/${partOrderId}/fulfill`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [{ productId: partProd.id, quantity: 10 }],
        })
        .expect(400);
    });
  });

  /* --------------------------------------------------------------------------
     6. FULFILLMENT & INVENTORY LEDGER INTEGRATION
     -------------------------------------------------------------------------- */
  describe('6. Fulfillment & Inventory Integration', () => {
    let orderToFulfillId: string;

    it('TC-FUL-01: Partial delivery of 4 units on order of 10 units -> PARTIALLY_FULFILLED', async () => {
      // Create order for 10 units of product A
      const createRes = await request(app.getHttpServer())
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId,
          warehouseId,
          items: [{ productId: productAId, quantity: 10, unitPrice: 100000 }],
        })
        .expect(201);
      orderToFulfillId = createRes.body.data.id;

      await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderToFulfillId}/confirm`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const balBefore = await prisma.runInTenantContext(orgId, (tx) =>
        tx.inventoryBalance.findFirst({
          where: { warehouseId, productId: productAId },
        }),
      );
      const onHandBefore = Number(balBefore!.quantityOnHand);

      // Fulfill 4 units
      const fulfillRes = await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderToFulfillId}/fulfill`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          carrierName: 'Giao Hàng Nhanh (GHN)',
          trackingNumber: 'GHN-12345678',
          items: [{ productId: productAId, quantity: 4 }],
        })
        .expect(200);

      const result = fulfillRes.body.data;
      expect(result.order.status).toBe(SalesOrderStatus.PARTIALLY_FULFILLED);
      expect(Number(result.order.items[0].fulfilledQuantity)).toBe(4);
      expect(result.stockIssue.status).toBe(StockDocStatus.POSTED);

      // Check inventory balance was decremented by 4
      const balAfter = await prisma.runInTenantContext(orgId, (tx) =>
        tx.inventoryBalance.findFirst({
          where: { warehouseId, productId: productAId },
        }),
      );
      expect(Number(balAfter!.quantityOnHand)).toBe(onHandBefore - 4);
    });

    it('TC-FUL-02: Over-fulfillment attempt (request 8 units when only 6 remaining) -> 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderToFulfillId}/fulfill`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          items: [{ productId: productAId, quantity: 8 }],
        })
        .expect(400);
    });

    it('TC-FUL-03: Fulfill remaining 6 units -> Order becomes FULFILLED, Reservation becomes FULFILLED', async () => {
      const fulfillRes = await request(app.getHttpServer())
        .post(`/api/sales/orders/${orderToFulfillId}/fulfill`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          carrierName: 'Viettel Post',
          trackingNumber: 'VTP-88889999',
          items: [{ productId: productAId, quantity: 6 }],
        })
        .expect(200);

      const result = fulfillRes.body.data;
      expect(result.order.status).toBe(SalesOrderStatus.FULFILLED);
      expect(Number(result.order.items[0].fulfilledQuantity)).toBe(10);

      // Verify reservation is FULFILLED
      const resRecord = await prisma.runInTenantContext(orgId, (tx) =>
        tx.inventoryReservation.findFirst({
          where: { salesOrderId: orderToFulfillId, productId: productAId },
        }),
      );
      expect(resRecord!.status).toBe(ReservationStatus.FULFILLED);
    });
  });

  /* --------------------------------------------------------------------------
     7. AUDIT TRAIL & SALES DASHBOARD METRICS
     -------------------------------------------------------------------------- */
  describe('7. Audit Trail & Sales Dashboard Metrics', () => {
    it('TC-AUD-01: Verifies status history trail records all lifecycle changes accurately', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/sales/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const histories = res.body.data.statusHistories;
      expect(histories.length).toBeGreaterThanOrEqual(2);
      expect(histories[0].toStatus).toBe(SalesOrderStatus.DRAFT);
      expect(histories[1].toStatus).toBe(SalesOrderStatus.CONFIRMED);
    });

    it('TC-DASH-01: GET /api/sales/dashboard returns real metrics aggregated from PostgreSQL', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/sales/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const metrics = res.body.data;
      expect(metrics.totalOrders).toBeGreaterThanOrEqual(1);
      expect(metrics.revenue).toBeGreaterThanOrEqual(0);
      expect(metrics.byStatus).toBeDefined();
      expect(typeof metrics.fulfillmentRate).toBe('number');
    });

    it('GET /api/sales/fulfillments - lists all fulfillments with tracking info', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/sales/fulfillments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });
});
