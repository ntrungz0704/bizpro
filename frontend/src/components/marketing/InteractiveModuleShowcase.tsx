"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Target,
  Warehouse,
  Package,
  ShoppingCart,
  Truck,
  UserCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
  BarChart3,
  ShieldCheck,
  MapPin,
  QrCode,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function InteractiveModuleShowcase() {
  const [activeModule, setActiveModule] = useState<"crm" | "kho" | "donhang" | "hrm">("crm");
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
      badge: "Khóa tồn 1.2s",
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
      id: "hrm" as const,
      name: "HRM & Lương thưởng",
      icon: UserCheck,
      badge: "GPS Geofencing",
      highlightColor: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
  ];

  return (
    <div className="w-full">
      {/* Tab Selectors */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {modules.map((m) => {
          const Icon = m.icon;
          const isActive = activeModule === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveModule(m.id)}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all duration-200 cursor-pointer whitespace-nowrap ${
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
                Phân hệ Quản trị Quan hệ Khách hàng 360°
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Nuôi dưỡng khách hàng, <br />
                <span className="text-blue-600">bứt phá tỷ lệ chốt sales.</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tự động thu thập Lead từ Zalo OA, Facebook Ads, Website và phân bổ thông minh cho nhân viên kinh doanh.
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
                  <span>Dự báo doanh số (Sales Forecast) bằng AI</span>
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
                    Phễu Cơ Hội Kinh Doanh (Tháng này)
                  </h4>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    Tổng giá trị: 4.200.000.000₫
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  24 Cơ hội mở
                </span>
              </div>

              {/* 3 Funnel Steps */}
              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                <div className="p-3 rounded-xl bg-white border border-slate-200/70 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-medium block">Tiếp cận mới (12)</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">1.25 Tỷ ₫</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/70 shadow-xs">
                  <span className="text-[11px] text-blue-700 font-medium block">Đàm phán báo giá (8)</span>
                  <span className="text-sm font-bold text-blue-700 mt-0.5 block">2.10 Tỷ ₫</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/70 shadow-xs">
                  <span className="text-[11px] text-emerald-700 font-medium block">Đã chốt ký (4)</span>
                  <span className="text-sm font-bold text-emerald-700 mt-0.5 block">850 Tr ₫</span>
                </div>
              </div>

              {/* Live Deal Item */}
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white border-l-4 border-l-blue-600 border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Công ty CP V-Style Việt Nam
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Gói Enterprise 18 chi nhánh • Phụ trách: Hoàng Việt
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[11px] font-bold">
                    Chờ duyệt hợp đồng
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white border-l-4 border-l-emerald-500 border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Tập đoàn Dược phẩm PharmaGroup
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Dự án Quản trị Kho Đa Điểm • Phụ trách: Lê Hoàng Mai
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                    Ký thành công (Won)
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
                Quản Trị Kho Vận & Khóa Tồn Atomic
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Kiểm soát tồn kho đa điểm, <br />
                <span className="text-emerald-600">triệt tiêu hoàn toàn bán âm.</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Cơ chế Double-entry ledger giữ hàng theo mili-giây. Đồng bộ số lượng tồn chính xác lên Shopee, TikTok Shop và điểm bán lẻ POS.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Quản lý chuỗi đa kho: Tổng kho & cửa hàng vệ tinh</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cảnh báo tồn kho Min-Max & Gợi ý nhập hàng tự động</span>
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
                    Bảng Cân Đối Kho Hàng Đa Điểm
                  </h4>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    Tổng 4.520 SKU • 18 Chi nhánh
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Sync 1.2s
                </span>
              </div>

              {/* SKU List with Progress */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">
                      Áo Polo Pique Pro (Size L - Navy)
                    </span>
                    <span className="font-extrabold text-emerald-700">Khả dụng: 420 cái</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full w-[85%]" title="Khả dụng: 85%" />
                    <div className="bg-amber-400 h-full w-[15%]" title="Đang giữ đơn: 15%" />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                    <span>Mã: SKU-88210 • Kho Tổng Tân Bình</span>
                    <span>Đã giữ chỗ: 35 cái</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-rose-200/90 shadow-xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">
                      Bàn phím cơ Silent Office V2
                    </span>
                    <span className="font-extrabold text-rose-600">Khả dụng: 12 cái (Thấp)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-rose-500 h-full w-[12%]" />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                    <span className="text-rose-600 font-semibold">Chạm ngưỡng an toàn Min = 20</span>
                    <button
                      type="button"
                      onClick={() => alert("Đã tự động tạo Đơn đề xuất nhập hàng (RFQ) cho nhà cung cấp!")}
                      className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition-colors"
                    >
                      + Tạo lệnh nhập 150 cái
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
                Hội Tụ Đơn Hàng Đa Kênh (OMS)
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Đồng bộ Shopee, TikTok, <br />
                <span className="text-sky-600">in mã vận chuyển trong 2 giây.</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tự động gom đơn từ các sàn TMĐT về 1 màn hình duy nhất. Kết nối API trực tiếp với 6 hãng vận chuyển hàng đầu Việt Nam.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Đồng bộ tức thời không độ trễ từ Shopee Mall, TikTok Shop</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Tự động chọn bưu cục tối ưu cước và khoảng cách giao hàng</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Đối soát COD tự động, triệt tiêu thất thoát tiền hàng</span>
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
                    Hàng Đợi Xử Lý Đơn Hàng Hôm Nay
                  </h4>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    248 Đơn hoàn tất • 0 Đơn lỗi
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
                  Auto-fulfillment ON
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
                        #ORD-9021 • Shopee Mall
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Khách: Trần Thị Bích • Mã GHN: <span className="font-mono text-blue-600">GHN-8842109</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Đang giao hàng
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs">
                      TK
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        #ORD-9022 • TikTok Shop
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Khách: Hoàng Minh • Giao Hỏa Tốc AhaMove
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 text-[11px] font-bold">
                    Đã in phiếu gửi
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 4: HRM */}
        {activeModule === "hrm" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-scale-up">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <UserCheck className="w-3.5 h-3.5" />
                Quản Trị Nhân Sự & Điểm Danh GPS
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Điểm danh 1 chạm, <br />
                <span className="text-indigo-600">tính hoa hồng KPI tức thì.</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Chấm công chính xác bằng GPS Geofencing và Wifi văn phòng. Doanh số thực thu liên kết trực tiếp vào bảng lương của nhân sự.
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
                    Bảng Chấm Công Hôm Nay (Trực tiếp)
                  </h4>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    48 / 50 Nhân sự có mặt đúng giờ
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
                  <span>{checkedIn ? "✓ Đã Check-in (07:58)" : "Chấm công GPS thử"}</span>
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
                        Nguyễn Văn An • Trưởng phòng Bán lẻ
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        Check-in 07:58 • Văn phòng Keangnam HN (Hợp lệ)
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
                        Trần Hương • Quản lý Kho Vận Tân Bình
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        Check-in 08:02 • Kho Vận Tân Bình (Hợp lệ)
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