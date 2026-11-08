import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, LeadStatus, CustomerType, DealStatus, CommonStatus, ActivityStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(private readonly prisma: PrismaService) {}

  /* --------------------------------------------------------------------------
     PIPELINES & MASTER DATA HELPER
     -------------------------------------------------------------------------- */
  async getOrCreateDefaultPipeline(orgId: string) {
    return this.prisma.runInSystemContext(async (tx) => {
      let pipeline = await tx.pipeline.findFirst({
        where: { organizationId: orgId, isDefault: true },
        include: { stages: { orderBy: { position: 'asc' } } },
      });

      if (!pipeline) {
        pipeline = await tx.pipeline.create({
          data: {
            organizationId: orgId,
            code: 'DEFAULT',
            name: 'Quy trình bán hàng Chuẩn',
            isDefault: true,
            stages: {
              create: [
                { organizationId: orgId, code: 'PROSPECTING', name: 'Mới tạo', position: 0, probability: 10 },
                { organizationId: orgId, code: 'CONTACTED', name: 'Đã liên hệ', position: 1, probability: 25 },
                { organizationId: orgId, code: 'QUALIFIED', name: 'Xác định nhu cầu', position: 2, probability: 50 },
                { organizationId: orgId, code: 'PROPOSAL', name: 'Gửi báo giá', position: 3, probability: 75 },
                { organizationId: orgId, code: 'NEGOTIATION', name: 'Đang đàm phán', position: 4, probability: 90 },
                { organizationId: orgId, code: 'WON', name: 'Chốt thành công', position: 5, probability: 100, isWon: true },
                { organizationId: orgId, code: 'LOST', name: 'Thất bại', position: 6, probability: 0, isLost: true },
              ],
            },
          },
          include: { stages: { orderBy: { position: 'asc' } } },
        });
      }

      return pipeline;
    });
  }

  async getPipelines(orgId: string) {
    await this.getOrCreateDefaultPipeline(orgId);
    return this.prisma.runInSystemContext(async (tx) => {
      return tx.pipeline.findMany({
        where: { organizationId: orgId },
        include: { stages: { orderBy: { position: 'asc' } } },
      });
    });
  }

  /* --------------------------------------------------------------------------
     LEAD MANAGEMENT
     -------------------------------------------------------------------------- */
  async createLead(orgId: string, dto: CreateLeadDto) {
    return this.prisma.runInSystemContext(async (tx) => {
      // Deterministic lead scoring rule
      // Score increases if email (+20), phone (+30), company (+20), assigned (+10)
      return tx.lead.create({
        data: {
          organizationId: orgId,
          contactName: dto.contactName,
          companyName: dto.companyName,
          email: dto.email,
          phone: dto.phone,
          source: dto.source || 'Website',
          status: dto.status || LeadStatus.NEW,
          assignedTo: dto.assignedTo,
        },
        include: { assignee: { select: { id: true, fullName: true, email: true } } },
      });
    });
  }

  async getLeads(orgId: string, query?: { search?: string; status?: LeadStatus; page?: number; limit?: number }) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? query.limit : 50;
    const skip = (page - 1) * limit;

    return this.prisma.runInSystemContext(async (tx) => {
      const where: Prisma.LeadWhereInput = {
        organizationId: orgId,
      };

      if (query?.status) {
        where.status = query.status;
      }

      if (query?.search) {
        const s = query.search.trim();
        where.OR = [
          { contactName: { contains: s, mode: 'insensitive' } },
          { companyName: { contains: s, mode: 'insensitive' } },
          { phone: { contains: s } },
          { email: { contains: s, mode: 'insensitive' } },
        ];
      }

      const [items, total] = await Promise.all([
        tx.lead.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            assignee: { select: { id: true, fullName: true, email: true } },
            convertedCustomer: { select: { id: true, name: true, customerCode: true } },
          },
        }),
        tx.lead.count({ where }),
      ]);

      return {
        items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  async getLeadById(orgId: string, id: string) {
    const lead = await this.prisma.runInSystemContext(async (tx) => {
      return tx.lead.findFirst({
        where: { id, organizationId: orgId },
        include: {
          assignee: { select: { id: true, fullName: true, email: true } },
          convertedCustomer: true,
          convertedContact: true,
        },
      });
    });

    if (!lead) {
      throw new NotFoundException(`Lead với ID ${id} không tồn tại.`);
    }
    return lead;
  }

  async updateLead(orgId: string, id: string, dto: UpdateLeadDto) {
    await this.getLeadById(orgId, id);
    return this.prisma.runInSystemContext(async (tx) => {
      return tx.lead.update({
        where: { id },
        data: {
          ...dto,
        },
        include: { assignee: { select: { id: true, fullName: true, email: true } } },
      });
    });
  }

  async deleteLead(orgId: string, id: string) {
    const lead = await this.getLeadById(orgId, id);
    if (lead.status === LeadStatus.CONVERTED) {
      throw new BadRequestException('Không thể xóa Lead đã được chuyển đổi thành công!');
    }
    return this.prisma.runInSystemContext(async (tx) => {
      return tx.lead.delete({ where: { id } });
    });
  }

  /* --------------------------------------------------------------------------
     ATOMIC 1-TRANSACTION LEAD CONVERSION (SECTION 3.D SPEC)
     Lead -> Customer + Contact + Deal
     -------------------------------------------------------------------------- */
  async convertLead(orgId: string, leadId: string, dto: ConvertLeadDto, userId?: string) {
    return this.prisma.runInSystemContext(async (tx) => {
      // 1. Pessimistic lock row on Lead header to prevent race condition & duplicate conversion
      const [lockedLead] = await tx.$queryRaw<
        Array<{
          id: string;
          status: LeadStatus;
          organization_id: string;
          contact_name: string;
          company_name: string | null;
          email: string | null;
          phone: string | null;
          assigned_to: string | null;
        }>
      >(
        Prisma.sql`SELECT id, status, organization_id, contact_name, company_name, email, phone, assigned_to 
                   FROM leads 
                   WHERE id = ${leadId}::uuid AND organization_id = ${orgId}::uuid 
                   FOR UPDATE`,
      );

      if (!lockedLead) {
        throw new NotFoundException(`Lead với ID ${leadId} không tồn tại.`);
      }

      if (lockedLead.status === LeadStatus.CONVERTED) {
        throw new BadRequestException('Lead này đã được chuyển đổi trước đó!');
      }

      // 2. Prepare pipeline & stage
      let pipelineId = dto.pipelineId;
      let stageId = dto.stageId;

      if (!pipelineId || !stageId) {
        let pipeline = await tx.pipeline.findFirst({
          where: { organizationId: orgId, isDefault: true },
          include: { stages: { orderBy: { position: 'asc' } } },
        });

        if (!pipeline || pipeline.stages.length === 0) {
          pipeline = await tx.pipeline.create({
            data: {
              organizationId: orgId,
              code: 'DEFAULT',
              name: 'Quy trình bán hàng Chuẩn',
              isDefault: true,
              stages: {
                create: [
                  { organizationId: orgId, code: 'PROSPECTING', name: 'Mới tạo', position: 0, probability: 10 },
                  { organizationId: orgId, code: 'CONTACTED', name: 'Đã liên hệ', position: 1, probability: 25 },
                  { organizationId: orgId, code: 'QUALIFIED', name: 'Xác định nhu cầu', position: 2, probability: 50 },
                  { organizationId: orgId, code: 'PROPOSAL', name: 'Gửi báo giá', position: 3, probability: 75 },
                  { organizationId: orgId, code: 'NEGOTIATION', name: 'Đang đàm phán', position: 4, probability: 90 },
                  { organizationId: orgId, code: 'WON', name: 'Chốt thành công', position: 5, probability: 100, isWon: true },
                  { organizationId: orgId, code: 'LOST', name: 'Thất bại', position: 6, probability: 0, isLost: true },
                ],
              },
            },
            include: { stages: { orderBy: { position: 'asc' } } },
          });
        }

        pipelineId = pipeline.id;
        stageId = pipeline.stages[0].id;
      }

      // 3. Create Customer
      const customerCode = `KH-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const customer = await tx.customer.create({
        data: {
          organizationId: orgId,
          customerCode,
          name: lockedLead.company_name || lockedLead.contact_name,
          customerType: lockedLead.company_name ? CustomerType.BUSINESS : CustomerType.INDIVIDUAL,
          email: lockedLead.email,
          phone: lockedLead.phone,
          status: CommonStatus.ACTIVE,
        },
      });

      // 4. Create Contact
      const names = lockedLead.contact_name.trim().split(' ');
      const lastName = names.pop() || lockedLead.contact_name;
      const firstName = names.join(' ') || lastName;

      const contact = await tx.contact.create({
        data: {
          organizationId: orgId,
          firstName,
          lastName,
          email: lockedLead.email,
          phone: lockedLead.phone,
          jobTitle: 'Người đại diện',
          status: CommonStatus.ACTIVE,
        },
      });

      // 5. Create Deal
      const dealTitle = dto.dealTitle || `Cơ hội: ${customer.name}`;
      const deal = await tx.deal.create({
        data: {
          organizationId: orgId,
          pipelineId,
          stageId,
          customerId: customer.id,
          contactId: contact.id,
          leadId: lockedLead.id,
          title: dealTitle,
          amount: new Prisma.Decimal(dto.dealAmount || 0),
          currency: 'VND',
          expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : null,
          assignedTo: lockedLead.assigned_to,
          status: DealStatus.OPEN,
        },
      });

      // 6. Record Initial Deal Stage History
      await tx.dealStageHistory.create({
        data: {
          dealId: deal.id,
          fromStageId: null,
          toStageId: stageId,
          changedBy: userId || lockedLead.assigned_to,
        },
      });

      // 7. Update Lead as CONVERTED
      const updatedLead = await tx.lead.update({
        where: { id: lockedLead.id },
        data: {
          status: LeadStatus.CONVERTED,
          convertedCustomerId: customer.id,
          convertedContactId: contact.id,
          convertedAt: new Date(),
        },
      });

      return {
        customer,
        contact,
        deal,
        lead: updatedLead,
      };
    });
  }

  /* --------------------------------------------------------------------------
     CUSTOMER MANAGEMENT
     -------------------------------------------------------------------------- */
  async createCustomer(orgId: string, dto: CreateCustomerDto) {
    const code = dto.customerCode || `KH-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.runInSystemContext(async (tx) => {
      // Check duplicate code
      const existing = await tx.customer.findFirst({
        where: { organizationId: orgId, customerCode: code },
      });
      if (existing) {
        throw new ConflictException(`Mã khách hàng ${code} đã tồn tại trong tổ chức.`);
      }

      return tx.customer.create({
        data: {
          organizationId: orgId,
          customerCode: code,
          name: dto.name,
          customerType: dto.customerType || CustomerType.BUSINESS,
          email: dto.email,
          phone: dto.phone,
          taxCode: dto.taxCode,
          address: dto.address,
          status: dto.status || CommonStatus.ACTIVE,
        },
      });
    });
  }

  async getCustomers(
    orgId: string,
    query?: { search?: string; type?: CustomerType; status?: CommonStatus; page?: number; limit?: number },
  ) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? query.limit : 50;
    const skip = (page - 1) * limit;

    return this.prisma.runInSystemContext(async (tx) => {
      const where: Prisma.CustomerWhereInput = {
        organizationId: orgId,
      };

      if (query?.type) where.customerType = query.type;
      if (query?.status) where.status = query.status;

      if (query?.search) {
        const s = query.search.trim();
        where.OR = [
          { name: { contains: s, mode: 'insensitive' } },
          { customerCode: { contains: s, mode: 'insensitive' } },
          { phone: { contains: s } },
          { taxCode: { contains: s } },
        ];
      }

      const [items, total] = await Promise.all([
        tx.customer.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { deals: true } },
          },
        }),
        tx.customer.count({ where }),
      ]);

      return {
        items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  async getCustomerById(orgId: string, id: string) {
    const customer = await this.prisma.runInSystemContext(async (tx) => {
      return tx.customer.findFirst({
        where: { id, organizationId: orgId },
        include: {
          deals: { orderBy: { createdAt: 'desc' }, include: { stage: true } },
        },
      });
    });

    if (!customer) {
      throw new NotFoundException(`Khách hàng với ID ${id} không tồn tại.`);
    }
    return customer;
  }

  async updateCustomer(orgId: string, id: string, dto: UpdateCustomerDto) {
    await this.getCustomerById(orgId, id);
    return this.prisma.runInSystemContext(async (tx) => {
      return tx.customer.update({
        where: { id },
        data: {
          ...dto,
        },
      });
    });
  }

  async deleteCustomer(orgId: string, id: string) {
    const customer = await this.getCustomerById(orgId, id);
    // Soft-deactivate if customer has deals
    if (customer.deals && customer.deals.length > 0) {
      return this.prisma.runInSystemContext(async (tx) => {
        return tx.customer.update({
          where: { id },
          data: { status: CommonStatus.INACTIVE },
        });
      });
    }

    return this.prisma.runInSystemContext(async (tx) => {
      return tx.customer.delete({ where: { id } });
    });
  }

  /* --------------------------------------------------------------------------
     CONTACT MANAGEMENT
     -------------------------------------------------------------------------- */
  async createContact(orgId: string, dto: CreateContactDto) {
    return this.prisma.runInSystemContext(async (tx) => {
      return tx.contact.create({
        data: {
          organizationId: orgId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          companyId: dto.companyId,
          email: dto.email,
          phone: dto.phone,
          jobTitle: dto.jobTitle,
          notes: dto.notes,
          status: CommonStatus.ACTIVE,
        },
      });
    });
  }

  async getContacts(orgId: string, query?: { search?: string; page?: number; limit?: number }) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? query.limit : 50;
    const skip = (page - 1) * limit;

    return this.prisma.runInSystemContext(async (tx) => {
      const where: Prisma.ContactWhereInput = { organizationId: orgId };
      if (query?.search) {
        const s = query.search.trim();
        where.OR = [
          { firstName: { contains: s, mode: 'insensitive' } },
          { lastName: { contains: s, mode: 'insensitive' } },
          { email: { contains: s, mode: 'insensitive' } },
          { phone: { contains: s } },
        ];
      }

      const [items, total] = await Promise.all([
        tx.contact.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        tx.contact.count({ where }),
      ]);

      return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    });
  }

  async getContactById(orgId: string, id: string) {
    const contact = await this.prisma.runInSystemContext(async (tx) => {
      return tx.contact.findFirst({ where: { id, organizationId: orgId } });
    });
    if (!contact) throw new NotFoundException(`Người liên hệ với ID ${id} không tồn tại.`);
    return contact;
  }

  async updateContact(orgId: string, id: string, dto: UpdateContactDto) {
    await this.getContactById(orgId, id);
    return this.prisma.runInSystemContext(async (tx) => {
      return tx.contact.update({ where: { id }, data: { ...dto } });
    });
  }

  async deleteContact(orgId: string, id: string) {
    await this.getContactById(orgId, id);
    return this.prisma.runInSystemContext(async (tx) => {
      return tx.contact.delete({ where: { id } });
    });
  }

  /* --------------------------------------------------------------------------
     DEAL MANAGEMENT & STAGE MACHINE
     -------------------------------------------------------------------------- */
  async createDeal(orgId: string, dto: CreateDealDto, userId?: string) {
    return this.prisma.runInSystemContext(async (tx) => {
      let pipelineId = dto.pipelineId;
      let stageId = dto.stageId;

      if (!pipelineId || !stageId) {
        const pipeline = await this.getOrCreateDefaultPipeline(orgId);
        pipelineId = pipeline.id;
        stageId = pipeline.stages[0].id;
      }

      const deal = await tx.deal.create({
        data: {
          organizationId: orgId,
          pipelineId,
          stageId,
          customerId: dto.customerId,
          contactId: dto.contactId,
          leadId: dto.leadId,
          title: dto.title,
          amount: new Prisma.Decimal(dto.amount || 0),
          currency: dto.currency || 'VND',
          expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : null,
          assignedTo: dto.assignedTo || userId,
          status: dto.status || DealStatus.OPEN,
        },
        include: {
          customer: true,
          stage: true,
          assignee: { select: { id: true, fullName: true } },
        },
      });

      // Record stage history
      await tx.dealStageHistory.create({
        data: {
          dealId: deal.id,
          fromStageId: null,
          toStageId: stageId,
          changedBy: userId || dto.assignedTo,
        },
      });

      return deal;
    });
  }

  async getDeals(orgId: string, query?: { stageId?: string; status?: DealStatus; search?: string }) {
    return this.prisma.runInSystemContext(async (tx) => {
      const where: Prisma.DealWhereInput = { organizationId: orgId };
      if (query?.stageId) where.stageId = query.stageId;
      if (query?.status) where.status = query.status;
      if (query?.search) {
        where.title = { contains: query.search.trim(), mode: 'insensitive' };
      }

      return tx.deal.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          stage: true,
          assignee: { select: { id: true, fullName: true, email: true } },
        },
      });
    });
  }

  async getDealById(orgId: string, id: string) {
    const deal = await this.prisma.runInSystemContext(async (tx) => {
      return tx.deal.findFirst({
        where: { id, organizationId: orgId },
        include: {
          customer: true,
          contact: true,
          lead: true,
          stage: true,
          pipeline: { include: { stages: { orderBy: { position: 'asc' } } } },
          assignee: { select: { id: true, fullName: true, email: true } },
          stageHistories: {
            orderBy: { changedAt: 'desc' },
            include: {
              fromStage: true,
              toStage: true,
              changer: { select: { id: true, fullName: true } },
            },
          },
        },
      });
    });

    if (!deal) throw new NotFoundException(`Cơ hội kinh doanh với ID ${id} không tồn tại.`);
    return deal;
  }

  async updateDeal(orgId: string, id: string, dto: UpdateDealDto) {
    await this.getDealById(orgId, id);
    return this.prisma.runInSystemContext(async (tx) => {
      const data: Prisma.DealUpdateInput = {
        title: dto.title,
        currency: dto.currency,
        lostReason: dto.lostReason,
        status: dto.status,
      };

      if (dto.amount !== undefined) {
        data.amount = new Prisma.Decimal(dto.amount);
      }
      if (dto.expectedCloseDate) {
        data.expectedCloseDate = new Date(dto.expectedCloseDate);
      }
      if (dto.assignedTo) {
        data.assignee = { connect: { id: dto.assignedTo } };
      }

      return tx.deal.update({
        where: { id },
        data,
        include: { customer: true, stage: true },
      });
    });
  }

  async updateDealStage(orgId: string, id: string, dto: UpdateDealStageDto, userId?: string) {
    return this.prisma.runInSystemContext(async (tx) => {
      const deal = await tx.deal.findFirst({
        where: { id, organizationId: orgId },
      });
      if (!deal) throw new NotFoundException(`Deal với ID ${id} không tồn tại.`);

      const targetStage = await tx.pipelineStage.findFirst({
        where: { id: dto.stageId, pipelineId: deal.pipelineId },
      });
      if (!targetStage) throw new BadRequestException(`Giai đoạn với ID ${dto.stageId} không thuộc pipeline của deal này.`);

      let newStatus: DealStatus = DealStatus.OPEN;
      let lostReason = deal.lostReason;

      if (targetStage.isWon) {
        newStatus = DealStatus.WON;
      } else if (targetStage.isLost) {
        newStatus = DealStatus.LOST;
        lostReason = dto.lostReason || 'Chưa cung cấp lý do';
      }

      const updatedDeal = await tx.deal.update({
        where: { id },
        data: {
          stageId: targetStage.id,
          status: newStatus,
          lostReason,
        },
        include: { customer: true, stage: true },
      });

      // Record stage transition history
      await tx.dealStageHistory.create({
        data: {
          dealId: deal.id,
          fromStageId: deal.stageId,
          toStageId: targetStage.id,
          changedBy: userId,
        },
      });

      return updatedDeal;
    });
  }

  /* --------------------------------------------------------------------------
     ACTIVITIES MANAGEMENT
     -------------------------------------------------------------------------- */
  async createActivity(orgId: string, dto: CreateActivityDto, userId?: string) {
    return this.prisma.runInSystemContext(async (tx) => {
      return tx.activity.create({
        data: {
          organizationId: orgId,
          type: dto.type,
          subject: dto.subject,
          description: dto.description,
          dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
          ownerUserId: dto.ownerUserId || userId,
          relatedEntityType: dto.relatedEntityType.toUpperCase(),
          relatedEntityId: dto.relatedEntityId,
          status: dto.status || ActivityStatus.PENDING,
        },
        include: { owner: { select: { id: true, fullName: true, email: true } } },
      });
    });
  }

  async getActivities(orgId: string, query?: { entityType?: string; entityId?: string; status?: ActivityStatus }) {
    return this.prisma.runInSystemContext(async (tx) => {
      const where: Prisma.ActivityWhereInput = { organizationId: orgId };
      if (query?.entityType) where.relatedEntityType = query.entityType.toUpperCase();
      if (query?.entityId) where.relatedEntityId = query.entityId;
      if (query?.status) where.status = query.status;

      return tx.activity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { owner: { select: { id: true, fullName: true } } },
      });
    });
  }

  async updateActivity(orgId: string, id: string, dto: UpdateActivityDto) {
    return this.prisma.runInSystemContext(async (tx) => {
      const act = await tx.activity.findFirst({ where: { id, organizationId: orgId } });
      if (!act) throw new NotFoundException(`Hoạt động với ID ${id} không tồn tại.`);

      const data: Prisma.ActivityUpdateInput = {
        type: dto.type,
        subject: dto.subject,
        description: dto.description,
        status: dto.status,
      };
      if (dto.dueAt) data.dueAt = new Date(dto.dueAt);
      if (dto.completedAt) data.completedAt = new Date(dto.completedAt);
      if (dto.status === ActivityStatus.COMPLETED && !dto.completedAt) {
        data.completedAt = new Date();
      }

      return tx.activity.update({ where: { id }, data });
    });
  }

  /* --------------------------------------------------------------------------
     CRM DASHBOARD METRICS (DATABASE-DERIVED REAL METRICS)
     -------------------------------------------------------------------------- */
  async getCrmDashboardMetrics(orgId: string) {
    return this.prisma.runInSystemContext(async (tx) => {
      const [
        totalLeads,
        newLeads,
        qualifiedLeads,
        convertedLeads,
        totalCustomers,
        businessCustomers,
        individualCustomers,
        totalDeals,
        openDeals,
        wonDeals,
        lostDeals,
        activeActivities,
      ] = await Promise.all([
        tx.lead.count({ where: { organizationId: orgId } }),
        tx.lead.count({ where: { organizationId: orgId, status: LeadStatus.NEW } }),
        tx.lead.count({ where: { organizationId: orgId, status: LeadStatus.QUALIFIED } }),
        tx.lead.count({ where: { organizationId: orgId, status: LeadStatus.CONVERTED } }),
        tx.customer.count({ where: { organizationId: orgId, status: CommonStatus.ACTIVE } }),
        tx.customer.count({ where: { organizationId: orgId, customerType: CustomerType.BUSINESS } }),
        tx.customer.count({ where: { organizationId: orgId, customerType: CustomerType.INDIVIDUAL } }),
        tx.deal.count({ where: { organizationId: orgId } }),
        tx.deal.count({ where: { organizationId: orgId, status: DealStatus.OPEN } }),
        tx.deal.count({ where: { organizationId: orgId, status: DealStatus.WON } }),
        tx.deal.count({ where: { organizationId: orgId, status: DealStatus.LOST } }),
        tx.activity.count({ where: { organizationId: orgId, status: ActivityStatus.PENDING } }),
      ]);

      // Calculate pipeline value for OPEN deals
      const pipelineAgg = await tx.deal.aggregate({
        where: { organizationId: orgId, status: DealStatus.OPEN },
        _sum: { amount: true },
      });
      const pipelineValue = pipelineAgg._sum.amount ? Number(pipelineAgg._sum.amount) : 0;

      // Calculate won deals total revenue
      const wonAgg = await tx.deal.aggregate({
        where: { organizationId: orgId, status: DealStatus.WON },
        _sum: { amount: true },
      });
      const wonValue = wonAgg._sum.amount ? Number(wonAgg._sum.amount) : 0;

      const conversionRate = totalLeads > 0 ? Number(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0;

      return {
        leads: {
          total: totalLeads,
          new: newLeads,
          qualified: qualifiedLeads,
          converted: convertedLeads,
          conversionRate,
        },
        customers: {
          total: totalCustomers,
          business: businessCustomers,
          individual: individualCustomers,
        },
        deals: {
          total: totalDeals,
          open: openDeals,
          won: wonDeals,
          lost: lostDeals,
          pipelineValue,
          wonValue,
        },
        activities: {
          pending: activeActivities,
        },
      };
    });
  }
}
