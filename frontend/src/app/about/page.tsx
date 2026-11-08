"use client";

import React from "react";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface antialiased">
      <MarketingHeader />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
{/* SECTION 1: HERO */}
<section className="relative overflow-hidden bg-surface py-20 lg:py-28">
<div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[920px] h-[380px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
<div className="max-w-7xl mx-auto px-margin">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
{/* Text Column */}
<div className="lg:col-span-7 flex flex-col gap-space-lg">
<div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container text-primary w-fit shadow-sm">
<span className="material-symbols-outlined text-[16px]">verified</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider">VỀ CHÚNG TÔI • SỨ MỆNH &amp; TẦM NHÌN BIZPRO+</span>
</div>
<h1 className="font-display text-headline-lg lg:text-display text-on-surface tracking-tight leading-tight">
            Đơn giản hóa quản trị.<br/>
<span className="text-primary">Nâng tầm năng lực</span> doanh nghiệp.
          </h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
            BizPro+ hướng đến việc giúp doanh nghiệp Việt Nam quản lý hoạt động kinh doanh tập trung, minh bạch và hiệu quả hơn thông qua công nghệ kết nối dữ liệu vận hành thời gian thực.
          </p>
<div className="flex flex-wrap items-center gap-space-md pt-space-sm">
<a className="inline-flex items-center justify-center gap-space-xs px-6 py-3 rounded-lg bg-primary-container text-on-primary font-body-md-medium text-body-md-medium hover:bg-primary transition-all shadow-md" href="#cau-chuyen">
<span>Khám phá câu chuyện</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
<a className="inline-flex items-center justify-center gap-space-xs px-6 py-3 rounded-lg bg-surface-container-lowest text-on-surface font-body-md-medium text-body-md-medium hover:bg-surface-container transition-all shadow-sm" href="#doi-ngu">
<span>Tìm hiểu văn hóa &amp; Cơ hội</span>
<span className="material-symbols-outlined text-[18px]">group</span>
</a>
</div>
{/* Micro Metas */}
<div className="pt-space-md flex flex-wrap items-center gap-y-2 gap-x-6 text-on-surface-variant font-caption text-caption">
<div className="flex items-center gap-1.5">
<span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
<span>Enterprise SLA 99.95%</span>
</div>
<div className="flex items-center gap-1.5">
<span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
<span>Kiến trúc Multi-tenant Cloud</span>
</div>
<div className="flex items-center gap-1.5">
<span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
<span>Chuẩn an toàn ISO 27001:2022</span>
</div>
</div>
</div>
{/* Visual Hero Composition */}
<div className="lg:col-span-5 relative">
<div className="relative bg-surface-container-lowest rounded-xl p-space-lg shadow-xl space-y-space-md">
{/* Header bar of interface */}
<div className="flex items-center justify-between pb-space-sm">
<div className="flex items-center gap-space-xs">
<span className="w-3 h-3 rounded-full bg-error/70"></span>
<span className="w-3 h-3 rounded-full bg-secondary/30"></span>
<span className="w-3 h-3 rounded-full bg-primary/40"></span>
<span className="font-caption text-caption text-on-surface-variant font-semibold ml-space-xs">BIZPRO+ CORE CLOUD ENGINE</span>
</div>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-primary font-caption text-caption">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Live Sync
              </span>
</div>
{/* Visual Graphic Placeholder */}
<div className="relative h-56 rounded-lg overflow-hidden bg-surface-container">
<img className="w-full h-full object-cover" data-alt="Abstract server architecture visual representing reliable distributed cloud database, showing enterprise data packets streaming through glowing blue and slate lines, high resolution tech visual with clean geometric nodes in modern light studio aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHXRq_6T_8KmsC_2crFYFD1IK8HpiopWI_EAwyXANfa1wEuGecIFOm4UbO_QiA_Kp1Maf7ego2hQyQKciN_suopvATWlub5xKhQ2jifVqosTPJp4_dz9IzhYNXpiGlFAT5sl1871agY23vR69j6vQbg9-AqFtblN64peQjtNWQfhYjEDN_17XZdIEE97PkWmvoC-S1wMtVRwfQjmFWztCmBBEZik4MV8ErsAe_q98"/>
<div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex items-end p-space-md">
<div className="text-inverse-on-surface font-caption text-caption space-y-0.5">
<div className="font-body-md-medium text-body-md-medium">4 Core Pillars Unified</div>
<div className="opacity-80">Kho hàng • Đơn hàng • CRM • Nhân sự &amp; Tiền lương</div>
</div>
</div>
</div>
{/* Stat Counters */}
<div className="grid grid-cols-3 gap-space-sm pt-space-xs">
<div className="p-space-sm rounded-lg bg-surface-container-low">
<div className="font-caption text-caption text-on-surface-variant">Throughput</div>
<div className="font-title-md text-title-md font-bold text-on-surface">2.4M+</div>
<div className="font-caption text-caption text-primary">Giao dịch / ngày</div>
</div>
<div className="p-space-sm rounded-lg bg-surface-container-low">
<div className="font-caption text-caption text-on-surface-variant">Độ trễ API</div>
<div className="font-title-md text-title-md font-bold text-on-surface">&lt;45ms</div>
<div className="font-caption text-caption text-primary">Thời gian thực</div>
</div>
<div className="p-space-sm rounded-lg bg-surface-container-low">
<div className="font-caption text-caption text-on-surface-variant">Uptime SLA</div>
<div className="font-title-md text-title-md font-bold text-on-surface">99.98%</div>
<div className="font-caption text-caption text-primary">Cam kết vận hành</div>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 2: BIZPRO+ LÀ GÌ? (Brand Introduction) */}
<section className="py-20 lg:py-24 bg-surface-container-low" id="cau-chuyen">
<div className="max-w-7xl mx-auto px-margin">
<div className="max-w-3xl mb-16">
<span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-semibold">TỔNG QUAN NỀN TẢNG</span>
<h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight mt-2 mb-4">
          BizPro+ là gì?
        </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
          Giải pháp cho bài toán vận hành phân mảnh của doanh nghiệp Việt — biến các dòng dữ liệu cô lập thành sức mạnh điều hành thống nhất.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{/* Pillar 1 */}
