"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { CalendarDays, Plus, CheckCircle, XCircle, Clock, ShieldCheck, RefreshCw } from "lucide-react";
import { hrmApi } from "@/lib/api-client";

export default function LeavePage() {
  const { leaveRequests: mockRequests, showToast } = useApp();
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "2026-11-20",
    endDate: "2026-11-21",
    days: 2,
    reason: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqRes, typeRes, balRes] = await Promise.all([
        hrmApi.getLeaveRequests().catch(() => null),
        hrmApi.getLeaveTypes().catch(() => null),
        hrmApi.getMyLeaveBalances().catch(() => null),
      ]);

      if (reqRes?.items && reqRes.items.length > 0) {
        setLeaveRequests(
          reqRes.items.map((r: any) => ({
            id: r.id,
            employeeName: r.employee?.fullName || "Nhân viên",
            leaveType: r.leaveType?.name || "Nghỉ phép năm",
            startDate: r.startDate ? new Date(r.startDate).toISOString().split("T")[0] : "",
            endDate: r.endDate ? new Date(r.endDate).toISOString().split("T")[0] : "",
            days: Number(r.totalDays),
            reason: r.reason,
            status: r.status,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : "",
          })),
        );
      } else {
        setLeaveRequests(mockRequests);
      }

      if (Array.isArray(typeRes) && typeRes.length > 0) {
        setLeaveTypes(typeRes);
        setFormData((prev) => ({ ...prev, leaveTypeId: prev.leaveTypeId || typeRes[0].id }));
      }

      if (Array.isArray(balRes) && balRes.length > 0) {
        setBalances(balRes);
      }
    } catch {
      setLeaveRequests(mockRequests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const alBalance = balances.find((b) => b.leaveTypeCode === "AL") || {
    entitledDays: 12,
    usedDays: leaveRequests.filter((r) => r.status === "APPROVED").reduce((sum, r) => sum + r.days, 0),
    pendingDays: leaveRequests.filter((r) => r.status === "PENDING").reduce((sum, r) => sum + r.days, 0),
    availableDays: 12,
  };

  const approvedDays = alBalance.usedDays;
  const pendingDays = alBalance.pendingDays;
  const availableDays = alBalance.availableDays ?? Math.max(0, 12 - approvedDays - pendingDays);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason) {
      showToast("Vui lòng điền lý do xin nghỉ phép!", "error");
      return;
    }

    try {
      await hrmApi.createLeaveRequest({
        leaveTypeId: formData.leaveTypeId || leaveTypes[0]?.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalDays: formData.days,
        reason: formData.reason,
      });
      showToast("Gửi đơn nghỉ phép thành công! Đang chờ phê duyệt.", "success");
      setShowModal(false);
      setFormData({
        leaveTypeId: leaveTypes[0]?.id || "",
        startDate: "2026-11-20",
        endDate: "2026-11-21",
        days: 2,
        reason: "",
      });
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Lỗi khi gửi đơn xin nghỉ phép";
      showToast(Array.isArray(msg) ? msg.join(", ") : msg, "error");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await hrmApi.approveLeaveRequest(id);
      showToast("Phê duyệt đơn nghỉ phép thành công! Số dư phép đã được cập nhật.", "success");
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Lỗi khi phê duyệt";
      showToast(Array.isArray(msg) ? msg.join(", ") : msg, "error");
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Nhập lý do từ chối đơn nghỉ phép:");
    if (!reason) return;
    try {
      await hrmApi.rejectLeaveRequest(id, reason);
      showToast("Đã từ chối đơn nghỉ phép và hoàn trả số dư chờ duyệt.", "success");
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Lỗi khi từ chối";
      showToast(Array.isArray(msg) ? msg.join(", ") : msg, "error");
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            Quản lý Nghỉ phép (Leave Management)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quy trình nộp đơn nghỉ phép cá nhân và bảng xét duyệt dành cho Trưởng phòng/Quản trị viên (Khóa bi quan chống double-spending).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Gửi đơn nghỉ phép</span>
          </button>
        </div>
      </div>

      {/* Quota Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Hạn mức phép năm</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{alBalance.entitledDays} ngày</h3>
          <span className="text-[11px] text-slate-400">Tiêu chuẩn năm 2026 (BLLĐ 2019)</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Đã sử dụng</p>
          <h3 className="text-2xl font-bold text-slate-700 mt-1">{approvedDays} ngày</h3>
          <span className="text-[11px] text-emerald-600 font-medium">Đã được phê duyệt</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Đang chờ duyệt</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingDays} ngày</h3>
          <span className="text-[11px] text-amber-600 font-medium">Khóa tạm thời (Pending)</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm bg-gradient-to-tr from-blue-50/50 to-indigo-50/50">
          <p className="text-xs text-blue-700 font-medium">Phép còn khả dụng</p>
          <h3 className="text-2xl font-bold text-blue-800 mt-1">{availableDays} ngày</h3>
          <span className="text-[11px] text-blue-600 font-medium">Có thể đăng ký nghỉ</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Danh sách Đơn xin nghỉ phép
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Nhân viên</th>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Loại nghỉ phép</th>
                <th className="py-3 px-4 min-w-[200px] whitespace-nowrap">Thời gian</th>
                <th className="py-3 px-4 min-w-[100px] whitespace-nowrap">Số ngày</th>
                <th className="py-3 px-4 min-w-[200px]">Lý do</th>
                <th className="py-3 px-4 min-w-[120px] whitespace-nowrap">Trạng thái</th>
                <th className="py-3 px-4 min-w-[140px] text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {leaveRequests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap min-w-[160px]">{r.employeeName}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap min-w-[140px]">{r.leaveType}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap min-w-[200px]">
                    {r.startDate} <span className="text-slate-400">→</span> {r.endDate}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap min-w-[100px]">{r.days} ngày</td>
                  <td className="py-3.5 px-4 text-slate-500 min-w-[200px]">{r.reason}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap min-w-[120px]">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                        r.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : r.status === "REJECTED"
                          ? "bg-rose-100 text-rose-800"
                          : r.status === "CANCELLED"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {r.status === "APPROVED"
                        ? "ĐÃ DUYỆT"
                        : r.status === "REJECTED"
                        ? "TỪ CHỐI"
                        : r.status === "CANCELLED"
                        ? "ĐÃ HỦY"
                        : "CHỜ DUYỆT"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap min-w-[140px]">
                    {r.status === "PENDING" && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                          title="Duyệt đơn"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Duyệt</span>
                        </button>
                        <button
                          onClick={() => handleReject(r.id)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                          title="Từ chối đơn"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Từ chối</span>
                        </button>
                      </div>
                    )}
                    {r.status !== "PENDING" && (
                      <span className="text-[11px] text-slate-400 italic">Đã hoàn tất</span>
                    )}
                  </td>
                </tr>
              ))}
              {leaveRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    Chưa có đơn nghỉ phép nào được tạo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Gửi đơn xin nghỉ phép mới</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Loại nghỉ phép</label>
                <select
                  value={formData.leaveTypeId}
                  onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {leaveTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Hạn mức: {Number(t.annualQuota)} ngày)
                    </option>
                  ))}
                  {leaveTypes.length === 0 && <option value="">Nghỉ phép năm (AL)</option>}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Từ ngày</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Đến ngày</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Số ngày đăng ký</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Lý do xin nghỉ</label>
                <textarea
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Giải quyết việc cá nhân, gia đình..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-md shadow-blue-600/20"
                >
                  Gửi đơn phê duyệt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
