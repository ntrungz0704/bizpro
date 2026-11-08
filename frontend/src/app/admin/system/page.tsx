"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  Server,
  Database,
  ShieldCheck,
  Cpu,
  Clock,
  ArrowRight,
} from "lucide-react";
import BizProLogo from "@/components/BizProLogo";

export default function AdminSystemPage() {
  const auditLogs = [
    { time: "20:25:12", tenant: "Viet An Solutions", action: "TENANT_BACKUP_SNAPSHOT", status: "SUCCESS", detail: "Point-in-time PostgreSQL backup completed (14.2 GB)" },
    { time: "20:18:44", tenant: "An Nam Distribution", action: "STOCK_RESERVATION_ACID", status: "SUCCESS", detail: "120 SKUs reserved for Order #SO-1089" },
    { time: "20:10:02", tenant: "Minh Khang Logistics", action: "USER_INVITATION_SENT", status: "SUCCESS", detail: "Invite email sent to warehouse.lead@minhkhang.vn" },
    { time: "19:55:18", tenant: "Saigon Tech Retail", action: "TRIAL_ACCOUNT_PROVISIONED", status: "SUCCESS", detail: "Dedicated workspace schema instantiated" },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-[#0B132B] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <BizProLogo variant="full" size="md" theme="dark" />
          </Link>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/30">
            SaaS Platform Super Admin
          </span>
        </div>

        <Link
          href="/admin"
          className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all"
        >
          ← Back to Admin Overview
        </Link>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Hạ tầng Kỹ thuật & Nhật ký Hệ thống (System Health & Logs)</h1>
          <p className="text-xs text-slate-400 mt-1">Giám sát tải máy chủ, kết nối cơ sở dữ liệu và nhật ký vận hành thời gian thực.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Database Load</span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">18.4%</div>
            <div className="text-[11px] text-emerald-400 mt-1">PostgreSQL Connection Pool 42/200</div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Application Server CPU</span>
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">24.2%</div>
            <div className="text-[11px] text-blue-400 mt-1">Node.js Next.js cluster running smooth</div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Service Latency</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">42 ms</div>
            <div className="text-[11px] text-emerald-400 mt-1">Zero downtime recorded this month</div>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Global Platform Audit Trail</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Nhật ký các thao tác quan trọng trên hệ thống</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Thời gian</th>
                  <th className="p-3.5">Tổ chức (Tenant)</th>
                  <th className="p-3.5">Hành động</th>
                  <th className="p-3.5">Chi tiết</th>
                  <th className="p-3.5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                {auditLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3.5 text-slate-400">{log.time}</td>
                    <td className="p-3.5 font-bold text-white font-sans">{log.tenant}</td>
                    <td className="p-3.5 text-blue-400">{log.action}</td>
                    <td className="p-3.5 text-slate-300 font-sans">{log.detail}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {log.status}
                      </span>
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
