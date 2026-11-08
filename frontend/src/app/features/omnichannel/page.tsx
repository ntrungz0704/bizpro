"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Truck,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
  Layers,
  Zap,
  Building2,
  Barcode,
  Boxes,
  Package,
  TrendingUp,
  Store,
  Smartphone,
  Share2,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

interface ChannelOrderScenario {
  id: string;
  channelName: string;
  badgeColor: string;
  icon: string;
  orderCode: string;
  customerName: string;
  totalAmount: number;
  productName: string;
  quantity: number;
  warehouse: string;
  carrier: string;
  shippingFee: number;
  codAmount: number;
  syncLatency: string;
  steps: { title: string; status: "done" | "current" | "pending"; note: string }[];
}

const CHANNEL_SCENARIOS: ChannelOrderScenario[] = [
  {
    id: "shopee",
    channelName: "Shopee Mall",
    badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
    icon: "shopping_bag",
    orderCode: "261108SHOPEE9421",
    customerName: "Nguyễn Văn Hùng (Cầu Giấy, Hà Nội)",
    totalAmount: 1450000,
    productName: "Áo sơ mi cao cấp An Phước - Size L (AP-SM-01)",
    quantity: 2,
    warehouse: "Kho Tổng Hà Nội (Sẵn sàng: 48 → Giữ hàng: 2 → Khả dụng: 46)",
    carrier: "Giao Hàng Nhanh (GHN Express)",
    shippingFee: 28000,
    codAmount: 0,
    syncLatency: "42ms (Shopee Open API Webhook)",
    steps: [
      { title: "Đơn hàng phát sinh trên Shopee", status: "done", note: "Webhook đẩy tức thời vào BizPro+ trong 42ms" },
      { title: "Khóa giữ tồn kho tức thời (Atomic Lock)", status: "done", note: "Tự động trừ tồn khả dụng trên TikTok & Lazada để chống bán âm" },
      { title: "Đẩy vận đơn sang GHN tự động", status: "done", note: "Lấy mã vận đơn GHN #GHN8829104 và in phiếu xuất kho A6" },
      { title: "Giao vận & Cập nhật trạng thái", status: "current", note: "Bưu tá đã lấy hàng, đồng bộ định vị trực tiếp về ERP" },
      { title: "Đối soát doanh thu & Tiền về Ví", status: "pending", note: "Tự động khớp lệnh khi Shopee giải ngân sau 3 ngày" },
    ],
  },
  {
    id: "tiktok",
    channelName: "TikTok Shop",
    badgeColor: "bg-slate-900 text-white border-slate-700",
    icon: "video_library",
    orderCode: "TT-LIVE-2026-8819",
    customerName: "Lê Thị Thảo (Quận 1, TP. Hồ Chí Minh)",
    totalAmount: 890000,
    productName: "Combo Chăm sóc da chuyên sâu PharmaCare",
    quantity: 1,
    warehouse: "Kho Tân Bình - TP.HCM (Sẵn sàng: 120 → Khả dụng: 119)",
    carrier: "Giao Hàng Tiết Kiệm (GHTK)",
    shippingFee: 22000,
    codAmount: 890000,
    syncLatency: "38ms (TikTok Shop Partner API)",
    steps: [
      { title: "Chốt đơn trong phiên Livestream", status: "done", note: "Khớp đơn chốt lúc 20:45 trong phiên Mega Live" },
      { title: "Khóa giữ hàng & Phân bổ kho gần nhất", status: "done", note: "Hệ thống tự động định tuyến xuất từ Kho Tân Bình để tối ưu cước" },
      { title: "Đẩy mã vận đơn & In tem nhiệt", status: "done", note: "Mã vận đơn GHTK #S21.MN1.1092 phát sinh sau 0.8 giây" },
      { title: "Đang giao hàng COD cho khách", status: "current", note: "Thu hộ 890,000 VNĐ, tài xế đang giao lần 1" },
      { title: "Đối soát dòng tiền COD", status: "pending", note: "GHTK chuyển khoản đối soát vào thứ 3 & thứ 6 hàng tuần" },
    ],
  },
  {
    id: "lazada",
    channelName: "Lazada LazMall",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "storefront",
    orderCode: "LZD-VN-2026-5542",
    customerName: "Trần Minh Trí (Hải Châu, Đà Nẵng)",
    totalAmount: 3200000,
    productName: "Máy tính bảng học tập Tân Phát Tab Pro",
    quantity: 1,
    warehouse: "Kho Trung Chuyển Đà Nẵng (Sẵn sàng: 15 → Khả dụng: 14)",
    carrier: "Viettel Post (VTP Tiết Kiệm)",
    shippingFee: 35000,
    codAmount: 0,
    syncLatency: "55ms (Lazada Open Platform)",
    steps: [
      { title: "Đơn thanh toán trước qua VNPAY", status: "done", note: "Xác thực thanh toán thành công 100%" },
      { title: "Khóa số Serial/IMEI thiết bị", status: "done", note: "Gán đích danh Serial #TPT-2026-TAB-9912 vào phiếu xuất" },
      { title: "Đóng gói tiêu chuẩn điện tử", status: "done", note: "Kiểm tra camera đóng gói và dán niêm phong an ninh" },
      { title: "Bàn giao Bưu cục Viettel Post", status: "current", note: "Xe tải trung chuyển đang vận chuyển liên tỉnh" },
      { title: "Hoàn tất đơn & Kích hoạt bảo hành điện tử", status: "pending", note: "Tự động gửi SMS kích hoạt bảo hành điện tử sau khi nhận" },
    ],
  },
  {
    id: "wholesale",
    channelName: "Đại Lý B2B / Showroom",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    icon: "apartment",
    orderCode: "SO-B2B-2026-0311",
    customerName: "Công ty TNHH Bách Hóa Toàn Cầu",
    totalAmount: 48500000,
    productName: "Lô 50 Thùng Nước khoáng kiềm thiên nhiên Minh Long",
    quantity: 50,
    warehouse: "Kho Tổng Phía Nam (Sẵn sàng: 500 → Khả dụng: 450)",
    carrier: "Đội xe Tải Doanh Nghiệp (Xe 2.5 Tấn - 29C-88192)",
    shippingFee: 450000,
    codAmount: 0,
    syncLatency: "Nội bộ ERP (<10ms)",
    steps: [
      { title: "Duyệt đơn báo giá B2B & Hạn mức", status: "done", note: "Giám đốc Kinh doanh duyệt chiết khấu 12% theo chính sách Đại lý Cấp 1" },
      { title: "Khóa giữ tồn kho & Lập lệnh bốc dỡ", status: "done", note: "Phân bổ 50 kiện pallet tại Kệ A4 Kho Tổng" },
      { title: "Xuất kho phiếu PXK & Biên bản bàn giao", status: "done", note: "In đủ 3 liên kèm Phiếu giao hàng kiêm vận chuyển nội bộ" },
      { title: "Đang vận chuyển giao tận kho khách", status: "current", note: "Tài xế Nguyễn Văn Tuấn đang di chuyển trên tuyến QL1A" },
      { title: "Ký nhận e-POD & Phát hành hóa đơn VAT", status: "pending", note: "Ký biên bản điện tử và gửi hóa đơn điện tử TT78 qua email" },
    ],
  },
];


