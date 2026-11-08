import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { HrmService } from './hrm.service';
import {
  CreateDepartmentDto,
  CreatePositionDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/permissions.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('hrm')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HrmController {
  constructor(
    private readonly hrmService: HrmService,
    private readonly prisma: PrismaService,
  ) {}

  private async getContext(req: any) {
    let orgId = req.user?.organizationId || req.user?.orgId;
    let userId = req.user?.id || req.user?.userId;

    if (!orgId || !userId) {
      const org = await this.prisma.runInSystemContext((tx) =>
        tx.organization.findFirst({ select: { id: true } }),
      );
      const user = await this.prisma.runInSystemContext((tx) =>
        tx.user.findFirst({ select: { id: true } }),
      );
      orgId = orgId || org?.id;
      userId = userId || user?.id;
    }

    return { orgId, userId };
  }

  // ==========================================
  // DEPARTMENTS
  // ==========================================
  @Get('departments')
  @RequirePermissions('hrm.departments.view')
  async getDepartments(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.hrmService.getDepartments(orgId);
  }

  @Post('departments')
  @RequirePermissions('hrm.departments.manage')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createDepartment(@Body() dto: CreateDepartmentDto, @Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.hrmService.createDepartment(orgId, dto);
  }

  // ==========================================
  // POSITIONS
  // ==========================================
  @Get('positions')
  @RequirePermissions('hrm.positions.view')
  async getPositions(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.hrmService.getPositions(orgId);
  }

  @Post('positions')
  @RequirePermissions('hrm.positions.manage')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createPosition(@Body() dto: CreatePositionDto, @Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.hrmService.createPosition(orgId, dto);
  }

  // ==========================================
  // EMPLOYEES
  // ==========================================
  @Get('employees')
  @RequirePermissions('hrm.employees.view')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getEmployees(@Query() query: QueryEmployeeDto, @Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.hrmService.getEmployees(orgId, query);
  }

  @Get('employees/:id')
  @RequirePermissions('hrm.employees.view')
  async getEmployeeById(@Param('id') id: string, @Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.hrmService.getEmployeeById(orgId, id);
  }

  @Post('employees')
  @RequirePermissions('hrm.employees.manage')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createEmployee(@Body() dto: CreateEmployeeDto, @Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.hrmService.createEmployee(orgId, dto);
  }

  @Patch('employees/:id')
  @RequirePermissions('hrm.employees.manage')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateEmployee(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @Req() req: any,
  ) {
    const { orgId } = await this.getContext(req);
    return this.hrmService.updateEmployee(orgId, id, dto);
  }

  // ==========================================
  // ATTENDANCE
  // ==========================================
  @Get('attendance')
  @RequirePermissions('hrm.attendance.view_my')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getAttendanceRecords(@Query() query: QueryAttendanceDto, @Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.hrmService.getAttendanceRecords(orgId, query);
  }

  @Post('attendance/check-in')
  @RequirePermissions('hrm.attendance.clock')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async checkIn(@Body() dto: CheckInDto, @Req() req: any) {
    const { orgId, userId } = await this.getContext(req);
    return this.hrmService.checkIn(orgId, userId, dto);
  }

  @Post('attendance/check-out')
  @RequirePermissions('hrm.attendance.clock')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async checkOut(@Body() dto: CheckOutDto, @Req() req: any) {
    const { orgId, userId } = await this.getContext(req);
    return this.hrmService.checkOut(orgId, userId, dto);
  }

  @Post('attendance/:id/adjust')
  @RequirePermissions('hrm.attendance.manage')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async adjustAttendance(
    @Param('id') id: string,
    @Body() dto: AdjustAttendanceDto,
    @Req() req: any,
  ) {
    const { orgId, userId } = await this.getContext(req);
    return this.hrmService.adjustAttendance(orgId, id, dto, userId);
  }

  // ==========================================
  // LEAVE MANAGEMENT
  // ==========================================
  @Get('leave/types')
  @RequirePermissions('hrm.leave.request')
  async getLeaveTypes(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.hrmService.getLeaveTypes(orgId);
  }

  @Post('leave/types')
  @RequirePermissions('hrm.leave.manage')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createLeaveType(@Body() dto: CreateLeaveTypeDto, @Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.hrmService.createLeaveType(orgId, dto);
  }

  @Get('leave/balances/my')
  @RequirePermissions('hrm.leave.request')
  async getMyLeaveBalances(@Query('year') year: string, @Req() req: any) {
    const { orgId, userId } = await this.getContext(req);
    const targetYear = year ? parseInt(year, 10) : undefined;
    return this.hrmService.getMyLeaveBalances(orgId, userId, targetYear);
  }

  @Get('leave/requests')
  @RequirePermissions('hrm.leave.request')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async getLeaveRequests(@Query() query: QueryLeaveDto, @Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.hrmService.getLeaveRequests(orgId, query);
  }

  @Post('leave/requests')
  @RequirePermissions('hrm.leave.request')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createLeaveRequest(@Body() dto: CreateLeaveRequestDto, @Req() req: any) {
    const { orgId, userId } = await this.getContext(req);
    return this.hrmService.createLeaveRequest(orgId, userId, dto);
  }

  @Post('leave/requests/:id/approve')
  @RequirePermissions('hrm.leave.approve')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async approveLeaveRequest(
    @Param('id') id: string,
    @Body() dto: ApproveLeaveRequestDto,
    @Req() req: any,
  ) {
    const { orgId, userId } = await this.getContext(req);
    return this.hrmService.approveLeaveRequest(orgId, id, userId, dto);
  }

  @Post('leave/requests/:id/reject')
  @RequirePermissions('hrm.leave.approve')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async rejectLeaveRequest(
    @Param('id') id: string,
    @Body() dto: RejectLeaveRequestDto,
    @Req() req: any,
  ) {
    const { orgId, userId } = await this.getContext(req);
    return this.hrmService.rejectLeaveRequest(orgId, id, userId, dto);
  }

  @Post('leave/requests/:id/cancel')
  @RequirePermissions('hrm.leave.request')
  @HttpCode(HttpStatus.OK)
  async cancelLeaveRequest(@Param('id') id: string, @Req() req: any) {
    const { orgId, userId } = await this.getContext(req);
    return this.hrmService.cancelLeaveRequest(orgId, id, userId);
  }
}
