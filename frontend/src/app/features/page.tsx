"use client";

import React from "react";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface antialiased">
      <MarketingHeader />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
{/* SECTION 1: HERO & ARCHITECTURE ENGINE */}
<section className="relative overflow-hidden bg-surface py-20 lg:py-28">
<div className="absolute inset-0 bg-gradient-to-b from-surface-container-low/60 via-transparent to-transparent pointer-events-none"></div>
<div className="max-w-7xl mx-auto px-margin relative z-10">
<div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
<div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm shadow-sm mb-space-lg">
<span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
<span>Hệ thống kiến trúc Enterprise Unified Core v4.2</span>
</div>
<h1 className="font-display text-display font-bold text-on-surface tracking-tight leading-tight mb-space-lg">
          Tất cả công cụ quản trị doanh nghiệp trên một nền tảng duy nhất
        </h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-space-xl">
          Quản lý khách hàng, kho hàng, đơn hàng và nhân sự trong một hệ thống thống nhất. Không còn phân mảnh dữ liệu, không cần tích hợp phức tạp.
        </p>
<div className="flex flex-wrap items-center justify-center gap-space-md">
<a className="px-space-xl py-space-md rounded-lg bg-primary-container text-on-primary font-body-lg-medium text-body-lg-medium shadow-md hover:bg-primary transition-all flex items-center gap-space-xs" href="#phan-he">
<span>Khám phá chi tiết các phân hệ</span>
<span className="material-symbols-outlined text-[18px]">arrow_downward</span>
</a>
<a className="px-space-xl py-space-md rounded-lg bg-surface-container-lowest text-on-surface font-body-lg-medium text-body-lg-medium shadow-sm hover:bg-surface-container transition-all flex items-center gap-space-xs" href="/signup">
<span>Dùng thử miễn phí</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
</div>
</div>
{/* Core Engine Interactive Schema Blueprint */}
<div className="w-full bg-inverse-surface text-inverse-on-surface rounded-2xl p-space-xl shadow-2xl relative overflow-hidden">
<div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
<div className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-tertiary/10 blur-3xl pointer-events-none"></div>
<div className="relative z-10 flex flex-col gap-space-xl">
<div className="flex flex-wrap items-center justify-between gap-space-md pb-space-lg">
<div className="flex items-center gap-space-md">
<span className="p-space-sm rounded-lg bg-primary-container/20 text-inverse-primary">
<span className="material-symbols-outlined">hub</span>
</span>
<div>
<h2 className="font-title-md text-title-md font-bold text-surface-container-lowest">BizPro+ Core Database Architecture</h2>
<p className="font-caption text-caption text-outline-variant">Realtime Distributed PostgreSQL Engine & Transactional Sync</p>
</div>
</div>
<div className="flex items-center gap-space-lg text-outline-variant font-caption text-caption">
<span className="flex items-center gap-space-xs"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Multi-master Replication</span>
<span className="flex items-center gap-space-xs"><span className="w-2 h-2 rounded-full bg-primary-fixed"></span> 0.04ms Internal Bus</span>
<span className="flex items-center gap-space-xs"><span className="w-2 h-2 rounded-full bg-tertiary-fixed"></span> ISO 27001 Encrypted</span>
</div>
</div>
{/* Architecture Visual Matrix */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-space-lg relative">
{/* Node 1: CRM */}
<div className="bg-surface-container-highest/10 backdrop-blur-md rounded-xl p-space-lg flex flex-col justify-between hover:bg-surface-container-highest/15 transition-all border border-white/5">
<div>
<div className="flex items-center justify-between mb-space-md">
<span className="font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider font-semibold">Phân hệ 01</span>
<span className="material-symbols-outlined text-primary-fixed text-[20px]">groups</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-semibold text-surface-container-lowest mb-space-xs">CRM & Pipeline</h3>
<p className="font-body-md text-body-md text-outline-variant">Tập hợp dữ liệu khách hàng, deal flow và phân tích chân dung số.</p>
</div>
<div className="mt-space-lg pt-space-md border-t border-white/10">
<div className="font-caption text-caption text-sky-300 font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-[14px]">verified</span>
<span>15.000+ Khách hàng &amp; 360° Hồ sơ B2B</span>
</div>
</div>
</div>
{/* Node 2: Orders */}
<div className="bg-surface-container-highest/10 backdrop-blur-md rounded-xl p-space-lg flex flex-col justify-between hover:bg-surface-container-highest/15 transition-all border border-white/5">
<div>
<div className="flex items-center justify-between mb-space-md">
<span className="font-label-sm text-label-sm text-tertiary-fixed uppercase tracking-wider font-semibold">Phân hệ 02</span>
<span className="material-symbols-outlined text-tertiary-fixed text-[20px]">receipt_long</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-semibold text-surface-container-lowest mb-space-xs">Đơn hàng (Orders)</h3>
<p className="font-body-md text-body-md text-outline-variant">Điều phối dòng chứng từ, duyệt công nợ và đồng bộ giao nhận.</p>
</div>
<div className="mt-space-lg pt-space-md border-t border-white/10">
<div className="font-caption text-caption text-amber-300 font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-[14px]">receipt</span>
<span>Xử lý đa kênh &amp; 100% Khớp đối soát VAT</span>
</div>
</div>
</div>
{/* Node 3: Inventory */}
<div className="bg-surface-container-highest/10 backdrop-blur-md rounded-xl p-space-lg flex flex-col justify-between hover:bg-surface-container-highest/15 transition-all border border-white/5">
<div>
<div className="flex items-center justify-between mb-space-md">
<span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider font-semibold">Phân hệ 03</span>
<span className="material-symbols-outlined text-secondary-fixed text-[20px]">warehouse</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-semibold text-surface-container-lowest mb-space-xs">Kho hàng (Stock)</h3>
<p className="font-body-md text-body-md text-outline-variant">Theo dõi tồn kho thực tế, bảo lưu đơn hàng, kiểm đếm đa điểm.</p>
</div>
<div className="mt-space-lg pt-space-md border-t border-white/10">
<div className="font-caption text-caption text-emerald-300 font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-[14px]">lock_clock</span>
<span>Khóa kho 1.2s &amp; 99.8% Tồn kho chuẩn xác</span>
</div>
</div>
</div>
{/* Node 4: HRM */}
<div className="bg-surface-container-highest/10 backdrop-blur-md rounded-xl p-space-lg flex flex-col justify-between hover:bg-surface-container-highest/15 transition-all border border-white/5">
<div>
<div className="flex items-center justify-between mb-space-md">
<span className="font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider font-semibold">Phân hệ 04</span>
<span className="material-symbols-outlined text-primary-fixed text-[20px]">badge</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-semibold text-surface-container-lowest mb-space-xs">Nhân sự (HRM)</h3>
<p className="font-body-md text-body-md text-outline-variant">Chấm công GPS, tính hoa hồng bán hàng, bảng lương theo KPI.</p>
</div>
<div className="mt-space-lg pt-space-md border-t border-white/10">
<div className="font-caption text-caption text-sky-300 font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-[14px]">location_on</span>
<span>GPS Geofencing 200m &amp; Bảng lương tự động</span>
</div>
</div>
</div>
</div>
{/* Central Core Bus Strip */}
<div className="bg-surface-container-highest/20 rounded-xl p-space-md flex flex-col md:flex-row items-center justify-between gap-space-md text-center md:text-left">
<div className="flex items-center gap-space-md">
<span className="w-3 h-3 rounded-full bg-emerald-400"></span>
<span className="font-body-md-medium text-body-md-medium text-surface-container-lowest">Đồng bộ hai chiều theo chuẩn ACID: Mọi thay đổi ở CRM tự động sinh đơn hàng, khóa tồn kho và cộng thưởng nhân sự.</span>
</div>
<div className="font-label-md text-label-md px-space-md py-space-xs rounded bg-surface-container-highest/30 text-surface-container-lowest whitespace-nowrap">
              0% Độ trễ phân mảnh
            </div>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 2: 4 CORE MODULES OVERVIEW */}
