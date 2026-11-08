import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

const DEFAULT_ORG_DATA = {
  name: 'Công ty Cổ phần Giải pháp Doanh nghiệp BizPro+',
  code: 'BIZPRO-CORP',
  taxCode: '0109988776',
  currency: 'VND',
  timezone: 'Asia/Ho_Chi_Minh (GMT+7)',
  address: 'Tòa nhà Keangnam Landmark 72, Phạm Hùng, Cầu Giấy, Hà Nội',
  phone: '024 3999 8888',
  email: 'contact@bizpro.vn',
};

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves the current organization record from PostgreSQL.
   */
  async getCurrent(orgId?: string) {
    return this.prisma.runInSystemContext(async (tx) => {
      let org;
      if (orgId) {
        org = await tx.organization.findUnique({
          where: { id: orgId },
        });
      }
      if (!org) {
        org = await tx.organization.findFirst({
          where: { code: 'BIZPRO-CORP' },
        });
      }
      if (!org) {
        // Fallback to first organization in database
        org = await tx.organization.findFirst();
      }

      if (!org) {
        throw new NotFoundException({
          code: 'ORGANIZATION_NOT_FOUND',
          message: 'Không tìm thấy dữ liệu tổ chức trong hệ thống cơ sở dữ liệu.',
        });
      }

      return {
        id: org.id,
        name: org.name,
        code: org.code,
        taxCode: org.taxCode || '',
        currency: (org.currency as 'VND' | 'USD' | 'EUR') || 'VND',
        timezone: org.timezone || 'Asia/Ho_Chi_Minh (GMT+7)',
        address: org.address || '',
        phone: org.phone || '',
        email: org.email || '',
        website: 'https://bizpro.vn',
        status: org.status,
        updatedAt: org.updatedAt,
      };
    });
  }

  /**
   * Updates organization record in PostgreSQL and writes an immutable AuditLog entry.
   */
  async updateCurrent(
    dto: UpdateOrganizationDto,
    orgId?: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.runInSystemContext(async (tx) => {
      let org;
      if (orgId) {
        org = await tx.organization.findUnique({ where: { id: orgId } });
      }
      if (!org) {
        org = await tx.organization.findFirst({ where: { code: 'BIZPRO-CORP' } });
      }
      if (!org) {
        org = await tx.organization.findFirst();
      }

      if (!org) {
        throw new NotFoundException({
          code: 'ORGANIZATION_NOT_FOUND',
          message: 'Không tìm thấy tổ chức để cập nhật.',
        });
      }

      const oldValues = {
        name: org.name,
        code: org.code,
        taxCode: org.taxCode,
        email: org.email,
        phone: org.phone,
        address: org.address,
        currency: org.currency,
        timezone: org.timezone,
      };

      const updated = await tx.organization.update({
        where: { id: org.id },
        data: {
          name: dto.name.trim(),
          code: dto.code.trim().toUpperCase(),
          taxCode: dto.taxCode.trim(),
          email: dto.email.trim().toLowerCase(),
          phone: dto.phone.trim(),
          address: dto.address?.trim() || null,
          currency: dto.currency || 'VND',
          timezone: dto.timezone || 'Asia/Ho_Chi_Minh (GMT+7)',
        },
      });

      // Write Audit Log
      await tx.auditLog.create({
        data: {
          organizationId: org.id,
          userId: userId || null,
          module: 'Settings',
          action: 'UPDATE_ORGANIZATION_PROFILE',
          entityType: 'Organization',
          entityId: org.id,
          oldValues,
          newValues: dto as any,
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'BizPro WebApp',
        },
      });

      return {
        id: updated.id,
        name: updated.name,
        code: updated.code,
        taxCode: updated.taxCode || '',
        currency: (updated.currency as 'VND' | 'USD' | 'EUR') || 'VND',
        timezone: updated.timezone,
        address: updated.address || '',
        phone: updated.phone || '',
        email: updated.email,
        website: dto.website || 'https://bizpro.vn',
        status: updated.status,
        updatedAt: updated.updatedAt,
      };
    });
  }

  /**
   * Resets organization back to default profile and records audit trail.
   */
  async resetCurrent(orgId?: string, userId?: string, ipAddress?: string, userAgent?: string) {
    return this.prisma.runInSystemContext(async (tx) => {
      let org;
      if (orgId) {
        org = await tx.organization.findUnique({ where: { id: orgId } });
      }
      if (!org) {
        org = await tx.organization.findFirst({ where: { code: 'BIZPRO-CORP' } });
      }
      if (!org) {
        org = await tx.organization.findFirst();
      }

      if (!org) {
        throw new NotFoundException({
          code: 'ORGANIZATION_NOT_FOUND',
          message: 'Không tìm thấy tổ chức để khôi phục.',
        });
      }

      const updated = await tx.organization.update({
        where: { id: org.id },
        data: DEFAULT_ORG_DATA,
      });

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          organizationId: org.id,
          userId: userId || null,
          module: 'Settings',
          action: 'RESET_ORGANIZATION_PROFILE',
          entityType: 'Organization',
          entityId: org.id,
          oldValues: { name: org.name, code: org.code },
          newValues: DEFAULT_ORG_DATA,
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'BizPro WebApp',
        },
      });

      return {
        id: updated.id,
        name: updated.name,
        code: updated.code,
        taxCode: updated.taxCode || '',
        currency: (updated.currency as 'VND' | 'USD' | 'EUR') || 'VND',
        timezone: updated.timezone,
        address: updated.address || '',
        phone: updated.phone || '',
        email: updated.email,
        website: 'https://bizpro.vn',
        status: updated.status,
        updatedAt: updated.updatedAt,
      };
    });
  }

  /**
   * Retrieves real Audit Logs for this organization from PostgreSQL.
   */
  async getAuditLogs(orgId?: string, limit = 50) {
    return this.prisma.runInSystemContext(async (tx) => {
      let targetOrgId = orgId;
      if (!targetOrgId) {
        const defaultOrg = await tx.organization.findFirst({ where: { code: 'BIZPRO-CORP' } });
        targetOrgId = defaultOrg?.id;
      }

      if (!targetOrgId) return [];

      const logs = await tx.auditLog.findMany({
        where: { organizationId: targetOrgId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      });

      return logs.map((l) => ({
        id: l.id,
        action: l.action,
        module: l.module,
        entity: l.entityType,
        code: l.entityId,
        user: l.user ? `${l.user.fullName} (${l.user.email})` : 'Hệ thống (System)',
        time: l.createdAt.toISOString().replace('T', ' ').substring(0, 19),
        ip: l.ipAddress || '127.0.0.1',
        details: l.newValues ? JSON.stringify(l.newValues) : undefined,
      }));
    });
  }
}
