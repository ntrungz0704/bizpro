"use client";

import React from "react";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function CustomersPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface antialiased">
      <MarketingHeader />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
{/* Hero Section */}
<section className="relative w-full bg-surface py-20 px-margin overflow-hidden">
<div className="max-w-7xl mx-auto flex flex-col items-center text-center">
<div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-primary-fixed text-on-primary-fixed mb-space-lg">
<span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider">Khách hàng &amp; Câu chuyện thành công</span>
</div>
<h1 className="font-display text-display-mobile lg:text-display text-on-surface max-w-4xl tracking-tight mb-space-lg">
        Đồng hành cùng doanh nghiệp trên hành trình vận hành hiệu quả
      </h1>
<p className="font-body-lg text-body-lg text-secondary max-w-3xl mb-space-xl">
        Tìm hiểu cách hơn 2.500+ doanh nghiệp Việt Nam tại nhiều lĩnh vực chuẩn hóa dòng chảy dữ liệu, tinh gọn bộ máy và tối ưu biên lợi nhuận cùng hệ sinh thái BizPro+.
      </p>
<div className="flex flex-col sm:flex-row items-center gap-space-md mb-20">
<a className="w-full sm:w-auto inline-flex items-center justify-center px-space-xl py-3 rounded-lg bg-primary-container text-on-primary font-body-md-medium text-body-md-medium hover:bg-primary transition-colors shadow-sm" href="#featured-case">
          Khám phá câu chuyện tiêu biểu
          <span className="material-symbols-outlined text-[18px] ml-space-xs">arrow_downward</span>
</a>
<a className="w-full sm:w-auto inline-flex items-center justify-center px-space-xl py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md-medium text-body-md-medium shadow-sm hover:bg-surface-container-low transition-colors" href="#consultation-modal">
          Đăng ký tư vấn lộ trình
        </a>
</div>
{/* Trust Metrics Bar */}
<div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-gutter bg-surface-container-lowest rounded-xl p-space-xl shadow-sm">
<div className="flex flex-col items-start p-space-sm text-left">
<div className="font-display text-headline-lg lg:text-display text-primary tracking-tight font-bold">99.8%</div>
<div className="font-title-md text-title-md text-on-surface font-semibold mt-1">Độ chính xác tồn kho</div>
<div className="font-body-md text-body-md text-secondary mt-1">Kiểm soát đa điểm thời gian thực</div>
</div>
<div className="flex flex-col items-start p-space-sm text-left">
<div className="font-display text-headline-lg lg:text-display text-primary tracking-tight font-bold">3.5x</div>
<div className="font-title-md text-title-md text-on-surface font-semibold mt-1">Tốc độ xử lý đơn</div>
<div className="font-body-md text-body-md text-secondary mt-1">Tự động hoá luồng vận chuyển</div>
</div>
<div className="flex flex-col items-start p-space-sm text-left">
<div className="font-display text-headline-lg lg:text-display text-primary tracking-tight font-bold">-45%</div>
<div className="font-title-md text-title-md text-on-surface font-semibold mt-1">Thời gian làm báo cáo</div>
<div className="font-body-md text-body-md text-secondary mt-1">Tổng hợp tài chính cuối tháng</div>
</div>
<div className="flex flex-col items-start p-space-sm text-left">
<div className="font-display text-headline-lg lg:text-display text-primary tracking-tight font-bold">100%</div>
<div className="font-title-md text-title-md text-on-surface font-semibold mt-1">Đồng hành 1-on-1</div>
<div className="font-body-md text-body-md text-secondary mt-1">Bàn giao &amp; đào tạo tận nơi</div>
</div>
</div>
</div>
</section>
{/* Logo Cloud Section */}
<section className="w-full bg-surface-container-low/70 py-16 px-margin border-y border-surface-container">
<div className="max-w-7xl mx-auto flex flex-col items-center">
<div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold uppercase tracking-wider mb-4">
<span className="material-symbols-outlined text-[16px] text-primary">verified</span>
<span>MẠNG LƯỚI KHÁCH HÀNG TIÊU BIỂU</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold text-center mb-2">
    Được tin chọn bởi hơn 2.400+ doanh nghiệp Việt Nam
  </h3>
