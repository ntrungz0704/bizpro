import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/rbac.dto';

@Injectable()
export class RbacService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RbacService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    await this.seedPermissionsAndSystemRoles();
  }

  async seedPermissionsAndSystemRoles() {
    this.logger.log('Seeding Dynamic RBAC system roles & permissions catalog...');

    const permissionsCatalog = [
      // Organization & System
      { code: 'organization.read', module: 'ORGANIZATION', action: 'READ', description: 'Xem thông tin tổ chức' },
      { code: 'organization.update', module: 'ORGANIZATION', action: 'UPDATE', description: 'Cập nhật hồ sơ tổ chức' },
      { code: 'settings.manage', module: 'SETTINGS', action: 'MANAGE', description: 'Quản trị cấu hình hệ thống' },
      { code: 'audit_logs.read', module: 'AUDIT', action: 'READ', description: 'Xem nhật ký kiểm toán bất biến' },
      // User Management
      { code: 'users.read', module: 'USERS', action: 'READ', description: 'Xem danh sách người dùng' },
      { code: 'users.create', module: 'USERS', action: 'CREATE', description: 'Thêm tài khoản người dùng mới' },
      { code: 'users.update', module: 'USERS', action: 'UPDATE', description: 'Chỉnh sửa tài khoản người dùng' },
      { code: 'users.delete', module: 'USERS', action: 'DELETE', description: 'Vô hiệu hóa hoặc xóa người dùng' },
      // RBAC
      { code: 'rbac.roles.read', module: 'RBAC', action: 'READ', description: 'Xem danh sách vai trò phân quyền' },
      { code: 'rbac.roles.manage', module: 'RBAC', action: 'MANAGE', description: 'Tạo, sửa vai trò và ma trận quyền' },
      // Departments
      { code: 'departments.read', module: 'DEPARTMENTS', action: 'READ', description: 'Xem cơ cấu phòng ban' },
      { code: 'departments.manage', module: 'DEPARTMENTS', action: 'MANAGE', description: 'Quản lý cây phòng ban' },
      // CRM
      { code: 'crm.leads.read', module: 'CRM', action: 'READ', description: 'Xem đầu mối tiềm năng (Leads)' },
      { code: 'crm.leads.write', module: 'CRM', action: 'WRITE', description: 'Tạo và cập nhật Leads' },
      { code: 'crm.customers.read', module: 'CRM', action: 'READ', description: 'Xem danh sách khách hàng' },
      { code: 'crm.customers.write', module: 'CRM', action: 'WRITE', description: 'Quản lý thông tin khách hàng' },
      { code: 'crm.deals.read', module: 'CRM', action: 'READ', description: 'Xem cơ hội kinh doanh' },
      { code: 'crm.deals.write', module: 'CRM', action: 'WRITE', description: 'Quản lý phễu bán hàng Deals' },
      // Inventory
      { code: 'inventory.products.read', module: 'INVENTORY', action: 'READ', description: 'Xem danh mục hàng hóa' },
      { code: 'inventory.products.write', module: 'INVENTORY', action: 'WRITE', description: 'Quản lý hàng hóa và đơn vị tính' },
      { code: 'inventory.stock.read', module: 'INVENTORY', action: 'READ', description: 'Xem số dư tồn kho và thẻ kho' },
      { code: 'inventory.stock.manage', module: 'INVENTORY', action: 'MANAGE', description: 'Nhập xuất và điều chuyển kho' },
      // Sales
      { code: 'sales.orders.read', module: 'SALES', action: 'READ', description: 'Xem đơn bán hàng' },
      { code: 'sales.orders.write', module: 'SALES', action: 'WRITE', description: 'Tạo và duyệt đơn hàng' },
      // HRM (Phase 2F Approved Matrix)
      { code: 'hrm.departments.view', module: 'HRM', action: 'READ', description: 'Xem cơ cấu phòng ban' },
      { code: 'hrm.departments.manage', module: 'HRM', action: 'MANAGE', description: 'Quản trị phòng ban' },
      { code: 'hrm.positions.view', module: 'HRM', action: 'READ', description: 'Xem danh mục chức vụ' },
      { code: 'hrm.positions.manage', module: 'HRM', action: 'MANAGE', description: 'Quản trị chức vụ' },
      { code: 'hrm.employees.view', module: 'HRM', action: 'READ', description: 'Xem hồ sơ nhân sự' },
      { code: 'hrm.employees.view_sensitive', module: 'HRM', action: 'READ', description: 'Xem thông tin lương và hợp đồng nhân sự' },
      { code: 'hrm.employees.manage', module: 'HRM', action: 'MANAGE', description: 'Quản trị nhân sự' },
      { code: 'hrm.contracts.manage', module: 'HRM', action: 'MANAGE', description: 'Quản lý hợp đồng lao động' },
      { code: 'hrm.attendance.clock', module: 'HRM', action: 'CREATE', description: 'Tự chấm công Check-in / Check-out' },
      { code: 'hrm.attendance.view_my', module: 'HRM', action: 'READ', description: 'Xem bảng công cá nhân' },
      { code: 'hrm.attendance.view_all', module: 'HRM', action: 'READ', description: 'Xem bảng công toàn tổ chức' },
      { code: 'hrm.attendance.manage', module: 'HRM', action: 'MANAGE', description: 'Điều chỉnh bản ghi chấm công' },
      { code: 'hrm.leave.request', module: 'HRM', action: 'CREATE', description: 'Nộp đơn xin nghỉ phép và xem số dư phép' },
      { code: 'hrm.leave.approve', module: 'HRM', action: 'MANAGE', description: 'Phê duyệt đơn xin nghỉ phép cấp dưới' },
      { code: 'hrm.leave.manage', module: 'HRM', action: 'MANAGE', description: 'Quản trị quỹ và loại ngày phép' },
    ];

    await this.prisma.runInSystemContext(async (tx) => {
      // 1. Upsert Permissions
      for (const p of permissionsCatalog) {
        await tx.permission.upsert({
          where: { code: p.code },
          create: p,
          update: { description: p.description, module: p.module, action: p.action },
        });
      }

      // 2. Ensure default Organization exists
      let defaultOrg = await tx.organization.findFirst({
        where: { code: 'BIZPRO-CORP' },
      });
      if (!defaultOrg) {
        defaultOrg = await tx.organization.create({
          data: {
            name: 'Công ty Cổ phần Giải pháp Doanh nghiệp BizPro+',
            code: 'BIZPRO-CORP',
            taxCode: '0109988776',
            email: 'contact@bizpro.vn',
            phone: '024 3999 8888',
            address: 'Tòa nhà Keangnam Landmark 72, Phạm Hùng, Cầu Giấy, Hà Nội',
            status: 'ACTIVE',
          },
        });
      }

      // 3. System Roles for defaultOrg
      const systemRoles = [
        {
          code: 'SUPER_ADMIN',
          name: 'Quản trị viên Cấp cao',
          description: 'Toàn quyền điều hành toàn bộ hệ sinh thái hệ thống',
          isSystem: true,
        },
        {
          code: 'ORG_ADMIN',
          name: 'Quản trị viên Doanh nghiệp',
          description: 'Toàn quyền cấu hình, quản lý người dùng và master data của tổ chức',
          isSystem: true,
        },
        {
          code: 'MANAGER',
          name: 'Quản lý Bộ phận',
          description: 'Quyền phê duyệt, giám sát nhân viên, đơn hàng và kho phòng ban',
          isSystem: true,
        },
        {
          code: 'STAFF',
          name: 'Nhân viên Nghiệp vụ',
          description: 'Thao tác các nghiệp vụ bán hàng, nhập kho và chăm sóc khách hàng',
          isSystem: true,
        },
        {
          code: 'HR_MANAGER',
          name: 'Quản trị viên Nhân sự',
          description: 'Quản lý toàn bộ nghiệp vụ nhân sự, hợp đồng, chấm công và phép năm',
          isSystem: true,
        },
        {
          code: 'EMPLOYEE',
          name: 'Nhân viên',
          description: 'Tài khoản nhân viên tiêu chuẩn: chấm công, xem lịch sử và nộp đơn nghỉ phép',
          isSystem: true,
        },
      ];

      const allPermissions = await tx.permission.findMany();

      for (const r of systemRoles) {
        let role = await tx.role.findFirst({
          where: { organizationId: defaultOrg.id, code: r.code },
        });

        if (!role) {
          role = await tx.role.create({
            data: {
              organizationId: defaultOrg.id,
              name: r.name,
              code: r.code,
              description: r.description,
              isSystem: r.isSystem,
            },
          });
        }

        // Assign full permissions for ORG_ADMIN & SUPER_ADMIN
        if (r.code === 'ORG_ADMIN' || r.code === 'SUPER_ADMIN') {
          for (const perm of allPermissions) {
            await tx.rolePermission.upsert({
              where: {
                roleId_permissionId: {
                  roleId: role.id,
                  permissionId: perm.id,
                },
              },
              create: {
                roleId: role.id,
                permissionId: perm.id,
                scope: 'ALL',
              },
              update: {},
            });
          }
        } else if (r.code === 'HR_MANAGER') {
          const hrPerms = allPermissions.filter((p) => p.module === 'HRM');
          for (const perm of hrPerms) {
            await tx.rolePermission.upsert({
              where: {
                roleId_permissionId: {
                  roleId: role.id,
                  permissionId: perm.id,
                },
              },
              create: {
                roleId: role.id,
                permissionId: perm.id,
                scope: 'ALL',
              },
              update: {},
            });
          }
        } else if (r.code === 'EMPLOYEE') {
          const empPermCodes = [
            'hrm.departments.view',
            'hrm.positions.view',
            'hrm.employees.view',
            'hrm.attendance.clock',
            'hrm.attendance.view_my',
            'hrm.leave.request',
          ];
          const empPerms = allPermissions.filter((p) => empPermCodes.includes(p.code));
          for (const perm of empPerms) {
            await tx.rolePermission.upsert({
              where: {
                roleId_permissionId: {
                  roleId: role.id,
                  permissionId: perm.id,
                },
              },
              create: {
                roleId: role.id,
                permissionId: perm.id,
                scope: 'ALL',
              },
              update: {},
            });
          }
        } else if (r.code === 'MANAGER') {
          const mgrPermCodes = [
            'hrm.departments.view',
            'hrm.positions.view',
            'hrm.employees.view',
            'hrm.attendance.clock',
            'hrm.attendance.view_my',
            'hrm.attendance.view_all',
            'hrm.leave.request',
            'hrm.leave.approve',
          ];
          const mgrPerms = allPermissions.filter((p) => mgrPermCodes.includes(p.code));
          for (const perm of mgrPerms) {
            await tx.rolePermission.upsert({
              where: {
                roleId_permissionId: {
                  roleId: role.id,
                  permissionId: perm.id,
                },
              },
              create: {
                roleId: role.id,
                permissionId: perm.id,
                scope: 'ALL',
              },
              update: {},
            });
          }
        }
      }
    });

    this.logger.log('Dynamic RBAC seeding completed successfully.');
  }

  async getRoles(orgId?: string) {
    if (!orgId) throw new BadRequestException('Yêu cầu định danh tổ chức hợp lệ');
    return this.prisma.runInSystemContext(async (tx) => {
      return tx.role.findMany({
        where: { organizationId: orgId },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: { userRoles: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    });
  }

  async createRole(orgId: string | undefined, dto: CreateRoleDto) {
    if (!orgId) throw new BadRequestException('Yêu cầu định danh tổ chức hợp lệ');
    return this.prisma.runInSystemContext(async (tx) => {
      const existing = await tx.role.findFirst({
        where: { organizationId: orgId, code: dto.code },
      });
      if (existing) {
        throw new BadRequestException(`Role with code ${dto.code} already exists in this organization`);
      }

      return tx.role.create({
        data: {
          organizationId: orgId,
          name: dto.name,
          code: dto.code.toUpperCase(),
          description: dto.description,
          isSystem: false,
        },
      });
    });
  }

  async updateRole(orgId: string | undefined, roleId: string, dto: UpdateRoleDto) {
    if (!orgId) throw new BadRequestException('Yêu cầu định danh tổ chức hợp lệ');
    return this.prisma.runInSystemContext(async (tx) => {
      const role = await tx.role.findFirst({ where: { id: roleId, organizationId: orgId } });
      if (!role) throw new NotFoundException('Không tìm thấy vai trò trong tổ chức');

      return tx.role.update({
        where: { id: roleId },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
        },
      });
    });
  }

  async getPermissions() {
    return this.prisma.runInSystemContext(async (tx) => {
      return tx.permission.findMany({
        orderBy: [{ module: 'asc' }, { code: 'asc' }],
      });
    });
  }

  async updateRolePermissions(orgId: string | undefined, roleId: string, permissionIds: string[]) {
    if (!orgId) throw new BadRequestException('Yêu cầu định danh tổ chức hợp lệ');
    return this.prisma.runInSystemContext(async (tx) => {
      const role = await tx.role.findFirst({ where: { id: roleId, organizationId: orgId } });
      if (!role) throw new NotFoundException('Không tìm thấy vai trò trong tổ chức');

      // Clear existing
      await tx.rolePermission.deleteMany({ where: { roleId } });

      // Add new
      if (permissionIds && permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((pid) => ({
            roleId,
            permissionId: pid,
            scope: 'ALL',
          })),
        });
      }

      return tx.role.findUnique({
        where: { id: roleId },
        include: {
          rolePermissions: {
            include: { permission: true },
          },
        },
      });
    });
  }

  async assignUserRoles(orgId: string | undefined, userId: string, roleIds: string[]) {
    if (!orgId) throw new BadRequestException('Yêu cầu định danh tổ chức hợp lệ');
    return this.prisma.runInSystemContext(async (tx) => {
      const user = await tx.user.findFirst({ where: { id: userId, organizationId: orgId } });
      if (!user) throw new NotFoundException('Không tìm thấy người dùng trong tổ chức');

      if (roleIds && roleIds.length > 0) {
        const matchingRolesCount = await tx.role.count({
          where: {
            id: { in: roleIds },
            organizationId: orgId,
          },
        });
        if (matchingRolesCount !== roleIds.length) {
          throw new BadRequestException('Một hoặc nhiều vai trò không thuộc tổ chức của người dùng');
        }
      }

      await tx.userRole.deleteMany({ where: { userId } });

      if (roleIds && roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map((rid) => ({
            userId,
            roleId: rid,
          })),
        });
      }

      return tx.userRole.findMany({
        where: { userId },
        include: { role: true },
      });
    });
  }
}
