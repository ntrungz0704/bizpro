"use client";

import React from "react";
import Link from "next/link";
import { Users, CalendarCheck, ArrowUpRight } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function HrOverview() {
  const { employees, leaveRequests } = useApp();

  const totalEmployees = employees.length;
  const pendingLeave = leaveRequests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">Tổng quan nhân sự</h3>
        </div>
        <Link
          href="/hrm/employees"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          Chi tiết
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Left Stats */}
        <div className="space-y-3.5">
          {/* Total Employees */}
          <Link
            href="/hrm/employees"
            className="flex items-start gap-3 group hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {totalEmployees}
                </span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3" /> 2.1%
                </span>
              </div>
              <p className="text-xs text-slate-400">Tổng nhân viên</p>
            </div>
          </Link>

          {/* Pending Leave Requests */}
          <Link
            href="/hrm/leave"
            className="flex items-start gap-3 group hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                  {pendingLeave}
                </span>
                {pendingLeave > 0 && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                    Cần duyệt
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Nghỉ phép chờ duyệt</p>
            </div>
          </Link>
        </div>

        {/* Right Illustration */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center bg-gradient-to-tr from-blue-50/60 to-indigo-50/60 rounded-2xl p-2 border border-blue-100/50">
          <svg viewBox="0 0 120 100" className="w-full h-full">
            {/* Background circular soft aura */}
            <circle cx="60" cy="50" r="42" fill="#E0E7FF" opacity="0.6" />
            {/* Person 1 (Left - Woman) */}
            <circle cx="35" cy="40" r="10" fill="#FBCFE8" />
            <path d="M22,75 C22,55 48,55 48,75 Z" fill="#3B82F6" />
            {/* Person 2 (Center - Leader Man in Navy Suit) */}
            <circle cx="60" cy="32" r="12" fill="#FED7AA" />
            <path d="M42,80 C42,50 78,50 78,80 Z" fill="#1E3A8A" />
            <polygon points="56,58 64,58 62,72 58,72" fill="#EF4444" /> {/* Red tie */}
            {/* Person 3 (Right - Woman in Blazer) */}
            <circle cx="85" cy="40" r="10" fill="#FEF08A" />
            <path d="M72,75 C72,55 98,55 98,75 Z" fill="#6366F1" />
          </svg>
        </div>
      </div>
    </div>
  );
}
