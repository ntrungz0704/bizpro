"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  ShoppingCart,
  Package,
  UserCheck,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Rocket,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import BizProLogo from "@/components/BizProLogo";

interface SubItem {
  title: string;
  href: string;
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  href?: string;
  subItems?: SubItem[];
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { title: "Tổng quan", icon: Home, href: "/" },
    {
      title: "CRM",
      icon: Users,
      subItems: [
        { title: "Khách hàng & Đối tác", href: "/crm/customers" },
        { title: "Cơ hội", href: "/crm/deals" },
        { title: "Đơn hàng tiềm năng", href: "/crm/leads" },
      ],
    },
    {
      title: "Bán hàng",
      icon: ShoppingCart,
      subItems: [
        { title: "Đơn bán hàng", href: "/sales/orders" },
        { title: "Khách hàng thương mại", href: "/sales/customers" },
      ],
    },
    {
      title: "Kho hàng",
      icon: Package,
      subItems: [
        { title: "Sản phẩm", href: "/inventory/products" },
        { title: "Nhập - Xuất kho", href: "/inventory/receipts-issues" },
        { title: "Kiểm kê", href: "/inventory/stocktakes" },
      ],
    },
    {
      title: "Nhân sự",
      icon: UserCheck,
      subItems: [
        { title: "Nhân viên", href: "/hrm/employees" },
        { title: "Chấm công", href: "/hrm/attendance" },
        { title: "Nghỉ phép", href: "/hrm/leave" },
      ],
    },
    { title: "Báo cáo", icon: BarChart3, href: "/reports" },
    { title: "Cài đặt", icon: Settings, href: "/settings" },
  ];

  // Default all submenus to OPEN as requested
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    CRM: true,
    "Bán hàng": true,
    "Kho hàng": true,
    "Nhân sự": true,
  });

  const toggleSubmenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "w-64 h-screen min-h-screen bg-[#0B132B] text-slate-300 flex flex-col p-3 select-none shrink-0 border-r border-slate-800/80 fixed lg:sticky top-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Logo & Mobile Close */}
        <div className="shrink-0 flex items-center justify-between px-2 py-2 mb-2">
          <Link href="/" className="flex items-center group">
            <BizProLogo variant="full" size="md" />
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items with Sleek Clean Scrollbar */}
        <nav className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1 sidebar-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasSub = !!item.subItems;
            const isOpen = openMenus[item.title];
            const isRootActive = item.href ? pathname === item.href : false;
            const isAnySubActive = item.subItems?.some((sub) => sub.href === pathname);

            if (!hasSub && item.href) {
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150",
                    isRootActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={cn(
                        "w-4 h-4 stroke-[2] shrink-0",
                        isRootActive ? "text-white" : "text-slate-400"
                      )}
                    />
                    <span className="truncate whitespace-nowrap">{item.title}</span>
                  </div>
                </Link>
              );
            }

            return (
              <div key={item.title}>
                <button
                  type="button"
                  onClick={() => toggleSubmenu(item.title)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150",
                    isAnySubActive
                      ? "text-white font-bold bg-slate-800/40"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={cn(
                        "w-4 h-4 stroke-[2] shrink-0",
                        isAnySubActive ? "text-blue-400" : "text-slate-400"
                      )}
                    />
                    <span className="truncate whitespace-nowrap">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    {isAnySubActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                    )}
                    <span className="text-slate-400">
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </div>
                </button>

                {/* Submenu with Sleek Hierarchical Styling */}
                {isOpen && item.subItems && (
                  <div className="mt-0.5 ml-4 space-y-0.5 border-l border-slate-700/60 pl-2">
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.title + sub.href}
                          href={sub.href}
                          onClick={onMobileClose}
                          className={cn(
                            "block py-1.5 px-2.5 text-xs rounded-lg transition-all truncate whitespace-nowrap",
                            isSubActive
                              ? "bg-blue-600 text-white font-semibold shadow-xs"
                              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                          )}
                        >
                          {sub.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Pro Upgrade Card moved inside scrollable nav so it never causes viewport clipping */}
          <div className="pt-3 pb-1">
            <div className="rounded-xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 p-2.5 border border-slate-700/50 text-center relative overflow-hidden">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className="w-5 h-5 rounded-md bg-blue-600/25 border border-blue-500/40 flex items-center justify-center">
                  <Rocket className="w-3 h-3 text-blue-400" />
                </div>
                <h4 className="text-[11px] font-bold text-white truncate">Nâng cấp lên Pro</h4>
              </div>
              <p className="text-[10px] text-slate-400 mb-2 leading-tight">
                Mở khóa báo cáo AI & đa kho hàng
              </p>
              <button
                type="button"
                onClick={() => alert("Hệ thống Business Management System Enterprise Pro v1.0!")}
                className="w-full py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-lg transition-colors shadow-xs active:scale-95"
              >
                Nâng cấp ngay
              </button>
            </div>
          </div>
        </nav>

        {/* Pinned Bottom Enterprise Status Bar (Always visible, compact, never clipped) */}
        <div className="shrink-0 pt-2.5 pb-2 mt-auto border-t border-slate-800/80 px-2 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="font-medium text-slate-300 truncate">Hệ thống Online</span>
          </div>
          <span className="text-[10px] bg-slate-800/90 px-1.5 py-0.5 rounded-md font-mono text-slate-400 border border-slate-700/50 shrink-0 ml-2">v1.0-MVP</span>
        </div>
      </aside>
    </>
  );
}
