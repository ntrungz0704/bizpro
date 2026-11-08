"use client";

import React from "react";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AppPreviewCanvas from "@/components/marketing/AppPreviewCanvas";
import InteractiveComparison from "@/components/marketing/InteractiveComparison";
import InteractiveModuleShowcase from "@/components/marketing/InteractiveModuleShowcase";
import PartnerLogos from "@/components/marketing/PartnerLogos";
import ShinyButton from "@/components/animation/ShinyButton";
import SpotlightCard from "@/components/animation/SpotlightCard";
import FadeReveal from "@/components/animation/FadeReveal";
import {
  Users,
  Warehouse,
  ShoppingCart,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Zap,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Building2,
  Truck,
  Store,
  Layers,
  Clock,
  Coins,
  Receipt,
  Globe,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface antialiased selection:bg-blue-100 selection:text-blue-700">
      <MarketingHeader />

      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
          {/* =========================================================================
              SECTION 1: HERO SECTION & INTERACTIVE LIVE PRODUCT PREVIEW
              ========================================================================= */}
          <section className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50/50 via-surface to-surface pt-12 pb-16 lg:pt-16 lg:pb-24">
            {/* Ambient Lighting Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-blue-400/15 via-sky-300/10 to-transparent blur-3xl pointer-events-none -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              {/* Eyebrow Tag */}
              <FadeReveal direction="up" delay={0.1}>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>Hệ Thống Quản Trị Hợp Nhất Doanh Nghiệp 2026</span>
                </div>
              </FadeReveal>

              {/* Main Headline */}
              <FadeReveal direction="up" delay={0.2}>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
                  Một Nền Tảng. <br />
                  <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
                    Tự Động Hóa Toàn Diện Mọi Luồng Dữ Liệu.
                  </span>
                </h1>
              </FadeReveal>

              {/* Punchy Subtitle */}
              <FadeReveal direction="up" delay={0.3}>
                <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Hợp nhất liền mạch <strong>CRM</strong>, <strong>Kho vận Atomic</strong>, <strong>Đơn hàng Đa sàn TMĐT</strong>, <strong>Kế toán TT 200</strong>, <strong>Vận chuyển</strong> và <strong>Chấm công GPS</strong>. Hướng tới mục tiêu tối ưu hóa vận hành, giảm thiểu sai sót bán âm và tự động hóa các khâu nhập liệu thủ công.
                </p>
              </FadeReveal>

              {/* Dual Action CTAs */}
              <FadeReveal direction="up" delay={0.4}>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <ShinyButton href="/signup" size="lg" icon>
                    Dùng thử 14 ngày miễn phí
                  </ShinyButton>
                  <ShinyButton href="#interactive-modules" variant="secondary" size="lg">
                    Khám phá tính năng trực quan
                  </ShinyButton>
                </div>
              </FadeReveal>

              {/* Trust Indicators */}
              <FadeReveal direction="up" delay={0.5}>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Hệ sinh thái 6 Phân hệ Toàn diện
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Triển khai dưới 24 giờ
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Bảo mật chuẩn ISO 27001
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    Máy chủ VNPT Tier 3
                  </span>
                </div>
              </FadeReveal>

              {/* LIVE INTERACTIVE PRODUCT CANVAS MOCKUP */}
              <FadeReveal direction="up" delay={0.6}>
                <AppPreviewCanvas />
              </FadeReveal>
            </div>
          </section>

          {/* =========================================================================
              ENTERPRISE CLIENT BRANDS & ECOSYSTEM INTEGRATION SECTION
              ========================================================================= */}
          <FadeReveal direction="up" delay={0.1}>
            <PartnerLogos />
          </FadeReveal>

          {/* =========================================================================
              SECTION 2: 4 CONNECTED BLOCKS & REAL-TIME DATA HIGHWAY
              ========================================================================= */}
          <section className="w-full bg-slate-50/70 border-y border-slate-200/80 py-16 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  MẠNG LƯỚI VẬN HÀNH LIỀN MẠCH
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 tracking-tight">
                  Mọi hoạt động kinh doanh trên một dòng chảy dữ liệu
                </h2>
                <p className="text-sm text-slate-600 mt-2">
                  Dữ liệu từ phòng kinh doanh tự động chuyển sang kho, kế toán và nhân sự không qua trung gian.
                </p>
              </div>

              {/* 6 Connected Blocks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. CRM */}
                <SpotlightCard className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black uppercase text-blue-600 tracking-wider">
                      Phân hệ 01
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      CRM & Khách hàng
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Quản trị quan hệ 360°, theo dõi vòng đời khách hàng, tự động chấm điểm Lead và phân bổ cho Sales.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>Lead ➔ Đơn bán</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </SpotlightCard>

                {/* 2. Orders */}
                <SpotlightCard className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black uppercase text-sky-600 tracking-wider">
                      Phân hệ 02
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      Xử lý Đơn hàng
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Hội tụ đơn từ Shopee, TikTok Shop, Web và POS. Tự động kiểm tra công nợ và sinh lệnh xuất kho.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
                    <span>Lệnh xuất kho tự động</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </SpotlightCard>

                {/* 3. Inventory */}
                <SpotlightCard className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                      <Warehouse className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black uppercase text-emerald-600 tracking-wider">
                      Phân hệ 03
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      Kho vận Atomic
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Kiểm soát xuất - nhập - tồn đa điểm. Khóa giữ tồn tức thời theo mili-giây, kiểm soát tồn kho chặt chẽ nhằm hạn chế tối đa rủi ro bán âm.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                    <span>Cập nhật số dư tức thì</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </SpotlightCard>

                {/* 4. Accounting */}
                <SpotlightCard className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black uppercase text-amber-600 tracking-wider">
                      Phân hệ 04
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      Kế toán & Thuế TT 200
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Định khoản Nợ/Có kép tự động từ đơn hàng và kho. Giảm thuế GTGT 8% (Nghị định 174/2025/NĐ-CP &amp; NQ 204/2025/QH15).
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                    <span>Sổ cái &amp; Hóa đơn TT 78</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </SpotlightCard>

                {/* 5. Omnichannel & Logistics */}
                <SpotlightCard className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                      <Globe className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black uppercase text-purple-600 tracking-wider">
                      Phân hệ 05
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      Đa kênh &amp; Vận chuyển
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Đồng bộ Shopee, TikTok Shop, Lazada. Tự động so sánh cước 6 hãng vận chuyển và đối soát COD minh bạch.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                    <span>Kết nối 6 Hãng Ship</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </SpotlightCard>

                {/* 6. HRM */}
                <SpotlightCard className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-black uppercase text-indigo-600 tracking-wider">
                      Phân hệ 06
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      Nhân sự &amp; Lương thưởng
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Điểm danh định vị GPS 1 chạm, tính hoa hồng theo đơn thực thu, tự động kết toán bảng lương cuối tháng.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                    <span>Kết toán KPI &amp; Chi phí</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                </SpotlightCard>
              </div>

              {/* Data Highway Live Status Bar */}
              <div className="mt-8 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    Kiến trúc luồng dữ liệu hợp nhất 6 phân hệ nghiệp vụ — Thiết kế theo tiêu chuẩn giảm thiểu độ trễ và đồng bộ tức thời (Mục tiêu thiết kế kiến trúc)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Mục tiêu thiết kế
                  </span>
                  <span className="text-xs text-slate-500 hidden md:inline">
                    Hướng tới tự động hóa liền mạch giữa các luồng chứng từ
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              SECTION 3: INTERACTIVE BEFORE VS AFTER (REPLACES WALLS OF ESSAY TEXT)
              ========================================================================= */}
          <section className="w-full bg-surface py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                  THỰC TRẠNG & GIẢI PHÁP
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 tracking-tight">
                  Doanh nghiệp của bạn đang vận hành rời rạc?
                </h2>
                <p className="text-sm text-slate-600 mt-2">
                  So sánh sự khác biệt triệt để giữa phương thức thủ công truyền thống và quy chuẩn hóa tập trung cùng BizPro+.
                </p>
              </div>

              {/* Interactive Problem-Solution Comparison Laboratory */}
              <InteractiveComparison />
            </div>
          </section>

          {/* =========================================================================
              SECTION 4: INTERACTIVE MODULE SHOWCASE (PLAYGROUND WITH REAL STATE)
              ========================================================================= */}
          <section className="w-full bg-slate-50/80 border-y border-slate-200/80 py-16 lg:py-24" id="interactive-modules">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  CHI TIẾT PHÂN HỆ NGHIỆP VỤ
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 tracking-tight">
                  Sức mạnh toàn diện cho từng bộ phận
                </h2>
                <p className="text-sm text-slate-600 mt-2">
                  Bấm chọn từng phân hệ để trải nghiệm giao diện điều hành thực tế.
                </p>
              </div>

              {/* Dynamic Interactive Tab Showcase */}
              <InteractiveModuleShowcase />
            </div>
          </section>

          {/* =========================================================================
              SECTION 5: 6-STEP CLOSED-LOOP OPERATIONAL TIMELINE
              ========================================================================= */}
          <section className="w-full bg-surface py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  QUY TRÌNH KHÉP KÍN 6 BƯỚC
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 tracking-tight">
                  Kết nối quy trình từ khách hàng đến dòng tiền
                </h2>
                <p className="text-sm text-slate-600 mt-2">
                  Mỗi hành động trong doanh nghiệp là một mắt xích liên tục, không có dữ liệu nào bị thất lạc.
                </p>
              </div>

              {/* 6 Steps Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                  {
                    step: 1,
                    title: "Thu nhận Lead",
                    desc: "Lead từ Facebook Ads, Zalo đổ thẳng vào CRM.",
                    action: "Tự động chia Sales",
                  },
                  {
                    step: 2,
                    title: "Chăm sóc & Báo giá",
                    desc: "Tư vấn, gửi báo giá và chốt deal trên Pipeline.",
                    action: "1-Click tạo khách hàng",
                  },
                  {
                    step: 3,
                    title: "Tạo Đơn Hàng",
                    desc: "Ghi nhận VAT, chiết khấu và địa chỉ nhận hàng.",
                    action: "Khóa kho Atomic 1.2s",
                  },
                  {
                    step: 4,
                    title: "Điều Phối Kho",
                    desc: "In phiếu nhặt hàng, quét mã vạch và đóng gói.",
                    action: "Đẩy mã vận chuyển",
                  },
                  {
                    step: 5,
                    title: "Giao Vận Đa Kênh",
                    desc: "Bàn giao GHN, GHTK, Viettel Post theo dõi lộ trình.",
                    action: "Đối soát COD tự động",
                  },
                  {
                    step: 6,
                    title: "Doanh Thu & KPI",
                    desc: "Xuất hóa đơn meInvoice và tự động tính hoa hồng.",
                    action: "Hoàn tất chu kỳ",
                    highlight: true,
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className={`p-4 rounded-2xl flex flex-col justify-between border transition-all hover:-translate-y-1 ${
                      item.highlight
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                        : "bg-white border-slate-200/80 shadow-xs"
                    }`}
                  >
                    <div>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-3 ${
                          item.highlight ? "bg-white text-blue-600" : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {item.step}
                      </div>
                      <h4
                        className={`text-sm font-bold tracking-tight ${
                          item.highlight ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {item.title}
                      </h4>
                      <p
                        className={`text-xs mt-1.5 leading-relaxed ${
                          item.highlight ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>

                    <div
                      className={`mt-4 pt-2 border-t text-[11px] font-bold flex items-center gap-1 ${
                        item.highlight
                          ? "border-blue-500 text-white"
                          : "border-slate-100 text-blue-600"
                      }`}
                    >
                      <span>{item.action}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* =========================================================================
              SECTION 6: EXECUTIVE BI ANALYTICS (HIGH-CONTRAST DATA VISUALIZATION)
              ========================================================================= */}
          <section className="w-full bg-[#0B1220] text-white py-16 lg:py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Trung Tâm Phân Tích Kinh Doanh BI
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug">
                    Ra quyết định tức thời <br />
                    <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                      dựa trên dữ liệu thực tế 24/7.
                    </span>
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Không còn phải chờ đến cuối tháng để kế toán gửi báo cáo. Mọi chỉ số về tỷ suất lợi nhuận gộp, lưu chuyển dòng tiền và hiệu suất chi nhánh được hiển thị trực tiếp.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
                      <div className="text-xs font-bold text-white">So sánh doanh thu đa chi nhánh</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Hà Nội (48%), TP.HCM (38%), Đà Nẵng (14%) cập nhật theo từng giây giao dịch.
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
                      <div className="text-xs font-bold text-white">Cảnh báo sai lệch dòng tiền tức thì</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Tự động phát hiện chi phí vượt định mức ngân sách của từng phòng ban.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Big Analytics Chart Preview */}
                <div className="lg:col-span-7 bg-white/[0.06] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                    <div>
                      <div className="text-base font-bold text-white">
                        Báo Cáo Tăng Trưởng Doanh Số Q3
                      </div>
                      <div className="text-xs text-slate-400">
                        Đơn vị: Triệu VNĐ (Dữ liệu hợp nhất thời gian thực)
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                      +24.8% YoY
                    </span>
                  </div>

                  {/* Branch Bars Visual */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Chi nhánh Miền Bắc (Keangnam Landmark 72)</span>
                        <span className="text-sky-400 font-bold">1.250.000.000 ₫ (84%)</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "84%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Chi nhánh Miền Nam (Bitexco Q1)</span>
                        <span className="text-sky-400 font-bold">980.000.000 ₫ (92%)</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "92%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Chi nhánh Miền Trung (Đà Nẵng)</span>
                        <span className="text-sky-400 font-bold">415.000.000 ₫ (71%)</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-sky-400 rounded-full" style={{ width: "71%" }} />
                      </div>
                    </div>
                  </div>

                  {/* KPI Stat Cards */}
                  <div className="grid grid-cols-3 gap-3 pt-6 text-center">
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">Biên Lợi Nhuận</span>
                      <span className="text-base font-bold text-white mt-0.5 block">34.2%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">Chi phí CAC</span>
                      <span className="text-base font-bold text-emerald-400 mt-0.5 block">142.000 ₫</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5">
                      <span className="text-[11px] text-slate-400 block">Giá Trị LTV</span>
                      <span className="text-base font-bold text-sky-400 mt-0.5 block">12.8 Tr ₫</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              SECTION 7: REAL OPERATIONAL SCENARIOS (ILLUSTRATIVE DEMO PERSONAS)
              ========================================================================= */}
          <section className="w-full bg-surface py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  KỊCH BẢN VẬN HÀNH THỰC TẾ
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 tracking-tight">
                  Hiệu quả đo lường được theo từng ngành hàng
                </h2>
                <p className="text-sm text-slate-600 mt-2">
                  Các kịch bản mô phỏng minh họa bài toán vận hành đặc thù của doanh nghiệp Việt Nam khi chuyển đổi số cùng BizPro+.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Scenario 1 */}
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        VT
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">Chuỗi Thời Trang V-Style</div>
                        <div className="text-xs text-slate-500">Mô phỏng chuỗi 18 chi nhánh bán lẻ</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      &quot;Trước đây mỗi đợt sale lớn là kho loạn nhịp, lệch tồn và phải hủy cả trăm đơn. Từ khi áp dụng BizPro+, tỷ lệ sót đơn giảm về 0, tốc độ đóng hàng tăng gấp 3.&quot;
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Mục tiêu giải phóng:</span>
                    <span className="text-emerald-700 font-extrabold">Tiết kiệm 80tr/tháng chi phí kho</span>
                  </div>
                </div>

                {/* Scenario 2 */}
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        AC
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">Phân Phối Phụ Tùng AutoCore</div>
                        <div className="text-xs text-slate-500">Mô phỏng mạng lưới 300 đại lý phân phối</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      &quot;Quản lý hơn 6.000 mã phụ tùng bằng Excel từng là cơn ác mộng. BizPro+ giúp chúng tôi biết rõ từng mã ở kệ nào, công nợ đại lý đến đâu chỉ trong một cú click.&quot;
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Mục tiêu giải phóng:</span>
                    <span className="text-emerald-700 font-extrabold">Thu hồi công nợ nhanh hơn 45%</span>
                  </div>
                </div>

                {/* Scenario 3 */}
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                        OF
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">Nội Thất &amp; Thiết Bị OfficePro</div>
                        <div className="text-xs text-slate-500">Mô phỏng doanh nghiệp B2B 65 nhân sự</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      &quot;Tính năng liên kết doanh số chốt đơn với bảng lương HRM của BizPro+ đã dập tắt mọi khiếu nại cuối tháng của đội sales. Nhân viên có động lực làm việc rõ rệt.&quot;
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Mục tiêu giải phóng:</span>
                    <span className="text-emerald-700 font-extrabold">Năng suất bán hàng tăng +35%</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              SECTION 8: HIGH-CONVERSION FINAL CALL TO ACTION BANNER
              ========================================================================= */}
          <section className="w-full bg-[#0B1220] py-16 lg:py-24 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-sky-500/10 pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
              <span className="px-3.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/20 text-blue-300 text-xs font-bold tracking-wider uppercase mb-4">
                BẮT ĐẦU CHUYỂN ĐỔI NGAY HÔM NAY
              </span>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl">
                Sẵn sàng hợp nhất toàn bộ doanh nghiệp của bạn?
              </h2>

              <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Gia nhập cùng hơn 2.500+ doanh nghiệp Việt Nam đang vận hành hiệu quả hơn, tối ưu dòng tiền và tăng trưởng bền vững cùng BizPro+.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <ShinyButton href="/signup" size="lg" icon>
                  Kích hoạt dùng thử 14 ngày miễn phí
                </ShinyButton>
                <ShinyButton href="/demo" variant="outline" size="lg" className="text-white border-white/20 hover:bg-white/10">
                  Xem buổi Demo thực tế
                </ShinyButton>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-400 text-xs font-medium">
                <span>✓ Không cần thẻ tín dụng</span>
                <span>•</span>
                <span>✓ Hỗ trợ chuyển đổi dữ liệu từ Excel miễn phí</span>
                <span>•</span>
                <span>✓ Đội ngũ chuyên gia hỗ trợ 24/7 tại Việt Nam</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}