<section className="py-24 bg-surface-container-low" id="phan-he">
<div className="max-w-7xl mx-auto px-margin">
<div className="max-w-3xl mb-16">
<span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">Tổng quan 6 trụ cột vận hành toàn diện</span>
<h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-space-xs mb-space-md">
          Mọi phân hệ bạn cần. Được thiết kế ăn khớp tuyệt đối.
        </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">
          Thay thế hoàn toàn 6 phần mềm rời rạc bằng bộ giải pháp all-in-one thống nhất theo quy chuẩn thương mại, sản xuất và kế toán Việt Nam.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
{/* Module 1 */}
<div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div>
<div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed mb-space-lg">
<span className="material-symbols-outlined text-[24px]">contacts</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">1. CRM & Bán hàng</h3>
<p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">Quản lý quan hệ khách hàng và luồng cơ hội hợp đồng khép kín.</p>
<ul className="space-y-space-sm text-on-surface font-body-md text-body-md">
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> Lead Management đa nguồn</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> Hồ sơ khách hàng 360°</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> Pipeline bán hàng trực quan</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> Lịch sử tương tác & cuộc gọi</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> Phân công chăm sóc tự động</li>
</ul>
</div>
<Link className="mt-space-xl inline-flex items-center gap-space-xs font-body-md-medium text-body-md-medium text-primary hover:text-on-primary-fixed-variant" href="/features/crm">
<span>Khám phá chi tiết CRM</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</Link>
</div>
{/* Module 2 */}
<div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div>
<div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed mb-space-lg">
<span className="material-symbols-outlined text-[24px]">inventory_2</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">2. Kho hàng & Tồn kho</h3>
<p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">Kiểm soát dòng vật chất đa điểm kho theo thời gian thực.</p>
<ul className="space-y-space-sm text-on-surface font-body-md text-body-md">
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span> Danh mục sản phẩm & mã SKU/Serial</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span> Quản lý kho đa chi nhánh</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span> Nhập - Xuất - Chuyển kho nội bộ</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span> Kiểm kê tồn định kỳ không dừng bán</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span> Cảnh báo tồn tối thiểu & hết hạn</li>
</ul>
</div>
<Link className="mt-space-xl inline-flex items-center gap-space-xs font-body-md-medium text-body-md-medium text-secondary hover:text-on-surface" href="/features/inventory">
<span>Khám phá chi tiết Kho hàng</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</Link>
</div>
{/* Module 3 */}
<div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div>
<div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed mb-space-lg">
<span className="material-symbols-outlined text-[24px]">shopping_cart_checkout</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">3. Quản lý Đơn hàng</h3>
<p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">Tự động hoá quy trình xử lý đơn từ chốt sale tới giao vận.</p>
<ul className="space-y-space-sm text-on-surface font-body-md text-body-md">
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span> Đơn bán lẻ, B2B & TMĐT đa sàn</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span> Cập nhật trạng thái tự động theo luồng</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span> Phê duyệt hạn mức công nợ khách hàng</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span> Đối soát vận chuyển & COD chuẩn xác</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span> Báo cáo doanh thu & tỷ suất lãi gộp</li>
</ul>
</div>
<Link className="mt-space-xl inline-flex items-center gap-space-xs font-body-md-medium text-body-md-medium text-tertiary hover:text-on-tertiary-fixed-variant" href="/features/sales-order">
<span>Khám phá chi tiết Đơn hàng</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</Link>
</div>
{/* Module 4 */}
<div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div>
<div className="w-12 h-12 rounded-xl bg-surface-variant flex items-center justify-center text-on-surface mb-space-lg">
<span className="material-symbols-outlined text-[24px]">badge</span>
</div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">4. Nhân sự & Tiền lương</h3>
<p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">Số hoá công tác tổ chức, chấm công và chi trả đãi ngộ.</p>
<ul className="space-y-space-sm text-on-surface font-body-md text-body-md">
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> Hồ sơ số hoá toàn diện của nhân sự</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> Chấm công online/GPS và thiết bị wifi</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> Phê duyệt ngày phép & ca kíp linh hoạt</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> Sơ đồ tổ chức phòng ban phân nhánh</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-primary text-[18px]">check_circle</span> Đánh giá KPI & tính hoa hồng chuẩn xác</li>
</ul>
</div>
<Link className="mt-space-xl inline-flex items-center gap-space-xs font-body-md-medium text-body-md-medium text-primary hover:text-on-primary-fixed-variant" href="/features/hrm">
<span>Khám phá chi tiết HRM</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</Link>
</div>
{/* Module 5 */}
<div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border-2 border-indigo-100">
<div>
<div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 mb-space-lg">
<span className="material-symbols-outlined text-[24px]">account_balance</span>
</div>
<div className="flex items-center justify-between mb-space-xs">
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">5. Kế toán & Tài chính</h3>
<span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">TT 200/133</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">Định khoản kép tự động, sổ cái tổng hợp & khóa sổ bảo mật.</p>
<ul className="space-y-space-sm text-on-surface font-body-md text-body-md">
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-indigo-600 text-[18px]">check_circle</span> Sổ nhật ký chung & Bảng cân đối PS</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-indigo-600 text-[18px]">check_circle</span> Phân định Doanh thu chuẩn VAS 14 / IFRS 15</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-indigo-600 text-[18px]">check_circle</span> Khóa sổ kỳ kế toán & Audit Trail</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-indigo-600 text-[18px]">check_circle</span> Báo cáo B01-DN, B02-DN, B03-DN</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-indigo-600 text-[18px]">check_circle</span> Đối soát công nợ tuổi nợ AR/AP</li>
</ul>
</div>
<Link className="mt-space-xl inline-flex items-center gap-space-xs font-body-md-medium text-body-md-medium text-indigo-700 hover:text-indigo-800" href="/features/accounting">
<span>Khám phá phân hệ Kế toán</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</Link>
</div>
{/* Module 6 */}
<div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border-2 border-orange-100">
<div>
<div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 mb-space-lg">
<span className="material-symbols-outlined text-[24px]">hub</span>
</div>
<div className="flex items-center justify-between mb-space-xs">
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">6. Đa kênh & Vận chuyển</h3>
<span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-bold">TMĐT & 4 Hãng</span>
</div>
<p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">Đồng bộ tồn kho tức thời Shopee, TikTok Shop, Lazada & giao vận.</p>
<ul className="space-y-space-sm text-on-surface font-body-md text-body-md">
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-orange-600 text-[18px]">check_circle</span> Đồng bộ đa sàn 2 chiều &lt; 50ms</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-orange-600 text-[18px]">check_circle</span> Khóa giữ hàng Atomic chống bán âm</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-orange-600 text-[18px]">check_circle</span> So sánh cước GHTK, GHN, Viettel Post</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-orange-600 text-[18px]">check_circle</span> In vận đơn hàng loạt khổ nhiệt A6</li>
<li className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-orange-600 text-[18px]">check_circle</span> Tự động đối soát COD & tiền sàn</li>
</ul>
</div>
<Link className="mt-space-xl inline-flex items-center gap-space-xs font-body-md-medium text-body-md-medium text-orange-700 hover:text-orange-800" href="/features/omnichannel">
<span>Khám phá Đa kênh &amp; Vận chuyển</span>
<span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</Link>
</div>
</div>
</div>
</section>
{/* SECTION 3: CRM DEEP DIVE */}
<section className="py-24 bg-surface" id="crm-deep">
<div className="max-w-7xl mx-auto px-margin">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center mb-16">
<div className="lg:col-span-5">
<div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm mb-space-md">
            Phân hệ Quản trị Quan hệ Khách hàng
          </div>