<div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-200/90 flex flex-col justify-between group">
<div>
<div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[28px]">hub</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-3">Hợp nhất thay vì rời rạc</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
              Loại bỏ hoàn toàn tình trạng sử dụng 4-5 phần mềm riêng lẻ không đồng bộ: bộ phận kinh doanh dùng CRM ngoài, quản lý kho ghi chép file Excel, trong khi nhân sự bấm vân tay độc lập. Mọi phòng ban giao tiếp chung trên một ngữ cảnh dữ liệu.
            </p>
</div>
<div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
<span className="font-caption text-caption font-bold uppercase tracking-wider text-slate-500">Kết quả đo lường:</span>
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
<span className="material-symbols-outlined text-[14px]">trending_down</span> Giảm 70% đối soát
</span>
</div>
</div>
{/* Pillar 2 */}
<div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-200/90 flex flex-col justify-between group">
<div>
<div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[28px]">tune</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-3">Chuẩn hóa quy trình nội địa</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
              Được thiết kế chuyên biệt cho phương thức kinh doanh, văn hóa quản lý và biểu mẫu chứng từ kho bãi, bán lẻ đa kênh tại Việt Nam. Không mất hàng tháng tùy biến các khung phần mềm nước ngoài cồng kềnh và đắt đỏ.
            </p>
</div>
<div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
<span className="font-caption text-caption font-bold uppercase tracking-wider text-slate-500">Kết quả đo lường:</span>
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60">
<span className="material-symbols-outlined text-[14px]">bolt</span> Go-live 1-3 ngày
</span>
</div>
</div>
{/* Pillar 3 */}
<div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-200/90 flex flex-col justify-between group">
<div>
<div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-[28px]">monitoring</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-3">Thời gian thực &amp; Minh bạch</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">
              Giúp ban lãnh đạo và các trưởng phòng có được bức tranh dòng tiền, tồn kho, doanh số và hiệu suất nhân sự tức thời. Ra quyết định kinh doanh dựa trên dữ liệu chuẩn xác từng giây thay vì chờ báo cáo tổng hợp cuối tháng.
            </p>
