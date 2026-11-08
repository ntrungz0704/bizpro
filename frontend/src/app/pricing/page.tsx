"use client";

import React, { useState } from "react";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

const FAQ_ITEMS = [
  {
    id: 1,
    question: "1. Tôi có thể thay đổi gói dịch vụ trong quá trình sử dụng không?",
    answer: "Có, hoàn toàn linh hoạt. Bạn có thể nâng cấp lên gói cao hơn bất kỳ lúc nào để đáp ứng tốc độ tăng trưởng. Số tiền đã thanh toán của chu kỳ cũ sẽ được khấu trừ tự động theo số ngày sử dụng thực tế. Khi hạ cấp, thay đổi sẽ có hiệu lực từ kỳ thanh toán kế tiếp.",
  },
  {
    id: 2,
    question: "2. Gói dùng thử 14 ngày có bị giới hạn tính năng nào không?",
    answer: "Gói dùng thử 14 ngày cung cấp gần như toàn bộ tính năng cốt lõi của gói Professional để doanh nghiệp có cái nhìn toàn diện nhất về cách phần mềm vận hành. Giới hạn duy nhất là số lượng đơn hàng thử nghiệm (200 đơn) và tối đa 3 tài khoản trải nghiệm đồng thời.",
  },
  {
    id: 3,
    question: "3. Doanh nghiệp cần thanh toán theo hình thức nào? Có xuất hóa đơn VAT không?",
    answer: "BizPro+ hỗ trợ thanh toán qua chuyển khoản ngân hàng doanh nghiệp, cổng VNPAY/MoMo hoặc thẻ tín dụng quốc tế (Visa/Mastercard). Chúng tôi ký hợp đồng dịch vụ công nghệ số và xuất hóa đơn điện tử VAT hợp pháp theo quy định của Tổng cục Thuế ngay trong 24 giờ sau khi thanh toán.",
  },
  {
    id: 4,
    question: "4. Chi phí cho các chi nhánh hoặc kho hàng phát sinh được tính như thế nào?",
    answer: "Với gói Professional, bạn đã được bao gồm sẵn tới 5 chi nhánh và kho hàng. Nếu quy mô vượt quá, chi phí thêm mới là 150.000₫/chi nhánh/tháng. Đối với gói Enterprise, số lượng kho bãi và chi nhánh là không giới hạn theo thiết kế hạ tầng riêng biệt.",
  },
  {
    id: 5,
    question: "5. Dữ liệu của công ty tôi có được bảo mật và an toàn không?",
    answer: "Dữ liệu của bạn được mã hóa hai lớp bằng giao thức TLS 1.3 trong khi truyền và chuẩn AES-256 khi lưu trữ. Hạ tầng máy chủ đặt tại Datacenter chuẩn Tier III tại Hà Nội và TP.HCM, tự động sao lưu dữ liệu mỗi 6 giờ và tuân thủ chứng nhận bảo mật an toàn thông tin ISO 27001:2022.",
  },
  {
    id: 6,
    question: "6. BizPro+ có hỗ trợ đào tạo nhân viên và chuyển đổi dữ liệu từ file Excel cũ không?",
    answer: "Hoàn toàn có. Đội ngũ kỹ thuật Customer Success của BizPro+ sẽ hỗ trợ bạn chuẩn hóa cấu trúc dữ liệu khách hàng, sản phẩm và tồn kho từ file Excel sẵn có để nhập vào hệ thống mà không lo thất thoát số liệu. Các khóa hướng dẫn 1-on-1 và tài liệu video luôn sẵn sàng cho đội ngũ của bạn.",
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(prev => prev === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface antialiased">
      <MarketingHeader />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
{/* HERO SECTION */}
<section className="relative w-full overflow-hidden bg-gradient-to-b from-surface-container-low via-surface to-surface pb-12">
<div className="max-w-7xl mx-auto px-margin pt-space-xl text-center flex flex-col items-center">
{/* Eyebrow Badge */}
<div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-primary-fixed text-on-primary-fixed shadow-sm mb-space-md">
<span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">BẢNG GIÁ MINH BẠCH &amp; LINH HOẠT</span>
</div>
{/* Main Headline */}
<h1 className="font-headline-lg md:font-display text-headline-lg md:text-display text-on-surface max-w-4xl tracking-tight leading-tight">
        Chọn gói quản trị phù hợp với quy mô doanh nghiệp
      </h1>
{/* Subtitle */}
<p className="mt-space-md font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
        Minh bạch về chi phí, không chi phí ẩn, linh hoạt nâng cấp theo từng giai đoạn tăng trưởng. Tối ưu vận hành chuyên sâu cho doanh nghiệp Việt Nam.
      </p>
{/* Billing Cycle Toggle Switch */}
<div className="mt-space-xl p-space-xs rounded-full bg-surface-container-high shadow-inner inline-flex items-center gap-space-xs">
<button onClick={() => setIsYearly(false)} className={`px-space-lg py-space-sm rounded-full font-body-md-medium text-body-md-medium transition-all duration-200 cursor-pointer ${!isYearly ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`} id="toggleMonthly" type="button">
          Thanh toán theo tháng
        </button>
<button onClick={() => setIsYearly(true)} className={`px-space-lg py-space-sm rounded-full font-body-md-medium text-body-md-medium flex items-center gap-space-xs transition-all duration-200 cursor-pointer ${isYearly ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`} id="toggleYearly" type="button">
<span>Thanh toán theo năm</span>
<span className="px-space-xs py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption uppercase tracking-wider font-semibold">Tiết kiệm 20% + Tặng 2 tháng</span>
</button>
</div>
{/* Guarantee micro-bar */}
<div className="mt-8 mb-4 flex flex-wrap items-center justify-center gap-space-lg text-on-surface-variant font-label-md text-label-md">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
<span>14 ngày trải nghiệm đầy đủ</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[18px]">credit_card_off</span>
<span>Không cần thẻ tín dụng</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[18px]">receipt_long</span>
<span>Xuất hóa đơn VAT điện tử 100%</span>
</div>
</div>
</div>
</section>
{/* 4 PRICING TIERS GRID */}
<section className="w-full max-w-7xl mx-auto px-margin pt-12 pb-20">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
{/* PLAN 1: Free Trial */}
<div className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/80 h-full">
<div className="flex-1 flex flex-col">
<div className="flex items-center justify-between mb-space-sm">
<span className="px-space-sm py-space-xs rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">Khám phá</span>
<span className="font-caption text-caption text-on-surface-variant font-medium">14 Ngày</span>
</div>
<h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">Dùng thử</h2>
<p className="font-body-md text-body-md text-on-surface-variant mb-space-lg min-h-[52px] flex items-center">
            Đánh giá mức độ tương thích và tính năng thực tế trước khi cam kết.
          </p>
<div className="py-space-md mb-space-lg rounded-xl bg-surface-container-low px-space-md min-h-[104px] flex flex-col justify-center">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-lg text-headline-lg font-black text-on-surface">0₫</span>
<span className="font-label-md text-label-md text-on-surface-variant">/ 14 ngày</span>
</div>
<p className="mt-space-xs font-caption text-caption text-on-surface-variant font-medium">Truy cập đầy đủ tính năng tiêu chuẩn</p>
</div>
<div className="flex-1 space-y-space-sm mb-space-xl font-body-md text-body-md text-on-surface">
<div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Quy mô gói:</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
<span>Tối đa <strong>3 người dùng</strong> nội bộ</span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
<span>1 chi nhánh &amp; 1 kho hàng chuẩn</span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
<span>Hạn mức 200 đơn hàng / tháng</span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
<span>CRM, Quản lý Kho, Đơn hàng, HRM cơ bản</span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
<span>Hỗ trợ tài liệu &amp; live-chat giờ hành chính</span>
</div>
</div>
</div>
<div className="mt-auto pt-6">
<a className="w-full block text-center px-space-lg py-space-sm rounded-xl bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-body-md-medium text-body-md-medium transition-colors shadow-sm cursor-pointer" href="/signup">
          Bắt đầu dùng thử miễn phí
        </a>
</div>
</div>
{/* PLAN 2: Starter */}
<div className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/80 h-full">
<div className="flex-1 flex flex-col">
<div className="flex items-center justify-between mb-space-sm">
<span className="px-space-sm py-space-xs rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">Cơ bản</span>
<span className="font-caption text-caption text-on-surface-variant font-medium">3 - 10 nhân sự</span>
</div>
<h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-xs">Starter (Khởi tạo)</h2>
<p className="font-body-md text-body-md text-on-surface-variant mb-space-lg min-h-[52px] flex items-center">
            Hộ kinh doanh cá thể, SME tinh gọn cần số hóa và chuẩn mực quy trình.
          </p>
<div className="py-space-md mb-space-lg rounded-xl bg-surface-container-low px-space-md min-h-[104px] flex flex-col justify-center">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-lg text-headline-lg font-black text-on-surface" id="starterPrice">{isYearly ? "712.000₫" : "890.000₫"}</span>
<span className="font-label-md text-label-md text-on-surface-variant">/ tháng</span>
</div>
<p className="mt-space-xs font-caption text-caption text-primary font-medium" id="starterBillingDetail">
              {isYearly ? "Thanh toán năm: 8.544.000₫ (Tiết kiệm 20%)" : "Thanh toán linh hoạt theo từng tháng"}
            </p>
</div>
<div className="flex-1 space-y-space-sm mb-space-xl font-body-md text-body-md text-on-surface">
<div className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Quy mô gói:</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
<span>Tối đa <strong>5 tài khoản</strong> đăng nhập</span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
<span>1 kho trung tâm + 1 điểm bán lẻ POS</span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
<span>1.000 đơn hàng xử lý mỗi tháng</span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
<span>Trọn bộ 4 phân hệ cốt lõi tích hợp (CRM, Kho, Đơn hàng, HRM)</span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
<span>Báo cáo doanh thu &amp; dòng tiền chuẩn</span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
<span>Hỗ trợ kỹ thuật trực tuyến 24/7</span>
</div>
</div>
</div>
<div className="mt-auto pt-6">
<a className="w-full block text-center px-space-lg py-space-sm rounded-xl bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-body-md-medium text-body-md-medium transition-colors shadow-sm cursor-pointer" href="/signup">
          Chọn gói Starter
        </a>
</div>
</div>
{/* PLAN 3: Professional (Most Popular - Highlighted) */}
<div className="relative flex flex-col justify-between rounded-2xl bg-white p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-primary ring-4 ring-primary/10 h-full">
{/* Brand Highlight Badge */}
<div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 rounded-full bg-primary text-on-primary font-caption text-caption uppercase tracking-wider font-extrabold shadow-md border border-white/20 z-10 flex items-center gap-1.5">
<span className="material-symbols-outlined text-[14px]">star</span>
<span>PHỔ BIẾN NHẤT — TĂNG TRƯỞNG</span>
</div>
<div className="flex-1 flex flex-col pt-2">
<div className="flex items-center justify-between mb-space-sm mt-space-xs">
<span className="px-space-sm py-space-xs rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold">Tối ưu hiệu suất</span>
<span className="font-caption text-caption text-primary font-bold">10 - 50 nhân sự</span>
</div>
<h2 className="font-headline-sm text-headline-sm text-on-surface font-black mb-space-xs">Professional</h2>
<p className="font-body-md text-body-md text-on-surface-variant mb-space-lg min-h-[52px] flex items-center">
            Lựa chọn hàng đầu cho chuỗi bán lẻ, phân phối đa kênh đang tăng tốc.
          </p>
<div className="py-space-md mb-space-lg rounded-xl bg-primary-fixed/40 px-space-md border border-primary/20 min-h-[104px] flex flex-col justify-center">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-lg text-headline-lg font-black text-primary" id="proPrice">{isYearly ? "1.590.000₫" : "1.990.000₫"}</span>
<span className="font-label-md text-label-md text-on-surface-variant">/ tháng</span>
</div>
<p className="mt-space-xs font-caption text-caption text-primary font-semibold" id="proBillingDetail">
              {isYearly ? "Thanh toán năm: 19.080.000₫ (Tiết kiệm 4.800.000₫)" : "Thanh toán theo tháng linh hoạt"}
            </p>
</div>
<div className="flex-1 space-y-space-sm mb-space-xl font-body-md text-body-md text-on-surface">
<div className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Mọi quyền lợi Starter, cộng thêm:</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">verified</span>
<span><strong>15 tài khoản</strong> (mở rộng linh hoạt không giới hạn)</span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">verified</span>
<span><strong>Không giới hạn số lượng đơn hàng</strong></span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">verified</span>
<span>Quản trị chuỗi <strong>đa kho (tối đa 5 kho)</strong></span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">verified</span>
<span>Kết nối <strong>Đa sàn TMĐT</strong> (Shopee, TikTok, Lazada) &amp; Hãng Ship <span className="text-[11px] text-amber-700 font-semibold">(Đang đặc tả Phase 4B &amp; Demo)</span></span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">verified</span>
<span>Kế toán bán hàng &amp; Đối soát COD <span className="text-[11px] text-amber-700 font-semibold">(Đang đặc tả Phase 4C &amp; Demo)</span></span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">verified</span>
<span>Phân tích dữ liệu điều hành Executive BI</span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">verified</span>
<span>Phân quyền vai trò chuyên sâu (RBAC)</span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">verified</span>
<span>Chuyên viên đồng hành riêng 1-on-1 theo ngành</span>
</div>
</div>
</div>
<div className="mt-auto pt-6">
<a className="w-full block text-center px-space-lg py-space-sm rounded-xl bg-primary-container hover:bg-primary text-on-primary font-body-md-medium text-body-md-medium transition-all shadow-md hover:shadow-lg cursor-pointer" href="/signup">
          Bắt đầu với gói Pro
        </a>
</div>
</div>
{/* PLAN 4: Enterprise */}
<div className="flex flex-col justify-between rounded-2xl bg-[#0B1220] text-white p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-700/80 h-full">
<div className="flex-1 flex flex-col">
<div className="flex items-center justify-between mb-space-sm">
<span className="px-space-sm py-space-xs rounded-full bg-white/10 text-white font-label-sm text-label-sm font-semibold">Quy mô lớn</span>
<span className="font-caption text-caption text-slate-300 font-medium">&gt; 50 nhân sự</span>
</div>
<h2 className="font-headline-sm text-headline-sm text-white font-bold mb-space-xs">Enterprise</h2>
<p className="font-body-md text-body-md text-slate-300 mb-space-lg min-h-[52px] flex items-center">
            Tập đoàn đa pháp nhân, chuỗi quy mô lớn cần hạ tầng &amp; tùy biến chuyên sâu.
          </p>
<div className="py-space-md mb-space-lg rounded-xl bg-white/[0.06] px-space-md border border-white/10 min-h-[104px] flex flex-col justify-center">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-lg text-headline-lg font-black text-white">Tùy chỉnh</span>
</div>
<p className="mt-space-xs font-caption text-caption text-slate-300">Khảo sát &amp; tư vấn theo thực trạng vận hành</p>
</div>
<div className="flex-1 space-y-space-sm mb-space-xl font-body-md text-body-md text-slate-200">
<div className="font-label-sm text-label-sm uppercase tracking-wider text-sky-400 font-bold">Đặc quyền hạ tầng cao cấp:</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-sky-400 text-[18px] shrink-0 mt-0.5">verified_user</span>
<span><strong>Không giới hạn người dùng &amp; điểm bán</strong></span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-sky-400 text-[18px] shrink-0 mt-0.5">verified_user</span>
<span>Kế toán Chuẩn TT 200/133 &amp; Hóa đơn TT 78 <span className="text-[11px] text-sky-300 font-normal">(Lộ trình kiến trúc Phase 4C — SPEC-ONLY)</span></span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-sky-400 text-[18px] shrink-0 mt-0.5">verified_user</span>
<span>Hợp nhất Đa pháp nhân &amp; Holding <span className="text-[11px] text-sky-300 font-normal">(Lộ trình kiến trúc Phase 4D — SPEC-ONLY)</span></span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-sky-400 text-[18px] shrink-0 mt-0.5">verified_user</span>
<span>Server chuyên biệt (Single-tenant / Private Cloud)</span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-sky-400 text-[18px] shrink-0 mt-0.5">verified_user</span>
<span>Open API tùy biến &amp; Kết nối phần mềm hiện hữu</span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-sky-400 text-[18px] shrink-0 mt-0.5">verified_user</span>
<span>Cam kết vận hành <strong>SLA 99.95%</strong> bằng hợp đồng</span>
</div>
<div className="flex items-start gap-space-sm">
<span className="material-symbols-outlined text-sky-400 text-[18px] shrink-0 mt-0.5">verified_user</span>
<span>Đội ngũ chuyên gia đào tạo Onboarding tận nơi</span>
</div>
</div>
</div>
<div className="mt-auto pt-6">
<a className="w-full block text-center px-space-lg py-space-sm rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition-colors font-body-md-medium text-body-md-medium shadow-md cursor-pointer font-bold" href="/signup">
          Liên hệ tư vấn Enterprise
        </a>
</div>
</div>
</div>
</section>
{/* KEY DIFFERENTIATORS & PRICING TRANSPARENCY (BẢNG TÍNH MINH BẠCH) */}
<section className="w-full bg-surface-container-low py-space-xl">
<div className="max-w-7xl mx-auto px-margin">
<div className="text-center max-w-3xl mx-auto mb-space-xl">
<h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Cam kết chính sách chi phí minh bạch</h2>
<p className="mt-space-xs font-body-md text-body-md text-on-surface-variant">BizPro+ xây dựng mô hình giá chuẩn xác theo quy định pháp lý và văn hóa kinh doanh tại Việt Nam.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
{/* Item 1 */}
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center mb-space-md text-primary">
<span className="material-symbols-outlined">swap_horiz</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-semibold mb-space-xs">Nâng cấp / Hạ cấp tự do</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Thay đổi gói dịch vụ bất kỳ lúc nào. Hệ thống tự động khấu trừ số tiền chưa dùng và tính theo số ngày thực tế.</p>
</div>
<div className="mt-space-md pt-space-sm font-caption text-caption text-primary font-semibold">Tự động bù trừ theo ngày</div>
</div>
{/* Item 2 */}
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center mb-space-md text-primary">
<span className="material-symbols-outlined">group_add</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-semibold mb-space-xs">Thêm tài khoản linh hoạt</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Chỉ từ <strong>69.000₫/tài khoản/tháng</strong> khi doanh nghiệp mở rộng nhân sự nhanh chóng mà không cần chuyển gói lớn hơn.</p>
</div>
<div className="mt-space-md pt-space-sm font-caption text-caption text-primary font-semibold">Mở rộng không ràng buộc</div>
</div>
{/* Item 3 */}
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center mb-space-md text-primary">
<span className="material-symbols-outlined">receipt</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-semibold mb-space-xs">Hóa đơn VAT &amp; Hợp đồng</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Báo giá đã bao gồm các điều khoản pháp lý hoàn chỉnh. Xuất hóa đơn điện tử VAT hợp lệ cho công ty ngay sau khi thanh toán.</p>
</div>
<div className="mt-space-md pt-space-sm font-caption text-caption text-primary font-semibold">Chứng từ kế toán chuẩn chỉ</div>
</div>
{/* Item 4 */}
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center mb-space-md text-primary">
<span className="material-symbols-outlined">cloud_download</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-semibold mb-space-xs">Bảo lưu dữ liệu 60 ngày</h3>
<p className="font-body-md text-body-md text-on-surface-variant">Nếu tạm dừng dịch vụ, toàn bộ dữ liệu vẫn được lưu trữ mã hóa an toàn 60 ngày để doanh nghiệp trích xuất file sao lưu đầy đủ.</p>
</div>
<div className="mt-space-md pt-space-sm font-caption text-caption text-primary font-semibold">Chủ quyền dữ liệu 100%</div>
</div>
</div>
</div>
</section>
{/* FEATURE COMPARISON TABLE */}
<section className="w-full max-w-7xl mx-auto px-margin py-space-xl">
<div className="text-center max-w-3xl mx-auto mb-space-xl">
<div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase mb-space-xs">
        BẢNG CHI TIẾT
      </div>
<h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">So sánh chi tiết tính năng từng gói</h2>
<p className="mt-space-xs font-body-md text-body-md text-on-surface-variant">Tra cứu năng lực chi tiết giữa các phiên bản nhằm đưa ra quyết định đầu tư công nghệ chính xác nhất.</p>
</div>
{/* Responsive Table Container */}
<div className="w-full overflow-x-auto rounded-xl shadow-sm bg-surface-container-lowest">
<table className="w-full text-left font-body-md text-body-md min-w-[840px]">
{/* Table Head */}
<thead>
<tr className="bg-surface-container-high text-on-surface">
<th className="p-space-lg font-headline-sm text-headline-sm font-bold w-1/3">Tính năng &amp; Năng lực</th>
<th className="p-space-lg font-title-md text-title-md font-semibold text-center w-1/6">Dùng thử</th>
<th className="p-space-lg font-title-md text-title-md font-semibold text-center w-1/6">Starter</th>
<th className="p-space-lg font-title-md text-title-md font-bold text-center w-1/6 text-primary bg-primary-fixed/40">Professional</th>
<th className="p-space-lg font-title-md text-title-md font-bold text-center w-1/6 text-on-surface">Enterprise</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
{/* CATEGORY A */}
<tr className="bg-surface-container-low font-title-md text-title-md font-semibold text-primary">
<td className="py-space-md px-space-lg flex items-center gap-space-xs" colSpan={5}>
<span className="material-symbols-outlined text-[20px]">badge</span>
<span>A. Tài khoản &amp; Quy mô người dùng</span>
</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Số lượng tài khoản mặc định</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">3 người dùng</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">5 người dùng</td>
<td className="py-space-md px-space-lg text-center font-body-md-medium text-body-md-medium text-primary bg-primary-fixed/10">15 người dùng</td>
<td className="py-space-md px-space-lg text-center font-bold text-on-surface">Không giới hạn</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Thêm tài khoản bổ sung</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant"><span className="material-symbols-outlined text-outline text-[18px]">remove</span></td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">89.000₫ / user / tháng</td>
<td className="py-space-md px-space-lg text-center font-body-md-medium text-body-md-medium text-primary bg-primary-fixed/10">69.000₫ / user / tháng</td>
<td className="py-space-md px-space-lg text-center font-bold text-on-surface">Tùy biến theo thỏa thuận</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Số lượng chi nhánh quản lý</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">1 chi nhánh</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">1 chi nhánh</td>
<td className="py-space-md px-space-lg text-center font-body-md-medium text-body-md-medium text-primary bg-primary-fixed/10">Tối đa 5 chi nhánh</td>
<td className="py-space-md px-space-lg text-center font-bold text-on-surface">Không giới hạn</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Số kho hàng vận hành độc lập</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">1 kho</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">1 kho chính</td>
<td className="py-space-md px-space-lg text-center font-body-md-medium text-body-md-medium text-primary bg-primary-fixed/10">5 kho liên kết</td>
<td className="py-space-md px-space-lg text-center font-bold text-on-surface">Không giới hạn kho</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Dung lượng lưu trữ tài liệu đám mây</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">2 GB</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">10 GB</td>
<td className="py-space-md px-space-lg text-center font-body-md-medium text-body-md-medium text-primary bg-primary-fixed/10">50 GB</td>
<td className="py-space-md px-space-lg text-center font-bold text-on-surface">Dung lượng riêng không giới hạn</td>
</tr>
{/* CATEGORY B */}
<tr className="bg-surface-container-low font-title-md text-title-md font-semibold text-primary">
<td className="py-space-md px-space-lg flex items-center gap-space-xs" colSpan={5}>
<span className="material-symbols-outlined text-[20px]">contacts</span>
<span>B. Quản lý Khách hàng &amp; Phễu bán (CRM)</span>
</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Quản trị hồ sơ Lead &amp; Khách hàng</td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary bg-primary-fixed/10"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Phễu bán hàng Pipeline tùy biến đa kênh</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">1 Pipeline cơ bản</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">2 Pipeline</td>
<td className="py-space-md px-space-lg text-center font-body-md-medium text-body-md-medium text-primary bg-primary-fixed/10">Không giới hạn Pipeline</td>
<td className="py-space-md px-space-lg text-center font-bold text-on-surface">Đa kịch bản &amp; Tự động hóa cao cấp</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Lịch sử tương tác &amp; Hồ sơ 360°</td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary bg-primary-fixed/10"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Phân bổ khách hàng tự động cho Sale (Round-robin)</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant"><span className="material-symbols-outlined text-outline text-[18px]">remove</span></td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant"><span className="material-symbols-outlined text-outline text-[18px]">remove</span></td>
<td className="py-space-md px-space-lg text-center text-primary bg-primary-fixed/10"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
</tr>
{/* CATEGORY C */}
<tr className="bg-surface-container-low font-title-md text-title-md font-semibold text-primary">
<td className="py-space-md px-space-lg flex items-center gap-space-xs" colSpan={5}>
<span className="material-symbols-outlined text-[20px]">inventory_2</span>
<span>C. Quản lý Kho hàng &amp; Tồn kho (WMS)</span>
</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Giới hạn mã hàng hóa (SKU)</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">500 SKU</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">3.000 SKU</td>
<td className="py-space-md px-space-lg text-center font-body-md-medium text-body-md-medium text-primary bg-primary-fixed/10">Không giới hạn SKU</td>
<td className="py-space-md px-space-lg text-center font-bold text-on-surface">Không giới hạn SKU</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Cảnh báo tồn kho an toàn thời gian thực</td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary bg-primary-fixed/10"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Kiểm kê mã vạch Barcode/QR qua Mobile App</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant"><span className="material-symbols-outlined text-outline text-[18px]">remove</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary bg-primary-fixed/10"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Theo dõi Lô hạn sử dụng (Lot) &amp; Serial/IMEI</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant"><span className="material-symbols-outlined text-outline text-[18px]">remove</span></td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant"><span className="material-symbols-outlined text-outline text-[18px]">remove</span></td>
<td className="py-space-md px-space-lg text-center text-primary bg-primary-fixed/10"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
</tr>
{/* CATEGORY D */}
<tr className="bg-surface-container-low font-title-md text-title-md font-semibold text-primary">
<td className="py-space-md px-space-lg flex items-center gap-space-xs" colSpan={5}>
<span className="material-symbols-outlined text-[20px]">shopping_cart</span>
<span>D. Quản lý Đơn hàng &amp; Bán hàng (OMS)</span>
</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Giới hạn số đơn hàng xử lý</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">200 đơn / tháng</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">1.000 đơn / tháng</td>
<td className="py-space-md px-space-lg text-center font-body-md-medium text-body-md-medium text-primary bg-primary-fixed/10">Không giới hạn</td>
<td className="py-space-md px-space-lg text-center font-bold text-on-surface">Không giới hạn (High Throughput)</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Điều phối kho xuất đơn tự động theo vị trí</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant"><span className="material-symbols-outlined text-outline text-[18px]">remove</span></td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant"><span className="material-symbols-outlined text-outline text-[18px]">remove</span></td>
<td className="py-space-md px-space-lg text-center text-primary bg-primary-fixed/10"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Tích hợp hãng vận chuyển (Viettel Post, GHTK, GHN)</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant"><span className="material-symbols-outlined text-outline text-[18px]">remove</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary bg-primary-fixed/10"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Bảng giá phân cấp đại lý &amp; Khóa hạn mức công nợ</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant"><span className="material-symbols-outlined text-outline text-[18px]">remove</span></td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant"><span className="material-symbols-outlined text-outline text-[18px]">remove</span></td>
<td className="py-space-md px-space-lg text-center text-primary bg-primary-fixed/10"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
</tr>
{/* CATEGORY E */}
<tr className="bg-surface-container-low font-title-md text-title-md font-semibold text-primary">
<td className="py-space-md px-space-lg flex items-center gap-space-xs" colSpan={5}>
<span className="material-symbols-outlined text-[20px]">groups</span>
<span>E. Nhân sự, Chấm công &amp; Tiền lương (HRM)</span>
</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Hồ sơ nhân sự điện tử &amp; Hợp đồng lao động</td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary bg-primary-fixed/10"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Chấm công di động qua GPS / Wifi / Khuôn mặt</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant"><span className="material-symbols-outlined text-outline text-[18px]">remove</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary bg-primary-fixed/10"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Tính lương tự động theo KPI, Doanh số &amp; Ca kíp</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant"><span className="material-symbols-outlined text-outline text-[18px]">remove</span></td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">Bảng lương cơ bản</td>
<td className="py-space-md px-space-lg text-center font-body-md-medium text-body-md-medium text-primary bg-primary-fixed/10">Đa công thức lương &amp; KPI</td>
<td className="py-space-md px-space-lg text-center font-bold text-on-surface">Tùy biến cấu trúc lương phức hợp</td>
</tr>
{/* CATEGORY F */}
<tr className="bg-surface-container-low font-title-md text-title-md font-semibold text-primary">
<td className="py-space-md px-space-lg flex items-center gap-space-xs" colSpan={5}>
<span className="material-symbols-outlined text-[20px]">analytics</span>
<span>F. Báo cáo &amp; Phân tích thông minh</span>
</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Hệ thống báo cáo vận hành &amp; kinh doanh</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">Cơ bản</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">Tiêu chuẩn</td>
<td className="py-space-md px-space-lg text-center font-body-md-medium text-body-md-medium text-primary bg-primary-fixed/10">Báo cáo đa chiều Executive BI</td>
<td className="py-space-md px-space-lg text-center font-bold text-on-surface">BI chuyên sâu &amp; Dự báo AI</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Xuất dữ liệu Excel / PDF / In ấn hàng loạt</td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary bg-primary-fixed/10"><span className="material-symbols-outlined text-[20px]">check</span></td>
<td className="py-space-md px-space-lg text-center text-primary"><span className="material-symbols-outlined text-[20px]">check</span></td>
</tr>
{/* CATEGORY G */}
<tr className="bg-surface-container-low font-title-md text-title-md font-semibold text-primary">
<td className="py-space-md px-space-lg flex items-center gap-space-xs" colSpan={5}>
<span className="material-symbols-outlined text-[20px]">shield</span>
<span>G. Bảo mật, Quản trị &amp; Hỗ trợ kỹ thuật</span>
</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Phân quyền vai trò chi tiết (Role-Based Access)</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">3 vai trò mặc định</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">5 vai trò</td>
<td className="py-space-md px-space-lg text-center font-body-md-medium text-body-md-medium text-primary bg-primary-fixed/10">Phân quyền chi tiết từng nút bấm</td>
<td className="py-space-md px-space-lg text-center font-bold text-on-surface">Ma trận bảo mật đa cấp độ</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Nhật ký truy vết thao tác (Audit Logs bất biến)</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant"><span className="material-symbols-outlined text-outline text-[18px]">remove</span></td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">Lưu 7 ngày</td>
<td className="py-space-md px-space-lg text-center font-body-md-medium text-body-md-medium text-primary bg-primary-fixed/10">Lưu 180 ngày</td>
<td className="py-space-md px-space-lg text-center font-bold text-on-surface">Lưu trữ vĩnh viễn theo chuẩn ISO</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Kênh hỗ trợ và thời gian phản hồi cam kết (SLA)</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">Email &amp; Tài liệu (48h)</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">Ticket &amp; Chatbot (12h)</td>
<td className="py-space-md px-space-lg text-center font-body-md-medium text-body-md-medium text-primary bg-primary-fixed/10">Hotline riêng &amp; CSKH 1-on-1 (2h)</td>
<td className="py-space-md px-space-lg text-center font-bold text-on-surface">SLA 15 phút, Đội kỹ thuật 24/7/365</td>
</tr>
<tr className="hover:bg-surface-container-lowest">
<td className="py-space-md px-space-lg font-body-md-medium text-body-md-medium text-on-surface">Hình thức đào tạo chuyển giao</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">Tài liệu trực tuyến</td>
<td className="py-space-md px-space-lg text-center text-on-surface-variant">Khóa học Video &amp; Webinar</td>
<td className="py-space-md px-space-lg text-center font-body-md-medium text-body-md-medium text-primary bg-primary-fixed/10">Đào tạo từ xa qua Zoom (2 buổi)</td>
<td className="py-space-md px-space-lg text-center font-bold text-on-surface">Đào tạo tận nơi theo quy trình riêng</td>
</tr>
</tbody>
</table>
</div>
</section>
{/* 3-STEP TRIAL PROCESS SECTION */}
<section className="w-full bg-surface-container-low py-space-xl">
<div className="max-w-7xl mx-auto px-margin">
<div className="text-center max-w-2xl mx-auto mb-space-xl">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">KHỞI ĐẦU DỄ DÀNG</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-space-xs">Quy trình dùng thử 3 bước tinh gọn</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">Chuyển đổi số không phức tạp. Đưa dữ liệu doanh nghiệp vào vận hành chỉ trong chưa đầy 15 phút.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter relative">
{/* Step 1 */}
<div className="p-space-xl rounded-xl bg-surface-container-lowest shadow-sm relative flex flex-col items-start">
<div className="w-12 h-12 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-center mb-space-lg shadow-sm">
            01
          </div>
<h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-xs">Đăng ký trong 30 giây</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Chỉ cần email và số điện thoại doanh nghiệp. Không yêu cầu thẻ tín dụng, kích hoạt tài khoản quản trị tức thì.
          </p>
</div>
{/* Step 2 */}
<div className="p-space-xl rounded-xl bg-surface-container-lowest shadow-sm relative flex flex-col items-start">
<div className="w-12 h-12 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-center mb-space-lg shadow-sm">
            02
          </div>
<h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-xs">Khởi tạo mô hình kinh doanh</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Chọn sẵn kịch bản mẫu phù hợp: Bán lẻ &amp; TMĐT, Đại lý phân phối buôn, hoặc Dịch vụ. Import danh mục hàng hóa từ Excel có sẵn.
          </p>
</div>
{/* Step 3 */}
<div className="p-space-xl rounded-xl bg-surface-container-lowest shadow-sm relative flex flex-col items-start">
<div className="w-12 h-12 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-center mb-space-lg shadow-sm">
            03
          </div>
<h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-xs">Vận hành thực tế &amp; Nhận tư vấn</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Trải nghiệm trọn vẹn 14 ngày trên dữ liệu thực tế. Đội ngũ kỹ thuật BizPro+ luôn sẵn sàng hỗ trợ chuẩn hóa quy trình.
          </p>
</div>
</div>
<div className="mt-space-xl text-center">
<a className="inline-flex items-center gap-space-xs px-space-xl py-space-sm rounded-lg bg-primary-container hover:bg-primary text-on-primary font-body-md-medium text-body-md-medium shadow-md transition-all" href="/signup">
<span>Khởi tạo tài khoản dùng thử ngay</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
</div>
</div>
</section>
{/* FAQ SECTION */}
<section className="w-full max-w-4xl mx-auto px-margin py-space-xl">
<div className="text-center mb-space-xl">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">GIẢI ĐÁP THẮC MẮC</span>
<h2 className="font-headline-lg text-headline-lg text-on-surface font-bold mt-space-xs">Câu hỏi thường gặp về bảng giá</h2>
<p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">Tất cả những gì bạn cần biết trước khi lựa chọn đồng hành cùng nền tảng quản trị BizPro+.</p>
</div>
<div className="space-y-4" id="faqAccordion">
  {FAQ_ITEMS.map((item) => {
    const isOpen = openFaq === item.id;
    return (
      <div
        key={item.id}
        className={`rounded-2xl bg-surface-container-lowest shadow-xs border transition-all duration-200 overflow-hidden ${
          isOpen ? "border-primary/50 shadow-md ring-2 ring-primary/10" : "border-slate-200/80 hover:border-slate-300"
        }`}
      >
        <button
          onClick={() => toggleFaq(item.id)}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-title-md text-title-md font-bold text-on-surface hover:text-primary transition-colors cursor-pointer select-none"
          type="button"
          aria-expanded={isOpen}
        >
          <span className="leading-snug">{item.question}</span>
          <span
            className={`material-symbols-outlined shrink-0 transform transition-transform duration-300 ${
              isOpen ? "rotate-180 text-primary" : "text-slate-400"
            }`}
          >
            expand_more
          </span>
        </button>
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-5 sm:px-6 pb-6 pt-2 font-body-md text-body-md text-on-surface-variant leading-relaxed border-t border-slate-100/90">
              {item.answer}
            </div>
          </div>
        </div>
      </div>
    );
  })}
</div>
</section>
{/* ENTERPRISE HIGH-CONVERTING CTA BANNER (ELEVATED FLOATING CARD WITH SAFE SPACING) */}
<section className="w-full bg-surface-container-low/50 py-16 lg:py-24 px-margin">
<div className="max-w-7xl mx-auto">
<div className="rounded-3xl bg-gradient-to-r from-[#0B1220] via-[#111C30] to-[#0B1220] text-white p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-space-xl relative overflow-hidden shadow-2xl border border-blue-500/20">
{/* Ambient Glow */}
<div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
<div className="max-w-2xl relative z-10">
<div className="inline-flex items-center gap-space-xs px-3.5 py-1.5 rounded-full bg-blue-500/20 text-sky-300 font-label-sm text-label-sm uppercase mb-space-md font-bold border border-blue-400/20">
<span className="material-symbols-outlined text-[16px]">domain</span>
<span>DÀNH RIÊNG CHO DOANH NGHIỆP LỚN</span>
</div>
<h2 className="font-headline-lg text-headline-lg font-bold text-white tracking-tight mb-space-sm">
            Cần giải pháp ERP tùy chỉnh cho tổ hợp đa ngành?
          </h2>
<p className="font-body-lg text-body-lg text-slate-300 leading-relaxed">
            Chúng tôi triển khai kiến trúc Server riêng biệt, kết nối API các hệ thống lõi có sẵn, tùy biến quy trình theo văn hóa vận hành doanh nghiệp và cam kết dịch vụ SLA 99.95%.
          </p>
</div>
<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md shrink-0 w-full sm:w-auto relative z-10">
<a className="px-space-xl py-space-md rounded-xl bg-primary-container hover:bg-primary text-on-primary font-bold text-sm text-center shadow-lg transition-all flex items-center justify-center gap-space-xs cursor-pointer" href="/signup">
<span>Đặt lịch tư vấn chuyên gia 1-on-1</span>
<span className="material-symbols-outlined text-[18px]">calendar_today</span>
</a>
<a className="px-space-xl py-space-md rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm text-center transition-all flex items-center justify-center gap-space-xs border border-white/10 cursor-pointer" href="tel:19006886">
<span className="material-symbols-outlined text-[18px]">call</span>
<span>Gọi Hotline: 1900 6886</span>
</a>
</div>
</div>
</div>
</section>
</div>
{/* CLIENT INTERACTIVITY JAVASCRIPT */}

      </main>
      <MarketingFooter />
    </div>
  );
}
