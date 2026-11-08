import { Controller, Get, Req, UseGuards } from '@nestjs/common';
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

  /**
   * GET /api/reports/dashboard
   */
  @Get('dashboard')
  async getDashboardOverview(@Req() req: any) {
    const { orgId } = await this.getContext(req);
    return this.reportsService.getDashboardOverview(orgId);
  }
}