</div>
<div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
<span className="font-caption text-caption font-bold uppercase tracking-wider text-slate-500">Kết quả đo lường:</span>
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
<span className="material-symbols-outlined text-[14px]">verified</span> 99.8% Chuẩn xác
</span>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 3: SỨ MỆNH VÀ TẦM NHÌN (Mission & Vision) */}
<section className="py-20 lg:py-28 bg-surface">
<div className="max-w-7xl mx-auto px-margin">
<div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-stretch">
{/* Mission Editorial Block */}
<div className="bg-white p-space-xl lg:p-12 rounded-3xl shadow-xl border border-slate-200/80 flex flex-col justify-between">
<div className="space-y-space-md">
<div className="inline-flex items-center gap-space-xs px-3.5 py-1 rounded-full bg-primary-fixed text-primary w-fit font-label-sm text-label-sm font-bold">
<span className="material-symbols-outlined text-[16px]">flag</span>
<span>SỨ MỆNH DOANH NGHIỆP</span>
</div>
<h3 className="font-headline-lg text-headline-lg-mobile lg:text-headline-md font-bold text-on-surface leading-tight">
              Giúp doanh nghiệp quản trị hoạt động kinh doanh đơn giản, minh bạch và có hệ thống.
            </h3>
<p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              BizPro+ tập trung giải phóng sức lao động thủ công của đội ngũ vận hành, giảm thiểu rủi ro thất thoát hàng hoá và tài chính, để người sáng lập và các cấp quản lý có thể toàn tâm tập trung vào sáng tạo giá trị và mở rộng quy mô.
            </p>
</div>
<div className="pt-space-xl">
<div className="grid grid-cols-2 gap-space-md">
<div className="p-space-md bg-blue-50/60 border border-blue-100 rounded-2xl">
<div className="font-headline-sm text-headline-sm font-bold text-primary">0</div>
<div className="font-body-md text-body-md text-on-surface-variant">Lỗi sai lệch số liệu tồn kho thủ công</div>
</div>
<div className="p-space-md bg-emerald-50/60 border border-emerald-100 rounded-2xl">
<div className="font-headline-sm text-headline-sm font-bold text-emerald-600">100%</div>
<div className="font-body-md text-body-md text-on-surface-variant">Quy trình tác nghiệp được số hóa minh bạch</div>
</div>
</div>
</div>
</div>
{/* Vision Editorial Block (Dark Contrast Anchor) */}
<div className="bg-[#0B1220] text-white p-space-xl lg:p-12 rounded-3xl shadow-2xl border border-slate-700/80 flex flex-col justify-between relative overflow-hidden">
<div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
<div className="space-y-space-md relative z-10">
<div className="inline-flex items-center gap-space-xs px-3.5 py-1 rounded-full bg-white/10 text-sky-300 w-fit font-label-sm text-label-sm font-bold border border-white/10">
<span className="material-symbols-outlined text-[16px]">visibility</span>
<span>TẦM NHÌN CHIẾN LƯỢC</span>
</div>
<h3 className="font-headline-lg text-headline-lg-mobile lg:text-headline-md font-bold text-white leading-tight">
              Trở thành nền tảng quản trị doanh nghiệp đáng tin cậy hàng đầu cho các doanh nghiệp đang tăng trưởng tại Việt Nam.
            </h3>
<p className="font-body-lg text-body-lg text-slate-300 leading-relaxed">
              Chúng tôi định hình chuẩn mực vận hành số chuẩn Enterprise với chi phí tối ưu nhất: nơi mọi doanh nghiệp SME đều có thể tiếp cận hạ tầng công nghệ mạnh mẽ ngang tầm các tập đoàn đa quốc gia.
            </p>
</div>
<div className="pt-space-xl relative z-10">
<div className="grid grid-cols-2 gap-space-md">
<div className="p-space-md bg-white/[0.06] border border-white/10 rounded-2xl">
<div className="font-headline-sm text-headline-sm font-bold text-sky-400">10.000+</div>
<div className="font-body-md text-body-md text-slate-300">Doanh nghiệp mục tiêu chuyển đổi 2026</div>
</div>
<div className="p-space-md bg-white/[0.06] border border-white/10 rounded-2xl">
<div className="font-headline-sm text-headline-sm font-bold text-emerald-400">Top 1</div>
<div className="font-body-md text-body-md text-slate-300">Mức độ hài lòng trải nghiệm người dùng</div>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 4: GIÁ TRỊ CỐT LÕI (Core Values) */}
<section className="py-20 lg:py-24 bg-surface-container-low/80">
<div className="max-w-7xl mx-auto px-margin">
<div className="text-center max-w-3xl mx-auto mb-16 space-y-space-xs">
<span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-semibold">NGUYÊN LÝ THIẾT KẾ &amp; HÀNH ĐỘNG</span>
<h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight font-bold">
          4 Giá trị dẫn lối mọi quyết định sản phẩm
        </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">
          Không xây dựng tính năng dư thừa. Mọi dòng mã tại BizPro+ đều nhằm giải quyết triệt để nỗi đau vận hành thực tế.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
{/* Value 01 */}
<div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/80 flex flex-col justify-between">
<div className="space-y-space-md">
<div className="flex items-center justify-between">
<span className="font-display text-headline-lg text-primary/40 font-black">01</span>
<span className="material-symbols-outlined text-[26px] text-primary">architecture</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold">Đơn giản và Thực tiễn</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Phần mềm phải phục vụ người dùng thực tế tại hiện trường. Từ nhân viên kho quét mã vạch đến kế toán đối soát và CEO xem báo cáo, giảm bớt tối đa các bước thao tác rườm rà.
            </p>
