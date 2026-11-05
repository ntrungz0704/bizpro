"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  User,
  Settings,
  LogOut,
  Check,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  href: string;
  type: "order" | "leave" | "inventory";
  isRead: boolean;
}

export default function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const router = useRouter();
  const { showToast } = useApp();

  const [showNoti, setShowNoti] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notiRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "noti_1",
      title: "Đơn hàng #SO-2026-0042 đã xác nhận",
      time: "2 phút trước",
      href: "/sales/orders",
      type: "order",
      isRead: false,
    },
    {
      id: "noti_2",
      title: "Nguyễn Văn B gửi đơn xin nghỉ phép",
      time: "15 phút trước",
      href: "/hrm/leave",
      type: "leave",
      isRead: false,
    },
    {
      id: "noti_3",
      title: "Laptop Dell XPS 13 chạm ngưỡng tồn tối thiểu",
      time: "1 giờ trước",
      href: "/inventory/products",
      type: "inventory",
      isRead: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setShowNoti(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Global Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast("Đã đánh dấu đã đọc tất cả thông báo!", "success");
  };

  const handleNotificationClick = (noti: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
    );
    setShowNoti(false);
    showToast(`Đang mở: ${noti.title}`, "info");
    router.push(noti.href);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>

          {/* Search Input Bar with Ctrl+K */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm kiếm khách hàng, đơn hàng, sản phẩm..."
              className="w-full pl-10 pr-16 py-2 bg-slate-100/70 hover:bg-slate-100 text-xs sm:text-sm text-slate-700 placeholder-slate-400 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
            />
            <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-white border border-slate-200 rounded-md shadow-xs pointer-events-none">
              Ctrl + K
            </kbd>
          </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-5 ml-4">
        {/* Notification Bell */}
        <div className="relative" ref={notiRef}>
          <button
            onClick={() => {
              setShowNoti(!showNoti);
              setShowProfile(false);
            }}
            className="relative w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
            aria-label="Thông báo"
          >
            <Bell className="w-5 h-5 stroke-[1.8]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popover Dropdown */}
          {showNoti && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-scale-up">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-800">
                    Thông báo mới
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                      {unreadCount} chưa đọc
                    </span>
                  )}
                </div>
                {unreadCount > 0 ? (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Đánh dấu đã đọc</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400">
                    Đã đọc tất cả
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {notifications.map((noti) => (
                  <div
                    key={noti.id}
                    onClick={() => handleNotificationClick(noti)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                      noti.isRead
                        ? "bg-slate-50/50 hover:bg-slate-100/70 opacity-75"
                        : "bg-blue-50/40 hover:bg-blue-50 border border-blue-100/50"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        noti.type === "order"
                          ? "bg-blue-100 text-blue-600"
                          : noti.type === "leave"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {noti.type === "order" ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : noti.type === "leave" ? (
                        <Calendar className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs leading-snug line-clamp-2 ${
                          noti.isRead
                            ? "font-normal text-slate-600"
                            : "font-semibold text-slate-900"
                        }`}
                      >
                        {noti.title}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-400">
                          {noti.time}
                        </span>
                        {!noti.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNoti(false);
            }}
            className="flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-blue-500/20">
              A
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                Nguyễn Văn A
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-[11px] text-slate-400 font-normal">
                Quản trị viên
              </div>
            </div>
          </div>

          {/* User Menu Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-scale-up">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-800">Nguyễn Văn A</p>
                <p className="text-[10px] text-slate-400">admin@bizpro.vn</p>
              </div>

              <Link
                href="/hrm/employees"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Hồ sơ cá nhân</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Cài đặt hệ thống</span>
              </Link>

              <button
                onClick={() => {
                  showToast("Đã đăng xuất khỏi hệ thống BizPro+!", "info");
                  setShowProfile(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
