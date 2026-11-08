import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const currentUserId = user?.id || user?.userId;
    if (!user || !currentUserId) {
      throw new ForbiddenException('User is not authenticated');
    }

    // Super admin bypass
    if (user.role === 'SUPER_ADMIN' || user.isSuperAdmin) {
      return true;
    }

    return this.prisma.runInSystemContext(async (tx) => {
      const userRoles = await tx.userRole.findMany({
        where: { userId: currentUserId },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      const userPermissionCodes = new Set<string>();
      for (const ur of userRoles) {
        if (ur.role.code === 'SUPER_ADMIN' || ur.role.code === 'ORG_ADMIN') {
          return true; // Admin has full access
        }
        for (const rp of ur.role.rolePermissions) {
          userPermissionCodes.add(rp.permission.code);
        }
      }

      const hasAll = requiredPermissions.every((perm) => userPermissionCodes.has(perm));
      if (!hasAll) {
        throw new ForbiddenException(
          `Truy cập bị từ chối: Thiếu quyền bắt buộc [${requiredPermissions.join(', ')}]`,
        );
      }

      return true;
    });
  }
}
