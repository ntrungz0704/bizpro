"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function SolutionsPage() {
  const [activeTab, setActiveTab] = useState<string>("retail-ecommerce");

  const scrollToSection = (id: string, updateUrl = true) => {
    setActiveTab(id);
    if (updateUrl && typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // account for sticky header & tabs
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    // Auto-center the active tab button in horizontal scroll container
    if (typeof document !== "undefined") {
      const tabBtn = document.getElementById(`tab-btn-${id}`);
      if (tabBtn) {
        tabBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  };

  useEffect(() => {
    // Deep linking on mount
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      const validSections = ["retail-ecommerce", "wholesale-dist", "sme-growth", "multi-branch", "operations-services"];
      if (validSections.includes(hash)) {
        setTimeout(() => {
          scrollToSection(hash, false);
        }, 150);
      }
    }

    const handleScroll = () => {
      const sections = ["retail-ecommerce", "wholesale-dist", "sme-growth", "multi-branch", "operations-services"];
      const scrollPos = window.scrollY + 200;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveTab(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface antialiased">
      <MarketingHeader />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
{/* SECTION 1: HERO & ECOSYSTEM CONVERGENCE */}
<section className="relative overflow-hidden bg-surface-container-lowest py-space-xl lg:py-24">
<div className="max-w-7xl mx-auto px-margin">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
{/* Text Column */}
<div className="lg:col-span-6 flex flex-col z-10">
<div className="inline-flex items-center gap-space-xs self-start px-space-md py-space-xs rounded-full bg-surface-container text-primary font-label-sm text-label-sm mb-space-md">
<span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            KIẾN TRÚC ERP MAY ĐO THEO NGÀNH
          </div>
<h1 className="font-display text-headline-lg lg:text-display text-on-surface font-bold tracking-tight mb-space-lg leading-tight">
            Giải pháp quản trị phù hợp với từng mô hình doanh nghiệp
          </h1>
<p className="font-body-lg text-body-lg text-on-surface-variant mb-space-xl max-w-xl leading-relaxed">
            BizPro+ kết nối quy trình quản lý khách hàng, bán hàng, kho hàng và nhân sự theo nhu cầu vận hành thực tế của từng ngành nghề tại Việt Nam.
          </p>
<div className="flex flex-wrap items-center gap-space-md mb-space-xl">
<button onClick={() => scrollToSection("retail-ecommerce")} className="inline-flex items-center justify-center px-space-xl py-space-md rounded-xl bg-primary-container text-on-primary font-bold text-sm hover:bg-primary shadow-sm transition-all duration-200 group cursor-pointer" type="button">
              Khám phá giải pháp ngành
              <span className="material-symbols-outlined text-[18px] ml-space-xs group-hover:translate-x-1 transition-transform">arrow_forward</span>
</button>
<a className="inline-flex items-center justify-center px-space-xl py-space-md rounded-xl bg-surface-container-low text-on-surface font-bold text-sm hover:bg-surface-container transition-all duration-200 cursor-pointer" href="/signup">
              Dùng thử miễn phí
            </a>
</div>
{/* Micro Trust Metrics */}
<div className="grid grid-cols-3 gap-space-md pt-space-lg">
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm font-bold text-on-surface tabular-nums">2.400+</span>
<span className="font-caption text-caption text-secondary">Doanh nghiệp ứng dụng</span>
</div>
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm font-bold text-on-surface tabular-nums">99.98%</span>
<span className="font-caption text-caption text-secondary">Độ sẵn sàng hệ thống</span>
</div>
<div className="flex flex-col">
<span className="font-headline-sm text-headline-sm font-bold text-on-surface tabular-nums">&lt; 14 ngày</span>
<span className="font-caption text-caption text-secondary">Thời gian triển khai trung bình</span>
</div>
</div>
</div>
{/* Interactive Ecosystem Diagram */}
<div className="lg:col-span-6 relative mt-space-lg lg:mt-0">
<div className="relative w-full aspect-square max-w-[540px] mx-auto bg-surface-container-low rounded-xl p-space-lg flex items-center justify-center shadow-sm">
{/* Background Radial Glow */}
<div className="absolute inset-0 bg-gradient-to-tr from-primary-fixed/20 via-transparent to-tertiary-fixed/30 rounded-xl pointer-events-none"></div>
{/* Central Platform Core */}
<div className="relative z-20 w-36 h-36 rounded-full bg-inverse-surface text-inverse-on-surface p-space-md flex flex-col items-center justify-center text-center shadow-xl border-4 border-surface-container-lowest">
<span className="material-symbols-outlined text-primary-fixed-dim text-[32px] mb-space-xs">hub</span>
<span className="font-title-md text-title-md font-bold tracking-tight text-surface-container-lowest">BizPro+ Core</span>
<span className="font-caption text-caption text-secondary-fixed opacity-80 uppercase tracking-widest mt-0.5">Một nền tảng</span>
</div>
{/* Orbit 1: Retail & E-commerce */}
<div onClick={() => scrollToSection("retail-ecommerce")} className="absolute top-6 left-8 z-10 p-space-sm rounded-xl bg-surface-container-lowest shadow-md flex items-center gap-space-xs hover:scale-105 transition-transform cursor-pointer border border-slate-200/60">
<div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">storefront</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md font-bold text-on-surface">Bán lẻ & TMĐT</span>
<span className="font-caption text-caption text-secondary">Đồng bộ tồn kho real-time</span>
</div>
</div>
{/* Orbit 2: Wholesale & Distribution */}
<div onClick={() => scrollToSection("wholesale-dist")} className="absolute top-6 right-8 z-10 p-space-sm rounded-xl bg-surface-container-lowest shadow-md flex items-center gap-space-xs hover:scale-105 transition-transform cursor-pointer border border-slate-200/60">
<div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
<span className="material-symbols-outlined text-[20px]">local_shipping</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md font-bold text-on-surface">Phân phối & Sỉ</span>
<span className="font-caption text-caption text-secondary">Hạn mức công nợ & giá bậc</span>
</div>
</div>
{/* Orbit 3: Multi-Branch Network */}
<div onClick={() => scrollToSection("multi-branch")} className="absolute bottom-8 left-6 z-10 p-space-sm rounded-xl bg-surface-container-lowest shadow-md flex items-center gap-space-xs hover:scale-105 transition-transform cursor-pointer border border-slate-200/60">
<div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary">
<span className="material-symbols-outlined text-[20px]">apartment</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md font-bold text-on-surface">Chuỗi Đa cơ sở</span>
<span className="font-caption text-caption text-secondary">Luân chuyển kho & GPS HRM</span>
</div>
</div>
{/* Orbit 4: Professional Services */}
<div onClick={() => scrollToSection("operations-services")} className="absolute bottom-8 right-6 z-10 p-space-sm rounded-xl bg-surface-container-lowest shadow-md flex items-center gap-space-xs hover:scale-105 transition-transform cursor-pointer border border-slate-200/60">
<div className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center text-on-primary-fixed-variant">
<span className="material-symbols-outlined text-[20px]">engineering</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md font-bold text-on-surface">Dịch vụ & Dự án</span>
<span className="font-caption text-caption text-secondary">Hợp đồng & Nghiệm thu</span>
</div>
</div>
{/* Orbit 5: Commercial SME (Mid Right) */}
<div onClick={() => scrollToSection("sme-growth")} className="absolute top-1/2 -right-4 -translate-y-1/2 z-10 p-space-sm rounded-xl bg-surface-container-lowest shadow-md flex items-center gap-space-xs hover:scale-105 transition-transform cursor-pointer border border-slate-200/60">
<div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined text-[20px]">trending_up</span>
</div>
<div className="flex flex-col">
<span className="font-label-md text-label-md font-bold text-on-surface">SME Tăng trưởng</span>
<span className="font-caption text-caption text-secondary">Quy trình tự động hóa</span>
</div>
</div>
{/* Vector Connector Lines */}
<svg className="absolute inset-0 w-full h-full pointer-events-none text-outline-variant" fill="none" stroke="currentColor" stroke-dasharray="3 3" stroke-width="1.5">
<line x1="25%" x2="50%" y1="18%" y2="50%"></line>
<line x1="75%" x2="50%" y1="18%" y2="50%"></line>
<line x1="25%" x2="50%" y1="82%" y2="50%"></line>
<line x1="75%" x2="50%" y1="82%" y2="50%"></line>
<line x1="88%" x2="50%" y1="50%" y2="50%"></line>
</svg>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 2: INDUSTRY NAVIGATION TABS */}
<section className="sticky top-20 z-40 bg-surface-container-lowest/95 backdrop-blur-md shadow-md py-space-sm border-b border-surface-container">
<div className="max-w-7xl mx-auto px-margin">
<div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" id="solution-tabs">
<button id="tab-btn-retail-ecommerce" onClick={() => scrollToSection("retail-ecommerce")} className={`industry-tab px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === "retail-ecommerce" ? "bg-primary text-on-primary shadow-md scale-[1.02] ring-2 ring-primary/20" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"}`} type="button">
<span className="material-symbols-outlined text-[18px]">shopping_bag</span>
          Bán lẻ & Thương mại điện tử
        </button>
<button id="tab-btn-wholesale-dist" onClick={() => scrollToSection("wholesale-dist")} className={`industry-tab px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === "wholesale-dist" ? "bg-primary text-on-primary shadow-md scale-[1.02] ring-2 ring-primary/20" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"}`} type="button">
<span className="material-symbols-outlined text-[18px]">inventory</span>
          Phân phối & Bán buôn
        </button>
<button id="tab-btn-sme-growth" onClick={() => scrollToSection("sme-growth")} className={`industry-tab px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === "sme-growth" ? "bg-primary text-on-primary shadow-md scale-[1.02] ring-2 ring-primary/20" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"}`} type="button">
<span className="material-symbols-outlined text-[18px]">domain</span>
          SME Thương mại & Dịch vụ
        </button>
<button id="tab-btn-multi-branch" onClick={() => scrollToSection("multi-branch")} className={`industry-tab px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === "multi-branch" ? "bg-primary text-on-primary shadow-md scale-[1.02] ring-2 ring-primary/20" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"}`} type="button">
<span className="material-symbols-outlined text-[18px]">store</span>
          Doanh nghiệp Đa chi nhánh
        </button>
<button id="tab-btn-operations-services" onClick={() => scrollToSection("operations-services")} className={`industry-tab px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === "operations-services" ? "bg-primary text-on-primary shadow-md scale-[1.02] ring-2 ring-primary/20" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"}`} type="button">
<span className="material-symbols-outlined text-[18px]">support_agent</span>
          Dịch vụ & Vận hành
        </button>
</div>
</div>
</section>
{/* SECTION 3: RETAIL & E-COMMERCE DEEP SECTION */}
<section className="py-space-xl lg:py-24 bg-surface scroll-mt-28" id="retail-ecommerce">
<div className="max-w-7xl mx-auto px-margin">
{/* Section Header */}
<div className="flex flex-col mb-space-xl">
<div className="flex items-center gap-space-xs text-primary font-label-md text-label-md uppercase tracking-wider mb-space-xs">
<span className="material-symbols-outlined text-[18px]">shopping_cart</span>
          Ngành hàng Bán lẻ Đa kênh & Sàn TMĐT
        </div>
<h2 className="font-headline-lg text-headline-md lg:text-headline-lg text-on-surface font-bold tracking-tight">
          Đồng bộ tồn kho giữa cửa hàng và kênh bán online
        </h2>
<p className="font-body-lg text-body-lg text-secondary max-w-3xl mt-space-xs">
          Tối ưu trải nghiệm mua sắm liền mạch, kiểm soát tồn kho tức thời giữa Shopee, TikTok Shop, Lazada, Website Brand và mạng lưới POS cửa hàng vật lý.
        </p>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
{/* Pain points & Solution points */}
<div className="lg:col-span-5 flex flex-col gap-space-lg">
{/* Challenges Card */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm">
<h3 className="font-title-md text-title-md font-semibold text-error mb-space-md flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[20px]">warning</span>
              Thách thức vận hành thường gặp
            </h3>
<ul className="space-y-space-sm">
<li className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface-variant">
<span className="material-symbols-outlined text-[18px] text-error shrink-0">close</span>
<span><strong>Lệch tồn kho giữa các kênh:</strong> Bán vượt số lượng tồn thực tế trên sàn (overselling), gây phạt sao và hủy đơn hàng loạt.</span>
</li>
<li className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface-variant">
<span className="material-symbols-outlined text-[18px] text-error shrink-0">close</span>
<span><strong>Xử lý đơn phân tán:</strong> Nhân sự phải đăng nhập riêng lẻ 4-5 cổng quản trị sàn để xác nhận và in phiếu giao hàng.</span>
</li>
<li className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface-variant">
<span className="material-symbols-outlined text-[18px] text-error shrink-0">close</span>
<span><strong>Nhập hàng chậm trễ:</strong> Thiếu dự báo SKU bán chạy, hàng hot đứt gãy trong các chiến dịch Mega Sale.</span>
</li>
<li className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface-variant">
<span className="material-symbols-outlined text-[18px] text-error shrink-0">close</span>
<span><strong>Khó đối soát doanh thu:</strong> Phí sàn, phí vận chuyển và tỷ lệ hoàn đơn mập mờ, mất hàng tuần để chốt sổ tài chính.</span>
</li>
</ul>
</div>
{/* BizPro+ Solution Card */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm">
<h3 className="font-title-md text-title-md font-semibold text-primary mb-space-md flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[20px]">verified</span>
              Giải pháp từ BizPro+
            </h3>
<div className="space-y-space-md">
<div className="flex items-start gap-space-sm">
<div className="w-7 h-7 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[16px]">sync</span>
</div>
<div>
<h4 className="font-body-md-medium text-body-md-medium text-on-surface">Đồng bộ tồn kho tức thời (Real-time Sync)</h4>
<p className="font-body-md text-body-md text-secondary">Tự động trừ kho khi phát sinh đơn trên bất kỳ kênh nào trong vòng &lt; 1,2 giây. Khóa kho an toàn theo từng chiến dịch bán hàng.</p>
</div>
</div>
<div className="flex items-start gap-space-sm">
<div className="w-7 h-7 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[16px]">inbox</span>
</div>
<div>
<h4 className="font-body-md-medium text-body-md-medium text-on-surface">Quản lý đơn hàng tập trung (Single-hub Fulfillment)</h4>
<p className="font-body-md text-body-md text-secondary">Gom toàn bộ đơn Shopee, TikTok Shop, POS về một luồng kiểm duyệt, in phiếu đóng gói loạt và bàn giao đơn vị vận chuyển.</p>
</div>
</div>
<div className="flex items-start gap-space-sm">
<div className="w-7 h-7 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[16px]">loyalty</span>
</div>
<div>
<h4 className="font-body-md-medium text-body-md-medium text-on-surface">Tích hợp Khuyến mãi & Khách hàng thân thiết</h4>
<p className="font-body-md text-body-md text-secondary">Tích điểm hợp nhất từ mua tại quầy đến mua online qua số điện thoại, voucher phân hạng tự động và CRM chăm sóc hậu mãi.</p>
</div>
</div>
</div>
</div>
</div>
{/* UI Mockup: Retail POS & Inventory order monitor */}
<div className="lg:col-span-7">
<div className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden p-space-lg">
<div className="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-container">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-[22px]">point_of_sale</span>
<span className="font-title-md text-title-md font-bold text-on-surface">Bảng điều phối Tồn kho Đa kênh Omni-Channel</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-caption text-caption font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Live Auto-sync
                </span>
</div>
</div>
{/* Live SKU Monitor Table */}
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="bg-surface-container-low text-secondary font-label-sm text-label-sm">
<th className="py-space-sm px-space-md">Mã SKU / Tên SP</th>
<th className="py-space-sm px-space-sm text-right">Kho tổng</th>
<th className="py-space-sm px-space-sm text-right">POS Flagship</th>
<th className="py-space-sm px-space-sm text-right">Shopee / TikTok</th>
<th className="py-space-sm px-space-md text-center">Trạng thái SKU</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container font-body-md text-body-md">
<tr className="hover:bg-surface-container-low/50">
<td className="py-space-md px-space-md">
<div className="font-body-md-medium text-on-surface">SKU-88210 · Áo Polo Pique Pro</div>
<div className="font-caption text-caption text-secondary">Size L · Xanh Navy · Giá: 450.000 ₫</div>
</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums font-medium">1.240</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums">48</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums">850</td>
<td className="py-space-md px-space-md text-center">
<span className="inline-block px-2.5 py-0.5 rounded-full bg-surface-container text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
                        Sẵn sàng bán
                      </span>
</td>
</tr>
<tr className="hover:bg-surface-container-low/50">
<td className="py-space-md px-space-md">
<div className="font-body-md-medium text-on-surface">SKU-99042 · Quần Khaki Stretch</div>
<div className="font-caption text-caption text-secondary">Size 32 · Be sáng · Giá: 590.000 ₫</div>
</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums font-medium">210</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums">12</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums">180</td>
<td className="py-space-md px-space-md text-center">
<span className="inline-block px-2.5 py-0.5 rounded-full bg-surface-variant text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                        Sắp hết hàng
                      </span>
</td>
</tr>
<tr className="hover:bg-surface-container-low/50">
<td className="py-space-md px-space-md">
<div className="font-body-md-medium text-on-surface">SKU-77401 · Áo Khoác Dù WindProof</div>
<div className="font-caption text-caption text-secondary">Size XL · Đen bóng · Giá: 720.000 ₫</div>
</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums font-medium text-error">4</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums text-error">0</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums">0</td>
<td className="py-space-md px-space-md text-center">
<span className="inline-block px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                        Cháy hàng sàn
                      </span>
</td>
</tr>
<tr className="hover:bg-surface-container-low/50">
<td className="py-space-md px-space-md">
<div className="font-body-md-medium text-on-surface">SKU-31298 · Giày Sneaker Urban Step</div>
<div className="font-caption text-caption text-secondary">Size 42 · Trắng · Giá: 1.150.000 ₫</div>
</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums font-medium">620</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums">26</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums">410</td>
<td className="py-space-md px-space-md text-center">
<span className="inline-block px-2.5 py-0.5 rounded-full bg-surface-container text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
                        Sẵn sàng bán
                      </span>
</td>
</tr>
</tbody>
</table>
</div>
{/* Mini stats strip */}
<div className="grid grid-cols-3 gap-space-md mt-space-lg pt-space-md bg-surface-container-low p-space-md rounded-lg">
<div>
<span className="font-caption text-caption text-secondary block">Tốc độ xử lý đơn</span>
<span className="font-title-md text-title-md font-bold text-on-surface">3,2 giây/đơn</span>
</div>
<div>
<span className="font-caption text-caption text-secondary block">Tỷ lệ hủy do thiếu tồn</span>
<span className="font-title-md text-title-md font-bold text-primary">0.02%</span>
</div>
<div>
<span className="font-caption text-caption text-secondary block">Số kênh kết nối</span>
<span className="font-title-md text-title-md font-bold text-on-surface">7 kênh</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 4: WHOLESALE & DISTRIBUTION DEEP SECTION */}
<section className="py-space-xl lg:py-24 bg-surface-container-low scroll-mt-28" id="wholesale-dist">
<div className="max-w-7xl mx-auto px-margin">
{/* Section Header */}
<div className="flex flex-col mb-space-xl">
<div className="flex items-center gap-space-xs text-primary font-label-md text-label-md uppercase tracking-wider mb-space-xs">
<span className="material-symbols-outlined text-[18px]">local_shipping</span>
          Ngành Phân phối, Đại lý & Bán buôn (B2B)
        </div>
<h2 className="font-headline-lg text-headline-md lg:text-headline-lg text-on-surface font-bold tracking-tight">
          Quản lý hệ thống phân phối và đơn hàng tập trung
        </h2>
<p className="font-body-lg text-body-lg text-secondary max-w-3xl mt-space-xs">
          Giải pháp kiểm soát dòng tiền, hạn mức công nợ theo cấp đại lý và tối ưu hóa luồng điều phối xuất hàng container khối lượng lớn.
        </p>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
{/* UI Mockup: Wholesale Dashboard */}
<div className="lg:col-span-7 order-2 lg:order-1">
<div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg">
<div className="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-container">
<div>
<span className="font-title-md text-title-md font-bold text-on-surface block">Theo dõi Hạn mức Công nợ & Bậc giá Đại lý</span>
<span className="font-caption text-caption text-secondary">Cập nhật realtime theo chứng từ đối soát ngân hàng</span>
</div>
<button className="px-space-md py-space-xs rounded-md bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-colors flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">add_circle</span>
                Tạo báo giá B2B
              </button>
</div>
{/* Agent Table */}
<div className="overflow-x-auto mb-space-md">
<table className="w-full text-left">
<thead>
<tr className="bg-surface-container text-secondary font-label-sm text-label-sm">
<th className="py-space-sm px-space-md">Nhà phân phối / Vùng</th>
<th className="py-space-sm px-space-sm">Cấp chiết khấu</th>
<th className="py-space-sm px-space-sm text-right">Công nợ hiện tại</th>
<th className="py-space-sm px-space-sm text-right">Hạn mức tối đa</th>
<th className="py-space-sm px-space-md text-center">Trạng thái duyệt</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container font-body-md text-body-md">
<tr className="hover:bg-surface-container-low/40">
<td className="py-space-md px-space-md">
<div className="font-body-md-medium text-on-surface">Đại lý Phúc Khang (Hà Nội)</div>
<div className="font-caption text-caption text-secondary">Mã: NPP-HN09 · 12 HĐ hoàn tất</div>
</td>
<td className="py-space-md px-space-sm">
<span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">Tier 1 (22%)</span>
</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums font-semibold text-on-surface">1.450.000.000 ₫</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums text-secondary">2.000.000.000 ₫</td>
<td className="py-space-md px-space-md text-center">
<span className="inline-block px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
                        Trong hạn mức
                      </span>
</td>
</tr>
<tr className="hover:bg-surface-container-low/40">
<td className="py-space-md px-space-md">
<div className="font-body-md-medium text-on-surface">Công ty Song Long (Đà Nẵng)</div>
<div className="font-caption text-caption text-secondary">Mã: NPP-DN03 · 8 HĐ hoàn tất</div>
</td>
<td className="py-space-md px-space-sm">
<span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">Tier 2 (18%)</span>
</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums font-semibold text-error">980.000.000 ₫</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums text-secondary">1.000.000.000 ₫</td>
<td className="py-space-md px-space-md text-center">
<span className="inline-block px-2.5 py-0.5 rounded-full bg-surface-variant text-on-secondary-fixed font-label-sm text-label-sm font-semibold">
                        Cảnh báo (98%)
                      </span>
</td>
</tr>
<tr className="hover:bg-surface-container-low/40">
<td className="py-space-md px-space-md">
<div className="font-body-md-medium text-on-surface">Minh Phát Trading (Bình Dương)</div>
<div className="font-caption text-caption text-secondary">Mã: NPP-BD14 · 19 HĐ hoàn tất</div>
</td>
<td className="py-space-md px-space-sm">
<span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-semibold">Tier 1 (22%)</span>
</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums font-semibold text-on-surface">420.000.000 ₫</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums text-secondary">2.500.000.000 ₫</td>
<td className="py-space-md px-space-md text-center">
<span className="inline-block px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
                        Trong hạn mức
                      </span>
</td>
</tr>
</tbody>
</table>
</div>
{/* Workflow Visualizer Strip */}
<div className="bg-surface-container-high p-space-md rounded-lg flex items-center justify-between text-xs text-on-surface">
<div className="flex items-center gap-1 font-semibold">
<span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px]">1</span>
                Báo giá theo tier
              </div>
<span className="material-symbols-outlined text-[16px] text-secondary">trending_flat</span>
<div className="flex items-center gap-1 font-semibold">
<span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px]">2</span>
                Kiểm tra bảo lãnh nợ
              </div>
<span className="material-symbols-outlined text-[16px] text-secondary">trending_flat</span>
<div className="flex items-center gap-1 font-semibold">
<span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px]">3</span>
                Lệnh xuất kho bãi
              </div>
<span className="material-symbols-outlined text-[16px] text-secondary">trending_flat</span>
<div className="flex items-center gap-1 font-semibold">
<span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px]">4</span>
                Vận đơn đường xa
              </div>
</div>
</div>
</div>
{/* Text & Pillars */}
<div className="lg:col-span-5 order-1 lg:order-2 flex flex-col gap-space-lg">
<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm">
<h3 className="font-title-md text-title-md font-semibold text-error mb-space-md flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[20px]">report</span>
              Nút thắt phân phối quy mô lớn
            </h3>
<ul className="space-y-space-sm">
<li className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface-variant">
<span className="material-symbols-outlined text-[18px] text-error shrink-0">close</span>
<span><strong>Quản lý công nợ đại lý phức tạp:</strong> Hàng trăm NPP với thời hạn nợ gối đầu 30-60-90 ngày, dễ phát sinh nợ xấu khó thu hồi.</span>
</li>
<li className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface-variant">
<span className="material-symbols-outlined text-[18px] text-error shrink-0">close</span>
<span><strong>Đơn hàng giá trị lớn nhiều bước duyệt:</strong> Giao dịch hàng tỷ đồng yêu cầu phê duyệt giá đặc biệt, gây đình trệ xuất xưởng.</span>
</li>
<li className="flex items-start gap-space-xs font-body-md text-body-md text-on-surface-variant">
<span className="material-symbols-outlined text-[18px] text-error shrink-0">close</span>
<span><strong>Điều phối kho tổng và kho trung chuyển:</strong> Khó theo dõi hàng đang trên đường đi (in-transit) và tình trạng kiểm đếm bến bãi.</span>
</li>
</ul>
</div>
<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm">
<h3 className="font-title-md text-title-md font-semibold text-primary mb-space-md flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[20px]">check_circle</span>
              Thế mạnh triển khai BizPro+
            </h3>
<div className="space-y-space-md">
<div>
<h4 className="font-body-md-medium text-body-md-medium text-on-surface">Quản lý giá bán nhiều cấp độ (Tiered Pricing Engine)</h4>
<p className="font-body-md text-body-md text-secondary">Cấu hình tự động chính sách giá theo Vùng/Miền, doanh số tích lũy, số lượng đặt tối thiểu (MOQ) và khuyến mãi đính kèm.</p>
</div>
<div>
<h4 className="font-body-md-medium text-body-md-medium text-on-surface">Kiểm soát giới hạn công nợ thông minh</h4>
<p className="font-body-md text-body-md text-secondary">Khóa tạo đơn tự động nếu đại lý chạm trần tín dụng hoặc có hóa đơn quá hạn chưa thanh toán, giảm 94% rủi ro dòng tiền.</p>
</div>
<div>
<h4 className="font-body-md-medium text-body-md-medium text-on-surface">Quy trình xuất kho container & Lộ trình giao nhận</h4>
<p className="font-body-md text-body-md text-secondary">Tối ưu hóa sắp xếp pallet, in phiếu xuất kho số lượng lớn và phân quyền đội xe vận chuyển đồng bộ theo định vị.</p>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 5: SME DEEP SECTION */}
<section className="py-space-xl lg:py-24 bg-surface scroll-mt-28" id="sme-growth">
<div className="max-w-7xl mx-auto px-margin">
<div className="max-w-3xl mx-auto text-center mb-space-xl">
<div className="inline-flex items-center gap-space-xs text-primary font-label-md text-label-md uppercase tracking-wider mb-space-xs">
<span className="material-symbols-outlined text-[18px]">rocket_launch</span>
          Doanh nghiệp SME Thương mại & Dịch vụ
        </div>
<h2 className="font-headline-lg text-headline-md lg:text-headline-lg text-on-surface font-bold tracking-tight">
          Quản trị tinh gọn cho doanh nghiệp đang phát triển
        </h2>
<p className="font-body-lg text-body-lg text-secondary mt-space-xs">
          Chấm dứt thời kỳ vận hành rời rạc trên hàng chục file Excel. Chuyển đổi số toàn diện chỉ trong 1 hệ thống chuẩn mực mà không cần thuê đội ngũ IT phức tạp.
        </p>
</div>
{/* 3-Column Bento Comparison */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
{/* Card 1: Pain to Gain 1 */}
<div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-space-lg">
<span className="material-symbols-outlined text-[28px]">table_view</span>
</div>
<span className="font-label-sm text-label-sm text-secondary uppercase block mb-1">Thực trạng phổ biến</span>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-md">Dữ liệu tản mát trên file Excel</h3>
<p className="font-body-md text-body-md text-secondary mb-space-lg leading-relaxed">
              Mỗi nhân viên một file dữ liệu khách hàng, file kho không khớp với file kế toán, sai sót số liệu khi nhân sự nghỉ việc đột ngột.
            </p>
</div>
<div className="pt-space-md border-t border-surface-container">
<span className="font-label-sm text-label-sm text-primary font-semibold block mb-1">Chuẩn hóa với BizPro+</span>
<p className="font-body-md text-body-md text-on-surface font-medium">Một nguồn dữ liệu tập trung (Single Source of Truth), phân quyền bảo mật chặt chẽ.</p>
</div>
</div>
{/* Card 2: Pain to Gain 2 */}
<div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-space-lg">
<span className="material-symbols-outlined text-[28px]">query_stats</span>
</div>
<span className="font-label-sm text-label-sm text-secondary uppercase block mb-1">Thực trạng phổ biến</span>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-md">Báo cáo chậm trễ, bị động</h3>
<p className="font-body-md text-body-md text-secondary mb-space-lg leading-relaxed">
              Cuối tháng CEO mới nhận được báo cáo doanh thu và chi phí; lúc phát hiện lỗ hoặc thất thoát thì cơ hội điều chỉnh kinh doanh đã trôi qua.
            </p>
</div>
<div className="pt-space-md border-t border-surface-container">
<span className="font-label-sm text-label-sm text-primary font-semibold block mb-1">Chuẩn hóa với BizPro+</span>
<p className="font-body-md text-body-md text-on-surface font-medium">Báo cáo tự động hóa 100% qua Dashboard trực quan, xem tức thì trên Mobile & Desktop.</p>
</div>
</div>
{/* Card 3: Pain to Gain 3 */}
<div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary mb-space-lg">
<span className="material-symbols-outlined text-[28px]">account_tree</span>
</div>
<span className="font-label-sm text-label-sm text-secondary uppercase block mb-1">Thực trạng phổ biến</span>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-md">Thiếu quy trình chuẩn hóa</h3>
<p className="font-body-md text-body-md text-secondary mb-space-lg leading-relaxed">
              Quy trình bán hàng và chăm sóc phụ thuộc cá nhân; người mới vào mất từ 2 đến 3 tháng mới nắm bắt được cách vận hành.
            </p>
</div>
<div className="pt-space-md border-t border-surface-container">
<span className="font-label-sm text-label-sm text-primary font-semibold block mb-1">Chuẩn hóa với BizPro+</span>
<p className="font-body-md text-body-md text-on-surface font-medium">Quy trình đóng gói sẵn theo chuẩn ISO ngành, nhân viên mới làm chủ chỉ sau 3 buổi huấn luyện.</p>
</div>
</div>
</div>
{/* SME Highlight Banner */}
<div className="mt-space-xl p-space-lg rounded-xl bg-surface-container-high flex flex-col md:flex-row items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[20px]">bolt</span>
</div>
<div>
<div className="font-body-lg-medium text-body-lg-medium text-on-surface">Triển khai trọn gói 4 phân hệ cốt lõi: CRM · Kho · Bán hàng · HRM</div>
<div className="font-body-md text-body-md text-secondary">Tặng kèm mẫu biểu chứng từ, luồng nhập xuất và KPI kinh doanh tiêu chuẩn Việt Nam.</div>
</div>
</div>
<a className="whitespace-nowrap px-space-lg py-space-sm rounded-lg bg-primary-container text-on-primary font-body-md-medium text-body-md-medium hover:bg-primary transition-colors" href="#consulting">
          Xem gói SME Starter
        </a>
</div>
</div>
</section>
{/* SECTION 6: MULTI-BRANCH ENTERPRISE */}
<section className="py-space-xl lg:py-24 bg-surface-container-low scroll-mt-28" id="multi-branch">
<div className="max-w-7xl mx-auto px-margin">
{/* Section Header */}
<div className="flex flex-col mb-space-xl">
<div className="flex items-center gap-space-xs text-primary font-label-md text-label-md uppercase tracking-wider mb-space-xs">
<span className="material-symbols-outlined text-[18px]">store</span>
          Chuỗi Bán lẻ & Hệ thống Doanh nghiệp Đa chi nhánh
        </div>
<h2 className="font-headline-lg text-headline-md lg:text-headline-lg text-on-surface font-bold tracking-tight">
          Quản lý tập trung nhiều chi nhánh trên một màn hình
        </h2>
<p className="font-body-lg text-body-lg text-secondary max-w-3xl mt-space-xs">
          Kiểm soát doanh thu, luân chuyển tồn kho nội bộ và dữ liệu nhân sự phân tán giữa Hà Nội, TP. Hồ Chí Minh, Đà Nẵng mà không mất tính bảo mật.
        </p>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
{/* Feature Highlights */}
<div className="lg:col-span-5 flex flex-col gap-space-lg">
{/* Card: Pain points */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm">
<h3 className="font-title-md text-title-md font-semibold text-error mb-space-md flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[20px]">error_outline</span>
              Thách thức quản trị chuỗi phân tán
            </h3>
<ul className="space-y-space-sm font-body-md text-body-md text-on-surface-variant">
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-[18px] text-error shrink-0">close</span>
<span><strong>Thiếu tầm nhìn tổng quan giữa các cơ sở:</strong> Chi nhánh A thừa hàng tồn đóng băng, chi nhánh B cháy hàng nhưng không hề biết để điều chuyển.</span>
</li>
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-[18px] text-error shrink-0">close</span>
<span><strong>Điều chuyển nội bộ chậm chạp:</strong> Giấy tờ ký tay, thất thoát hàng trên đường vận chuyển, mất 3-5 ngày để ghi nhận sổ sách.</span>
</li>
<li className="flex items-start gap-space-xs">
<span className="material-symbols-outlined text-[18px] text-error shrink-0">close</span>
<span><strong>Khó kiểm soát nhân viên theo ca:</strong> Quản lý cơ sở chấm công hộ, gian lận giờ làm việc và khó áp KPI đồng đều.</span>
</li>
</ul>
</div>
{/* Card: BizPro Solution */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm">
<h3 className="font-title-md text-title-md font-semibold text-primary mb-space-md flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[20px]">rule</span>
              Giải pháp chuẩn hóa từ BizPro+
            </h3>
<div className="space-y-space-md">
<div>
<h4 className="font-body-md-medium text-body-md-medium text-on-surface">Phân quyền đa tầng theo vai trò và cơ sở</h4>
<p className="font-body-md text-body-md text-secondary">Quản lý chi nhánh chỉ thấy doanh số và kho của cơ sở mình; Ban điều hành toàn quyền xem ma trận so sánh tổng thể.</p>
</div>
<div>
<h4 className="font-body-md-medium text-body-md-medium text-on-surface">Phiếu điều chuyển hàng nội bộ thông minh</h4>
<p className="font-body-md text-body-md text-secondary">Tạo yêu cầu, duyệt luân chuyển và quét mã vạch xác nhận tại điểm nhận; tồn kho 2 bên tự động cập nhật trong tích tắc.</p>
</div>
<div>
<h4 className="font-body-md-medium text-body-md-medium text-on-surface">Chấm công GPS & Ca kíp linh hoạt</h4>
<p className="font-body-md text-body-md text-secondary">Nhân sự check-in đúng bán kính 50m tại chi nhánh, tự động tính công tăng ca và phạt đi muộn vào bảng lương.</p>
</div>
</div>
</div>
</div>
{/* UI Mockup: Multi-branch comparison table & inventory transfer */}
<div className="lg:col-span-7">
<div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg">
<div className="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-container">
<div>
<span className="font-title-md text-title-md font-bold text-on-surface block">Ma trận Đối chiếu Doanh thu & Tồn kho Chi nhánh</span>
<span className="font-caption text-caption text-secondary">Dữ liệu tổng hợp kỳ: Tháng hiện tại (Real-time)</span>
</div>
<span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
<span className="material-symbols-outlined text-[16px]">domain</span> 4 Chi nhánh hoạt động
              </span>
</div>
{/* Table */}
<div className="overflow-x-auto mb-space-lg">
<table className="w-full text-left">
<thead>
<tr className="bg-surface-container-low text-secondary font-label-sm text-label-sm">
<th className="py-space-sm px-space-md">Cơ sở / Chi nhánh</th>
<th className="py-space-sm px-space-sm text-right">Doanh số ngày</th>
<th className="py-space-sm px-space-sm text-right">Giá trị tồn kho</th>
<th className="py-space-sm px-space-sm text-right">Nhân sự trực</th>
<th className="py-space-sm px-space-md text-center">Tiến độ KPI</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container font-body-md text-body-md">
<tr className="hover:bg-surface-container-low/40">
<td className="py-space-md px-space-md font-body-md-medium text-on-surface">
                      Chi nhánh 1: Hoàn Kiếm, HN
                    </td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums font-semibold">142.500.000 ₫</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums text-secondary">1.820.000.000 ₫</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums">14/14</td>
<td className="py-space-md px-space-md text-center">
<span className="inline-block px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">108%</span>
</td>
</tr>
<tr className="hover:bg-surface-container-low/40">
<td className="py-space-md px-space-md font-body-md-medium text-on-surface">
                      Chi nhánh 2: Cầu Giấy, HN
                    </td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums font-semibold">98.200.000 ₫</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums text-secondary">940.000.000 ₫</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums">9/10</td>
<td className="py-space-md px-space-md text-center">
<span className="inline-block px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">94%</span>
</td>
</tr>
<tr className="hover:bg-surface-container-low/40">
<td className="py-space-md px-space-md font-body-md-medium text-on-surface">
                      Chi nhánh 3: Quận 1, TP. HCM
                    </td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums font-semibold">215.800.000 ₫</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums text-secondary">2.410.000.000 ₫</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums">22/22</td>
<td className="py-space-md px-space-md text-center">
<span className="inline-block px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">122%</span>
</td>
</tr>
<tr className="hover:bg-surface-container-low/40">
<td className="py-space-md px-space-md font-body-md-medium text-on-surface">
                      Chi nhánh 4: Hải Châu, Đà Nẵng
                    </td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums font-semibold text-secondary">64.100.000 ₫</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums text-secondary">680.000.000 ₫</td>
<td className="py-space-md px-space-sm text-right font-mono tabular-nums">7/8</td>
<td className="py-space-md px-space-md text-center">
<span className="inline-block px-2.5 py-0.5 rounded-full bg-surface-variant text-on-secondary-fixed font-label-sm text-label-sm font-semibold">82%</span>
</td>
</tr>
</tbody>
</table>
</div>
{/* Inter-branch transfer snippet */}
<div className="bg-surface-container-low p-space-md rounded-lg">
<div className="flex items-center justify-between mb-space-sm">
<span className="font-body-md-medium text-body-md-medium text-on-surface flex items-center gap-1">
<span className="material-symbols-outlined text-primary text-[18px]">swap_horiz</span>
                  Phiếu điều chuyển kho liên chi nhánh đang xử lý
                </span>
<span className="font-caption text-caption text-secondary">Mã: DC-2025-049</span>
</div>
<div className="flex items-center justify-between text-xs text-secondary bg-surface-container-lowest p-space-sm rounded">
<div>Từ: <strong>Tổng kho Bắc Ninh</strong></div>
<span className="material-symbols-outlined text-[16px] text-primary">arrow_forward</span>
<div>Đến: <strong>Showroom Cầu Giấy</strong></div>
<div className="font-mono font-semibold text-on-surface">150 Sản phẩm</div>
<span className="px-2 py-0.5 rounded bg-surface-container text-primary font-semibold text-[11px]">Đang vận chuyển</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 7: SERVICES & OPERATIONS */}
<section className="py-space-xl lg:py-24 bg-surface scroll-mt-28" id="operations-services">
<div className="max-w-7xl mx-auto px-margin">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
{/* Content */}
<div className="lg:col-span-6 flex flex-col">
<div className="flex items-center gap-space-xs text-primary font-label-md text-label-md uppercase tracking-wider mb-space-xs">
<span className="material-symbols-outlined text-[18px]">assignment</span>
            Ngành Dịch vụ Tư vấn, Kỹ thuật & Dự án
          </div>
<h2 className="font-headline-lg text-headline-md lg:text-headline-lg text-on-surface font-bold tracking-tight mb-space-md">
            Tổ chức hoạt động kinh doanh và nhân sự hiệu quả
          </h2>
<p className="font-body-lg text-body-lg text-secondary mb-space-lg leading-relaxed">
            BizPro+ giúp các công ty dịch vụ quản trị vòng đời hợp đồng, theo dõi tiến độ từng gói thầu, phân bổ chuyên viên thực hiện và thanh quyết toán minh bạch theo mốc bàn giao.
          </p>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mb-space-xl">
<div className="p-space-md rounded-lg bg-surface-container-low">
<span className="material-symbols-outlined text-primary text-[24px] mb-space-xs">contract</span>
<h4 className="font-body-md-medium text-body-md-medium text-on-surface mb-1">Quản lý Hợp đồng & Phụ lục</h4>
<p className="font-body-md text-body-md text-secondary">Lưu trữ số hóa điều khoản, cảnh báo ngày gia hạn và theo dõi các mốc thanh toán nghiệm thu.</p>
</div>
<div className="p-space-md rounded-lg bg-surface-container-low">
<span className="material-symbols-outlined text-primary text-[24px] mb-space-xs">group_work</span>
<h4 className="font-body-md-medium text-body-md-medium text-on-surface mb-1">Phân bổ Chuyên viên Dự án</h4>
<p className="font-body-md text-body-md text-secondary">Nắm rõ tải công việc của từng nhân sự, hạn chế quá tải và đo lường số giờ làm việc thực tế (Timesheet).</p>
</div>
<div className="p-space-md rounded-lg bg-surface-container-low">
<span className="material-symbols-outlined text-primary text-[24px] mb-space-xs">event_available</span>
<h4 className="font-body-md-medium text-body-md-medium text-on-surface mb-1">Chấm công theo Dự án</h4>
<p className="font-body-md text-body-md text-secondary">Kết nối trực tiếp chi phí nhân công vào giá thành gói thầu, tính biên lợi nhuận ròng của từng hợp đồng.</p>
</div>
<div className="p-space-md rounded-lg bg-surface-container-low">
<span className="material-symbols-outlined text-primary text-[24px] mb-space-xs">receipt_long</span>
<h4 className="font-body-md-medium text-body-md-medium text-on-surface mb-1">Quyết toán Minh bạch</h4>
<p className="font-body-md text-body-md text-secondary">Xuất hóa đơn điện tử tự động theo tiến độ bàn giao, kiểm soát công nợ dịch vụ chưa thanh toán.</p>
</div>
</div>
<div>
<a className="inline-flex items-center gap-space-xs px-space-lg py-space-md rounded-lg bg-primary text-on-primary font-body-md-medium text-body-md-medium hover:bg-on-primary-fixed-variant transition-colors" href="#consulting">
              Đăng ký khảo sát mô hình Dịch vụ
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
</div>
</div>
{/* Visual representation */}
<div className="lg:col-span-6">
<div className="relative rounded-xl overflow-hidden shadow-lg bg-surface-container-lowest p-space-lg">
<div className="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-container">
<div className="flex items-center gap-space-xs">
<span className="w-3 h-3 rounded-full bg-primary"></span>
<span className="font-title-md text-title-md font-bold text-on-surface">Theo dõi Dự án: Triển khai Hệ thống Tòa nhà TechTower</span>
</div>
<span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-caption text-caption font-semibold">Giai đoạn 3/4</span>
</div>
{/* Milestone Tracker */}
<div className="space-y-space-md mb-space-lg">
<div className="flex items-center justify-between text-body-md font-body-md">
<span className="font-medium text-on-surface">1. Khảo sát & Ký kết thỏa thuận</span>
<span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">check_circle</span> Hoàn thành
                </span>
</div>
<div className="w-full bg-surface-container rounded-full h-2">
<div className="bg-primary h-2 rounded-full w-full"></div>
</div>
<div className="flex items-center justify-between text-body-md font-body-md">
<span className="font-medium text-on-surface">2. Cung cấp thiết bị phần cứng & Khảo sát vị trí</span>
<span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">check_circle</span> Hoàn thành
                </span>
</div>
<div className="w-full bg-surface-container rounded-full h-2">
<div className="bg-primary h-2 rounded-full w-full"></div>
</div>
<div className="flex items-center justify-between text-body-md font-body-md">
<span className="font-medium text-on-surface">3. Cài đặt hạ tầng & Nghiệm thu đợt 1</span>
<span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] animate-spin">refresh</span> Đang chạy (75%)
                </span>
</div>
<div className="w-full bg-surface-container rounded-full h-2">
<div className="bg-primary h-2 rounded-full w-3/4"></div>
</div>
<div className="flex items-center justify-between text-body-md font-body-md">
<span className="font-medium text-secondary">4. Bàn giao cuối kỳ & Thanh quyết toán bảo hành</span>
<span className="font-label-sm text-label-sm text-secondary">Chờ thực hiện</span>
</div>
<div className="w-full bg-surface-container rounded-full h-2">
<div className="bg-surface-variant h-2 rounded-full w-0"></div>
</div>
</div>
{/* Financial Status Box */}
<div className="p-space-md rounded-lg bg-surface-container-low grid grid-cols-2 gap-space-md">
<div>
<span className="font-caption text-caption text-secondary block">Giá trị hợp đồng</span>
<span className="font-title-md text-title-md font-bold text-on-surface tabular-nums">480.000.000 ₫</span>
</div>
<div>
<span className="font-caption text-caption text-secondary block">Đã thanh toán (Nghiệm thu)</span>
<span className="font-title-md text-title-md font-bold text-primary tabular-nums">336.000.000 ₫ (70%)</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 8: SOLUTION SELECTION MATRIX */}
<section className="py-space-xl lg:py-24 bg-surface-container-low">
<div className="max-w-7xl mx-auto px-margin">
<div className="text-center max-w-3xl mx-auto mb-space-xl">
<span className="font-label-md text-label-md text-primary font-semibold uppercase tracking-wider block mb-space-xs">So sánh chi tiết</span>
<h2 className="font-headline-lg text-headline-md lg:text-headline-lg text-on-surface font-bold tracking-tight">
          Ma trận Lựa chọn Giải pháp BizPro+
        </h2>
<p className="font-body-lg text-body-lg text-secondary mt-space-xs">
          Tìm kiếm giải pháp cấu hình hoàn hảo cho bài toán vận hành cốt lõi của doanh nghiệp bạn.
        </p>
</div>
{/* Structured Comparison Table */}
<div className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="bg-inverse-surface text-inverse-on-surface font-label-md text-label-md">
<th className="py-space-md px-space-lg w-1/5">Mô hình kinh doanh</th>
<th className="py-space-md px-space-lg w-1/4">Thách thức chính</th>
<th className="py-space-md px-space-lg w-1/4">Phân hệ BizPro+ trọng tâm</th>
<th className="py-space-md px-space-lg w-1/4">Hiệu quả vận hành kỳ vọng</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container font-body-md text-body-md text-on-surface">
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-space-lg px-space-lg font-body-md-medium">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">storefront</span>
<span>Bán lẻ & E-Commerce</span>
</div>
</td>
<td className="py-space-lg px-space-lg text-secondary">
                  Lệch tồn kho giữa sàn online & cửa hàng; quá tải khi xử lý đơn các đợt flash sale.
                </td>
<td className="py-space-lg px-space-lg font-medium text-on-surface">
<div className="inline-flex flex-wrap gap-1">
<span className="px-2 py-0.5 rounded bg-surface-container text-xs">Kho hàng</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-xs">Xử lý Đơn hàng</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-xs">POS Omni</span>
</div>
</td>
<td className="py-space-lg px-space-lg">
<span className="text-primary font-semibold">Giảm 99% lỗi hủy đơn</span> do thiếu hàng; đóng gói và bàn giao nhanh gấp 3 lần.
                </td>
</tr>
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-space-lg px-space-lg font-body-md-medium">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
<span>Phân phối & Bán buôn</span>
</div>
</td>
<td className="py-space-lg px-space-lg text-secondary">
                  Nợ đọng đại lý khó kiểm soát; chính sách chiết khấu bậc thang rối rắm, sai sót báo giá.
                </td>
<td className="py-space-lg px-space-lg font-medium text-on-surface">
<div className="inline-flex flex-wrap gap-1">
<span className="px-2 py-0.5 rounded bg-surface-container text-xs">Quản lý Công nợ</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-xs">Tier Pricing</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-xs">Kho Container</span>
</div>
</td>
<td className="py-space-lg px-space-lg">
<span className="text-primary font-semibold">Thu hồi nợ nhanh hơn 18 ngày</span>; tự động chặn xuất kho khi quá hạn mức tín dụng.
                </td>
</tr>
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-space-lg px-space-lg font-body-md-medium">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">domain</span>
<span>SME Thương mại & DV</span>
</div>
</td>
<td className="py-space-lg px-space-lg text-secondary">
                  Dữ liệu phân mảnh nhiều bảng tính; thiếu công cụ báo cáo lãnh đạo thời gian thực.
                </td>
<td className="py-space-lg px-space-lg font-medium text-on-surface">
<div className="inline-flex flex-wrap gap-1">
<span className="px-2 py-0.5 rounded bg-surface-container text-xs">CRM</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-xs">Bán hàng</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-xs">Kho</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-xs">Nhân sự Core</span>
</div>
</td>
<td className="py-space-lg px-space-lg">
<span className="text-primary font-semibold">Tiết kiệm 80% thời gian tổng hợp báo cáo</span>; chuyển đổi số hoàn tất sau 10 ngày.
                </td>
</tr>
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-space-lg px-space-lg font-body-md-medium">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">apartment</span>
<span>Chuỗi Đa chi nhánh</span>
</div>
</td>
<td className="py-space-lg px-space-lg text-secondary">
                  Mất kiểm soát số liệu giữa các tỉnh thành; luân chuyển tồn kho thất thoát; chấm công hộ.
                </td>
<td className="py-space-lg px-space-lg font-medium text-on-surface">
<div className="inline-flex flex-wrap gap-1">
<span className="px-2 py-0.5 rounded bg-surface-container text-xs">Kho Đa điểm</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-xs">Điều chuyển Kho</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-xs">HRM GPS</span>
</div>
</td>
<td className="py-space-lg px-space-lg">
<span className="text-primary font-semibold">Đồng bộ 100% doanh thu chi nhánh</span> trong 5 giây; giảm 45% thời gian luân chuyển hàng.
                </td>
</tr>
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-space-lg px-space-lg font-body-md-medium">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">support_agent</span>
<span>Dịch vụ & Vận hành</span>
</div>
</td>
<td className="py-space-lg px-space-lg text-secondary">
                  Không rõ lãi lỗ từng hợp đồng; khó điều phối lịch chuyên viên và theo dõi mốc thanh toán.
                </td>
<td className="py-space-lg px-space-lg font-medium text-on-surface">
<div className="inline-flex flex-wrap gap-1">
<span className="px-2 py-0.5 rounded bg-surface-container text-xs">Hợp đồng DV</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-xs">Timesheet Dự án</span>
<span className="px-2 py-0.5 rounded bg-surface-container text-xs">Quyết toán Mốc</span>
</div>
</td>
<td className="py-space-lg px-space-lg">
<span className="text-primary font-semibold">Tối ưu 30% hiệu suất nhân sự</span>; minh bạch 100% tiến độ nghiệm thu và dòng tiền dự án.
                </td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</section>
{/* SECTION 9: CONSULTING CTA (HIGH CONTRAST) */}
<section className="py-space-xl lg:py-24 bg-inverse-surface text-inverse-on-surface relative overflow-hidden" id="consulting">
<div className="max-w-7xl mx-auto px-margin relative z-10">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
{/* Text details */}
<div className="lg:col-span-7 flex flex-col">
<div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-variant text-on-secondary-fixed font-label-sm text-label-sm w-fit mb-space-md">
<span className="material-symbols-outlined text-[16px]">support_agent</span>
            ĐỒNG HÀNH TRỰC TIẾP TẠI DOANH NGHIỆP
          </div>
<h2 className="font-headline-lg text-headline-md lg:text-headline-lg font-bold text-surface-container-lowest tracking-tight mb-space-md">
            Mỗi doanh nghiệp có một quy trình vận hành riêng.
          </h2>
<p className="font-body-lg text-body-lg text-surface-container-high max-w-xl mb-space-lg leading-relaxed">
            Đội ngũ chuyên gia BizPro+ sẵn sàng đồng hành khảo sát hiện trạng, phân tích bài toán nghẽn dòng tiền và tư vấn mô hình tối ưu dành riêng cho quý công ty.
          </p>
<div className="space-y-space-sm font-body-md text-body-md text-surface-container">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary-fixed text-[18px]">check</span>
              Khảo sát quy trình Onsite hoặc Online 1-on-1 hoàn toàn miễn phí.
            </div>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary-fixed text-[18px]">check</span>
              Bản vẽ kiến trúc dòng dữ liệu và kế hoạch lộ trình triển khai chi tiết.
            </div>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary-fixed text-[18px]">check</span>
              Dự toán chi phí tối ưu, cam kết không phát sinh trong suốt vòng đời dự án.
            </div>
</div>
</div>
{/* Form Card */}
<div className="lg:col-span-5 bg-surface-container-lowest text-on-surface p-space-xl rounded-xl shadow-xl">
<h3 className="font-title-md text-title-md font-bold text-on-surface mb-space-xs">Nhận tư vấn giải pháp 1-on-1</h3>
<p className="font-body-md text-body-md text-secondary mb-space-md">Chuyên viên phụ trách ngành sẽ liên hệ trong 15 phút.</p>
<form className="space-y-space-md" onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn đã gửi thông tin! Đội ngũ chuyên gia BizPro+ sẽ liên hệ trong 15 phút làm việc.'); }}>
<div>
<label className="block font-label-md text-label-md text-on-surface mb-1">Họ tên người liên hệ *</label>
<input className="w-full px-space-md py-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Nguyễn Văn An" required type="text"/>
</div>
<div>
<label className="block font-label-md text-label-md text-on-surface mb-1">Số điện thoại doanh nghiệp *</label>
<input className="w-full px-space-md py-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0912 345 678" required type="tel"/>
</div>
<div>
<label className="block font-label-md text-label-md text-on-surface mb-1">Mô hình kinh doanh chính *</label>
<select className="w-full px-space-md py-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary">
<option value="retail">Bán lẻ & Thương mại điện tử (Omni-channel)</option>
<option value="wholesale">Phân phối & Bán buôn (Đại lý B2B)</option>
<option value="sme">Doanh nghiệp SME Thương mại & Dịch vụ</option>
<option value="multibranch">Doanh nghiệp Chuỗi nhiều chi nhánh</option>
<option value="services">Ngành Dịch vụ & Dự án tư vấn</option>
</select>
</div>
<div>
<label className="block font-label-md text-label-md text-on-surface mb-1">Vấn đề cần ưu tiên xử lý nhất</label>
<input className="w-full px-space-md py-space-sm rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Vd: Đồng bộ tồn Shopee, Quản lý công nợ..." type="text"/>
</div>
<button className="w-full py-space-md rounded-lg bg-primary-container text-on-primary font-body-md-medium text-body-md-medium hover:bg-primary transition-colors flex items-center justify-center gap-space-xs shadow-md" type="submit">
<span className="material-symbols-outlined text-[20px]">send</span>
              Gửi yêu cầu khảo sát chuyên sâu
            </button>
<p className="font-caption text-caption text-center text-secondary">
              Cam kết bảo mật 100% thông tin doanh nghiệp theo tiêu chuẩn ISO 27001.
            </p>
</form>
</div>
</div>
</div>
</section>
{/* Script for Navigation Active State */}

</div>
      </main>
      <MarketingFooter />
    </div>
  );
}
