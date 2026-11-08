import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

describe('Database Invariants & Constraints (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let orgAId: string;
  let orgBId: string;
  let warehouseId: string;
  let categoryId: string;
  let uomId: string;
  let productId: string;
  let customerId: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Use superuser connection to test database-level invariants directly (CHECK constraints, foreign keys, triggers)
    prisma = new PrismaClient({
      datasources: {
        db: {
          url:
            process.env.DATABASE_SUPERUSER_URL ||
            'postgresql://bizpro_user:bizpro_password@localhost:5432/bizpro_db?schema=public',
        },
      },
    });
    await prisma.$connect();

    // Setup base tenant and product data for testing
    orgAId = randomUUID();
    orgBId = randomUUID();

    await prisma.organization.createMany({
      data: [
        { id: orgAId, name: 'Org Test A', code: `ORG-A-${Date.now()}`, email: 'orga@test.com' },
        { id: orgBId, name: 'Org Test B', code: `ORG-B-${Date.now()}`, email: 'orgb@test.com' },
      ],
    });

    userId = randomUUID();
    await prisma.user.create({
      data: {
        id: userId,
        organizationId: orgAId,
        fullName: 'Admin Tester',
        email: `tester-${Date.now()}@test.com`,
        passwordHash: 'hashed_secret',
      },
    });

    warehouseId = randomUUID();
    await prisma.warehouse.create({
      data: {
        id: warehouseId,
        organizationId: orgAId,
        code: `WH-${Date.now()}`,
        name: 'Main Warehouse',
      },
    });

    categoryId = randomUUID();
    await prisma.productCategory.create({
      data: {
        id: categoryId,
        organizationId: orgAId,
        name: 'Electronics',
        code: `CAT-${Date.now()}`,
      },
    });

    uomId = randomUUID();
    await prisma.unitOfMeasure.create({
      data: {
        id: uomId,
        organizationId: orgAId,
        name: `Piece-${Date.now()}`,
        symbol: 'pcs',
      },
    });

    productId = randomUUID();
    await prisma.product.create({
      data: {
        id: productId,
        organizationId: orgAId,
        categoryId,
        unitId: uomId,
        sku: `SKU-${Date.now()}`,
        name: 'Test Product',
        costPrice: 100,
        sellingPrice: 150,
      },
    });

    customerId = randomUUID();
    await prisma.customer.create({
      data: {
        id: customerId,
        organizationId: orgAId,
        customerCode: `CUST-${Date.now()}`,
        name: 'Test Customer',
      },
    });
  });

  afterAll(async () => {
    // Cleanup created test records safely
    try {
      await prisma.paymentTransaction.deleteMany({ where: { organizationId: { in: [orgAId, orgBId] } } });
      await prisma.salesOrderStatusHistory.deleteMany({});
      await prisma.salesOrderItem.deleteMany({});
      await prisma.inventoryReservation.deleteMany({ where: { warehouseId } });
      await prisma.salesOrder.deleteMany({ where: { organizationId: { in: [orgAId, orgBId] } } });
      await prisma.stocktakeItem.deleteMany({});
      await prisma.stocktake.deleteMany({});
      await prisma.inventoryBalance.deleteMany({ where: { warehouseId } });
      await prisma.employeeContract.deleteMany({ where: { organizationId: { in: [orgAId, orgBId] } } });
      await prisma.employee.deleteMany({ where: { organizationId: { in: [orgAId, orgBId] } } });
      await prisma.user.deleteMany({ where: { organizationId: { in: [orgAId, orgBId] } } });
      await prisma.customer.deleteMany({ where: { organizationId: { in: [orgAId, orgBId] } } });
      await prisma.product.deleteMany({ where: { id: productId } });
      await prisma.unitOfMeasure.deleteMany({ where: { id: uomId } });
      await prisma.productCategory.deleteMany({ where: { id: categoryId } });
      await prisma.warehouse.deleteMany({ where: { id: warehouseId } });
      await prisma.organization.deleteMany({ where: { id: { in: [orgAId, orgBId] } } });
    } catch {
      // Ignore cleanup errors
    }
    await prisma.$disconnect();
    await app.close();
  });

  describe('1. Inventory Physical CHECK Constraints (23514)', () => {
    it('should reject negative quantity_on_hand', async () => {
      await expect(
        prisma.inventoryBalance.create({
          data: {
            organizationId: orgAId,
            warehouseId,
            productId,
            quantityOnHand: -5,
            quantityReserved: 0,
          },
        }),
      ).rejects.toThrow();
    });

    it('should reject quantity_reserved > quantity_on_hand', async () => {
      await expect(
        prisma.inventoryBalance.create({
          data: {
            organizationId: orgAId,
            warehouseId,
            productId,
            quantityOnHand: 10,
            quantityReserved: 15,
          },
        }),
      ).rejects.toThrow();
    });

    it('should reject zero or negative quantity on inventory_reservations', async () => {
      const order = await prisma.salesOrder.create({
        data: {
          organizationId: orgAId,
          orderCode: `SO-RES-${Date.now()}`,
          customerId,
          warehouseId,
          createdBy: userId,
        },
      });

      await expect(
        prisma.inventoryReservation.create({
          data: {
            organizationId: orgAId,
            warehouseId,
            productId,
            salesOrderId: order.id,
            quantity: 0,
          },
        }),
      ).rejects.toThrow();
    });

    it('should reject non-positive amount on payment_transactions', async () => {
      const order = await prisma.salesOrder.create({
        data: {
          organizationId: orgAId,
          orderCode: `SO-PAY-INV-${Date.now()}`,
          customerId,
          warehouseId,
          createdBy: userId,
        },
      });

      await expect(
        prisma.paymentTransaction.create({
          data: {
            organizationId: orgAId,
            salesOrderId: order.id,
            customerId,
            transactionCode: `TX-${Date.now()}`,
            amount: -500,
            createdBy: userId,
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('2. User – Employee Single Physical FK & 1-1 Semantics', () => {
    it('should allow creating an Employee without a User (0..1 optional)', async () => {
      const emp = await prisma.employee.create({
        data: {
          organizationId: orgAId,
          employeeCode: `EMP-${Date.now()}`,
          fullName: 'Independent Staff',
          email: `emp-${Date.now()}@test.com`,
          hireDate: new Date(),
        },
      });
      expect(emp.id).toBeDefined();

      // Verify User can be linked to this employee
      const user = await prisma.user.create({
        data: {
          organizationId: orgAId,
          fullName: 'Staff Account',
          email: `user-staff-${Date.now()}@test.com`,
          passwordHash: 'hash',
          employeeId: emp.id,
        },
      });
      expect(user.employeeId).toBe(emp.id);

      // Verify deleting User does NOT delete Employee
      await prisma.user.delete({ where: { id: user.id } });
      const empAfter = await prisma.employee.findUnique({ where: { id: emp.id } });
      expect(empAfter).not.toBeNull();
    });

    it('should set users.employee_id to NULL when referenced Employee is deleted (ON DELETE SET NULL)', async () => {
      const emp = await prisma.employee.create({
        data: {
          organizationId: orgAId,
          employeeCode: `EMP-DEL-${Date.now()}`,
          fullName: 'Staff to Delete',
          email: `emp-del-${Date.now()}@test.com`,
          hireDate: new Date(),
        },
      });

      const user = await prisma.user.create({
        data: {
          organizationId: orgAId,
          fullName: 'User Account Attached',
          email: `user-attached-${Date.now()}@test.com`,
          passwordHash: 'hash',
          employeeId: emp.id,
        },
      });
      expect(user.employeeId).toBe(emp.id);

      // Delete the Employee directly from PostgreSQL
      await prisma.employee.delete({ where: { id: emp.id } });

      // Verify User still exists but employeeId has been set to NULL by PostgreSQL ON DELETE SET NULL
      const userAfter = await prisma.user.findUnique({ where: { id: user.id } });
      expect(userAfter).not.toBeNull();
      expect(userAfter?.employeeId).toBeNull();
    });

    it('should reject linking two users to the same Employee (@@unique on employee_id)', async () => {
      const emp = await prisma.employee.create({
        data: {
          organizationId: orgAId,
          employeeCode: `EMP-DUP-${Date.now()}`,
          fullName: 'Single Employee',
          email: `emp-dup-${Date.now()}@test.com`,
          hireDate: new Date(),
        },
      });

      const user1 = await prisma.user.create({
        data: {
          organizationId: orgAId,
          fullName: 'User 1',
          email: `user1-${Date.now()}@test.com`,
          passwordHash: 'hash',
          employeeId: emp.id,
        },
      });
      expect(user1.employeeId).toBe(emp.id);

      // Second user pointing to same employee MUST fail
      await expect(
        prisma.user.create({
          data: {
            organizationId: orgAId,
            fullName: 'User 2',
            email: `user2-${Date.now()}@test.com`,
            passwordHash: 'hash',
            employeeId: emp.id,
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('3. EmployeeContract Organization FK Restrict (23503)', () => {
    it('should reject deleting Organization if active contracts exist', async () => {
      const tempOrgId = randomUUID();
      await prisma.organization.create({
        data: {
          id: tempOrgId,
          name: 'Temp Org Restrict',
          code: `TEMP-ORG-${Date.now()}`,
          email: 'temp@test.com',
        },
      });

      const emp = await prisma.employee.create({
        data: {
          organizationId: tempOrgId,
          employeeCode: `EMP-CONTRACT-${Date.now()}`,
          fullName: 'Contract Staff',
          email: `contract-staff-${Date.now()}@test.com`,
          hireDate: new Date(),
        },
      });

      await prisma.employeeContract.create({
        data: {
          organizationId: tempOrgId,
          employeeId: emp.id,
          contractNumber: `HDLD-${Date.now()}`,
          contractType: 'DEFINITE_TERM',
          startDate: new Date(),
        },
      });

      // Deleting organization MUST be rejected due to onDelete: Restrict
      await expect(
        prisma.organization.delete({ where: { id: tempOrgId } }),
      ).rejects.toThrow();
    });
  });

  describe('4. Stocktake Composite Unique Constraint', () => {
    it('should reject duplicate product in the same stocktake', async () => {
      const stocktake = await prisma.stocktake.create({
        data: {
          organizationId: orgAId,
          warehouseId,
          stocktakeCode: `STK-${Date.now()}`,
          createdBy: userId,
        },
      });

      // First item succeeds
      await prisma.stocktakeItem.create({
        data: {
          stocktakeId: stocktake.id,
          productId,
          expectedQuantity: 50,
        },
      });

      // Second item with same productId MUST fail
      await expect(
        prisma.stocktakeItem.create({
          data: {
            stocktakeId: stocktake.id,
            productId,
            expectedQuantity: 20,
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('5. Payment Deduplication (Partial Unique Index)', () => {
    it('should allow multiple NULL reference_code within same org', async () => {
      const order = await prisma.salesOrder.create({
        data: {
          organizationId: orgAId,
          orderCode: `SO-CASH-${Date.now()}`,
          customerId,
          warehouseId,
          createdBy: userId,
        },
      });

      // Cash payment 1 with null referenceCode
      const tx1 = await prisma.paymentTransaction.create({
        data: {
          organizationId: orgAId,
          salesOrderId: order.id,
          customerId,
          transactionCode: `TX-CASH-1-${Date.now()}`,
          method: 'CASH',
          amount: 100000,
          referenceCode: null,
          createdBy: userId,
        },
      });
      expect(tx1.id).toBeDefined();

      // Cash payment 2 with null referenceCode in same org MUST succeed!
      const tx2 = await prisma.paymentTransaction.create({
        data: {
          organizationId: orgAId,
          salesOrderId: order.id,
          customerId,
          transactionCode: `TX-CASH-2-${Date.now()}`,
          method: 'CASH',
          amount: 200000,
          referenceCode: null,
          createdBy: userId,
        },
      });
      expect(tx2.id).toBeDefined();
    });

    it('should reject duplicate non-null reference_code within same org', async () => {
      const refCode = `FT-VCB-${Date.now()}`;
      const order = await prisma.salesOrder.create({
        data: {
          organizationId: orgAId,
          orderCode: `SO-BANK-${Date.now()}`,
          customerId,
          warehouseId,
          createdBy: userId,
        },
      });

      await prisma.paymentTransaction.create({
        data: {
          organizationId: orgAId,
          salesOrderId: order.id,
          customerId,
          transactionCode: `TX-BANK-1-${Date.now()}`,
          method: 'BANK_TRANSFER',
          amount: 500000,
          referenceCode: refCode,
          createdBy: userId,
        },
      });

      // Second bank transfer with identical refCode in same org MUST fail
      await expect(
        prisma.paymentTransaction.create({
          data: {
            organizationId: orgAId,
            salesOrderId: order.id,
            customerId,
            transactionCode: `TX-BANK-2-${Date.now()}`,
            method: 'BANK_TRANSFER',
            amount: 500000,
            referenceCode: refCode,
            createdBy: userId,
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('6. Multi-Tenant Composite Foreign Key Defense (23503)', () => {
    it('should reject payment associating salesOrder from Org A with Org B', async () => {
      // Order belongs to Org A
      const orderA = await prisma.salesOrder.create({
        data: {
          organizationId: orgAId,
          orderCode: `SO-TENANT-A-${Date.now()}`,
          customerId,
          warehouseId,
          createdBy: userId,
        },
      });

      // Customer in Org B
      const custB = await prisma.customer.create({
        data: {
          organizationId: orgBId,
          customerCode: `CUST-B-${Date.now()}`,
          name: 'Customer Org B',
        },
      });

      // Try creating Payment in Org B trỏ to orderA of Org A via raw query
      await expect(
        prisma.$executeRaw`
          INSERT INTO payment_transactions (
            id, organization_id, sales_order_id, customer_id, transaction_code, 
            amount, method, type, status, created_by, created_at, transacted_at
          ) VALUES (
            gen_random_uuid(), ${orgBId}::uuid, ${orderA.id}::uuid, ${custB.id}::uuid, 
            ${`CROSS-TENANT-${Date.now()}`}, 100000, 'BANK_TRANSFER', 'PAYMENT', 'PENDING', 
            ${userId}::uuid, now(), now()
          );
        `,
      ).rejects.toThrow();
    });
  });

  describe('7. Shipping Address Immutability Trigger', () => {
    it('should allow modifying shipping address when order is DRAFT', async () => {
      const order = await prisma.salesOrder.create({
        data: {
          organizationId: orgAId,
          orderCode: `SO-DRAFT-${Date.now()}`,
          customerId,
          warehouseId,
          status: 'DRAFT',
          createdBy: userId,
          shippingPhone: '0901234567',
        },
      });

      const updated = await prisma.salesOrder.update({
        where: { id: order.id },
        data: { shippingPhone: '0987654321' },
      });
      expect(updated.shippingPhone).toBe('0987654321');
    });

    it('should REJECT modifying shipping address once order is CONFIRMED', async () => {
      const order = await prisma.salesOrder.create({
        data: {
          organizationId: orgAId,
          orderCode: `SO-CONFIRMED-${Date.now()}`,
          customerId,
          warehouseId,
          status: 'CONFIRMED',
          createdBy: userId,
          shippingPhone: '0901234567',
        },
      });

      // Updating shipping address fields on CONFIRMED order MUST be blocked by trigger
      await expect(
        prisma.salesOrder.update({
          where: { id: order.id },
          data: { shippingPhone: '0999999999' },
        }),
      ).rejects.toThrow();
    });
  });
});