interface PlatformFeeConfig {
  name: string;
  paymentFeePct: number;
  fixedFeePct: number;
  serviceFeePct: number;
  badge: string;
}

const PLATFORM_CONFIGS: Record<string, PlatformFeeConfig> = {
  shopee: {
    name: "Shopee Mall",
    paymentFeePct: 2.5,
    fixedFeePct: 7.5,
    serviceFeePct: 5.0,
    badge: "bg-orange-100 text-orange-800 border-orange-200",
  },
  tiktok: {
    name: "TikTok Shop",
    paymentFeePct: 2.5,
    fixedFeePct: 6.0,
    serviceFeePct: 4.5,
    badge: "bg-slate-900 text-white border-slate-700",
  },
  lazada: {
    name: "Lazada LazMall",
    paymentFeePct: 2.5,
    fixedFeePct: 7.0,
    serviceFeePct: 4.0,
    badge: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

function PlatformFeeSimulator() {
  const [platform, setPlatform] = useState<string>("shopee");
  const [sellingPrice, setSellingPrice] = useState<number>(500000);
  const [voucherDiscount, setVoucherDiscount] = useState<number>(30000);

  const cfg = PLATFORM_CONFIGS[platform];
  const buyerPaid = Math.max(0, sellingPrice - voucherDiscount);

  const paymentFee = Math.round(buyerPaid * (cfg.paymentFeePct / 100));
  const fixedFee = Math.round(sellingPrice * (cfg.fixedFeePct / 100));
  const serviceFee = Math.round(sellingPrice * (cfg.serviceFeePct / 100));
  const totalPlatformFees = paymentFee + fixedFee + serviceFee;
  const netSellerPayout = Math.max(0, buyerPaid - totalPlatformFees);

  return (
    <div className="max-w-4xl mx-auto bg-[#F8FAFC] rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md">
      {/* Platform Selector Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {Object.entries(PLATFORM_CONFIGS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setPlatform(key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              platform === key
                ? "bg-orange-600 text-white border-orange-600 shadow-md"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Giá bán niêm yết (VNĐ):</label>
          <input
            type="number"
            step="10000"
            min="10000"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(Number(e.target.value) || 0)}
            className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-300 bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Trợ giá / Voucher người bán đồng tài trợ (VNĐ):</label>
          <input
            type="number"
            step="5000"
            min="0"
            value={voucherDiscount}
            onChange={(e) => setVoucherDiscount(Number(e.target.value) || 0)}
            className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-300 bg-white"
          />
        </div>
      </div>

      {/* Fee Breakdown Table */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3 text-xs mb-6">
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-600">Khách hàng thực trả (Sau voucher):</span>
          <span className="font-bold text-slate-900">{buyerPaid.toLocaleString("vi-VN")} đ</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-600">1. Phí thanh toán ({cfg.paymentFeePct}% trên giá khách trả):</span>
          <span className="font-bold text-rose-600">-{paymentFee.toLocaleString("vi-VN")} đ</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-600">2. Phí cố định hoa hồng ({cfg.fixedFeePct}% trên giá niêm yết):</span>
          <span className="font-bold text-rose-600">-{fixedFee.toLocaleString("vi-VN")} đ</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-600">3. Phí dịch vụ Freeship / Extra ({cfg.serviceFeePct}%):</span>
          <span className="font-bold text-rose-600">-{serviceFee.toLocaleString("vi-VN")} đ</span>
        </div>
        <div className="flex justify-between py-1.5 border-t border-slate-200">
          <span className="font-bold text-slate-800">Tổng các khoản phí sàn khấu trừ:</span>
          <span className="font-bold text-rose-700">-{totalPlatformFees.toLocaleString("vi-VN")} đ ({((totalPlatformFees / sellingPrice) * 100).toFixed(1)}%)</span>
        </div>
      </div>

      {/* Net Payout Highlight Box */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold opacity-90">Tiền Về Ví Thực Nhận (Net Payout):</div>
          <div className="text-2xl font-black mt-0.5">{netSellerPayout.toLocaleString("vi-VN")} VNĐ</div>
        </div>
        <div className="text-right text-xs opacity-90">
          <div>Tỷ lệ giữ lại: <strong>{((netSellerPayout / sellingPrice) * 100).toFixed(1)}%</strong></div>
          <div>Tự động đối soát vào TK 131 / TK 112</div>
        </div>
      </div>
    </div>
  );
}

export default function OmnichannelFeaturePage() {
  const [activeTab, setActiveTab] = useState<string>("shopee");

  const currentOrder = CHANNEL_SCENARIOS.find((o) => o.id === activeTab) || CHANNEL_SCENARIOS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-orange-100 selection:text-orange-800">
      <MarketingHeader />

            <main className="flex-1 w-full overflow-x-hidden">
        {/* Enterprise Demo Transparency Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 text-center font-medium">
          <span>
            ⚠️ <strong>Bản trình bày mô phỏng quy trình xử lý đơn hàng đa kênh &amp; Vận chuyển (Demo Simulation)</strong> — 
            Phục vụ trải nghiệm kiến trúc tích hợp Open API Shopee, TikTok Shop, Lazada và Đơn vị vận chuyển theo đặc tả kỹ thuật Phase 4B.
          </span>
        </div>
        {/* =========================================================================
            1. OMNICHANNEL HERO SECTION
            ========================================================================= */}
        <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden border-b border-slate-200/80 bg-white">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-orange-400/10 via-amber-300/10 to-transparent blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-24 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/10 via-orange-300/10 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Left Column: Hero Copy */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600">
                  <Link href="/features" className="hover:underline flex items-center gap-1">
                    <span>Tính năng</span>
                  </Link>
                  <span>&gt;</span>
                  <span className="text-slate-800">Bán Hàng Đa Kênh &amp; Vận Chuyển</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-semibold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                  <span>Đồng bộ 2 chiều Shopee • TikTok Shop • Lazada • GHTK • GHN • Viettel Post</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-[1.2] [text-wrap:balance]">
                  Hợp Nhất Đơn Hàng Đa Kênh <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    Đồng Bộ Tồn Kho Realtime Dưới 50ms
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  Quản lý tập trung toàn bộ đơn hàng từ Sàn Thương Mại Điện Tử, Livestream, Website và Đại lý B2B trên một màn hình duy nhất.
                  Cơ chế <strong className="text-slate-800">Khóa giữ tồn kho nguyên tử (Atomic Stock Reservation)</strong> triệt tiêu 100% rủi ro bán âm
                  và phạt hủy đơn từ sàn TMĐT.
                </p>

                {/* Performance Metric Badges */}
                <div className="grid grid-cols-3 gap-4 py-2 border-y border-slate-100">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">&lt; 50ms</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Đồng bộ (Mục tiêu kiến trúc)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">0 Đơn</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Bán âm (Mục tiêu thiết kế)</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">1 Click</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">In vận đơn (Khả năng thiết kế)</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 shadow-md shadow-orange-600/20 hover:shadow-lg transition-all"
                  >
                    <span>Kết nối Gian hàng Miễn phí</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#order-flow-demo"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-all"
                  >
                    <Truck className="w-4 h-4 text-orange-600" />
                    <span>Xem mô phỏng xử lý đơn</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Omnichannel Live Hub Visual */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Hub Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Omnichannel Orchestration Hub</div>
                        <div className="text-xs text-slate-400">Kết nối 6 Kênh Bán Hàng &amp; 4 Đơn Vị Giao Vận</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Live Stream
                    </span>
                  </div>

                  {/* Channel Ingestion Metrics */}
                  <div className="grid grid-cols-3 gap-2.5 my-4 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <div className="text-[11px] text-slate-400">Shopee Mall</div>
                      <div className="text-base font-bold text-orange-400 mt-0.5">342 đơn/ngày</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <div className="text-[11px] text-slate-400">TikTok Shop</div>
                      <div className="text-base font-bold text-slate-200 mt-0.5">518 đơn/ngày</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <div className="text-[11px] text-slate-400">Đại Lý B2B</div>
                      <div className="text-base font-bold text-purple-400 mt-0.5">28 đơn lớn</div>
                    </div>
                  </div>

                  {/* Live Dispatch Stream */}
                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                        <div>
                          <span className="font-semibold text-white">Shopee #261108SHOPEE9421</span>
                          <div className="text-slate-400 text-[11px]">Đã tạo mã GHN #GHN8829104 • 42ms</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                        Đã Khóa Tồn
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <div>
                          <span className="font-semibold text-white">TikTok #TT-LIVE-2026-8819</span>
                          <div className="text-slate-400 text-[11px]">Phân bổ Kho Tân Bình • COD 890k</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px]">
                        Đã In Vận Đơn
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        <div>
                          <span className="font-semibold text-white">B2B #SO-B2B-2026-0311</span>
                          <div className="text-slate-400 text-[11px]">Kho Tổng xuất 50 Pallet • Xe 2.5T</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[11px]">
                        Đang Vận Chuyển
                      </span>
                    </div>
                  </div>

                  {/* Realtime Anti-Oversell Guarantee */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Bảo vệ chống bán âm (PostgreSQL Row-Lock Invariant)
                    </span>
                    <span className="text-slate-500 font-mono">SYNC-READY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. INTERACTIVE ORDER ORCHESTRATION DEMO
            ========================================================================= */}
        <section id="order-flow-demo" className="py-16 md:py-24 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold mb-3">
                <Zap className="w-3.5 h-3.5" />
                <span>Mô Phỏng Xử Lý Đơn Hàng Thực Tế</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Luồng Điều Phối Đơn Hàng Tự Động Qua Các Kênh Bán
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2">
                Bấm chọn các kênh bán hàng bên dưới để quan sát cách BizPro+ tự động đồng bộ đơn, giữ hàng trong kho và đẩy lệnh giao vận cho đối tác vận chuyển.
              </p>
            </div>

            {/* Channel Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {CHANNEL_SCENARIOS.map((scenario) => {
                const isSelected = scenario.id === activeTab;
                return (
                  <button
                    key={scenario.id}
                    onClick={() => setActiveTab(scenario.id)}
                    className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                      isSelected
                        ? "bg-white border-orange-600 shadow-md ring-2 ring-orange-600/10"
                        : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-orange-600">KÊNH BÁN</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${scenario.badgeColor}`}>
                        {scenario.channelName}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900">{scenario.orderCode}</div>
                    <div className="text-xs text-slate-500 mt-1">{scenario.totalAmount.toLocaleString("vi-VN")} ₫</div>
                  </button>
                );
              })}
            </div>

            {/* Active Order Card View */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              {/* Order Meta Header */}
              <div className="p-6 bg-slate-50/80 border-b border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Khách hàng &amp; Địa chỉ</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{currentOrder.customerName}</div>
                  <div className="text-xs text-slate-600 mt-1">Sản phẩm: {currentOrder.productName}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 font-medium">Kho hàng phân bổ</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{currentOrder.warehouse}</div>
                  <div className="text-xs text-emerald-600 font-semibold mt-1">Độ trễ webhook: {currentOrder.syncLatency}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 font-medium">Đối tác vận chuyển</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{currentOrder.carrier}</div>
                  <div className="text-xs text-slate-600 mt-1">Cước vận chuyển: {currentOrder.shippingFee.toLocaleString("vi-VN")} ₫</div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 font-medium">Tổng tiền &amp; COD</div>
                  <div className="text-base font-bold text-orange-600 mt-0.5">{currentOrder.totalAmount.toLocaleString("vi-VN")} ₫</div>
                  <div className="text-xs text-slate-600 mt-1">
                    {currentOrder.codAmount > 0
                      ? `Thu hộ COD: ${currentOrder.codAmount.toLocaleString("vi-VN")} ₫`
                      : "Đã thanh toán Online 100%"}
                  </div>
                </div>
              </div>

              {/* 5-Step Order Flow Visualizer */}
              <div className="p-6">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
                  Tiến trình xử lý tự động theo chuẩn chuỗi cung ứng
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
                  {currentOrder.steps.map((step, idx) => {
                    const isDone = step.status === "done";
                    const isCurrent = step.status === "current";

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all ${
                          isDone
                            ? "bg-emerald-50/50 border-emerald-200"
                            : isCurrent
                            ? "bg-orange-50/60 border-orange-300 ring-2 ring-orange-400/20 shadow-sm"
                            : "bg-slate-50 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isDone
                                ? "bg-emerald-600 text-white"
                                : isCurrent
                                ? "bg-orange-600 text-white animate-pulse"
                                : "bg-slate-300 text-slate-700"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span
                            className={`text-xs font-bold ${
                              isDone ? "text-emerald-800" : isCurrent ? "text-orange-900" : "text-slate-600"
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mt-2">{step.note}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        
        {/* =========================================================================
            2.5. INTERACTIVE PLATFORM FEE & NET SETTLEMENT CALCULATOR
            ========================================================================= */}
        <section className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Mô Phỏng Tài Chính Sàn TMĐT</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Bộ Ước Tính Biểu Phí Sàn &amp; Doanh Thu Thực Nhận (Net Payout)
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2">
                Minh bạch từng dòng biểu phí sàn Shopee, TikTok Shop, Lazada (Phí thanh toán, Phí cố định, Phí Freeship Xtra) trước khi đối soát kế toán.
              </p>
            </div>

            <PlatformFeeSimulator />
          </div>
        </section>

        {/* =========================================================================
            3. CARRIER & PLATFORM ECOSYSTEM GRID
            ========================================================================= */}
        <section className="py-16 md:py-24 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Hệ Sinh Thái Kết Nối Sàn TMĐT &amp; Đơn Vị Giao Vận Hàng Đầu
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2">
                Tích hợp sẵn qua Open API chính thức. Không cài đặt plugin bên thứ ba, không rò rỉ dữ liệu khách hàng.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-5">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Đồng Bộ Tồn Kho Đa Sàn Realtime</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Khi phát sinh 1 đơn hàng trên Shopee, hệ thống ngay lập tức trừ tồn khả dụng trên TikTok Shop,
                  Lazada và Web B2B trong vòng dưới 50ms, bảo vệ chỉ số vận hành của gian hàng khỏi điểm phạt của sàn.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">So Sánh Giá Cước 4 Hãng Vận Chuyển</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tự động tính toán và so sánh cước phí giữa GHTK, GHN, Viettel Post và Ninja Van theo khối lượng và khoảng cách địa lý.
                  Gợi ý đơn vị giao nhanh nhất hoặc tiết kiệm chi phí nhất theo từng tuyến đường.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Đối Soát Tiền Thu Hộ COD Tự Động</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Nhập bảng kê đối soát từ hãng vận chuyển chỉ bằng 1 file Excel hoặc kết nối API.
                  Hệ thống tự động so khớp từng mã vận đơn, phát hiện ngay các khoản chênh lệch tiền thu hộ, cước vượt cân và phụ phí bất thường.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
                  <Barcode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">In Vận Đơn Hàng Loạt Chuẩn Khổ A6</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  In hàng trăm phiếu giao hàng, tem phụ sản phẩm và mã vạch Barcode/QR Code chỉ với 1 cú click.
                  Tương thích với mọi máy in nhiệt phổ biến (Xprinter, HPRT, Gprinter).
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
                  <Boxes className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Phân Bổ Kho Gần Khách Hàng Nhất</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tự động định tuyến đơn hàng xuất từ kho gần địa chỉ nhận nhất (Hà Nội, Đà Nẵng, TP.HCM),
                  giúp giảm thời gian giao hàng xuống dưới 24h và tiết kiệm 30% cước phí vận chuyển liên tỉnh.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Quản Lý Đơn Hoàn &amp; Bồi Thường Hàng Thất Thoát</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Kiểm soát chặt chẽ quy trình nhận hàng hoàn, tự động kiểm tra tình trạng hàng hóa trước khi nhập lại kho.
                  Lập hồ sơ khiếu nại bồi thường tự động khi bưu tá làm mất hoặc hư hỏng kiện hàng.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. BOTTOM CTA SECTION
            ========================================================================= */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-orange-950 via-slate-900 to-amber-950 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Bứt Phá Doanh Số Bán Hàng Đa Kênh Cùng BizPro+
            </h2>
            <p className="text-orange-200 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Kết nối ngay các gian hàng Shopee, TikTok Shop và Lazada của bạn hôm nay. Bắt đầu dùng thử miễn phí 14 ngày.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3.5 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-500 shadow-lg shadow-orange-600/30 transition-all flex items-center gap-2"
              >
                <span>Đăng ký Kết nối Gian hàng</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 transition-all"
              >
                Đặt lịch tư vấn tích hợp hệ thống
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
