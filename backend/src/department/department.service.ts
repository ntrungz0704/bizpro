import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentService implements OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    await this.seedDefaultDepartments();
  }

  async seedDefaultDepartments() {
    const defaultOrg = await this.prisma.runInSystemContext(async (tx) => {
      return tx.organization.findFirst({ where: { code: 'BIZPRO-CORP' } });
    });
    if (!defaultOrg) return;

    await this.prisma.runInTenantContext(defaultOrg.id, async (tx) => {
      const departments = [
        { code: 'BOD', name: 'Ban Giám đốc', description: 'Điều hành tổng thể doanh nghiệp' },
        { code: 'TECH', name: 'Khối Công nghệ & Sản phẩm', description: 'Nghiên cứu & phát triển phần mềm' },
        { code: 'SALES', name: 'Khối Kinh doanh & Tiếp thị', description: 'Phát triển thị trường và kinh doanh' },
        { code: 'OPERATIONS', name: 'Khối Vận hành & Kho vận', description: 'Quản lý chuỗi cung ứng và kho bãi' },
        { code: 'HRM', name: 'Phòng Hành chính - Nhân sự', description: 'Quản lý nhân lực và tuyển dụng' },
      ];

      for (const d of departments) {
        const existing = await tx.department.findFirst({
          where: { organizationId: defaultOrg.id, code: d.code },
        });
        if (!existing) {
          await tx.department.create({
            data: {
              organizationId: defaultOrg.id,
              name: d.name,
              code: d.code,
              status: 'ACTIVE',
            },
          });
        }
      }
    });
  }

  async getDepartments(orgId?: string) {
    let targetOrgId = orgId;
    if (!targetOrgId) {
      const defaultOrg = await this.prisma.runInSystemContext((tx) =>
        tx.organization.findFirst({ where: { code: 'BIZPRO-CORP' } }),
      );
      targetOrgId = defaultOrg?.id;
    }
    if (!targetOrgId) return [];

    return this.prisma.runInTenantContext(targetOrgId, async (tx) => {
      return tx.department.findMany({
        where: { organizationId: targetOrgId },
        include: {
          subDepartments: true,
          _count: {
            select: { employees: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    });
  }

  async createDepartment(orgId: string | undefined, dto: CreateDepartmentDto) {
    let targetOrgId = orgId;
    if (!targetOrgId) {
      const defaultOrg = await this.prisma.runInSystemContext((tx) =>
        tx.organization.findFirst({ where: { code: 'BIZPRO-CORP' } }),
      );
      targetOrgId = defaultOrg?.id;
    }
    if (!targetOrgId) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.runInTenantContext(targetOrgId, async (tx) => {
      const existing = await tx.department.findFirst({
        where: { organizationId: targetOrgId, code: dto.code },
      });
      if (existing) {
        throw new BadRequestException(`Phòng ban với mã ${dto.code} đã tồn tại trong tổ chức`);
      }

      return tx.department.create({
        data: {
          organizationId: targetOrgId,
          name: dto.name,
          code: dto.code.toUpperCase(),
          parentDepartmentId: dto.parentDepartmentId || null,
          managerEmployeeId: dto.managerEmployeeId || null,
          status: 'ACTIVE',
        },
      });
    });
  }

  async updateDepartment(orgId: string | undefined, id: string, dto: UpdateDepartmentDto) {
    let targetOrgId = orgId;
    if (!targetOrgId) {
      const defaultOrg = await this.prisma.runInSystemContext((tx) =>
        tx.organization.findFirst({ where: { code: 'BIZPRO-CORP' } }),
      );
      targetOrgId = defaultOrg?.id;
    }
    if (!targetOrgId) throw new NotFoundException('Organization not found');

    return this.prisma.runInTenantContext(targetOrgId, async (tx) => {
      const dept = await tx.department.findUnique({ where: { id } });
      if (!dept) throw new NotFoundException('Không tìm thấy phòng ban');

      return tx.department.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.code && { code: dto.code.toUpperCase() }),
          ...(dto.parentDepartmentId !== undefined && { parentDepartmentId: dto.parentDepartmentId || null }),
          ...(dto.status && { status: dto.status }),
        },
      });
    });
  }

  async deleteDepartment(id: string) {
    const deptOrg = await this.prisma.runInSystemContext(async (tx) => {
      const d = await tx.department.findUnique({ where: { id }, select: { organizationId: true } });
      return d?.organizationId;
    });
    if (!deptOrg) throw new NotFoundException('Không tìm thấy phòng ban');

    return this.prisma.runInTenantContext(deptOrg, async (tx) => {
      return tx.department.delete({ where: { id } });
    });
  }
}
