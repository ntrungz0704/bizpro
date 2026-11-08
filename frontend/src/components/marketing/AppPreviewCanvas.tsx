"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Search,
  Filter,
  Plus,
  Truck,
  CalendarCheck,
  ChevronRight,
  Eye,
  Sparkles,
} from "lucide-react";

export default function AppPreviewCanvas() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "crm" | "inventory" | "sales" | "hrm">("dashboard");

  return (
    <div className="relative mx-auto max-w-6xl mt-10 md:mt-14 select-none group">
      {/* Glow Ambient Backdrop */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 rounded-3xl blur-xl opacity-35 group-hover:opacity-50 transition duration-1000 -z-10" />

      {/* Main SaaS Window Frame */}
      <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden text-slate-100 text-left">
        {/* Top Window Bar (macOS Style) */}
        <div className="h-11 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs" />
            <span className="text-[11px] font-mono text-slate-400 ml-2 hidden sm:inline">
              app.bizpro.vn/dashboard
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Hệ thống Hoạt động 100%</span>
            </span>
          </div>
        </div>

        {/* Tab Switcher Bar */}
        <div className="bg-slate-900/50 border-b border-slate-800/80 px-3 sm:px-6 py-2 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Bảng Điều Khiển</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sales")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "sales"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Đơn Hàng 5 Bước</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "inventory"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Kho & Khóa Giữ Tồn</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("crm")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "crm"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>CRM Khách Hàng</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("hrm")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "hrm"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Chấm Công 1 Chạm</span>
          </button>
        </div>

        {/* Dynamic Canvas Body */}
        <div className="p-4 sm:p-6 bg-slate-950 min-h-[380px] sm:min-h-[440px] flex flex-col justify-between relative overflow-hidden">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-4 animate-fade-in">
              {/* Top 4 KPI Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[11px] text-slate-400 font-semibold block">DOANH THU THÁNG NÀY</span>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">1.485.600.000 đ</div>
                  <div className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    <span>+24.8% so với tháng trước</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[11px] text-slate-400 font-semibold block">ĐƠN HÀNG HOÀN TẤT</span>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">384 đơn</div>
                  <div className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Tỷ lệ giao đúng hạn: 99.2%</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[11px] text-slate-400 font-semibold block">TỒN KHO KHẢ DỤNG</span>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">7.450 sản phẩm</div>
                  <div className="text-[10px] text-sky-400 font-bold mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Đang giữ hàng: 385 sản phẩm</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[11px] text-slate-400 font-semibold block">CHẤM CÔNG HÔM NAY</span>
                  <div className="text-xl sm:text-2xl font-black text-white mt-1">124 / 125</div>
                  <div className="text-[10px] text-purple-400 font-bold mt-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>Điểm danh đúng giờ: 99.2%</span>
                  </div>
                </div>
              </div>

              {/* Middle Section: Chart & Live Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Revenue Spline Chart Mockup */}
                <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-xs font-bold text-white">Biểu đồ Doanh thu & Dòng tiền thực tế</h4>
                      <p className="text-[10px] text-slate-400">Tự động cập nhật ngay khi đơn hàng hoàn tất</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Thời gian thực
                    </span>
                  </div>

                  {/* SVG Chart Graphic */}
                  <div className="h-32 sm:h-36 w-full flex items-end pt-4">
                    <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,100 Q60,70 120,85 T240,40 T360,55 T480,15 L480,120 L0,120 Z"
                        fill="url(#chartGrad)"
                      />
                      <path
                        d="M0,100 Q60,70 120,85 T240,40 T360,55 T480,15"
                        fill="none"
                        stroke="#38BDF8"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <circle cx="240" cy="40" r="5" fill="#38BDF8" stroke="#0F172A" strokeWidth="2" />
                      <circle cx="480" cy="15" r="5" fill="#10B981" stroke="#0F172A" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-2 border-t border-slate-800/80 pt-1">
                    <span>Thứ 2</span>
                    <span>Thứ 3</span>
                    <span>Thứ 4</span>
                    <span>Thứ 5</span>
                    <span>Thứ 6</span>
                    <span>Hôm nay (Đỉnh điểm)</span>
                  </div>
                </div>

                {/* Live Order Stream */}
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-white mb-2">Đơn hàng mới nhận</h4>
                  <div className="space-y-2.5">
                    <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-white block">Tập đoàn Vingroup</span>
                        <span className="text-[9px] text-slate-400">10 Màn hình 4K LG</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400">131.800.000 đ</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-white block">FPT Retail Hà Nội</span>
                        <span className="text-[9px] text-slate-400">5 Laptop Dell 5520</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400">127.450.000 đ</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-white block">Dược phẩm An Tâm</span>
                        <span className="text-[9px] text-slate-400">2 Máy in mã vạch</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400">18.500.000 đ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 5-STAGE SALES ORDER */}
          {activeTab === "sales" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-xs font-bold text-white">Quy trình Giao hàng 5 Bước Nghiêm ngặt</h4>
                    <p className="text-[10px] text-slate-400">Tuần tự theo thứ tự: Duyệt → Giữ kho → Đóng gói → Bàn giao vận chuyển → Khách nhận</p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold self-start sm:self-auto">
                    Shopee & TikTok Ready
                  </span>
                </div>

                {/* 5-Step Tracker Graphic */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center pt-2">
                  <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 block">Bước 1</span>
                    <span className="text-xs font-extrabold text-white">Tạo đơn nháp</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Nhân viên tạo</span>
                  </div>
                  <div className="bg-blue-900/30 p-2.5 rounded-xl border border-blue-500/40">
                    <span className="text-[10px] font-bold text-blue-400 block">Bước 2</span>
                    <span className="text-xs font-extrabold text-white">Đã giữ hàng</span>
                    <span className="text-[9px] text-blue-300 block mt-0.5">Khóa kho tự động</span>
                  </div>
                  <div className="bg-amber-900/30 p-2.5 rounded-xl border border-amber-500/40">
                    <span className="text-[10px] font-bold text-amber-400 block">Bước 3</span>
                    <span className="text-xs font-extrabold text-white">Đang đóng gói</span>
                    <span className="text-[9px] text-amber-300 block mt-0.5">In tem vận đơn</span>
                  </div>
                  <div className="bg-purple-900/30 p-2.5 rounded-xl border border-purple-500/40">
                    <span className="text-[10px] font-bold text-purple-400 block">Bước 4</span>
                    <span className="text-xs font-extrabold text-white">Đang giao hàng</span>
                    <span className="text-[9px] text-purple-300 block mt-0.5">GHTK / ViettelPost</span>
                  </div>
                  <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-500/60 shadow-lg shadow-emerald-500/10">
                    <span className="text-[10px] font-bold text-emerald-400 block">Bước 5</span>
                    <span className="text-xs font-extrabold text-emerald-300">Giao thành công</span>
                    <span className="text-[9px] text-emerald-200 block mt-0.5">Thu tiền & Trừ kho</span>
                  </div>
                </div>

                {/* Table representation */}
                <div className="mt-4 border border-slate-800 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-800/80 p-2.5 grid grid-cols-5 text-[10px] font-bold text-slate-400">
                    <span>MÃ ĐƠN</span>
                    <span className="col-span-2">KHÁCH HÀNG & MẶT HÀNG</span>
                    <span>TRẠNG THÁI HIỆN TẠI</span>
                    <span className="text-right">HÀNH ĐỘNG HỢP LỆ</span>
                  </div>
                  <div className="divide-y divide-slate-800 bg-slate-900/60">
                    <div className="p-2.5 grid grid-cols-5 items-center">
                      <span className="font-mono text-sky-400 font-bold">SO-2026-001</span>
                      <span className="col-span-2 text-white font-medium truncate">Cty CP Công nghệ FPT (5x Laptop Dell)</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-purple-400 font-bold">
                        <Truck className="w-3 h-3" /> Đang giao hàng
                      </span>
                      <span className="text-right">
                        <span className="px-2 py-1 rounded-md bg-emerald-600 text-white font-bold text-[10px]">
                          Xác nhận giao thành công
                        </span>
                      </span>
                    </div>

                    <div className="p-2.5 grid grid-cols-5 items-center">
                      <span className="font-mono text-sky-400 font-bold">SO-2026-002</span>
                      <span className="col-span-2 text-white font-medium truncate">Tập đoàn Vingroup (10x Màn hình 4K)</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 font-bold">
                        <ShieldCheck className="w-3 h-3" /> Đã giữ hàng kho
                      </span>
                      <span className="text-right">
                        <span className="px-2 py-1 rounded-md bg-amber-600 text-white font-bold text-[10px]">
                          Chuyển đóng gói
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY & ATOMIC RESERVATION */}
          {activeTab === "inventory" && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] text-amber-400 font-bold block">KHO MIỀN BẮC (HÀ NỘI)</span>
                  <div className="text-xl font-black text-white mt-1">2.450 sản phẩm</div>
                  <div className="text-[10px] text-slate-400 mt-1">Khả dụng: 2.305 • Đang giữ: 145</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] text-amber-400 font-bold block">KHO MIỀN NAM (TP.HCM)</span>
                  <div className="text-xl font-black text-white mt-1">3.820 sản phẩm</div>
                  <div className="text-[10px] text-slate-400 mt-1">Khả dụng: 3.610 • Đang giữ: 210</div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] text-amber-400 font-bold block">KHO MIỀN TRUNG (ĐÀ NẴNG)</span>
                  <div className="text-xl font-black text-white mt-1">1.180 sản phẩm</div>
                  <div className="text-[10px] text-slate-400 mt-1">Khả dụng: 1.150 • Đang giữ: 30</div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white">Cơ chế Khóa Giữ Kho Tự Động (Chống Bán Âm)</h4>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    Không lo thiếu hàng khi giao
                  </span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  Khi nhân viên Sales bấm duyệt đơn hàng, hệ thống lập tức khóa chính xác số lượng sản phẩm tương ứng trong kho. 
                  Dù 10 nhân viên bán cùng lúc, số lượng tồn khả dụng luôn cập nhật chuẩn xác từng giây, loại bỏ 100% rủi ro hủy đơn vì hết hàng.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CRM KANBAN */}
          {activeTab === "crm" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white">Pipeline Phễu Bán Hàng Trực Quan (Kanban)</h4>
                  <span className="text-[10px] text-indigo-400 font-bold">Giá trị cơ hội: 4.2 Tỷ VNĐ</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block mb-2">1. TIẾP CẬN (5)</span>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 mb-1.5">
                      <span className="font-bold text-white text-[11px] block">Bệnh viện Hồng Ngọc</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">180.000.000 đ</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-blue-400 block mb-2">2. ĐỀ XUẤT GIÁ (3)</span>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 mb-1.5">
                      <span className="font-bold text-white text-[11px] block">Chuỗi Trà sữa Phúc Long</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">450.000.000 đ</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-amber-400 block mb-2">3. ĐÀM PHÁN (2)</span>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 mb-1.5">
                      <span className="font-bold text-white text-[11px] block">Trường QT Vinschool</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">920.000.000 đ</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-emerald-400 block mb-2">4. CHỐT KÝ HỢP ĐỒNG (8)</span>
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 mb-1.5">
                      <span className="font-bold text-emerald-300 text-[11px] block">Tập đoàn Vingroup</span>
                      <span className="text-[10px] text-emerald-200 font-bold">1.250.000.000 đ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HRM ATTENDANCE */}
          {activeTab === "hrm" && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-white">Chấm Công 1 Chạm & Quản Lý Đơn Nghỉ Phép Trực Tuyến</h4>
                  <span className="text-[10px] text-purple-400 font-bold">Không gian lận chấm công</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Điểm danh ngày hôm nay</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-bold">ĐÃ CHECK-IN</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black text-sm">
                        08:14
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Nguyễn Văn Admin</span>
                        <span className="text-[10px] text-slate-400">IP Văn phòng Hà Nội • Đúng giờ (+16 phút)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Đơn xin nghỉ phép cần duyệt</span>
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md font-bold">2 đơn chờ duyệt</span>
                    </div>
                    <div className="mt-2.5 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900">
                        <span className="text-slate-300">Lê Thu Trang (Phép năm - 1 ngày)</span>
                        <span className="text-emerald-400 font-bold text-[10px]">Phê duyệt</span>
                      </div>
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900">
                        <span className="text-slate-300">Trần Quốc Bảo (Nghỉ ốm - 2 ngày)</span>
                        <span className="text-emerald-400 font-bold text-[10px]">Phê duyệt</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Floating Interactive Action */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Giao diện thực tế 100% trong Web App. Không dựng hình giả lập.</span>
            </div>
            <a
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-95 transition-all"
            >
              <span>Vào trải nghiệm trực tiếp giao diện này</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
