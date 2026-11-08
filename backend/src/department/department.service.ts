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
    if (!orgId) throw new BadRequestException('Yêu cầu định danh tổ chức hợp lệ');
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      return tx.department.findMany({
        where: { organizationId: orgId },
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
    if (!orgId) throw new BadRequestException('Yêu cầu định danh tổ chức hợp lệ');
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const existing = await tx.department.findFirst({
        where: { organizationId: orgId, code: dto.code.toUpperCase() },
      });
      if (existing) {
        throw new BadRequestException(`Phòng ban với mã ${dto.code} đã tồn tại trong tổ chức`);
      }

      return tx.department.create({
        data: {
          organizationId: orgId,
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
    if (!orgId) throw new BadRequestException('Yêu cầu định danh tổ chức hợp lệ');
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const dept = await tx.department.findFirst({
        where: { id, organizationId: orgId },
      });
      if (!dept) throw new NotFoundException('Không tìm thấy phòng ban trong tổ chức');

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

  async deleteDepartment(orgId: string | undefined, id: string) {
    if (!orgId) throw new BadRequestException('Yêu cầu định danh tổ chức hợp lệ');
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const dept = await tx.department.findFirst({
        where: { id, organizationId: orgId },
      });
      if (!dept) throw new NotFoundException('Không tìm thấy phòng ban trong tổ chức');

      return tx.department.delete({ where: { id } });
    });
  }
}
