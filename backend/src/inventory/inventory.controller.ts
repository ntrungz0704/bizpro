import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
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

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Helper to resolve active organization and user context
   */
  private async getContext(req: any) {
    let orgId = req.user?.organizationId || (req.headers && req.headers['x-organization-id']);
    let userId = req.user?.id || (req.headers && req.headers['x-user-id']);

    if (!orgId || !userId) {
      const org = (await this.prisma.runInSystemContext((tx) =>
        tx.organization.findFirst({
          where: { code: 'BIZPRO-CORP' },
          select: { id: true },
        }),
      )) || (await this.prisma.runInSystemContext((tx) =>
        tx.organization.findFirst({ select: { id: true } }),
      ));
      orgId = orgId || org?.id;

      if (orgId && !userId) {
        const user = await this.prisma.runInSystemContext((tx) =>
          tx.user.findFirst({
            where: { organizationId: orgId },
            select: { id: true },
          }),
        );
        userId = user?.id;
      }
    }

    return { orgId, userId };
  }

  /* =========================================================================
     1. UOM & CATEGORIES
     ========================================================================= */
  @Get('uoms')
  async getUoms(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getUoms(orgId);
  }

  @Post('uoms')
  async createUom(@Req() req: any, @Body() dto: CreateUomDto) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.createUom(orgId, dto);
  }

  @Get('categories')
  async getCategories(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getCategories(orgId);
  }

  @Post('categories')
  async createCategory(@Req() req: any, @Body() dto: CreateCategoryDto) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.createCategory(orgId, dto);
  }

  /* =========================================================================
     2. PRODUCTS
     ========================================================================= */
  @Get('products')
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
  async getProductById(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getProductById(orgId, id);
  }

  @Post('products')
  async createProduct(@Req() req: any, @Body() dto: CreateProductDto) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.createProduct(orgId, dto);
  }

  @Patch('products/:id')
  async updateProduct(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.updateProduct(orgId, id, dto);
  }

  /* =========================================================================
     3. WAREHOUSES
     ========================================================================= */
  @Get('warehouses')
  async getWarehouses(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getWarehouses(orgId);
  }

  @Post('warehouses')
  async createWarehouse(@Req() req: any, @Body() dto: CreateWarehouseDto) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.createWarehouse(orgId, dto);
  }

  @Patch('warehouses/:id')
  async updateWarehouse(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.updateWarehouse(orgId, id, dto);
  }

  /* =========================================================================
     4. STOCK BALANCES & LEDGER
     ========================================================================= */
  @Get('stock-balances')
  async getStockBalances(
    @Req() req: any,
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
  ) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getStockBalances(orgId, warehouseId, productId);
  }

  @Get('stock-ledger')
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
  async getReceipts(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getReceipts(orgId);
  }

  @Post('receipts')
  async createReceipt(@Req() req: any, @Body() dto: CreateStockReceiptDto) {
    const { orgId, userId } = await this.getContext(req);
    return this.inventoryService.createReceipt(orgId, userId, dto);
  }

  @Post('receipts/:id/post')
  async postReceipt(@Req() req: any, @Param('id') id: string) {
    const { orgId, userId } = await this.getContext(req);
    return this.inventoryService.postReceipt(orgId, id, userId);
  }

  /* =========================================================================
     6. STOCK ISSUES
     ========================================================================= */
  @Get('issues')
  async getIssues(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getIssues(orgId);
  }

  @Post('issues')
  async createIssue(@Req() req: any, @Body() dto: CreateStockIssueDto) {
    const { orgId, userId } = await this.getContext(req);
    return this.inventoryService.createIssue(orgId, userId, dto);
  }

  @Post('issues/:id/post')
  async postIssue(@Req() req: any, @Param('id') id: string) {
    const { orgId, userId } = await this.getContext(req);
    return this.inventoryService.postIssue(orgId, id, userId);
  }

  /* =========================================================================
     7. STOCKTAKES
     ========================================================================= */
  @Get('stocktakes')
  async getStocktakes(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.inventoryService.getStocktakes(orgId);
  }

  @Post('stocktakes')
  async createStocktake(@Req() req: any, @Body() dto: CreateStocktakeDto) {
    const { orgId, userId } = await this.getContext(req);
    return this.inventoryService.createStocktake(orgId, userId, dto);
  }

  @Post('stocktakes/:id/post')
  async postStocktake(@Req() req: any, @Param('id') id: string) {
    const { orgId, userId } = await this.getContext(req);
    return this.inventoryService.postStocktake(orgId, id, userId);
  }
}
