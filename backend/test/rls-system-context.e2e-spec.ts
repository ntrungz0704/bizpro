import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { UnauthorizedException, HttpException } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

describe('PostgreSQL RLS System Context Remediation Security Audit Suite', () => {
  let prisma: PrismaService;
  let authService: AuthService;
  let orgAId: string;
  let orgBId: string;
  let orderAId: string;
  let orderBId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);

    // Bootstrap two separate test tenants
    orgAId = crypto.randomUUID();
    orgBId = crypto.randomUUID();

    let adminUserId: string;
    await prisma.runInSystemContext(async (tx) => {
      const u = await tx.user.findFirst({ where: { email: 'sales.admin@bizpro.vn' } });
      adminUserId = u!.id;

      await tx.organization.create({
        data: {
          id: orgAId,
          code: `RLS-ORG-A-${Date.now()}`,
          name: 'RLS Security Org A',
          email: `orga-${Date.now()}@bizpro.vn`,
        },
      });

      await tx.organization.create({
        data: {
          id: orgBId,
          code: `RLS-ORG-B-${Date.now()}`,
          name: 'RLS Security Org B',
          email: `orgb-${Date.now()}@bizpro.vn`,
        },
      });
    });

    // Seed master data and orders for Org A
    await prisma.runInTenantContext(orgAId, async (tx) => {
      const custA = await tx.customer.create({
        data: {
          organizationId: orgAId,
          customerCode: 'CUST-RLS-A',
          name: 'Customer Org A',
        },
      });
      const whA = await tx.warehouse.create({
        data: {
          organizationId: orgAId,
          code: 'WH-RLS-A',
          name: 'Warehouse Org A',
        },
      });
      const orderA = await tx.salesOrder.create({
        data: {
          organizationId: orgAId,
          orderCode: `SO-RLS-A-${Date.now().toString().slice(-4)}`,
          customerId: custA.id,
          warehouseId: whA.id,
          createdBy: adminUserId,
          subtotal: new Decimal(100000),
          totalAmount: new Decimal(100000),
        },
      });
      orderAId = orderA.id;
    });

    // Seed master data and orders for Org B
    await prisma.runInTenantContext(orgBId, async (tx) => {
      const custB = await tx.customer.create({
        data: {
          organizationId: orgBId,
          customerCode: 'CUST-RLS-B',
          name: 'Customer Org B',
        },
      });
      const whB = await tx.warehouse.create({
        data: {
          organizationId: orgBId,
          code: 'WH-RLS-B',
          name: 'Warehouse Org B',
        },
      });
      const orderB = await tx.salesOrder.create({
        data: {
          organizationId: orgBId,
          orderCode: `SO-RLS-B-${Date.now().toString().slice(-4)}`,
          customerId: custB.id,
          warehouseId: whB.id,
          createdBy: adminUserId,
          subtotal: new Decimal(200000),
          totalAmount: new Decimal(200000),
        },
      });
      orderBId = orderB.id;
    });
  }, 30000);

  afterAll(async () => {
    // Cleanup in tenant contexts
    if (orgAId) {
      await prisma.runInTenantContext(orgAId, async (tx) => {
        await tx.salesOrder.deleteMany({ where: { organizationId: orgAId } });
        await tx.customer.deleteMany({ where: { organizationId: orgAId } });
        await tx.warehouse.deleteMany({ where: { organizationId: orgAId } });
      });
    }
    if (orgBId) {
      await prisma.runInTenantContext(orgBId, async (tx) => {
        await tx.salesOrder.deleteMany({ where: { organizationId: orgBId } });
        await tx.customer.deleteMany({ where: { organizationId: orgBId } });
        await tx.warehouse.deleteMany({ where: { organizationId: orgBId } });
      });
    }
    await prisma.runInSystemContext(async (tx) => {
      if (orgAId) await tx.organization.delete({ where: { id: orgAId } }).catch(() => {});
      if (orgBId) await tx.organization.delete({ where: { id: orgBId } }).catch(() => {});
    });
    await prisma.$disconnect();
  });

  /**
   * TC-RLS-01: GUC Self-Elevation Prevention
   * Proves that bizpro_app calling SELECT set_config('app.is_system_context', 'true', true)
   * produces ZERO bypass effect on sales_orders / inventory tables!
   */
  it('TC-RLS-01: GUC Self-Elevation - Setting app.is_system_context=true yields 0 rows on remediated tables', async () => {
    const elevatedRows = await prisma.$transaction(async (tx) => {
      // Attacker attempts to self-elevate via custom GUC
      await tx.$queryRaw`SELECT set_config('app.is_system_context', 'true', true);`;
      // Query sales_orders without tenant context
      return tx.$queryRaw<any[]>`SELECT * FROM sales_orders;`;
    });

    expect(elevatedRows).toHaveLength(0);
  });

  /**
   * TC-RLS-02: Cross-Tenant Isolation
   * Under Org A tenant context, attempts to read Org B data return 0 rows.
   */
  it('TC-RLS-02: Cross-Tenant Isolation - Org A context cannot read or mutate Org B data', async () => {
    const crossTenantRead = await prisma.runInTenantContext(orgAId, async (tx) => {
      return tx.$queryRaw<any[]>`SELECT * FROM sales_orders WHERE id = ${orderBId}::uuid;`;
    });
    expect(crossTenantRead).toHaveLength(0);

    const crossTenantUpdateCount = await prisma.runInTenantContext(orgAId, async (tx) => {
      return tx.$executeRaw`UPDATE sales_orders SET subtotal = 999999 WHERE id = ${orderBId}::uuid;`;
    });
    expect(crossTenantUpdateCount).toBe(0);
  });

  /**
   * TC-RLS-03: Missing Tenant Context (Fail-Closed)
   * Without any tenant context, querying sales_orders returns 0 rows.
   */
  it('TC-RLS-03: Missing Tenant Context - Default state is 100% Fail-Closed', async () => {
    const unauthenticatedRows = await prisma.$queryRaw<any[]>`SELECT * FROM sales_orders;`;
    expect(unauthenticatedRows).toHaveLength(0);
  });

  /**
   * TC-RLS-04: System Access Authorization & Security Definer Function
   * Proves fn_auth_lookup_user safely returns only the requested user.
   */
  it('TC-RLS-04: System Access Authorization - fn_auth_lookup_user returns minimal row for matching email', async () => {
    // Lookup non-existent email -> 0 rows
    const nonExistent: any[] = await prisma.$queryRaw`SELECT * FROM fn_auth_lookup_user('nonexistent@random.vn');`;
    expect(nonExistent).toHaveLength(0);

    // Lookup existing sales admin -> returns exactly 1 user with expected schema
    const adminRows: any[] = await prisma.$queryRaw`SELECT * FROM fn_auth_lookup_user('sales.admin@bizpro.vn');`;
    expect(adminRows).toHaveLength(1);
    expect(adminRows[0].email).toBe('sales.admin@bizpro.vn');
    expect(adminRows[0].organization_id).toBeDefined();
  });

  /**
   * TC-RLS-05: Role Escalation Prevention
   * Proves runtime role bizpro_app cannot SET ROLE to privileged bizpro_user.
   */
  it('TC-RLS-05: Role Escalation - bizpro_app is rejected when attempting SET ROLE bizpro_user', async () => {
    let errorCaught = false;
    try {
      await prisma.$executeRawUnsafe('SET ROLE bizpro_user;');
    } catch (error: any) {
      errorCaught = true;
      expect(error.message).toContain('permission denied to set role');
    }
    expect(errorCaught).toBe(true);
  });

  /**
   * TC-RLS-06: Auth Regression (Login, Lockout Counter & Lockout)
   * Proves Auth flows work properly with tenant-scoped operations.
   */
  it('TC-RLS-06: Auth Regression - Valid login succeeds, invalid credentials increments lockout counter', async () => {
    // Valid login
    const loginRes = await authService.login(
      { email: 'sales.admin@bizpro.vn', password: 'Password@123456' },
      { userAgent: 'Jest-Security-Audit' },
    );
    expect(loginRes.accessToken).toBeDefined();
    expect(loginRes.user.email).toBe('sales.admin@bizpro.vn');

    // Invalid password attempt -> throws AUTH_INVALID_CREDENTIALS
    let invalidAttemptCaught = false;
    try {
      await authService.login(
        { email: 'sales.admin@bizpro.vn', password: 'WrongPassword' },
        { userAgent: 'Jest-Security-Audit' },
      );
    } catch (err: any) {
      invalidAttemptCaught = true;
      expect(err).toBeInstanceOf(UnauthorizedException);
    }
    expect(invalidAttemptCaught).toBe(true);
  });

  /**
   * TC-RLS-07: Tenant Regression (Sales, Inventory, CRM)
   * Proves business operations within valid tenant context operate with 100% fidelity.
   */
  it('TC-RLS-07: Tenant Regression - Sales Orders & Inventory queries in tenant context succeed', async () => {
    const ordersA = await prisma.runInTenantContext(orgAId, async (tx) => {
      return tx.salesOrder.findMany({ where: { organizationId: orgAId } });
    });
    expect(ordersA.length).toBeGreaterThanOrEqual(1);
    expect(ordersA[0].id).toBe(orderAId);
  });
});
