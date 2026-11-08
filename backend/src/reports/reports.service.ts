import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Comprehensive cross-module Dashboard Metrics
   */
  async getDashboardOverview(orgId: string) {
    return this.prisma.runInTenantContext(orgId, async (tx) => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // 1. Sales & Revenue Summary
      const salesOrders = await tx.salesOrder.findMany({
        where: { organizationId: orgId },
        select: {
          id: true,
          status: true,
          totalAmount: true,
          orderDate: true,
          createdAt: true,
        },
      });

      const confirmedOrFulfilled = salesOrders.filter(
        (o) => o.status === 'CONFIRMED' || o.status === 'FULFILLED',
      );

      const totalRevenue = confirmedOrFulfilled.reduce(
        (sum, o) => sum + Number(o.totalAmount),
        0,
      );

      // Monthly Revenue for chart
      const monthlyData: { [key: number]: number } = {};
      for (let m = 0; m < 12; m++) monthlyData[m] = 0;

      confirmedOrFulfilled.forEach((o) => {
        const d = new Date(o.orderDate || o.createdAt);
        if (d.getFullYear() === currentYear) {
          const month = d.getMonth();
          monthlyData[month] = (monthlyData[month] || 0) + Number(o.totalAmount);
        }
      });

      const months = [
        'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
        'T7', 'T8', 'T9', 'T10', 'T11', 'T12',
      ];
      const revenueChart = months.map((mName, idx) => ({
        month: mName,
        revenue: monthlyData[idx] || 0,
      }));

      // 2. Customers Count
      const totalCustomers = await tx.customer.count({
        where: { organizationId: orgId },
      });

      // 3. Products & Inventory Alerts
      const products = await tx.product.findMany({
        where: { organizationId: orgId },
        include: {
          category: true,
          unit: true,
          inventoryBalances: true,
        },
      });

      let totalOnHand = 0;
      let totalReserved = 0;
      let totalInventoryVal = 0;

      const lowStockProducts: any[] = [];
      const categoryDistribution: { [cat: string]: number } = {};

      products.forEach((p) => {
        const onHand = p.inventoryBalances.reduce((s: number, b: any) => s + Number(b.onHand), 0);
        const reserved = p.inventoryBalances.reduce((s: number, b: any) => s + Number(b.reserved), 0);
        const available = onHand - reserved;
        const minStock = Number(p.minStockLevel) || 5;

        totalOnHand += onHand;
        totalReserved += reserved;
        totalInventoryVal += onHand * Number(p.costPrice || 0);

        const catName = p.category?.name || 'Khác';
        categoryDistribution[catName] =
          (categoryDistribution[catName] || 0) + Number(p.sellingPrice || 0) * onHand;

        if (available <= minStock) {
          lowStockProducts.push({
            id: p.id,
            sku: p.sku,
            name: p.name,
            available,
            minStock,
            uom: p.unit?.name || 'Cái',
          });
        }
      });

      const revenueStructure = Object.keys(categoryDistribution).map((name) => ({
        name,
        value: categoryDistribution[name],
      }));

      // 4. CRM Funnel
      const leadsCount = await tx.lead.count({
        where: { organizationId: orgId },
      });
      const deals = await tx.deal.findMany({
        where: { organizationId: orgId },
        include: { stage: true },
      });

      const wonDeals = deals.filter((d) => d.stage?.isWon);
      const lostDeals = deals.filter((d) => d.stage?.isLost);
      const activeDeals = deals.filter((d) => !d.stage?.isWon && !d.stage?.isLost);

      const crmFunnel = {
        leads: leadsCount,
        activeDeals: activeDeals.length,
        wonDeals: wonDeals.length,
        lostDeals: lostDeals.length,
        winRate:
          deals.length > 0
            ? Math.round((wonDeals.length / deals.length) * 100)
            : 0,
      };

      // 5. HRM Overview
      const totalEmployees = await tx.employee.count({
        where: { organizationId: orgId, employmentStatus: 'OFFICIAL' },
      });

      const todayAttendance = await tx.attendanceRecord.count({
        where: {
          organizationId: orgId,
          workDate: { gte: startOfToday },
        },
      });

      const onLeaveToday = await tx.leaveRequest.count({
        where: {
          organizationId: orgId,
          status: 'APPROVED',
          startDate: { lte: now },
          endDate: { gte: now },
        },
      });

      // 6. Recent Audit Activities
      const auditLogs = await tx.auditLog.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { user: { select: { fullName: true, email: true } } },
      });

      const recentActivities = auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entityName: log.entityType,
        user: log.user?.fullName || log.user?.email || 'Hệ thống',
        createdAt: log.createdAt,
      }));

      return {
        summary: {
          totalRevenue,
          totalOrders: salesOrders.length,
          totalCustomers,
          availableStock: totalOnHand - totalReserved,
          totalInventoryValue: totalInventoryVal,
          totalEmployees,
        },
        revenueChart,
        revenueStructure: revenueStructure.length > 0 ? revenueStructure : [{ name: 'Hàng hóa', value: 100 }],
        inventoryAlerts: lowStockProducts,
        crmFunnel,
        hrOverview: {
          totalEmployees,
          todayAttendance,
          onLeaveToday,
        },
        recentActivities,
      };
    });
  }
}
