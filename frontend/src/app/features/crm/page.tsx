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
  ArrowLeft,
  DollarSign,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

interface DealItem {
  id: string;
  title: string;
  customer: string;
  amount: number;
  stage: number; // 1: Khảo sát, 2: Báo giá, 3: Đàm phán, 4: Won
  probability: number;
}

export default function CRMFeaturePage() {
  const [dateFilter, setDateFilter] = useState("30 ngày gần nhất");

  // BANT Lead Scoring State
  const [bantBudget, setBantBudget] = useState<number>(70);
  const [bantAuthority, setBantAuthority] = useState<number>(75);
  const [bantNeed, setBantNeed] = useState<number>(100);
  const [bantTimeline, setBantTimeline] = useState<number>(75);

  const totalBantScore = Math.round(
    bantBudget * 0.3 +
    bantAuthority * 0.25 +
    bantNeed * 0.25 +
    bantTimeline * 0.2
  );

  const getBantClassification = (score: number) => {
    if (score >= 75) {
      return {
        label: "SQL (Sales Qualified Lead)",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
        badge: "Đạt chuẩn Sales Trực tiếp",
        sla: "15 phút (Ưu tiên phân bổ AE Cấp cao)",
        action: "Chuyển thẳng vào Phễu Bán Hàng & Tạo Lịch Demo 1:1 ngay",
      };
    }
    if (score >= 50) {
      return {
        label: "MQL (Marketing Qualified Lead)",
        color: "bg-blue-100 text-blue-800 border-blue-300",
        badge: "Tiềm năng Trung bình",
        sla: "2 giờ (Phân bổ cho BDR liên hệ)",
        action: "Gửi tài liệu giải pháp chuyên sâu & Mời tham gia Webinar",
      };
    }
    return {
      label: "Information / Nurture Lead",
      color: "bg-amber-100 text-amber-800 border-amber-300",
      badge: "Cần Nuôi Dưỡng Thêm",
      sla: "24 giờ (Hệ thống tự động)",
      action: "Đưa vào luồng Email Drip & Zalo ZNS chăm sóc định kỳ",
    };
  };

  const classification = getBantClassification(totalBantScore);

  // Kanban Deals Simulator State
  const [deals, setDeals] = useState<DealItem[]>([
    {
      id: "deal-1",
      title: "Gói ERP Chuỗi Bán Lẻ 10 Điểm",
      customer: "Siêu thị Mart 24",
      amount: 120000000,
      stage: 1,
      probability: 25,
    },
    {
      id: "deal-2",
      title: "Giải Pháp Quản Lý 5 Kho Hàng WMS",
      customer: "LogiFast JSC",
      amount: 280000000,
      stage: 2,
      probability: 50,
    },
    {
      id: "deal-3",
      title: "Hợp Đồng ERP Doanh Nghiệp 2026",
      customer: "Petro Mekong",
      amount: 540000000,
      stage: 3,
      probability: 75,
    },
    {
      id: "deal-4",
      title: "Hệ Thống Phân Phối Dược Phẩm",
      customer: "Dược Phẩm MediCare",
      amount: 890000000,
      stage: 4,
      probability: 100,
    },
  ]);

  const moveDeal = (id: string, delta: number) => {
    setDeals((prev) =>
      prev.map((deal) => {
        if (deal.id === id) {
          const newStage = Math.min(4, Math.max(1, deal.stage + delta));
          const probMap: Record<number, number> = { 1: 25, 2: 50, 3: 75, 4: 100 };
          return { ...deal, stage: newStage, probability: probMap[newStage] };
        }
        return deal;
      })
    );
  };

  // RFM Segmentation Matrix State
  const [selectedRfm, setSelectedRfm] = useState<string>("champions");

  const rfmSegments: Record<
    string,
    {
      name: string;
      rScore: string;
      fScore: string;
      mScore: string;
      share: string;
      revenueContribution: string;
      description: string;
      strategy: string;
      badgeColor: string;
    }
  > = {
    champions: {
      name: "VIP Diamond / Champions (Khách Hàng Kim Cương)",
      rScore: "R: 4-5 (≤ 30 ngày)",
      fScore: "F: 4-5 (≥ 24 đơn/năm)",
      mScore: "M: 4-5 (> 500 Tr VNĐ)",
      share: "8% Tệp khách hàng",
      revenueContribution: "52% Tổng doanh thu",
      description: "Khách hàng mua thường xuyên nhất, chi tiêu lớn nhất và luôn thanh toán đúng hạn.",
      strategy: "Gán đích danh Key Account Manager, chiết khấu VIP 15%, quyền trải nghiệm tính năng mới trước 3 tháng.",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    },
    loyal: {
      name: "Loyal Customers (Khách Hàng Thân Thiết)",
      rScore: "R: 3-5 (30-90 ngày)",
      fScore: "F: 3-4 (12-23 đơn/năm)",
      mScore: "M: 3-4 (200-500 Tr VNĐ)",
      share: "18% Tệp khách hàng",
      revenueContribution: "26% Tổng doanh thu",
      description: "Đơn vị kinh doanh trung thành, thường xuyên đặt hàng bổ sung theo tháng.",
      strategy: "Upsell module bổ trợ (Hóa đơn điện tử, Đa sàn TMĐT), chính sách thưởng hạn mức công nợ 45 ngày.",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    },
    potential: {
      name: "Potential Loyalists (Khách Tiềm Năng Phát Triển)",
      rScore: "R: 4-5 (≤ 30 ngày)",
      fScore: "F: 1-2 (1-5 đơn)",
      mScore: "M: 2-4 (50-200 Tr VNĐ)",
      share: "24% Tệp khách hàng",
      revenueContribution: "12% Tổng doanh thu",
      description: "Mới ký kết hợp đồng gần đây với giá trị trung bình khá, cần hướng dẫn khai thác tối đa.",
      strategy: "Hỗ trợ đào tạo nhân sự sử dụng, gửi voucher giảm 5% cho đơn hàng kế tiếp trong 30 ngày.",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    at_risk: {
      name: "At Risk / Hibernating (Nguy Cơ Rời Bỏ)",
      rScore: "R: 1-2 (> 180 ngày)",
      fScore: "F: 2-5 (Từng mua nhiều)",
      mScore: "M: 2-5 (Doanh số cao cũ)",
      share: "12% Tệp khách hàng",
      revenueContribution: "8% Doanh thu kỳ vọng",
      description: "Khách hàng từng có doanh thu lớn nhưng đã quá 6 tháng chưa phát sinh giao dịch mới.",
      strategy: "Kích hoạt cảnh báo tới Giám đốc Kinh doanh, thực hiện cuộc gọi chăm sóc tìm hiểu vướng mắc và ưu đãi hồi sinh.",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    },
    lost: {
      name: "Lost / Churned (Đã Rời Bỏ)",
      rScore: "R: 1 (> 270 ngày)",
      fScore: "F: 1 (Chỉ 1 đơn lẻ)",
      mScore: "M: 1 (< 15 Tr VNĐ)",
      share: "38% Tệp khách hàng",
      revenueContribution: "2% Tổng doanh thu",
      description: "Khách hàng không hoạt động trong thời gian dài, có thể đã chuyển sang đối thủ cạnh tranh.",
      strategy: "Gửi khảo sát lý do ngừng sử dụng, lưu trữ hồ sơ và kích hoạt chiến dịch tiếp thị lại sau 6 tháng.",
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    },
  };

  const activeRfm = rfmSegments[selectedRfm];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      <MarketingHeader />

      <main className="flex-1 w-full overflow-x-hidden">
        {/* =========================================================================
            ENTERPRISE DEMO TRANSPARENCY BANNER
            ========================================================================= */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 text-center font-medium">
          <span>
            ⚠️ <strong>Bản trình bày mô phỏng quy trình Lead-to-Cash & Phân tích RFM (Demo Simulation)</strong> — 
            Phục vụ trải nghiệm kiến trúc quản trị quan hệ khách hàng và phân khúc tự động theo đặc tả kỹ thuật Phase 4H.
          </span>
        </div>

        {/* =========================================================================
            1. CRM HERO SECTION
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
                  Thu thập Lead từ đa kênh, đánh giá chất lượng BANT tự động, điều phối cơ hội qua bảng Kanban và phân tích phân khúc RFM để gia tăng giá trị trọn đời khách hàng.
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

                  <a
                    href="#bant-scoring-simulator"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold shadow-2xs transition-all hover:-translate-y-0.5"
                  >
                    <Target className="w-4 h-4 mr-2 text-blue-600" />
                    <span>Mô phỏng chấm điểm BANT</span>
                  </a>
                </div>

                {/* Metrics */}
                <div className="pt-6 border-t border-slate-200/70 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">10,000+</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Khách hàng (Mục tiêu thiết kế)</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">+35%</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Chốt đơn (Kịch bản BANT)</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">4.9 / 5</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Hài lòng (Khảo sát kịch bản)</div>
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
                      <span className="text-xs font-bold text-slate-800">Bảng Quản Trị CRM & Doanh Số (Mô phỏng)</span>
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
                      <div className="text-xs font-bold text-slate-800">Khách Hàng Tiêu Biểu</div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-100">
                          <span className="font-semibold text-slate-800 truncate max-w-[90px]">Việt An JSC</span>
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
            3. LEAD MANAGEMENT & INTERACTIVE BANT SCORING SIMULATOR
            ========================================================================= */}
        <section id="bant-scoring-simulator" className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                  Đặc Tả Kỹ Thuật Phase 4H
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Chấm Điểm Lead BANT Tự Động &amp; Định Tuyến SLA
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Đánh giá khách hàng tiềm năng dựa trên mô hình chuẩn hóa 4 trọng số: Ngân sách (30%), Quyền hạn (25%), Nhu cầu (25%) và Thời gian (20%). Lead đạt chuẩn được định tuyến đến đúng người với SLA cam kết.
                </p>
                
                <div className="space-y-3 text-xs text-slate-700 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>SQL (≥ 75 điểm):</strong> Phân bổ ngay cho AE Cấp cao (SLA: 15 phút)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span><strong>MQL (50 - 74 điểm):</strong> Phân bổ cho BDR (SLA: 2 giờ)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>Nurture (&lt; 50 điểm):</strong> Chăm sóc tự động qua Email Drip / Zalo ZNS</span>
                  </div>
                </div>
              </div>

              {/* Interactive BANT Calculator Card */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-slate-900 text-base">Bộ Mô Phỏng Thuật Toán Chấm Điểm BANT</h3>
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold">
                    Thời gian thực
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Budget Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex justify-between">
                      <span>1. Ngân sách (Budget - 30%)</span>
                      <span className="text-blue-600">{bantBudget} đ</span>
                    </label>
                    <select
                      value={bantBudget}
                      onChange={(e) => setBantBudget(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 font-medium"
                    >
                      <option value={100}>&gt; 200 Triệu VNĐ (100 đ - Ngân sách sẵn sàng)</option>
                      <option value={70}>50 - 200 Triệu VNĐ (70 đ - Đang xem xét cấp)</option>
                      <option value={30}>&lt; 50 Triệu VNĐ (30 đ - Ngân sách hạn chế)</option>
                      <option value={0}>Chưa xác định ngân sách (0 đ)</option>
                    </select>
                  </div>

                  {/* Authority Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex justify-between">
                      <span>2. Quyền hạn (Authority - 25%)</span>
                      <span className="text-blue-600">{bantAuthority} đ</span>
                    </label>
                    <select
                      value={bantAuthority}
                      onChange={(e) => setBantAuthority(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 font-medium"
                    >
                      <option value={100}>C-Level / Chủ tịch / Tổng Giám Đốc (100 đ)</option>
                      <option value={75}>Trưởng phòng / Trưởng ban mua hàng (75 đ)</option>
                      <option value={40}>Chuyên viên đánh giá giải pháp (40 đ)</option>
                      <option value={10}>Nhân viên tìm hiểu sơ bộ (10 đ)</option>
                    </select>
                  </div>

                  {/* Need Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex justify-between">
                      <span>3. Nhu cầu cấp thiết (Need - 25%)</span>
                      <span className="text-blue-600">{bantNeed} đ</span>
                    </label>
                    <select
                      value={bantNeed}
                      onChange={(e) => setBantNeed(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 font-medium"
                    >
                      <option value={100}>Đang chịu phạt vận hành / Quy chuẩn thuế TT78 (100 đ)</option>
                      <option value={70}>Muốn thay thế phần mềm cũ chậm chạp (70 đ)</option>
                      <option value={30}>Tìm hiểu tính năng chung (30 đ)</option>
                      <option value={0}>Chưa có nhu cầu cụ thể (0 đ)</option>
                    </select>
                  </div>

                  {/* Timeline Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex justify-between">
                      <span>4. Thời gian triển khai (Timeline - 20%)</span>
                      <span className="text-blue-600">{bantTimeline} đ</span>
                    </label>
                    <select
                      value={bantTimeline}
                      onChange={(e) => setBantTimeline(Number(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 font-medium"
                    >
                      <option value={100}>Trong vòng 30 ngày tới (100 đ)</option>
                      <option value={75}>Từ 1 đến 3 tháng (75 đ)</option>
                      <option value={40}>Từ 3 đến 6 tháng (40 đ)</option>
                      <option value={10}>&gt; 6 tháng hoặc chưa rõ (10 đ)</option>
                    </select>
                  </div>
                </div>

                {/* Score Output & Classification Box */}
                <div className={`p-5 rounded-2xl border ${classification.color} space-y-3`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider">Tổng Điểm BANT Chuẩn Hóa:</div>
                      <div className="text-3xl font-black">{totalBantScore} / 100 Điểm</div>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-full font-bold text-xs border bg-white/80 shadow-2xs">
                      {classification.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-black/10">
                    <div>
                      <span className="font-semibold">Cam kết phản hồi (SLA):</span> {classification.sla}
                    </div>
                    <div>
                      <span className="font-semibold">Kịch bản kích hoạt:</span> {classification.action}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. SALES PIPELINE (INTERACTIVE KANBAN DEALS SIMULATOR)
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                Phễu Chuyển Đổi Kanban Tương Tác
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Kiểm Soát Cơ Hội Bán Hàng &amp; Dòng Tiền Dự Báo
              </h2>
              <p className="text-slate-600 text-base">
                Mô phỏng quy trình dịch chuyển cơ hội kinh doanh qua 4 giai đoạn chuẩn mực. Nhấp nút điều hướng để cập nhật xác suất chốt đơn và chuyển đổi sang Đơn Bán Hàng.
              </p>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { stageNum: 1, title: "1. Khảo Sát Nhu Cầu", color: "bg-slate-50 border-slate-200 text-slate-800" },
                { stageNum: 2, title: "2. Gửi Báo Giá & Demo", color: "bg-blue-50/50 border-blue-200 text-blue-900" },
                { stageNum: 3, title: "3. Đàm Phán Hợp Đồng", color: "bg-amber-50/50 border-amber-200 text-amber-900" },
                { stageNum: 4, title: "4. Ký Kết Thành Công (Won)", color: "bg-emerald-50/50 border-emerald-200 text-emerald-900" },
              ].map((col) => {
                const stageDeals = deals.filter((d) => d.stage === col.stageNum);
                const stageTotal = stageDeals.reduce((sum, d) => sum + d.amount, 0);

                return (
                  <div key={col.stageNum} className={`rounded-2xl p-4 border ${col.color} flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-black/10">
                        <span className="text-xs font-bold">{col.title}</span>
                        <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border shadow-2xs">
                          {stageDeals.length} Deals
                        </span>
                      </div>

                      <div className="space-y-3">
                        {stageDeals.map((deal) => (
                          <div
                            key={deal.id}
                            className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs space-y-2"
                          >
                            <div className="text-xs font-bold text-slate-900">{deal.title}</div>
                            <div className="text-[11px] text-slate-500">{deal.customer}</div>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-xs font-bold text-blue-600">
                                {deal.amount.toLocaleString("vi-VN")} đ
                              </span>
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                {deal.probability}% xác suất
                              </span>
                            </div>

                            {/* Stage Transition Controls */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <button
                                onClick={() => moveDeal(deal.id, -1)}
                                disabled={deal.stage <= 1}
                                className="text-[10px] font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-0.5"
                              >
                                <ArrowLeft className="w-3 h-3" />
                                <span>Lùi</span>
                              </button>
                              
                              {deal.stage === 4 ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                  ✓ Đã xuất đơn ERP
                                </span>
                              ) : (
                                <button
                                  onClick={() => moveDeal(deal.id, 1)}
                                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                                >
                                  <span>Tiếp</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {stageDeals.length === 0 && (
                          <div className="p-4 text-center text-xs text-slate-400 italic">
                            Chưa có cơ hội ở giai đoạn này
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 mt-4 border-t border-black/10 flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Tổng giá trị:</span>
                      <span className="font-bold text-slate-900">{stageTotal.toLocaleString("vi-VN")} đ</span>
                    </div>
                  </div>
                );
              })}
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
                    href="/features/sales-order"
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>Xem liên thông Đơn Bán Hàng &amp; Hóa Đơn VAT</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. RFM CUSTOMATION SEGMENTATION MATRIX SIMULATOR
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
                Phân Loại Khách Hàng Tự Động (RFM)
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Ma Trận Phân Khúc RFM: Recency, Frequency &amp; Monetary
              </h2>
              <p className="text-slate-600 text-base">
                Hệ thống tự động chấm điểm lượng hóa theo tần suất, độ mới và giá trị mua để kích hoạt kịch bản chăm sóc tương ứng.
              </p>
            </div>

            {/* Segment Selector Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {Object.entries(rfmSegments).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setSelectedRfm(key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedRfm === key
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {item.name.split("/")[0]}
                </button>
              ))}
            </div>

            {/* Selected RFM Segment Details Card */}
            <div className="max-w-4xl mx-auto bg-gradient-to-b from-[#F8FAFC] to-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${activeRfm.badgeColor}`}>
                    {activeRfm.share}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-2">{activeRfm.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-medium">Đóng góp doanh thu</div>
                  <div className="text-xl font-extrabold text-blue-600">{activeRfm.revenueContribution}</div>
                </div>
              </div>

              {/* RFM Score Quintiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                  <div className="text-xs text-slate-500 font-semibold">Độ Gần (Recency)</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{activeRfm.rScore}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                  <div className="text-xs text-slate-500 font-semibold">Tần Suất (Frequency)</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{activeRfm.fScore}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/80">
                  <div className="text-xs text-slate-500 font-semibold">Doanh Số (Monetary)</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{activeRfm.mScore}</div>
                </div>
              </div>

              {/* Behavior Description & Actionable Strategy */}
              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hành Vi Tiêu Biểu:</h4>
                  <p className="text-sm text-slate-600 mt-1">{activeRfm.description}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Kịch Bản Tự Động Hóa CRM (Playbook):</h4>
                  <p className="text-xs text-blue-800 font-medium mt-1 leading-relaxed">{activeRfm.strategy}</p>
                </div>
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
              Sẵn sàng gia tăng doanh số cùng BizPro+ CRM?
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