<p className="font-body-md text-body-md text-secondary text-center max-w-2xl mb-10">
    Từ chuỗi bán lẻ thời trang, đại lý phân phối phụ tùng đến chuỗi nhà thuốc & chuỗi bách hóa trên toàn quốc.
  </p>
{/* Brand Pills - Zero Text Drop, Full Width Balanced Cards */}
<div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-6xl">
    {[
      { name: "An Phước", icon: "checkroom", sector: "Thời trang cao cấp" },
      { name: "V-Fashion", icon: "style", sector: "Chuỗi 18 Showroom" },
      { name: "Tân Phát Tech", icon: "memory", sector: "Linh kiện & Thiết bị" },
      { name: "Minh Long Auto", icon: "precision_manufacturing", sector: "Phụ tùng Ô tô" },
      { name: "Bách Hóa Xanh", icon: "shopping_basket", sector: "Bán lẻ Thực phẩm" },
      { name: "PharmaCare", icon: "local_pharmacy", sector: "Chuỗi Dược phẩm" },
      { name: "SunSmart", icon: "devices_other", sector: "Thiết bị Thông minh" },
    ].map((brand) => (
      <div
        key={brand.name}
        className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-xl bg-primary-fixed/60 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[20px]">{brand.icon}</span>
        </div>
        <div className="flex flex-col">
          <span className="font-title-sm text-title-sm font-bold text-on-surface whitespace-nowrap leading-tight">
            {brand.name}
          </span>
          <span className="font-caption text-caption text-secondary whitespace-nowrap">
            {brand.sector}
          </span>
        </div>
      </div>
    ))}
  </div>
</div>
</section>
{/* Featured Case Study */}
<section className="w-full bg-surface py-20 px-margin" id="featured-case">
<div className="max-w-7xl mx-auto">
<div className="bg-surface-container-lowest rounded-xl p-space-xl lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
{/* Left Editorial Detail */}
<div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-space-lg">
<div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-secondary-container text-on-secondary-fixed mb-space-md">
<span className="material-symbols-outlined text-[14px]">storefront</span>
<span className="font-label-sm text-label-sm tracking-wide uppercase">Tiêu điểm chuyển đổi số — Retail &amp; Omnichannel</span>
</div>
<h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface mb-space-md leading-tight">
            Chuỗi Bán lẻ Thời trang V-Style: Quản trị đồng bộ 18 cửa hàng &amp; 3 sàn TMĐT trên một màn hình duy nhất
          </h2>
<div className="flex flex-wrap items-center gap-space-md py-space-sm mb-space-md text-secondary font-label-md text-label-md">
<span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">domain</span> 18 showroom toàn quốc</span>
<span className="text-outline-variant">•</span>
<span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">groups</span> 85 nhân sự</span>
<span className="text-outline-variant">•</span>
<span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">inventory_2</span> 12.000 SKU hoạt động</span>
</div>
<div className="space-y-space-md font-body-md text-body-md text-secondary mb-space-lg">
<p>
<strong className="text-on-surface font-body-md-medium">Thách thức:</strong> Dữ liệu phân tán giữa POS cửa hàng và Shopee, TikTok Shop. Sai lệch tồn kho liên tục dẫn đến tình trạng hủy đơn flash sale, bộ phận kế toán mất 4 ngày mỗi tuần để đối soát thủ công dòng tiền COD.
            </p>
<p>
<strong className="text-on-surface font-body-md-medium">Giải pháp BizPro+:</strong> Triển khai tích hợp module Quản lý Đơn hàng (OMS) kết nối Kho vận (WMS) trung tâm, đồng bộ tự động tồn kho theo thời gian thực và quản lý nhân sự chấm công GPS.
            </p>
