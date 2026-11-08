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

@Controller('crm')
@UseGuards(JwtAuthGuard)
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
  async createLead(@Req() req: any, @Body() dto: CreateLeadDto) {
    const { orgId } = await this.getContext(req);
    return this.crmService.createLead(orgId, dto);
  }

  @Get('leads')
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
  async getLeadById(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getLeadById(orgId, id);
  }

  @Patch('leads/:id')
  async updateLead(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateLeadDto) {
    const { orgId } = await this.getContext(req);
    return this.crmService.updateLead(orgId, id, dto);
  }

  @Delete('leads/:id')
  async deleteLead(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.crmService.deleteLead(orgId, id);
  }

  @Post('leads/:id/convert')
  async convertLead(@Req() req: any, @Param('id') id: string, @Body() dto: ConvertLeadDto) {
    const { orgId, userId } = await this.getContext(req);
    return this.crmService.convertLead(orgId, id, dto, userId);
  }

  /* --------------------------------------------------------------------------
     CUSTOMERS
     -------------------------------------------------------------------------- */
  @Post('customers')
  async createCustomer(@Req() req: any, @Body() dto: CreateCustomerDto) {
    const { orgId } = await this.getContext(req);
    return this.crmService.createCustomer(orgId, dto);
  }

  @Get('customers')
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
  async getCustomerById(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getCustomerById(orgId, id);
  }

  @Patch('customers/:id')
  async updateCustomer(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const { orgId } = await this.getContext(req);
    return this.crmService.updateCustomer(orgId, id, dto);
  }

  @Delete('customers/:id')
  async deleteCustomer(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.crmService.deleteCustomer(orgId, id);
  }

  /* --------------------------------------------------------------------------
     CONTACTS
     -------------------------------------------------------------------------- */
  @Post('contacts')
  async createContact(@Req() req: any, @Body() dto: CreateContactDto) {
    const { orgId } = await this.getContext(req);
    return this.crmService.createContact(orgId, dto);
  }

  @Get('contacts')
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
  async getContactById(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getContactById(orgId, id);
  }

  @Patch('contacts/:id')
  async updateContact(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateContactDto) {
    const { orgId } = await this.getContext(req);
    return this.crmService.updateContact(orgId, id, dto);
  }

  @Delete('contacts/:id')
  async deleteContact(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.crmService.deleteContact(orgId, id);
  }

  /* --------------------------------------------------------------------------
     DEALS & PIPELINES
     -------------------------------------------------------------------------- */
  @Get('pipelines')
  async getPipelines(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getPipelines(orgId);
  }

  @Post('deals')
  async createDeal(@Req() req: any, @Body() dto: CreateDealDto) {
    const { orgId, userId } = await this.getContext(req);
    return this.crmService.createDeal(orgId, dto, userId);
  }

  @Get('deals')
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
  async getDealById(@Req() req: any, @Param('id') id: string) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getDealById(orgId, id);
  }

  @Patch('deals/:id')
  async updateDeal(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateDealDto) {
    const { orgId } = await this.getContext(req);
    return this.crmService.updateDeal(orgId, id, dto);
  }

  @Patch('deals/:id/stage')
  async updateDealStage(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateDealStageDto) {
    const { orgId, userId } = await this.getContext(req);
    return this.crmService.updateDealStage(orgId, id, dto, userId);
  }

  /* --------------------------------------------------------------------------
     ACTIVITIES
     -------------------------------------------------------------------------- */
  @Post('activities')
  async createActivity(@Req() req: any, @Body() dto: CreateActivityDto) {
    const { orgId, userId } = await this.getContext(req);
    return this.crmService.createActivity(orgId, dto, userId);
  }

  @Get('activities')
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
  async updateActivity(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateActivityDto) {
    const { orgId } = await this.getContext(req);
    return this.crmService.updateActivity(orgId, id, dto);
  }

  /* --------------------------------------------------------------------------
     CRM DASHBOARD METRICS
     -------------------------------------------------------------------------- */
  @Get('dashboard')
  async getCrmDashboardMetrics(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.crmService.getCrmDashboardMetrics(orgId);
  }
}
