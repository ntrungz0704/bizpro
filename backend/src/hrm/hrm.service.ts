import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreatePositionDto,
  UpdatePositionDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateWorkShiftDto,
  CheckInDto,
  CheckOutDto,
  AdjustAttendanceDto,
  CreateLeaveTypeDto,
  CreateLeaveRequestDto,
  ApproveLeaveRequestDto,
  RejectLeaveRequestDto,
  QueryEmployeeDto,
  QueryAttendanceDto,
  QueryLeaveDto,
} from './dto/hrm.dto';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class HrmService implements OnApplicationBootstrap {
  private readonly logger = new Logger(HrmService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    await this.seedHrmMasterData();
  }

  /**
   * Helper to execute with Bounded Retry (up to 3 times) on deadlock (40P01)
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
  ): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await operation();
      } catch (error: any) {
        attempt++;
        const isDeadlock =
          error?.code === 'P2034' ||
          error?.message?.includes('deadlock detected') ||
          error?.message?.includes('40P01');

        if (isDeadlock && attempt < maxRetries) {
          const backoff = Math.floor(Math.random() * 200) + 50 * attempt;
          this.logger.warn(
            `Deadlock detected in HRM on attempt ${attempt}. Retrying in ${backoff}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded for transaction');
  }

  /**
   * Helper to get Vietnam local date string (YYYY-MM-DD)
   */
  public getVietnamDateString(date = new Date()): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  }

  /**
   * Helper to get Vietnam local year
   */
  public getVietnamYear(date = new Date()): number {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
    });
    return parseInt(formatter.format(date), 10);
  }

  /**
   * Seed default HRM Master Data for BIZPRO-CORP
   */
  async seedHrmMasterData() {
    this.logger.log('Seeding default HRM Master Data (Shift, Leave Types)...');
    const defaultOrg = await this.prisma.runInSystemContext(async (tx) => {
      return tx.organization.findFirst({
        where: { code: 'BIZPRO-CORP' },
      });
    });
    if (!defaultOrg) return;

    await this.prisma.runInTenantContext(defaultOrg.id, async (tx) => {
      // 1. Standard Work Shift (08:30 - 17:30, 60m break)
      const existingShift = await tx.workShift.findFirst({
        where: { organizationId: defaultOrg.id, code: 'CA-HANH-CHINH' },
      });
      if (!existingShift) {
        const dummyDate = '1970-01-01';
        await tx.workShift.create({
          data: {
            organizationId: defaultOrg.id,
            name: 'Ca Hành chính Tiêu chuẩn',
            code: 'CA-HANH-CHINH',
            startTime: new Date(`${dummyDate}T08:30:00Z`),
            endTime: new Date(`${dummyDate}T17:30:00Z`),
            breakDurationMinutes: 60,
            status: 'ACTIVE',
          },
        });
      }

      // 2. Default Leave Types (Annual, Sick, Unpaid)
      const leaveTypes = [
        { code: 'AL', name: 'Nghỉ phép năm', annualQuota: new Decimal(12.0), isPaid: true },
        { code: 'SL', name: 'Nghỉ ốm hưởng BHXH', annualQuota: new Decimal(30.0), isPaid: false },
        { code: 'UL', name: 'Nghỉ không lương', annualQuota: new Decimal(0.0), isPaid: false },
      ];

      for (const lt of leaveTypes) {
        const existing = await tx.leaveType.findFirst({
          where: { organizationId: defaultOrg.id, code: lt.code },
        });
        if (!existing) {
          await tx.leaveType.create({
            data: {
              organizationId: defaultOrg.id,
              name: lt.name,
              code: lt.code,
              annualQuota: lt.annualQuota,
              isPaid: lt.isPaid,
              status: 'ACTIVE',
            },
          });
        }
      }

      // 3. Default Positions
      const positions = [
        { code: 'DIRECTOR', name: 'Giám đốc' },
        { code: 'MANAGER', name: 'Trưởng phòng' },
        { code: 'TEAM_LEAD', name: 'Trưởng nhóm' },
        { code: 'SENIOR_STAFF', name: 'Chuyên viên cao cấp' },
        { code: 'STAFF', name: 'Nhân viên' },
      ];

      for (const p of positions) {
        const existing = await tx.position.findFirst({
          where: { organizationId: defaultOrg.id, code: p.code },
        });
        if (!existing) {
          await tx.position.create({
            data: {
              organizationId: defaultOrg.id,
              name: p.name,
              code: p.code,
              status: 'ACTIVE',
            },
          });
        }
      }
    });
  }

  /**
   * Helper to resolve employee from userId
   */
  public async getEmployeeForUser(tx: any, orgId: string, userId: string) {
    const user = await tx.user.findFirst({
      where: { id: userId, organizationId: orgId },
      include: { employee: true },
    });
    if (user?.employee) {
      return user.employee;
    }
    if (user?.email) {
      const emp = await tx.employee.findFirst({
        where: { organizationId: orgId, email: user.email },
      });
      if (emp) return emp;
    }
    return null;
  }

  // ==========================================
  // 1. DEPARTMENTS
  // ==========================================
  async getDepartments(orgId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      return tx.department.findMany({
        where: { organizationId: orgId },
        include: {
          subDepartments: true,
          _count: { select: { employees: true } },
        },
        orderBy: { code: 'asc' },
      });
    });
  }

  async createDepartment(orgId: string, dto: CreateDepartmentDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const existing = await tx.department.findFirst({
        where: { organizationId: orgId, code: dto.code },
      });
      if (existing) {
        throw new BadRequestException(`Mã phòng ban ${dto.code} đã tồn tại trong tổ chức`);
      }

      return tx.department.create({
        data: {
          organizationId: orgId,
          code: dto.code,
          name: dto.name,
          parentDepartmentId: dto.parentDepartmentId,
          managerEmployeeId: dto.managerEmployeeId,
          status: 'ACTIVE',
        },
      });
    });
  }

  // ==========================================
  // 2. POSITIONS
  // ==========================================
  async getPositions(orgId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      return tx.position.findMany({
        where: { organizationId: orgId },
        include: {
          _count: { select: { employees: true } },
        },
        orderBy: { code: 'asc' },
      });
    });
  }

  async createPosition(orgId: string, dto: CreatePositionDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const existing = await tx.position.findFirst({
        where: { organizationId: orgId, code: dto.code },
      });
      if (existing) {
        throw new BadRequestException(`Mã chức vụ ${dto.code} đã tồn tại trong tổ chức`);
      }

      return tx.position.create({
        data: {
          organizationId: orgId,
          code: dto.code,
          name: dto.name,
          description: dto.description,
          status: 'ACTIVE',
        },
      });
    });
  }

  // ==========================================
  // 3. EMPLOYEES
  // ==========================================
  async getEmployees(orgId: string, query: QueryEmployeeDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      const where: Prisma.EmployeeWhereInput = {
        organizationId: orgId,
      };

      if (query.departmentId) {
        where.departmentId = query.departmentId;
      }
      if (query.employmentStatus) {
        where.employmentStatus = query.employmentStatus as any;
      }
      if (query.search) {
        const s = query.search.trim();
        where.OR = [
          { employeeCode: { contains: s, mode: 'insensitive' } },
          { fullName: { contains: s, mode: 'insensitive' } },
          { email: { contains: s, mode: 'insensitive' } },
          { phone: { contains: s, mode: 'insensitive' } },
        ];
      }

      const [total, items] = await Promise.all([
        tx.employee.count({ where }),
        tx.employee.findMany({
          where,
          include: {
            department: { select: { id: true, code: true, name: true } },
            position: { select: { id: true, code: true, name: true } },
            manager: { select: { id: true, employeeCode: true, fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      return {
        items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  async getEmployeeById(orgId: string, id: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const employee = await tx.employee.findFirst({
        where: { id, organizationId: orgId },
        include: {
          department: true,
          position: true,
          manager: true,
          contracts: { orderBy: { startDate: 'desc' } },
          leaveBalances: {
            include: { leaveType: true },
            orderBy: { year: 'desc' },
          },
        },
      });
      if (!employee) {
        throw new NotFoundException(`Không tìm thấy nhân viên với ID ${id}`);
      }
      return employee;
    });
  }

  async createEmployee(orgId: string, dto: CreateEmployeeDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const existing = await tx.employee.findFirst({
        where: { organizationId: orgId, employeeCode: dto.employeeCode },
      });
      if (existing) {
        throw new BadRequestException(`Mã nhân viên ${dto.employeeCode} đã tồn tại trong tổ chức`);
      }

      const existingEmail = await tx.employee.findFirst({
        where: { organizationId: orgId, email: dto.email.toLowerCase() },
      });
      if (existingEmail) {
        throw new BadRequestException(`Email ${dto.email} đã được sử dụng bởi nhân viên khác`);
      }

      const employee = await tx.employee.create({
        data: {
          organizationId: orgId,
          employeeCode: dto.employeeCode,
          fullName: dto.fullName,
          email: dto.email.toLowerCase(),
          phone: dto.phone,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          gender: dto.gender,
          address: dto.address,
          departmentId: dto.departmentId,
          positionId: dto.positionId,
          managerEmployeeId: dto.managerEmployeeId,
          hireDate: new Date(dto.hireDate),
          employmentStatus: dto.employmentStatus || 'OFFICIAL',
        },
      });

      // Auto initialize default leave balances for current year
      const currentYear = this.getVietnamYear();
      const annualLeaveType = await tx.leaveType.findFirst({
        where: { organizationId: orgId, code: 'AL' },
      });

      if (annualLeaveType) {
        await tx.leaveBalance.create({
          data: {
            organizationId: orgId,
            employeeId: employee.id,
            leaveTypeId: annualLeaveType.id,
            year: currentYear,
            entitledDays: annualLeaveType.annualQuota,
            usedDays: new Decimal(0),
            pendingDays: new Decimal(0),
          },
        });
      }

      return employee;
    });
  }

  async updateEmployee(orgId: string, id: string, dto: UpdateEmployeeDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const employee = await tx.employee.findFirst({
        where: { id, organizationId: orgId },
      });
      if (!employee) {
        throw new NotFoundException(`Không tìm thấy nhân viên với ID ${id}`);
      }

      const updated = await tx.employee.update({
        where: { id },
        data: {
          fullName: dto.fullName ?? employee.fullName,
          phone: dto.phone ?? employee.phone,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : employee.dateOfBirth,
          gender: dto.gender ?? employee.gender,
          address: dto.address ?? employee.address,
          departmentId: dto.departmentId ?? employee.departmentId,
          positionId: dto.positionId ?? employee.positionId,
          managerEmployeeId: dto.managerEmployeeId ?? employee.managerEmployeeId,
          hireDate: dto.hireDate ? new Date(dto.hireDate) : employee.hireDate,
          employmentStatus: dto.employmentStatus ?? employee.employmentStatus,
        },
      });

      return updated;
    });
  }

  // ==========================================
  // 4. TIME & ATTENDANCE
  // ==========================================
  async getAttendanceRecords(orgId: string, query: QueryAttendanceDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      const where: Prisma.AttendanceRecordWhereInput = {
        organizationId: orgId,
      };

      if (query.employeeId) {
        where.employeeId = query.employeeId;
      }
      if (query.departmentId) {
        where.employee = { departmentId: query.departmentId };
      }
      if (query.startDate && query.endDate) {
        where.workDate = {
          gte: new Date(query.startDate),
          lte: new Date(query.endDate),
        };
      } else if (query.startDate) {
        where.workDate = { gte: new Date(query.startDate) };
      }

      const [total, items] = await Promise.all([
        tx.attendanceRecord.count({ where }),
        tx.attendanceRecord.findMany({
          where,
          include: {
            employee: {
              select: {
                id: true,
                employeeCode: true,
                fullName: true,
                department: { select: { name: true } },
              },
            },
            shift: true,
          },
          orderBy: [{ workDate: 'desc' }, { checkInAt: 'desc' }],
          skip,
          take: limit,
        }),
      ]);

      return {
        items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  async checkIn(orgId: string, userId: string, dto: CheckInDto) {
    return this.executeWithRetry(async () => {
      return this.prisma.runInTenantContext(orgId, async (tx) => {
        let employee = await this.getEmployeeForUser(tx, orgId, userId);
        if (!employee) {
          // If no employee record linked, find or create one for testing/demo
          employee = await tx.employee.findFirst({ where: { organizationId: orgId } });
        }
        if (!employee) {
          throw new BadRequestException('Tài khoản chưa được liên kết với hồ sơ nhân viên');
        }

        const todayStr = this.getVietnamDateString();
        const workDate = new Date(`${todayStr}T00:00:00.000Z`);

        // Check if attendance record already exists for today
        const existing = await tx.attendanceRecord.findFirst({
          where: {
            organizationId: orgId,
            employeeId: employee.id,
            workDate: workDate,
          },
        });

        if (existing && existing.checkInAt) {
          throw new BadRequestException('Nhân viên đã thực hiện Check-in cho ngày hôm nay');
        }

        const now = new Date();
        const shift = await tx.workShift.findFirst({
          where: { organizationId: orgId, code: 'CA-HANH-CHINH' },
        });

        // Determine status based on standard 08:30 shift (15 min grace period -> 08:45)
        const vnHour = parseInt(
          new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: 'numeric',
            hour12: false,
          }).format(now),
          10,
        );
        const vnMin = parseInt(
          new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Ho_Chi_Minh',
            minute: 'numeric',
          }).format(now),
          10,
        );

        let status: any = 'PRESENT';
        if (vnHour > 8 || (vnHour === 8 && vnMin > 45)) {
          status = 'LATE';
        }

        if (existing) {
          return tx.attendanceRecord.update({
            where: { id: existing.id },
            data: {
              checkInAt: now,
              status,
              source: dto.source || 'WEB_UI',
            },
          });
        }

        return tx.attendanceRecord.create({
          data: {
            organizationId: orgId,
            employeeId: employee.id,
            shiftId: shift?.id,
            workDate,
            checkInAt: now,
            status,
            source: dto.source || 'WEB_UI',
          },
        });
      });
    });
  }

  async checkOut(orgId: string, userId: string, dto: CheckOutDto) {
    return this.executeWithRetry(async () => {
      return this.prisma.runInTenantContext(orgId, async (tx) => {
        let employee = await this.getEmployeeForUser(tx, orgId, userId);
        if (!employee) {
          employee = await tx.employee.findFirst({ where: { organizationId: orgId } });
        }
        if (!employee) {
          throw new BadRequestException('Tài khoản chưa được liên kết với hồ sơ nhân viên');
        }

        const todayStr = this.getVietnamDateString();
        const workDate = new Date(`${todayStr}T00:00:00.000Z`);

        const existing = await tx.attendanceRecord.findFirst({
          where: {
            organizationId: orgId,
            employeeId: employee.id,
            workDate: workDate,
          },
        });

        if (!existing || !existing.checkInAt) {
          throw new BadRequestException('Chưa có bản ghi Check-in cho ngày hôm nay để Check-out');
        }

        if (existing.checkOutAt) {
          throw new BadRequestException('Nhân viên đã thực hiện Check-out cho ngày hôm nay');
        }

        const now = new Date();
        const vnHour = parseInt(
          new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: 'numeric',
            hour12: false,
          }).format(now),
          10,
        );

        let status = existing.status;
        if (vnHour < 17 && status === 'PRESENT') {
          status = 'EARLY_LEAVE';
        }

        return tx.attendanceRecord.update({
          where: { id: existing.id },
          data: {
            checkOutAt: now,
            status,
          },
        });
      });
    });
  }

  async adjustAttendance(
    orgId: string,
    id: string,
    dto: AdjustAttendanceDto,
    adjusterUserId: string,
  ) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const record = await tx.attendanceRecord.findFirst({
        where: { id, organizationId: orgId },
      });
      if (!record) {
        throw new NotFoundException(`Không tìm thấy bản ghi chấm công ${id}`);
      }

      return tx.attendanceRecord.update({
        where: { id },
        data: {
          checkInAt: dto.checkInAt ? new Date(dto.checkInAt) : record.checkInAt,
          checkOutAt: dto.checkOutAt ? new Date(dto.checkOutAt) : record.checkOutAt,
          status: dto.status || record.status,
          adjustedBy: adjusterUserId,
          adjustmentReason: dto.adjustmentReason,
        },
      });
    });
  }

  // ==========================================
  // 5. LEAVE MANAGEMENT (PESSIMISTIC LOCKING)
  // ==========================================
  async getLeaveTypes(orgId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      return tx.leaveType.findMany({
        where: { organizationId: orgId },
        orderBy: { code: 'asc' },
      });
    });
  }

  async createLeaveType(orgId: string, dto: CreateLeaveTypeDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const existing = await tx.leaveType.findFirst({
        where: { organizationId: orgId, code: dto.code },
      });
      if (existing) {
        throw new BadRequestException(`Mã loại nghỉ phép ${dto.code} đã tồn tại`);
      }

      return tx.leaveType.create({
        data: {
          organizationId: orgId,
          code: dto.code,
          name: dto.name,
          annualQuota: new Decimal(dto.annualQuota),
          isPaid: dto.isPaid ?? true,
          status: 'ACTIVE',
        },
      });
    });
  }

  async getMyLeaveBalances(orgId: string, userId: string, targetYear?: number) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      let employee = await this.getEmployeeForUser(tx, orgId, userId);
      if (!employee) {
        employee = await tx.employee.findFirst({ where: { organizationId: orgId } });
      }
      if (!employee) {
        throw new BadRequestException('Tài khoản chưa được liên kết với hồ sơ nhân viên');
      }

      const year = targetYear || this.getVietnamYear();

      let balances = await tx.leaveBalance.findMany({
        where: {
          organizationId: orgId,
          employeeId: employee.id,
          year,
        },
        include: { leaveType: true },
      });

      // Auto initialize default annual leave if empty
      if (balances.length === 0) {
        const annualType = await tx.leaveType.findFirst({
          where: { organizationId: orgId, code: 'AL' },
        });
        if (annualType) {
          const newBal = await tx.leaveBalance.create({
            data: {
              organizationId: orgId,
              employeeId: employee.id,
              leaveTypeId: annualType.id,
              year,
              entitledDays: annualType.annualQuota,
              usedDays: new Decimal(0),
              pendingDays: new Decimal(0),
            },
            include: { leaveType: true },
          });
          balances = [newBal];
        }
      }

      return balances.map((b) => {
        const entitled = Number(b.entitledDays);
        const used = Number(b.usedDays);
        const pending = Number(b.pendingDays);
        const available = entitled - used - pending;
        return {
          id: b.id,
          year: b.year,
          leaveTypeId: b.leaveTypeId,
          leaveTypeName: b.leaveType?.name,
          leaveTypeCode: b.leaveType?.code,
          entitledDays: entitled,
          usedDays: used,
          pendingDays: pending,
          availableDays: Math.max(0, available),
        };
      });
    });
  }

  async getLeaveRequests(orgId: string, query: QueryLeaveDto) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      const where: Prisma.LeaveRequestWhereInput = {
        organizationId: orgId,
      };

      if (query.status) {
        where.status = query.status as any;
      }
      if (query.employeeId) {
        where.employeeId = query.employeeId;
      }

      const [total, items] = await Promise.all([
        tx.leaveRequest.count({ where }),
        tx.leaveRequest.findMany({
          where,
          include: {
            employee: { select: { id: true, employeeCode: true, fullName: true, email: true } },
            leaveType: true,
            approver: { select: { id: true, employeeCode: true, fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      return {
        items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    });
  }

  /**
   * CREATE LEAVE REQUEST WITH PESSIMISTIC LOCKING (SELECT FOR UPDATE)
   */
  async createLeaveRequest(orgId: string, userId: string, dto: CreateLeaveRequestDto) {
    return this.executeWithRetry(async () => {
      return this.prisma.runInTenantContext(orgId, async (tx) => {
        let employee = await this.getEmployeeForUser(tx, orgId, userId);
        if (!employee) {
          employee = await tx.employee.findFirst({ where: { organizationId: orgId } });
        }
        if (!employee) {
          throw new BadRequestException('Tài khoản chưa được liên kết với nhân viên nào');
        }

        const start = new Date(dto.startDate);
        const end = new Date(dto.endDate);
        if (start > end) {
          throw new BadRequestException('Ngày bắt đầu nghỉ phải trước hoặc bằng ngày kết thúc');
        }

        const year = start.getFullYear();

        // 1. Pessimistic Lock on LeaveBalance using SELECT FOR UPDATE
        let balanceRows: any[] = await tx.$queryRaw`
          SELECT id, entitled_days, used_days, pending_days
          FROM leave_balances
          WHERE organization_id = ${orgId}::uuid
            AND employee_id = ${employee.id}::uuid
            AND leave_type_id = ${dto.leaveTypeId}::uuid
            AND year = ${year}
          FOR UPDATE;
        `;

        if (balanceRows.length === 0) {
          // Initialize balance if not yet exists
          const lt = await tx.leaveType.findFirst({
            where: { id: dto.leaveTypeId, organizationId: orgId },
          });
          if (!lt) {
            throw new NotFoundException('Không tìm thấy loại nghỉ phép');
          }
          await tx.leaveBalance.create({
            data: {
              organizationId: orgId,
              employeeId: employee.id,
              leaveTypeId: lt.id,
              year,
              entitledDays: lt.annualQuota,
              usedDays: new Decimal(0),
              pendingDays: new Decimal(0),
            },
          });

          balanceRows = await tx.$queryRaw`
            SELECT id, entitled_days, used_days, pending_days
            FROM leave_balances
            WHERE organization_id = ${orgId}::uuid
              AND employee_id = ${employee.id}::uuid
              AND leave_type_id = ${dto.leaveTypeId}::uuid
              AND year = ${year}
            FOR UPDATE;
          `;
        }

        const lockedBalance = balanceRows[0];
        const entitled = Number(lockedBalance.entitled_days);
        const used = Number(lockedBalance.used_days);
        const pending = Number(lockedBalance.pending_days);
        const available = entitled - used - pending;

        if (available < dto.totalDays) {
          throw new BadRequestException(
            `Số ngày phép khả dụng không đủ (Còn: ${available.toFixed(1)} ngày, Yêu cầu: ${dto.totalDays} ngày)`,
          );
        }

        // 2. Atomically Increment pending_days
        const newPending = pending + dto.totalDays;
        await tx.$executeRaw`
          UPDATE leave_balances
          SET pending_days = ${newPending}::numeric,
              updated_at = NOW()
          WHERE id = ${lockedBalance.id}::uuid;
        `;

        // 3. Create Leave Request in PENDING status
        const request = await tx.leaveRequest.create({
          data: {
            organizationId: orgId,
            employeeId: employee.id,
            leaveTypeId: dto.leaveTypeId,
            startDate: start,
            endDate: end,
            totalDays: new Decimal(dto.totalDays),
            reason: dto.reason,
            status: 'PENDING',
          },
          include: {
            leaveType: true,
            employee: { select: { id: true, employeeCode: true, fullName: true } },
          },
        });

        return request;
      });
    });
  }

  /**
   * APPROVE LEAVE REQUEST (ATOMIC + PESSIMISTIC LOCKING)
   * Anti-Self-Approval: Approver CANNOT be the employee requesting leave!
   */
  async approveLeaveRequest(
    orgId: string,
    id: string,
    approverUserId: string,
    dto: ApproveLeaveRequestDto,
  ) {
    return this.executeWithRetry(async () => {
      return this.prisma.runInTenantContext(orgId, async (tx) => {
        // 1. Lock the leave request
        const reqRows: any[] = await tx.$queryRaw`
          SELECT id, organization_id, employee_id, leave_type_id, total_days, status, start_date
          FROM leave_requests
          WHERE id = ${id}::uuid AND organization_id = ${orgId}::uuid
          FOR UPDATE;
        `;

        if (reqRows.length === 0) {
          throw new NotFoundException(`Không tìm thấy đơn nghỉ phép với ID ${id}`);
        }

        const req = reqRows[0];
        if (req.status !== 'PENDING') {
          throw new BadRequestException(
            `Đơn nghỉ phép không ở trạng thái chờ duyệt (Trạng thái hiện tại: ${req.status})`,
          );
        }

        // Anti-Self-Approval Check
        const approverEmployee = await this.getEmployeeForUser(tx, orgId, approverUserId);
        if (approverEmployee && approverEmployee.id === req.employee_id) {
          throw new BadRequestException(
            'Nhân viên không thể tự phê duyệt đơn xin nghỉ phép của chính mình',
          );
        }

        const totalDays = Number(req.total_days);
        const year = new Date(req.start_date).getFullYear();

        // 2. Lock leave balance
        const balanceRows: any[] = await tx.$queryRaw`
          SELECT id, entitled_days, used_days, pending_days
          FROM leave_balances
          WHERE organization_id = ${orgId}::uuid
            AND employee_id = ${req.employee_id}::uuid
            AND leave_type_id = ${req.leave_type_id}::uuid
            AND year = ${year}
          FOR UPDATE;
        `;

        if (balanceRows.length > 0) {
          const bal = balanceRows[0];
          const newPending = Math.max(0, Number(bal.pending_days) - totalDays);
          const newUsed = Number(bal.used_days) + totalDays;

          await tx.$executeRaw`
            UPDATE leave_balances
            SET pending_days = ${newPending}::numeric,
                used_days = ${newUsed}::numeric,
                updated_at = NOW()
            WHERE id = ${bal.id}::uuid;
          `;
        }

        // 3. Update Leave Request to APPROVED
        const updated = await tx.leaveRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approverEmployeeId: approverEmployee ? approverEmployee.id : null,
            approvedAt: new Date(),
          },
          include: {
            employee: true,
            leaveType: true,
            approver: true,
          },
        });

        return updated;
      });
    });
  }

  /**
   * REJECT LEAVE REQUEST (ATOMIC + PESSIMISTIC LOCKING)
   */
  async rejectLeaveRequest(
    orgId: string,
    id: string,
    approverUserId: string,
    dto: RejectLeaveRequestDto,
  ) {
    return this.executeWithRetry(async () => {
      return this.prisma.runInTenantContext(orgId, async (tx) => {
        const reqRows: any[] = await tx.$queryRaw`
          SELECT id, organization_id, employee_id, leave_type_id, total_days, status, start_date
          FROM leave_requests
          WHERE id = ${id}::uuid AND organization_id = ${orgId}::uuid
          FOR UPDATE;
        `;

        if (reqRows.length === 0) {
          throw new NotFoundException(`Không tìm thấy đơn nghỉ phép với ID ${id}`);
        }

        const req = reqRows[0];
        if (req.status !== 'PENDING') {
          throw new BadRequestException(
            `Đơn nghỉ phép không ở trạng thái chờ duyệt (Trạng thái hiện tại: ${req.status})`,
          );
        }

        const approverEmployee = await this.getEmployeeForUser(tx, orgId, approverUserId);
        if (approverEmployee && approverEmployee.id === req.employee_id) {
          throw new BadRequestException(
            'Nhân viên không thể tự từ chối đơn xin nghỉ phép của chính mình theo luồng duyệt',
          );
        }

        const totalDays = Number(req.total_days);
        const year = new Date(req.start_date).getFullYear();

        // Lock balance and refund pending_days
        const balanceRows: any[] = await tx.$queryRaw`
          SELECT id, pending_days
          FROM leave_balances
          WHERE organization_id = ${orgId}::uuid
            AND employee_id = ${req.employee_id}::uuid
            AND leave_type_id = ${req.leave_type_id}::uuid
            AND year = ${year}
          FOR UPDATE;
        `;

        if (balanceRows.length > 0) {
          const bal = balanceRows[0];
          const newPending = Math.max(0, Number(bal.pending_days) - totalDays);

          await tx.$executeRaw`
            UPDATE leave_balances
            SET pending_days = ${newPending}::numeric,
                updated_at = NOW()
            WHERE id = ${bal.id}::uuid;
          `;
        }

        const updated = await tx.leaveRequest.update({
          where: { id },
          data: {
            status: 'REJECTED',
            approverEmployeeId: approverEmployee ? approverEmployee.id : null,
            rejectionReason: dto.rejectionReason,
          },
          include: {
            employee: true,
            leaveType: true,
          },
        });

        return updated;
      });
    });
  }

  /**
   * CANCEL LEAVE REQUEST (ATOMIC + PESSIMISTIC LOCKING)
   * Prevents double release!
   */
  async cancelLeaveRequest(orgId: string, id: string, userId: string) {
    return this.executeWithRetry(async () => {
      return this.prisma.runInTenantContext(orgId, async (tx) => {
        let employee = await this.getEmployeeForUser(tx, orgId, userId);
        if (!employee) {
          employee = await tx.employee.findFirst({ where: { organizationId: orgId } });
        }

        const reqRows: any[] = await tx.$queryRaw`
          SELECT id, organization_id, employee_id, leave_type_id, total_days, status, start_date
          FROM leave_requests
          WHERE id = ${id}::uuid AND organization_id = ${orgId}::uuid
          FOR UPDATE;
        `;

        if (reqRows.length === 0) {
          throw new NotFoundException(`Không tìm thấy đơn nghỉ phép với ID ${id}`);
        }

        const req = reqRows[0];

        // Ensure user is the owner of the leave request (or HR Admin)
        if (employee && req.employee_id !== employee.id) {
          throw new ForbiddenException('Bạn chỉ có thể hủy đơn nghỉ phép của chính mình');
        }

        if (req.status === 'CANCELLED') {
          throw new BadRequestException('Đơn nghỉ phép này đã bị hủy trước đó');
        }
        if (req.status === 'REJECTED') {
          throw new BadRequestException('Không thể hủy đơn nghỉ phép đã bị từ chối');
        }

        const totalDays = Number(req.total_days);
        const year = new Date(req.start_date).getFullYear();

        // Lock balance
        const balanceRows: any[] = await tx.$queryRaw`
          SELECT id, used_days, pending_days
          FROM leave_balances
          WHERE organization_id = ${orgId}::uuid
            AND employee_id = ${req.employee_id}::uuid
            AND leave_type_id = ${req.leave_type_id}::uuid
            AND year = ${year}
          FOR UPDATE;
        `;

        if (balanceRows.length > 0) {
          const bal = balanceRows[0];
          if (req.status === 'PENDING') {
            // Revert pending_days
            const newPending = Math.max(0, Number(bal.pending_days) - totalDays);
            await tx.$executeRaw`
              UPDATE leave_balances
              SET pending_days = ${newPending}::numeric,
                  updated_at = NOW()
              WHERE id = ${bal.id}::uuid;
            `;
          } else if (req.status === 'APPROVED') {
            // Revert used_days (only if leave start_date is >= today)
            const todayStr = this.getVietnamDateString();
            const today = new Date(`${todayStr}T00:00:00.000Z`);
            if (new Date(req.start_date) < today) {
              throw new BadRequestException(
                'Không thể hủy đơn nghỉ phép đã diễn ra trong quá khứ',
              );
            }

            const newUsed = Math.max(0, Number(bal.used_days) - totalDays);
            await tx.$executeRaw`
              UPDATE leave_balances
              SET used_days = ${newUsed}::numeric,
                  updated_at = NOW()
              WHERE id = ${bal.id}::uuid;
            `;
          }
        }

        const updated = await tx.leaveRequest.update({
          where: { id },
          data: { status: 'CANCELLED' },
          include: {
            employee: true,
            leaveType: true,
          },
        });

        return updated;
      });
    });
  }
}
