"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import BizProLogo from "@/components/BizProLogo";

export default function AdminTenantsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const allTenants = [
    { id: "TNT-001", name: "Công ty Cổ phần Viet An", tax: "0109988776", plan: "Enterprise", users: 180, storage: "14.2 GB", created: "15/01/2026", status: "Active" },
    { id: "TNT-002", name: "An Nam Distribution Corp", tax: "0108877665", plan: "Professional", users: 45, storage: "4.8 GB", created: "20/02/2026", status: "Active" },
    { id: "TNT-003", name: "Minh Khang Logistics", tax: "0317766554", plan: "Professional", users: 38, storage: "3.9 GB", created: "10/03/2026", status: "Active" },
    { id: "TNT-004", name: "Ha Long Trading Hub", tax: "0406655443", plan: "Starter", users: 8, storage: "1.2 GB", created: "05/04/2026", status: "Active" },
    { id: "TNT-005", name: "Saigon Tech Retail", tax: "0315544332", plan: "14-Day Trial", users: 5, storage: "0.4 GB", created: "02/11/2026", status: "Trial" },
    { id: "TNT-006", name: "VinRetail Partners", tax: "0101122334", plan: "Enterprise", users: 320, storage: "28.5 GB", created: "08/01/2026", status: "Active" },
  ];

  const filtered = allTenants.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.tax.includes(searchTerm));

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Quản lý Khách hàng Doanh nghiệp (Tenants)</h1>
            <p className="text-xs text-slate-400 mt-1">Giám sát toàn bộ tổ chức, hạn mức người dùng và dung lượng trên hạ tầng SaaS.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên, MST..."
                className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 w-64"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Mã Tenant</th>
                  <th className="p-3.5">Doanh nghiệp & MST</th>
                  <th className="p-3.5">Gói cước</th>
                  <th className="p-3.5">Người dùng</th>
                  <th className="p-3.5">Dung lượng</th>
                  <th className="p-3.5">Ngày tạo</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-300">{t.id}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-white">{t.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">MST: {t.tax}</div>
                    </td>
                    <td className="p-3.5 font-semibold text-blue-400">{t.plan}</td>
                    <td className="p-3.5 text-slate-300">{t.users} users</td>
                    <td className="p-3.5 text-slate-300">{t.storage}</td>
                    <td className="p-3.5 text-slate-400">{t.created}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button className="text-[11px] font-semibold text-blue-400 hover:underline">
                        Chi tiết
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
