import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/common/constants';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { CryptoService } from '../src/auth/crypto.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('Phase 2F: HRM & Workforce Management E2E Test Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let cryptoService: CryptoService;

  let orgId: string;
  let otherOrgId: string;
  let adminToken: string;
  let employeeToken: string;
  let otherOrgToken: string;

  let adminUserId: string;
  let employeeUserId: string;
  let otherOrgUserId: string;

  let testDeptId: string;
  let testPosId: string;
  let testEmployeeId: string;
  let testLeaveTypeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new TransformResponseInterceptor(reflector));

    await app.init();
    prisma = app.get(PrismaService);
    authService = app.get(AuthService);
    cryptoService = app.get(CryptoService);

    const defaultPassword = 'Password@123456';
    const passwordHash = await cryptoService.hashPassword(defaultPassword);

    // 1. Resolve Primary Org first
    await prisma.runInSystemContext(async (tx) => {
      let org = await tx.organization.findFirst({ where: { code: 'BIZPRO-CORP' } });
      if (!org) {
        org = await tx.organization.create({
          data: {
            code: 'BIZPRO-CORP',
            name: 'BizPro Test Corp',
            taxCode: '0109988776',
            email: 'hrm-test@bizpro.vn',
            phone: '02439998888',
          },
        });
      }
      orgId = org.id;

      // Unlink users from employees
      await tx.user.updateMany({
        where: {
          email: {
            in: [
              'admin-hrm@bizpro.vn',
              'staff-hrm@bizpro.vn',
              'other-hrm-user@bizpro.vn',
              'conc-user@bizpro.vn',
            ],
          },
        },
        data: { employeeId: null },
      });
    });

    // Clean up test records inside runInTenantContext
    await prisma.runInTenantContext(orgId, async (tx) => {
      const testEmployees = await tx.employee.findMany({
        where: {
          organizationId: orgId,
          employeeCode: {
            in: ['EMP-2F-TEST01', 'EMP-2F-TEST02', 'EMP-CONC-01', 'EMP-ADMIN-SELF'],
          },
        },
        select: { id: true },
      });
      const testEmpIds = testEmployees.map((e) => e.id);

      if (testEmpIds.length > 0) {
        await tx.leaveRequest.deleteMany({ where: { employeeId: { in: testEmpIds } } });
        await tx.leaveBalance.deleteMany({ where: { employeeId: { in: testEmpIds } } });
        await tx.attendanceRecord.deleteMany({ where: { employeeId: { in: testEmpIds } } });
        await tx.employee.deleteMany({ where: { id: { in: testEmpIds } } });
      }

      await tx.leaveType.deleteMany({
        where: { organizationId: orgId, code: 'CONC-LT' },
      });
    });

    // Setup Secondary Org and Users
    await prisma.runInSystemContext(async (tx) => {
      // 2. Secondary Org for Multi-Tenant Isolation
      let otherOrg = await tx.organization.findFirst({ where: { code: 'OTHER-CORP-2F' } });
      if (!otherOrg) {
        otherOrg = await tx.organization.create({
          data: {
            code: 'OTHER-CORP-2F',
            name: 'Other Corp for Phase 2F',
            taxCode: '0109988999',
            email: 'other-hrm@bizpro.vn',
            phone: '02439999999',
          },
        });
      }
      otherOrgId = otherOrg.id;

      // 3. Admin User
      let admin = await tx.user.findFirst({
        where: { organizationId: orgId, email: 'admin-hrm@bizpro.vn' },
      });
      if (!admin) {
        admin = await tx.user.create({
          data: {
            organizationId: orgId,
            email: 'admin-hrm@bizpro.vn',
            passwordHash,
            fullName: 'Admin HRM Tester',
            status: 'ACTIVE',
          },
        });
      }
      adminUserId = admin.id;

      // Assign ORG_ADMIN role to admin
      const orgAdminRole = await tx.role.findFirst({
        where: { organizationId: orgId, code: 'ORG_ADMIN' },
      });
      if (orgAdminRole) {
        await tx.userRole.upsert({
          where: { userId_roleId: { userId: admin.id, roleId: orgAdminRole.id } },
          create: { userId: admin.id, roleId: orgAdminRole.id },
          update: {},
        });
      }

      // 4. Employee User
      let empUser = await tx.user.findFirst({
        where: { organizationId: orgId, email: 'staff-hrm@bizpro.vn' },
      });
      if (!empUser) {
        empUser = await tx.user.create({
          data: {
            organizationId: orgId,
            email: 'staff-hrm@bizpro.vn',
            passwordHash,
            fullName: 'Staff HRM Tester',
            status: 'ACTIVE',
          },
        });
      }
      employeeUserId = empUser.id;

      // Assign EMPLOYEE role to employee
      const employeeRole = await tx.role.findFirst({
        where: { organizationId: orgId, code: 'EMPLOYEE' },
      });
      if (employeeRole) {
        await tx.userRole.upsert({
          where: { userId_roleId: { userId: empUser.id, roleId: employeeRole.id } },
          create: { userId: empUser.id, roleId: employeeRole.id },
          update: {},
        });
      }

      // 5. Other Org User
      let otherUser = await tx.user.findFirst({
        where: { organizationId: otherOrgId, email: 'other-hrm-user@bizpro.vn' },
      });
      if (!otherUser) {
        otherUser = await tx.user.create({
          data: {
            organizationId: otherOrgId,
            email: 'other-hrm-user@bizpro.vn',
            passwordHash,
            fullName: 'Other Org HRM User',
            status: 'ACTIVE',
          },
        });
      }
      otherOrgUserId = otherUser.id;

      // Assign ORG_ADMIN in otherOrg
      let otherOrgAdminRole = await tx.role.findFirst({
        where: { organizationId: otherOrgId, code: 'ORG_ADMIN' },
      });
      if (!otherOrgAdminRole) {
        otherOrgAdminRole = await tx.role.create({
          data: {
            organizationId: otherOrgId,
            code: 'ORG_ADMIN',
            name: 'Other Org Admin',
            isSystem: true,
          },
        });
      }
      await tx.userRole.upsert({
        where: { userId_roleId: { userId: otherUser.id, roleId: otherOrgAdminRole.id } },
        create: { userId: otherUser.id, roleId: otherOrgAdminRole.id },
        update: {},
      });
    });

    // Generate JWT tokens
    const adminLogin = await authService.login(
      { email: 'admin-hrm@bizpro.vn', password: defaultPassword },
      { userAgent: 'Jest-E2E' },
    );
    adminToken = adminLogin.accessToken;

    const empLogin = await authService.login(
      { email: 'staff-hrm@bizpro.vn', password: defaultPassword },
      { userAgent: 'Jest-E2E' },
    );
    employeeToken = empLogin.accessToken;

    const otherLogin = await authService.login(
      { email: 'other-hrm-user@bizpro.vn', password: defaultPassword },
      { userAgent: 'Jest-E2E' },
    );
    otherOrgToken = otherLogin.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  // ==========================================
  // TC-HRM-01: Seed & Structure Verification
  // ==========================================
  it('TC-HRM-01: should query seeded HRM master data (departments, positions, shifts, leave types)', async () => {
    // 1. Departments
    const deptRes = await request(app.getHttpServer())
      .get('/api/hrm/departments')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(deptRes.body.data)).toBe(true);
    expect(deptRes.body.data.length).toBeGreaterThan(0);
    testDeptId = deptRes.body.data[0].id;

    // 2. Positions
    const posRes = await request(app.getHttpServer())
      .get('/api/hrm/positions')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(posRes.body.data)).toBe(true);
    expect(posRes.body.data.length).toBeGreaterThan(0);
    testPosId = posRes.body.data[0].id;

    // 3. Leave Types
    const ltRes = await request(app.getHttpServer())
      .get('/api/hrm/leave/types')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(ltRes.body.data)).toBe(true);
    const al = ltRes.body.data.find((t: any) => t.code === 'AL');
    expect(al).toBeDefined();
    expect(Number(al.annualQuota)).toBe(12);
    testLeaveTypeId = al.id;
  });

  // ==========================================
  // TC-HRM-02: Employee Creation & VN Phone Validation
  // ==========================================
  it('TC-HRM-02: should create employee with valid VN phone and reject invalid formats or duplicate codes', async () => {
    const empPayload = {
      employeeCode: 'EMP-2F-TEST01',
      fullName: 'Trần Văn Bình',
      email: 'staff-hrm@bizpro.vn',
      phone: '0987654321', // Valid VN phone
      dateOfBirth: '1995-08-20',
      gender: 'MALE',
      address: 'Hà Nội',
      departmentId: testDeptId,
      positionId: testPosId,
      hireDate: '2026-01-01',
      employmentStatus: 'OFFICIAL',
    };

    // 1. Valid Creation
    const res = await request(app.getHttpServer())
      .post('/api/hrm/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(empPayload)
      .expect(201);

    expect(res.body.data.employeeCode).toBe('EMP-2F-TEST01');
    expect(res.body.data.fullName).toBe('Trần Văn Bình');
    testEmployeeId = res.body.data.id;

    // Link user to employee for auth testing
    await prisma.runInSystemContext(async (tx) => {
      await tx.user.update({
        where: { id: employeeUserId },
        data: { employeeId: testEmployeeId },
      });
    });

    // 2. Duplicate Employee Code in same tenant -> 400
    const dupRes = await request(app.getHttpServer())
      .post('/api/hrm/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...empPayload,
        email: 'other-email@bizpro.vn',
      })
      .expect(400);

    expect(dupRes.body.message).toContain('đã tồn tại');

    // 3. Invalid Phone Format -> 400
    const invalidPhoneRes = await request(app.getHttpServer())
      .post('/api/hrm/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...empPayload,
        employeeCode: 'EMP-2F-TEST02',
        email: 'test2@bizpro.vn',
        phone: '12345678', // Invalid phone
      })
      .expect(400);

    expect(invalidPhoneRes.body.message).toBeDefined();
  });

  // ==========================================
  // TC-HRM-03: Auto Leave Balance Initialization
  // ==========================================
  it('TC-HRM-03: should auto-initialize leave balance for newly created employee', async () => {
    const currentYear = new Date().getFullYear();
    const balance = await prisma.runInTenantContext(orgId, async (tx) => {
      return tx.leaveBalance.findFirst({
        where: {
          organizationId: orgId,
          employeeId: testEmployeeId,
          leaveTypeId: testLeaveTypeId,
          year: currentYear,
        },
      });
    });

    expect(balance).toBeDefined();
    expect(Number(balance?.entitledDays)).toBe(12);
    expect(Number(balance?.usedDays)).toBe(0);
    expect(Number(balance?.pendingDays)).toBe(0);
  });

  // ==========================================
  // TC-HRM-04: Time & Attendance Check-in & Double Check-in Prevention
  // ==========================================
  it('TC-HRM-04: should check in successfully and prevent double check-in on the same day', async () => {
    // Clean up any existing attendance record for today before testing
    await prisma.runInTenantContext(orgId, async (tx) => {
      await tx.attendanceRecord.deleteMany({
        where: { organizationId: orgId, employeeId: testEmployeeId },
      });
    });

    // 1. Check in
    const res = await request(app.getHttpServer())
      .post('/api/hrm/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ source: 'WEB_UI' })
      .expect(200);

    expect(res.body.data.employeeId).toBe(testEmployeeId);
    expect(res.body.data.checkInAt).toBeDefined();
    expect(['PRESENT', 'LATE']).toContain(res.body.data.status);

    // 2. Double Check-in on same day -> 400 Bad Request
    const dupRes = await request(app.getHttpServer())
      .post('/api/hrm/attendance/check-in')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ source: 'WEB_UI' })
      .expect(400);

    expect(dupRes.body.message).toContain('đã thực hiện Check-in');
  });

  // ==========================================
  // TC-HRM-05: Time & Attendance Check-out & Double Check-out Prevention
  // ==========================================
  it('TC-HRM-05: should check out successfully and prevent double check-out', async () => {
    // 1. Check out
    const res = await request(app.getHttpServer())
      .post('/api/hrm/attendance/check-out')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({})
      .expect(200);

    expect(res.body.data.employeeId).toBe(testEmployeeId);
    expect(res.body.data.checkOutAt).toBeDefined();

    // 2. Double Check-out -> 400 Bad Request
    const dupRes = await request(app.getHttpServer())
      .post('/api/hrm/attendance/check-out')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({})
      .expect(400);

    expect(dupRes.body.message).toContain('đã thực hiện Check-out');
  });

  // ==========================================
  // TC-HRM-06: Attendance HR Adjustment
  // ==========================================
  it('TC-HRM-06: should allow HR Manager to adjust attendance with mandatory reason', async () => {
    const todayRecord = await prisma.runInTenantContext(orgId, async (tx) => {
      return tx.attendanceRecord.findFirst({
        where: { organizationId: orgId, employeeId: testEmployeeId },
      });
    });
    expect(todayRecord).toBeDefined();

    // 1. Adjust with missing reason -> 400
    await request(app.getHttpServer())
      .post(`/api/hrm/attendance/${todayRecord?.id}/adjust`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PRESENT' })
      .expect(400);

    // 2. Adjust with valid reason -> 200
    const res = await request(app.getHttpServer())
      .post(`/api/hrm/attendance/${todayRecord?.id}/adjust`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'PRESENT',
        adjustmentReason: 'Nhân viên có đơn giải trình công tác bên ngoài',
      })
      .expect(200);

    expect(res.body.data.status).toBe('PRESENT');
    expect(res.body.data.adjustmentReason).toContain('giải trình');
  });

  // ==========================================
  // TC-HRM-07: Leave Request & Balance Availability
  // ==========================================
  it('TC-HRM-07: should query balances and submit leave request in PENDING state', async () => {
    // 1. Check initial balances
    const balRes = await request(app.getHttpServer())
      .get('/api/hrm/leave/balances/my')
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(200);

    const al = balRes.body.data.find((b: any) => b.leaveTypeCode === 'AL');
    expect(al).toBeDefined();
    expect(al.availableDays).toBe(12);

    // 2. Create Leave Request for 3.0 days
    const reqRes = await request(app.getHttpServer())
      .post('/api/hrm/leave/requests')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        leaveTypeId: testLeaveTypeId,
        startDate: '2026-11-20',
        endDate: '2026-11-22',
        totalDays: 3.0,
        reason: 'Nghỉ giải quyết việc gia đình',
      })
      .expect(201);

    expect(reqRes.body.data.status).toBe('PENDING');
    expect(Number(reqRes.body.data.totalDays)).toBe(3.0);

    // 3. Check updated balances (pendingDays = 3, availableDays = 9)
    const updatedBalRes = await request(app.getHttpServer())
      .get('/api/hrm/leave/balances/my')
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(200);

    const updatedAl = updatedBalRes.body.data.find((b: any) => b.leaveTypeCode === 'AL');
    expect(updatedAl.pendingDays).toBe(3);
    expect(updatedAl.availableDays).toBe(9);
  });

  // ==========================================
  // TC-HRM-08: Leave Request Insufficient Balance
  // ==========================================
  it('TC-HRM-08: should reject leave request exceeding available balance', async () => {
    // Available is 9.0 days, request 10.0 days -> 400
    const res = await request(app.getHttpServer())
      .post('/api/hrm/leave/requests')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        leaveTypeId: testLeaveTypeId,
        startDate: '2026-12-01',
        endDate: '2026-12-10',
        totalDays: 10.0,
        reason: 'Nghỉ phép dài hạn vượt mức',
      })
      .expect(400);

    expect(res.body.message).toContain('Số ngày phép khả dụng không đủ');
  });

  // ==========================================
  // TC-HRM-09: Leave Approval & Anti-Self-Approval
  // ==========================================
  it('TC-HRM-09: should prevent self-approval and allow manager approval to transition balance', async () => {
    // Find the pending request from TC-07
    const pendingReq = await prisma.runInTenantContext(orgId, async (tx) => {
      return tx.leaveRequest.findFirst({
        where: {
          organizationId: orgId,
          employeeId: testEmployeeId,
          status: 'PENDING',
        },
      });
    });
    expect(pendingReq).toBeDefined();

    // 1. RBAC check: Standard employee without hrm.leave.approve gets 403 Forbidden
    await request(app.getHttpServer())
      .post(`/api/hrm/leave/requests/${pendingReq?.id}/approve`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({})
      .expect(403);

    // 2. Anti-Self-Approval Check: Create an employee for Admin, create a leave request, Admin tries to self-approve -> 400 Bad Request
    let adminEmpId = '';
    await prisma.runInTenantContext(orgId, async (tx) => {
      const emp = await tx.employee.create({
        data: {
          organizationId: orgId,
          employeeCode: 'EMP-ADMIN-SELF',
          fullName: 'Admin Self Tester',
          email: 'admin-hrm@bizpro.vn',
          hireDate: new Date('2026-01-01'),
          departmentId: testDeptId,
          positionId: testPosId,
          employmentStatus: 'OFFICIAL',
        },
      });
      adminEmpId = emp.id;

      await tx.user.update({
        where: { id: adminUserId },
        data: { employeeId: emp.id },
      });

      await tx.leaveBalance.create({
        data: {
          organizationId: orgId,
          employeeId: emp.id,
          leaveTypeId: testLeaveTypeId,
          year: 2026,
          entitledDays: new Decimal(12.0),
          usedDays: new Decimal(0),
          pendingDays: new Decimal(0),
        },
      });
    });

    const adminSelfReq = await request(app.getHttpServer())
      .post('/api/hrm/leave/requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        leaveTypeId: testLeaveTypeId,
        startDate: '2026-11-28',
        endDate: '2026-11-28',
        totalDays: 1.0,
        reason: 'Admin self test',
      })
      .expect(201);

    const selfApproveRes = await request(app.getHttpServer())
      .post(`/api/hrm/leave/requests/${adminSelfReq.body.data.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(400);

    expect(selfApproveRes.body.message).toContain('không thể tự phê duyệt');

    // 3. Admin/Manager approves employee's request -> 200 OK
    const approveRes = await request(app.getHttpServer())
      .post(`/api/hrm/leave/requests/${pendingReq?.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(200);

    expect(approveRes.body.data.status).toBe('APPROVED');

    // 4. Check updated balance for employee (pending = 0, used = 3, available = 9)
    const balRes = await request(app.getHttpServer())
      .get('/api/hrm/leave/balances/my')
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(200);

    const al = balRes.body.data.find((b: any) => b.leaveTypeCode === 'AL');
    expect(al.pendingDays).toBe(0);
    expect(al.usedDays).toBe(3);
    expect(al.availableDays).toBe(9);

    // 5. Double Approval Prevention -> 400 Bad Request
    const doubleApproveRes = await request(app.getHttpServer())
      .post(`/api/hrm/leave/requests/${pendingReq?.id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({})
      .expect(400);

    expect(doubleApproveRes.body.message).toContain('không ở trạng thái chờ duyệt');
  });

  // ==========================================
  // TC-HRM-10: Leave Cancellation & Pending Refund State Machine
  // ==========================================
  it('TC-HRM-10: should allow user to cancel pending leave request and refund pending days', async () => {
    // 1. Create a 2.0 day request
    const createRes = await request(app.getHttpServer())
      .post('/api/hrm/leave/requests')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        leaveTypeId: testLeaveTypeId,
        startDate: '2026-11-25',
        endDate: '2026-11-26',
        totalDays: 2.0,
        reason: 'Nghỉ ngắn hạn',
      })
      .expect(201);

    const reqId = createRes.body.data.id;

    // Check balance: pending = 2, available = 7
    let balRes = await request(app.getHttpServer())
      .get('/api/hrm/leave/balances/my')
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(200);
    let al = balRes.body.data.find((b: any) => b.leaveTypeCode === 'AL');
    expect(al.pendingDays).toBe(2);
    expect(al.availableDays).toBe(7);

    // 2. User cancels the request
    const cancelRes = await request(app.getHttpServer())
      .post(`/api/hrm/leave/requests/${reqId}/cancel`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(200);

    expect(cancelRes.body.data.status).toBe('CANCELLED');

    // 3. Check refunded balance: pending = 0, available = 9
    balRes = await request(app.getHttpServer())
      .get('/api/hrm/leave/balances/my')
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(200);
    al = balRes.body.data.find((b: any) => b.leaveTypeCode === 'AL');
    expect(al.pendingDays).toBe(0);
    expect(al.availableDays).toBe(9);

    // 4. Double cancellation prevention -> 400
    const doubleCancelRes = await request(app.getHttpServer())
      .post(`/api/hrm/leave/requests/${reqId}/cancel`)
      .set('Authorization', `Bearer ${employeeToken}`)
      .expect(400);

    expect(doubleCancelRes.body.message).toContain('đã bị hủy trước đó');
  });

  // ==========================================
  // TC-HRM-11: High Concurrency (10 Simultaneous Requests on 1.0 Day Balance)
  // ==========================================
  it('TC-HRM-11: should handle 10 concurrent leave requests on 1.0 day balance with exactly 1 success', async () => {
    // 1. Create a dedicated employee with EXACTLY 1.0 day leave balance
    let concEmployeeId = '';
    await prisma.runInTenantContext(orgId, async (tx) => {
      const emp = await tx.employee.create({
        data: {
          organizationId: orgId,
          employeeCode: 'EMP-CONC-01',
          fullName: 'Concurrency Test Employee',
          email: 'conc-test@bizpro.vn',
          phone: '0987654322',
          hireDate: new Date('2026-01-01'),
          departmentId: testDeptId,
          positionId: testPosId,
          employmentStatus: 'OFFICIAL',
        },
      });
      concEmployeeId = emp.id;

      // Create custom leave type with quota 1.0 day
      const lt = await tx.leaveType.create({
        data: {
          organizationId: orgId,
          code: 'CONC-LT',
          name: 'Concurrency Leave Type',
          annualQuota: new Decimal(1.0),
          status: 'ACTIVE',
        },
      });

      await tx.leaveBalance.create({
        data: {
          organizationId: orgId,
          employeeId: emp.id,
          leaveTypeId: lt.id,
          year: 2026,
          entitledDays: new Decimal(1.0),
          usedDays: new Decimal(0),
          pendingDays: new Decimal(0),
        },
      });
    });

    // Create user and link
    const concPassword = 'Password@123456';
    const pHash = await cryptoService.hashPassword(concPassword);
    await prisma.runInSystemContext(async (tx) => {
      let user = await tx.user.findFirst({
        where: { email: 'conc-user@bizpro.vn' },
      });
      if (!user) {
        user = await tx.user.create({
          data: {
            organizationId: orgId,
            email: 'conc-user@bizpro.vn',
            passwordHash: pHash,
            fullName: 'Conc User',
            employeeId: concEmployeeId,
            status: 'ACTIVE',
          },
        });
      } else {
        await tx.user.update({
          where: { id: user.id },
          data: { employeeId: concEmployeeId },
        });
      }

      const empRole = await tx.role.findFirst({
        where: { organizationId: orgId, code: 'EMPLOYEE' },
      });
      if (empRole) {
        await tx.userRole.upsert({
          where: { userId_roleId: { userId: user.id, roleId: empRole.id } },
          create: { userId: user.id, roleId: empRole.id },
          update: {},
        });
      }
    });

    const concLogin = await authService.login(
      { email: 'conc-user@bizpro.vn', password: concPassword },
      { userAgent: 'Jest-E2E' },
    );
    const concToken = concLogin.accessToken;

    const concLt = await prisma.runInTenantContext(orgId, async (tx) => {
      return tx.leaveType.findFirst({ where: { organizationId: orgId, code: 'CONC-LT' } });
    });

    // 2. Fire 10 simultaneous leave requests each requesting 1.0 day
    const requests = Array.from({ length: 10 }).map((_, i) =>
      request(app.getHttpServer())
        .post('/api/hrm/leave/requests')
        .set('Authorization', `Bearer ${concToken}`)
        .send({
          leaveTypeId: concLt?.id,
          startDate: `2026-12-1${i}`,
          endDate: `2026-12-1${i}`,
          totalDays: 1.0,
          reason: `Concurrent Request #${i + 1}`,
        }),
    );

    const results = await Promise.allSettled(requests);

    let successCount = 0;
    let failedCount = 0;

    for (const res of results) {
      if (res.status === 'fulfilled') {
        if (res.value.status === 201) successCount++;
        else if (res.value.status === 400) failedCount++;
      }
    }

    expect(successCount).toBe(1);
    expect(failedCount).toBe(9);

    // Verify final database state: pendingDays = 1.0, available = 0.0, zero negative
    const finalBalance = await prisma.runInTenantContext(orgId, async (tx) => {
      return tx.leaveBalance.findFirst({
        where: {
          organizationId: orgId,
          employeeId: concEmployeeId,
          leaveTypeId: concLt?.id,
          year: 2026,
        },
      });
    });

    expect(Number(finalBalance?.pendingDays)).toBe(1.0);
    expect(Number(finalBalance?.usedDays)).toBe(0.0);
    const available =
      Number(finalBalance?.entitledDays) -
      Number(finalBalance?.usedDays) -
      Number(finalBalance?.pendingDays);
    expect(available).toBe(0.0);
  });

  // ==========================================
  // TC-HRM-12: Multi-Tenant Isolation & RLS Security
  // ==========================================
  it('TC-HRM-12: should enforce strict tenant isolation across organizations', async () => {
    // 1. Other Org user attempts to query Primary Org employees -> returns 0 items for Org A
    const otherEmpRes = await request(app.getHttpServer())
      .get('/api/hrm/employees')
      .set('Authorization', `Bearer ${otherOrgToken}`)
      .expect(200);

    const hasOrgAEmployee = otherEmpRes.body.data.items.some(
      (e: any) => e.id === testEmployeeId,
    );
    expect(hasOrgAEmployee).toBe(false);

    // 2. Other Org user attempts to access Org A employee by ID -> 404 Not Found
    await request(app.getHttpServer())
      .get(`/api/hrm/employees/${testEmployeeId}`)
      .set('Authorization', `Bearer ${otherOrgToken}`)
      .expect(404);

    // 3. Other Org user attempts to approve Org A leave request -> 404 Not Found
    const orgALeaveReq = await prisma.runInTenantContext(orgId, async (tx) => {
      return tx.leaveRequest.findFirst({ where: { organizationId: orgId } });
    });

    if (orgALeaveReq) {
      await request(app.getHttpServer())
        .post(`/api/hrm/leave/requests/${orgALeaveReq.id}/approve`)
        .set('Authorization', `Bearer ${otherOrgToken}`)
        .send({})
        .expect(404);
    }
  });
});
