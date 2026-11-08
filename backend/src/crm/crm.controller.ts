import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import {
  CreateActivityDto,
  CreateContactDto,
  CreateCustomerDto,
  CreateDealDto,
  CreateLeadDto,
  ConvertLeadDto,
  UpdateActivityDto,
  UpdateContactDto,
  UpdateCustomerDto,
  UpdateDealDto,
  UpdateDealStageDto,
  UpdateLeadDto,
} from './dto/crm.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityStatus, CommonStatus, CustomerType, DealStatus, LeadStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';

@Controller('crm')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CrmController {
  constructor(
    private readonly crmService: CrmService,
    private readonly prisma: PrismaService,
  ) {}

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

  /* --------------------------------------------------------------------------
     LEADS
     -------------------------------------------------------------------------- */
  @Post('leads')
  @RequirePermissions('crm.leads.write')
  async createLead(@Req() req: any, @Body() dto: CreateLeadDto) {
    const { orgId } = await this.getContext(req);
    return this.crmService.createLead(orgId, dto);
  }

  @Get('leads')
  @RequirePermissions('crm.leads.read')
  async getLeads(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('status') status?: LeadStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getLeads(orgId, {
      search,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('leads/:id')
  @RequirePermissions('crm.leads.read')
  async getLeadById(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getLeadById(orgId, id);
  }

  @Patch('leads/:id')
  @RequirePermissions('crm.leads.write')
  async updateLead(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
    const { orgId } = await this.getContext(req);
    return this.crmService.updateLead(orgId, id, dto);
  }

  @Delete('leads/:id')
  @RequirePermissions('crm.leads.write')
  async deleteLead(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.crmService.deleteLead(orgId, id);
  }

  @Post('leads/:id/convert')
  @RequirePermissions('crm.leads.write')
  async convertLead(@Req() req: any, @Param('id') id: string, @Body() dto: ConvertLeadDto) {
    const { orgId, userId } = await this.getContext(req);
    return this.crmService.convertLead(orgId, id, dto, userId);
  }

  /* --------------------------------------------------------------------------
     CUSTOMERS
     -------------------------------------------------------------------------- */
  @Post('customers')
  @RequirePermissions('crm.customers.write')
  async createCustomer(@Req() req: any, @Body() dto: CreateCustomerDto) {
    const { orgId } = await this.getContext(req);
    return this.crmService.createCustomer(orgId, dto);
  }

  @Get('customers')
  @RequirePermissions('crm.customers.read')
  async getCustomers(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('type') type?: CustomerType,
    @Query('status') status?: CommonStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getCustomers(orgId, {
      search,
      type,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('customers/:id')
  @RequirePermissions('crm.customers.read')
  async getCustomerById(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getCustomerById(orgId, id);
  }

  @Patch('customers/:id')
  @RequirePermissions('crm.customers.write')
  async updateCustomer(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const { orgId } = await this.getContext(req);
    return this.crmService.updateCustomer(orgId, id, dto);
  }

  @Delete('customers/:id')
  @RequirePermissions('crm.customers.write')
  async deleteCustomer(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.crmService.deleteCustomer(orgId, id);
  }

  /* --------------------------------------------------------------------------
     CONTACTS
     -------------------------------------------------------------------------- */
  @Post('contacts')
  @RequirePermissions('crm.customers.write')
  async createContact(@Req() req: any, @Body() dto: CreateContactDto) {
    const { orgId } = await this.getContext(req);
    return this.crmService.createContact(orgId, dto);
  }

  @Get('contacts')
  @RequirePermissions('crm.customers.read')
  async getContacts(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getContacts(orgId, {
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('contacts/:id')
  @RequirePermissions('crm.customers.read')
  async getContactById(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getContactById(orgId, id);
  }

  @Patch('contacts/:id')
  @RequirePermissions('crm.customers.write')
  async updateContact(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateContactDto) {
    const { orgId } = await this.getContext(req);
    return this.crmService.updateContact(orgId, id, dto);
  }

  @Delete('contacts/:id')
  @RequirePermissions('crm.customers.write')
  async deleteContact(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.crmService.deleteContact(orgId, id);
  }

  /* --------------------------------------------------------------------------
     DEALS & PIPELINES
     -------------------------------------------------------------------------- */
  @Get('pipelines')
  @RequirePermissions('crm.deals.read')
  async getPipelines(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getPipelines(orgId);
  }

  @Post('deals')
  @RequirePermissions('crm.deals.write')
  async createDeal(@Req() req: any, @Body() dto: CreateDealDto) {
    const { orgId, userId } = await this.getContext(req);
    return this.crmService.createDeal(orgId, dto, userId);
  }

  @Get('deals')
  @RequirePermissions('crm.deals.read')
  async getDeals(
    @Req() req: any,
    @Query('stageId') stageId?: string,
    @Query('status') status?: DealStatus,
    @Query('search') search?: string,
  ) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getDeals(orgId, { stageId, status, search });
  }

  @Get('deals/:id')
  @RequirePermissions('crm.deals.read')
  async getDealById(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getDealById(orgId, id);
  }

  @Patch('deals/:id')
  @RequirePermissions('crm.deals.write')
  async updateDeal(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateDealDto) {
    const { orgId } = await this.getContext(req);
    return this.crmService.updateDeal(orgId, id, dto);
  }

  @Patch('deals/:id/stage')
  @RequirePermissions('crm.deals.write')
  async updateDealStage(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateDealStageDto) {
    const { orgId, userId } = await this.getContext(req);
    return this.crmService.updateDealStage(orgId, id, dto, userId);
  }

  /* --------------------------------------------------------------------------
     ACTIVITIES
     -------------------------------------------------------------------------- */
  @Post('activities')
  @RequirePermissions('crm.leads.write')
  async createActivity(@Req() req: any, @Body() dto: CreateActivityDto) {
    const { orgId, userId } = await this.getContext(req);
    return this.crmService.createActivity(orgId, dto, userId);
  }

  @Get('activities')
  @RequirePermissions('crm.leads.read')
  async getActivities(
    @Req() req: any,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('status') status?: ActivityStatus,
  ) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getActivities(orgId, { entityType, entityId, status });
  }

  @Patch('activities/:id')
  @RequirePermissions('crm.leads.write')
  async updateActivity(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateActivityDto) {
    const { orgId } = await this.getContext(req);
    return this.crmService.updateActivity(orgId, id, dto);
  }

  /* --------------------------------------------------------------------------
     CRM DASHBOARD METRICS
     -------------------------------------------------------------------------- */
  @Get('dashboard')
  @RequirePermissions('crm.deals.read')
  async getCrmDashboardMetrics(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getCrmDashboardMetrics(orgId);
  }
}