<h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-space-md">
            Quản lý khách hàng và cơ hội kinh doanh tập trung
          </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant mb-space-lg">
            Nắm bắt toàn cảnh từ lúc khách hàng tiềm năng gửi form liên hệ đến hợp đồng ký kết. Tự động hóa nhắc nhở chăm sóc, quản trị tỷ lệ thắng thầu trên từng cơ hội.
          </p>
<div className="space-y-space-md">
<div className="flex items-start gap-space-md">
<span className="p-space-xs rounded-lg bg-surface-container text-primary material-symbols-outlined">filter_alt</span>
<div>
<h4 className="font-title-md text-title-md font-semibold text-on-surface">Phễu bán hàng minh bạch</h4>
<p className="font-body-md text-body-md text-on-surface-variant">Phân cấp cơ hội theo xác suất và thời hạn dự kiến kết thúc.</p>
</div>
</div>
<div className="flex items-start gap-space-md">
<span className="p-space-xs rounded-lg bg-surface-container text-primary material-symbols-outlined">contact_phone</span>
<div>
<h4 className="font-title-md text-title-md font-semibold text-on-surface">Nhật ký liên lạc thời gian thực</h4>
<p className="font-body-md text-body-md text-on-surface-variant">Tích hợp tổng đài ảo VoIP, ghi nhận tự động file ghi âm và lịch hẹn.</p>
</div>
</div>
</div>
</div>
{/* CRM Mockup Kanban & Profile Card */}
<div className="lg:col-span-7">
<div className="bg-surface-container-lowest rounded-2xl shadow-xl p-space-lg">
{/* Kanban Header Bar */}
<div className="flex items-center justify-between pb-space-md mb-space-md bg-surface-container-low p-space-md rounded-xl">
<div className="flex items-center gap-space-md">
<span className="font-headline-sm text-headline-sm font-bold text-on-surface">Pipeline B2B Quý 4</span>
<span className="px-space-sm py-1 bg-surface-container-highest rounded text-on-surface font-caption text-caption">18 Cơ hội</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm">+ Thêm cơ hội</span>
</div>
</div>
{/* Kanban Columns Container */}
<div className="grid grid-cols-3 gap-space-md overflow-x-auto pb-space-sm">
{/* Col 1 */}
<div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm">
<div className="flex items-center justify-between font-label-md text-label-md text-on-surface font-semibold">
<span>Mới tiếp cận</span>
<span className="text-on-surface-variant font-normal">04</span>
</div>
{/* Card 1.1 */}
<div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm">
<span className="text-[10px] uppercase font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded">Lead Hotline</span>
<h5 className="font-title-md text-title-md font-semibold text-on-surface mt-space-xs">Tập đoàn Dược Nam Hà</h5>
<p className="font-label-md text-label-md text-on-surface-variant">HĐ Hệ thống ERP 5 Kho</p>
<div className="mt-space-sm flex items-center justify-between pt-space-xs">
<span className="font-title-md text-title-md font-bold text-primary">320.000.000 ₫</span>
<span className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center font-caption text-caption font-bold">NH</span>
</div>
</div>
</div>
{/* Col 2 */}
<div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm">
<div className="flex items-center justify-between font-label-md text-label-md text-on-surface font-semibold">
<span>Báo giá / Pitching</span>
<span className="text-on-surface-variant font-normal">03</span>
</div>
{/* Card 2.1 */}
<div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm">
<span className="text-[10px] uppercase font-bold text-tertiary bg-tertiary-fixed px-2 py-0.5 rounded">Đã gửi Demo</span>
<h5 className="font-title-md text-title-md font-semibold text-on-surface mt-space-xs">Công ty CP LogiTech Á Châu</h5>
<p className="font-label-md text-label-md text-on-surface-variant">Giải pháp WMS & Đơn hàng</p>
<div className="mt-space-sm flex items-center justify-between pt-space-xs">
<span className="font-title-md text-title-md font-bold text-primary">540.000.000 ₫</span>
<span className="w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center font-caption text-caption font-bold text-on-primary-fixed">LT</span>
</div>
</div>
</div>
{/* Col 3 */}
<div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm">
<div className="flex items-center justify-between font-label-md text-label-md text-on-surface font-semibold">
<span>Đàm phán & Chốt</span>
<span className="text-on-surface-variant font-normal">02</span>
</div>
{/* Card 3.1 */}
<div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm">
<span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Soạn hợp đồng</span>
<h5 className="font-title-md text-title-md font-semibold text-on-surface mt-space-xs">Chuỗi Siêu thị Việt Mart</h5>
<p className="font-label-md text-label-md text-on-surface-variant">Phần mềm POS & HRM 12 Điểm</p>
<div className="mt-space-sm flex items-center justify-between pt-space-xs">
<span className="font-title-md text-title-md font-bold text-primary">890.000.000 ₫</span>
<span className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center font-caption text-caption font-bold text-emerald-900">VM</span>
</div>
</div>
</div>
</div>
{/* Customer Profile 360 Bottom Strip */}
<div className="mt-space-md p-space-md rounded-xl bg-surface-container-high/40 flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">
                  VM
                </div>
