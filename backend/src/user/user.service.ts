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
    if (!orgId) throw new BadRequestException('Yêu cầu định danh tổ chức hợp lệ');
    return this.prisma.runInSystemContext(async (tx) => {
      return tx.user.findMany({
        where: { organizationId: orgId },
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

  async getUserById(id: string, orgId?: string) {
    if (!orgId) throw new BadRequestException('Yêu cầu định danh tổ chức hợp lệ');
    return this.prisma.runInSystemContext(async (tx) => {
      const user = await tx.user.findFirst({
        where: { id, organizationId: orgId },
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
      if (!user) throw new NotFoundException('Không tìm thấy người dùng trong tổ chức');
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
    if (!orgId) throw new BadRequestException('Yêu cầu định danh tổ chức hợp lệ');
    return this.prisma.runInSystemContext(async (tx) => {
      const targetOrgId = orgId;

      const existing = await tx.user.findFirst({
        where: { email: dto.email.toLowerCase() },
      });
      if (existing) {
        throw new BadRequestException('Email này đã được sử dụng');
      }

      // Validate assigned roles belong to targetOrgId
      if (dto.roleIds && dto.roleIds.length > 0) {
        const matchingRolesCount = await tx.role.count({
          where: {
            id: { in: dto.roleIds },
            organizationId: targetOrgId,
          },
        });
        if (matchingRolesCount !== dto.roleIds.length) {
          throw new BadRequestException('Một hoặc nhiều vai trò không thuộc tổ chức này');
        }
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
        // Default to STAFF role of this organization
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
    callerOrgId?: string,
    actorId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    if (!callerOrgId) throw new BadRequestException('Yêu cầu định danh tổ chức hợp lệ');
    return this.prisma.runInSystemContext(async (tx) => {
      const user = await tx.user.findFirst({
        where: { id, organizationId: callerOrgId },
      });
      if (!user) throw new NotFoundException('Không tìm thấy người dùng trong tổ chức');

      // Validate assigned roles belong to callerOrgId
      if (dto.roleIds !== undefined && dto.roleIds.length > 0) {
        const matchingRolesCount = await tx.role.count({
          where: {
            id: { in: dto.roleIds },
            organizationId: callerOrgId,
          },
        });
        if (matchingRolesCount !== dto.roleIds.length) {
          throw new BadRequestException('Một hoặc nhiều vai trò không thuộc tổ chức này');
        }
      }

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
    callerOrgId?: string,
    actorId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    if (!callerOrgId) throw new BadRequestException('Yêu cầu định danh tổ chức hợp lệ');
    return this.prisma.runInSystemContext(async (tx) => {
      const user = await tx.user.findFirst({
        where: { id, organizationId: callerOrgId },
      });
      if (!user) throw new NotFoundException('Không tìm thấy người dùng trong tổ chức');

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
