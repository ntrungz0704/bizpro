"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { CalendarDays, Plus, CheckCircle, XCircle, Clock, ShieldCheck } from "lucide-react";

export default function LeavePage() {
  const { leaveRequests, addLeaveRequest, approveLeaveRequest, rejectLeaveRequest, employees } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeName: employees[0]?.name || "Nguyễn Văn A",
    leaveType: "Nghỉ phép năm",
    startDate: "2026-11-10",
    endDate: "2026-11-11",
    days: 2,
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason) {
      alert("Vui lòng điền lý do xin nghỉ!");
      return;
    }
    addLeaveRequest(formData);
    setShowModal(false);
    setFormData({
      employeeName: employees[0]?.name || "Nguyễn Văn A",
      leaveType: "Nghỉ phép năm",
      startDate: "2026-11-10",
      endDate: "2026-11-11",
      days: 2,
      reason: "",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            Quản lý Nghỉ phép (Leave Management)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quy trình nộp đơn nghỉ phép cá nhân và bảng xét duyệt dành cho Trưởng phòng/Quản trị viên.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Gửi đơn nghỉ phép</span>
        </button>
      </div>

      {/* Quota Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Hạn mức phép năm</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">12 ngày</h3>
          <span className="text-[11px] text-slate-400">Tiêu chuẩn năm 2026</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Đã sử dụng</p>
          <h3 className="text-2xl font-bold text-slate-700 mt-1">2 ngày</h3>
          <span className="text-[11px] text-emerald-600 font-medium">Đã được phê duyệt</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Đang chờ duyệt</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">
            {leaveRequests.filter((r) => r.status === "PENDING").length * 2} ngày
          </h3>
          <span className="text-[11px] text-amber-600 font-medium">Chờ cấp trên xem xét</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm bg-gradient-to-tr from-blue-50/50 to-indigo-50/50">
          <p className="text-xs text-blue-700 font-medium">Phép còn khả dụng</p>
          <h3 className="text-2xl font-bold text-blue-800 mt-1">8 ngày</h3>
          <span className="text-[11px] text-blue-600 font-medium">Có thể đăng ký nghỉ</span>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">
            Danh sách đơn nghỉ phép cần phê duyệt
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Nhân viên</th>
                <th className="py-3 px-4">Loại nghỉ</th>
                <th className="py-3 px-4">Khoảng thời gian</th>
                <th className="py-3 px-4 text-center">Số ngày</th>
                <th className="py-3 px-4">Lý do</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Phê duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {leaveRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{req.employeeName}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{req.leaveType}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                    {req.startDate} $\rightarrow$ {req.endDate}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">{req.days}</td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{req.reason}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {req.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Chờ duyệt
                      </span>
                    )}
                    {req.status === "APPROVED" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Đã duyệt
                      </span>
                    )}
                    {req.status === "REJECTED" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                        Từ chối
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    {req.status === "PENDING" ? (
                      <>
                        <button
                          onClick={() => approveLeaveRequest(req.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Duyệt</span>
                        </button>
                        <button
                          onClick={() => rejectLeaveRequest(req.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Từ chối</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Leave */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Tạo đơn xin nghỉ phép
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nhân viên làm đơn
                </label>
                <select
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name} ({e.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Loại ngày nghỉ
                </label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="Nghỉ phép năm">Nghỉ phép năm (Có hưởng lương)</option>
                  <option value="Nghỉ ốm / Khám bệnh">Nghỉ ốm / Khám bệnh</option>
                  <option value="Nghỉ việc riêng không lương">Nghỉ việc riêng không lương</option>
                  <option value="Nghỉ chế độ cưới hỏi / tang">Nghỉ chế độ cưới hỏi / tang</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Từ ngày *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đến ngày *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tổng số ngày nghỉ *
                </label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  required
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: parseFloat(e.target.value) || 1 })}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lý do xin nghỉ *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Điền chi tiết lý do và bàn giao công việc..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                ></textarea>
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
                  Gửi đơn duyệt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