</div>
<div className="pt-4 border-t border-slate-100 text-primary font-caption text-caption font-bold uppercase tracking-wider">
            Simplicity &amp; Pragmatism
          </div>
</div>
{/* Value 02 */}
<div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/80 flex flex-col justify-between">
<div className="space-y-space-md">
<div className="flex items-center justify-between">
<span className="font-display text-headline-lg text-primary/40 font-black">02</span>
<span className="material-symbols-outlined text-[26px] text-primary">lock_clock</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold">Tin cậy và Minh bạch</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Số liệu là trung thực tuyệt đối. Dữ liệu kinh doanh, dòng tiền và lịch sử thao tác được lưu trữ kiểm toán bất biến (Audit Trail), tạo dựng niềm tin tuyệt đối giữa các bộ phận.
            </p>
</div>
<div className="pt-4 border-t border-slate-100 text-primary font-caption text-caption font-bold uppercase tracking-wider">
            Trust &amp; Transparency
          </div>
</div>
{/* Value 03 */}
<div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/80 flex flex-col justify-between">
<div className="space-y-space-md">
<div className="flex items-center justify-between">
<span className="font-display text-headline-lg text-primary/40 font-black">03</span>
<span className="material-symbols-outlined text-[26px] text-primary">diversity_1</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold">Khách hàng là trung tâm</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Lắng nghe từng phản hồi trực tiếp từ hiện trường vận hành. Đội ngũ sản phẩm liên tục đi thị sát, ghi nhận thực tế để tối ưu giao diện và nghiệp vụ đáp ứng linh hoạt.
            </p>
</div>
<div className="pt-4 border-t border-slate-100 text-primary font-caption text-caption font-bold uppercase tracking-wider">
            Customer-Centric
          </div>
</div>
{/* Value 04 */}
<div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/80 flex flex-col justify-between">
<div className="space-y-space-md">
<div className="flex items-center justify-between">
<span className="font-display text-headline-lg text-primary/40 font-black">04</span>
<span className="material-symbols-outlined text-[26px] text-primary">auto_mode</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold">Không ngừng cải tiến</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Cập nhật công nghệ điện toán đám mây tiên tiến, nâng cao bảo mật và hiệu năng xử lý dữ liệu lớn theo từng chu kỳ sprint hàng tuần mà không gây gián đoạn hệ thống.
            </p>
</div>
<div className="pt-4 border-t border-slate-100 text-primary font-caption text-caption font-bold uppercase tracking-wider">
            Continuous Innovation
          </div>
</div>
</div>
</div>
</section>
{/* SECTION 5: TRIẾT LÝ PHÁT TRIỂN SẢN PHẨM & LỘ TRÌNH (Development Journey) */}
<section className="py-20 lg:py-28 bg-surface">
<div className="max-w-7xl mx-auto px-margin">
<div className="max-w-3xl mb-16 space-y-space-xs">
<span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-semibold">TIẾN TRÌNH PHÁT TRIỂN</span>
<h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight">
          Hành trình xây dựng nền tảng từ thực tế vận hành
        </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">
          Chúng tôi không thiết kế phần mềm trong phòng thí nghiệm. BizPro+ được tôi luyện qua hàng ngàn giờ quan sát quy trình thực tế tại các doanh nghiệp Việt.
        </p>
</div>
{/* Timeline Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
{/* Step 1 */}
<div className="bg-white p-7 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/80 flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 font-black flex items-center justify-center font-label-md text-label-md mb-space-md">
            01
          </div>
<div className="font-label-sm text-label-sm text-primary font-bold mb-1">GIAI ĐOẠN 1</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-sm">Nghiên cứu hiện trường</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Khảo sát thực tế tại hơn 100 kho hàng, showroom bán lẻ và cơ sở phân phối để nhận diện các điểm nghẽn thao tác và sai sót phổ biến nhất.
          </p>
