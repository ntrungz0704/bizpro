import { Controller, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly prisma: PrismaService,
  ) {}

  private getContext(req: any) {
    const orgId = req.user?.organizationId || req.user?.orgId;
    const userId = req.user?.id || req.user?.userId;

    if (!orgId || !userId) {
      throw new UnauthorizedException(
        'Yêu cầu xác thực: Không tìm thấy thông tin tổ chức hoặc người dùng hợp lệ trong phiên đăng nhập',
      );
    }

    return { orgId, userId };
  }

  /**
   * GET /api/reports/dashboard
   */
  @Get('dashboard')
  async getDashboardOverview(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.reportsService.getDashboardOverview(orgId);
  }
}