<div>
<div className="font-body-md-medium text-body-md-medium text-on-surface">Việt Mart JSC • Khách hàng chiến lược Tier 1</div>
<div className="font-caption text-caption text-on-surface-variant">Phụ trách: Nguyễn Hoàng Nam (Sales Manager) • Chốt dự kiến: 28/11/2025</div>
</div>
</div>
<div className="flex items-center gap-space-xs">
<span className="px-space-md py-space-xs rounded bg-surface-container-lowest text-on-surface font-label-sm text-label-sm shadow-sm">Xem hồ sơ 360°</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 4: KHO HÀNG (INVENTORY) DEEP DIVE */}
<section className="py-24 bg-surface-container-low" id="kho-deep">
<div className="max-w-7xl mx-auto px-margin">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center mb-16">
{/* Stock Ledger Table Mockup */}
<div className="lg:col-span-8 order-2 lg:order-1">
<div className="bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden">
{/* Filter Action Header */}
<div className="p-space-lg bg-surface-container-lowest flex flex-wrap items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<span className="font-headline-sm text-headline-sm font-bold text-on-surface">Sổ kho thời gian thực</span>
<span className="px-space-sm py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption font-semibold">Tự động trừ tồn</span>
</div>
<div className="flex items-center gap-space-sm">
<div className="px-space-md py-space-xs bg-surface-container rounded-lg font-body-md text-body-md text-on-surface flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px]">location_on</span>
<span>Kho Tổng Hà Nội (Kho A)</span>
<span className="material-symbols-outlined text-[16px]">expand_more</span>
</div>
<button className="px-space-md py-space-xs bg-surface-container-lowest shadow-sm rounded-lg font-body-md-medium text-body-md-medium text-on-surface flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[16px]">file_download</span>
<span>Xuất Excel</span>
</button>
</div>
</div>
{/* Ledger Table */}
<div className="overflow-x-auto">
<table className="w-full text-left font-body-md text-body-md">
<thead className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase">
<tr>
<th className="py-space-md px-space-lg">Mã SKU</th>
<th className="py-space-md px-space-lg">Tên sản phẩm</th>
<th className="py-space-md px-space-lg text-right">Tồn thực tế</th>
<th className="py-space-md px-space-lg text-right">Đang giao</th>
<th className="py-space-md px-space-lg text-right">Dự trữ an toàn</th>
<th className="py-space-md px-space-lg text-center">Trạng thái</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-space-md px-space-lg font-mono text-primary font-semibold">SKU-8921-X</td>
<td className="py-space-md px-space-lg font-body-md-medium text-on-surface">Máy chủ Rack Server 2U Enterprise</td>
<td className="py-space-md px-space-lg text-right font-mono font-semibold">142 cái</td>
<td className="py-space-md px-space-lg text-right font-mono text-on-surface-variant">18 cái</td>
<td className="py-space-md px-space-lg text-right font-mono text-on-surface-variant">50 cái</td>
<td className="py-space-md px-space-lg text-center">
<span className="px-space-md py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-semibold">Còn hàng</span>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-space-md px-space-lg font-mono text-primary font-semibold">SKU-3104-M</td>
<td className="py-space-md px-space-lg font-body-md-medium text-on-surface">Switch Cisco Catalyst 48 Port PoE</td>
<td className="py-space-md px-space-lg text-right font-mono font-semibold text-error">12 cái</td>
<td className="py-space-md px-space-lg text-right font-mono text-on-surface-variant">35 cái</td>
<td className="py-space-md px-space-lg text-right font-mono text-on-surface-variant">30 cái</td>
<td className="py-space-md px-space-lg text-center">
<span className="px-space-md py-0.5 rounded-full bg-amber-100 text-amber-900 font-label-sm text-label-sm font-semibold">Sắp hết hàng</span>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-space-md px-space-lg font-mono text-primary font-semibold">SKU-7740-P</td>
<td className="py-space-md px-space-lg font-body-md-medium text-on-surface">Đầu đọc mã vạch không dây BizScan Pro</td>
<td className="py-space-md px-space-lg text-right font-mono font-semibold">580 cái</td>
<td className="py-space-md px-space-lg text-right font-mono text-on-surface-variant">120 cái</td>
<td className="py-space-md px-space-lg text-right font-mono text-on-surface-variant">100 cái</td>
<td className="py-space-md px-space-lg text-center">
<span className="px-space-md py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-semibold">Còn hàng</span>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-space-md px-space-lg font-mono text-primary font-semibold">SKU-1092-B</td>
<td className="py-space-md px-space-lg font-body-md-medium text-on-surface">Bộ lưu điện UPS Online 3kVA</td>
<td className="py-space-md px-space-lg text-right font-mono font-semibold text-error">02 cái</td>
<td className="py-space-md px-space-lg text-right font-mono text-on-surface-variant">08 cái</td>
<td className="py-space-md px-space-lg text-right font-mono text-on-surface-variant">15 cái</td>
<td className="py-space-md px-space-lg text-center">
<span className="px-space-md py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">Cảnh báo khẩn</span>
</td>
</tr>
</tbody>
</table>
</div>
{/* Warehouse Meta KPI strip */}
<div className="p-space-lg bg-surface-container flex flex-wrap items-center justify-between gap-space-md">
<div className="flex items-center gap-space-xl">
<div>
<div className="font-caption text-caption text-on-surface-variant">Tổng giá trị tồn kho</div>
<div className="font-headline-sm text-headline-sm font-bold text-on-surface">4.829.400.000 ₫</div>
</div>
<div>
<div className="font-caption text-caption text-on-surface-variant">Tỷ lệ sai lệch kiểm kê</div>
<div className="font-headline-sm text-headline-sm font-bold text-emerald-700">0.03%</div>
</div>
</div>
<span className="font-label-md text-label-md text-primary font-medium cursor-pointer hover:underline">Khởi tạo phiếu chuyển kho nội bộ →</span>
</div>
</div>
</div>
{/* Text Info */}
<div className="lg:col-span-4 order-1 lg:order-2">
<div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm mb-space-md">
            Hệ thống Quản lý Tồn kho & WMS
          </div>
<h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-space-md">
            Kiểm soát tồn kho chính xác và minh bạch
          </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant mb-space-lg">
            Xoá sổ hoàn toàn tình trạng lệch kho và sót hàng khi bán đa kênh. Đồng bộ tức thì giữa kho vật lý, đơn hàng online và cửa hàng đại lý.
          </p>
<div className="space-y-space-md">
<div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
<h4 className="font-title-md text-title-md font-semibold text-on-surface mb-1">Cảnh báo tồn ngưỡng an toàn</h4>
<p className="font-body-md text-body-md text-on-surface-variant">Tự động sinh đề xuất nhập hàng (PO) gửi bộ phận mua sắm khi SKU chạm mức cảnh báo.</p>
</div>
<div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
<h4 className="font-title-md text-title-md font-semibold text-on-surface mb-1">Kiểm kê mã vạch qua Mobile App</h4>
<p className="font-body-md text-body-md text-on-surface-variant">Nhân viên kho quét barcode/QR bằng smartphone, đối chiếu số liệu theo thời gian thực.</p>
</div>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 5: ĐƠN HÀNG (SALES ORDERS) DEEP DIVE */}
<section className="py-24 bg-surface" id="don-hang-deep">
<div className="max-w-7xl mx-auto px-margin">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center mb-16">
<div className="lg:col-span-5">
<div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm mb-space-md">
            Phân hệ Quản lý Đơn hàng (OMS)
          </div>
<h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-space-md">
            Tối ưu quy trình bán hàng từ đơn hàng đến hoàn tất
          </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant mb-space-lg">
            Liên kết trực tiếp với kiểm tra công nợ kế toán và tự động xuất lệnh cho kho hàng. Tăng tốc độ giao hàng gấp 3 lần và giảm 99% lỗi sai đơn.
          </p>
