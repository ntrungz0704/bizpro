import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('PostgreSQL Row Level Security (RLS) Isolation E2E Tests', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('RLS: Missing tenant context must FAIL-CLOSED (return 0 rows)', async () => {
    // When no context is set, querying a tenant-isolated table via non-superuser returns 0 rows
    const results = await prisma.$queryRaw<any[]>`
      SELECT * FROM customers;
    `;
    expect(results).toHaveLength(0);
  });

  it('RLS: Tenant A context can only access Tenant A data and never Tenant B data', async () => {
    // 1. Create two test tenants inside their respective tenant contexts
    const orgAId = crypto.randomUUID();
    const orgA = await prisma.runInTenantContext(orgAId, async (tx) => {
      return tx.organization.create({
        data: {
          id: orgAId,
          name: 'Tenant A Corp',
          code: `TENANT-A-${Date.now()}`,
          email: `orgA-${Date.now()}@test.vn`,
          status: 'ACTIVE',
        },
      });
    });

    const orgBId = crypto.randomUUID();
    const orgB = await prisma.runInTenantContext(orgBId, async (tx) => {
      return tx.organization.create({
        data: {
          id: orgBId,
          name: 'Tenant B Corp',
          code: `TENANT-B-${Date.now()}`,
          email: `orgB-${Date.now()}@test.vn`,
          status: 'ACTIVE',
        },
      });
    });

    // 2. Insert customer for Tenant A under Tenant A context
    await prisma.runInTenantContext(orgA.id, async (tx) => {
      await tx.$executeRaw`
        INSERT INTO customers (id, organization_id, customer_code, name, email, phone, status, created_at, updated_at)
        VALUES (gen_random_uuid(), ${orgA.id}::uuid, 'CUST-A1', 'Customer of Tenant A', 'custA@test.vn', '0911111111', 'ACTIVE', NOW(), NOW());
      `;
    });

    // 3. Insert customer for Tenant B under Tenant B context
    await prisma.runInTenantContext(orgB.id, async (tx) => {
      await tx.$executeRaw`
        INSERT INTO customers (id, organization_id, customer_code, name, email, phone, status, created_at, updated_at)
        VALUES (gen_random_uuid(), ${orgB.id}::uuid, 'CUST-B1', 'Customer of Tenant B', 'custB@test.vn', '0922222222', 'ACTIVE', NOW(), NOW());
      `;
    });

    // 4. Query under Tenant A context
    const tenantACustomers = await prisma.runInTenantContext(orgA.id, async (tx) => {
      return tx.$queryRaw<any[]>`SELECT * FROM customers;`;
    });

    expect(tenantACustomers.length).toBeGreaterThanOrEqual(1);
    expect(tenantACustomers.every((c) => c.organization_id === orgA.id)).toBe(true);
    expect(tenantACustomers.some((c) => c.customer_code === 'CUST-B1')).toBe(false);

    // 5. Query under Tenant B context
    const tenantBCustomers = await prisma.runInTenantContext(orgB.id, async (tx) => {
      return tx.$queryRaw<any[]>`SELECT * FROM customers;`;
    });

    expect(tenantBCustomers.length).toBeGreaterThanOrEqual(1);
    expect(tenantBCustomers.every((c) => c.organization_id === orgB.id)).toBe(true);
    expect(tenantBCustomers.some((c) => c.customer_code === 'CUST-A1')).toBe(false);

    // 6. Cross-tenant mutation attempt: Tenant A tries to update Tenant B customer
    const updateCount = await prisma.runInTenantContext(orgA.id, async (tx) => {
      return tx.$executeRaw`
        UPDATE customers SET name = 'Hacked by Tenant A' WHERE customer_code = 'CUST-B1';
      `;
    });

    // Zero rows affected because RLS completely hides Tenant B's record
    expect(updateCount).toBe(0);

    // Clean up
    await prisma.runInTenantContext(orgA.id, async (tx) => {
      await tx.$executeRaw`DELETE FROM customers WHERE organization_id = ${orgA.id}::uuid;`;
      await tx.organization.delete({ where: { id: orgA.id } });
    });
    await prisma.runInTenantContext(orgB.id, async (tx) => {
      await tx.$executeRaw`DELETE FROM customers WHERE organization_id = ${orgB.id}::uuid;`;
      await tx.organization.delete({ where: { id: orgB.id } });
    });
  });

  it('RLS: SET LOCAL ensures connection pooling does not leak tenant context', async () => {
    const tempOrgId = crypto.randomUUID();
    const tempOrg = await prisma.runInTenantContext(tempOrgId, async (tx) => {
      return tx.organization.create({
        data: {
          id: tempOrgId,
          name: 'Temp Org Leak Test',
          code: `LEAK-TEST-${Date.now()}`,
          email: `leak-${Date.now()}@test.vn`,
          status: 'ACTIVE',
        },
      });
    });

    // Run inside tenant context
    await prisma.runInTenantContext(tempOrg.id, async (tx) => {
      const orgIdVal = await tx.$queryRaw<any[]>`
        SELECT current_setting('app.current_organization_id', true) as current_org;
      `;
      expect(orgIdVal[0].current_org).toBe(tempOrg.id);
    });

    // After transaction finishes, standalone query must have empty or null context
    const postOrgVal = await prisma.$queryRaw<any[]>`
      SELECT current_setting('app.current_organization_id', true) as current_org;
    `;
    expect(postOrgVal[0].current_org).toBeFalsy();

    await prisma.runInTenantContext(tempOrg.id, async (tx) => {
      await tx.organization.delete({ where: { id: tempOrg.id } });
    });
  });
});
