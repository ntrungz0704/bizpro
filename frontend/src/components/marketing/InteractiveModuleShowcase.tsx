"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Warehouse,
  ShoppingCart,
  UserCheck,
  Receipt,
  Globe,
  ArrowRight,
  CheckCircle2,
  Zap,
  Sparkles,
  MapPin,
  Info,
} from "lucide-react";

export default function InteractiveModuleShowcase() {
  const [activeModule, setActiveModule] = useState<
    "crm" | "kho" | "donhang" | "accounting" | "omnichannel" | "hrm"
  >("crm");
  const [checkedIn, setCheckedIn] = useState(false);

  const modules = [
    {
      id: "crm" as const,
      name: "CRM & Bán hàng",
      icon: Users,
      badge: "Lead-to-Cash",
      highlightColor: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      id: "kho" as const,
      name: "Kho vận Atomic",
      icon: Warehouse,
      badge: "Mô phỏng 1.2s",
      highlightColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      id: "donhang" as const,
      name: "Đơn hàng Đa sàn",
      icon: ShoppingCart,
      badge: "Shopee & TikTok",
      highlightColor: "text-sky-600 bg-sky-50 border-sky-200",
    },
    {
      id: "accounting" as const,
      name: "Kế toán TT 200",
      icon: Receipt,
      badge: "Báo cáo Mô phỏng",
      highlightColor: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      id: "omnichannel" as const,
      name: "Đa kênh & Logistics",
      icon: Globe,
      badge: "6 Hãng Ship",
      highlightColor: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      id: "hrm" as const,
      name: "HRM & Lương thưởng",
      icon: UserCheck,
      badge: "GPS Geofencing",
      highlightColor: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
  ];

  return (
    <div className="w-full">
      {/* Universal Demo Transparency Banner */}
      <div className="mb-6 px-4 py-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <span className="font-extrabold uppercase tracking-wide">
            MÔ PHỎNG MINH HỌA — Dữ liệu giả lập demo, không kết nối hệ thống runtime thực tế.
          </span>
        </div>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold uppercase tracking-wider shrink-0">
          Giao diện mô phỏng
        </span>
      </div>

      {/* Tab Selectors */}
      <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {modules.map((m) => {
          const Icon = m.icon;
          const isActive = activeModule === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveModule(m.id)}
              className={`px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-102"
                  : "bg-white text-slate-700 hover:text-blue-600 hover:bg-slate-50 border border-slate-200/90 shadow-xs"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{m.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {m.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Showcase Panel */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10">
        {/* PANEL 1: CRM */}
        {activeModule === "crm" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-scale-up">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Phân hệ Quản trị Quan hệ Khách hàng 360° (Mô phỏng)
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Nuôi dưỡng khách hàng, <br />
                <span className="text-blue-600">bứt phá tỷ lệ chốt sales.</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Thiết kế quy trình thu thập Lead từ Zalo OA, Facebook Ads, Website và phân bổ thông minh cho nhân viên kinh doanh.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Phễu bán hàng (Pipeline) tùy biến đa giai đoạn</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Lịch sử tương tác cuộc gọi, họp và báo giá chi tiết</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Dự báo doanh số (Sales Forecast) bằng mô hình thống kê</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/features/crm"
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <span>Khám phá chi tiết Module CRM</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Interactive CRM UI Card */}
            <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Phễu Cơ Hội Kinh Doanh (Dữ liệu mô phỏng minh họa)
                  </h4>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    Tổng giá trị mô phỏng: 4.200.000.000₫
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  24 Cơ hội mẫu
                </span>
              </div>

              {/* 3 Funnel Steps */}
              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                <div className="p-3 rounded-xl bg-white border border-slate-200/70 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-medium block">Tiếp cận mới (12 mẫu)</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">1.25 Tỷ ₫</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/70 shadow-xs">
                  <span className="text-[11px] text-blue-700 font-medium block">Đàm phán báo giá (8 mẫu)</span>
                  <span className="text-sm font-bold text-blue-700 mt-0.5 block">2.10 Tỷ ₫</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 shadow-xs">
                  <span className="text-[11px] text-emerald-700 font-medium block">Đã chốt ký (4 mẫu)</span>
                  <span className="text-sm font-bold text-emerald-700 mt-0.5 block">850 Tr ₫</span>
                </div>
              </div>

              {/* Live Deal Item */}
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white border-l-4 border-l-blue-600 border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Công ty CP V-Style (Chân dung mô phỏng minh họa)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Gói Enterprise 18 chi nhánh • Phụ trách: Hoàng Việt (Nhân sự mẫu)
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[11px] font-bold">
                    Trạng thái mẫu: Chờ duyệt
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border-l-4 border-l-emerald-500 border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Tập đoàn Dược phẩm PharmaGroup (Chân dung mô phỏng minh họa)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Dự án Quản trị Kho Đa Điểm • Phụ trách: Lê Hoàng Mai (Nhân sự mẫu)
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                    Trạng thái mẫu: Đã ký
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: KHO HÀNG */}
        {activeModule === "kho" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-scale-up">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <Warehouse className="w-3.5 h-3.5" />
                Quản Trị Kho Vận &amp; Khóa Tồn Atomic (Mô phỏng)
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Kiểm soát tồn kho đa điểm, <br />
                <span className="text-emerald-600">hạn chế tối đa rủi ro bán âm.</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mô hình Double-entry ledger giữ hàng theo mili-giây. Thiết kế luồng đồng bộ số lượng tồn chính xác lên Shopee, TikTok Shop và điểm bán lẻ POS.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Quản lý chuỗi đa kho: Tổng kho &amp; cửa hàng vệ tinh</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cảnh báo tồn kho Min-Max &amp; Gợi ý nhập hàng tự động</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Quét mã vạch Barcode/QR nhanh chóng bằng điện thoại</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/features/inventory"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  <span>Khám phá chi tiết Module Kho hàng</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Interactive Kho UI Card */}
            <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Bảng Cân Đối Kho Hàng Đa Điểm (Dữ liệu mô phỏng)
                  </h4>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    Mô phỏng 4.520 SKU • 18 Chi nhánh
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Mô phỏng chu kỳ 1.2s
                </span>
              </div>

              {/* SKU List with Progress */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">
                      Áo Polo Pique Pro (Size L - Navy) (SKU mẫu)
                    </span>
                    <span className="font-extrabold text-emerald-700">Khả dụng mẫu: 420 cái</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full w-[85%]" title="Khả dụng: 85%" />
                    <div className="bg-amber-400 h-full w-[15%]" title="Đang giữ đơn: 15%" />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                    <span>Mã: SKU-88210 (Mẫu) • Kho Tổng Tân Bình</span>
                    <span>Đã giữ chỗ: 35 cái</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-rose-200/90 shadow-xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">
                      Bàn phím cơ Silent Office V2 (SKU mẫu)
                    </span>
                    <span className="font-extrabold text-rose-600">Khả dụng mẫu: 12 cái (Thấp)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-rose-500 h-full w-[12%]" />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                    <span className="text-rose-600 font-semibold">Chạm ngưỡng an toàn Min = 20</span>
                    <button
                      type="button"
                      onClick={() => alert("Mô phỏng thao tác: Đã tạo bản ghi Đơn đề xuất nhập hàng (RFQ) mẫu!")}
                      className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition-colors"
                    >
                      + Mô phỏng tạo RFQ 150 cái
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 3: ĐƠN HÀNG ĐA SÀN */}
        {activeModule === "donhang" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-scale-up">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
                <ShoppingCart className="w-3.5 h-3.5" />
                Hội Tụ Đơn Hàng Đa Kênh OMS (Mô phỏng)
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Đồng bộ Shopee, TikTok, <br />
                <span className="text-sky-600">in mã vận chuyển nhanh chóng.</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Thiết kế gom đơn từ các sàn TMĐT về 1 màn hình duy nhất. Kết nối API với các hãng vận chuyển phổ biến tại Việt Nam.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Mô hình đồng bộ đơn từ Shopee Mall, TikTok Shop</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Hỗ trợ chọn bưu cục theo cước phí và khoảng cách giao hàng</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Mô hình đối soát COD tự động, minh bạch dòng tiền hàng</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/features/sales-order"
                  className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
                >
                  <span>Khám phá chi tiết Module Bán hàng</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Interactive Đơn Hàng UI Card */}
            <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Hàng Đợi Xử Lý Đơn Hàng (Dữ liệu mô phỏng)
                  </h4>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    248 Đơn mẫu hoàn tất • 0 Đơn lỗi
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
                  Kịch bản điều phối mẫu
                </span>
              </div>

              {/* Order Items */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-black text-xs">
                      SP
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        #ORD-9021 (Đơn mẫu) • Shopee Mall
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Khách: Trần Thị Bích (Mô phỏng) • Mã GHN mẫu: <span className="font-mono text-blue-600">GHN-8842109</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Trạng thái: Đang giao
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs">
                      TK
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        #ORD-9022 (Đơn mẫu) • TikTok Shop
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Khách: Hoàng Minh (Mô phỏng) • Giao Hỏa Tốc AhaMove
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 text-[11px] font-bold">
                    Trạng thái: Đã in phiếu
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 4: KẾ TOÁN TT 200 */}
        {activeModule === "accounting" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-scale-up">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider">
                <Receipt className="w-3.5 h-3.5" />
                Kế Toán Chuẩn Mực TT 200/133 &amp; Thuế (Mô phỏng)
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Định khoản tự động, <br />
                <span className="text-amber-600">báo cáo tài chính tức thì.</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mô phỏng hạch toán kế toán theo nguyên tắc VAS 14 &amp; IFRS 15 (khi các nghĩa vụ thực hiện đã thỏa mãn và quyền kiểm soát hàng hóa/dịch vụ đã chuyển giao cho khách hàng). Áp dụng thuế suất GTGT 8% mô phỏng theo Nghị định 174/2025/NĐ-CP &amp; Nghị quyết 204/2025/QH15 cho hàng hóa đủ điều kiện (loại trừ các nhóm ngành không được giảm thuế theo quy định).
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Sổ nhật ký chung &amp; Sổ cái định khoản kép Nợ/Có mẫu</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Mô phỏng định dạng hóa đơn điện tử máy tính tiền (Thông tư 78/2021)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Báo cáo Kết quả KD (P&amp;L) và Lưu chuyển tiền tệ mô phỏng</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/features/accounting"
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
                >
                  <span>Khám phá chi tiết Module Kế toán</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Interactive Accounting UI Card */}
            <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Sổ Nhật Ký Chung (Mô phỏng bút toán tự động)
                  </h4>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    Cân đối Nợ = Có: 1.080.000₫ (Số liệu mẫu)
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  Mô phỏng định khoản TT 200
                </span>
              </div>

              {/* Double Entry Ledger Table Preview */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                <div className="bg-slate-100/80 px-3 py-2 text-[11px] font-bold text-slate-600 grid grid-cols-12 uppercase tracking-wider">
                  <span className="col-span-3">Tài khoản</span>
                  <span className="col-span-5">Diễn giải nghiệp vụ</span>
                  <span className="col-span-2 text-right">Phát sinh Nợ</span>
                  <span className="col-span-2 text-right">Phát sinh Có</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs font-medium">
                  <div className="px-3 py-2.5 grid grid-cols-12 items-center">
                    <span className="col-span-3 font-mono font-bold text-blue-700">TK 131</span>
                    <span className="col-span-5 text-slate-700">Phải thu KH (Đơn mẫu #ORD-9021)</span>
                    <span className="col-span-2 text-right font-mono font-bold text-slate-900">1.080.000₫</span>
                    <span className="col-span-2 text-right font-mono text-slate-400">-</span>
                  </div>
                  <div className="px-3 py-2.5 grid grid-cols-12 items-center">
                    <span className="col-span-3 font-mono font-bold text-emerald-700">TK 5111</span>
                    <span className="col-span-5 text-slate-700">Doanh thu bán lẻ hàng hóa</span>
                    <span className="col-span-2 text-right font-mono text-slate-400">-</span>
                    <span className="col-span-2 text-right font-mono font-bold text-slate-900">1.000.000₫</span>
                  </div>
                  <div className="px-3 py-2.5 grid grid-cols-12 items-center bg-amber-50/40">
                    <span className="col-span-3 font-mono font-bold text-amber-700">TK 33311</span>
                    <span className="col-span-5 text-slate-700">Thuế GTGT 8% (NĐ 174/2025 đủ ĐK)</span>
                    <span className="col-span-2 text-right font-mono text-slate-400">-</span>
                    <span className="col-span-2 text-right font-mono font-bold text-amber-700">80.000₫</span>
                  </div>
                  <div className="px-3 py-2.5 grid grid-cols-12 items-center text-slate-600">
                    <span className="col-span-3 font-mono font-bold text-slate-600">TK 632 / 1561</span>
                    <span className="col-span-5 text-slate-700">Giá vốn hàng xuất kho</span>
                    <span className="col-span-2 text-right font-mono font-bold text-slate-700">620.000₫</span>
                    <span className="col-span-2 text-right font-mono font-bold text-slate-700">620.000₫</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mô phỏng định dạng hóa đơn điện tử e-Invoice &amp; chữ ký số mẫu
                </span>
                <span className="font-mono text-slate-400">Timestamp mô phỏng: 15:45:00</span>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 5: ĐA KÊNH & VẬN CHUYỂN */}
        {activeModule === "omnichannel" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-scale-up">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5" />
                Kết Nối Đa Sàn TMĐT &amp; 6 Hãng Vận Chuyển (Mô phỏng)
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Hội tụ sàn thương mại, <br />
                <span className="text-purple-600">tối ưu cước ship trong 1 click.</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Thiết kế đồng bộ Shopee, TikTok Shop, Lazada. Thuật toán so sánh cước tự động chọn hãng giao hàng dự kiến nhanh nhất và chi phí thấp nhất cho từng tuyến đường.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Mô hình Webhook HMAC SHA-256 an toàn, giữ tồn kho theo mili-giây</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Kết nối 6 hãng: GHN, GHTK, Viettel Post, SPX, AhaMove, Grab</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Quy trình đối soát COD 3 bên: Hãng ship - Sàn TMĐT - Ngân hàng</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/features/omnichannel"
                  className="inline-flex items-center gap-2 text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline"
                >
                  <span>Khám phá chi tiết Module Đa kênh</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Interactive Omnichannel UI Card */}
            <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Mô Phỏng Công Cụ So Sánh Cước &amp; Điều Phối Tuyến
                  </h4>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    Gói hàng mô phỏng 1.2kg • Tuyến HN ➔ HCM
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-purple-600" />
                  Mô phỏng so sánh cước
                </span>
              </div>

              {/* Carrier comparator list */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-purple-50/60 border-2 border-purple-500 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                      GHN
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Giao Hàng Nhanh (Express)</span>
                        <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                          Ước tính thấp nhất
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Thời gian giao dự kiến: 36h • Bưu cục lấy hàng: 14:30
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-purple-700 block">28.000₫</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">Ước tính tiết kiệm 22%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      GHTK
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Giao Hàng Tiết Kiệm (Chuẩn)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Thời gian giao dự kiến: 40h • Bưu cục lấy hàng: 16:00
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-700 block">31.000₫</span>
                    <span className="text-[10px] text-slate-400 block">+3.000₫</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                      VTP
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Viettel Post (Hỏa tốc)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Thời gian giao dự kiến: 24h • Bưu cục lấy hàng: 15:00
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-700 block">36.000₫</span>
                    <span className="text-[10px] text-slate-400 block">+8.000₫</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 6: HRM */}
        {activeModule === "hrm" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-scale-up">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <UserCheck className="w-3.5 h-3.5" />
                Quản Trị Nhân Sự &amp; Điểm Danh GPS (Mô phỏng)
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Điểm danh 1 chạm, <br />
                <span className="text-indigo-600">tính hoa hồng KPI tức thì.</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Mô hình chấm công bằng GPS Geofencing và Wifi văn phòng. Doanh số thực thu liên kết vào bảng lương của nhân sự.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Chấm công định vị bán kính GPS 200m chống gian lận</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Tự động tính hoa hồng theo đơn hoàn tất đối soát</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Phê duyệt đơn xin nghỉ phép đa cấp ngay trên di động</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/features/hrm"
                  className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  <span>Khám phá chi tiết Module Nhân sự</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Interactive HRM UI Card */}
            <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Mô Phỏng Bảng Chấm Công Thời Gian Thực
                  </h4>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    48 / 50 Nhân sự mẫu có mặt đúng giờ
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckedIn(!checkedIn)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    checkedIn
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{checkedIn ? "✓ Đã Check-in mẫu (07:58)" : "Thử nghiệm GPS (Mô phỏng)"}</span>
                </button>
              </div>

              {/* Attendance Log Items */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      VA
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Nguyễn Văn An (Nhân sự mô phỏng) • Trưởng phòng Bán lẻ
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        Check-in mẫu 07:58 • Văn phòng Keangnam HN (Hợp lệ)
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Đúng giờ
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                      TH
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Trần Hương (Nhân sự mô phỏng) • Quản lý Kho Vận Tân Bình
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        Check-in mẫu 08:02 • Kho Vận Tân Bình (Hợp lệ)
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Đúng giờ
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