</div>
<div className="mt-space-md pt-space-sm border-t border-slate-100 font-caption text-caption text-primary font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px]">check_circle</span>
<span>100+ Khảo sát thực tế</span>
</div>
</div>
{/* Step 2 */}
<div className="bg-white p-7 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/80 flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 font-black flex items-center justify-center font-label-md text-label-md mb-space-md">
            02
          </div>
<div className="font-label-sm text-label-sm text-indigo-600 font-bold mb-1">GIAI ĐOẠN 2</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-sm">Kiến trúc lõi hợp nhất</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Xây dựng kiến trúc liên kết 4 module CRM - Kho - Đơn - Nhân sự trên cùng một cơ sở dữ liệu duy nhất, loại bỏ hoàn toàn việc phân mảnh dữ liệu.
          </p>
</div>
<div className="mt-space-md pt-space-sm border-t border-slate-100 font-caption text-caption text-indigo-600 font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px]">check_circle</span>
<span>Single Database Schema</span>
</div>
</div>
{/* Step 3 */}
<div className="bg-white p-7 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/80 flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 border border-sky-200/60 font-black flex items-center justify-center font-label-md text-label-md mb-space-md">
            03
          </div>
<div className="font-label-sm text-label-sm text-sky-600 font-bold mb-1">GIAI ĐOẠN 3</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-sm">Chuẩn hóa &amp; Tự động hóa</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Tối ưu UI/UX cho tốc độ thao tác cực nhanh, tích hợp quét mã QR/Barcode di động, đồng bộ đa kênh TMĐT và phân tích BI quản trị trực quan.
          </p>
</div>
<div className="mt-space-md pt-space-sm border-t border-slate-100 font-caption text-caption text-sky-600 font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px]">check_circle</span>
<span>Thao tác chuẩn dưới 3 clicks</span>
</div>
</div>
{/* Step 4 */}
<div className="bg-white p-7 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200/80 flex flex-col justify-between">
<div>
<div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 font-black flex items-center justify-center font-label-md text-label-md mb-space-md">
            04
          </div>
<div className="font-label-sm text-label-sm text-emerald-600 font-bold mb-1">GIAI ĐOẠN 4</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-sm">Hệ sinh thái &amp; Đám mây an toàn</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Đáp ứng tiêu chuẩn bảo mật dữ liệu cấp cao, phân quyền sâu RBAC nhiều cấp độ và Open API kết nối linh hoạt với hóa đơn điện tử, ngân hàng số.
          </p>
</div>
<div className="mt-space-md pt-space-sm border-t border-slate-100 font-caption text-caption text-emerald-600 font-semibold flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px]">check_circle</span>
<span>Open API &amp; RBAC Security</span>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 6: ĐỘI NGŨ & VĂN HÓA KỸ THUẬT (Team & Engineering Culture) */}
<section className="py-20 lg:py-24 bg-surface-container-low/70" id="doi-ngu">
<div className="max-w-7xl mx-auto px-margin">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
{/* Text intro */}
<div className="lg:col-span-5 space-y-space-md">
<span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-semibold">CON NGƯỜI &amp; CHUYÊN MÔN</span>
<h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight font-bold">
            Được xây dựng bởi đội ngũ đam mê công nghệ &amp; am hiểu kinh doanh
          </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            Chúng tôi kết hợp kỷ luật kỹ thuật khắt khe của ngành khoa học máy tính với sự hiểu biết sâu sắc về hiện trường kinh doanh tại Việt Nam. Không giải pháp lý thuyết suông — chỉ có phần mềm chạy trơn tru mỗi ngày.
          </p>
<div className="pt-space-sm space-y-space-sm">
<div className="flex items-center gap-space-sm font-body-md-medium text-body-md-medium text-on-surface">
<span className="material-symbols-outlined text-primary text-[20px]">check</span>
<span>100% Kỹ sư phần mềm làm việc full-time tại Việt Nam</span>
</div>
<div className="flex items-center gap-space-sm font-body-md-medium text-body-md-medium text-on-surface">
<span className="material-symbols-outlined text-primary text-[20px]">check</span>
<span>Đội ngũ Chuyên gia Triển khai trực tiếp đến hiện trường</span>
</div>
<div className="flex items-center gap-space-sm font-body-md-medium text-body-md-medium text-on-surface">
<span className="material-symbols-outlined text-primary text-[20px]">check</span>
<span>Quy trình kiểm thử tự động CI/CD đạt chuẩn quốc tế</span>
</div>
</div>
</div>
{/* Engineering Cards */}
<div className="lg:col-span-7 space-y-4">
{/* Card 1 */}
<div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200/80 flex items-start gap-5">
<div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[26px]">terminal</span>
</div>
<div>
<h3 className="font-title-md text-title-md text-on-surface font-bold mb-1">Đội ngũ Kỹ sư Phần mềm &amp; Hệ thống phân tán</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Tập trung tối ưu hóa kiến trúc vi dịch vụ (Microservices), cơ sở dữ liệu quy mô lớn và khả năng mở rộng tự động. Đảm bảo hệ thống vận hành bền bỉ kể cả trong các đợt siêu bão sale triệu đơn hàng.
              </p>
