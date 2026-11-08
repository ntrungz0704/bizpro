"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Building2,
  Users,
  CreditCard,
  Activity,
  Server,
  DollarSign,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Lock,
} from "lucide-react";
import BizProLogo from "@/components/BizProLogo";

export default function PlatformAdminDashboard() {
  const tenants = [
    { id: "TNT-001", name: "Công ty Cổ phần Viet An", plan: "Enterprise", users: 180, mrr: "2,999,000 đ", status: "Active" },
    { id: "TNT-002", name: "An Nam Distribution Corp", plan: "Professional", users: 45, mrr: "1,299,000 đ", status: "Active" },
    { id: "TNT-003", name: "Minh Khang Logistics", plan: "Professional", users: 38, mrr: "1,299,000 đ", status: "Active" },
    { id: "TNT-004", name: "Ha Long Trading Hub", plan: "Starter", users: 8, mrr: "499,000 đ", status: "Active" },
    { id: "TNT-005", name: "Saigon Tech Retail", plan: "14-Day Trial", users: 5, mrr: "0 đ", status: "Trial" },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col">
      {/* Super Admin Top Header */}
      <header className="border-b border-slate-800 bg-[#0B132B] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <BizProLogo variant="full" size="md" theme="dark" />
          </Link>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/30">
            SaaS Platform Super Admin
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all"
          >
            Switch to Tenant App →
          </Link>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            SA
          </div>
        </div>
      </header>

      {/* Nav Sub-bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex items-center gap-6 text-xs font-semibold overflow-x-auto">
        <Link href="/admin" className="text-blue-400 pb-1 border-b-2 border-blue-400">
          Overview & Metrics
        </Link>
        <Link href="/admin/tenants" className="text-slate-400 hover:text-slate-200">
          Tenants (1,240)
        </Link>
        <Link href="/admin/plans" className="text-slate-400 hover:text-slate-200">
          Subscription Plans
        </Link>
        <Link href="/admin/system" className="text-slate-400 hover:text-slate-200">
          System Health & Logs
        </Link>
      </div>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Monthly Recurring Revenue (MRR)</div>
            <div className="text-2xl font-black text-white mt-1">1.84 Tỷ VNĐ</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">↑ +14.2% MoM growth</div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Active Enterprise Tenants</div>
            <div className="text-2xl font-black text-white mt-1">1,240</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">+48 new this month</div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Global Cloud Uptime</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">99.98%</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">All microservices healthy</div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
            <div className="text-[11px] text-slate-400 font-medium">Average API Latency</div>
            <div className="text-2xl font-black text-blue-400 mt-1">42 ms</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">PostgreSQL query index 99.4%</div>
          </div>
        </div>

        {/* Tenant Directory Table */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Khách hàng Doanh nghiệp gần đây (Recent Tenants)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Danh sách các tổ chức đăng ký và nâng cấp trên nền tảng</p>
            </div>
            <Link
              href="/admin/tenants"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>Xem toàn bộ 1,240 Tenants</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Mã Tenant</th>
                  <th className="p-3.5">Tên doanh nghiệp</th>
                  <th className="p-3.5">Gói dịch vụ</th>
                  <th className="p-3.5">Số nhân viên</th>
                  <th className="p-3.5">MRR</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-300">{t.id}</td>
                    <td className="p-3.5 font-bold text-white">{t.name}</td>
                    <td className="p-3.5 text-blue-400 font-semibold">{t.plan}</td>
                    <td className="p-3.5 text-slate-300">{t.users} users</td>
                    <td className="p-3.5 font-bold text-slate-200">{t.mrr}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button className="text-[11px] font-semibold text-blue-400 hover:underline">
                        Impersonate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
