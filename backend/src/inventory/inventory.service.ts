import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  CreateUomDto,
  CreateCategoryDto,
  CreateStockReceiptDto,
  CreateStockIssueDto,
  CreateStocktakeDto,
} from './dto/inventory.dto';
import { CommonStatus, StockDocStatus, StocktakeStatus, InventoryTransactionType, Prisma } from '@prisma/client';

@Injectable()
export class InventoryService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedInitialInventoryMasterData();
  }

  /**
   * Seed default UOM, Category, and Warehouse for primary organization
   */
  async seedInitialInventoryMasterData() {
    try {
      const org = await this.prisma.runInSystemContext(async (tx) => {
        return tx.organization.findFirst();
      });
      if (!org) return;

      await this.prisma.runInTenantContext(org.id, async (tx) => {
        // 1. Seed UOMs
        const defaultUoms = [
          { name: 'Cái', symbol: 'cai' },
          { name: 'Hộp', symbol: 'hop' },
          { name: 'Thùng', symbol: 'thung' },
          { name: 'Kg', symbol: 'kg' },
          { name: 'Bộ', symbol: 'bo' },
        ];
        for (const u of defaultUoms) {
          const exists = await tx.unitOfMeasure.findFirst({
            where: { organizationId: org.id, name: u.name },
          });
          if (!exists) {
            await tx.unitOfMeasure.create({
              data: { organizationId: org.id, name: u.name, symbol: u.symbol },
            });
          }
        }

        // 2. Seed Categories
        const defaultCats = [
          { code: 'CAT-TIÊU-DÙNG', name: 'Hàng tiêu dùng & Gia dụng', description: 'Mặt hàng phân phối nhanh' },
          { code: 'CAT-THIẾT-BỊ', name: 'Thiết bị & Linh kiện', description: 'Thiết bị điện tử, phần cứng' },
          { code: 'CAT-NGUYÊN-LIỆU', name: 'Nguyên vật liệu đóng gói', description: 'Bao bì, phụ liệu sản xuất' },
        ];
        for (const cat of defaultCats) {
          const exists = await tx.productCategory.findFirst({
            where: { organizationId: org.id, code: cat.code },
          });
          if (!exists) {
            await tx.productCategory.create({
              data: {
                organizationId: org.id,
                code: cat.code,
                name: cat.name,
                description: cat.description,
              },
            });
          }
        }

        // 3. Seed Warehouses
        const defaultWarehouses = [
          { code: 'WH-HN-01', name: 'Kho Tổng Miền Bắc (Hà Nội)', address: 'Lô E4, KCN Thăng Long, Đông Anh, Hà Nội' },
          { code: 'WH-HCM-01', name: 'Kho Trung tâm Miền Nam (TP.HCM)', address: 'Khu chế xuất Tân Thuận, Quận 7, TP.HCM' },
        ];
        for (const wh of defaultWarehouses) {
          const exists = await tx.warehouse.findFirst({
            where: { organizationId: org.id, code: wh.code },
          });
          if (!exists) {
            await tx.warehouse.create({
              data: {
                organizationId: org.id,
                code: wh.code,
                name: wh.name,
                address: wh.address,
              },
            });
          }
        }
      });
    } catch (err) {
      console.warn('Inventory seed warning (tables might be initializing):', (err as Error).message);
    }
  }

  /* =========================================================================
     1. UOM & CATEGORIES
     ========================================================================= */
  async getUoms(orgId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      return tx.unitOfMeasure.findMany({
        where: { organizationId: orgId },
        orderBy: { name: 'asc' },
      });
    });
  }

  async createUom(orgId: string, dto: CreateUomDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const exists = await tx.unitOfMeasure.findFirst({
        where: { organizationId: orgId, name: dto.name },
      });
      if (exists) {
        throw new ConflictException(`Đơn vị tính "${dto.name}" đã tồn tại!`);
      }
      return tx.unitOfMeasure.create({
        data: {
          organizationId: orgId,
          name: dto.name,
          symbol: dto.symbol || dto.name.toLowerCase(),
        },
      });
    });
  }

  async getCategories(orgId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      return tx.productCategory.findMany({
        where: { organizationId: orgId },
        orderBy: { name: 'asc' },
      });
    });
  }

  async createCategory(orgId: string, dto: CreateCategoryDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const exists = await tx.productCategory.findFirst({
        where: { organizationId: orgId, code: dto.code },
      });
      if (exists) {
        throw new ConflictException(`Mã danh mục "${dto.code}" đã tồn tại!`);
      }
      return tx.productCategory.create({
        data: {
          organizationId: orgId,
          code: dto.code,
          name: dto.name,
          description: dto.description,
        },
      });
    });
  }

  /* =========================================================================
     2. PRODUCTS MANAGEMENT
     ========================================================================= */
  async getProducts(
    orgId: string,
    params?: { search?: string; categoryId?: string; status?: CommonStatus; page?: number; limit?: number },
  ) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const page = Math.max(1, Number(params?.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(params?.limit) || 20));
      const skip = (page - 1) * limit;

      const where: Prisma.ProductWhereInput = {
        organizationId: orgId,
      };

      if (params?.status) {
        where.status = params.status;
      }

      if (params?.categoryId) {
        where.categoryId = params.categoryId;
      }

      if (params?.search) {
        where.OR = [
          { sku: { contains: params.search, mode: 'insensitive' } },
          { name: { contains: params.search, mode: 'insensitive' } },
          { barcode: { contains: params.search, mode: 'insensitive' } },
        ];
      }

      const [items, total] = await Promise.all([
        tx.product.findMany({
          where,
          include: {
            category: true,
            unit: true,
            inventoryBalances: {
              include: { warehouse: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        tx.product.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    });
  }

  async getProductById(orgId: string, id: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const product = await tx.product.findFirst({
        where: { id, organizationId: orgId },
        include: {
          category: true,
          unit: true,
          inventoryBalances: {
            include: { warehouse: true },
          },
        },
      });
      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm yêu cầu!');
      }
      return product;
    });
  }

  async createProduct(orgId: string, dto: CreateProductDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      // Check SKU uniqueness
      const existingSku = await tx.product.findFirst({
        where: { organizationId: orgId, sku: dto.sku.trim() },
      });
      if (existingSku) {
        throw new ConflictException(`Mã SKU "${dto.sku}" đã tồn tại trong tổ chức!`);
      }

      return tx.product.create({
        data: {
          organizationId: orgId,
          sku: dto.sku.trim(),
          name: dto.name.trim(),
          categoryId: dto.categoryId,
          unitId: dto.unitId,
          barcode: dto.barcode?.trim(),
          description: dto.description?.trim(),
          costPrice: new Prisma.Decimal(dto.costPrice || 0),
          sellingPrice: new Prisma.Decimal(dto.sellingPrice || 0),
          minStockLevel: new Prisma.Decimal(dto.minStockLevel || 0),
          trackInventory: dto.trackInventory !== false,
          status: CommonStatus.ACTIVE,
        },
        include: {
          category: true,
          unit: true,
        },
      });
    });
  }

  async updateProduct(orgId: string, id: string, dto: UpdateProductDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const product = await tx.product.findFirst({
        where: { id, organizationId: orgId },
      });
      if (!product) {
        throw new NotFoundException('Không tìm thấy sản phẩm để cập nhật!');
      }

      const updateData: Prisma.ProductUpdateInput = {};
      if (dto.name !== undefined) updateData.name = dto.name.trim();
      if (dto.categoryId !== undefined) updateData.category = { connect: { id: dto.categoryId } };
      if (dto.unitId !== undefined) updateData.unit = { connect: { id: dto.unitId } };
      if (dto.barcode !== undefined) updateData.barcode = dto.barcode?.trim();
      if (dto.description !== undefined) updateData.description = dto.description?.trim();
      if (dto.costPrice !== undefined) updateData.costPrice = new Prisma.Decimal(dto.costPrice);
      if (dto.sellingPrice !== undefined) updateData.sellingPrice = new Prisma.Decimal(dto.sellingPrice);
      if (dto.minStockLevel !== undefined) updateData.minStockLevel = new Prisma.Decimal(dto.minStockLevel);
      if (dto.status !== undefined) updateData.status = dto.status;

      return tx.product.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          unit: true,
        },
      });
    });
  }

  /* =========================================================================
     3. WAREHOUSES MANAGEMENT
     ========================================================================= */
  async getWarehouses(orgId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      return tx.warehouse.findMany({
        where: { organizationId: orgId },
        include: {
          _count: {
            select: {
              inventoryBalances: true,
              stockReceipts: true,
              stockIssues: true,
            },
          },
        },
        orderBy: { code: 'asc' },
      });
    });
  }

  async createWarehouse(orgId: string, dto: CreateWarehouseDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const existing = await tx.warehouse.findFirst({
        where: { organizationId: orgId, code: dto.code.trim() },
      });
      if (existing) {
        throw new ConflictException(`Mã kho "${dto.code}" đã tồn tại!`);
      }

      return tx.warehouse.create({
        data: {
          organizationId: orgId,
          code: dto.code.trim().toUpperCase(),
          name: dto.name.trim(),
          address: dto.address?.trim(),
          status: CommonStatus.ACTIVE,
        },
      });
    });
  }

  async updateWarehouse(orgId: string, id: string, dto: UpdateWarehouseDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const wh = await tx.warehouse.findFirst({
        where: { id, organizationId: orgId },
      });
      if (!wh) {
        throw new NotFoundException('Không tìm thấy kho hàng!');
      }

      return tx.warehouse.update({
        where: { id },
        data: {
          name: dto.name?.trim(),
          address: dto.address?.trim(),
          status: dto.status,
        },
      });
    });
  }

  /* =========================================================================
     4. STOCK BALANCES & STOCK LEDGER
     ========================================================================= */
  async getStockBalances(orgId: string, warehouseId?: string, productId?: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const where: Prisma.InventoryBalanceWhereInput = {
        organizationId: orgId,
      };
      if (warehouseId) where.warehouseId = warehouseId;
      if (productId) where.productId = productId;

      const balances = await tx.inventoryBalance.findMany({
        where,
        include: {
          warehouse: true,
          product: {
            include: { unit: true, category: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return balances.map((b) => {
        const onHand = Number(b.quantityOnHand);
        const reserved = Number(b.quantityReserved);
        const available = Math.max(0, onHand - reserved);
        return {
          ...b,
          availableQuantity: available,
        };
      });
    });
  }

  async getStockLedger(
    orgId: string,
    params?: { warehouseId?: string; productId?: string; page?: number; limit?: number },
  ) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const page = Math.max(1, Number(params?.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(params?.limit) || 20));
      const skip = (page - 1) * limit;

      const where: Prisma.InventoryTransactionWhereInput = {
        organizationId: orgId,
      };
      if (params?.warehouseId) where.warehouseId = params.warehouseId;
      if (params?.productId) where.productId = params.productId;

      const [items, total] = await Promise.all([
        tx.inventoryTransaction.findMany({
          where,
          include: {
            warehouse: true,
            product: {
              include: { unit: true },
            },
            poster: {
              select: { id: true, fullName: true, email: true },
            },
          },
          orderBy: { occurredAt: 'desc' },
          skip,
          take: limit,
        }),
        tx.inventoryTransaction.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    });
  }

  /* =========================================================================
     5. STOCK RECEIPTS (PHIẾU NHẬP KHO)
     ========================================================================= */
  async getReceipts(orgId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      return tx.stockReceipt.findMany({
        where: { organizationId: orgId },
        include: {
          warehouse: true,
          items: {
            include: { product: { include: { unit: true } } },
          },
          creator: { select: { id: true, fullName: true } },
          poster: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async createReceipt(orgId: string, userId: string, dto: CreateStockReceiptDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const warehouse = await tx.warehouse.findFirst({
        where: { id: dto.warehouseId, organizationId: orgId },
      });
      if (!warehouse) {
        throw new NotFoundException('Kho nhập hàng không hợp lệ!');
      }

      if (!dto.items || dto.items.length === 0) {
        throw new BadRequestException('Phiếu nhập kho phải có ít nhất 1 mặt hàng!');
      }

      const receiptCode = `PNK-${Date.now().toString().slice(-6)}`;

      return tx.stockReceipt.create({
        data: {
          organizationId: orgId,
          receiptCode,
          warehouseId: dto.warehouseId,
          supplierId: dto.supplierId,
          referenceNumber: dto.referenceNumber,
          note: dto.note,
          status: StockDocStatus.DRAFT,
          createdBy: userId,
          items: {
            create: dto.items.map((it) => ({
              productId: it.productId,
              quantity: new Prisma.Decimal(it.quantity),
              unitCost: new Prisma.Decimal(it.unitCost || 0),
              lineTotal: new Prisma.Decimal((it.quantity * (it.unitCost || 0)).toFixed(2)),
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          warehouse: true,
        },
      });
    });
  }

  async postReceipt(orgId: string, receiptId: string, userId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      // 1. Pessimistic row lock on document header to serialize concurrent POST attempts
      const lockedHeader: any[] = await tx.$queryRaw(
        Prisma.sql`SELECT id, status FROM stock_receipts WHERE id = ${receiptId}::uuid AND organization_id = ${orgId}::uuid FOR UPDATE`,
      );

      if (!lockedHeader || lockedHeader.length === 0) {
        throw new NotFoundException('Không tìm thấy phiếu nhập kho!');
      }

      if (lockedHeader[0].status === StockDocStatus.POSTED) {
        throw new BadRequestException('Phiếu nhập kho này đã được ghi sổ trước đó!');
      }

      if (lockedHeader[0].status === StockDocStatus.CANCELLED) {
        throw new BadRequestException('Phiếu nhập kho đã bị hủy, không thể ghi sổ!');
      }

      const receipt = await tx.stockReceipt.findFirst({
        where: { id: receiptId, organizationId: orgId },
        include: { items: { include: { product: true } } },
      });

      if (!receipt) {
        throw new NotFoundException('Không tìm thấy phiếu nhập kho!');
      }

      // Process each item: update stock balance & create ledger entry
      for (const item of receipt.items) {
        const qty = new Prisma.Decimal(item.quantity);

        // Find or create balance
        let balance = await tx.inventoryBalance.findFirst({
          where: {
            organizationId: orgId,
            warehouseId: receipt.warehouseId,
            productId: item.productId,
          },
        });

        let newOnHand: Prisma.Decimal;
        if (!balance) {
          balance = await tx.inventoryBalance.create({
            data: {
              organizationId: orgId,
              warehouseId: receipt.warehouseId,
              productId: item.productId,
              quantityOnHand: qty,
              quantityReserved: new Prisma.Decimal(0),
            },
          });
          newOnHand = qty;
        } else {
          newOnHand = balance.quantityOnHand.plus(qty);
          await tx.inventoryBalance.update({
            where: { id: balance.id },
            data: { quantityOnHand: newOnHand },
          });
        }

        // Record Stock Ledger transaction
        await tx.inventoryTransaction.create({
          data: {
            organizationId: orgId,
            warehouseId: receipt.warehouseId,
            productId: item.productId,
            transactionType: InventoryTransactionType.RECEIPT,
            referenceType: 'STOCK_RECEIPT',
            referenceId: receipt.receiptCode,
            quantityChange: qty,
            unitCost: item.unitCost,
            balanceAfter: newOnHand,
            createdBy: userId,
          },
        });
      }

      // Mark receipt as POSTED
      return tx.stockReceipt.update({
        where: { id: receiptId },
        data: {
          status: StockDocStatus.POSTED,
          postedBy: userId,
          postedAt: new Date(),
        },
        include: {
          items: { include: { product: true } },
          warehouse: true,
        },
      });
    });
  }

  /* =========================================================================
     6. STOCK ISSUES (PHIẾU XUẤT KHO) — ATOMIC WITH PESSIMISTIC LOCKING
     ========================================================================= */
  async getIssues(orgId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      return tx.stockIssue.findMany({
        where: { organizationId: orgId },
        include: {
          warehouse: true,
          items: {
            include: { product: { include: { unit: true } } },
          },
          creator: { select: { id: true, fullName: true } },
          poster: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async createIssue(orgId: string, userId: string, dto: CreateStockIssueDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const warehouse = await tx.warehouse.findFirst({
        where: { id: dto.warehouseId, organizationId: orgId },
      });
      if (!warehouse) {
        throw new NotFoundException('Kho xuất hàng không hợp lệ!');
      }

      if (!dto.items || dto.items.length === 0) {
        throw new BadRequestException('Phiếu xuất kho phải có ít nhất 1 mặt hàng!');
      }

      const issueCode = `PXK-${Date.now().toString().slice(-6)}`;

      return tx.stockIssue.create({
        data: {
          organizationId: orgId,
          issueCode,
          warehouseId: dto.warehouseId,
          referenceType: dto.referenceType || 'MANUAL',
          referenceId: dto.referenceId,
          note: dto.note,
          status: StockDocStatus.DRAFT,
          createdBy: userId,
          items: {
            create: dto.items.map((it) => ({
              productId: it.productId,
              quantity: new Prisma.Decimal(it.quantity),
              unitCost: new Prisma.Decimal(it.unitCost || 0),
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          warehouse: true,
        },
      });
    });
  }

  /**
   * POST STOCK ISSUE:
   * Uses PESSIMISTIC LOCKING (SELECT FOR UPDATE) to guarantee that
   * no race condition or concurrent request can lead to negative stock balance.
   */
  async postIssue(orgId: string, issueId: string, userId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      // 1. Pessimistic row lock on document header to serialize concurrent POST attempts
      const lockedHeader: any[] = await tx.$queryRaw(
        Prisma.sql`SELECT id, status FROM stock_issues WHERE id = ${issueId}::uuid AND organization_id = ${orgId}::uuid FOR UPDATE`,
      );

      if (!lockedHeader || lockedHeader.length === 0) {
        throw new NotFoundException('Không tìm thấy phiếu xuất kho!');
      }

      if (lockedHeader[0].status === StockDocStatus.POSTED) {
        throw new BadRequestException('Phiếu xuất kho này đã được ghi sổ trước đó!');
      }

      if (lockedHeader[0].status === StockDocStatus.CANCELLED) {
        throw new BadRequestException('Phiếu xuất kho đã bị hủy, không thể ghi sổ!');
      }

      const issue = await tx.stockIssue.findFirst({
        where: { id: issueId, organizationId: orgId },
        include: { items: { include: { product: true } } },
      });

      if (!issue) {
        throw new NotFoundException('Không tìm thấy phiếu xuất kho!');
      }

      // Process each item with atomic lock
      for (const item of issue.items) {
        const reqQty = Number(item.quantity);

        // Pessimistic Lock on the inventory balance row
        const lockedRows: Array<{
          id: string;
          quantity_on_hand: string | number;
          quantity_reserved: string | number;
        }> = await tx.$queryRaw(
          Prisma.sql`
            SELECT id, quantity_on_hand, quantity_reserved
            FROM inventory_balances
            WHERE organization_id = ${orgId}::uuid
              AND warehouse_id = ${issue.warehouseId}::uuid
              AND product_id = ${item.productId}::uuid
            FOR UPDATE
          `,
        );

        if (!lockedRows || lockedRows.length === 0) {
          throw new BadRequestException(
            `Sản phẩm [${item.product.sku}] chưa có số dư tồn kho tại kho xuất! Không thể xuất kho.`,
          );
        }

        const balanceRow = lockedRows[0];
        const onHand = Number(balanceRow.quantity_on_hand);
        const reserved = Number(balanceRow.quantity_reserved);
        const available = onHand - reserved;

        if (available < reqQty) {
          throw new BadRequestException(
            `Sản phẩm [${item.product.sku}] không đủ số lượng khả dụng để xuất! (Tồn khả dụng: ${available}, Yêu cầu xuất: ${reqQty})`,
          );
        }

        const newOnHand = new Prisma.Decimal((onHand - reqQty).toFixed(3));

        // Update balance
        await tx.inventoryBalance.update({
          where: { id: balanceRow.id },
          data: { quantityOnHand: newOnHand },
        });

        // Record in ledger
        await tx.inventoryTransaction.create({
          data: {
            organizationId: orgId,
            warehouseId: issue.warehouseId,
            productId: item.productId,
            transactionType: InventoryTransactionType.ISSUE,
            referenceType: 'STOCK_ISSUE',
            referenceId: issue.issueCode,
            quantityChange: new Prisma.Decimal((-reqQty).toFixed(3)),
            unitCost: item.unitCost,
            balanceAfter: newOnHand,
            createdBy: userId,
          },
        });
      }

      // Mark issue as POSTED
      return tx.stockIssue.update({
        where: { id: issueId },
        data: {
          status: StockDocStatus.POSTED,
          postedBy: userId,
          postedAt: new Date(),
        },
        include: {
          items: { include: { product: true } },
          warehouse: true,
        },
      });
    });
  }

  /* =========================================================================
     7. STOCKTAKES (KIỂM KÊ KHO)
     ========================================================================= */
  async getStocktakes(orgId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      return tx.stocktake.findMany({
        where: { organizationId: orgId },
        include: {
          warehouse: true,
          items: { include: { product: true } },
          creator: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async createStocktake(orgId: string, userId: string, dto: CreateStocktakeDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const warehouse = await tx.warehouse.findFirst({
        where: { id: dto.warehouseId, organizationId: orgId },
      });
      if (!warehouse) {
        throw new NotFoundException('Kho kiểm kê không hợp lệ!');
      }

      const stocktakeCode = `KK-${Date.now().toString().slice(-6)}`;

      // Prepare items with system expected quantity
      const itemsData: Array<{
        productId: string;
        expectedQuantity: Prisma.Decimal;
        countedQuantity: Prisma.Decimal;
        differenceQuantity: Prisma.Decimal;
      }> = [];

      for (const it of dto.items) {
        const bal = await tx.inventoryBalance.findFirst({
          where: {
            organizationId: orgId,
            warehouseId: dto.warehouseId,
            productId: it.productId,
          },
        });
        const expected = bal ? Number(bal.quantityOnHand) : 0;
        const counted = Number(it.countedQuantity);
        const diff = counted - expected;

        itemsData.push({
          productId: it.productId,
          expectedQuantity: new Prisma.Decimal(expected.toFixed(3)),
          countedQuantity: new Prisma.Decimal(counted.toFixed(3)),
          differenceQuantity: new Prisma.Decimal(diff.toFixed(3)),
        });
      }

      return tx.stocktake.create({
        data: {
          organizationId: orgId,
          stocktakeCode,
          warehouseId: dto.warehouseId,
          status: StocktakeStatus.DRAFT,
          createdBy: userId,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: { include: { product: true } },
          warehouse: true,
        },
      });
    });
  }

  async postStocktake(orgId: string, stocktakeId: string, userId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      // 1. Pessimistic row lock on document header to serialize concurrent POST attempts
      const lockedHeader: any[] = await tx.$queryRaw(
        Prisma.sql`SELECT id, status FROM stocktakes WHERE id = ${stocktakeId}::uuid AND organization_id = ${orgId}::uuid FOR UPDATE`,
      );

      if (!lockedHeader || lockedHeader.length === 0) {
        throw new NotFoundException('Không tìm thấy phiếu kiểm kê!');
      }

      if (lockedHeader[0].status === StocktakeStatus.COMPLETED) {
        throw new BadRequestException('Phiếu kiểm kê này đã được cân chỉnh trước đó!');
      }

      const stocktake = await tx.stocktake.findFirst({
        where: { id: stocktakeId, organizationId: orgId },
        include: { items: { include: { product: true } } },
      });

      if (!stocktake) {
        throw new NotFoundException('Không tìm thấy phiếu kiểm kê!');
      }

      // Apply difference adjustments to balances and ledger
      for (const item of stocktake.items) {
        const counted = item.countedQuantity || item.expectedQuantity;
        const diff = Number(item.differenceQuantity || 0);

        // Update balance
        let bal = await tx.inventoryBalance.findFirst({
          where: {
            organizationId: orgId,
            warehouseId: stocktake.warehouseId,
            productId: item.productId,
          },
        });

        if (!bal) {
          bal = await tx.inventoryBalance.create({
            data: {
              organizationId: orgId,
              warehouseId: stocktake.warehouseId,
              productId: item.productId,
              quantityOnHand: counted,
            },
          });
        } else {
          await tx.inventoryBalance.update({
            where: { id: bal.id },
            data: { quantityOnHand: counted },
          });
        }

        // If difference != 0, write ledger adjustment
        if (diff !== 0) {
          await tx.inventoryTransaction.create({
            data: {
              organizationId: orgId,
              warehouseId: stocktake.warehouseId,
              productId: item.productId,
              transactionType:
                diff > 0
                  ? InventoryTransactionType.ADJUST_INCREASE
                  : InventoryTransactionType.ADJUST_DECREASE,
              referenceType: 'STOCKTAKE',
              referenceId: stocktake.stocktakeCode,
              quantityChange: new Prisma.Decimal(diff.toFixed(3)),
              balanceAfter: counted,
              createdBy: userId,
            },
          });
        }
      }

      return tx.stocktake.update({
        where: { id: stocktakeId },
        data: {
          status: StocktakeStatus.COMPLETED,
          approvedBy: userId,
          completedAt: new Date(),
        },
        include: {
          items: { include: { product: true } },
          warehouse: true,
        },
      });
    });
  }
}
