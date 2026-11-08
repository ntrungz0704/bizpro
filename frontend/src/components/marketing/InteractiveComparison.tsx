"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  Coins,
  CheckCircle2,
  Database,
  Zap,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Flame,
  Layers,
  Sparkles,
} from "lucide-react";

export default function InteractiveComparison() {
  const [viewMode, setViewMode] = useState<"both" | "before" | "after">("both");

  const painPoints = [
    {
      id: "excel",
      title: "File Excel phân mảnh",
      impact: "Mất 4h/ngày cập nhật",
      desc: "Mỗi nhân viên giữ một phiên bản file, công thức dễ lỗi `#REF!`, số liệu không trùng khớp.",
      visual: "Excel_v3_final_final.xlsx",
      badge: "Rủi ro rò rỉ dữ liệu",
    },
    {
      id: "stock",
      title: "Lệch tồn kho & Cháy hàng",
      impact: "Hủy đơn hàng loạt",
      desc: "Sales báo còn hàng nhưng thực tế kho đã hết. Bán vượt số lượng trên Shopee/TikTok bị phạt sao quả tạ.",
      visual: "-14 Đơn bán âm",
      badge: "Mất uy tín thương hiệu",
    },
    {
      id: "manual",
      title: "Xử lý đơn thủ công",
      impact: "Sót đơn, chậm trễ",
      desc: "Copy-paste từng đơn từ sàn TMĐT vào sổ sách, nhầm lẫn địa chỉ, mất 3-4 ngày mới bàn giao bưu cục.",
      visual: "32 Đơn tồn đọng",
      badge: "Khách hủy vì chờ lâu",
    },
    {
      id: "payroll",
      title: "Tranh cãi hoa hồng KPI",
      impact: "Mất 1 tuần chốt lương",
      desc: "Cuối tháng đối soát thủ công đơn thực thu để chia hoa hồng, phát sinh khiếu nại và bất hòa nội bộ.",
      visual: "Khiếu nại hoa hồng",
      badge: "Giảm sút động lực sale",
    },
  ];

  const solutions = [
    {
      id: "single-source",
      title: "1 Nguồn dữ liệu duy nhất",
      impact: "Đồng bộ tức thời 100%",
      desc: "Hồ sơ khách hàng, công nợ, lịch sử mua sắm tập trung trên đám mây, phân quyền chặt chẽ theo chức vụ.",
      visual: "Single Source of Truth",
      badge: "Bảo mật ISO 27001",
    },
    {
      id: "atomic-stock",
      title: "Khóa kho Atomic dưới 1.2s",
      impact: "0 Lỗi bán âm trên mọi sàn",
      desc: "Tự động khóa giữ tồn kho ngay khi khách bấm đặt đơn, giảm tồn tức thì trên Shopee, TikTok và POS.",
      visual: "99.8% Tồn kho chuẩn",
      badge: "Cảnh báo Min-Max AI",
    },
    {
      id: "auto-order",
      title: "Định tuyến & In phiếu 1 chạm",
      impact: "Bàn giao trong 2 phút",
      desc: "Đơn hàng tự động điều chuyển đến kho gần nhất, tự động đẩy mã vận đơn GHN, GHTK, Viettel Post.",
      visual: "In phiếu gửi tự động",
      badge: "Tích hợp 6 hãng ship",
    },
    {
      id: "auto-kpi",
      title: "Tính lương KPI tự động",
      impact: "Chính xác từng hào VND",
      desc: "Hoa hồng gắn liền với trạng thái đơn đối soát COD thành công. Bảng lương hoàn tất chỉ bằng 1 nút bấm.",
      visual: "Bảng lương 1-Click",
      badge: "Minh bạch 100%",
    },
  ];

  return (
    <div className="w-full">
      {/* Interactive Mode Switcher */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-200/70 border border-slate-300/80 shadow-inner gap-1">
          <button
            type="button"
            onClick={() => setViewMode("both")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              viewMode === "both"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            So sánh song song
          </button>
          <button
            type="button"
            onClick={() => setViewMode("before")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              viewMode === "before"
                ? "bg-rose-50 text-rose-700 shadow-sm border border-rose-200"
                : "text-slate-600 hover:text-rose-700"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Chỉ xem Nỗi đau thủ công</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("after")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              viewMode === "after"
                ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200"
                : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Chỉ xem Giải pháp BizPro+</span>
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div
        className={`grid gap-6 transition-all duration-300 ${
          viewMode === "both"
            ? "grid-cols-1 lg:grid-cols-2"
            : "grid-cols-1 max-w-4xl mx-auto"
        }`}
      >
        {/* BEFORE BIZPRO+ PANEL */}
        {(viewMode === "both" || viewMode === "before") && (
          <div className="rounded-3xl bg-rose-50/40 border border-rose-200/80 p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-6 border-b border-rose-200/60 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-rose-950">
                      Trước khi dùng BizPro+
                    </h3>
                    <p className="text-xs text-rose-600 font-medium">
                      Phương thức thủ công & phần mềm rời rạc
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider">
                  Rủi ro cao
                </span>
              </div>

              {/* 4 Pain Cards */}
              <div className="space-y-4">
                {painPoints.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white/90 border border-rose-200/60 shadow-xs hover:shadow-md transition-all hover:border-rose-300"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        <h4 className="text-sm font-bold text-slate-900">
                          {item.title}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[11px] font-extrabold whitespace-nowrap">
                        {item.impact}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {item.desc}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <FileSpreadsheet className="w-3 h-3 text-rose-500" />
                        {item.visual}
                      </span>
                      <span className="text-rose-600 font-medium">{item.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Pain Callout */}
            <div className="mt-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-200 flex items-center gap-3 text-rose-900 text-xs font-bold">
              <Flame className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                Doanh nghiệp thất thoát từ <strong>15% - 20% doanh thu</strong> mỗi năm do sai sót dữ liệu và đứt gãy luồng xử lý đơn.
              </span>
            </div>
          </div>
        )}

        {/* AFTER BIZPRO+ PANEL */}
        {(viewMode === "both" || viewMode === "after") && (
          <div className="rounded-3xl bg-blue-50/40 border border-blue-200/80 p-6 sm:p-8 flex flex-col justify-between shadow-md">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-6 border-b border-blue-200/60 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      Khi vận hành với BizPro+
                    </h3>
                    <p className="text-xs text-blue-600 font-medium">
                      Hợp nhất thông suốt thời gian thực
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Chuẩn hóa 100%
                </span>
              </div>

              {/* 4 Solution Cards */}
              <div className="space-y-4">
                {solutions.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white/95 border border-blue-200/60 shadow-xs hover:shadow-lg transition-all hover:border-blue-400 group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-extrabold whitespace-nowrap">
                        {item.impact}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {item.desc}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-600" />
                        {item.visual}
                      </span>
                      <span className="text-emerald-700 font-semibold">{item.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Solution Callout */}
            <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-200 flex items-center gap-3 text-emerald-900 text-xs font-bold">
              <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Tăng <strong>3.4x tốc độ xử lý đơn hàng</strong>, giải phóng <strong>30+ giờ làm việc thủ công</strong> mỗi tuần cho toàn đội ngũ.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}