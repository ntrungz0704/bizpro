"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  ArrowRight,
  Play,
  Star,
  FileText,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Search,
  Check,
  Layers,
  Sparkles,
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function SalesOrderFeaturePage() {
  const [activeStage, setActiveStage] = useState<number>(2);
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-amber-100 selection:text-amber-800">
      <MarketingHeader />

      <main className="flex-1 w-full overflow-x-hidden">
        {/* =========================================================================
            1. SALES ORDER HERO SECTION (100% Vietnamese)
            ========================================================================= */}
        <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-400/10 via-sky-300/10 to-transparent blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-24 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/10 via-amber-300/10 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              
              {/* Left Column: Hero Copy */}
              <div className="lg:col-span-6 space-y-6 text-left">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                  <Link href="/features" className="hover:underline flex items-center gap-1">
                    <span>Tính năng</span>
                  </Link>
                  <span>&gt;</span>
                  <span className="text-slate-800">Đơn Bán Hàng (Sales Order)</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-[1.2] [text-wrap:balance]">
                  Chuẩn Hóa Quy Trình Bán Hàng <br className="hidden sm:inline" />
                  <span className="text-amber-600">5 Bước Tuần Tự</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                  Quản lý đơn hàng chặt chẽ tương tự Shopee và TikTok. 
                  Tự động khóa giữ tồn kho, tính thuế GTGT 8%/10% theo quy định, đối soát công nợ và hỗ trợ tra cứu mã vận chuyển đa hãng (Mục tiêu thiết kế kiến trúc).
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5"
                  >
                    <span>Trải nghiệm Bán Hàng miễn phí</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>

                  <Link
                    href="/demo"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold shadow-2xs transition-all hover:-translate-y-0.5"
                  >
                    <Play className="w-4 h-4 mr-2 fill-slate-700 text-slate-700" />
                    <span>Xem video quy trình</span>
                  </Link>
                </div>

                <div className="pt-6 border-t border-slate-200/70 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">3.2x</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Tốc độ (Mục tiêu hiệu suất)</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">0 Sai sót</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Đóng gói (Mục tiêu kiểm soát)</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">99.8%</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Đúng hẹn (Cam kết SLA mẫu)</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Sales Order Mockup Card */}
              <div className="lg:col-span-6 relative">
                {/* Simulation Disclaimer Badge */}
                <div className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-lg mb-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>MÔ PHỎNG MINH HỌA — Dữ liệu đơn hàng giả lập demo, không kết nối hệ thống runtime.</span>
                </div>

                <div className="relative mx-auto max-w-[640px] rounded-2xl bg-white p-4 sm:p-6 shadow-[0_20px_50px_rgba(217,119,6,0.08)] border border-amber-100 transition-all">
                  
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-slate-800">Đơn Hàng #SO-2026-0089</span>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      <span>Đang giao hàng (GHN: GHN88392)</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Khách hàng</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">Công ty Việt An</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Kho xuất</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">Kho Hà Nội</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Thuế VAT (10%)</div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">2.400.000 đ</div>
                    </div>
                    <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                      <div className="text-[11px] text-amber-800 font-medium">Tổng tiền đơn</div>
                      <div className="text-sm font-black text-amber-900 mt-0.5">26.400.000 đ</div>
                    </div>
                  </div>

                  {/* 5-Step Mini Visualizer */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <div className="text-[11px] font-bold text-slate-700 mb-2">Tiến Độ Quy Trình Đơn Hàng (Tuần Tự)</div>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 gap-1">
                      <span className="text-emerald-600">✓ 1. Nháp</span>
                      <span>→</span>
                      <span className="text-emerald-600">✓ 2. Xác nhận</span>
                      <span>→</span>
                      <span className="text-emerald-600">✓ 3. Đóng gói</span>
                      <span>→</span>
                      <span className="text-blue-600 font-bold bg-blue-100 px-1.5 py-0.5 rounded">4. Đang giao</span>
                      <span>→</span>
                      <span className="text-slate-400">5. Hoàn tất</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            2. THE 5-STAGE SEQUENTIAL LIFECYCLE (Interactive Simulator)
            ========================================================================= */}
        <section className="py-20 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
                Chuẩn Hóa Vận Hành
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Mô Phỏng 5 Giai Đoạn Đơn Hàng Tuần Tự
              </h2>
              <p className="text-slate-600 text-base">
                Mỗi giai đoạn kiểm soát chặt chẽ điều kiện tồn kho, chứng từ phiếu xuất và chuẩn mực ghi nhận doanh thu kế toán.
              </p>
            </div>

            {/* Simulation Disclaimer Banner */}
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>MÔ PHỎNG MINH HỌA — Nhấp vào từng bước để theo dõi luồng tác động tồn kho và hạch toán kế toán.</span>
              </div>
              <span className="text-[10px] text-amber-700 uppercase font-bold tracking-wider hidden sm:inline">Interactive Demo</span>
            </div>

            {/* 5 Step Selector Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
              {[
                { step: 1, title: "1. Nháp (DRAFT)", color: "slate" },
                { step: 2, title: "2. Xác Nhận (CONFIRMED)", color: "blue" },
                { step: 3, title: "3. Đóng Gói (PROCESSING)", color: "amber" },
                { step: 4, title: "4. Đang Giao (SHIPPING)", color: "indigo" },
                { step: 5, title: "5. Hoàn Tất (FULFILLED)", color: "emerald" },
              ].map((item) => (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => setActiveStage(item.step)}
                  className={`p-3.5 rounded-2xl text-left border transition-all ${
                    activeStage === item.step
                      ? "bg-amber-600 text-white border-amber-600 shadow-md scale-[1.02]"
                      : "bg-[#F8FAFC] text-slate-700 border-slate-200 hover:border-amber-300"
                  }`}
                >
                  <div className="text-[11px] font-bold opacity-80">Bước {item.step}</div>
                  <div className="text-xs font-extrabold mt-0.5">{item.title}</div>
                </button>
              ))}
            </div>

            {/* Interactive Stage Detail Card */}
            <div className="max-w-4xl mx-auto bg-[#F8FAFC] border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200 mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center">
                    {activeStage}
                  </span>
                  <div>
                    <h3 className="font-black text-slate-900 text-base sm:text-lg">
                      {activeStage === 1 && "Giai đoạn 1: Lập Đơn Nháp (DRAFT)"}
                      {activeStage === 2 && "Giai đoạn 2: Khách Xác Nhận Chốt Mua (CONFIRMED)"}
                      {activeStage === 3 && "Giai đoạn 3: Thủ Kho Đóng Gói (PROCESSING)"}
                      {activeStage === 4 && "Giai đoạn 4: Bàn Giao Vận Chuyển (SHIPPING)"}
                      {activeStage === 5 && "Giai đoạn 5: Giao Hàng Thành Công (FULFILLED)"}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Trạng thái hệ thống: {activeStage === 1 ? "DRAFT" : activeStage === 2 ? "CONFIRMED" : activeStage === 3 ? "PROCESSING" : activeStage === 4 ? "SHIPPING" : "FULFILLED"}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {activeStage === 1 && "Chưa tác động kho"}
                  {activeStage === 2 && "Khóa giữ tồn khả dụng"}
                  {activeStage === 3 && "In phiếu xuất kho PXK"}
                  {activeStage === 4 && "Đã cấp mã vận đơn"}
                  {activeStage === 5 && "Doanh thu VAS 14 / IFRS 15"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Tác Động Tồn Kho & Chứng Từ</div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                    {activeStage === 1 && (
                      <>
                        <div className="font-bold text-slate-800">Tồn kho: Không thay đổi</div>
                        <p className="text-slate-500 leading-relaxed">Nhân viên kinh doanh khảo giá, tạo báo giá gửi khách hàng. Chưa trừ và chưa khóa giữ hàng trong kho.</p>
                      </>
                    )}
                    {activeStage === 2 && (
                      <>
                        <div className="font-bold text-blue-700">Tồn kho: Khóa giữ nguyên tử (Atomic Lock)</div>
                        <p className="text-slate-500 leading-relaxed">Kiểm tra tức thời số dư tồn khả dụng. Tự động chuyển 50 SKU sang trạng thái đã khóa giữ, ngăn ngừa bán âm.</p>
                      </>
                    )}
                    {activeStage === 3 && (
                      <>
                        <div className="font-bold text-amber-700">Chứng từ: Phát hành Phiếu xuất kho #PXK</div>
                        <p className="text-slate-500 leading-relaxed">Thủ kho in phiếu đóng gói, quét mã vạch GS1-128 kiểm đếm thực tế và niêm phong thùng hàng.</p>
                      </>
                    )}
                    {activeStage === 4 && (
                      <>
                        <div className="font-bold text-indigo-700">Vận đơn: Liên thông API Đơn vị giao hàng</div>
                        <p className="text-slate-500 leading-relaxed">Bàn giao bưu tá GHN / GHTK / Viettel Post. Hệ thống theo dõi trạng thái di chuyển qua Webhook.</p>
                      </>
                    )}
                    {activeStage === 5 && (
                      <>
                        <div className="font-bold text-emerald-700">Tồn kho: Trừ tồn kho thực tế vĩnh viễn</div>
                        <p className="text-slate-500 leading-relaxed">Khách hàng ký nhận biên bản giao hàng. Trừ chính thức vào Sổ thẻ kho và giải phóng lượng hàng đã khóa giữ.</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Hạch Toán Kế Toán & Doanh Thu</div>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5 font-mono text-[11px]">
                    {activeStage === 1 && (
                      <div className="text-slate-500 font-sans">
                        Chưa phát sinh bút toán kế toán tài chính. Đơn hàng lưu tại phân hệ Bán hàng để theo dõi tiến độ cơ hội.
                      </div>
                    )}
                    {activeStage === 2 && (
                      <div className="text-slate-500 font-sans">
                        Chưa đủ điều kiện ghi nhận doanh thu (theo VAS 14 & IFRS 15 vì quyền kiểm soát hàng hóa chưa được bàn giao cho khách).
                      </div>
                    )}
                    {activeStage === 3 && (
                      <div className="text-slate-500 font-sans">
                        Xuất kho phục vụ giao hàng. Hàng hóa chuyển từ trạng thái tồn tại kho sang hàng đang đi đường (TK 157 nếu áp dụng).
                      </div>
                    )}
                    {activeStage === 4 && (
                      <div className="text-slate-600 font-sans">
                        Theo dõi công nợ thu hộ COD qua bưu tá vận chuyển. Đối soát dòng tiền thu hộ định kỳ.
                      </div>
                    )}
                    {activeStage === 5 && (
                      <div className="space-y-1">
                        <div className="text-emerald-700 font-bold font-sans">Ghi nhận Doanh thu & Giá vốn chính thức:</div>
                        <div className="text-slate-700">• Nợ TK 131: Phải thu KH / Tiền COD</div>
                        <div className="text-slate-700">• Có TK 5111: Doanh thu bán hàng</div>
                        <div className="text-slate-700">• Có TK 33311: Thuế GTGT đầu ra (8%/10%)</div>
                        <div className="text-slate-700">• Nợ TK 632 / Có TK 156: Trị giá vốn hàng xuất bán</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            3. REAL-TIME STOCK DEDUCTION & ALLOCATION
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
                  Liên Thông Tự Động
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Tự động điều phối xuất kho theo vị trí gần khách nhất
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Khi đơn hàng được lập cho địa chỉ tại TP.HCM, hệ thống sẽ tự động ưu tiên xuất từ Kho Tổng Miền Nam để giảm cước giao hàng và rút ngắn thời gian vận chuyển đến tay khách trong ngày.
                </p>
                <div className="pt-2">
                  <Link
                    href="/sales/orders"
                    className="inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700"
                  >
                    <span>Xem màn hình Đơn Bán Hàng trong ứng dụng</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
                <div className="text-xs font-bold text-slate-800 pb-3 border-b border-slate-100 mb-3">
                  Điều Phối Kho Thông Minh
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Đơn hàng giao: Quận 1, TP.HCM</div>
                      <div className="text-[11px] text-slate-500">Gợi ý xuất: Kho Miền Nam (Tồn 450 sản phẩm)</div>
                    </div>
                    <span className="text-emerald-600 font-bold">Thời gian: Trong ngày</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Đơn hàng giao: Cầu Giấy, Hà Nội</div>
                      <div className="text-[11px] text-slate-500">Gợi ý xuất: Kho Miền Bắc (Tồn 820 sản phẩm)</div>
                    </div>
                    <span className="text-emerald-600 font-bold">Thời gian: 2 Giờ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. B2B & RETAIL PRICE POLICIES & VAT 10%
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
              Chính Sách Giá Linh Hoạt
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tự động tính thuế GTGT 8%/10% và chiết khấu theo cấp đại lý
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Hệ thống tự động áp dụng biểu phí chiết khấu riêng cho Đại lý Cấp 1, Cấp 2 hoặc Khách hàng thân thiết. 
              Mọi đơn hàng xuất hóa đơn đều được tính toán chính xác tiền thuế GTGT (8% hoặc 10% tùy theo quy định phân loại hàng hóa của Nghị định 174/2025/NĐ-CP và Nghị quyết 204/2025/QH15).
            </p>
          </div>
        </section>

        {/* =========================================================================
            5. SHIPPING & CARRIER INTEGRATION (GHN, GHTK, Viettel Post)
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC] border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
                Tích Hợp Vận Chuyển
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Liên kết các đơn vị giao hàng hàng đầu Việt Nam
              </h2>
              <p className="text-slate-600 text-base">
                Tra cứu mã vận đơn, kiểm tra trạng thái bưu tá giao hàng và đối soát tiền thu hộ COD minh bạch.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-lg font-black text-orange-600">Giao Hàng Nhanh (GHN)</div>
                <p className="text-xs text-slate-500">Tự động đẩy đơn qua API và in phiếu vận đơn chuẩn khổ A6.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-lg font-black text-emerald-600">Giao Hàng Tiết Kiệm (GHTK)</div>
                <p className="text-xs text-slate-500">Cập nhật tọa độ shipper thời gian thực và quản lý đơn hoàn trả.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="text-lg font-black text-red-600">Viettel Post</div>
                <p className="text-xs text-slate-500">Mạng lưới bưu cục phủ khắp 63 tỉnh thành đến tận cấp huyện xã.</p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. DEBT & PAYMENT TRACKING
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
              Công Nợ & Thanh Toán
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Quản lý nợ đọng, không thất thoát dòng tiền bán hàng
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Tách bạch rõ ràng số tiền khách đã đặt cọc, số tiền cần thu hộ COD và số dư nợ còn lại. 
              Cảnh báo khi đại lý vượt quá hạn mức công nợ cho phép trước khi duyệt đơn mới.
            </p>
          </div>
        </section>

        {/* =========================================================================
            7. SALES ANALYTICS
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-3xl font-black text-amber-600">8,420</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Đơn Hàng Trong Tháng</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-3xl font-black text-emerald-600">2.84 Tỷ</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Doanh Số Thực Thu</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-3xl font-black text-blue-600">98.4%</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Tỷ Lệ Giao Thành Công</div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. OPERATIONAL ORDER FLOWCHART
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
              Sơ Đồ Vận Hành
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Quy trình bán hàng thông suốt từ Văn phòng đến Kho bãi
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Bộ phận Kinh doanh lập đơn → Hệ thống tự động kiểm tra tồn kho → Thủ kho đóng thùng xuất hàng → Bưu tá giao tận tay khách → Kế toán nhận tiền.
            </p>
          </div>
        </section>

        {/* =========================================================================
            9. TESTIMONIALS / QUOTE
            ========================================================================= */}
        <section className="py-16 bg-[#F8FAFC] border-t border-slate-200/60">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
            <div className="flex justify-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-500" />
              ))}
            </div>
            <p className="text-base sm:text-lg font-medium text-slate-800 italic">
              "Trước đây mỗi khi nhân viên bán hàng chốt đơn qua Zalo, chúng tôi phải gọi điện cho thủ kho hỏi xem còn hàng không. 
              Từ khi dùng BizPro+, đơn hàng tự khóa tồn kho tức thì, tốc độ đóng gói tăng hơn gấp 3 lần."
            </p>
            <div className="text-xs font-bold text-slate-900">
              Nguyễn Hữu Nam • Giám Đốc Điều Hành Chuỗi Phân Phối Gia Dụng Toàn Cầu
            </div>
          </div>
        </section>

        {/* =========================================================================
            10. FINAL CALL TO ACTION
            ========================================================================= */}
        <section className="py-20 bg-gradient-to-r from-amber-600 to-orange-700 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Tăng tốc 3.2x quy trình xử lý đơn hàng cùng BizPro+
            </h2>
            <p className="text-amber-100 text-base sm:text-lg max-w-2xl mx-auto">
              Khởi tạo dùng thử hoàn toàn miễn phí trong 14 ngày. Trải nghiệm xử lý đơn hàng thực chiến ngay hôm nay.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-full bg-white text-amber-800 text-sm font-bold shadow-xl hover:bg-amber-50 transition-all hover:scale-105"
              >
                Dùng thử 14 ngày miễn phí
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 rounded-full bg-amber-800/60 hover:bg-amber-800 text-white text-sm font-bold border border-white/20 transition-all"
              >
                Đặt lịch tư vấn & Demo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