</div>
{/* Metrics Metric Pills */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md w-full mb-space-lg">
<div className="bg-surface-container-low rounded-lg p-space-md">
<div className="font-headline-md text-headline-md text-primary font-bold">94%</div>
<div className="font-caption text-caption text-secondary uppercase font-semibold mt-1">Giảm hủy đơn lệch kho</div>
</div>
<div className="bg-surface-container-low rounded-lg p-space-md">
<div className="font-headline-md text-headline-md text-primary font-bold">8 phút</div>
<div className="font-caption text-caption text-secondary uppercase font-semibold mt-1">Xử lý đơn (cũ 45 phút)</div>
</div>
<div className="bg-surface-container-low rounded-lg p-space-md">
<div className="font-headline-md text-headline-md text-primary font-bold">120 giờ</div>
<div className="font-caption text-caption text-secondary uppercase font-semibold mt-1">Tiết kiệm đối soát/tháng</div>
</div>
</div>
{/* Customer Quote */}
<div className="p-space-lg bg-surface-container-low rounded-xl w-full">
<p className="font-body-md text-body-md text-on-surface italic mb-space-sm">
              “Trước đây mỗi đợt sale là nỗi ám ảnh đối soát và kiểm kho. Với BizPro+, ban lãnh đạo nhìn thấy doanh thu và tồn kho chuẩn xác từng giây từ điện thoại.”
            </p>
<div className="font-body-md-medium text-body-md-medium text-on-surface">Ông Trần Quốc Bảo</div>
<div className="font-caption text-caption text-secondary">Giám đốc Điều hành V-Style</div>
</div>
</div>
{/* Right Visual Mockup Panel */}
<div className="lg:col-span-5 flex flex-col gap-space-md">
<div className="bg-surface-container rounded-xl p-space-lg shadow-sm">
<div className="flex items-center justify-between pb-space-sm mb-space-md">
<div className="flex items-center gap-space-xs">
<span className="w-3 h-3 rounded-full bg-error inline-block"></span>
<span className="w-3 h-3 rounded-full bg-secondary inline-block"></span>
<span className="w-3 h-3 rounded-full bg-primary inline-block"></span>
<span className="font-label-sm text-label-sm font-semibold text-secondary ml-2">V-Style Live Dashboard</span>
</div>
<span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-container-lowest text-primary">Thời gian thực</span>
</div>
{/* Dashboard Mini Card */}
<div className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm mb-space-md">
<div className="text-xs text-secondary mb-1">Doanh thu hôm nay (Toàn hệ thống)</div>
<div className="font-headline-md text-headline-md font-bold text-on-surface">342.800.000 ₫</div>
<div className="flex items-center gap-1 text-xs text-primary font-medium mt-1">
<span className="material-symbols-outlined text-[14px]">trending_up</span> +24.6% so với hôm qua
              </div>
</div>
{/* Mini Sparkline SVG */}
<div className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm mb-space-md">
<div className="flex items-center justify-between text-xs text-secondary mb-2">
<span>Luồng đơn hàng theo giờ</span>
<span className="font-semibold text-on-surface">1.842 đơn</span>
</div>
<svg className="w-full h-16 text-primary" fill="none" preserveAspectRatio="none" viewBox="0 0 200 40">
<path d="M0 35 L20 28 L40 32 L60 18 L80 22 L100 12 L120 16 L140 8 L160 14 L180 5 L200 10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
<path d="M0 35 L20 28 L40 32 L60 18 L80 22 L100 12 L120 16 L140 8 L160 14 L180 5 L200 10 L200 40 L0 40 Z" fill="currentColor" fillOpacity="0.08"></path>
</svg>
</div>
{/* Status Metrics */}
<div className="grid grid-cols-2 gap-space-sm">
<div className="bg-surface-container-lowest rounded-lg p-space-sm text-center">
<div className="text-xs text-secondary">Đồng bộ sàn TMĐT</div>
<div className="font-title-md text-title-md font-bold text-primary mt-1">100%</div>
<span className="text-[10px] text-secondary">Shopee • TikTok • Lazada</span>
</div>
<div className="bg-surface-container-lowest rounded-lg p-space-sm text-center">
<div className="text-xs text-secondary">Hoàn tất giao vận</div>
<div className="font-title-md text-title-md font-bold text-on-surface mt-1">98.7%</div>
<span className="text-[10px] text-secondary">18 Chi nhánh hoạt động</span>
</div>
</div>
</div>
<div className="rounded-xl overflow-hidden shadow-sm h-48 relative">
<img className="w-full h-full object-cover" data-alt="Modern Vietnamese retail clothing store with organized inventory and staff using tablets to check stock in a sleek boutique environment with blue brand accents" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6ALFPs3YG-31sU_gxQxPk2mbCQysu0muV17M_Eiqv1UGVfC_Uq9jD50OVR51cI65xwoOV63gDeT2kJE3_e_X7Fn7Oc-Xdemx9KOcmwZwjUcOyKqqqagxkH_qNAicMYikJTgMZ9o2P3G6ue4CP5Ktzxs-TYvYQXLc2Pu7Npvj4EwZD8Mo8_AcBm_rYVmaNx3lzV0T5LcJhN8NtmN5V1_OmU_BHMnIDlYLM4R7I-x0"/>
<div className="absolute inset-0 bg-gradient-to-t from-on-background/80 via-transparent to-transparent flex items-end p-space-md text-surface">
<span className="font-caption text-caption uppercase tracking-wider font-semibold">Cửa hàng V-Style Flagship, TP. Hồ Chí Minh</span>
</div>
</div>
</div>
</div>
</div>
</section>
{/* Industry Filter Directory */}
<section className="w-full bg-surface-container-low py-20 px-margin">
<div className="max-w-7xl mx-auto">
<div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-md">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">Thư viện giải pháp thực tế</span>
<h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface mt-1 tracking-tight">
            Case study theo ngành nghề
          </h2>
</div>
<p className="font-body-md text-body-md text-secondary max-w-md">
          Khám phá mô hình triển khai thực tế và kết quả đo lường cụ thể cho từng bài toán vận hành chuyên sâu.
        </p>
</div>
{/* Industry Tabs Filter */}
<div className="flex items-center gap-space-xs overflow-x-auto pb-space-sm mb-space-xl" id="industry-tabs">
<button className="filter-btn active px-space-lg py-2 rounded-full font-body-md-medium text-body-md-medium bg-primary text-on-primary transition-colors whitespace-nowrap shadow-sm" data-filter="all">
          Tất cả ngành nghề (12)
        </button>
<button className="filter-btn px-space-lg py-2 rounded-full font-body-md-medium text-body-md-medium bg-surface-container-lowest text-secondary hover:text-on-surface transition-colors whitespace-nowrap shadow-sm" data-filter="retail">
          Bán lẻ &amp; E-commerce (4)
        </button>
<button className="filter-btn px-space-lg py-2 rounded-full font-body-md-medium text-body-md-medium bg-surface-container-lowest text-secondary hover:text-on-surface transition-colors whitespace-nowrap shadow-sm" data-filter="distribution">
          Phân phối &amp; Bán buôn (3)
        </button>
<button className="filter-btn px-space-lg py-2 rounded-full font-body-md-medium text-body-md-medium bg-surface-container-lowest text-secondary hover:text-on-surface transition-colors whitespace-nowrap shadow-sm" data-filter="sme">
          SME Sản xuất &amp; Thương mại (3)
        </button>
<button className="filter-btn px-space-lg py-2 rounded-full font-body-md-medium text-body-md-medium bg-surface-container-lowest text-secondary hover:text-on-surface transition-colors whitespace-nowrap shadow-sm" data-filter="chains">
          Chuỗi đa chi nhánh (2)
        </button>
</div>
{/* Grid of Case Studies */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter" id="case-studies-grid">
{/* Card 1 */}
<div className="case-card bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow" data-category="distribution">
<div>
<div className="flex flex-wrap items-center gap-1 mb-space-md">
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">Phân phối</span>
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">Bán buôn</span>
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">Quản lý công nợ</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-xs">
              Phân phối Phụ Tùng AutoCore
            </h3>
<p className="font-body-md text-body-md text-secondary mb-space-md">
              Tự động hóa kiểm soát hạn mức công nợ 300 đại lý cấp 1-2, giảm 18 ngày thu hồi vốn lưu động trên toàn chuỗi.
            </p>
</div>
<div>
<div className="p-space-sm bg-surface-container-low rounded-lg mb-space-md">
<div className="text-xs text-secondary font-medium">Module: CRM + Bán hàng + Quản lý Kho</div>
<div className="text-sm font-semibold text-primary mt-1">+35% Năng suất đội ngũ Sales thị trường</div>
</div>
<div className="flex items-center justify-between text-xs text-secondary">
<span>Hà Nội &amp; Bắc Ninh</span>
<span className="material-symbols-outlined text-[18px] text-primary">arrow_forward</span>
</div>
</div>
</div>
{/* Card 2 */}
<div className="case-card bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow" data-category="retail">
<div>
<div className="flex flex-wrap items-center gap-1 mb-space-md">
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">Chuỗi bán lẻ</span>
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">Dược phẩm</span>
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">Quản lý Lô/Hạn dùng</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-xs">
              Dược phẩm &amp; Thiết bị MediVina
            </h3>
<p className="font-body-md text-body-md text-secondary mb-space-md">
              Kiểm soát chặt chẽ Lot/Date của 4.500 mặt hàng y tế, kích hoạt cảnh báo cận date tự động trước 90 ngày.
            </p>
</div>
<div>
<div className="p-space-sm bg-surface-container-low rounded-lg mb-space-md">
<div className="text-xs text-secondary font-medium">Module: WMS + OMS + Báo cáo BI</div>
<div className="text-sm font-semibold text-primary mt-1">Giảm 0% rủi ro hủy hàng quá hạn</div>
</div>
<div className="flex items-center justify-between text-xs text-secondary">
<span>TP. Hồ Chí Minh</span>
<span className="material-symbols-outlined text-[18px] text-primary">arrow_forward</span>
</div>
</div>
</div>
{/* Card 3 */}
<div className="case-card bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow" data-category="sme">
<div>
<div className="flex flex-wrap items-center gap-1 mb-space-md">
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">Sản xuất</span>
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">SME</span>
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">Quản trị dự án</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-xs">
              Cơ khí Chế tạo &amp; XK Kim Long
            </h3>
<p className="font-body-md text-body-md text-secondary mb-space-md">
              Số hóa toàn bộ phiếu xuất nhập kho nguyên vật liệu và chấm công KPI ca kíp cho 120 công nhân xưởng sản xuất.
            </p>
</div>
<div>
<div className="p-space-sm bg-surface-container-low rounded-lg mb-space-md">
<div className="text-xs text-secondary font-medium">Module: HRM + WMS + Executive Dashboard</div>
<div className="text-sm font-semibold text-primary mt-1">Tiết kiệm 45 triệu đ chi phí vận hành/tháng</div>
</div>
<div className="flex items-center justify-between text-xs text-secondary">
<span>Bình Dương</span>
<span className="material-symbols-outlined text-[18px] text-primary">arrow_forward</span>
</div>
</div>
</div>
{/* Card 4 */}
<div className="case-card bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow" data-category="chains">
<div>
<div className="flex flex-wrap items-center gap-1 mb-space-md">
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">Chuỗi F&amp;B</span>
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">Đa chi nhánh</span>
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">Định lượng tồn kho</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-xs">
              Chuỗi Cà phê Saigon Taste
            </h3>
<p className="font-body-md text-body-md text-secondary mb-space-md">
              Điều phối nguyên vật liệu cho 12 chi nhánh tại TP.HCM, tự động trừ kho nguyên liệu theo công thức chuẩn hóa.
            </p>
</div>
<div>
<div className="p-space-sm bg-surface-container-low rounded-lg mb-space-md">
<div className="text-xs text-secondary font-medium">Module: Kho hàng + Bán hàng + HRM</div>
<div className="text-sm font-semibold text-primary mt-1">Giảm 12% hao hụt nguyên vật liệu tươi sống</div>
</div>
<div className="flex items-center justify-between text-xs text-secondary">
<span>TP. Hồ Chí Minh</span>
<span className="material-symbols-outlined text-[18px] text-primary">arrow_forward</span>
</div>
</div>
</div>
{/* Card 5 */}
<div className="case-card bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow" data-category="sme">
<div>
<div className="flex flex-wrap items-center gap-1 mb-space-md">
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">Dịch vụ &amp; Dự án</span>
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">B2B</span>
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">Hợp đồng</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-xs">
              Nội Thất &amp; Thiết Bị OfficePro
            </h3>
<p className="font-body-md text-body-md text-secondary mb-space-md">
              Theo dõi tiến độ nghiệm thu dự án văn phòng và điều phối đội thi công lắp đặt theo các mốc giải ngân.
            </p>
</div>
<div>
<div className="p-space-sm bg-surface-container-low rounded-lg mb-space-md">
<div className="text-xs text-secondary font-medium">Module: CRM Pipeline + Hợp đồng + HRM</div>
<div className="text-sm font-semibold text-primary mt-1">Tăng 28% tỷ lệ chốt hợp đồng dự án lớn</div>
</div>
<div className="flex items-center justify-between text-xs text-secondary">
<span>Đà Nẵng &amp; Hà Nội</span>
<span className="material-symbols-outlined text-[18px] text-primary">arrow_forward</span>
</div>
</div>
</div>
{/* Card 6 */}
<div className="case-card bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow" data-category="retail">
<div>
<div className="flex flex-wrap items-center gap-1 mb-space-md">
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">Bán lẻ đa kênh</span>
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">E-commerce</span>
<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-container text-secondary">Live stream</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-xs">
              Thời trang Trẻ em SunBaby
            </h3>
<p className="font-body-md text-body-md text-secondary mb-space-md">
              Xử lý 3.000 đơn hàng/ngày trong các đợt Mega Live mà không nghẽn kho hay trễ hạn bàn giao đơn vị bưu cục.
            </p>
</div>
<div>
<div className="p-space-sm bg-surface-container-low rounded-lg mb-space-md">
<div className="text-xs text-secondary font-medium">Module: OMS + WMS Tốc độ cao</div>
<div className="text-sm font-semibold text-primary mt-1">Tỷ lệ giao đúng hẹn đạt 99.4%</div>
</div>
<div className="flex items-center justify-between text-xs text-secondary">
<span>Hà Nội</span>
<span className="material-symbols-outlined text-[18px] text-primary">arrow_forward</span>
</div>
</div>
</div>
</div>
</div>
</section>
{/* Customer Success Journey */}
<section className="w-full bg-surface py-20 px-margin">
<div className="max-w-7xl mx-auto">
<div className="text-center max-w-3xl mx-auto mb-space-xl">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">Quy trình bàn giao Enterprise</span>
<h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface mt-1 tracking-tight">
          Đồng hành từ khảo sát đến vận hành bền vững
        </h2>
<p className="font-body-md text-body-md text-secondary mt-space-sm">
          BizPro+ không chỉ cung cấp phần mềm. Đội ngũ chuyên gia chuyển giao cam kết ở bên doanh nghiệp đến khi vận hành trơn tru.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-5 gap-gutter relative">
{/* Step 1 */}
<div className="bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between shadow-sm relative">
<div>
<div className="w-10 h-10 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center mb-space-md text-title-md">
              01
            </div>
<h4 className="font-title-md text-title-md text-on-surface font-semibold mb-space-xs">Khảo sát &amp; Thiết kế</h4>
<p className="font-body-md text-body-md text-secondary">
              Đánh giá hiện trạng luồng vận hành thực tế tại doanh nghiệp và thiết kế luồng dữ liệu chuẩn.
            </p>
</div>
<div className="mt-space-md pt-space-sm">
<span className="font-caption text-caption text-primary font-semibold uppercase">1 - 2 ngày làm việc</span>
</div>
</div>
{/* Step 2 */}
<div className="bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between shadow-sm relative">
<div>
<div className="w-10 h-10 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center mb-space-md text-title-md">
              02
            </div>
<h4 className="font-title-md text-title-md text-on-surface font-semibold mb-space-xs">Chuẩn hóa dữ liệu</h4>
<p className="font-body-md text-body-md text-secondary">
              Làm sạch, mapping danh mục sản phẩm, tồn kho và công nợ từ hệ thống cũ/Excel vào BizPro+.
            </p>
</div>
<div className="mt-space-md pt-space-sm">
<span className="font-caption text-caption text-primary font-semibold uppercase">2 - 3 ngày làm việc</span>
</div>
</div>
{/* Step 3 */}
<div className="bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between shadow-sm relative">
<div>
<div className="w-10 h-10 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center mb-space-md text-title-md">
              03
            </div>
<h4 className="font-title-md text-title-md text-on-surface font-semibold mb-space-xs">Đào tạo theo phòng ban</h4>
<p className="font-body-md text-body-md text-secondary">
              Đào tạo cầm tay chỉ việc cho Sales, Kho vận, Kế toán và cấp quản lý theo phân quyền chuyên sâu.
            </p>
</div>
<div className="mt-space-md pt-space-sm">
<span className="font-caption text-caption text-primary font-semibold uppercase">2 - 3 ngày làm việc</span>
</div>
</div>
{/* Step 4 */}
<div className="bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between shadow-sm relative">
<div>
<div className="w-10 h-10 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center mb-space-md text-title-md">
              04
            </div>
<h4 className="font-title-md text-title-md text-on-surface font-semibold mb-space-xs">Go-live chính thức</h4>
<p className="font-body-md text-body-md text-secondary">
              Chạy song song và kích hoạt vận hành chính thức với sự túc trực của kỹ sư BizPro+ tại hiện trường.
            </p>
</div>
<div className="mt-space-md pt-space-sm">
<span className="font-caption text-caption text-primary font-semibold uppercase">Tuần đầu tiên</span>
</div>
</div>
{/* Step 5 */}
<div className="bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between shadow-sm relative">
<div>
<div className="w-10 h-10 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center mb-space-md text-title-md">
              05
            </div>
<h4 className="font-title-md text-title-md text-on-surface font-semibold mb-space-xs">Hỗ trợ 1-on-1 Trọn đời</h4>
<p className="font-body-md text-body-md text-secondary">
              Chuyên viên Customer Success riêng biệt đồng hành định kỳ, rà soát hiệu suất và tối ưu mở rộng.
            </p>
</div>
<div className="mt-space-md pt-space-sm">
<span className="font-caption text-caption text-primary font-semibold uppercase">Đồng hành trọn đời</span>
</div>
</div>
</div>
</div>
</section>
{/* Testimonials Wall */}
<section className="w-full bg-surface-container-low py-20 px-margin">
<div className="max-w-7xl mx-auto">
<div className="text-center max-w-2xl mx-auto mb-space-xl">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">Góc nhìn lãnh đạo</span>
<h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface mt-1 tracking-tight">
          Lãnh đạo nói gì về BizPro+
        </h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
{/* Testimonial 1 */}
<div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center gap-1 text-primary mb-space-md">
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
</div>
<p className="font-body-lg text-body-lg text-on-surface italic leading-relaxed mb-space-lg">
              “Trước đây tôi sợ nhất là mở thêm chi nhánh vì không quản lý nổi. BizPro+ đã giúp chúng tôi nhân rộng từ 3 lên 12 cửa hàng mà không cần tuyển thêm quản lý cấp trung.”
            </p>
</div>
<div className="flex items-center gap-space-md pt-space-md">
<div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-surface-container">
<img className="w-full h-full object-cover" data-alt="Professional Vietnamese female operations executive smiling warmly in a bright corporate office setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnHcKipUOfmAtmd6x4Y1RdDjoz_a7HBc185zrR5On6ArNsQq0bpMmlctvNGfaGygE4frQUy4-Dpgrvjkwn8GGLvrWzhqxRbMLf-vwAjxyosqSB7beEv0TLim28ZD3G5vQk2jU4EcgipNPlIZIdoa5k4v1Imejz1IpaX9NKQNVigtz42LjaCx-Zdda12GMpPVUaAckHEEY0HkuZ4TK1JNEm1qFuK9HMhpNCiA8xdyI"/>
</div>
<div>
<div className="font-title-md text-title-md font-semibold text-on-surface">Chị Phạm Mai Lan</div>
<div className="font-caption text-caption text-secondary">Giám đốc Vận hành SunBaby</div>
</div>
</div>
</div>
{/* Testimonial 2 */}
<div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center gap-1 text-primary mb-space-md">
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
</div>
<p className="font-body-lg text-body-lg text-on-surface italic leading-relaxed mb-space-lg">
              “Module CRM và Bán hàng kết nối thẳng với Kho đã chấm dứt hoàn toàn tình trạng kinh doanh hứa hẹn giao hàng nhưng kho lại báo hết. Khách hàng đối tác đánh giá rất cao độ chuẩn xác.”
            </p>
</div>
<div className="flex items-center gap-space-md pt-space-md">
<div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-surface-container">
<img className="w-full h-full object-cover" data-alt="Vietnamese male tech CEO in executive business attire speaking at a corporate office with smart modern background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1Em0vyKakXsr7cd_KaCWurifRZnEU4W-nADl8NxT7jqwznYgQMx8h4zfNlIu6K9drBv50w0HeKEDRG65McUmT1Xjlmc9I-syLg1TKus4mxkZELF2E_WqLMwFzKQwN6-nWWNUwwfo4gaWk7Mi_8WT0ccIhxG6AC7peLO5t1j1ziz8bIqYBu7TNOzcTjcKuKp57Ze-9Mhy67jT4PMo6K2SCmMAljS_5p9pM-0R7IUA"/>
</div>
<div>
<div className="font-title-md text-title-md font-semibold text-on-surface">Anh Nguyễn Văn Hưng</div>
<div className="font-caption text-caption text-secondary">CEO Tân Phát Tech</div>
</div>
</div>
</div>
{/* Testimonial 3 */}
<div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center gap-1 text-primary mb-space-md">
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
<span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
</div>
<p className="font-body-lg text-body-lg text-on-surface italic leading-relaxed mb-space-lg">
              “Báo cáo P&amp;L và đối soát công nợ giờ chỉ mất 1 cú click thay vì cả tuần thức đêm đối chiếu bảng tính. Tính minh bạch tài chính giúp chúng tôi tự tin nhận vốn đầu tư.”
            </p>
</div>
<div className="flex items-center gap-space-md pt-space-md">
<div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-surface-container">
<img className="w-full h-full object-cover" data-alt="Vietnamese female chief financial officer in elegant blazer reviewing financial papers in modern conference room" src="https://lh3.googleusercontent.com/aida-public/AB6AXuByFuBKYH8IJBQ6xsiJs3zTFKr9yS4b11Vu_YGexDjWpLAA48FcBm_alr5gd5Qf-NcCNoiHX5frHf1syL7PkZj3RfihMMK9QCz-H58-l_-q7FLNhYRx9zLI-7rDy6T6Q8U11n0BuxynDLdRqNk1Al_D2-M9zHwqV66eUowgg4blcKAqGEj0qE3_3qlKV-Rds9DwqibR4O1XLPZQYcB0X_0s9naa08Ew4ivMdBMx9FY"/>
</div>
<div>
<div className="font-title-md text-title-md font-semibold text-on-surface">Chị Lê Thanh Trúc</div>
<div className="font-caption text-caption text-secondary">Kế toán trưởng LogiTech Á Châu</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* CTA Section */}
<section className="w-full bg-[#0B1220] py-24 px-margin text-surface-container-lowest relative overflow-hidden">
<div className="max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
<div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary-fixed mb-space-lg">
<span className="material-symbols-outlined text-[28px]">rocket_launch</span>
</div>
<h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg font-bold tracking-tight text-surface-container-lowest mb-space-md">
        Doanh nghiệp của bạn sẵn sàng bứt phá cùng BizPro+?
      </h2>
<p className="font-body-lg text-body-lg text-surface-container-highest max-w-2xl mb-space-xl">
        Đặt lịch tư vấn trực tiếp cùng chuyên gia giải pháp BizPro+ để nhận bản phác thảo quy trình vận hành và kiểm tra tính tương thích dữ liệu hoàn toàn miễn phí.
      </p>
<div className="flex flex-col sm:flex-row items-center gap-space-md w-full justify-center">
<a className="w-full sm:w-auto inline-flex items-center justify-center px-space-xl py-3 rounded-lg bg-primary text-on-primary font-body-md-medium text-body-md-medium hover:bg-primary-container transition-colors shadow-sm" href="#consultation-modal">
<span className="material-symbols-outlined text-[20px] mr-space-xs">support_agent</span>
          Đặt lịch tư vấn 1-on-1 tận nơi
        </a>
<a className="w-full sm:w-auto inline-flex items-center justify-center px-space-xl py-3 rounded-lg bg-surface-container-lowest/10 text-surface-container-lowest font-body-md-medium text-body-md-medium hover:bg-surface-container-lowest/20 transition-colors backdrop-blur-sm shadow-sm" href="/signup">
          Trải nghiệm bản dùng thử 14 ngày
        </a>
</div>
<div className="flex flex-wrap items-center justify-center gap-space-lg mt-space-xl text-xs text-[#94A3B8]">
<span className="inline-flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-primary-fixed">check_circle</span>
          Không yêu cầu thẻ tín dụng
        </span>
<span className="inline-flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-primary-fixed">check_circle</span>
          Ký cam kết bảo mật NDA dữ liệu
        </span>
<span className="inline-flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-primary-fixed">check_circle</span>
          Tư vấn giải pháp miễn phí tại Hà Nội &amp; TP.HCM
        </span>
</div>
</div>
</section>
</div>

      </main>
      <MarketingFooter />
    </div>
  );
}
