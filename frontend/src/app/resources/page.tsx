"use client";

import React, { useState } from "react";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import SpotlightCard from "@/components/animation/SpotlightCard";
import ShinyButton from "@/components/animation/ShinyButton";

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const resources = [
    {
      category: "ebook",
      tag: "Ebook Độc Quyền",
      title: "Cẩm nang Quản trị Kho vận & Triệt tiêu Rủi ro Bán âm",
      desc: "Chiến lược khóa giữ tồn kho tự động (Atomic Stock Lock) cho doanh nghiệp bán hàng đa kênh POS, Shopee và TikTok Shop.",
      readTime: "15 phút đọc",
      icon: "menu_book",
      badge: "HOT",
    },
    {
      category: "guide",
      tag: "Hướng Dẫn Triển Khai",
      title: "Quy trình Di chuyển Dữ liệu từ Excel sang ERP trong 24 Giờ",
      desc: "Hướng dẫn từng bước làm sạch dữ liệu danh mục hàng hóa, nhà cung cấp, công nợ và số dư đầu kỳ mà không gián đoạn bán lẻ.",
      readTime: "10 phút đọc",
      icon: "file_copy",
    },
    {
      category: "operations",
      tag: "Vận Hành Bán Hàng",
      title: "Chuẩn hóa Quy trình Xử lý Đơn hàng 5 Bước đạt SLA 99.8%",
      desc: "Mô hình luân chuyển đơn từ Tiếp nhận -> Khóa kho -> Xuất kho -> Bàn giao vận chuyển -> Đối soát dòng tiền Napas.",
      readTime: "12 phút đọc",
      icon: "local_shipping",
    },
    {
      category: "api",
      tag: "Lập Trình & Kết Nối",
      title: "Tài liệu BizPro+ Open API & HMAC Webhook Reference",
      desc: "Đặc tả kỹ thuật RESTful API kết nối hệ thống CRM, Kho hàng và Kế toán với các nền tảng bên thứ ba an toàn.",
      readTime: "Tài liệu kỹ thuật",
      icon: "code",
    },
    {
      category: "hrm",
      tag: "Nhân Sự & Tiền Lương",
      title: "Sổ tay Thiết lập Phân quyền RBAC 66 Quyền & Chấm công GPS",
      desc: "Kiểm soát truy cập dữ liệu nhạy cảm theo cấp bậc, chống gian lận điểm danh và tự động hóa tính lương hoa hồng kinh doanh.",
      readTime: "8 phút đọc",
      icon: "badge",
    },
    {
      category: "case",
      tag: "Nghiên Cứu Điển Hình",
      title: "Case Study V-Style: Tăng 3.2x Tốc độ Xử lý Đơn Hàng Chuỗi",
      desc: "Chi tiết lộ trình số hóa 18 showroom thời trang và 3 kho hàng trung tâm giúp tiết kiệm 240 giờ làm việc thủ công mỗi tháng.",
      readTime: "10 phút đọc",
      icon: "trending_up",
    },
  ];

  const filtered = activeCategory === "all" ? resources : resources.filter(r => r.category === activeCategory);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface antialiased">
      <MarketingHeader />

      <main className="w-full pt-20 bg-surface">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-surface py-16 lg:py-24 border-b border-surface-container">
          <div className="max-w-7xl mx-auto px-margin text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-primary-fixed text-on-primary-fixed shadow-sm mb-space-md">
              <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_stories
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                TRUNG TÂM TÀI NGUYÊN &amp; CẨM NANG THỰC CHIẾN
              </span>
            </div>

            <h1 className="font-headline-lg md:font-display text-headline-lg md:text-display text-on-surface max-w-4xl tracking-tight leading-tight">
              Kiến thức &amp; Công cụ quản trị doanh nghiệp chuẩn mực
            </h1>

            <p className="mt-space-md font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Tổng hợp cẩm nang vận hành, bộ tài liệu chuyển đổi số, biểu mẫu chuẩn hóa và tài liệu API kết nối dành riêng cho doanh nghiệp Việt.
            </p>

            {/* Category tabs */}
            <div className="mt-space-xl p-space-xs rounded-full bg-surface-container-high shadow-inner inline-flex items-center gap-space-xs flex-wrap justify-center">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`px-space-lg py-space-sm rounded-full font-body-md-medium text-body-md-medium transition-all ${
                  activeCategory === "all"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Tất cả tài nguyên
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("ebook")}
                className={`px-space-lg py-space-sm rounded-full font-body-md-medium text-body-md-medium transition-all ${
                  activeCategory === "ebook"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Ebook &amp; Cẩm nang
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("operations")}
                className={`px-space-lg py-space-sm rounded-full font-body-md-medium text-body-md-medium transition-all ${
                  activeCategory === "operations"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Vận hành kho vận
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("api")}
                className={`px-space-lg py-space-sm rounded-full font-body-md-medium text-body-md-medium transition-all ${
                  activeCategory === "api"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Open API Docs
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("hrm")}
                className={`px-space-lg py-space-sm rounded-full font-body-md-medium text-body-md-medium transition-all ${
                  activeCategory === "hrm"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Nhân sự &amp; Lương
              </button>
            </div>
          </div>
        </section>

        {/* RESOURCES GRID */}
        <section className="max-w-7xl mx-auto px-margin py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {filtered.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-space-xl border border-surface-container shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-space-md">
                    <div className="w-11 h-11 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                    </div>
                    {item.badge && (
                      <span className="px-space-xs py-0.5 rounded-full bg-error text-on-error font-caption text-caption font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <span className="px-space-sm py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">
                    {item.tag}
                  </span>

                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-space-sm group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm leading-relaxed line-clamp-3">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-space-lg mt-space-lg border-t border-surface-container/60 flex items-center justify-between">
                  <span className="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    <span>{item.readTime}</span>
                  </span>

                  <Link
                    href="/demo"
                    className="font-body-md-medium text-body-md-medium text-primary hover:text-primary-container flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Xem tài liệu</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
