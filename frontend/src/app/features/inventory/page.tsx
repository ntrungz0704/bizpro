"use client";

import React from "react";
import Link from "next/link";
import {
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Boxes,
  Barcode,
  Truck,
  Warehouse,
  Play,
  Star,
  Zap,
  Check,
  Search,
  Building2,
  Rocket,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function InventoryFeaturePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-emerald-100 selection:text-emerald-800">
      <MarketingHeader />

      <main className="flex-1 w-full overflow-x-hidden">
        {/* =========================================================================
            1. INVENTORY HERO SECTION (100% Vietnamese)
            ========================================================================= */}
        <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-emerald-400/10 via-sky-300/10 to-transparent blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-24 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/10 via-emerald-300/10 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              
              {/* Left Column: Hero Text */}
              <div className="lg:col-span-6 space-y-6 text-left">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <Link href="/features" className="hover:underline flex items-center gap-1">
                    <span>Tính năng</span>
                  </Link>
                  <span>&gt;</span>
                  <span className="text-slate-800">Quản Trị Kho Vận (Inventory)</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-[1.2] [text-wrap:balance]">
                  Quản Trị Kho Hàng Thông Minh, <br className="hidden sm:inline" />
                  <span className="text-emerald-600">Khóa Tồn Thời Gian Thực</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                  Kiểm soát chính xác từng mã SKU trên toàn chuỗi phân phối. 
                  Tự động giữ hàng theo đơn bán, triệt tiêu 100% tình trạng bán âm và cảnh báo chạm ngưỡng an toàn.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
                  >
                    <span>Trải nghiệm Kho Vận miễn phí</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>

                  <Link
                    href="/demo"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold shadow-2xs transition-all hover:-translate-y-0.5"
                  >
                    <Play className="w-4 h-4 mr-2 fill-slate-700 text-slate-700" />
                    <span>Xem video mô phỏng</span>
                  </Link>
                </div>

                <div className="pt-6 border-t border-slate-200/70 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">0%</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Tỷ lệ bán âm hàng</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">100%</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Khớp số liệu thẻ kho</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">&lt; 1 Phút</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Thời gian xuất phiếu</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Warehouse Mockup Card */}
              <div className="lg:col-span-6 relative">
                <div className="relative mx-auto max-w-[640px] rounded-2xl bg-white p-4 sm:p-6 shadow-[0_20px_50px_rgba(16,185,129,0.08)] border border-emerald-100 transition-all">
                  
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Warehouse className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800">Kho Trung Tâm Miền Bắc (Hà Nội)</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                      Đang đồng bộ trực tuyến
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Tổng mã SKU</div>
                      <div className="text-lg font-extrabold text-slate-900 mt-0.5">1,450</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Tồn thực tế</div>
                      <div className="text-lg font-extrabold text-slate-900 mt-0.5">48,200</div>
                    </div>
                    <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                      <div className="text-[11px] text-blue-700 font-medium">Đã khóa giữ</div>
                      <div className="text-lg font-extrabold text-blue-900 mt-0.5">3,850</div>
                    </div>
                    <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                      <div className="text-[11px] text-emerald-700 font-medium">Khả dụng bán</div>
                      <div className="text-lg font-extrabold text-emerald-900 mt-0.5">44,350</div>
                    </div>
                  </div>

                  {/* Stock Level Bars */}
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-800">Cà phê Arabica Cầu Đất 500g</span>
                        <span className="text-slate-500">Tồn: 1,500 / Giữ: 300</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                        <div className="bg-blue-600 h-full" style={{ width: "20%" }} />
                        <div className="bg-emerald-500 h-full" style={{ width: "80%" }} />
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-800">Sữa tươi thanh trùng tiệt trùng 1L</span>
                        <span className="text-slate-500">Tồn: 3,200 / Giữ: 850</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                        <div className="bg-blue-600 h-full" style={{ width: "26%" }} />
                        <div className="bg-emerald-500 h-full" style={{ width: "74%" }} />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            2. MULTI-WAREHOUSE MANAGEMENT
            ========================================================================= */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                Mạng Lưới Đa Điểm
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Quản lý không giới hạn kho bãi & chi nhánh
              </h2>
              <p className="text-slate-600 text-base">
                Theo dõi số liệu tồn kho riêng biệt cho từng điểm bán lẻ, kho tổng và thực hiện phiếu điều chuyển nội bộ chỉ trong 1 thao tác.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                  <Warehouse className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">Kho Tổng Miền Bắc (Hà Nội)</h4>
                <p className="text-xs text-slate-500 mb-4">Sức chứa 500 Pallet • Tiếp nhận hàng nhập khẩu trực tiếp.</p>
                <div className="flex justify-between text-xs pt-3 border-t border-slate-200">
                  <span className="text-slate-500">Mã kho:</span>
                  <span className="font-bold text-slate-900">WH-HN-01</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <Warehouse className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">Kho Tổng Miền Nam (TP.HCM)</h4>
                <p className="text-xs text-slate-500 mb-4">Sức chứa 650 Pallet • Trung tâm điều phối khu vực Đông Nam Bộ.</p>
                <div className="flex justify-between text-xs pt-3 border-t border-slate-200">
                  <span className="text-slate-500">Mã kho:</span>
                  <span className="font-bold text-slate-900">WH-HCM-01</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                  <Truck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">Điều Chuyển Nội Bộ</h4>
                <p className="text-xs text-slate-500 mb-4">Tự động cân bằng lượng hàng tồn giữa các kho để tối ưu cước vận chuyển.</p>
                <div className="flex justify-between text-xs pt-3 border-t border-slate-200">
                  <span className="text-slate-500">Quy trình:</span>
                  <span className="font-bold text-amber-600">Phiếu chuyển kho 2 chiều</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. PRODUCT CATALOG & SKU MANAGEMENT
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                  Danh Mục Sản Phẩm
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Chuẩn hóa mã SKU, quét mã vạch và định mức quy cách
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Quản lý đầy đủ hình ảnh sản phẩm, quy cách đóng gói (thùng, lốc, hộp, gói), giá vốn nhập hàng và giá bán niêm yết theo từng nhóm đối tượng khách hàng.
                </p>
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Hỗ trợ in nhãn mã vạch (Barcode / QR Code) trực tiếp từ hệ thống</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Phân loại danh mục đa cấp: Ngành hàng, Thương hiệu, Đơn vị tính</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Link
                    href="/inventory/products"
                    className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <span>Khám phá màn hình Sản Phẩm trong ứng dụng</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
                <div className="text-xs font-bold text-slate-800 pb-3 border-b border-slate-100 mb-3">
                  Bảng Thông Tin Hàng Hóa Chuẩn
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Trà Oolong Thượng Hạng 250g</div>
                      <div className="text-[11px] text-slate-500">Mã SKU: TEA-OOL-250 • ĐVT: Hộp</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">185.000 đ</div>
                      <div className="text-[10px] text-emerald-600">Giá vốn: 110.000 đ</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Nước Khoáng Tinh Khiết 500ml</div>
                      <div className="text-[11px] text-slate-500">Mã SKU: WTR-500 • ĐVT: Thùng 24 chai</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">120.000 đ</div>
                      <div className="text-[10px] text-emerald-600">Giá vốn: 75.000 đ</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. STOCK IN / STOCK OUT (RECEIPTS & ISSUES)
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                Phiếu Xuất Nhập Kho
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Minh bạch từng chứng từ giao nhận hàng hóa
              </h2>
              <p className="text-slate-600 text-base">
                Mọi lần biến động hàng hóa đều gắn liền với một phiếu nhập hoặc xuất có đầy đủ chữ ký, thủ kho thực hiện và lý do chứng từ.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>Phiếu Nhập Kho (Stock Receipt)</span>
                  </h4>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Tăng tồn kho
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tạo phiếu nhập từ nhà cung cấp hoặc nhập thu hồi hàng trả lại từ khách hàng. Cập nhật ngay giá vốn bình quân gia quyền.
                </p>
                <div className="pt-2 text-xs font-semibold text-slate-500">
                  Ví dụ: Nhập 500 thùng từ Công ty Nước Giải Khát Tân Hiệp
                </div>
              </div>

              <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span>Phiếu Xuất Kho (Stock Issue)</span>
                  </h4>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    Giảm tồn kho
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tự động sinh ra khi đơn hàng chuyển sang trạng thái Đóng Gói Kho hoặc xuất tiêu hủy hàng hết hạn sử dụng theo biên bản.
                </p>
                <div className="pt-2 text-xs font-semibold text-slate-500">
                  Ví dụ: Xuất giao đơn hàng #SO-2026-001 cho Khách Việt An
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. REAL-TIME STOCK RESERVATION
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC] border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                  Công Nghệ Độc Quyền
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Cơ chế khóa giữ tồn kho tự động (Tránh bán âm 100%)
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Khi khách đặt hàng online hoặc nhân viên kinh doanh tạo đơn, hệ thống sẽ tự động khóa số lượng đó lại. 
                  Cửa hàng khác hoặc nhân viên khác sẽ không thể bán trùng sản phẩm đó, loại bỏ hoàn toàn tình trạng phải gọi điện hủy đơn xin lỗi khách hàng.
                </p>
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
                  <strong>Công thức tính:</strong> Tồn Khả Dụng = Tồn Kho Thực Tế - Số Lượng Đã Khóa Giữ
                </div>
              </div>

              <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
                <h4 className="text-xs font-bold text-slate-800 mb-3">Mô phỏng Khóa Tồn Kho Khi Lập Đơn</h4>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">1. Đơn #SO-101 Đang Nháp</div>
                      <div className="text-[11px] text-slate-500">Chưa xác nhận</div>
                    </div>
                    <span className="text-slate-500 font-bold">Chưa giữ hàng</span>
                  </div>

                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-blue-900">2. Đơn #SO-101 Được Duyệt</div>
                      <div className="text-[11px] text-blue-700">Chuyển sang "Đã xác nhận"</div>
                    </div>
                    <span className="text-blue-700 font-bold">Tự động giữ 50 sản phẩm</span>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-900">3. Đơn Xuất Kho Hoàn Tất</div>
                      <div className="text-[11px] text-emerald-700">Hàng đã giao cho shipper</div>
                    </div>
                    <span className="text-emerald-700 font-bold">Trừ tồn thực tế chính thức</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. STOCKTAKING & RECONCILIATION
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Kiểm Kê Kho Bãi
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4">
              Cân bằng kho nhanh chóng, đối soát lệch tồn chính xác
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto mb-10">
              Hỗ trợ kiểm kê định kỳ theo kệ hàng. Thủ kho nhập số lượng đếm thực tế, hệ thống tự tính số chênh lệch thừa/thiếu và tạo phiếu điều chỉnh tự động.
            </p>

            <div className="max-w-4xl mx-auto bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200 text-left">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4 text-xs font-bold text-slate-700">
                <span>Biên Bản Kiểm Kê #ST-2026-01 (Kho Hà Nội)</span>
                <span className="text-emerald-600">Trạng thái: Đã hoàn tất cân bằng</span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-xs font-semibold text-slate-500 pb-2 border-b border-slate-100">
                <div>Mã Sản Phẩm</div>
                <div>Số Trên Máy</div>
                <div>Thực Tế Đếm</div>
                <div className="text-right">Chênh Lệch</div>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="grid grid-cols-4 gap-4 py-2.5 items-center">
                  <span className="font-bold text-slate-900">Bánh quy bơ hộp thiếc</span>
                  <span>100 hộp</span>
                  <span className="font-bold text-slate-800">100 hộp</span>
                  <span className="text-right text-slate-500">Khớp 100%</span>
                </div>
                <div className="grid grid-cols-4 gap-4 py-2.5 items-center">
                  <span className="font-bold text-slate-900">Kẹo socola hạnh nhân</span>
                  <span>50 gói</span>
                  <span className="font-bold text-slate-800">48 gói</span>
                  <span className="text-right text-red-600 font-bold">-2 gói (Lệch thiếu)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. LOW-STOCK ALERTS & AUTO REORDERING
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 pb-3 border-b border-slate-100">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>3 Sản Phẩm Chạm Ngưỡng Tồn Tối Thiểu</span>
                </div>
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">Dầu ăn thực vật 5L</div>
                    <div className="text-[11px] text-slate-500">Ngưỡng an toàn: 20 can • Hiện còn: 4 can</div>
                  </div>
                  <button className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg text-[10px]">
                    Lập Đơn Đặt Hàng
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                  Cảnh Báo Thông Minh
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Chủ động nguồn hàng, không bao giờ để kệ hàng trống rỗng
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Thiết lập ngưỡng tồn tối thiểu cho từng mặt hàng. Khi tồn kho giảm xuống dưới ngưỡng, hệ thống tự động gửi thông báo cho bộ phận thu mua để đặt hàng nhà cung ứng kịp thời.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. INVENTORY VALUATION (FIFO / AVERAGE)
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Định Giá Tài Sản Kho
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Phương pháp định giá tồn kho chuẩn kế toán Việt Nam
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Hỗ trợ tự động tính giá vốn theo phương pháp Bình Quân Gia Quyền và Nhập Trước Xuất Trước (FIFO), đảm bảo số liệu báo cáo tài chính luôn hợp lệ khi quyết toán thuế.
            </p>
          </div>
        </section>

        {/* =========================================================================
            9. WAREHOUSE OPERATIONS FLOW (4 Steps)
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC] border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                Quy Trình Kho Chuẩn
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Vận hành kho bãi tinh gọn 4 bước
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center mx-auto mb-3">
                  1
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Nhập Kho & Quét Mã</h4>
                <p className="text-xs text-slate-500 mt-1">Kiểm đếm hàng nhận từ nhà cung cấp và dán mã vạch lưu kho.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center mx-auto mb-3">
                  2
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Sắp Xếp Vị Trí Kệ</h4>
                <p className="text-xs text-slate-500 mt-1">Gán hàng vào vị trí tầng/kệ để thủ kho tìm kiếm nhanh nhất.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center mx-auto mb-3">
                  3
                </span>
                <h4 className="font-bold text-slate-900 text-sm">Nhặt Hàng & Đóng Gói</h4>
                <p className="text-xs text-slate-500 mt-1">Xuất hàng theo đơn bán, kiểm tra đúng quy cách và dán nhãn vận đơn.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center mx-auto mb-3">
                  4
                </span>
                <h4 className="font-bold text-emerald-800 text-sm">Đối Soát Định Kỳ</h4>
                <p className="text-xs text-slate-500 mt-1">Kiểm kê số liệu thực tế cuối tuần, đảm bảo độ chính xác tuyệt đối.</p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            10. ENTERPRISE SECURITY & AUDIT
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Kiểm Soát Thất Thoát
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Thẻ kho điện tử không thể xóa hay chỉnh sửa gian lận
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Mọi giao dịch xuất, nhập, điều chỉnh đều lưu lại dấu vết kiểm toán với mã nhân viên và địa chỉ IP thực hiện. 
              Ban giám đốc có thể truy vết bất kỳ sai sót nào trong vòng 10 giây.
            </p>
          </div>
        </section>

        {/* =========================================================================
            11. FINAL CTA SECTION
            ========================================================================= */}
        <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Chấm dứt hoàn toàn nỗi lo thất thoát kho bãi ngay hôm nay
            </h2>
            <p className="text-emerald-100 text-base sm:text-lg max-w-2xl mx-auto">
              Trải nghiệm hệ thống quản trị kho bãi thế hệ mới cùng hơn 10.000 doanh nghiệp Việt Nam.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-full bg-white text-emerald-700 text-sm font-bold shadow-xl hover:bg-emerald-50 transition-all hover:scale-105"
              >
                Dùng thử 14 ngày miễn phí
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 rounded-full bg-emerald-800/60 hover:bg-emerald-800 text-white text-sm font-bold border border-white/20 transition-all"
              >
                Đặt lịch tư vấn giải pháp kho
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
