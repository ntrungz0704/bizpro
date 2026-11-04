"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  UserPlus,
  PackagePlus,
  Calendar,
  Users,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

export default function RecentActivities() {
  const { activities } = useApp();

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

  // Show the top 4 most recent activities
  const displayActivities = activities.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Hoạt động gần đây</h3>
        <Link
          href="/sales/orders"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
        </Link>
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
  );
}