<div className="flex flex-col gap-space-md">
<div className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-low">
<span className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold">1</span>
<div>
<h4 className="font-title-md text-title-md font-semibold text-on-surface">Tạo đơn & Check hạn mức công nợ</h4>
<p className="font-body-md text-body-md text-on-surface-variant">Hệ thống chặn đơn tự động nếu khách hàng vượt hạn mức cho phép.</p>
</div>
</div>
<div className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-low">
<span className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold">2</span>
<div>
<h4 className="font-title-md text-title-md font-semibold text-on-surface">Phân bổ kho xuất & Đẩy vận chuyển</h4>
<p className="font-body-md text-body-md text-on-surface-variant">Tự động chọn kho gần nhất còn hàng và in bill vận chuyển Viettel Post / GHTK.</p>
</div>
</div>
</div>
</div>
{/* Sales Order Pipeline Mockup */}
<div className="lg:col-span-7">
<div className="bg-surface-container-lowest rounded-2xl shadow-xl p-space-lg">
<div className="flex items-center justify-between pb-space-md mb-space-md">
<div>
<h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Xử lý Đơn Bán hàng (Sales Orders)</h3>
<p className="font-caption text-caption text-on-surface-variant">Hôm nay: 48 đơn đã xác nhận • 12 đơn chờ duyệt công nợ</p>
</div>
<span className="px-space-md py-space-xs rounded-lg bg-surface-container font-label-sm text-label-sm text-on-surface">Bộ lọc nâng cao</span>
</div>
<div className="space-y-space-md">
{/* Order 1 */}
<div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div className="space-y-1">
<div className="flex items-center gap-space-sm">
<span className="font-mono font-bold text-primary">DH-2024-0891</span>
<span className="px-space-sm py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-medium">Đã thanh toán 100%</span>
</div>
<div className="font-body-md-medium text-body-md-medium text-on-surface">Công ty TNHH Kỹ thuật Cơ điện Thăng Long</div>
<div className="font-caption text-caption text-on-surface-variant">12 x Switch PoE + 02 x Tủ mạng Rack 42U</div>
</div>
<div className="text-right flex flex-col md:items-end justify-between gap-space-xs">
<div className="font-headline-sm text-headline-sm font-bold text-on-surface">184.500.000 ₫</div>
<div className="flex items-center gap-space-xs">
<button className="px-space-md py-space-xs rounded bg-primary-container text-on-primary font-label-sm text-label-sm hover:bg-primary transition-all">Duyệt & In phiếu kho</button>
</div>
</div>
</div>
{/* Order 2 */}
<div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div className="space-y-1">
<div className="flex items-center gap-space-sm">
<span className="font-mono font-bold text-primary">DH-2024-0892</span>
<span className="px-space-sm py-0.5 rounded-full bg-amber-100 text-amber-900 font-label-sm text-label-sm font-medium">Chờ duyệt công nợ</span>
</div>
<div className="font-body-md-medium text-body-md-medium text-on-surface">Tập đoàn Xây dựng & Thương mại An Phát</div>
<div className="font-caption text-caption text-on-surface-variant">Dự án Tòa nhà phức hợp - Giai đoạn 1</div>
</div>
<div className="text-right flex flex-col md:items-end justify-between gap-space-xs">
<div className="font-headline-sm text-headline-sm font-bold text-on-surface">420.000.000 ₫</div>
<div className="flex items-center gap-space-xs">
<button className="px-space-md py-space-xs rounded bg-surface-container-highest text-on-surface font-label-sm text-label-sm hover:bg-surface-variant transition-all">Xem bảo lãnh nợ</button>
<button className="px-space-md py-space-xs rounded bg-primary-container text-on-primary font-label-sm text-label-sm hover:bg-primary transition-all">Phê duyệt</button>
</div>
</div>
</div>
{/* Order 3 */}
<div className="p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div className="space-y-1">
<div className="flex items-center gap-space-sm">
<span className="font-mono font-bold text-primary">DH-2024-0893</span>
<span className="px-space-sm py-0.5 rounded-full bg-blue-100 text-blue-900 font-label-sm text-label-sm font-medium">Đang đóng gói kho</span>
</div>
<div className="font-body-md-medium text-body-md-medium text-on-surface">Bán lẻ Shopee Mall (Đơn vận hỏa tốc)</div>
<div className="font-caption text-caption text-on-surface-variant">Mã vận đơn GHTK: VN882941019</div>
</div>
<div className="text-right flex flex-col md:items-end justify-between gap-space-xs">
<div className="font-headline-sm text-headline-sm font-bold text-on-surface">12.600.000 ₫</div>
<div className="flex items-center gap-space-xs">
<button className="px-space-md py-space-xs rounded bg-surface-container-lowest shadow-sm text-on-surface font-label-sm text-label-sm hover:bg-surface-container transition-all">Tra cứu vị trí hàng</button>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 6: NHÂN SỰ HRM DEEP DIVE */}
<section className="py-24 bg-surface-container-low" id="hrm-deep">
<div className="max-w-7xl mx-auto px-margin">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center mb-16">
{/* HRM Interactive Mockup */}
<div className="lg:col-span-8 order-2 lg:order-1">
<div className="grid grid-cols-1 md:grid-cols-12 gap-space-md">
{/* Directory & Attendance Calendar Card */}
<div className="md:col-span-7 bg-surface-container-lowest rounded-2xl shadow-xl p-space-lg">
<div className="flex items-center justify-between mb-space-md">
<span className="font-headline-sm text-headline-sm font-bold text-on-surface">Bảng công & Nhân sự</span>
<span className="px-space-sm py-1 bg-emerald-100 text-emerald-800 rounded font-caption text-caption font-semibold">98.4% Đi làm hôm nay</span>
</div>
{/* Employee Mini List */}
<div className="space-y-space-sm mb-space-lg">
<div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs">TN</div>
<div>
<div className="font-body-md-medium text-body-md-medium text-on-surface">Trần Phương Nga</div>
<div className="font-caption text-caption text-on-surface-variant">Phòng Kinh doanh • Check-in 08:14 (GPS)</div>
</div>
</div>
<span className="font-label-sm text-label-sm text-emerald-700 font-semibold">Đúng giờ</span>
</div>
<div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center font-bold text-xs">LD</div>
<div>
<div className="font-body-md-medium text-body-md-medium text-on-surface">Lê Hoàng Dũng</div>
<div className="font-caption text-caption text-on-surface-variant">Kho Vận Hà Nội • Check-in 07:58 (Wifi Kho)</div>
</div>
</div>
<span className="font-label-sm text-label-sm text-emerald-700 font-semibold">Đúng giờ</span>
</div>
</div>
{/* Attendance Timesheet Grid */}
<div className="bg-surface-container-low p-space-md rounded-xl">
<div className="font-label-md text-label-md font-semibold text-on-surface mb-space-sm">Tuần làm việc hiện tại (Tuần 47)</div>
<div className="grid grid-cols-7 gap-1 text-center font-caption text-caption">
<div className="py-1 bg-surface-container-lowest rounded text-on-surface font-bold">T2 <span className="block text-emerald-600">8h</span></div>
<div className="py-1 bg-surface-container-lowest rounded text-on-surface font-bold">T3 <span className="block text-emerald-600">8h</span></div>
<div className="py-1 bg-surface-container-lowest rounded text-on-surface font-bold">T4 <span className="block text-emerald-600">8h</span></div>
<div className="py-1 bg-surface-container-lowest rounded text-on-surface font-bold">T5 <span className="block text-emerald-600">8h</span></div>
<div className="py-1 bg-surface-container-lowest rounded text-on-surface font-bold">T6 <span className="block text-emerald-600">8h</span></div>
<div className="py-1 bg-surface-container-high rounded text-on-surface-variant font-medium">T7 <span className="block text-on-surface-variant">Ca 4h</span></div>
<div className="py-1 bg-surface-container-high rounded text-on-surface-variant font-medium">CN <span className="block text-on-surface-variant">Nghỉ</span></div>
</div>
</div>
</div>
{/* Approval Widget & Department Distribution */}
<div className="md:col-span-5 flex flex-col gap-space-md">
{/* Quick Approval Widget */}
<div className="bg-surface-container-lowest rounded-2xl shadow-xl p-space-lg flex-1">
<h4 className="font-title-md text-title-md font-bold text-on-surface mb-space-sm">Duyệt nghỉ phép nhanh</h4>
<div className="p-space-sm rounded-lg bg-surface-container-low mb-space-md">
<div className="font-body-md-medium text-body-md-medium text-on-surface">Vũ Thuỳ Trang</div>
<p className="font-caption text-caption text-on-surface-variant">Xin nghỉ 1.5 ngày: Việc gia đình (28-29/11)</p>
<div className="flex items-center gap-space-xs mt-space-sm">
<button className="flex-1 py-1 bg-primary-container text-on-primary rounded font-caption text-caption font-semibold">Chấp thuận</button>
<button className="flex-1 py-1 bg-surface-container-highest text-on-surface rounded font-caption text-caption">Từ chối</button>
</div>
</div>
</div>
{/* Headcount Distribution Inline SVG Widget */}
<div className="bg-surface-container-lowest rounded-2xl shadow-xl p-space-lg">
<h4 className="font-title-md text-title-md font-bold text-on-surface mb-space-sm">Cơ cấu nhân sự (184 NV)</h4>
<div className="flex items-center justify-between">
{/* Simple Donut Chart SVG */}
<svg className="w-20 h-20 text-primary" viewBox="0 0 36 36">
<circle cx="18" cy="18" fill="none" r="15.915" stroke="#E2E8F0" strokeWidth="3"></circle>
<circle cx="18" cy="18" fill="none" r="15.915" stroke="currentColor" strokeDasharray="45 55" strokeDashoffset="25" strokeWidth="3"></circle>
<circle cx="18" cy="18" fill="none" r="15.915" stroke="#6a1edb" strokeDasharray="30 70" strokeDashoffset="80" strokeWidth="3"></circle>
</svg>
<div className="font-caption text-caption space-y-1">
<div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Kinh doanh (45%)</div>
<div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-tertiary"></span> Kho & Vận tải (30%)</div>
<div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-outline-variant"></span> Khối Backoffice (25%)</div>
</div>
</div>
</div>
</div>
</div>
</div>
{/* Info Column */}
<div className="lg:col-span-4 order-1 lg:order-2">
<div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-variant text-on-surface font-label-sm text-label-sm mb-space-md">
            Phân hệ HRM & Quản trị Nhân tài
          </div>