</div>
</div>
{/* Card 2 */}
<div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200/80 flex items-start gap-5">
<div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[26px]">account_balance</span>
</div>
<div>
<h3 className="font-title-md text-title-md text-on-surface font-bold mb-1">Chuyên gia Tư vấn Vận hành &amp; Chuỗi cung ứng</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Các chuyên viên am hiểu sâu sắc kế toán quản trị, phương pháp định giá tồn kho FIFO, luồng luân chuyển hàng đa kho và các thông tư chính sách hiện hành tại thị trường Việt Nam.
              </p>
</div>
</div>
{/* Card 3 */}
<div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200/80 flex items-start gap-5">
<div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[26px]">support_agent</span>
</div>
<div>
<h3 className="font-title-md text-title-md text-on-surface font-bold mb-1">Đội ngũ Onboarding &amp; Đồng hành khách hàng</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Cam kết hỗ trợ chuyển đổi dữ liệu lịch sử từ Excel/phần mềm cũ, tổ chức đào tạo thực chiến cho từng nhóm nhân sự và phản hồi kỹ thuật nhanh chóng qua Hotline và Ticket trực tuyến.
              </p>
</div>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 7: NGUYÊN TẮC VẬN HÀNH & BẢO MẬT (Business Principles & Security) */}
<section className="py-20 lg:py-24 bg-surface">
<div className="max-w-7xl mx-auto px-margin">
<div className="text-center max-w-3xl mx-auto mb-16 space-y-space-xs">
<span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-semibold">CAM KẾT DOANH NGHIỆP</span>
<h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight font-bold">
          Nguyên tắc vận hành &amp; Bảo vệ tài sản số
        </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">
          Dữ liệu là huyết mạch của doanh nghiệp. BizPro+ bảo vệ sự toàn vẹn và bí mật thông tin của khách hàng ở mức độ pháp lý và kỹ thuật cao nhất.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
<div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
<div className="space-y-space-sm">
<div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[24px]">policy</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold">Chủ quyền dữ liệu 100%</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Dữ liệu luôn thuộc quyền sở hữu tuyệt đối của khách hàng. Doanh nghiệp có thể trích xuất và backup toàn bộ dữ liệu bất kỳ lúc nào dưới định dạng chuẩn.
            </p>
</div>
<div className="pt-4 border-t border-slate-100 font-label-sm text-label-sm text-primary font-bold">100% Data Ownership</div>
</div>
<div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
<div className="space-y-space-sm">
<div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
<span className="material-symbols-outlined text-[24px]">encrypted</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold">Mã hóa đa tầng</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Áp dụng giao thức TLS 1.3 cho đường truyền và thuật toán mã hóa tiêu chuẩn quân đội AES-256 cho toàn bộ dữ liệu lưu trữ tại cơ sở hạ tầng Cloud.
            </p>
</div>
<div className="pt-4 border-t border-slate-100 font-label-sm text-label-sm text-indigo-600 font-bold">TLS 1.3 &amp; AES-256</div>
</div>
<div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
<div className="space-y-space-sm">
<div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
<span className="material-symbols-outlined text-[24px]">cloud_sync</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold">Cam kết SLA 99.95%</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Hệ thống dự phòng nóng (High-Availability Clustering) đảm bảo việc truy cập không bị gián đoạn, bảo đảm liên tục cho các quy trình thanh toán và xuất nhập hàng.
            </p>
</div>
<div className="pt-4 border-t border-slate-100 font-label-sm text-label-sm text-emerald-600 font-bold">99.95% Guaranteed Uptime</div>
</div>
<div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
<div className="space-y-space-sm">
<div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
<span className="material-symbols-outlined text-[24px]">contract</span>
</div>
<h3 className="font-title-md text-title-md text-on-surface font-bold">Ký thỏa thuận NDA</h3>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Ký kết văn bản cam kết bảo mật thông tin kinh doanh (Non-Disclosure Agreement) có đầy đủ giá trị pháp lý trước khi tiến hành hỗ trợ dữ liệu và triển khai.
            </p>
