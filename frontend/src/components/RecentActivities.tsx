"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  UserPlus,
  PackagePlus,
  Calendar,
  Users,
  ArrowRight,
  Activity,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

export default function RecentActivities() {
  const { activities } = useApp();
  const [showAllModal, setShowAllModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const getIconProps = (type: string) => {
    switch (type) {
      case "ORDER":
        return {
          icon: ShoppingCart,
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
        };
      case "EMPLOYEE":
        return {
          icon: UserPlus,
          iconBg: "bg-sky-100",
          iconColor: "text-sky-600",
        };
      case "INVENTORY":
        return {
          icon: PackagePlus,
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600",
        };
      case "LEAVE":
        return {
          icon: Calendar,
          iconBg: "bg-purple-100",
          iconColor: "text-purple-600",
        };
      case "CRM":
      default:
        return {
          icon: Users,
          iconBg: "bg-emerald-100",
          iconColor: "text-emerald-600",
        };
    }
  };

  // Show top 4 in widget
  const displayActivities = activities.slice(0, 4);

  // Filtered in modal
  const modalActivities = activities.filter((act) => {
    if (activeFilter === "ALL") return true;
    return act.type === activeFilter;
  });

  return (
    <>
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800">Hoạt động gần đây</h3>
          <button
            type="button"
            onClick={() => setShowAllModal(true)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List */}
        <div className="space-y-3.5">
          {displayActivities.map((act) => {
            const { icon: Icon, iconBg, iconColor } = getIconProps(act.type);
            return (
              <Link
                key={act.id}
                href={act.href}
                className="flex items-start gap-3 p-1 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    iconBg
                  )}
                >
                  <Icon className={cn("w-4 h-4", iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate transition-colors">
                      {act.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {act.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {act.detail}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Comprehensive All Activities Modal */}
      {showAllModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-scale-up max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">
                    Nhật ký hoạt động toàn hệ thống
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Ghi nhận biến động dữ liệu real-time từ các phân hệ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 py-3 overflow-x-auto text-xs shrink-0 border-b border-slate-100">
              {[
                { key: "ALL", label: "Tất cả" },
                { key: "ORDER", label: "Đơn hàng" },
                { key: "INVENTORY", label: "Kho hàng" },
                { key: "EMPLOYEE", label: "Nhân sự" },
                { key: "LEAVE", label: "Nghỉ phép" },
                { key: "CRM", label: "CRM" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
                    activeFilter === tab.key
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Activities List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
              {modalActivities.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Không có hoạt động nào trong danh mục này.
                </div>
              ) : (
                modalActivities.map((act) => {
                  const { icon: Icon, iconBg, iconColor } = getIconProps(act.type);
                  return (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-100 transition-all flex items-start gap-3"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                          iconBg
                        )}
                      >
                        <Icon className={cn("w-4 h-4", iconColor)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900">
                            {act.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                            {act.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {act.detail}
                        </p>
                        <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-200/50">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Phân hệ: {act.type}
                          </span>
                          <Link
                            href={act.href}
                            onClick={() => setShowAllModal(false)}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <span>Mở phân hệ</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Hiển thị {modalActivities.length} hoạt động</span>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
