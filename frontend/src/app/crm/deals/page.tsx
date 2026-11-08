"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { formatVND } from "@/lib/utils";
import { Plus, Target, ChevronRight, CheckCircle2, XCircle, Calendar, User, DollarSign, Loader2 } from "lucide-react";
import { crmApi, DealDto, PipelineStageDto } from "@/lib/api-client";

export default function DealsPage() {
  const { showToast } = useApp();
  const [stages, setStages] = useState<PipelineStageDto[]>([]);
  const [deals, setDeals] = useState<DealDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    amount: 50000000,
    expectedClose: "2026-11-30",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [pipelinesRes, dealsRes] = await Promise.all([
        crmApi.getPipelines(),
        crmApi.getDeals(),
      ]);

      if (pipelinesRes && pipelinesRes.length > 0) {
        setStages(pipelinesRes[0].stages || []);
      }
      if (Array.isArray(dealsRes)) {
        setDeals(dealsRes);
      }
    } catch (err: any) {
      console.warn("Could not fetch deals from backend:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Vui lòng nhập tên cơ hội kinh doanh!", "error");
      return;
    }

    try {
      const created = await crmApi.createDeal({
        title: formData.title.trim(),
        amount: Number(formData.amount),
        expectedCloseDate: formData.expectedClose,
      });

      showToast(`Đã tạo cơ hội "${created.title}" trong cơ sở dữ liệu!`, "success");
      setShowModal(false);
      setFormData({
        title: "",
        amount: 50000000,
        expectedClose: "2026-11-30",
      });
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Không thể tạo cơ hội kinh doanh";
      showToast(Array.isArray(msg) ? msg.join("; ") : msg, "error");
    }
  };

  const handleMoveStage = async (dealId: string, targetStageId: string, stageName: string) => {
    try {
      await crmApi.updateDealStage(dealId, targetStageId);
      showToast(`Đã chuyển cơ hội sang "${stageName}" (ghi nhật ký DealStageHistory)!`, "success");
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Không thể chuyển giai đoạn";
      showToast(Array.isArray(msg) ? msg.join("; ") : msg, "error");
    }
  };

  // Find next stage helper
  const getNextStage = (currentStageId: string) => {
    const currentIndex = stages.findIndex((s) => s.id === currentStageId);
    if (currentIndex >= 0 && currentIndex < stages.length - 1) {
      return stages[currentIndex + 1];
    }
    return null;
  };

  const wonStage = stages.find((s) => s.isWon);
  const lostStage = stages.find((s) => s.isLost);

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            Cơ hội kinh doanh (Pipeline Deals)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tiến trình bán hàng Kanban kết nối cơ sở dữ liệu PostgreSQL và máy trạng thái Stage Machine.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm cơ hội</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-500 text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span>Đang nạp dữ liệu Kanban từ PostgreSQL...</span>
        </div>
      ) : (
        /* Kanban Board Columns */
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start min-h-[600px]">
          {stages.map((stage) => {
            const colDeals = deals.filter((d) => d.stageId === stage.id);
            const colTotal = colDeals.reduce((sum, d) => sum + Number(d.amount), 0);

            return (
              <div
                key={stage.id}
                className="w-80 shrink-0 bg-slate-100/70 rounded-2xl p-3 border border-slate-200/60 flex flex-col max-h-[750px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        stage.isWon
                          ? "text-emerald-600"
                          : stage.isLost
                          ? "text-rose-600"
                          : "text-slate-800"
                      }`}
                    >
                      {stage.name}
                    </span>
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
                  {colDeals.map((deal) => {
                    const nextStage = getNextStage(deal.stageId);

                    return (
                      <div
                        key={deal.id}
                        className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
                      >
                        <h4 className="text-xs font-bold text-slate-900 leading-snug mb-1">
                          {deal.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium mb-2.5 truncate">
                          🏢 {deal.customer?.name || "Khách hàng chung"}
                        </p>

                        <div className="flex items-center justify-between text-xs font-bold text-blue-700 bg-blue-50/70 px-2 py-1 rounded-lg mb-2.5">
                          <span>{formatVND(Number(deal.amount))}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {deal.expectedCloseDate
                              ? `Hạn: ${new Date(deal.expectedCloseDate).toLocaleDateString("vi-VN")}`
                              : "Chưa có hạn"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {deal.assignee?.fullName || "Chưa gán"}
                          </span>

                          {/* Quick stage transition buttons */}
                          <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                            {!stage.isWon && !stage.isLost && (
                              <>
                                {nextStage && (
                                  <button
                                    title={`Chuyển sang giai đoạn tiếp theo: ${nextStage.name}`}
                                    onClick={() => handleMoveStage(deal.id, nextStage.id, nextStage.name)}
                                    className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-bold text-[10px] transition-all border border-blue-200/70 shadow-xs cursor-pointer active:scale-95"
                                  >
                                    <span>Tiếp</span>
                                    <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                                  </button>
                                )}
                                {wonStage && (
                                  <button
                                    title="Chốt thành công (Won)"
                                    onClick={() => handleMoveStage(deal.id, wonStage.id, wonStage.name)}
                                    className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 transition-all border border-emerald-200/70 shadow-xs cursor-pointer active:scale-95"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {lostStage && (
                                  <button
                                    title="Đánh dấu thất bại (Lost)"
                                    onClick={() => handleMoveStage(deal.id, lostStage.id, lostStage.name)}
                                    className="p-1 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition-all border border-rose-200/70 shadow-xs cursor-pointer active:scale-95"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                            {stage.isWon && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Thành công
                              </span>
                            )}
                            {stage.isLost && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                Thất bại
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

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
      )}

      {/* Modal Add Deal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Tạo cơ hội kinh doanh mới (PostgreSQL)
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên cơ hội kinh doanh *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Triển khai Phần mềm Quản trị Kho"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giá trị dự kiến (VNĐ)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hạn chốt dự kiến
                </label>
                <input
                  type="date"
                  value={formData.expectedClose}
                  onChange={(e) => setFormData({ ...formData, expectedClose: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  Tạo cơ hội
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
