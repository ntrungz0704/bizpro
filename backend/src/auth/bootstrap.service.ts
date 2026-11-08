import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from './crypto.service';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  async onApplicationBootstrap() {
    await this.bootstrapCoreData();
  }

  async bootstrapCoreData() {
    this.logger.log('Checking core security & authentication seed data...');
    const defaultOrgId = 'c478491c-76e9-4e0a-9d9e-108b3e811100';

    await this.prisma.runInSystemContext(async (tx) => {
      // 1. Ensure Default Organization exists
      let org = await tx.organization.findFirst({
        where: {
          OR: [{ id: defaultOrgId }, { code: 'BIZPRO-CORP' }],
        },
      });

      if (!org) {
        org = await tx.organization.create({
          data: {
            id: defaultOrgId,
            name: 'Công ty Cổ phần Giải pháp Doanh nghiệp BizPro+',
            code: 'BIZPRO-CORP',
            taxCode: '0109988776',
            email: 'contact@bizpro.vn',
            phone: '024 3999 8888',
            address: 'Tòa nhà Keangnam Landmark 72, Phạm Hùng, Cầu Giấy, Hà Nội',
            currency: 'VND',
            timezone: 'Asia/Ho_Chi_Minh',
            status: 'ACTIVE',
          },
        });
        this.logger.log(`Created default Organization: ${org.name} (${org.code})`);
      } else {
        this.logger.log(`Default Organization confirmed: ${org.name} (${org.id})`);
      }

      // 2. Ensure Core Permissions exist
      const defaultPermissions = [
        { code: 'auth.users.read', module: 'AUTH', action: 'READ', description: 'Xem danh sách người dùng' },
        { code: 'auth.users.write', module: 'AUTH', action: 'WRITE', description: 'Tạo hoặc sửa người dùng' },
        { code: 'auth.users.delete', module: 'AUTH', action: 'DELETE', description: 'Xóa hoặc vô hiệu hóa người dùng' },
        { code: 'crm.customers.read', module: 'CRM', action: 'READ', description: 'Xem danh sách khách hàng' },
        { code: 'crm.customers.write', module: 'CRM', action: 'WRITE', description: 'Quản lý thông tin khách hàng' },
        { code: 'sales.orders.read', module: 'SALES', action: 'READ', description: 'Xem đơn bán hàng' },
        { code: 'sales.orders.write', module: 'SALES', action: 'WRITE', description: 'Tạo và cập nhật đơn hàng' },
        { code: 'sales.orders.confirm', module: 'SALES', action: 'CONFIRM', description: 'Duyệt và xác nhận đơn hàng' },
        { code: 'sales.orders.cancel', module: 'SALES', action: 'CANCEL', description: 'Hủy đơn bán hàng' },
        { code: 'sales.fulfillment.manage', module: 'SALES', action: 'MANAGE', description: 'Quản lý giao vận và xuất kho đơn hàng' },
        { code: 'inventory.products.read', module: 'INVENTORY', action: 'READ', description: 'Xem danh mục sản phẩm' },
        { code: 'inventory.products.write', module: 'INVENTORY', action: 'WRITE', description: 'Quản lý sản phẩm và kho' },
        { code: 'settings.manage', module: 'SETTINGS', action: 'MANAGE', description: 'Cấu hình và quản trị hệ thống' },
      ];

      for (const perm of defaultPermissions) {
        await tx.permission.upsert({
          where: { code: perm.code },
          update: { description: perm.description },
          create: perm,
        });
      }

      // 3. Ensure Default Roles for Organization exist
      let adminRole = await tx.role.findFirst({
        where: { organizationId: org.id, code: 'ADMIN' },
      });

      if (!adminRole) {
        adminRole = await tx.role.create({
          data: {
            organizationId: org.id,
            name: 'Quản trị viên hệ thống',
            code: 'ADMIN',
            description: 'Toàn quyền quản trị tổ chức và phân quyền',
            isSystem: true,
          },
        });
        this.logger.log(`Created ADMIN role for Org ${org.code}`);
      }

      let userRole = await tx.role.findFirst({
        where: { organizationId: org.id, code: 'USER' },
      });

      if (!userRole) {
        userRole = await tx.role.create({
          data: {
            organizationId: org.id,
            name: 'Nhân viên',
            code: 'USER',
            description: 'Quyền tác nghiệp tiêu chuẩn',
            isSystem: false,
          },
        });
        this.logger.log(`Created USER role for Org ${org.code}`);
      }

      // Bind permissions to Admin Role
      const allPerms = await tx.permission.findMany();
      for (const p of allPerms) {
        await tx.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: adminRole.id,
              permissionId: p.id,
            },
          },
          update: {},
          create: {
            roleId: adminRole.id,
            permissionId: p.id,
          },
        });
      }

      // 4. Ensure Default Admin User exists (Dev / Staging, or when explicitly configured in production)
      let adminUser = await tx.user.findFirst({
        where: { email: 'admin@bizpro.vn' },
      });

      if (!adminUser) {
        if (process.env.NODE_ENV === 'production' && !process.env.INITIAL_ADMIN_PASSWORD) {
          this.logger.warn(
            'Production security guard: INITIAL_ADMIN_PASSWORD is not set. Skipping automatic admin provisioning.',
          );
        } else {
          const initialPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123456';
          const passwordHash = await this.cryptoService.hashPassword(initialPassword);
          adminUser = await tx.user.create({
            data: {
              id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
              organizationId: org.id,
              email: 'admin@bizpro.vn',
              fullName: 'Nguyễn Văn Admin',
              passwordHash,
              phone: '0988889999',
              status: 'ACTIVE',
              authVersion: 1,
            },
          });

          await tx.userRole.create({
            data: {
              userId: adminUser.id,
              roleId: adminRole.id,
            },
          });
          this.logger.log(`Created default Admin user: ${adminUser.email}`);
        }
      }

      // 5. Ensure Standard User exists for development / testing only
      if (process.env.NODE_ENV !== 'production') {
        let standardUser = await tx.user.findFirst({
          where: { email: 'user@bizpro.vn' },
        });

        if (!standardUser) {
          const passwordHash = await this.cryptoService.hashPassword('User@123456');
          standardUser = await tx.user.create({
            data: {
              organizationId: org.id,
              email: 'user@bizpro.vn',
              fullName: 'Trần Thị Nhân Viên',
              passwordHash,
              phone: '0977778888',
              status: 'ACTIVE',
              authVersion: 1,
            },
          });

          await tx.userRole.create({
            data: {
              userId: standardUser.id,
              roleId: userRole.id,
            },
          });
          this.logger.log(`Created standard user: ${standardUser.email}`);
        }
      }
    });

    this.logger.log('Core security & authentication seed verified.');
  }
}
