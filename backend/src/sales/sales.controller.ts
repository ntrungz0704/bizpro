import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import {
  CreateSalesOrderDto,
  UpdateSalesOrderDto,
  ConfirmSalesOrderDto,
  CancelSalesOrderDto,
  WarehouseAckCancelDto,
  FulfillSalesOrderDto,
  QuerySalesOrderDto,
} from './dto/sales.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('sales')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly prisma: PrismaService,
  ) {}

  private async getContext(req: any) {
    let orgId = req.user?.organizationId || req.user?.orgId;
    let userId = req.user?.id || req.user?.userId;

    if (!orgId || !userId) {
      const org = await this.prisma.runInSystemContext((tx) =>
        tx.organization.findFirst({ select: { id: true } }),
      );
      const user = await this.prisma.runInSystemContext((tx) =>
        tx.user.findFirst({ select: { id: true } }),
      );
      orgId = orgId || org?.id;
      userId = userId || user?.id;
    }

    return { orgId, userId };
  }

  /**
   * GET /api/sales/dashboard
   */
  @Get('dashboard')
  @RequirePermissions('sales.orders.read')
  async getDashboard(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.salesService.getDashboardMetrics(orgId);
  }

  /**
   * GET /api/sales/fulfillments
   */
  @Get('fulfillments')
  @RequirePermissions('sales.orders.read')
  async getFulfillments(
    @Req() req: any,
    @Query('orderId') orderId?: string,
  ) {
    const { orgId } = await this.getContext(req);
    return this.salesService.getFulfillments(orgId, orderId);
  }

  /**
   * POST /api/sales/orders
   */
  @Post('orders')
  @RequirePermissions('sales.orders.write')
  async createOrder(@Req() req: any, @Body() dto: CreateSalesOrderDto) {
    const { orgId, userId } = await this.getContext(req);
    return this.salesService.createOrder(orgId, userId, dto);
  }

  /**
   * GET /api/sales/orders
   */
  @Get('orders')
  @RequirePermissions('sales.orders.read')
  async getOrders(@Req() req: any, @Query() query: QuerySalesOrderDto) {
    const { orgId } = await this.getContext(req);
    return this.salesService.getOrders(orgId, query);
  }

  /**
   * GET /api/sales/orders/:id
   */
  @Get('orders/:id')
  @RequirePermissions('sales.orders.read')
  async getOrderById(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.salesService.getOrderById(orgId, id);
  }

  /**
   * PATCH /api/sales/orders/:id
   */
  @Patch('orders/:id')
  @RequirePermissions('sales.orders.write')
  async updateOrder(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateSalesOrderDto,
  ) {
    const { orgId, userId } = await this.getContext(req);
    return this.salesService.updateOrder(orgId, id, userId, dto);
  }

  /**
   * POST /api/sales/orders/:id/confirm
   */
  @Post('orders/:id/confirm')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales.orders.confirm')
  async confirmOrder(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ConfirmSalesOrderDto,
  ) {
    const { orgId, userId } = await this.getContext(req);
    return this.salesService.confirmOrder(orgId, id, userId, dto);
  }

  /**
   * POST /api/sales/orders/:id/process
   */
  @Post('orders/:id/process')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales.fulfillment.manage')
  async processOrder(@Req() req: any, @Param('id') id: string) {
    const { orgId, userId } = await this.getContext(req);
    return this.salesService.processOrder(orgId, id, userId);
  }

  /**
   * POST /api/sales/orders/:id/warehouse-ack-cancel
   */
  @Post('orders/:id/warehouse-ack-cancel')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales.fulfillment.manage')
  async warehouseAckCancel(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: WarehouseAckCancelDto,
  ) {
    const { orgId, userId } = await this.getContext(req);
    return this.salesService.warehouseAckCancel(orgId, id, userId, dto);
  }

  /**
   * POST /api/sales/orders/:id/cancel
   */
  @Post('orders/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales.orders.cancel')
  async cancelOrder(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CancelSalesOrderDto,
  ) {
    const { orgId, userId } = await this.getContext(req);
    return this.salesService.cancelOrder(orgId, id, userId, dto);
  }

  /**
   * POST /api/sales/orders/:id/fulfill
   */
  @Post('orders/:id/fulfill')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales.fulfillment.manage')
  async fulfillOrder(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: FulfillSalesOrderDto,
  ) {
    const { orgId, userId } = await this.getContext(req);
    return this.salesService.fulfillOrder(orgId, id, userId, dto);
  }

  /**
   * POST /api/sales/orders/:id/deliver
   */
  @Post('orders/:id/deliver')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('sales.fulfillment.manage')
  async deliverOrder(@Req() req: any, @Param('id') id: string) {
    const { orgId, userId } = await this.getContext(req);
    return this.salesService.deliverOrder(orgId, id, userId);
  }
}
