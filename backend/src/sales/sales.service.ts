import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  ConfirmSalesOrderDto,
  CancelSalesOrderDto,
  WarehouseAckCancelDto,
  FulfillSalesOrderDto,
  QuerySalesOrderDto,
} from './dto/sales.dto';
import {
  SalesOrderStatus,
  ReservationStatus,
  StockDocStatus,
  InventoryTransactionType,
  Prisma,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to execute with Bounded Retry (up to 3 times) on deadlock (40P01)
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await operation();
      } catch (error: any) {
        attempt++;
        const isDeadlock =
          error?.code === 'P2034' ||
          error?.message?.includes('deadlock detected') ||
          error?.message?.includes('40P01');

        if (isDeadlock && attempt < maxRetries) {
          const backoff = Math.floor(Math.random() * 200) + 50 * attempt;
          this.logger.warn(
            `Deadlock detected on attempt ${attempt}. Retrying in ${backoff}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }
        throw error;
      }
    }
    throw new BadRequestException('Transaction failed after maximum retries');
  }

  /**
   * 1. Create new Sales Order in DRAFT status
   */
  async createOrder(orgId: string, userId: string, dto: CreateSalesOrderDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      // Validate customer in tenant
      const customer = await tx.customer.findFirst({
        where: { id: dto.customerId, organizationId: orgId },
      });
      if (!customer) {
        throw new NotFoundException('Khách hàng không tồn tại hoặc không thuộc tổ chức!');
      }

      // Validate warehouse in tenant
      const warehouse = await tx.warehouse.findFirst({
        where: { id: dto.warehouseId, organizationId: orgId },
      });
      if (!warehouse) {
        throw new NotFoundException('Kho hàng không tồn tại hoặc không thuộc tổ chức!');
      }

      if (dto.dealId) {
        const deal = await tx.deal.findFirst({
          where: { id: dto.dealId, organizationId: orgId },
        });
        if (!deal) {
          throw new NotFoundException('Cơ hội kinh doanh (Deal) không hợp lệ!');
        }
      }

      // Process and snapshot products
      let subtotal = new Decimal(0);
      let totalDiscount = new Decimal(0);
      let totalTax = new Decimal(0);
      const itemsToCreate: any[] = [];

      for (const itemDto of dto.items) {
        const product = await tx.product.findFirst({
          where: { id: itemDto.productId, organizationId: orgId },
          include: { unit: true },
        });
        if (!product) {
          throw new NotFoundException(`Sản phẩm với ID ${itemDto.productId} không tồn tại!`);
        }

        const qty = new Decimal(itemDto.quantity);
        const price = new Decimal(itemDto.unitPrice);
        const discount = new Decimal(itemDto.discountAmount || 0);
        const taxRate = new Decimal(itemDto.taxRate || 0);

        if (qty.lte(0)) {
          throw new BadRequestException(`Số lượng sản phẩm ${product.sku} phải lớn hơn 0`);
        }
        if (price.lt(0)) {
          throw new BadRequestException(`Đơn giá sản phẩm ${product.sku} không được âm`);
        }
        if (discount.lt(0)) {
          throw new BadRequestException(`Chiết khấu không được âm`);
        }

        const lineBase = qty.mul(price);
        if (discount.gt(lineBase)) {
          throw new BadRequestException(
            `Chiết khấu dòng (${discount}) không được vượt quá thành tiền trước chiết khấu (${lineBase})`,
          );
        }

        const taxableAmount = lineBase.sub(discount);
        const lineTax = taxableAmount.mul(taxRate).div(100);
        const lineTotal = taxableAmount.add(lineTax);

        subtotal = subtotal.add(lineBase);
        totalDiscount = totalDiscount.add(discount);
        totalTax = totalTax.add(lineTax);

        itemsToCreate.push({
          productId: product.id,
          skuSnapshot: product.sku,
          productNameSnapshot: product.name,
          uomSnapshot: product.unit?.name || 'Cái',
          quantity: qty,
          fulfilledQuantity: new Decimal(0),
          unitPrice: price,
          discountAmount: discount,
          taxRate: taxRate,
          lineTotal: lineTotal,
        });
      }

      const totalAmount = subtotal.sub(totalDiscount).add(totalTax);
      const orderCode = `SO-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      const shippingSnapshot = {
        recipientName: dto.shippingRecipientName || customer.name,
        phone: dto.shippingPhone || customer.phone || '',
        provinceCode: dto.shippingProvinceCode || '',
        districtCode: dto.shippingDistrictCode || '',
        wardCode: dto.shippingWardCode || '',
        fullAddress: dto.shippingFullAddress || customer.address || '',
      };

      const order = await tx.salesOrder.create({
        data: {
          organizationId: orgId,
          orderCode,
          customerId: customer.id,
          dealId: dto.dealId || null,
          warehouseId: warehouse.id,
          expectedDeliveryDate: dto.expectedDeliveryDate
            ? new Date(dto.expectedDeliveryDate)
            : null,
          status: SalesOrderStatus.DRAFT,
          subtotal,
          discountAmount: totalDiscount,
          taxAmount: totalTax,
          totalAmount,
          remainingBalance: totalAmount,
          shippingAddressSnapshot: shippingSnapshot,
          shippingRecipientName: shippingSnapshot.recipientName,
          shippingPhone: shippingSnapshot.phone,
          shippingProvinceCode: shippingSnapshot.provinceCode,
          shippingDistrictCode: shippingSnapshot.districtCode,
          shippingWardCode: shippingSnapshot.wardCode,
          shippingFullAddress: shippingSnapshot.fullAddress,
          note: dto.note || null,
          createdBy: userId,
          items: {
            create: itemsToCreate,
          },
          statusHistories: {
            create: {
              fromStatus: null,
              toStatus: SalesOrderStatus.DRAFT,
              changedBy: userId,
              note: 'Khởi tạo đơn hàng bản thảo (Draft)',
            },
          },
        },
        include: {
          items: true,
          customer: true,
          warehouse: true,
        },
      });

      return order;
    });
  }

  /**
   * 2. Get list of Sales Orders with filters & search
   */
  async getOrders(orgId: string, query: QuerySalesOrderDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
      const skip = (page - 1) * limit;

      const where: Prisma.SalesOrderWhereInput = {
        organizationId: orgId,
      };

      if (query.status) {
        where.status = query.status;
      }

      if (query.customerId) {
        where.customerId = query.customerId;
      }

      if (query.search) {
        const s = query.search.trim();
        where.OR = [
          { orderCode: { contains: s, mode: 'insensitive' } },
          { shippingRecipientName: { contains: s, mode: 'insensitive' } },
          { shippingPhone: { contains: s, mode: 'insensitive' } },
          { customer: { name: { contains: s, mode: 'insensitive' } } },
        ];
      }

      const [items, total] = await Promise.all([
        tx.salesOrder.findMany({
          where,
          include: {
            customer: { select: { id: true, name: true, phone: true } },
            warehouse: { select: { id: true, name: true, code: true } },
            creator: { select: { id: true, fullName: true, email: true } },
            items: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        tx.salesOrder.count({ where }),
      ]);

      return {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  /**
   * 3. Get single order details
   */
  async getOrderById(orgId: string, orderId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const order = await tx.salesOrder.findFirst({
        where: { id: orderId, organizationId: orgId },
        include: {
          customer: true,
          warehouse: true,
          creator: { select: { id: true, fullName: true, email: true } },
          confirmer: { select: { id: true, fullName: true, email: true } },
          items: {
            include: { product: true },
          },
          reservations: {
            include: { product: true },
          },
          statusHistories: {
            include: { changer: { select: { id: true, fullName: true } } },
            orderBy: { changedAt: 'asc' },
          },
          fulfillments: {
            include: {
              items: { include: { product: true } },
              executor: { select: { id: true, fullName: true } },
              stockIssue: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn bán hàng!');
      }

      return order;
    });
  }

  /**
   * 4. Update Draft Order
   */
  async updateOrder(
    orgId: string,
    orderId: string,
    userId: string,
    dto: UpdateSalesOrderDto,
  ) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const existing = await tx.salesOrder.findFirst({
        where: { id: orderId, organizationId: orgId },
        include: { items: true },
      });

      if (!existing) {
        throw new NotFoundException('Không tìm thấy đơn bán hàng!');
      }

      if (existing.status !== SalesOrderStatus.DRAFT) {
        throw new BadRequestException('Chỉ có thể chỉnh sửa đơn hàng ở trạng thái bản thảo (DRAFT)!');
      }

      // If items are modified, recalculate financials
      if (dto.items && dto.items.length > 0) {
        await tx.salesOrderItem.deleteMany({
          where: { salesOrderId: orderId },
        });

        let subtotal = new Decimal(0);
        let totalDiscount = new Decimal(0);
        let totalTax = new Decimal(0);
        const newItems: any[] = [];

        for (const itemDto of dto.items) {
          const product = await tx.product.findFirst({
            where: { id: itemDto.productId, organizationId: orgId },
            include: { unit: true },
          });
          if (!product) {
            throw new NotFoundException(`Sản phẩm ${itemDto.productId} không tồn tại!`);
          }

          const qty = new Decimal(itemDto.quantity);
          const price = new Decimal(itemDto.unitPrice);
          const discount = new Decimal(itemDto.discountAmount || 0);
          const taxRate = new Decimal(itemDto.taxRate || 0);

          const lineBase = qty.mul(price);
          const taxableAmount = lineBase.sub(discount);
          const lineTax = taxableAmount.mul(taxRate).div(100);
          const lineTotal = taxableAmount.add(lineTax);

          subtotal = subtotal.add(lineBase);
          totalDiscount = totalDiscount.add(discount);
          totalTax = totalTax.add(lineTax);

          newItems.push({
            salesOrderId: orderId,
            productId: product.id,
            skuSnapshot: product.sku,
            productNameSnapshot: product.name,
            uomSnapshot: product.unit?.name || 'Cái',
            quantity: qty,
            fulfilledQuantity: new Decimal(0),
            unitPrice: price,
            discountAmount: discount,
            taxRate: taxRate,
            lineTotal: lineTotal,
          });
        }

        await tx.salesOrderItem.createMany({ data: newItems });

        const totalAmount = subtotal.sub(totalDiscount).add(totalTax);

        return tx.salesOrder.update({
          where: { id: orderId },
          data: {
            subtotal,
            discountAmount: totalDiscount,
            taxAmount: totalTax,
            totalAmount,
            remainingBalance: totalAmount,
            note: dto.note !== undefined ? dto.note : existing.note,
            shippingRecipientName: dto.shippingRecipientName || existing.shippingRecipientName,
            shippingPhone: dto.shippingPhone || existing.shippingPhone,
            shippingFullAddress: dto.shippingFullAddress || existing.shippingFullAddress,
          },
          include: { items: true },
        });
      }

      return tx.salesOrder.update({
        where: { id: orderId },
        data: {
          note: dto.note !== undefined ? dto.note : existing.note,
          shippingRecipientName: dto.shippingRecipientName || existing.shippingRecipientName,
          shippingPhone: dto.shippingPhone || existing.shippingPhone,
          shippingFullAddress: dto.shippingFullAddress || existing.shippingFullAddress,
        },
        include: { items: true },
      });
    });
  }

  /**
   * 5. Confirm Order & Create Atomic Stock Reservation
   * Enforces:
   *  - Row-lock sales_orders FOR UPDATE
   *  - Deterministic sort & row-lock stock_balances ORDER BY product_id ASC FOR UPDATE
   *  - Query SUM(quantity) active reservations to evaluate dynamic available stock
   *  - If sufficient: create ACTIVE reservation and set order to CONFIRMED
   *  - Bounded retry on deadlock (40P01)
   */
  async confirmOrder(
    orgId: string,
    orderId: string,
    userId: string,
    dto: ConfirmSalesOrderDto,
  ) {
    return this.executeWithRetry(async () => {
      return this.prisma.runInTenantContext(orgId, async (tx) => {
        // 1. Lock sales_orders row
        const lockedOrders: any[] = await tx.$queryRaw(
          Prisma.sql`SELECT id, status, warehouse_id, order_code FROM sales_orders WHERE id = ${orderId}::uuid AND organization_id = ${orgId}::uuid FOR UPDATE`,
        );

        if (!lockedOrders || lockedOrders.length === 0) {
          throw new NotFoundException('Không tìm thấy đơn bán hàng!');
        }

        const currentOrder = lockedOrders[0];
        if (currentOrder.status !== SalesOrderStatus.DRAFT) {
          throw new BadRequestException(
            `Đơn hàng đang ở trạng thái [${currentOrder.status}], không thể duyệt (chỉ duyệt đơn DRAFT)!`,
          );
        }

        // Fetch order items
        const orderItems = await tx.salesOrderItem.findMany({
          where: { salesOrderId: orderId },
          include: { product: true },
        });

        if (orderItems.length === 0) {
          throw new BadRequestException('Đơn hàng không có sản phẩm nào!');
        }

        // Sort product IDs deterministically to prevent cross-transaction deadlocks
        const productIds = Array.from(
          new Set(orderItems.map((i) => i.productId)),
        ).sort();

        // 2. Pessimistic row-lock on inventory_balances ORDER BY product_id ASC FOR UPDATE
        await tx.$queryRaw(
          Prisma.sql`SELECT id, product_id, quantity_on_hand FROM inventory_balances 
                     WHERE warehouse_id = ${currentOrder.warehouse_id}::uuid 
                       AND product_id IN (${Prisma.join(productIds.map((id) => Prisma.sql`${id}::uuid`))})
                     ORDER BY product_id ASC FOR UPDATE`,
        );

        // Group total requested quantities by product
        const requestedByProduct = new Map<string, Decimal>();
        for (const item of orderItems) {
          const current = requestedByProduct.get(item.productId) || new Decimal(0);
          requestedByProduct.set(item.productId, current.add(item.quantity));
        }

        // 3. For each product, check available = onHand - activeReservations
        for (const [productId, reqQty] of requestedByProduct.entries()) {
          const balance = await tx.inventoryBalance.findFirst({
            where: {
              warehouseId: currentOrder.warehouse_id,
              productId: productId,
            },
          });

          const onHand = balance ? new Decimal(balance.quantityOnHand) : new Decimal(0);

          // Dynamic calculation: sum of active reservations
          const resAggregate: any[] = await tx.$queryRaw(
            Prisma.sql`SELECT COALESCE(SUM(quantity), 0) as reserved_qty 
                       FROM inventory_reservations 
                       WHERE warehouse_id = ${currentOrder.warehouse_id}::uuid 
                         AND product_id = ${productId}::uuid 
                         AND status = 'ACTIVE'::"ReservationStatus"`,
          );

          const activeReserved = new Decimal(
            resAggregate[0]?.reserved_qty?.toString() || '0',
          );
          const availableStock = onHand.sub(activeReserved);

          if (availableStock.lt(reqQty)) {
            const item = orderItems.find((i) => i.productId === productId);
            const sku = item?.skuSnapshot || productId;
            throw new BadRequestException(
              `Sản phẩm [${sku}] không đủ tồn kho khả dụng để duyệt đơn! (Tồn thực tế: ${onHand}, Đã giữ: ${activeReserved}, Khả dụng: ${availableStock}, Cần duyệt: ${reqQty})`,
            );
          }
        }

        // 4. All products available -> Create ACTIVE reservations
        for (const item of orderItems) {
          await tx.inventoryReservation.create({
            data: {
              organizationId: orgId,
              warehouseId: currentOrder.warehouse_id,
              productId: item.productId,
              salesOrderId: orderId,
              quantity: item.quantity,
              status: ReservationStatus.ACTIVE,
            },
          });
        }

        // 5. Update order status to CONFIRMED
        const updatedOrder = await tx.salesOrder.update({
          where: { id: orderId },
          data: {
            status: SalesOrderStatus.CONFIRMED,
            confirmedBy: userId,
            confirmedAt: new Date(),
          },
          include: {
            items: true,
            reservations: true,
          },
        });

        // 6. Record status history
        await tx.salesOrderStatusHistory.create({
          data: {
            salesOrderId: orderId,
            fromStatus: SalesOrderStatus.DRAFT,
            toStatus: SalesOrderStatus.CONFIRMED,
            changedBy: userId,
            note: dto.note || 'Xác nhận đơn hàng và khóa giữ tồn kho (Stock Reservation)',
          },
        });

        return updatedOrder;
      });
    });
  }

  /**
   * 6. Transition Order from CONFIRMED -> PROCESSING
   */
  async processOrder(orgId: string, orderId: string, userId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const lockedOrders: any[] = await tx.$queryRaw(
        Prisma.sql`SELECT id, status FROM sales_orders WHERE id = ${orderId}::uuid AND organization_id = ${orgId}::uuid FOR UPDATE`,
      );

      if (!lockedOrders || lockedOrders.length === 0) {
        throw new NotFoundException('Không tìm thấy đơn bán hàng!');
      }

      const current = lockedOrders[0];
      if (current.status !== SalesOrderStatus.CONFIRMED) {
        throw new BadRequestException(
          `Chỉ có thể chuyển sang PROCESSING cho đơn hàng đang ở trạng thái CONFIRMED (Hiện tại: ${current.status})`,
        );
      }

      const updated = await tx.salesOrder.update({
        where: { id: orderId },
        data: { status: SalesOrderStatus.PROCESSING },
        include: { items: true },
      });

      await tx.salesOrderStatusHistory.create({
        data: {
          salesOrderId: orderId,
          fromStatus: SalesOrderStatus.CONFIRMED,
          toStatus: SalesOrderStatus.PROCESSING,
          changedBy: userId,
          note: 'Bắt đầu nhặt hàng và đóng gói (Processing)',
        },
      });

      return updated;
    });
  }

  /**
   * 7. Warehouse Acknowledgment for Cancellation
   * Called by Warehouse Staff (sales.fulfillment.manage)
   * Records persisted acknowledgment in sales_order_status_histories
   */
  async warehouseAckCancel(
    orgId: string,
    orderId: string,
    userId: string,
    dto: WarehouseAckCancelDto,
  ) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const lockedOrders: any[] = await tx.$queryRaw(
        Prisma.sql`SELECT id, status FROM sales_orders WHERE id = ${orderId}::uuid AND organization_id = ${orgId}::uuid FOR UPDATE`,
      );

      if (!lockedOrders || lockedOrders.length === 0) {
        throw new NotFoundException('Không tìm thấy đơn bán hàng!');
      }

      const current = lockedOrders[0];
      if (current.status !== SalesOrderStatus.PROCESSING) {
        throw new BadRequestException(
          `Chỉ cần xác nhận kho khi đơn hàng đang ở trạng thái PROCESSING (Hiện tại: ${current.status})`,
        );
      }

      // Record persisted acknowledgment in status histories
      await tx.salesOrderStatusHistory.create({
        data: {
          salesOrderId: orderId,
          fromStatus: SalesOrderStatus.PROCESSING,
          toStatus: SalesOrderStatus.PROCESSING,
          changedBy: userId,
          note: `[WAREHOUSE_ACK_CANCEL] Kho xác nhận dừng nhặt hàng: ${dto.note || 'Hàng chưa lên xe, an toàn hủy'}`,
        },
      });

      return {
        success: true,
        message: 'Bộ phận kho đã xác nhận dừng nhặt hàng thành công.',
      };
    });
  }

  /**
   * 8. Cancel Order & Release Stock Reservation
   * Handles:
   *  - DRAFT: cancel directly
   *  - CONFIRMED: release active reservations
   *  - PROCESSING: requires persisted warehouse acknowledgment in DB
   *  - PARTIALLY_FULFILLED: release remaining active reservations, keep fulfilled count intact, set status CANCELLED
   */
  async cancelOrder(
    orgId: string,
    orderId: string,
    userId: string,
    dto: CancelSalesOrderDto,
  ) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const lockedOrders: any[] = await tx.$queryRaw(
        Prisma.sql`SELECT id, status FROM sales_orders WHERE id = ${orderId}::uuid AND organization_id = ${orgId}::uuid FOR UPDATE`,
      );

      if (!lockedOrders || lockedOrders.length === 0) {
        throw new NotFoundException('Không tìm thấy đơn bán hàng!');
      }

      const current = lockedOrders[0];
      const fromStatus = current.status as SalesOrderStatus;

      if (
        fromStatus === SalesOrderStatus.FULFILLED ||
        fromStatus === SalesOrderStatus.CANCELLED
      ) {
        throw new BadRequestException(
          `Không thể hủy đơn hàng đã hoàn tất (FULFILLED) hoặc đã hủy (CANCELLED)!`,
        );
      }

      // Special rule for PROCESSING: must have persisted warehouse ack in DB
      if (fromStatus === SalesOrderStatus.PROCESSING) {
        const warehouseAck = await tx.salesOrderStatusHistory.findFirst({
          where: {
            salesOrderId: orderId,
            note: { contains: '[WAREHOUSE_ACK_CANCEL]' },
          },
        });

        if (!warehouseAck) {
          throw new BadRequestException(
            'Yêu cầu bộ phận kho xác nhận dừng nhặt hàng (Warehouse Acknowledgment) trước khi hủy đơn đang xử lý!',
          );
        }
      }

      // If order was CONFIRMED, PROCESSING, or PARTIALLY_FULFILLED, release all ACTIVE reservations
      if (
        fromStatus === SalesOrderStatus.CONFIRMED ||
        fromStatus === SalesOrderStatus.PROCESSING ||
        fromStatus === SalesOrderStatus.PARTIALLY_FULFILLED
      ) {
        await tx.inventoryReservation.updateMany({
          where: {
            salesOrderId: orderId,
            status: ReservationStatus.ACTIVE,
          },
          data: {
            status: ReservationStatus.RELEASED,
            releasedAt: new Date(),
          },
        });
      }

      const updated = await tx.salesOrder.update({
        where: { id: orderId },
        data: { status: SalesOrderStatus.CANCELLED },
        include: { items: true, reservations: true },
      });

      await tx.salesOrderStatusHistory.create({
        data: {
          salesOrderId: orderId,
          fromStatus,
          toStatus: SalesOrderStatus.CANCELLED,
          changedBy: userId,
          note: dto.reason || 'Hủy đơn hàng',
        },
      });

      return updated;
    });
  }

  /**
   * 9. Fulfill Order (Giao vận & Xuất kho)
   * Handles complete or partial delivery:
   *  - Row-lock sales_orders & inventory_balances
   *  - Decrements physical on_hand inventory
   *  - Creates StockIssue & StockIssueItems & InventoryTransactions (ISSUE)
   *  - Updates fulfilledQuantity on SalesOrderItems
   *  - Updates/closes InventoryReservation
   *  - Creates Fulfillment record
   *  - Sets order status: FULFILLED if 100% delivered, else PARTIALLY_FULFILLED
   */
  async fulfillOrder(
    orgId: string,
    orderId: string,
    userId: string,
    dto: FulfillSalesOrderDto,
  ) {
    return this.executeWithRetry(async () => {
      return this.prisma.runInTenantContext(orgId, async (tx) => {
        // 1. Lock sales_orders row
        const lockedOrders: any[] = await tx.$queryRaw(
          Prisma.sql`SELECT id, status, warehouse_id, order_code FROM sales_orders 
                     WHERE id = ${orderId}::uuid AND organization_id = ${orgId}::uuid FOR UPDATE`,
        );

        if (!lockedOrders || lockedOrders.length === 0) {
          throw new NotFoundException('Không tìm thấy đơn bán hàng!');
        }

        const currentOrder = lockedOrders[0];
        const allowedStatuses: SalesOrderStatus[] = [
          SalesOrderStatus.CONFIRMED,
          SalesOrderStatus.PROCESSING,
          SalesOrderStatus.PARTIALLY_FULFILLED,
        ];

        if (!allowedStatuses.includes(currentOrder.status)) {
          throw new BadRequestException(
            `Chỉ có thể xuất kho giao hàng cho đơn hàng ở trạng thái CONFIRMED, PROCESSING hoặc PARTIALLY_FULFILLED (Hiện tại: ${currentOrder.status})`,
          );
        }

        const orderItems = await tx.salesOrderItem.findMany({
          where: { salesOrderId: orderId },
          include: { product: true },
        });

        // Determine items and quantities to fulfill
        const fulfillMap = new Map<string, Decimal>();

        if (dto.items && dto.items.length > 0) {
          for (const itemDto of dto.items) {
            const current = fulfillMap.get(itemDto.productId) || new Decimal(0);
            fulfillMap.set(itemDto.productId, current.add(itemDto.quantity));
          }
        } else {
          // Fulfill all remaining unfulfilled quantities
          for (const oi of orderItems) {
            const remaining = new Decimal(oi.quantity).sub(oi.fulfilledQuantity);
            if (remaining.gt(0)) {
              fulfillMap.set(oi.productId, remaining);
            }
          }
        }

        if (fulfillMap.size === 0) {
          throw new BadRequestException('Không có mặt hàng nào cần xuất kho!');
        }

        // Validate fulfill quantities against remaining
        for (const [productId, fulfillQty] of fulfillMap.entries()) {
          const item = orderItems.find((oi) => oi.productId === productId);
          if (!item) {
            throw new BadRequestException(`Sản phẩm [${productId}] không thuộc đơn hàng!`);
          }

          const remaining = new Decimal(item.quantity).sub(item.fulfilledQuantity);
          if (fulfillQty.gt(remaining)) {
            throw new BadRequestException(
              `Số lượng xuất cho sản phẩm [${item.skuSnapshot}] (${fulfillQty}) vượt quá số lượng chưa giao (${remaining})!`,
            );
          }
        }

        // 2. Pessimistic lock stock_balances ORDER BY product_id ASC FOR UPDATE
        const sortedProductIds = Array.from(fulfillMap.keys()).sort();
        await tx.$queryRaw(
          Prisma.sql`SELECT id, product_id, quantity_on_hand FROM inventory_balances 
                     WHERE warehouse_id = ${currentOrder.warehouse_id}::uuid 
                       AND product_id IN (${Prisma.join(sortedProductIds.map((id) => Prisma.sql`${id}::uuid`))})
                     ORDER BY product_id ASC FOR UPDATE`,
        );

        // 3. Create StockIssue document
        const issueCode = `XK-SO-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
        const stockIssue = await tx.stockIssue.create({
          data: {
            organizationId: orgId,
            issueCode,
            warehouseId: currentOrder.warehouse_id,
            referenceType: 'SALES_ORDER',
            referenceId: currentOrder.order_code,
            status: StockDocStatus.POSTED,
            note: dto.note || `Xuất kho giao hàng theo đơn [${currentOrder.order_code}]`,
            createdBy: userId,
            postedBy: userId,
            postedAt: new Date(),
          },
        });

        // 4. Update balances, reservations, and ledger
        const fulfillmentItemsToCreate: any[] = [];

        for (const [productId, fulfillQty] of fulfillMap.entries()) {
          const orderItem = orderItems.find((oi) => oi.productId === productId)!;

          // Create stock issue item
          await tx.stockIssueItem.create({
            data: {
              issueId: stockIssue.id,
              productId,
              quantity: fulfillQty,
              unitCost: new Decimal(0),
            },
          });

          // Decrement physical stock in inventory_balances
          const updatedBal = await tx.inventoryBalance.update({
            where: {
              organizationId_warehouseId_productId: {
                organizationId: orgId,
                warehouseId: currentOrder.warehouse_id,
                productId,
              },
            },
            data: {
              quantityOnHand: { decrement: fulfillQty },
            },
          });

          // Record ledger transaction
          await tx.inventoryTransaction.create({
            data: {
              organizationId: orgId,
              warehouseId: currentOrder.warehouse_id,
              productId,
              transactionType: InventoryTransactionType.ISSUE,
              referenceType: 'STOCK_ISSUE',
              referenceId: stockIssue.issueCode,
              quantityChange: new Prisma.Decimal((-fulfillQty.toNumber()).toFixed(3)),
              unitCost: new Decimal(0),
              balanceAfter: updatedBal.quantityOnHand,
              createdBy: userId,
            },
          });

          // Update order item fulfilledQuantity
          await tx.salesOrderItem.update({
            where: { id: orderItem.id },
            data: {
              fulfilledQuantity: { increment: fulfillQty },
            },
          });

          // Update or release active reservations
          const activeRes = await tx.inventoryReservation.findFirst({
            where: {
              salesOrderId: orderId,
              productId,
              status: ReservationStatus.ACTIVE,
            },
          });

          if (activeRes) {
            const resQty = new Decimal(activeRes.quantity);
            if (resQty.lte(fulfillQty)) {
              await tx.inventoryReservation.update({
                where: { id: activeRes.id },
                data: {
                  status: ReservationStatus.FULFILLED,
                  releasedAt: new Date(),
                },
              });
            } else {
              await tx.inventoryReservation.update({
                where: { id: activeRes.id },
                data: {
                  quantity: resQty.sub(fulfillQty),
                },
              });
            }
          }

          fulfillmentItemsToCreate.push({
            productId,
            quantity: fulfillQty,
          });
        }

        // 5. Update Order Status to SHIPPING (Đang giao hàng)
        const nextStatus = 'SHIPPING' as SalesOrderStatus;

        const updatedOrder = await tx.salesOrder.update({
          where: { id: orderId },
          data: { status: nextStatus },
          include: { items: true, reservations: true },
        });

        await tx.salesOrderStatusHistory.create({
          data: {
            salesOrderId: orderId,
            fromStatus: currentOrder.status,
            toStatus: nextStatus,
            changedBy: userId,
            note: `Đã xuất kho bàn giao ĐVVC [${dto.carrierName || 'Giao Hàng Nhanh (GHN)'}], Mã vận đơn: [${dto.trackingNumber || 'N/A'}] - Phiếu xuất [${issueCode}]. Trạng thái: Đang giao hàng (SHIPPING)`,
          },
        });

        return {
          order: updatedOrder,
          stockIssue,
        };
      });
    });
  }

  /**
   * 10. Confirm Order Delivery (Giao hàng thành công)
   * Transitions SHIPPING -> FULFILLED
   */
  async deliverOrder(orgId: string, orderId: string, userId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const lockedOrders: any[] = await tx.$queryRaw(
        Prisma.sql`SELECT id, status, order_code FROM sales_orders WHERE id = ${orderId}::uuid AND organization_id = ${orgId}::uuid FOR UPDATE`,
      );

      if (!lockedOrders || lockedOrders.length === 0) {
        throw new NotFoundException('Không tìm thấy đơn bán hàng!');
      }

      const current = lockedOrders[0];
      if (
        current.status !== 'SHIPPING' &&
        current.status !== SalesOrderStatus.PARTIALLY_FULFILLED &&
        current.status !== SalesOrderStatus.PROCESSING
      ) {
        throw new BadRequestException(
          `Chỉ có thể xác nhận giao thành công cho đơn đang giao hàng (SHIPPING). Hiện tại: ${current.status}`,
        );
      }

      const updated = await tx.salesOrder.update({
        where: { id: orderId },
        data: { status: SalesOrderStatus.FULFILLED },
        include: { items: true },
      });

      await tx.salesOrderStatusHistory.create({
        data: {
          salesOrderId: orderId,
          fromStatus: current.status,
          toStatus: SalesOrderStatus.FULFILLED,
          changedBy: userId,
          note: 'Khách hàng đã nhận hàng thành công. Hoàn tất đơn hàng (FULFILLED)!',
        },
      });

      return updated;
    });
  }

  /**
   * 10. Dashboard Metrics
   */
  async getDashboardMetrics(orgId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const orders = await tx.salesOrder.findMany({
        where: { organizationId: orgId },
        select: { status: true, totalAmount: true },
      });

      const totalOrders = orders.length;
      let revenue = new Decimal(0);
      let draftCount = 0;
      let confirmedCount = 0;
      let processingCount = 0;
      let partiallyFulfilledCount = 0;
      let fulfilledCount = 0;
      let cancelledCount = 0;

      for (const o of orders) {
        if (o.status === SalesOrderStatus.DRAFT) draftCount++;
        else if (o.status === SalesOrderStatus.CONFIRMED) {
          confirmedCount++;
          revenue = revenue.add(o.totalAmount);
        } else if (o.status === SalesOrderStatus.PROCESSING) {
          processingCount++;
          revenue = revenue.add(o.totalAmount);
        } else if (o.status === SalesOrderStatus.PARTIALLY_FULFILLED) {
          partiallyFulfilledCount++;
          revenue = revenue.add(o.totalAmount);
        } else if (o.status === SalesOrderStatus.FULFILLED) {
          fulfilledCount++;
          revenue = revenue.add(o.totalAmount);
        } else if (o.status === SalesOrderStatus.CANCELLED) cancelledCount++;
      }

      const pendingDelivery = confirmedCount + processingCount;
      const nonDraftTotal = totalOrders - draftCount;
      const fulfillmentRate =
        nonDraftTotal > 0
          ? Math.round((fulfilledCount / nonDraftTotal) * 100)
          : 0;

      return {
        totalOrders,
        revenue: revenue.toNumber(),
        pendingDelivery,
        fulfillmentRate,
        byStatus: {
          DRAFT: draftCount,
          CONFIRMED: confirmedCount,
          PROCESSING: processingCount,
          PARTIALLY_FULFILLED: partiallyFulfilledCount,
          FULFILLED: fulfilledCount,
          CANCELLED: cancelledCount,
        },
      };
    });
  }

  /**
   * 11. Get Fulfillments (Mapped from StockIssues)
   */
  async getFulfillments(orgId: string, orderId?: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const where: any = {
        organizationId: orgId,
        referenceType: 'SALES_ORDER',
      };

      if (orderId) {
        const order = await tx.salesOrder.findUnique({
          where: { id: orderId },
          select: { orderCode: true },
        });
        if (order) {
          where.referenceId = order.orderCode;
        }
      }

      return tx.stockIssue.findMany({
        where,
        include: {
          items: { include: { product: true } },
          warehouse: { select: { id: true, name: true, code: true } },
          creator: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }
}
