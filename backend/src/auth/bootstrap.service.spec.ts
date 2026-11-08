import { Test, TestingModule } from '@nestjs/testing';
import { BootstrapService } from './bootstrap.service';
import { CryptoService } from './crypto.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BootstrapService - Production Admin Credential Security', () => {
  let bootstrapService: BootstrapService;
  let mockPrisma: any;
  let mockCrypto: any;
  const originalEnv = process.env;

  beforeEach(async () => {
    process.env = { ...originalEnv };

    mockCrypto = {
      hashPassword: jest.fn(async (pwd: string) => `hashed_${pwd}`),
      comparePassword: jest.fn(async (plain: string, hash: string) => {
        if (plain === 'Admin@123456' && hash === 'default_hash') return true;
        return false;
      }),
    };

    mockPrisma = {
      runInSystemContext: jest.fn(async (cb) => {
        return cb(mockPrisma._tx);
      }),
      _tx: {
        organization: {
          findFirst: jest.fn().mockResolvedValue({ id: 'org-1', code: 'BIZPRO-CORP' }),
          create: jest.fn(),
        },
        permission: {
          upsert: jest.fn().mockResolvedValue({}),
          findMany: jest.fn().mockResolvedValue([]),
        },
        rolePermission: {
          upsert: jest.fn().mockResolvedValue({}),
        },
        role: {
          findFirst: jest.fn().mockResolvedValue({ id: 'role-admin', code: 'SUPER_ADMIN' }),
          create: jest.fn().mockResolvedValue({ id: 'new-role-id', code: 'ADMIN' }),
          upsert: jest.fn().mockResolvedValue({ id: 'role-admin', code: 'SUPER_ADMIN' }),
        },
        user: {
          findFirst: jest.fn(),
          create: jest.fn().mockResolvedValue({ id: 'new-admin-id', email: 'admin@bizpro.vn' }),
          update: jest.fn(),
        },
        userRole: {
          create: jest.fn(),
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BootstrapService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CryptoService, useValue: mockCrypto },
      ],
    }).compile();

    bootstrapService = module.get<BootstrapService>(BootstrapService);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('Scenario 1: Production + Default Password + NO INITIAL_ADMIN_PASSWORD -> Deactivates account (Fail-Closed)', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.INITIAL_ADMIN_PASSWORD;

    mockPrisma._tx.user.findFirst.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@bizpro.vn',
      passwordHash: 'default_hash',
      status: 'ACTIVE',
    });

    await bootstrapService.bootstrapCoreData();

    expect(mockPrisma._tx.user.update).toHaveBeenCalledWith({
      where: { id: 'admin-1' },
      data: { status: 'INACTIVE' },
    });
  });

  it('Scenario 2: Production + Default Password + HAS INITIAL_ADMIN_PASSWORD -> Rotates password & keeps ACTIVE', async () => {
    process.env.NODE_ENV = 'production';
    process.env.INITIAL_ADMIN_PASSWORD = 'StrongProductionPassword2026!';

    mockPrisma._tx.user.findFirst.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@bizpro.vn',
      passwordHash: 'default_hash',
      status: 'ACTIVE',
    });

    await bootstrapService.bootstrapCoreData();

    expect(mockCrypto.hashPassword).toHaveBeenCalledWith('StrongProductionPassword2026!');
    expect(mockPrisma._tx.user.update).toHaveBeenCalledWith({
      where: { id: 'admin-1' },
      data: {
        passwordHash: 'hashed_StrongProductionPassword2026!',
        status: 'ACTIVE',
      },
    });
  });

  it('Scenario 3: Production + Non-Default Password -> Does NOT deactivate or overwrite existing admin', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.INITIAL_ADMIN_PASSWORD;

    mockPrisma._tx.user.findFirst.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@bizpro.vn',
      passwordHash: 'custom_strong_hash',
      status: 'ACTIVE',
    });

    await bootstrapService.bootstrapCoreData();

    expect(mockPrisma._tx.user.update).not.toHaveBeenCalled();
  });

  it('Scenario 4: Development Environment -> Does NOT deactivate even if default password is in use', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.INITIAL_ADMIN_PASSWORD;

    mockPrisma._tx.user.findFirst.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@bizpro.vn',
      passwordHash: 'default_hash',
      status: 'ACTIVE',
    });

    await bootstrapService.bootstrapCoreData();

    expect(mockPrisma._tx.user.update).not.toHaveBeenCalled();
  });

  it('Scenario 5: Missing Admin in Production without INITIAL_ADMIN_PASSWORD -> Aborts default admin & role creation', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.INITIAL_ADMIN_PASSWORD;

    // Admin user and roles do not exist in database
    mockPrisma._tx.user.findFirst.mockResolvedValue(null);
    mockPrisma._tx.role.findFirst.mockResolvedValue(null);

    await bootstrapService.bootstrapCoreData();

    // Must NOT create default admin user or default roles
    expect(mockPrisma._tx.user.create).not.toHaveBeenCalled();
    expect(mockPrisma._tx.userRole.create).not.toHaveBeenCalled();
    expect(mockPrisma._tx.role.create).not.toHaveBeenCalled();
    expect(mockCrypto.hashPassword).not.toHaveBeenCalledWith('Admin@123456');

    // But valid foundational seed data (Organization and Permissions) must still complete
    expect(mockPrisma._tx.permission.upsert).toHaveBeenCalled();
  });

  it('Scenario 6: Missing Admin in Production WITH INITIAL_ADMIN_PASSWORD -> Provisions roles and admin safely', async () => {
    process.env.NODE_ENV = 'production';
    process.env.INITIAL_ADMIN_PASSWORD = 'NewProdAdminPassword2026!';

    mockPrisma._tx.user.findFirst.mockResolvedValue(null);
    mockPrisma._tx.role.findFirst.mockResolvedValue(null);

    await bootstrapService.bootstrapCoreData();

    expect(mockCrypto.hashPassword).toHaveBeenCalledWith('NewProdAdminPassword2026!');
    expect(mockPrisma._tx.user.create).toHaveBeenCalled();
    expect(mockPrisma._tx.role.create).toHaveBeenCalled();
    expect(mockPrisma._tx.userRole.create).toHaveBeenCalled();
  });
});
