"use client";

import React, { useState } from "react";
import { useApp, Deal } from "@/context/AppContext";
import { formatVND } from "@/lib/utils";
import { Plus, Target, ChevronRight, CheckCircle2, XCircle, Calendar, User, DollarSign } from "lucide-react";

const STAGES: { key: Deal["stage"]; title: string; color: string; bg: string }[] = [
  { key: "New", title: "Mới tạo", color: "text-blue-600", bg: "bg-blue-50" },
  { key: "Contacted", title: "Đã liên hệ", color: "text-sky-600", bg: "bg-sky-50" },
  { key: "Qualified", title: "Xác định nhu cầu", color: "text-teal-600", bg: "bg-teal-50" },
  { key: "Proposal", title: "Gửi báo giá", color: "text-indigo-600", bg: "bg-indigo-50" },
  { key: "Negotiation", title: "Đang đàm phán", color: "text-amber-600", bg: "bg-amber-50" },
  { key: "Won", title: "Chốt thành công", color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "Lost", title: "Thất bại", color: "text-rose-600", bg: "bg-rose-50" },
];

export default function DealsPage() {
  const { deals, addDeal, moveDealStage, customers } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    customerName: customers[0]?.name || "",
    amount: 50000000,
    stage: "New" as Deal["stage"],
    expectedClose: "2026-11-30",
    assignedTo: "Trần Văn Sales",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert("Vui lòng nhập tên cơ hội!");
      return;
    }
    addDeal(formData);
    setShowModal(false);
    setFormData({
      title: "",
      customerName: customers[0]?.name || "",
      amount: 50000000,
      stage: "New",
      expectedClose: "2026-11-30",
      assignedTo: "Trần Văn Sales",
    });
  };

  const nextStageMap: Record<Deal["stage"], Deal["stage"]> = {
    New: "Contacted",
    Contacted: "Qualified",
    Qualified: "Proposal",
    Proposal: "Negotiation",
    Negotiation: "Won",
    Won: "Won",
    Lost: "Lost",
  };

  return (
    <div className="space-y-6 max-w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            Cơ hội kinh doanh (Pipeline Deals)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tiến trình bán hàng và quản trị tỷ lệ chuyển đổi qua các giai đoạn.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm cơ hội</span>
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[600px]">
        {STAGES.map((col) => {
          const colDeals = deals.filter((d) => d.stage === col.key);
          const colTotal = colDeals.reduce((sum, d) => sum + d.amount, 0);

          return (
            <div
              key={col.key}
              className="w-80 shrink-0 bg-slate-100/70 rounded-2xl p-3 border border-slate-200/60 flex flex-col max-h-[750px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${col.color}`}>{col.title}</span>
                  <span className="w-5 h-5 rounded-full bg-white text-slate-600 text-[11px] font-bold flex items-center justify-center shadow-xs">
                    {colDeals.length}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">
                  {colTotal > 0 ? `${(colTotal / 1000000).toFixed(0)}tr` : "0đ"}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {colDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
                  >
                    <h4 className="text-xs font-bold text-slate-900 leading-snug mb-1">
                      {deal.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mb-2.5 truncate">
                      🏢 {deal.customerName}
                    </p>

                    <div className="flex items-center justify-between text-xs font-bold text-blue-700 bg-blue-50/70 px-2 py-1 rounded-lg mb-2.5">
                      <span>{formatVND(deal.amount)}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Hạn: {deal.expectedClose}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {deal.assignedTo}
                      </span>

                      {/* Quick stage transition buttons */}
                      <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                        {col.key !== "Won" && col.key !== "Lost" && (
                          <>
                            <button
                              title={`Chuyển sang giai đoạn tiếp theo: ${nextStageMap[deal.stage]}`}
                              onClick={() => moveDealStage(deal.id, nextStageMap[deal.stage])}
                              className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-bold text-[10px] transition-all border border-blue-200/70 shadow-xs cursor-pointer active:scale-95"
                            >
                              <span>Tiếp</span>
                              <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                            </button>
                            <button
                              title="Chốt thành công (Won)"
                              onClick={() => moveDealStage(deal.id, "Won")}
                              className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 transition-all border border-emerald-200/70 shadow-xs cursor-pointer active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Đánh dấu thất bại (Lost)"
                              onClick={() => moveDealStage(deal.id, "Lost")}
                              className="p-1 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition-all border border-rose-200/70 shadow-xs cursor-pointer active:scale-95"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {col.key === "Won" && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Thành công
                          </span>
                        )}
                        {col.key === "Lost" && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                            Thất bại
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {colDeals.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                    Chưa có cơ hội
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Deal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Tạo cơ hội kinh doanh mới
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên cơ hội / Dự án *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Triển khai 20 máy trạm cho ngân hàng"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Khách hàng</label>
                <select
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giá trị dự kiến (VND) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000000}
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giai đoạn khởi điểm
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) =>
                      setFormData({ ...formData, stage: e.target.value as Deal["stage"] })
                    }
                    className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dự kiến chốt
                  </label>
                  <input
                    type="date"
                    value={formData.expectedClose}
                    onChange={(e) => setFormData({ ...formData, expectedClose: e.target.value })}
                    className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phụ trách
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all"
                >
                  Lưu cơ hội
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
