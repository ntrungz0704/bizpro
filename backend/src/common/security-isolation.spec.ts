import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { UserService } from '../user/user.service';
import { DepartmentService } from '../department/department.service';
import { RbacService } from '../rbac/rbac.service';

describe('Security & Tenant Isolation Unit Tests', () => {
  let mockPrisma: any;
  let userService: UserService;
  let departmentService: DepartmentService;
  let rbacService: RbacService;
  let permissionsGuard: PermissionsGuard;
  let mockReflector: Partial<Reflector>;

  const orgA = 'org-aaaa-1111';
  const orgB = 'org-bbbb-2222';
  const userOrgA = {
    id: 'user-a-1',
    organizationId: orgA,
    email: 'userA@bizpro.vn',
    fullName: 'User A',
  };
  const roleOrgA = {
    id: 'role-a-1',
    organizationId: orgA,
    code: 'STAFF',
    name: 'Staff A',
  };
  const roleOrgB = {
    id: 'role-b-1',
    organizationId: orgB,
    code: 'STAFF',
    name: 'Staff B',
  };
  const deptOrgA = {
    id: 'dept-a-1',
    organizationId: orgA,
    name: 'Tech A',
    code: 'TECH-A',
  };

  beforeEach(() => {
    mockPrisma = {
      runInSystemContext: jest.fn(async (cb) => {
        const tx = {
          user: {
            findFirst: jest.fn(async ({ where }) => {
              if (where.id === userOrgA.id && (!where.organizationId || where.organizationId === orgA)) {
                return userOrgA;
              }
              return null;
            }),
            findUnique: jest.fn(async ({ where }) => {
              if (where.id === userOrgA.id) return userOrgA;
              return null;
            }),
            update: jest.fn(async ({ data }) => ({ ...userOrgA, ...data })),
          },
          role: {
            findFirst: jest.fn(async ({ where }) => {
              if (where.id === roleOrgA.id && where.organizationId === orgA) return roleOrgA;
              if (where.id === roleOrgB.id && where.organizationId === orgB) return roleOrgB;
              return null;
            }),
            count: jest.fn(async ({ where }) => {
              const ids: string[] = where.id.in || [];
              const targetOrg = where.organizationId;
              let count = 0;
              for (const id of ids) {
                if (id === roleOrgA.id && targetOrg === orgA) count++;
                if (id === roleOrgB.id && targetOrg === orgB) count++;
              }
              return count;
            }),
          },
          userRole: {
            findMany: jest.fn(async () => []),
            createMany: jest.fn(async () => ({ count: 1 })),
            deleteMany: jest.fn(async () => ({ count: 1 })),
          },
          auditLog: {
            create: jest.fn(async () => ({})),
          },
        };
        return cb(tx);
      }),
      runInTenantContext: jest.fn(async (targetOrg, cb) => {
        const tx = {
          department: {
            findFirst: jest.fn(async ({ where }) => {
              if (where.id === deptOrgA.id && where.organizationId === orgA) return deptOrgA;
              return null;
            }),
            update: jest.fn(async ({ data }) => ({ ...deptOrgA, ...data })),
            delete: jest.fn(async () => deptOrgA),
          },
        };
        return cb(tx);
      }),
    };

    userService = new UserService(mockPrisma);
    departmentService = new DepartmentService(mockPrisma);
    rbacService = new RbacService(mockPrisma);

    mockReflector = {
      getAllAndOverride: jest.fn(),
    };
    permissionsGuard = new PermissionsGuard(mockReflector as Reflector, mockPrisma);
  });

  describe('User Management Tenant Isolation (Negative Cross-Tenant Tests)', () => {
    it('getUserById: throws BadRequestException if organizationId is missing', async () => {
      await expect(userService.getUserById('user-a-1', undefined)).rejects.toThrow(BadRequestException);
    });

    it('getUserById: throws NotFoundException when caller from Org B requests User from Org A', async () => {
      await expect(userService.getUserById('user-a-1', orgB)).rejects.toThrow(NotFoundException);
    });

    it('getUserById: succeeds when caller is in the same organization', async () => {
      const result = await userService.getUserById('user-a-1', orgA);
      expect(result).toBeDefined();
      expect(result.id).toBe('user-a-1');
    });

    it('updateUser: rejects cross-organization modification with NotFoundException', async () => {
      await expect(
        userService.updateUser('user-a-1', { fullName: 'Hacked' }, orgB),
      ).rejects.toThrow(NotFoundException);
    });

    it('updateUser: rejects assigning a role from Org B to User in Org A with BadRequestException', async () => {
      await expect(
        userService.updateUser('user-a-1', { roleIds: [roleOrgB.id] }, orgA),
      ).rejects.toThrow(BadRequestException);
    });

    it('updateUserStatus: rejects cross-organization status change with NotFoundException', async () => {
      await expect(
        userService.updateUserStatus('user-a-1', { status: 'INACTIVE' }, orgB),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Department Management Tenant Isolation', () => {
    it('deleteDepartment: rejects cross-organization deletion when target belongs to Org A but requested by Org B', async () => {
      await expect(departmentService.deleteDepartment(orgB, deptOrgA.id)).rejects.toThrow(NotFoundException);
    });

    it('deleteDepartment: throws BadRequestException when orgId is undefined', async () => {
      await expect(departmentService.deleteDepartment(undefined, deptOrgA.id)).rejects.toThrow(BadRequestException);
    });

    it('deleteDepartment: succeeds when orgId matches department organization', async () => {
      const res = await departmentService.deleteDepartment(orgA, deptOrgA.id);
      expect(res.id).toBe(deptOrgA.id);
    });

    it('updateDepartment: rejects cross-organization update when target belongs to Org A but caller is Org B', async () => {
      await expect(
        departmentService.updateDepartment(orgB, deptOrgA.id, { name: 'Renamed Dept' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('updateDepartment: succeeds when orgId matches department organization', async () => {
      const res = await departmentService.updateDepartment(orgA, deptOrgA.id, { name: 'Tech Department' });
      expect(res.name).toBe('Tech Department');
    });
  });

  describe('RBAC Role Assignment & Cross-Tenant Protection', () => {
    it('assignUserRoles: rejects assigning role from Org B to User in Org A', async () => {
      await expect(
        rbacService.assignUserRoles(orgA, userOrgA.id, [roleOrgB.id]),
      ).rejects.toThrow(BadRequestException);
    });

    it('assignUserRoles: rejects when user does not belong to caller organization', async () => {
      await expect(
        rbacService.assignUserRoles(orgB, userOrgA.id, [roleOrgB.id]),
      ).rejects.toThrow(NotFoundException);
    });

    it('updateRolePermissions: rejects cross-organization role mutation', async () => {
      await expect(
        rbacService.updateRolePermissions(orgB, roleOrgA.id, ['perm-1']),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('PermissionsGuard Enforcement', () => {
    it('allows request when no permissions are required', async () => {
      (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
      const mockContext = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user: { id: 'u1' } }),
        }),
      } as unknown as ExecutionContext;

      const allowed = await permissionsGuard.canActivate(mockContext);
      expect(allowed).toBe(true);
    });

    it('denies unauthenticated request with ForbiddenException when permissions are required', async () => {
      (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['crm.leads.write']);
      const mockContext = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user: null }),
        }),
      } as unknown as ExecutionContext;

      await expect(permissionsGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    });

    it('denies authenticated user lacking required permissions with ForbiddenException (403)', async () => {
      (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['crm.leads.write']);
      const mockContext = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user: { id: 'user-regular' } }),
        }),
      } as unknown as ExecutionContext;

      // Mock user roles has only crm.leads.read
      mockPrisma.runInSystemContext = jest.fn(async (cb) => {
        const tx = {
          userRole: {
            findMany: jest.fn(async () => [
              {
                role: {
                  code: 'STAFF',
                  rolePermissions: [
                    { permission: { code: 'crm.leads.read' } },
                  ],
                },
              },
            ]),
          },
        };
        return cb(tx);
      });

      await expect(permissionsGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    });

    it('allows authenticated user with required permissions', async () => {
      (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['crm.leads.write']);
      const mockContext = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user: { id: 'user-authorized' } }),
        }),
      } as unknown as ExecutionContext;

      mockPrisma.runInSystemContext = jest.fn(async (cb) => {
        const tx = {
          userRole: {
            findMany: jest.fn(async () => [
              {
                role: {
                  code: 'STAFF',
                  rolePermissions: [
                    { permission: { code: 'crm.leads.write' } },
                  ],
                },
              },
            ]),
          },
        };
        return cb(tx);
      });

      const allowed = await permissionsGuard.canActivate(mockContext);
      expect(allowed).toBe(true);
    });

    it('denies ORG_ADMIN bypass when role belongs to a different organization (cross-tenant admin escalation prevention)', async () => {
      (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['crm.leads.write']);
      const mockContext = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user: { id: 'admin-attacker', organizationId: orgA } }),
        }),
      } as unknown as ExecutionContext;

      // User holds ORG_ADMIN role, but for Org B
      mockPrisma.runInSystemContext = jest.fn(async (cb) => {
        const tx = {
          userRole: {
            findMany: jest.fn(async () => [
              {
                role: {
                  code: 'ORG_ADMIN',
                  organizationId: orgB, // Different organization!
                  rolePermissions: [],
                },
              },
            ]),
          },
        };
        return cb(tx);
      });

      await expect(permissionsGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    });

    it('allows ORG_ADMIN bypass when role belongs to caller organization', async () => {
      (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['crm.leads.write']);
      const mockContext = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user: { id: 'admin-legit', organizationId: orgA } }),
        }),
      } as unknown as ExecutionContext;

      // User holds ORG_ADMIN role for Org A
      mockPrisma.runInSystemContext = jest.fn(async (cb) => {
        const tx = {
          userRole: {
            findMany: jest.fn(async () => [
              {
                role: {
                  code: 'ORG_ADMIN',
                  organizationId: orgA, // Matching organization!
                  rolePermissions: [],
                },
              },
            ]),
          },
        };
        return cb(tx);
      });

      const allowed = await permissionsGuard.canActivate(mockContext);
      expect(allowed).toBe(true);
    });

    it('denies ORG_ADMIN bypass when role organizationId is null (fail-closed check)', async () => {
      (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['crm.leads.write']);
      const mockContext = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user: { id: 'admin-attacker', organizationId: orgA } }),
        }),
      } as unknown as ExecutionContext;

      mockPrisma.runInSystemContext = jest.fn(async (cb) => {
        const tx = {
          userRole: {
            findMany: jest.fn(async () => [
              {
                role: {
                  code: 'ORG_ADMIN',
                  organizationId: null, // Null role orgId!
                  rolePermissions: [],
                },
              },
            ]),
          },
        };
        return cb(tx);
      });

      await expect(permissionsGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    });

    it('denies ORG_ADMIN bypass when caller organizationId is missing (fail-closed check)', async () => {
      (mockReflector.getAllAndOverride as jest.Mock).mockReturnValue(['crm.leads.write']);
      const mockContext = {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user: { id: 'admin-attacker', organizationId: null } }),
        }),
      } as unknown as ExecutionContext;

      mockPrisma.runInSystemContext = jest.fn(async (cb) => {
        const tx = {
          userRole: {
            findMany: jest.fn(async () => [
              {
                role: {
                  code: 'ORG_ADMIN',
                  organizationId: orgA,
                  rolePermissions: [],
                },
              },
            ]),
          },
        };
        return cb(tx);
      });

      await expect(permissionsGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
    });
  });
});
