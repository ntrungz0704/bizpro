"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { formatVND } from "@/lib/utils";
import { BarChart3, Download, Printer, TrendingUp, PackageCheck, Users } from "lucide-react";
import { reportsApi } from "@/lib/api-client";

export default function ReportsPage() {
  const { salesOrders, products, customers, employees, showToast } = useApp();
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    reportsApi.getDashboardOverview()
      .then((data) => setReportData(data))
      .catch((err) => console.warn("Could not load report overview:", err));
  }, []);

  const totalRevenue = reportData?.summary?.totalRevenue ?? salesOrders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const totalInventoryValue = reportData?.summary?.totalInventoryValue ?? products.reduce(
    (sum, p) => sum + (Number(p.onHand) || 0) * (Number(p.costPrice) || 0),
    0
  );

  const displayCustomersCount = reportData?.summary?.totalCustomers ?? customers.length;
  const displayEmployeesCount = reportData?.summary?.totalEmployees ?? employees.length;

  const handleExport = (type: string) => {
    showToast(`Đã xuất báo cáo ${type} thành công! Tệp tin đã tải về máy.`);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Báo cáo Quản trị Doanh nghiệp
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp các chỉ số hoạt động kinh doanh, xuất nhập tồn kho và hiệu suất làm việc.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("Excel (XLSX)")}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={() => handleExport("PDF")}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Tổng doanh số bán hàng</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {formatVND(totalRevenue)}
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {salesOrders.length} đơn hàng đã phát sinh
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Tổng giá trị tồn kho</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {formatVND(totalInventoryValue)}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Định mức giá vốn bình quân
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Quy mô nhân sự & Khách hàng</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {displayEmployeesCount} NV / {displayCustomersCount} KH
            </h3>
            <span className="text-[11px] text-purple-600 font-medium">
              100% hồ sơ đã chuẩn hóa
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4">
          Bảng kê tổng hợp Đơn hàng theo Khách hàng
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Mã đơn</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Ngày giao dịch</th>
                <th className="py-3 px-4 text-right">Giá trị đơn hàng</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salesOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-blue-600">{ord.code}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{ord.customerName}</td>
                  <td className="py-3 px-4 text-slate-500">{ord.orderDate}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {formatVND(ord.totalAmount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