</div>
<div className="pt-4 border-t border-slate-100 font-label-sm text-label-sm text-amber-600 font-bold">Legal NDA Agreement</div>
</div>
</div>
</div>
</section>
{/* SECTION 8: THÔNG TIN PHÁP LÝ & HỆ THỐNG VĂN PHÒNG */}
<section className="py-20 lg:py-24 bg-surface-container-low/70">
<div className="max-w-7xl mx-auto px-margin">
<div className="max-w-3xl mb-16 space-y-space-xs">
<span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-semibold">PHÁP LÝ &amp; ĐỊA CHỈ TRỤ SỞ</span>
<h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface tracking-tight font-bold">
          Hệ thống văn phòng &amp; Pháp nhân chính quy
        </h2>
<p className="font-body-lg text-body-lg text-on-surface-variant">
          Doanh nghiệp công nghệ thành lập hợp pháp theo pháp luật Việt Nam, hiện diện tại hai đầu cầu kinh tế trọng điểm.
        </p>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch">
{/* Left: Legal Entity details */}
<div className="lg:col-span-5 bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between">
<div className="space-y-space-md">
<div>
<span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">Pháp nhân đăng ký</span>
<h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">Công ty Cổ phần Nền tảng Doanh nghiệp BizPro+</h3>
<p className="font-body-md text-body-md text-on-surface-variant mt-0.5">BizPro+ Platform Joint Stock Company</p>
</div>
<div className="pt-space-sm space-y-space-sm font-body-md text-body-md text-on-surface-variant">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[18px] text-primary">badge</span>
<span>Mã số doanh nghiệp: <strong className="text-on-surface">0109886868</strong> do Sở KH&amp;ĐT TP. Hà Nội cấp</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[18px] text-primary">call</span>
<span>Tổng đài hỗ trợ: <strong className="text-on-surface">1900 6886</strong> (8:00 - 18:00 Thứ 2 - Thứ 7)</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[18px] text-primary">mail</span>
<span>Email hỗ trợ: <strong className="text-on-surface">contact@bizpro.vn</strong></span>
</div>
</div>
</div>
<div className="mt-space-lg pt-space-md bg-blue-50/70 p-space-md rounded-xl space-y-space-xs border border-blue-100">
<div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm font-bold">
<span className="material-symbols-outlined text-[18px]">verified_user</span>
<span>CHỨNG NHẬN AN TOÀN THÔNG TIN</span>
</div>
<p className="font-caption text-caption text-on-surface-variant leading-relaxed">
              Kiểm thử và đánh giá an toàn bởi Trung tâm Giám sát an toàn không gian mạng Quốc gia (NCSC) &amp; Đạt tiêu chuẩn quản lý hệ thống an toàn thông tin ISO 27001:2022.
            </p>
</div>
</div>
{/* Right: Office Locations */}
<div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-gutter">
{/* Hanoi Office Card */}
<div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between">
<div className="space-y-space-sm">
<div className="flex items-center justify-between">
<span className="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm font-bold">
<span className="material-symbols-outlined text-[18px]">domain</span>
                  TRỤ SỞ HÀ NỘI
                </span>
<span className="text-xs bg-primary-fixed text-primary px-2.5 py-0.5 rounded-full font-bold">Headquarters</span>
</div>
<h4 className="font-title-md text-title-md text-on-surface font-bold">Keangnam Landmark 72</h4>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Tầng 12, Keangnam Landmark 72, Đường Phạm Hùng, Phường Mễ Trì, Quận Nam Từ Liêm, Hà Nội.
              </p>
</div>
<div className="pt-space-md">
<div className="w-full h-36 bg-cover bg-center rounded-xl shadow-inner border border-slate-100" data-location="Keangnam Landmark 72, Nam Tu Liem, Hanoi" style={{"backgroundImage":"url('https://lh3.googleusercontent.com/aida-public/AB6AXuAE88H8KlgSdj8EEm4g3iWwsJcQvBojEzZ8m2_-jORibBeDdOWV45PPB-sw9BJosx1E15PkSmnFcWfeaK9A-b2NySkfPQuj-c4kfST7I15rJkdYWt5KWGSXbfps6BU3FjwDMveelYg3SMZyF50dICako_UH-ts9MvhmepKIMTDD_Qdy299c-KEoPnDWGY5Py83rVZsuKr4C8n_lBMJN5HYg-5d3ks1USBtkyN_ofBk')"}}></div>
</div>
</div>
{/* HCMC Office Card */}
<div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between">
<div className="space-y-space-sm">
<div className="flex items-center justify-between">
<span className="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm font-bold">
<span className="material-symbols-outlined text-[18px]">location_city</span>
                  VĂN PHÒNG TP. HỒ CHÍ MINH
                </span>
