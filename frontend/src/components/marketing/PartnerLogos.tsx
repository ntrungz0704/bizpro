"use client";

import React from "react";

interface BrandItem {
  name: string;
  category: string;
  tag: string;
  accentColor: string;
  iconBg: string;
  icon: React.ReactNode;
}

const PRIMARY_CLIENT_BRANDS: BrandItem[] = [
  {
    name: "An Phước",
    category: "May mặc & Thời trang cao cấp",
    tag: "100+ Showroom",
    accentColor: "hover:border-amber-500/80 hover:shadow-amber-500/10",
    iconBg: "bg-gradient-to-br from-amber-600 to-amber-800 text-white",
    icon: (
      <svg viewBox="0 0 32 32" className="w-5 h-5" fill="currentColor">
        <path d="M16 4L20 12L28 14L22 20L24 28L16 24L8 28L10 20L4 14L12 12L16 4Z" />
      </svg>
    ),
  },
  {
    name: "V-Fashion",
    category: "Chuỗi bán lẻ thời trang trẻ",
    tag: "32 Chi nhánh",
    accentColor: "hover:border-indigo-500/80 hover:shadow-indigo-500/10",
    iconBg: "bg-gradient-to-br from-indigo-600 to-purple-700 text-white",
    icon: (
      <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M6 8L16 26L26 8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 8L16 18L21 8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: "Tân Phát Tech",
    category: "Phân phối công nghệ & Tự động",
    tag: "450+ Đại lý",
    accentColor: "hover:border-blue-500/80 hover:shadow-blue-500/10",
    iconBg: "bg-gradient-to-br from-blue-600 to-cyan-700 text-white",
    icon: (
      <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="5" y="5" width="22" height="22" rx="4" />
        <path d="M11 16H21M16 11V21" strokeLinecap="round" />
        <circle cx="16" cy="16" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Minh Long Auto",
    category: "Phụ tùng & Phụ kiện ô tô",
    tag: "12 Kho trung tâm",
    accentColor: "hover:border-red-500/80 hover:shadow-red-500/10",
    iconBg: "bg-gradient-to-br from-red-600 to-rose-700 text-white",
    icon: (
      <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="16" cy="16" r="10" />
        <circle cx="16" cy="16" r="4" fill="currentColor" />
        <path d="M16 6V12M16 20V26M6 16H12M20 16H26" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Bách Hóa Xanh",
    category: "Chuỗi siêu thị thực phẩm & FMCG",
    tag: "2.100+ Cửa hàng",
    accentColor: "hover:border-emerald-500/80 hover:shadow-emerald-500/10",
    iconBg: "bg-gradient-to-br from-emerald-600 to-green-700 text-white",
    icon: (
      <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M6 6H10L13 20H25L28 10H11" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="14" cy="25" r="2" fill="currentColor" />
        <circle cx="24" cy="25" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "PharmaCare",
    category: "Dược phẩm & Chuỗi nhà thuốc",
    tag: "85 Cơ sở",
    accentColor: "hover:border-teal-500/80 hover:shadow-teal-500/10",
    iconBg: "bg-gradient-to-br from-teal-600 to-cyan-800 text-white",
    icon: (
      <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M16 6V26M6 16H26" strokeLinecap="round" />
        <rect x="4" y="4" width="24" height="24" rx="6" />
      </svg>
    ),
  },
  {
    name: "SunSmart",
    category: "Phân phối linh kiện thông minh",
    tag: "Toàn quốc",
    accentColor: "hover:border-orange-500/80 hover:shadow-orange-500/10",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600 text-white",
    icon: (
      <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="16" cy="16" r="6" fill="currentColor" />
        <path d="M16 4V8M16 24V28M4 16H8M24 16H28M7.5 7.5L10.5 10.5M21.5 21.5L24.5 24.5M7.5 24.5L10.5 21.5M21.5 10.5L24.5 7.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const ECOSYSTEM_PARTNERS = [
  { name: "Shopee", label: "Sàn TMĐT", color: "#EE4D2D" },
  { name: "TikTok Shop", label: "Social Commerce", color: "#000000" },
  { name: "Lazada", label: "Sàn TMĐT", color: "#0F146D" },
  { name: "GHTK", label: "Giao vận hỏa tốc", color: "#00783E" },
  { name: "GHN Express", label: "Giao vận toàn quốc", color: "#FF6600" },
  { name: "Viettel Post", label: "Hậu cần chuyển phát", color: "#EE0033" },
  { name: "VNPAY", label: "Cổng thanh toán QR", color: "#005BAA" },
  { name: "Vietcombank", label: "Ngân hàng số", color: "#005C2B" },
];

export default function PartnerLogos() {
  return (
    <section className="w-full py-14 bg-gradient-to-b from-white via-slate-50/70 to-white border-y border-slate-200/90 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>MẠNG LƯỚI KHÁCH HÀNG & ĐỐI TÁC HỢP TÁC CHIẾN LƯỢC</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Được Tin Dùng Bởi 2.500+ Chuỗi Bán Lẻ, Phân Phối & SME Tiêu Biểu
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Hạ tầng vận hành thực chiến đã được chứng minh hiệu quả qua hàng triệu giao dịch mỗi tháng.
          </p>
        </div>

        {/* Primary Enterprise Client Brand Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3.5 mb-10">
          {PRIMARY_CLIENT_BRANDS.map((brand) => (
            <div
              key={brand.name}
              className={`flex flex-col justify-between p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group ${brand.accentColor}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${brand.iconBg}`}
                >
                  {brand.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-black text-slate-900 tracking-tight whitespace-nowrap group-hover:text-blue-600 transition-colors">
                    {brand.name}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide truncate">
                    {brand.tag}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] font-medium text-slate-500 leading-snug line-clamp-1">
                {brand.category}
              </div>
            </div>
          ))}
        </div>

        {/* Connected Ecosystem Integrations (Shipping, E-Commerce & Banking) */}
        <div className="pt-6 border-t border-slate-200/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              TÍCH HỢP SẴN KẾT NỐI:
            </span>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 sm:gap-3 w-full">
              {ECOSYSTEM_PARTNERS.map((partner) => (
                <div
                  key={partner.name}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-white border border-slate-200/70 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer group"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: partner.color }}
                  />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 tracking-tight whitespace-nowrap">
                    {partner.name}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden md:inline font-medium">
                    ({partner.label})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
