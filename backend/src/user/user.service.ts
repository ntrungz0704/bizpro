import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UpdateUserStatusDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(orgId?: string) {
    return this.prisma.runInSystemContext(async (tx) => {
      const targetOrg = orgId
        ? { id: orgId }
        : await tx.organization.findFirst({ where: { code: 'BIZPRO-CORP' } });
      if (!targetOrg) return [];

      return tx.user.findMany({
        where: { organizationId: targetOrg.id },
        select: {
          id: true,
          organizationId: true,
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async getUserById(id: string) {
    return this.prisma.runInSystemContext(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id },
        select: {
          id: true,
          organizationId: true,
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
      if (!user) throw new NotFoundException('Không tìm thấy người dùng');
      return user;
    });
  }

  async createUser(
    orgId: string | undefined,
    dto: CreateUserDto,
    actorId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.runInSystemContext(async (tx) => {
      let targetOrgId = orgId;
      if (!targetOrgId) {
        const defaultOrg = await tx.organization.findFirst({ where: { code: 'BIZPRO-CORP' } });
        targetOrgId = defaultOrg?.id;
      }
      if (!targetOrgId) throw new NotFoundException('Organization not found');

      const existing = await tx.user.findFirst({
        where: { email: dto.email.toLowerCase() },
      });
      if (existing) {
        throw new BadRequestException('Email này đã được sử dụng');
      }

      const passwordHash = await bcrypt.hash(dto.password, 10);

      const user = await tx.user.create({
        data: {
          organizationId: targetOrgId,
          fullName: dto.fullName,
          email: dto.email.toLowerCase(),
          passwordHash,
          phone: dto.phone || null,
          status: 'ACTIVE',
        },
      });

      // Assign roles
      if (dto.roleIds && dto.roleIds.length > 0) {
        await tx.userRole.createMany({
          data: dto.roleIds.map((rid) => ({
            userId: user.id,
            roleId: rid,
          })),
        });
      } else {
        // Default to STAFF role
        const staffRole = await tx.role.findFirst({
          where: { organizationId: targetOrgId, code: 'STAFF' },
        });
        if (staffRole) {
          await tx.userRole.create({
            data: { userId: user.id, roleId: staffRole.id },
          });
        }
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          organizationId: targetOrgId,
          userId: actorId || null,
          module: 'Users',
          action: 'CREATE_USER',
          entityType: 'User',
          entityId: user.id,
          newValues: {
            fullName: user.fullName,
            email: user.email,
            roles: dto.roleIds || ['STAFF'],
          },
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'BizPro WebApp',
        },
      });

      return tx.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          organizationId: true,
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
    });
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto,
    actorId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.runInSystemContext(async (tx) => {
      const user = await tx.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('Không tìm thấy người dùng');

      const updated = await tx.user.update({
        where: { id },
        data: {
          ...(dto.fullName && { fullName: dto.fullName }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        },
      });

      // Update roles if provided
      if (dto.roleIds !== undefined) {
        await tx.userRole.deleteMany({ where: { userId: id } });
        if (dto.roleIds.length > 0) {
          await tx.userRole.createMany({
            data: dto.roleIds.map((rid) => ({ userId: id, roleId: rid })),
          });
        }
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          organizationId: user.organizationId,
          userId: actorId || null,
          module: 'Users',
          action: 'UPDATE_USER',
          entityType: 'User',
          entityId: user.id,
          oldValues: { fullName: user.fullName, phone: user.phone },
          newValues: { fullName: updated.fullName, phone: updated.phone },
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'BizPro WebApp',
        },
      });

      return tx.user.findUnique({
        where: { id },
        select: {
          id: true,
          organizationId: true,
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
          status: true,
          lastLoginAt: true,
          createdAt: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
    });
  }

  async updateUserStatus(
    id: string,
    dto: UpdateUserStatusDto,
    actorId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.runInSystemContext(async (tx) => {
      const user = await tx.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('Không tìm thấy người dùng');

      const updated = await tx.user.update({
        where: { id },
        data: { status: dto.status },
      });

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          organizationId: user.organizationId,
          userId: actorId || null,
          module: 'Users',
          action: 'CHANGE_USER_STATUS',
          entityType: 'User',
          entityId: user.id,
          oldValues: { status: user.status },
          newValues: { status: updated.status },
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'BizPro WebApp',
        },
      });

      return updated;
    });
  }
}
