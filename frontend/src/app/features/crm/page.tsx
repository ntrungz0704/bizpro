"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Target,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Play,
  Star,
  Check,
  Search,
  Bell,
  ChevronDown,
  Building2,
  PhoneCall,
  Mail,
  Zap,
  BarChart3,
  Calendar,
  Layers,
  Rocket,
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function CRMFeaturePage() {
  const [dateFilter, setDateFilter] = useState("30 ngày gần nhất");

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      <MarketingHeader />

      <main className="flex-1 w-full overflow-x-hidden">
        {/* =========================================================================
            1. CRM HERO SECTION (100% Vietnamese Business Terminology)
            ========================================================================= */}
        <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-400/10 via-sky-300/10 to-transparent blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-24 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-400/10 via-blue-300/10 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              
              {/* Left Column: Hero Copy & Breadcrumb */}
              <div className="lg:col-span-6 space-y-6 text-left">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                  <Link href="/features" className="hover:underline flex items-center gap-1">
                    <span>Tính năng</span>
                  </Link>
                  <span>&gt;</span>
                  <span className="text-slate-800">Quản trị Quan hệ Khách hàng (CRM)</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-[1.2] [text-wrap:balance]">
                  Quản Lý Khách Hàng Thông Minh, <br className="hidden sm:inline" />
                  <span className="text-[#0066FF]">Đột Phá Doanh Số</span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                  Thu thập Lead từ đa kênh, theo dõi sát sao phễu cơ hội kinh doanh và xây dựng mối quan hệ bền chặt với khách hàng thông qua dữ liệu 360 độ trực quan.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-[#0066FF] hover:bg-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                  >
                    <span>Trải nghiệm CRM miễn phí</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>

                  <Link
                    href="/demo"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold shadow-2xs transition-all hover:-translate-y-0.5"
                  >
                    <Play className="w-4 h-4 mr-2 fill-slate-700 text-slate-700" />
                    <span>Xem Demo quy trình bán</span>
                  </Link>
                </div>

                {/* Metrics */}
                <div className="pt-6 border-t border-slate-200/70 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">10,000+</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Khách hàng tin cậy</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">+35%</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Tăng trưởng doanh số</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">4.9 / 5</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Đánh giá hài lòng</div>
                  </div>
                </div>
              </div>

              {/* Right Column: CRM Dashboard Mockup Card */}
              <div className="lg:col-span-6 relative">
                <div className="relative mx-auto max-w-[640px] rounded-2xl bg-white p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,102,255,0.08)] border border-blue-100/80 transition-all">
                  
                  {/* Top Bar of the Mockup */}
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      <span className="text-xs font-bold text-slate-800">Bảng Quản Trị CRM & Doanh Số</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dateFilter}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                    </div>
                  </div>

                  {/* 4 Quick Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Khách hàng</div>
                      <div className="text-lg font-extrabold text-slate-900 mt-0.5">2,480</div>
                      <span className="text-[10px] text-emerald-600 font-semibold">+12.5%</span>
                    </div>

                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Leads mới</div>
                      <div className="text-lg font-extrabold text-slate-900 mt-0.5">842</div>
                      <span className="text-[10px] text-blue-600 font-semibold">+18.7%</span>
                    </div>

                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Tỷ lệ chốt</div>
                      <div className="text-lg font-extrabold text-slate-900 mt-0.5">24.8%</div>
                      <span className="text-[10px] text-emerald-600 font-semibold">+2.1%</span>
                    </div>

                    <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Tăng trưởng</div>
                      <div className="text-lg font-extrabold text-slate-900 mt-0.5">+32%</div>
                      <span className="text-[10px] text-amber-600 font-semibold">Vượt mục tiêu</span>
                    </div>
                  </div>

                  {/* Customer Growth Trend & Top Customers */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    <div className="sm:col-span-7 bg-gradient-to-b from-blue-50/30 to-white p-3.5 rounded-xl border border-blue-100/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800">Biểu đồ Tăng trưởng Khách hàng</span>
                        <span className="text-[10px] text-blue-600 font-semibold">Năm 2026</span>
                      </div>
                      <svg viewBox="0 0 300 90" className="w-full h-20 stroke-blue-600 fill-none">
                        <path
                          d="M 0 75 Q 50 65 90 40 T 180 50 T 250 20 T 300 10"
                          stroke="#0066FF"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 0 75 Q 50 65 90 40 T 180 50 T 250 20 T 300 10 L 300 90 L 0 90 Z"
                          fill="url(#crmBlueGrad)"
                          opacity="0.15"
                        />
                        <defs>
                          <linearGradient id="crmBlueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0066FF" />
                            <stop offset="100%" stopColor="#FFFFFF" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    <div className="sm:col-span-5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 space-y-2">
                      <div className="text-xs font-bold text-slate-800">Khách Hàng Hàng Đầu</div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-100">
                          <span className="font-semibold text-slate-800 truncate max-w-[90px]">Công ty Việt An</span>
                          <span className="font-bold text-blue-600">320 Tr</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-100">
                          <span className="font-semibold text-slate-800 truncate max-w-[90px]">An Nam Corp</span>
                          <span className="font-bold text-blue-600">210 Tr</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-100">
                          <span className="font-semibold text-slate-800 truncate max-w-[90px]">Minh Khang</span>
                          <span className="font-bold text-blue-600">185 Tr</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            2. KEY CAPABILITIES SUMMARY (5 Cards)
            ========================================================================= */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                Tính Năng Trọng Tâm
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Mọi thứ bạn cần để chăm sóc và bứt phá doanh thu
              </h2>
              <p className="text-slate-600 text-base">
                Từ khâu thu thập thông tin người liên hệ đến chăm sóc sau bán hàng và gia tăng đơn tái mua.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200/80 text-center space-y-2 hover:border-blue-400 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Quản Lý Leads</h4>
                <p className="text-xs text-slate-500">
                  Thu thập và phân bổ lead tự động từ Facebook, Zalo, Website.
                </p>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200/80 text-center space-y-2 hover:border-blue-400 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Phễu Bán Hàng</h4>
                <p className="text-xs text-slate-500">
                  Trực quan hóa lộ trình đàm phán chốt hợp đồng theo từng giai đoạn.
                </p>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200/80 text-center space-y-2 hover:border-blue-400 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Tương Tác 360°</h4>
                <p className="text-xs text-slate-500">
                  Ghi nhật ký cuộc gọi, email, báo giá và lịch hẹn khách hàng.
                </p>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200/80 text-center space-y-2 hover:border-blue-400 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Báo Cáo Hiệu Suất</h4>
                <p className="text-xs text-slate-500">
                  Phân tích tỷ lệ chuyển đổi và doanh số của từng nhân viên sales.
                </p>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200/80 text-center space-y-2 hover:border-blue-400 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 mx-auto flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Tự Động Hóa</h4>
                <p className="text-xs text-slate-500">
                  Tự động chuyển đổi Lead thành Khách Hàng & Đơn Hàng chỉ 1 click.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. LEAD MANAGEMENT & SCORING SECTION
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                  Tiếp Nhận Lead Đa Nguồn
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Không bỏ sót bất kỳ khách hàng tiềm năng nào
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  BizPro+ CRM tự động tổng hợp thông tin khách hàng tiềm năng từ các chiến dịch tiếp thị số (Facebook Ads, Google, Website Form, Zalo OA) vào một danh sách tập trung.
                </p>
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Tự động phân bổ Lead cho nhân viên theo cơ chế vòng tròn (Round-Robin)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Cảnh báo trùng lặp số điện thoại và email để tránh xung đột giữa các sales</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Chấm điểm chất lượng Lead (Lead Scoring) dựa trên mức độ quan tâm</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 text-xs font-bold text-slate-800">
                  <span>Danh Sách Leads Mới Tiếp Nhận (Thời Gian Thực)</span>
                  <span className="text-blue-600">Đang hoạt động</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Hoàng Nam (Nội thất Tân Cổ Điển)</div>
                      <div className="text-[11px] text-slate-500">Nguồn: Facebook Ads • SĐT: 0912.***.888</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-bold text-[10px]">
                      Mới tiếp nhận
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Vũ Minh (Công ty Thực Phẩm Sạch)</div>
                      <div className="text-[11px] text-slate-500">Nguồn: Giới thiệu đối tác • SĐT: 0988.***.234</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-bold text-[10px]">
                      Đang liên hệ
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Nguyễn Hương (Chuỗi Nhà Thuốc An Tâm)</div>
                      <div className="text-[11px] text-slate-500">Nguồn: Website Form • SĐT: 0903.***.567</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                      Đã chuyển đổi Deal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. SALES PIPELINE (KANBAN DEALS) SECTION
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                Phễu Chuyển Đổi
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Kiểm soát dòng tiền cơ hội theo dạng bảng Kanban
              </h2>
              <p className="text-slate-600 text-base">
                Kéo thả cơ hội kinh doanh qua các cột giai đoạn để cập nhật tiến độ thương thảo và dự báo doanh số chuẩn xác.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800">1. Khảo Sát Nhu Cầu</span>
                  <span className="text-[10px] font-bold bg-slate-200 px-2 py-0.5 rounded-full">12 Deals</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="text-xs font-bold text-slate-900">Gói ERP Chuỗi Bán Lẻ</div>
                  <div className="text-[11px] text-slate-500">Khách hàng: Siêu thị Mart 24</div>
                  <div className="text-xs font-bold text-blue-600 pt-1">120.000.000 đ</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800">2. Gửi Báo Giá & Demo</span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">8 Deals</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="text-xs font-bold text-slate-900">Giải Pháp Quản Lý 5 Kho Hàng</div>
                  <div className="text-[11px] text-slate-500">Khách hàng: LogiFast JSC</div>
                  <div className="text-xs font-bold text-indigo-600 pt-1">280.000.000 đ</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800">3. Đàm Phán Hợp Đồng</span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">5 Deals</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="text-xs font-bold text-slate-900">Hợp Đồng Doanh Nghiệp 2026</div>
                  <div className="text-[11px] text-slate-500">Khách hàng: Petro Mekong</div>
                  <div className="text-xs font-bold text-amber-600 pt-1">540.000.000 đ</div>
                </div>
              </div>

              <div className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-200">
                  <span className="text-xs font-bold text-emerald-900">4. Ký Kết Thành Công (Won)</span>
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">18 Deals</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs space-y-1">
                  <div className="text-xs font-bold text-slate-900">Chuyển Đổi Sang Đơn Hàng #SO-882</div>
                  <div className="text-[11px] text-slate-500">Khách hàng: Dược Phẩm MediCare</div>
                  <div className="text-xs font-bold text-emerald-700 pt-1">890.000.000 đ</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. CUSTOMER 360 & INTERACTION HISTORY
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-base flex items-center justify-center">
                    VA
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900">Công ty Cổ phần Việt An</h4>
                    <p className="text-xs text-slate-500">Mã số thuế: 0108849201 • Đại lý B2B Cấp 1</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Tổng giá trị mua hàng:</span>
                    <span className="font-bold text-slate-900">1.850.000.000 đ</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Số đơn hàng đã hoàn tất:</span>
                    <span className="font-bold text-slate-900">24 đơn hàng</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Hạn mức công nợ:</span>
                    <span className="font-bold text-emerald-600">300.000.000 đ (An toàn)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Nhân viên phụ trách:</span>
                    <span className="font-bold text-blue-600">Nguyễn Văn Admin (Kinh Doanh)</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                  Hồ Sơ Toàn Diện
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Hiểu rõ từng khách hàng như lòng bàn tay với Hồ sơ 360°
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Toàn bộ dữ liệu về mã số thuế, địa chỉ giao hàng, lịch sử trao đổi, báo giá và các lần mua hàng trước đó đều được lưu trữ trọn đời. 
                  Khi nhân viên phụ trách thay đổi, người mới tiếp quản có thể nắm bắt công việc ngay trong 5 phút.
                </p>
                <div className="pt-2">
                  <Link
                    href="/crm/customers"
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>Xem giao diện Danh mục Khách hàng thực tế</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. CUSTOMER SEGMENTATION
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                Phân Loại Khách Hàng
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Chăm sóc cá nhân hóa theo từng nhóm đối tượng
              </h2>
              <p className="text-slate-600 text-base">
                Tự động gắn nhãn và phân nhóm để áp dụng chính sách giá, chiết khấu và quà tặng phù hợp nhất.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 text-left space-y-2">
                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px]">
                  VIP Diamond
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Doanh Nghiệp Lớn</h4>
                <p className="text-xs text-slate-500">
                  Doanh số trên 500 triệu/tháng. Ưu tiên hỗ trợ kỹ thuật và chiết khấu cao nhất.
                </p>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 text-left space-y-2">
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                  Đại Lý Bán Buôn
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Đối Tác Phân Phối</h4>
                <p className="text-xs text-slate-500">
                  Nhập số lượng lớn định kỳ. Hỗ trợ chính sách công nợ thanh toán 30 ngày.
                </p>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 text-left space-y-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                  Khách Hàng Mới
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Vừa Ký Đơn Đầu Tiên</h4>
                <p className="text-xs text-slate-500">
                  Theo dõi sát sao trải nghiệm nhận hàng đầu tiên để kích thích đơn hàng số 2.
                </p>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 text-left space-y-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px]">
                  Cần Chăm Sóc Lại
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Nguy Cơ Rời Bỏ</h4>
                <p className="text-xs text-slate-500">
                  Chưa phát sinh đơn hàng mới trong 60 ngày. Hệ thống nhắc nhở sales liên hệ lại.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. FOLLOW-UP & ACTIVITY MANAGEMENT
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                  Nhắc Việc & Lịch Hẹn
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Tự động nhắc nhở gọi lại, không bao giờ quên lịch hẹn
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Nhân viên kinh doanh có thể đặt lịch hẹn tư vấn, ghi chú nội dung đã trao đổi và đặt lịch nhắc tự động qua thông báo để gọi lại đúng thời điểm khách hàng rảnh rỗi.
                </p>
                <div className="space-y-2 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đồng bộ lịch hẹn với chuông thông báo hệ thống</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Lưu mẫu email báo giá và kịch bản tư vấn chuẩn</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-bold text-slate-800">
                  <span>Lịch Hoạt Động Cần Xử Lý Hôm Nay</span>
                  <span className="text-emerald-600 font-semibold">3 Việc cần làm</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">09:30 - Gọi lại chốt báo giá cho Giám đốc Nam</div>
                    <div className="text-[11px] text-slate-500">Khách đã xem báo giá qua Zalo tối qua</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">14:00 - Gửi dự thảo hợp đồng cung ứng quý 1</div>
                    <div className="text-[11px] text-slate-500">Khách hàng: Công ty Logistics Minh Khang</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. SALES PERFORMANCE ANALYTICS
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                Thống Kê Doanh Số
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Minh bạch hiệu suất của từng chiến binh bán hàng
              </h2>
              <p className="text-slate-600 text-base">
                Bảng xếp hạng doanh số thời gian thực giúp ban giám đốc có cơ sở khen thưởng và định hướng đội ngũ kịp thời.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200 text-center">
                <div className="text-3xl font-black text-blue-600">84.5%</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Đạt Chỉ Tiêu Doanh Số</div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Toàn bộ phòng kinh doanh đã hoàn thành 84.5% KPI kế hoạch tháng.
                </p>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200 text-center">
                <div className="text-3xl font-black text-emerald-600">3.2 Ngày</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Chu Kỳ Đóng Đơn Trung Bình</div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Rút ngắn 48% thời gian từ lúc nhận Lead đến khi ký đơn hàng.
                </p>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200 text-center">
                <div className="text-3xl font-black text-indigo-600">12.8 Tỷ</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Tổng Dòng Tiền Kỳ Vọng</div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Dự báo doanh thu lũy kế từ các Deals đang ở bước đàm phán cuối.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. CRM WORKFLOW VISUALIZATION (4 Simple Steps)
            ========================================================================= */}
        <section className="py-20 bg-gradient-to-b from-[#F8FAFC] to-white border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                Quy Trình 4 Bước
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Triển khai quản trị quan hệ khách hàng chuẩn mực
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-black text-xs flex items-center justify-center mx-auto mb-3">
                  1
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Tiếp Nhận & Ghi Danh</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Nhập thông tin người liên hệ hoặc tự động đồng bộ từ chiến dịch quảng cáo.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-black text-xs flex items-center justify-center mx-auto mb-3">
                  2
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Tư Vấn & Gửi Báo Giá</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Đánh giá nhu cầu và xuất báo giá chính sách đại lý chỉ trong 2 phút.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-black text-xs flex items-center justify-center mx-auto mb-3">
                  3
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Chốt Đơn & Liên Thông Kho</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Chuyển cơ hội thành Đơn Bán Hàng, tự động kích hoạt thủ tục xuất kho.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 font-black text-xs flex items-center justify-center mx-auto mb-3">
                  4
                </span>
                <h4 className="font-bold text-emerald-900 text-sm">Chăm Sóc & Tái Mua</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Lưu trữ công nợ và kích hoạt lịch nhắc chăm sóc sau bán hàng định kỳ.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            10. FINAL CONVERSION CALL-TO-ACTION SECTION
            ========================================================================= */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Sẵn sàng gia tăng 35% doanh số cùng BizPro+ CRM?
            </h2>
            <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto">
              Bắt đầu ngay hôm nay. Khởi tạo tài khoản dùng thử chỉ mất 30 giây, không yêu cầu thẻ tín dụng.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-full bg-white text-blue-600 text-sm font-bold shadow-xl hover:bg-blue-50 transition-all hover:scale-105"
              >
                Dùng thử 14 ngày miễn phí
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 rounded-full bg-blue-700/60 hover:bg-blue-700 text-white text-sm font-bold border border-white/20 transition-all"
              >
                Đặt lịch tư vấn & Demo 1:1
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
