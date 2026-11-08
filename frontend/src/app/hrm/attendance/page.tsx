"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Clock, CheckCircle2, LogOut, LogIn, Calendar, UserCheck, RefreshCw } from "lucide-react";
import { hrmApi } from "@/lib/api-client";

export default function AttendancePage() {
  const { attendance: mockAttendance, employees: mockEmployees, showToast } = useApp();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDateStr, setCurrentDateStr] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [attRes, empRes] = await Promise.all([
        hrmApi.getAttendance().catch(() => null),
        hrmApi.getEmployees().catch(() => null),
      ]);

      if (attRes?.items && attRes.items.length > 0) {
        setAttendance(
          attRes.items.map((a: any) => ({
            id: a.id,
            employeeName: a.employee?.fullName || "Nhân viên",
            date: a.workDate ? new Date(a.workDate).toISOString().split("T")[0] : "",
            checkIn: a.checkInAt
              ? new Date(a.checkInAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })
              : "--:--",
            checkOut: a.checkOutAt
              ? new Date(a.checkOutAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })
              : "--:--",
            status: a.status,
          })),
        );
      } else {
        setAttendance(mockAttendance);
      }

      if (empRes?.items && empRes.items.length > 0) {
        setEmployees(empRes.items);
        setSelectedEmpId(empRes.items[0]?.id || "");
      } else {
        setEmployees(mockEmployees);
        setSelectedEmpId(mockEmployees[0]?.id || "");
      }
    } catch {
      setAttendance(mockAttendance);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("vi-VN", { hour12: false }));
      setCurrentDateStr(
        now.toLocaleDateString("vi-VN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = async () => {
    try {
      await hrmApi.checkIn({ source: "WEB_UI" });
      showToast("Check-in thành công! Giờ vào ca đã được ghi nhận vào PostgreSQL.", "success");
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Lỗi khi Check-in";
      showToast(Array.isArray(msg) ? msg.join(", ") : msg, "error");
    }
  };

  const handleCheckOut = async () => {
    try {
      await hrmApi.checkOut({});
      showToast("Check-out thành công! Giờ ra về đã được đối soát.", "success");
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Lỗi khi Check-out";
      showToast(Array.isArray(msg) ? msg.join(", ") : msg, "error");
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Chấm công & Điểm danh
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận giờ vào làm (Check-in) và giờ ra về (Check-out) trực tiếp trên giao diện hệ thống (Dữ liệu thực PostgreSQL).
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all self-start sm:self-center"
          title="Tải lại dữ liệu"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
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
            Ca làm việc tiêu chuẩn: <b>08:30 - 17:30</b> (Nghỉ trưa 60 phút - Múi giờ Asia/Ho_Chi_Minh)
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto pt-3 sm:pt-0">
            <button
              onClick={handleCheckIn}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition-transform active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Check-in Vào ca</span>
            </button>

            <button
              onClick={handleCheckOut}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/30 transition-transform active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Check-out Tan ca</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            Nhật ký Chấm công Hôm nay & Gần đây
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[180px] whitespace-nowrap">Nhân viên</th>
                <th className="py-3 px-4 min-w-[120px] whitespace-nowrap">Ngày</th>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Giờ vào (Check-in)</th>
                <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Giờ ra (Check-out)</th>
                <th className="py-3 px-4 min-w-[120px] whitespace-nowrap">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {attendance.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2 whitespace-nowrap min-w-[180px]">
                    <UserCheck className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{row.employeeName}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap min-w-[120px]">{row.date}</td>
                  <td className="py-3 px-4 font-mono font-medium text-emerald-600 whitespace-nowrap min-w-[140px]">{row.checkIn}</td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-600 whitespace-nowrap min-w-[140px]">{row.checkOut}</td>
                  <td className="py-3 px-4 whitespace-nowrap min-w-[120px]">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                        row.status === "PRESENT"
                          ? "bg-emerald-100 text-emerald-800"
                          : row.status === "LATE"
                          ? "bg-amber-100 text-amber-800"
                          : row.status === "EARLY_LEAVE"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {row.status === "PRESENT"
                        ? "ĐÚNG GIỜ"
                        : row.status === "LATE"
                        ? "ĐI MUỘN"
                        : row.status === "EARLY_LEAVE"
                        ? "VỀ SỚM"
                        : row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                    Chưa có lượt chấm công nào trong ngày.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
