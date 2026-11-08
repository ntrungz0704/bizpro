"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  Clock,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building2,
  ArrowRight,
  Play,
  Star,
  Check,
  Lock,
  Award,
  Sparkles,
  FileText,
  TrendingUp,
  MapPin,
  Navigation,
  Calculator,
  CheckCheck,
  DollarSign,
  Smartphone,
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function HRMFeaturePage() {
  const [activeTab, setActiveTab] = useState<"gps" | "payroll">("gps");
  const [selectedLocation, setSelectedLocation] = useState<"keangnam" | "bitexco" | "remote">("keangnam");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [grossSalary, setGrossSalary] = useState<number>(25000000);
  const [dependents, setDependents] = useState<number>(1);

  // Payroll calculation logic (Vietnam Labor Law 2019 & PIT law)
  const insuranceSalary = Math.min(grossSalary, 46800000); // Mức trần đóng BHXH/BHYT 20 lần lương cơ sở 2.34tr
  const employeeBhxh = insuranceSalary * 0.08;
  const employeeBhyt = insuranceSalary * 0.015;
  const employeeBhtn = Math.min(grossSalary, 99200000) * 0.01; // Mức trần BHTN
  const totalInsurance = employeeBhxh + employeeBhyt + employeeBhtn;

  const personalDeduction = 11000000;
  const dependentDeduction = dependents * 4400000;
  const totalDeductions = totalInsurance + personalDeduction + dependentDeduction;

  const taxableIncome = Math.max(0, grossSalary - totalDeductions);

  // 7-Bracket Progressive PIT Calculation
  let pitTax = 0;
  if (taxableIncome > 80000000) {
    pitTax = 18150000 + (taxableIncome - 80000000) * 0.35;
  } else if (taxableIncome > 52000000) {
    pitTax = 9750000 + (taxableIncome - 52000000) * 0.30;
  } else if (taxableIncome > 32000000) {
    pitTax = 4750000 + (taxableIncome - 32000000) * 0.25;
  } else if (taxableIncome > 18000000) {
    pitTax = 1950000 + (taxableIncome - 18000000) * 0.20;
  } else if (taxableIncome > 10000000) {
    pitTax = 750000 + (taxableIncome - 10000000) * 0.15;
  } else if (taxableIncome > 5000000) {
    pitTax = 250000 + (taxableIncome - 5000000) * 0.10;
  } else if (taxableIncome > 0) {
    pitTax = taxableIncome * 0.05;
  }

  const netSalary = grossSalary - totalInsurance - pitTax;
  const employerCost = grossSalary + (insuranceSalary * 0.175) + (insuranceSalary * 0.03) + (Math.min(grossSalary, 99200000) * 0.01) + (insuranceSalary * 0.02);
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-indigo-100 selection:text-indigo-800">
      <MarketingHeader />

      <main className="flex-1 w-full overflow-x-hidden">
        {/* =========================================================================
            1. HRM HERO SECTION (100% Vietnamese)
            ========================================================================= */}
        <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-400/10 via-sky-300/10 to-transparent blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-24 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/10 via-indigo-300/10 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              
              {/* Left Column: Hero Text */}
              <div className="lg:col-span-6 space-y-6 text-left">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                  <Link href="/features" className="hover:underline flex items-center gap-1">
                    <span>Tính năng</span>
                  </Link>
                  <span>&gt;</span>
                  <span className="text-slate-800">Quản Trị Nhân Sự (HRM)</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-[1.2] [text-wrap:balance]">
                  Quản Trị Nhân Sự Tinh Gọn, <br className="hidden sm:inline" />
                  <span className="text-indigo-600">Điểm Danh 1 Chạm</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                  Số hóa toàn bộ hồ sơ nhân viên, điểm danh trực tuyến nhanh chóng, phê duyệt nghỉ phép đa cấp và bảo mật tiền lương tuyệt đối theo ma trận 66 vai trò.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
                  >
                    <span>Trải nghiệm Nhân Sự miễn phí</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>

                  <Link
                    href="/demo"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold shadow-2xs transition-all hover:-translate-y-0.5"
                  >
                    <Play className="w-4 h-4 mr-2 fill-slate-700 text-slate-700" />
                    <span>Xem video giới thiệu</span>
                  </Link>
                </div>

                <div className="pt-6 border-t border-slate-200/70 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">Số Hóa</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Toàn diện (Mục tiêu thiết kế)</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">&lt; 1 Phút</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Duyệt phép (Thao tác mẫu)</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">66 Vai trò</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">RBAC (Kiến trúc phân quyền)</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual HRM Mockup Card */}
              <div className="lg:col-span-6 relative">
                {/* Simulation Disclaimer Badge */}
                <div className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>MÔ PHỎNG MINH HỌA — Dữ liệu nhân sự giả lập demo, không kết nối hệ thống runtime.</span>
                </div>

                <div className="relative mx-auto max-w-[640px] rounded-2xl bg-white p-4 sm:p-6 shadow-[0_20px_50px_rgba(79,70,229,0.08)] border border-indigo-100 transition-all">
                  
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800">Bảng Chấm Công Nhân Sự (Tháng 11/2026)</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                      Tỷ lệ đi làm: 98.6%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Tổng nhân sự</div>
                      <div className="text-lg font-extrabold text-slate-900 mt-0.5">286</div>
                    </div>
                    <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                      <div className="text-[11px] text-emerald-700 font-medium">Đã Check-in</div>
                      <div className="text-lg font-extrabold text-emerald-900 mt-0.5">278</div>
                    </div>
                    <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                      <div className="text-[11px] text-amber-700 font-medium">Đi muộn</div>
                      <div className="text-lg font-extrabold text-amber-900 mt-0.5">4</div>
                    </div>
                    <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                      <div className="text-[11px] text-blue-700 font-medium">Nghỉ phép năm</div>
                      <div className="text-lg font-extrabold text-blue-900 mt-0.5">4</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-2">
                    <div className="text-xs font-bold text-slate-800">Hành Động Điểm Danh 1 Chạm</div>
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-bold text-slate-900">Nguyễn Văn Admin</div>
                          <div className="text-[10px] text-slate-500">Giờ vào: 08:24:15 • Wifi Văn Phòng Keangnam</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Đúng giờ
                      </span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            2. EMPLOYEE DIRECTORY & DIGITAL PROFILES
            ========================================================================= */}
        <section className="py-20 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
                  Hồ Sơ Nhân Sự Điện Tử
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Lưu trữ trọn đời hồ sơ ứng viên & nhân viên chính thức
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Quản lý đầy đủ hợp đồng lao động, số bảo hiểm xã hội, bằng cấp chuyên môn, phòng ban và chức vụ. 
                  Dễ dàng tra cứu thông tin liên lạc và người thân khi cần thiết.
                </p>
                <div className="pt-2">
                  <Link
                    href="/hrm/employees"
                    className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>Xem danh sách nhân viên trong ứng dụng</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs font-bold text-slate-800">
                  <span>Hồ Sơ Điện Tử: NV-2026-0042</span>
                  <span className="text-indigo-600">Hợp đồng không thời hạn</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Họ và tên:</span>
                    <span className="font-bold text-slate-900">Trần Thị Thu Thảo</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Phòng ban:</span>
                    <span className="font-bold text-indigo-600">Phòng Kinh Doanh & Tiếp Thị</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Chức vụ:</span>
                    <span className="font-bold text-slate-900">Trưởng nhóm Bán hàng Doanh nghiệp</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Ngày gia nhập:</span>
                    <span className="font-bold text-slate-900">15/03/2023 (3 năm cống hiến)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. INTERACTIVE GPS GEO-FENCING & PAYROLL SIMULATOR (PHASE 4G)
            ========================================================================= */}
        <section className="py-20 bg-[#0B101E] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-3xl pointer-events-none -z-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Navigation className="w-3.5 h-3.5" />
                Kiến Trúc Nhân Sự & Lương Tự Động (Phase 4G)
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Chấm Công GPS Geo-fencing & Tính Lương Gross-to-Net
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Đo khoảng cách thực tế bằng thuật toán Haversine chống giả lập vị trí. Tự động tính thuế TNCN lũy tiến 7 bậc và bảo hiểm bắt buộc theo chuẩn pháp luật Việt Nam.
              </p>
            </div>

            {/* Simulation Disclaimer Banner */}
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>MÔ PHỎNG MINH HỌA — Dữ liệu giả lập demo theo đặc tả kỹ thuật Phase 4G (SPEC-ONLY).</span>
              </div>
              <span className="text-[10px] text-amber-400/80 uppercase font-bold tracking-wider hidden sm:inline">Interactive Demo</span>
            </div>

            {/* Selector Tabs */}
            <div className="max-w-md mx-auto flex p-1.5 rounded-2xl bg-white/5 border border-white/10 mb-8">
              <button
                type="button"
                onClick={() => setActiveTab("gps")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "gps"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                1. Chấm Công GPS Geo-fencing
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("payroll")}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "payroll"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                2. Tính Lương Gross sang Net
              </button>
            </div>

            {/* Tab 1: GPS Geo-Fencing Demo */}
            {activeTab === "gps" && (
              <div className="max-w-4xl mx-auto bg-white/[0.04] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Chọn Điểm Mô Phỏng Vị Trí Thiết Bị
                    </div>
                    <div className="space-y-2">
                      {[
                        { id: "keangnam", name: "Trụ sở Hà Nội (Keangnam Landmark)", distance: "35m", valid: true },
                        { id: "bitexco", name: "Chi nhánh TP.HCM (Bitexco Q1)", distance: "42m", valid: true },
                        { id: "remote", name: "Ngoài văn phòng (Quán Café / Nhà riêng)", distance: "450m", valid: false },
                      ].map((loc) => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => {
                            setSelectedLocation(loc.id as any);
                            setIsCheckedIn(false);
                          }}
                          className={`w-full p-3 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                            selectedLocation === loc.id
                              ? "bg-indigo-600/30 border-indigo-500 text-white"
                              : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          <div>
                            <div className="font-bold">{loc.name}</div>
                            <div className="text-[11px] text-slate-400">Khoảng cách Haversine: {loc.distance}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${loc.valid ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                            {loc.valid ? "Bán kính ≤ 100m" : "Vượt bán kính"}
                          </span>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCheckedIn(true)}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Bấm Thử Nghiệm Check-in GPS 1 Chạm</span>
                    </button>
                  </div>

                  <div className="lg:col-span-6 bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3 text-xs">
                    <div className="flex justify-between pb-2 border-b border-white/10 text-slate-400">
                      <span>Thuật toán kiểm định</span>
                      <span className="font-mono text-indigo-300">WGS-84 Haversine</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                      <div className="text-slate-400 text-[11px]">Bảo mật chống giả mạo (Anti-Spoofing):</div>
                      <div className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mock Location Flag: FALSE (Không phát hiện fake GPS)</span>
                      </div>
                      <div className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Wi-Fi BSSID: Keangnam-Office-5G khớp địa chỉ MAC</span>
                      </div>
                    </div>

                    {isCheckedIn ? (
                      <div className={`p-4 rounded-xl border ${selectedLocation !== "remote" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200" : "bg-amber-500/10 border-amber-500/30 text-amber-200"}`}>
                        <div className="font-bold text-sm mb-1">
                          {selectedLocation !== "remote" ? "✓ Check-in Thành Công Hợp Lệ" : "⚠️ Cảnh Báo Ngoài Bán Kính Chấm Công"}
                        </div>
                        <div className="text-[11px] opacity-90 leading-relaxed">
                          {selectedLocation !== "remote"
                            ? "Tọa độ WGS84 nằm trong bán kính 100m của văn phòng. Đã ghi nhận thời gian 08:30:15 và tự động đối soát ca làm việc."
                            : "Khoảng cách thực tế 450m vượt quá bán kính quy định. Hệ thống yêu cầu nhân viên nhập lý do giải trình để Trưởng phòng duyệt."}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-slate-400 text-center py-6">
                        Chưa bấm check-in. Nhấp nút màu tím bên trái để kiểm tra phản hồi.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Gross to Net Payroll Calculator Demo */}
            {activeTab === "payroll" && (
              <div className="max-w-4xl mx-auto bg-white/[0.04] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left: Salary Sliders */}
                  <div className="lg:col-span-5 space-y-5 text-xs">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Cấu Hình Lương Thỏa Thuận (Gross)
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-slate-300">Mức lương thỏa thuận (Gross):</span>
                        <span className="font-bold text-indigo-300">{grossSalary.toLocaleString("vi-VN")} ₫</span>
                      </div>
                      <div className="flex gap-2">
                        {[15000000, 25000000, 40000000].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setGrossSalary(val)}
                            className={`flex-1 py-1.5 rounded-lg border text-[11px] font-bold ${
                              grossSalary === val ? "bg-indigo-600 text-white border-indigo-500" : "bg-white/5 text-slate-300 border-white/5"
                            }`}
                          >
                            {(val / 1000000).toFixed(0)} Triệu
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-slate-300">Người phụ thuộc giảm trừ:</span>
                        <span className="font-bold text-indigo-300">{dependents} người ({(dependents * 4400000).toLocaleString("vi-VN")} ₫)</span>
                      </div>
                      <div className="flex gap-2">
                        {[0, 1, 2].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setDependents(num)}
                            className={`flex-1 py-1.5 rounded-lg border text-[11px] font-bold ${
                              dependents === num ? "bg-indigo-600 text-white border-indigo-500" : "bg-white/5 text-slate-300 border-white/5"
                            }`}
                          >
                            {num} Người
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 text-[11px] space-y-1">
                      <div>• Giảm trừ bản thân: 11.000.000 ₫/tháng</div>
                      <div>• BH bắt buộc NLĐ: 10.5% (BHXH 8%, BHYT 1.5%, BHTN 1%)</div>
                      <div>• Thuế TNCN: Biểu thuế lũy tiến từng phần 7 bậc</div>
                    </div>
                  </div>

                  {/* Right: Payslip Output */}
                  <div className="lg:col-span-7 bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3 text-xs">
                    <div className="flex justify-between pb-3 border-b border-white/10">
                      <div>
                        <div className="font-bold text-white text-sm">Phiếu Lương Dự Kiến (Payslip Simulation)</div>
                        <div className="text-[11px] text-slate-400">Chu kỳ lương: Tháng 11/2026</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        Chuẩn Luật Lao Động 2019
                      </span>
                    </div>

                    <div className="space-y-2 py-2">
                      <div className="flex justify-between text-slate-300">
                        <span>Lương thỏa thuận (Gross):</span>
                        <span className="font-bold text-white">{grossSalary.toLocaleString("vi-VN")} ₫</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>- Bảo hiểm bắt buộc (10.5%):</span>
                        <span className="text-red-400">-{totalInsurance.toLocaleString("vi-VN")} ₫</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>- Thuế TNCN lũy tiến 7 bậc:</span>
                        <span className="text-red-400">-{Math.round(pitTax).toLocaleString("vi-VN")} ₫</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex justify-between items-center bg-white/[0.04] p-3 rounded-xl">
                      <div>
                        <div className="text-[11px] text-slate-400 uppercase font-bold">Thực Lĩnh Cầm Tay (Net Pay):</div>
                        <div className="text-xs text-slate-400">Chuyển khoản ngày mùng 5 hàng tháng</div>
                      </div>
                      <div className="text-xl font-black text-emerald-400">
                        {Math.round(netSalary).toLocaleString("vi-VN")} ₫
                      </div>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-400 flex justify-between">
                      <span>Tổng chi phí quỹ lương doanh nghiệp (gồm 23.5% bảo hiểm):</span>
                      <span className="font-bold text-indigo-300">{Math.round(employerCost).toLocaleString("vi-VN")} ₫</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </section>

        {/* =========================================================================
            4. LEAVE MANAGEMENT & APPROVAL FLOW
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="text-xs font-bold text-slate-800 pb-3 border-b border-slate-200">
                  Quy Trình Phê Duyệt Nghỉ Phép Trực Tuyến
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900">Lê Hoàng Long • Xin nghỉ 1 ngày (18/11)</div>
                  <div className="text-[11px] text-slate-500">Lý do: Khám sức khỏe định kỳ • Quỹ phép còn: 8 ngày</div>
                  <div className="flex gap-2 pt-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded">
                      Trưởng phòng đã duyệt
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold text-[10px] rounded">
                      HR đã ghi nhận
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
                  Quản Lý Nghỉ Phép
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Nộp đơn và duyệt phép trong 60 giây
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Nhân viên nộp đơn nghỉ phép năm, nghỉ ốm hoặc nghỉ việc riêng trực tiếp từ tài khoản của mình. 
                  Trưởng bộ phận nhận thông báo và phê duyệt tức thì mà không cần ký giấy tờ rườm rà.
                </p>
                <div className="pt-2">
                  <Link
                    href="/hrm/leave"
                    className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>Xem giao diện Nghỉ Phép trong ứng dụng</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. ORGANIZATIONAL STRUCTURE & DEPARTMENT TREES
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
              Sơ Đồ Tổ Chức
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Phân cấp phòng ban trực quan, rõ ràng quyền hạn
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Thiết lập cây sơ đồ tổ chức linh hoạt từ Ban Giám Đốc, Khối Kinh Doanh, Khối Kho Vận đến Kế Toán và Hành Chính Nhân Sự.
            </p>
          </div>
        </section>

        {/* =========================================================================
            6. PAYROLL PRE-CALCULATION & SALARY CONFIDENTIALITY
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
              Bảo Mật Lương Bổng
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tự động tính lương theo ngày công thực tế, bảo mật tuyệt đối
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Hệ thống tự động tổng hợp số ngày công làm việc, số lần đi muộn và ngày nghỉ phép có lương để tạm tính bảng lương cuối tháng. 
              Chỉ những quản trị viên được cấp quyền mới có thể truy cập số liệu tài chính nhạy cảm này.
            </p>
          </div>
        </section>

        {/* =========================================================================
            7. 66-PERMISSION ROLE-BASED ACCESS CONTROL
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC] border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
              Ma Trận Quyền Hạn
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Phân quyền chi tiết tới 66 quyền năng
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Nhân viên chỉ nhìn thấy dữ liệu thuộc phạm vi công việc của mình: Nhân viên bán hàng chỉ thấy đơn của mình, 
              thủ kho chỉ quản lý phiếu xuất nhập, và kế toán chỉ xem số liệu tài chính.
            </p>
          </div>
        </section>

        {/* =========================================================================
            8. HR ANALYTICS & HEADCOUNT TURNOVER
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-3xl font-black text-indigo-600">98.6%</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Tỷ Lệ Đi Làm Đúng Giờ</div>
              </div>
              <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-3xl font-black text-emerald-600">2.1%</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Tỷ Lệ Nghỉ Việc Thấp</div>
              </div>
              <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-3xl font-black text-blue-600">100%</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Số Hóa Hồ Sơ Lao Động</div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. EMPLOYEE LIFECYCLE JOURNEY
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
              Vòng Đời Nhân Sự
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Đồng hành cùng nhân tài từ lúc ứng tuyển đến khi gắn bó lâu dài
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Giai đoạn thử việc 2 tháng → Ký kết hợp đồng chính thức → Đánh giá hiệu suất định kỳ → Bổ nhiệm cán bộ cốt cán.
            </p>
          </div>
        </section>

        {/* =========================================================================
            10. FINAL CALL TO ACTION
            ========================================================================= */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-700 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Hiện đại hóa phòng nhân sự của bạn cùng BizPro+ HRM
            </h2>
            <p className="text-indigo-100 text-base sm:text-lg max-w-2xl mx-auto">
              Trải nghiệm điểm danh 1 chạm và quản trị nhân sự số miễn phí 14 ngày.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-full bg-white text-indigo-800 text-sm font-bold shadow-xl hover:bg-indigo-50 transition-all hover:scale-105"
              >
                Dùng thử 14 ngày miễn phí
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 rounded-full bg-indigo-800/60 hover:bg-indigo-800 text-white text-sm font-bold border border-white/20 transition-all"
              >
                Đặt lịch tư vấn giải pháp nhân sự
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
