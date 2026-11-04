"use client";

import React, { useState, useEffect } from "react";
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
  Layers,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        { title: "Khách hàng", href: "/crm/customers" },
        { title: "Cơ hội", href: "/crm/deals" },
        { title: "Đơn hàng tiềm năng", href: "/crm/leads" },
      ],
    },
    {
      title: "Bán hàng",
      icon: ShoppingCart,
      subItems: [
        { title: "Đơn bán hàng", href: "/sales/orders" },
        { title: "Khách hàng", href: "/sales/customers" },
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

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    CRM: true,
    "Bán hàng": true,
    "Kho hàng": true,
    "Nhân sự": true,
  });

  // Auto expand menu based on active pathname
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.subItems?.some((sub) => sub.href === pathname)) {
        setOpenMenus((prev) => ({ ...prev, [item.title]: true }));
      }
    });
  }, [pathname]);

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
          "w-64 h-screen bg-[#0B132B] text-slate-300 flex flex-col p-3 select-none shrink-0 border-r border-slate-800/80 fixed lg:sticky top-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Logo & Mobile Close */}
        <div className="shrink-0 flex items-center justify-between px-2 py-1.5 mb-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center">
              BizPro<span className="text-blue-500 font-extrabold">+</span>
            </span>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items - min-h-0 is essential so flex-1 can shrink and scroll */}
        <nav className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
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
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4 stroke-[2]",
                        isRootActive ? "text-white" : "text-slate-400"
                      )}
                    />
                    <span>{item.title}</span>
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
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4 stroke-[2]",
                        isAnySubActive ? "text-blue-400" : "text-slate-400"
                      )}
                    />
                    <span>{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isAnySubActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
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
                            "block py-1.5 px-2.5 text-xs rounded-lg transition-all",
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
        </nav>

        {/* Pinned Bottom Pro Card (Never cut off with shrink-0 and compact height) */}
        <div className="shrink-0 pt-2 mt-auto border-t border-slate-800/80">
          <div className="rounded-xl bg-gradient-to-b from-slate-800/90 to-slate-900/95 p-2.5 border border-slate-700/60 text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <div className="w-6 h-6 rounded-lg bg-blue-600/25 border border-blue-500/40 flex items-center justify-center">
                <Rocket className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <h4 className="text-xs font-bold text-white">Nâng cấp lên Pro</h4>
            </div>
            <p className="text-[11px] text-slate-400 mb-2 leading-tight">
              Trải nghiệm nhiều tính năng cao cấp hơn!
            </p>
            <button
              onClick={() => alert("Hệ thống Business Management System Enterprise Pro v1.0!")}
              className="w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold rounded-lg transition-colors shadow-xs active:scale-95"
            >
              Nâng cấp ngay
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
