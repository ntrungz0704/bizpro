"use client";

import React from "react";

export default function PartnerLogos() {
  return (
    <section className="py-12 bg-gradient-to-b from-white via-slate-50/50 to-slate-50/90 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
          TRUSTED BY 10,000+ FORWARD-THINKING ORGANIZATIONS ACROSS RETAIL, WHOLESALE & MANUFACTURING
        </p>

        <div className="bg-white/95 rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <p className="text-xs font-black uppercase tracking-wider text-slate-600">
            ĐỒNG HÀNH VẬN HÀNH CÙNG CÁC TẬP ĐOÀN, ĐỐI TÁC GIAO VẬN & SÀN THƯƠNG MẠI ĐIỆN TỬ
          </p>

          {/* High-Fidelity Authentic Colored Logo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4 items-center justify-items-center">
          {/* 1. VINGROUP */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-red-400/60 transition-all group">
            <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
              <rect width="32" height="32" rx="6" fill="#ED1C24" />
              <polygon points="16,6 19,13 26,14 21,19 22,26 16,22 10,26 11,19 6,14 13,13" fill="#FFDE00" />
            </svg>
            <span className="text-xs font-black text-slate-800 tracking-tight group-hover:text-red-600 transition-colors">
              VINGROUP
            </span>
          </div>

          {/* 2. FPT */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-400/60 transition-all group">
            <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
              <rect width="32" height="32" rx="6" fill="#FFFFFF" />
              <path d="M7 23C7 16 11 11 16 11C13 14 12 18 12 23H7Z" fill="#0054A6" />
              <path d="M12 23C12 15 17 9 22 9C19 12 17 17 17 23H12Z" fill="#F37021" />
              <path d="M17 23C17 15 22 10 27 10C24 13 22 18 22 23H17Z" fill="#00A850" />
            </svg>
            <span className="text-xs font-black text-slate-800 tracking-tight group-hover:text-orange-600 transition-colors">
              FPT CORP
            </span>
          </div>

          {/* 3. VIETTEL */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-rose-400/60 transition-all group">
            <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
              <rect width="32" height="32" rx="6" fill="#EE0033" />
              <circle cx="16" cy="16" r="8" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
              <circle cx="16" cy="16" r="3" fill="#FFFFFF" />
            </svg>
            <span className="text-xs font-black text-slate-800 tracking-tight group-hover:text-red-600 transition-colors">
              VIETTEL
            </span>
          </div>

          {/* 4. SHOPEE */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-500/60 transition-all group">
            <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
              <rect width="32" height="32" rx="6" fill="#EE4D2D" />
              <path d="M11 13C11 10.2 13.2 8 16 8C18.8 8 21 10.2 21 13V14H24L23 25H9L8 14H11V13Z" fill="#FFFFFF" />
              <path d="M13 13C13 11.3 14.3 10 16 10C17.7 10 19 11.3 19 13V14H13V13Z" fill="#EE4D2D" />
            </svg>
            <span className="text-xs font-black text-slate-800 tracking-tight group-hover:text-[#EE4D2D] transition-colors">
              Shopee
            </span>
          </div>

          {/* 5. TIKTOK SHOP */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-800 transition-all group">
            <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
              <rect width="32" height="32" rx="6" fill="#000000" />
              <path d="M19 8C19.8 9.5 21.2 10.6 23 11V14C21.4 14 19.9 13.3 19 12.3V19C19 22.3 16.3 25 13 25C9.7 25 7 22.3 7 19C7 15.7 9.7 13 13 13V16C11.3 16 10 17.3 10 19C10 20.7 11.3 22 13 22C14.7 22 16 20.7 16 19V8H19Z" fill="#25F4EE" />
              <path d="M20 7C20.8 8.5 22.2 9.6 24 10V13C22.4 13 20.9 12.3 20 11.3V18C20 21.3 17.3 24 14 24C10.7 24 8 21.3 8 18C8 14.7 10.7 12 14 12V15C12.3 15 11 16.3 11 18C11 19.7 12.3 21 14 21C15.7 21 17 19.7 17 18V7H20Z" fill="#FE2C55" opacity="0.8" />
            </svg>
            <span className="text-xs font-black text-slate-800 tracking-tight group-hover:text-black transition-colors">
              TikTok Shop
            </span>
          </div>

          {/* 6. GIAO HÀNG TIẾT KIỆM (GHTK) */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-600 transition-all group">
            <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
              <rect width="32" height="32" rx="6" fill="#00783E" />
              <path d="M6 13H18V21H6V13Z" fill="#FFFFFF" />
              <path d="M18 15H23L26 18V21H18V15Z" fill="#FFFFFF" />
              <circle cx="10" cy="22" r="2.5" fill="#00783E" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="21" cy="22" r="2.5" fill="#00783E" stroke="#FFFFFF" strokeWidth="1.5" />
            </svg>
            <span className="text-xs font-black text-slate-800 tracking-tight group-hover:text-[#00783E] transition-colors">
              GHTK
            </span>
          </div>

          {/* 7. GIAO HÀNG NHANH (GHN) */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-500 transition-all group">
            <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
              <rect width="32" height="32" rx="6" fill="#FF6600" />
              <polygon points="12,7 23,16 12,25 15,16" fill="#FFFFFF" />
            </svg>
            <span className="text-xs font-black text-slate-800 tracking-tight group-hover:text-[#FF6600] transition-colors">
              GHN Express
            </span>
          </div>

          {/* 8. VIETCOMBANK */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-700 transition-all group">
            <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
              <rect width="32" height="32" rx="6" fill="#005C2B" />
              <path d="M16 8L24 22H8L16 8Z" fill="#71BF44" />
              <path d="M16 12L21 21H11L16 12Z" fill="#005C2B" />
            </svg>
            <span className="text-xs font-black text-slate-800 tracking-tight group-hover:text-[#005C2B] transition-colors">
              Vietcombank
            </span>
          </div>

          {/* 9. MOMO WALLET */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-pink-500 transition-all group">
            <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0" fill="none">
              <rect width="32" height="32" rx="6" fill="#A50064" />
              <circle cx="16" cy="16" r="7" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
              <text x="16" y="19" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif">M</text>
            </svg>
            <span className="text-xs font-black text-slate-800 tracking-tight group-hover:text-[#A50064] transition-colors">
              MoMo Pay
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
);
}