<h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-space-md">
            Quản lý nhân sự trên một hệ thống thống nhất
          </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant mb-space-lg">
            Giải phóng phòng nhân sự khỏi hàng chục bảng tính Excel phức tạp. Tự động tính lương dựa trên dữ liệu doanh số CRM và ca kíp thực tế tại kho.
          </p>
<div className="space-y-space-md">
<div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
<h4 className="font-title-md text-title-md font-semibold text-on-surface mb-1">Chấm công GPS chống gian lận</h4>
<p className="font-body-md text-body-md text-on-surface-variant">Giới hạn vị trí định vị theo bán kính chi nhánh và nhận diện khuôn mặt AI.</p>
</div>
<div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
<h4 className="font-title-md text-title-md font-semibold text-on-surface mb-1">Tự động chốt bảng lương 1-Click</h4>
<p className="font-body-md text-body-md text-on-surface-variant">Tổng hợp lương cơ bản, KPI, hoa hồng đơn hàng và trừ BHXH chính xác tuyệt đối.</p>
</div>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 7: UNIFIED DATA ARCHITECTURE */}
<section className="py-24 bg-surface">
<div className="max-w-7xl mx-auto px-margin">
<div className="text-center max-w-3xl mx-auto mb-20">
<span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">Kiến trúc dữ liệu liền mạch</span>
<h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-space-xs mb-space-md">
          Dữ liệu được kết nối xuyên suốt các bộ phận
        </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">
          Theo dõi hành trình của một giao dịch đơn lẻ di chuyển tự động qua toàn bộ tổ chức mà không cần nhập liệu thủ công lại một lần nào.
        </p>
</div>
{/* Flow Horizontal Stepper */}
<div className="grid grid-cols-1 md:grid-cols-5 gap-space-md relative">
{/* Step 1 */}
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative group hover:shadow-md transition-all">
<div>
<div className="flex items-center justify-between mb-space-md">
<span className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed font-bold flex items-center justify-center font-caption text-caption">01</span>
<span className="material-symbols-outlined text-primary">contacts</span>
</div>
<h4 className="font-title-md text-title-md font-bold text-on-surface mb-space-xs">CRM tiếp nhận</h4>
<p className="font-body-md text-body-md text-on-surface-variant">Khách hàng chốt hợp đồng. Hệ thống thu thập thông tin mã thuế và địa chỉ nhận hàng.</p>
</div>
<div className="mt-space-md font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
<span>Tự sinh Đơn hàng</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</div>
</div>
{/* Step 2 */}
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative group hover:shadow-md transition-all">
<div>
<div className="flex items-center justify-between mb-space-md">
<span className="w-8 h-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold flex items-center justify-center font-caption text-caption">02</span>
<span className="material-symbols-outlined text-tertiary">receipt_long</span>
</div>
<h4 className="font-title-md text-title-md font-bold text-on-surface mb-space-xs">Đơn hàng (Sales Order)</h4>
<p className="font-body-md text-body-md text-on-surface-variant">Kế toán xác thực thanh toán hoặc duyệt công nợ. Lập tức sinh yêu cầu giữ hàng.</p>
</div>
<div className="mt-space-md font-label-sm text-label-sm text-tertiary font-semibold flex items-center gap-1">
<span>Khóa tồn kho</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</div>
</div>
{/* Step 3 */}
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative group hover:shadow-md transition-all">
<div>
<div className="flex items-center justify-between mb-space-md">
<span className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold flex items-center justify-center font-caption text-caption">03</span>
<span className="material-symbols-outlined text-secondary">warehouse</span>
</div>
<h4 className="font-title-md text-title-md font-bold text-on-surface mb-space-xs">Kho hàng giữ chỗ</h4>
<p className="font-body-md text-body-md text-on-surface-variant">Lệnh nhặt hàng (Pick list) được in ra app của thủ kho. Trừ tồn khả dụng ngay lập tức.</p>
</div>
<div className="mt-space-md font-label-sm text-label-sm text-secondary font-semibold flex items-center gap-1">
<span>Hoàn tất xuất hàng</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</div>
</div>
{/* Step 4 */}
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between relative group hover:shadow-md transition-all">
<div>
<div className="flex items-center justify-between mb-space-md">
<span className="w-8 h-8 rounded-full bg-surface-variant text-on-surface font-bold flex items-center justify-center font-caption text-caption">04</span>
<span className="material-symbols-outlined text-on-surface">badge</span>
</div>
<h4 className="font-title-md text-title-md font-bold text-on-surface mb-space-xs">HRM tính thưởng KPI</h4>
<p className="font-body-md text-body-md text-on-surface-variant">Doanh số đơn hàng tự động tính tỷ lệ hoa hồng ghi nhận vào bảng lương Sales rep.</p>
</div>
<div className="mt-space-md font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1">
<span>Cập nhật P&L</span>
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</div>
</div>
{/* Step 5 */}
<div className="bg-inverse-surface text-inverse-on-surface rounded-xl p-space-lg shadow-md flex flex-col justify-between relative group">
<div>
<div className="flex items-center justify-between mb-space-md">
<span className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center font-caption text-caption">05</span>
<span className="material-symbols-outlined text-primary-fixed">analytics</span>
</div>
<h4 className="font-title-md text-title-md font-bold text-surface-container-lowest mb-space-xs">BI Dashboard CEO</h4>
<p className="font-body-md text-body-md text-outline-variant">Giám đốc điều hành theo dõi tỷ suất lợi nhuận ròng, dòng tiền và chi phí tổng thể.</p>
</div>
<div className="mt-space-md font-label-sm text-label-sm text-primary-fixed font-semibold">
            Báo cáo thời gian thực
          </div>
