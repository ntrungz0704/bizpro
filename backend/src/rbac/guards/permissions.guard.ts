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
    const callerOrgId = user?.organizationId || user?.orgId;
    if (!user || !currentUserId) {
      throw new ForbiddenException('User is not authenticated');
    }

    // System-wide Super admin bypass only
    if (user.isSuperAdmin === true) {
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
        // Database roles: SUPER_ADMIN, ORG_ADMIN, ADMIN
        // Strict Fail-Closed organization scoping:
        // Database roles do NOT have automatic system-wide bypass. Only user.isSuperAdmin === true bypasses globally.
        // For organization-level bypass, requires both callerOrgId and role organizationId to be present and identical.
        if (ur.role.code === 'SUPER_ADMIN' || ur.role.code === 'ORG_ADMIN' || ur.role.code === 'ADMIN') {
          if (callerOrgId && ur.role.organizationId && ur.role.organizationId === callerOrgId) {
            return true; // Authorized Admin of the caller's organization has full access
          }
          // Fail-closed: Missing organization context or cross-organization admin strictly cannot bypass
          continue;
        }

        // Regular roles: accumulate permissions only if role belongs to caller organization or is system template
        if (!ur.role.organizationId || (callerOrgId && ur.role.organizationId === callerOrgId)) {
          for (const rp of ur.role.rolePermissions) {
            userPermissionCodes.add(rp.permission.code);
          }
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
