"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Bell, ChevronDown, Menu, CheckCircle2, AlertTriangle, Calendar, User, Settings, LogOut } from "lucide-react";

interface NavbarProps {
  onMobileMenuToggle?: () => void;
}

export default function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const [showNoti, setShowNoti] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
            placeholder="Tìm kiếm khách hàng, đơn hàng, sản phẩm... (Ctrl + K)"
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
        <div className="relative">
          <button
            onClick={() => {
              setShowNoti(!showNoti);
              setShowProfile(false);
            }}
            className="relative w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
            aria-label="Thông báo"
          >
            <Bell className="w-5 h-5 stroke-[1.8]" />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              3
            </span>
          </button>

          {/* Notification Popover Dropdown */}
          {showNoti && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-scale-up">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-800">Thông báo mới</h4>
                <span className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline">
                  Đánh dấu đã đọc
                </span>
              </div>
              <div className="space-y-2.5">
                <Link
                  href="/sales/orders"
                  onClick={() => setShowNoti(false)}
                  className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Đơn hàng #SO-2026-0042 đã xác nhận
                    </p>
                    <span className="text-[10px] text-slate-400">2 phút trước</span>
                  </div>
                </Link>

                <Link
                  href="/hrm/leave"
                  onClick={() => setShowNoti(false)}
                  className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Nguyễn Văn B gửi đơn xin nghỉ phép
                    </p>
                    <span className="text-[10px] text-slate-400">15 phút trước</span>
                  </div>
                </Link>

                <Link
                  href="/inventory/products"
                  onClick={() => setShowNoti(false)}
                  className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Laptop Dell XPS 13 chạm ngưỡng tồn tối thiểu
                    </p>
                    <span className="text-[10px] text-slate-400">1 giờ trước</span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
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
              <div className="text-[11px] text-slate-400 font-normal">Quản trị viên</div>
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
                  alert("Đăng xuất khỏi hệ thống BizPro+!");
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