<span className="text-xs bg-secondary-fixed text-secondary px-2.5 py-0.5 rounded-full font-bold">Branch Office</span>
</div>
<h4 className="font-title-md text-title-md text-on-surface font-bold">Bitexco Financial Tower</h4>
<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Tầng 8, Bitexco Financial Tower, Số 2 Hải Triều, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh.
              </p>
</div>
<div className="pt-space-md">
<div className="w-full h-36 bg-cover bg-center rounded-xl shadow-inner border border-slate-100" data-location="Bitexco Financial Tower, District 1, Ho Chi Minh City" style={{"backgroundImage":"url('https://lh3.googleusercontent.com/aida-public/AB6AXuBn3YT0HtJilNszFxKKnDtvprheJsDTWqyjZ-VouyX4E0Y2s25fag2LZM0m_mZtDIsOGqmuFPd-GnJ0SctRrUDlLFh-pFOoU_yzImpdTWByAiS7wmXTO3I2K9ew0FwXt9nTu9rzevrcoLHaFFRkPJo_XckfHM97fbNzvvYvS8ivxBCRsxBiCGlC9KrjJP4Gfl0vHZqLJVq3ehmV9VfLQmhbiZrZd3EuSQ0Or0IyBig')"}}></div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* SECTION 9: FINAL CONVERSION CTA (FLOATING CARD CONTAINER) */}
<section className="w-full bg-surface-container-low/60 py-16 lg:py-24 px-margin">
<div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-r from-[#0B1220] via-[#111C30] to-[#0B1220] p-10 sm:p-14 lg:p-16 text-center relative overflow-hidden shadow-2xl border border-blue-500/20 text-white">
<div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-container/20 rounded-full blur-[140px] pointer-events-none"></div>
<div className="absolute -bottom-40 -left-40 w-96 h-96 bg-tertiary/15 rounded-full blur-[140px] pointer-events-none"></div>
<div className="relative z-10 space-y-space-lg">
<div className="inline-flex items-center gap-space-xs px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-sky-300 w-fit mx-auto border border-white/10">
<span className="material-symbols-outlined text-[16px]">rocket_launch</span>
<span className="font-label-sm text-label-sm uppercase tracking-widest font-bold">SẴN SÀNG CHUYỂN ĐỔI SỐ VẬN HÀNH</span>
</div>
<h2 className="font-display text-headline-lg-mobile lg:text-headline-lg font-bold text-white tracking-tight max-w-3xl mx-auto leading-tight">
        Cùng BizPro+ xây dựng phương thức quản trị tốt hơn
      </h2>
<p className="font-body-lg text-body-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
        Bắt đầu hành trình chuyển đổi số vận hành ngay hôm nay cùng hơn 2.500 doanh nghiệp đang tăng trưởng bền vững tại Việt Nam.
      </p>
<div className="flex flex-wrap items-center justify-center gap-space-md pt-space-sm">
<a className="inline-flex items-center justify-center gap-space-xs px-8 py-3.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 cursor-pointer" data-path="bizpro-dung-thu" href="/signup">
<span>Dùng thử miễn phí 14 ngày</span>
<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
</a>
<a className="inline-flex items-center justify-center gap-space-xs px-8 py-3.5 rounded-xl bg-white/10 backdrop-blur text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/10 cursor-pointer" href="/signup">
<span className="material-symbols-outlined text-[18px]">calendar_today</span>
<span>Đặt lịch tư vấn &amp; Khảo sát 1-on-1</span>
</a>
</div>
{/* Trust signals */}
<div className="pt-space-lg flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-slate-300 font-caption text-caption">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-sky-400">credit_card_off</span>
<span>Không yêu cầu thẻ tín dụng</span>
</div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-sky-400">schedule</span>
<span>Triển khai kích hoạt trong 24 giờ</span>
</div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-sky-400">verified</span>
<span>Ký cam kết bảo mật dữ liệu NDA</span>
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
