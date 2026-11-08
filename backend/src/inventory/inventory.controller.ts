import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
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
import { CommonStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Helper to resolve active organization and user context
   */
  private getContext(req: any) {
    const orgId = req.user?.organizationId || req.user?.orgId;
    const userId = req.user?.id || req.user?.userId;

    if (!orgId || !userId) {
      throw new UnauthorizedException(
        'Yêu cầu xác thực: Không tìm thấy thông tin tổ chức hoặc người dùng hợp lệ trong phiên đăng nhập',
      );
    }

    return { orgId, userId };
  }

  /* =========================================================================
     1. UOM & CATEGORIES
     ========================================================================= */
  @Get('uoms')
  @RequirePermissions('inventory.products.read')
  async getUoms(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getUoms(orgId);
  }

  @Post('uoms')
  @RequirePermissions('inventory.products.write')
  async createUom(@Req() req: any, @Body() dto: CreateUomDto) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.createUom(orgId, dto);
  }

  @Get('categories')
  @RequirePermissions('inventory.products.read')
  async getCategories(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getCategories(orgId);
  }

  @Post('categories')
  @RequirePermissions('inventory.products.write')
  async createCategory(@Req() req: any, @Body() dto: CreateCategoryDto) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.createCategory(orgId, dto);
  }

  /* =========================================================================
     2. PRODUCTS
     ========================================================================= */
  @Get('products')
  @RequirePermissions('inventory.products.read')
  async getProducts(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: CommonStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getProducts(orgId, {
      search,
      categoryId,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('products/:id')
  @RequirePermissions('inventory.products.read')
  async getProductById(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getProductById(orgId, id);
  }

  @Post('products')
  @RequirePermissions('inventory.products.write')
  async createProduct(@Req() req: any, @Body() dto: CreateProductDto) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.createProduct(orgId, dto);
  }

  @Patch('products/:id')
  @RequirePermissions('inventory.products.write')
  async updateProduct(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.updateProduct(orgId, id, dto);
  }

  /* =========================================================================
     3. WAREHOUSES
     ========================================================================= */
  @Get('warehouses')
  @RequirePermissions('inventory.products.read')
  async getWarehouses(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getWarehouses(orgId);
  }

  @Post('warehouses')
  @RequirePermissions('inventory.products.write')
  async createWarehouse(@Req() req: any, @Body() dto: CreateWarehouseDto) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.createWarehouse(orgId, dto);
  }

  @Patch('warehouses/:id')
  @RequirePermissions('inventory.products.write')
  async updateWarehouse(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.updateWarehouse(orgId, id, dto);
  }

  /* =========================================================================
     4. STOCK BALANCES & LEDGER
     ========================================================================= */
  @Get('stock-balances')
  @RequirePermissions('inventory.stock.read')
  async getStockBalances(
    @Req() req: any,
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
  ) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getStockBalances(orgId, warehouseId, productId);
  }

  @Get('stock-ledger')
  @RequirePermissions('inventory.stock.read')
  async getStockLedger(
    @Req() req: any,
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getStockLedger(orgId, {
      warehouseId,
      productId,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /* =========================================================================
     5. STOCK RECEIPTS
     ========================================================================= */
  @Get('receipts')
  @RequirePermissions('inventory.stock.read')
  async getReceipts(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getReceipts(orgId);
  }

  @Post('receipts')
  @RequirePermissions('inventory.stock.manage')
  async createReceipt(@Req() req: any, @Body() dto: CreateStockReceiptDto) {
    const { orgId, userId } = await this.getContext(req);
    return this.inventoryService.createReceipt(orgId, userId, dto);
  }

  @Post('receipts/:id/post')
  @RequirePermissions('inventory.stock.manage')
  async postReceipt(@Req() req: any, @Param('id') id: string) {
    const { orgId, userId } = await this.getContext(req);
    return this.inventoryService.postReceipt(orgId, id, userId);
  }

  /* =========================================================================
     6. STOCK ISSUES
     ========================================================================= */
  @Get('issues')
  @RequirePermissions('inventory.stock.read')
  async getIssues(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getIssues(orgId);
  }

  @Post('issues')
  @RequirePermissions('inventory.stock.manage')
  async createIssue(@Req() req: any, @Body() dto: CreateStockIssueDto) {
    const { orgId, userId } = await this.getContext(req);
    return this.inventoryService.createIssue(orgId, userId, dto);
  }

  @Post('issues/:id/post')
  @RequirePermissions('inventory.stock.manage')
  async postIssue(@Req() req: any, @Param('id') id: string) {
    const { orgId, userId } = await this.getContext(req);
    return this.inventoryService.postIssue(orgId, id, userId);
  }

  /* =========================================================================
     7. STOCKTAKES
     ========================================================================= */
  @Get('stocktakes')
  @RequirePermissions('inventory.stock.read')
  async getStocktakes(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getStocktakes(orgId);
  }

  @Post('stocktakes')
  @RequirePermissions('inventory.stock.manage')
  async createStocktake(@Req() req: any, @Body() dto: CreateStocktakeDto) {
    const { orgId, userId } = await this.getContext(req);
    return this.inventoryService.createStocktake(orgId, userId, dto);
  }

  @Post('stocktakes/:id/post')
  @RequirePermissions('inventory.stock.manage')
  async postStocktake(@Req() req: any, @Param('id') id: string) {
    const { orgId, userId } = await this.getContext(req);
    return this.inventoryService.postStocktake(orgId, id, userId);
  }
}
