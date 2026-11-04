"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Clock, CheckCircle2, LogOut, LogIn, Calendar, UserCheck } from "lucide-react";

export default function AttendancePage() {
  const { attendance, checkIn, checkOut, employees } = useApp();
  const [selectedEmp, setSelectedEmp] = useState(employees[0]?.name || "Nguyễn Văn A");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDateStr, setCurrentDateStr] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("vi-VN", { hour12: false }));
      setCurrentDateStr(
        now.toLocaleDateString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Chấm công & Điểm danh
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận giờ vào làm (Check-in) và giờ ra về (Check-out) trực tiếp trên giao diện hệ thống.
          </p>
        </div>
      </div>

      {/* Interactive Punch In/Out Card */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span
            suppressHydrationWarning
            className="text-xs font-semibold px-3 py-1 bg-white/20 rounded-full inline-block backdrop-blur-xs"
          >
            Hôm nay: {currentDateStr || "Đang tải ngày..."}
          </span>
          <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight">
            {currentTime || "08:30:00"}
          </div>
          <p className="text-xs text-blue-100">
            Ca làm việc tiêu chuẩn: <b>08:00 - 17:30</b> (Nghỉ trưa 60 phút)
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-56">
            <label className="block text-[11px] text-blue-100 mb-1 font-medium">
              Chọn nhân viên chấm công:
            </label>
            <select
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
              className="w-full px-3 py-2 bg-white text-slate-800 font-bold rounded-xl text-xs focus:outline-none shadow-xs"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.name}>
                  {e.name} ({e.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto pt-3 sm:pt-4">
            <button
              onClick={() => checkIn(selectedEmp)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition-transform active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Check-in</span>
            </button>

            <button
              onClick={() => checkOut(selectedEmp)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/30 transition-transform active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Check-out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Nhật ký điểm danh hôm nay
          </h3>
          <span className="text-xs text-slate-400">
            Tổng số lượt ghi nhận: <b>{attendance.length}</b>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Mã NV</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Ngày làm việc</th>
                <th className="py-3 px-4 text-center">Giờ vào (Check-in)</th>
                <th className="py-3 px-4 text-center">Giờ ra (Check-out)</th>
                <th className="py-3 px-4 text-center">Tình trạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {attendance.map((att) => (
                <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    {att.employeeCode}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{att.employeeName}</td>
                  <td className="py-3.5 px-4 text-slate-600">{att.date}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600">
                    {att.checkIn}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                    {att.checkOut || "--:--:--"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Đúng giờ
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