</div>
</div>
</div>
</section>
{/* SECTION 8: ANALYTICS AND REPORTING */}
<section className="py-24 bg-surface-container-low">
<div className="max-w-7xl mx-auto px-margin">
<div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-space-lg">
<div>
<span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">Phân tích kinh doanh đa chiều</span>
<h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-space-xs mb-space-xs">
            Báo cáo phân tích chuyên sâu (BI Intelligence)
          </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
            Thay vì chờ kế toán lập báo cáo cuối tháng, ban lãnh đạo xem dữ liệu kinh doanh cập nhật từng phút.
          </p>
</div>
<div className="flex items-center gap-space-sm">
<span className="px-space-md py-space-xs rounded-lg bg-surface-container-lowest shadow-sm font-label-md text-label-md text-on-surface">30 ngày qua</span>
<span className="px-space-md py-space-xs rounded-lg bg-surface-container font-label-md text-label-md text-on-surface-variant">Xuất PDF / CSV</span>
</div>
</div>
{/* KPI Bento Board */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-gutter">
<div className="bg-surface-container-lowest p-space-xl rounded-2xl shadow-sm">
<div className="font-label-md text-label-md text-on-surface-variant mb-space-xs">Tổng doanh thu thực nhận</div>
<div className="font-headline-md text-headline-md font-bold text-on-surface mb-space-xs">28.450.000.000 ₫</div>
<div className="inline-flex items-center gap-1 font-caption text-caption text-emerald-700 bg-emerald-100 px-space-sm py-0.5 rounded">
<span className="material-symbols-outlined text-[14px]">trending_up</span>
<span>+18.4% vs tháng trước</span>
</div>
</div>
<div className="bg-surface-container-lowest p-space-xl rounded-2xl shadow-sm">
<div className="font-label-md text-label-md text-on-surface-variant mb-space-xs">Tỷ lệ chuyển đổi Lead-to-Deal</div>
<div className="font-headline-md text-headline-md font-bold text-on-surface mb-space-xs">24.8%</div>
<div className="inline-flex items-center gap-1 font-caption text-caption text-emerald-700 bg-emerald-100 px-space-sm py-0.5 rounded">
<span className="material-symbols-outlined text-[14px]">trending_up</span>
<span>+3.2% tối ưu phễu</span>
</div>
</div>
<div className="bg-surface-container-lowest p-space-xl rounded-2xl shadow-sm">
<div className="font-label-md text-label-md text-on-surface-variant mb-space-xs">Vòng quay hàng tồn kho (ITR)</div>
<div className="font-headline-md text-headline-md font-bold text-on-surface mb-space-xs">5.6 Lần / năm</div>
<div className="inline-flex items-center gap-1 font-caption text-caption text-primary bg-primary-fixed px-space-sm py-0.5 rounded">
<span>Chu kỳ 65 ngày xuất nhập</span>
</div>
</div>
<div className="bg-surface-container-lowest p-space-xl rounded-2xl shadow-sm">
<div className="font-label-md text-label-md text-on-surface-variant mb-space-xs">Tỷ trọng chi phí nhân sự / DT</div>
<div className="font-headline-md text-headline-md font-bold text-on-surface mb-space-xs">14.2%</div>
<div className="inline-flex items-center gap-1 font-caption text-caption text-emerald-700 bg-emerald-100 px-space-sm py-0.5 rounded">
<span>Tối ưu trong biên an toàn (&lt;16%)</span>
</div>
</div>
</div>
{/* Complex Visual Charts Block */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
{/* Revenue Line/Bar Chart */}
<div className="lg:col-span-8 bg-surface-container-lowest p-space-xl rounded-2xl shadow-sm">
<div className="flex items-center justify-between mb-space-lg">
<div>
<h4 className="font-title-md text-title-md font-bold text-on-surface">Xu hướng Doanh thu & Dòng tiền 2025</h4>
<p className="font-caption text-caption text-on-surface-variant">Phân rã theo Kênh Bán buôn (B2B) và Kênh TMĐT Bán lẻ</p>
</div>
<div className="flex items-center gap-space-md font-caption text-caption">
<span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary"></span> Doanh thu B2B</span>
<span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-tertiary"></span> Bán lẻ Online</span>
</div>
</div>
{/* Inline Bar Visualization (Vector SVG) */}
<div className="w-full h-64 flex items-end justify-between gap-space-sm pt-8">
<div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
<div className="w-full bg-primary rounded-t" style={{"height":"45%"}}></div>
<div className="w-full bg-tertiary rounded-t -mt-1" style={{"height":"25%"}}></div>
<span className="font-caption text-caption text-on-surface-variant mt-2">Th1</span>
</div>
<div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
<div className="w-full bg-primary rounded-t" style={{"height":"52%"}}></div>
<div className="w-full bg-tertiary rounded-t -mt-1" style={{"height":"30%"}}></div>
<span className="font-caption text-caption text-on-surface-variant mt-2">Th2</span>
</div>
<div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
<div className="w-full bg-primary rounded-t" style={{"height":"60%"}}></div>
<div className="w-full bg-tertiary rounded-t -mt-1" style={{"height":"35%"}}></div>
<span className="font-caption text-caption text-on-surface-variant mt-2">Th3</span>
</div>
<div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
<div className="w-full bg-primary rounded-t" style={{"height":"58%"}}></div>
<div className="w-full bg-tertiary rounded-t -mt-1" style={{"height":"28%"}}></div>
<span className="font-caption text-caption text-on-surface-variant mt-2">Th4</span>
</div>
<div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
<div className="w-full bg-primary rounded-t" style={{"height":"75%"}}></div>
<div className="w-full bg-tertiary rounded-t -mt-1" style={{"height":"42%"}}></div>
<span className="font-caption text-caption text-on-surface-variant mt-2">Th5</span>
</div>
<div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
<div className="w-full bg-primary rounded-t" style={{"height":"88%"}}></div>
<div className="w-full bg-tertiary rounded-t -mt-1" style={{"height":"50%"}}></div>
<span className="font-caption text-caption text-on-surface-variant mt-2">Th6</span>
</div>
</div>
</div>
{/* Profit Margins and Cost Split */}
<div className="lg:col-span-4 bg-surface-container-lowest p-space-xl rounded-2xl shadow-sm flex flex-col justify-between">
<div>
<h4 className="font-title-md text-title-md font-bold text-on-surface mb-space-xs">Tỷ suất lãi gộp theo ngành hàng</h4>
<p className="font-caption text-caption text-on-surface-variant mb-space-lg">Đo lường biên lợi nhuận gộp danh mục SKU</p>
<div className="space-y-space-md">
<div>
<div className="flex justify-between font-label-md text-label-md mb-1">
<span className="text-on-surface">Thiết bị mạng & Server</span>
<span className="font-bold text-on-surface">32.4%</span>
</div>
<div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
<div className="bg-primary h-full rounded-full" style={{"width":"32.4%"}}></div>
</div>
</div>
<div>
<div className="flex justify-between font-label-md text-label-md mb-1">
<span className="text-on-surface">Phụ kiện & Linh kiện</span>
<span className="font-bold text-on-surface">48.2%</span>
</div>
<div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
<div className="bg-tertiary h-full rounded-full" style={{"width":"48.2%"}}></div>
</div>
</div>
<div>
<div className="flex justify-between font-label-md text-label-md mb-1">
<span className="text-on-surface">Dịch vụ bảo trì hàng năm</span>
<span className="font-bold text-on-surface">71.0%</span>
</div>
<div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
<div className="bg-emerald-600 h-full rounded-full" style={{"width":"71%"}}></div>
</div>
</div>
</div>
</div>
<div className="p-space-md rounded-xl bg-surface-container-low mt-space-lg">
<span className="font-caption text-caption text-on-surface-variant block mb-1">Đánh giá hệ thống tự động:</span>
<p className="font-body-md-medium text-body-md-medium text-on-surface">Cơ cấu doanh thu đang dịch chuyển tốt sang nhóm dịch vụ có tỷ suất lãi gộp cao.</p>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 9: SECURITY AND ADMINISTRATION */}
<section className="py-24 bg-surface">
<div className="max-w-7xl mx-auto px-margin">
<div className="text-center max-w-3xl mx-auto mb-16">
<span className="font-label-md text-label-md uppercase tracking-wider text-primary font-bold">Bảo mật cấp định chế tài chính</span>
<h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mt-space-xs mb-space-md">
          Bảo mật và Quản trị hệ thống doanh nghiệp lớn
        </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">
          Kiểm soát quyền truy cập chi tiết tới từng nút bấm và từng trường dữ liệu nhạy cảm. Lưu trữ đầy đủ vết can thiệp của người dùng.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
{/* Sec 1 */}
<div className="bg-surface-container-lowest p-space-xl rounded-2xl shadow-sm hover:shadow-md transition-shadow">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-space-lg">
<span className="material-symbols-outlined text-[24px]">shield_person</span>
</div>
<h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">Phân quyền RBAC</h4>
<p className="font-body-md text-body-md text-on-surface-variant">
            Quy định quyền xem, sửa, xoá theo vai trò: Giám đốc, Kế toán trưởng, Quản lý kho, Nhân viên kinh doanh.
          </p>
<div className="mt-space-md font-caption text-caption text-outline">Quyền hạn tới từng cột dữ liệu</div>
</div>
{/* Sec 2 */}
<div className="bg-surface-container-lowest p-space-xl rounded-2xl shadow-sm hover:shadow-md transition-shadow">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-space-lg">
<span className="material-symbols-outlined text-[24px]">history</span>
</div>
<h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">Audit Logs Bất biến</h4>
<p className="font-body-md text-body-md text-on-surface-variant">
            Ghi nhật ký kiểm toán hệ thống không thể sửa đổi: Ai đã đổi giá trị đơn hàng, xuất kho lúc nào, từ IP nào.
          </p>
<div className="mt-space-md font-caption text-caption text-outline">Lưu vết thời gian thực 365 ngày</div>
</div>
{/* Sec 3 */}
<div className="bg-surface-container-lowest p-space-xl rounded-2xl shadow-sm hover:shadow-md transition-shadow">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-space-lg">
<span className="material-symbols-outlined text-[24px]">apartment</span>
</div>
<h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">Quản lý Đa chi nhánh</h4>
<p className="font-body-md text-body-md text-on-surface-variant">
            Thiết lập mô hình Công ty mẹ - Chi nhánh - Kho vệ tinh. Xem báo cáo tổng hợp hoặc lọc riêng từng pháp nhân.
          </p>
<div className="mt-space-md font-caption text-caption text-outline">Độc lập dòng tiền & chứng từ</div>
</div>
{/* Sec 4 */}
<div className="bg-surface-container-lowest p-space-xl rounded-2xl shadow-sm hover:shadow-md transition-shadow">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-space-lg">
<span className="material-symbols-outlined text-[24px]">lock</span>
</div>
<h4 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-space-xs">Kiến trúc Multi-tenant</h4>
<p className="font-body-md text-body-md text-on-surface-variant">
            Cơ chế cô lập cơ sở dữ liệu riêng biệt. Mã hóa TLS 1.3 và AES-256 cho dữ liệu tĩnh và dữ liệu truyền tải.
          </p>
<div className="mt-space-md font-caption text-caption text-outline">Chứng chỉ ISO 27001 & SOC 2 Type II</div>
</div>
</div>
</div>
</section>
{/* SECTION 10: FINAL CTA */}
<section className="py-24 bg-surface-container-lowest relative overflow-hidden">
<div className="max-w-7xl mx-auto px-margin">
<div className="bg-inverse-surface rounded-3xl p-space-xl lg:p-20 text-inverse-on-surface text-center relative overflow-hidden shadow-2xl">
<div className="absolute -right-32 -bottom-32 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none"></div>
<div className="absolute -left-32 -top-32 w-80 h-80 rounded-full bg-tertiary/20 blur-3xl pointer-events-none"></div>
<div className="relative z-10 max-w-3xl mx-auto">
<span className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-primary-container/20 text-inverse-primary font-label-sm text-label-sm mb-space-lg">
            Sẵn sàng chuẩn hóa vận hành doanh nghiệp của bạn
          </span>
<h2 className="font-display text-display font-bold text-surface-container-lowest tracking-tight mb-space-md">
            Một nền tảng quản trị. Nhiều khả năng phát triển.
          </h2>
<p className="font-body-lg text-body-lg text-outline-variant mb-space-xl max-w-2xl mx-auto">
            Gia nhập hơn 1.200 doanh nghiệp Việt Nam đã tối ưu hóa chi phí và tăng tốc hiệu suất cùng BizPro+. Bắt đầu dùng thử miễn phí trong 14 ngày.
          </p>
<div className="flex flex-wrap items-center justify-center gap-space-md">
<a className="px-space-xl py-space-md rounded-lg bg-primary-container text-on-primary font-body-lg-medium text-body-lg-medium shadow-lg hover:bg-primary transition-all flex items-center gap-space-xs" href="/signup">
<span>Dùng thử miễn phí 14 ngày</span>
<span className="material-symbols-outlined text-[18px]">rocket_launch</span>
</a>
<a className="px-space-xl py-space-md rounded-lg bg-surface-container-highest/20 text-surface-container-lowest font-body-lg-medium text-body-lg-medium hover:bg-surface-container-highest/30 transition-all flex items-center gap-space-xs" href="/signup">
<span>Xem bảng giá chi tiết</span>
<span className="material-symbols-outlined text-[18px]">payments</span>
</a>
</div>
<div className="mt-space-xl flex flex-wrap items-center justify-center gap-space-lg text-outline-variant font-caption text-caption">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-emerald-400">check</span> Không yêu cầu thẻ tín dụng</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-emerald-400">check</span> Đội ngũ chuyên gia setup 1-1</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-emerald-400">check</span> Hỗ trợ chuyển đổi dữ liệu từ hệ thống cũ</span>
</div>
</div>
</div>
</div>
</section>
</div>
      </main>
      <MarketingFooter />
    </div>
  );
}
