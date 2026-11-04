"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Settings, Shield, History, Building, Save, Check } from "lucide-react";

export default function SettingsPage() {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<"ORG" | "RBAC" | "AUDIT">("ORG");

  // Organization settings form
  const [orgForm, setOrgForm] = useState({
    name: "Công ty Cổ phần Giải pháp Doanh nghiệp BizPro+",
    code: "BIZPRO-CORP",
    taxCode: "0109988776",
    currency: "VND",
    timezone: "Asia/Ho_Chi_Minh (GMT+7)",
    address: "Tòa nhà Keangnam Landmark 72, Phạm Hùng, Cầu Giấy, Hà Nội",
  });

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Đã lưu cập nhật thông tin tổ chức thành công!");
  };

  // Mock Audit Logs
  const auditLogs = [
    {
      id: "log1",
      action: "CONFIRM",
      entity: "SalesOrder",
      code: "SO-2026-0042",
      user: "Nguyễn Văn A (Admin)",
      time: "2026-11-04 14:15:30",
      ip: "192.168.1.10",
    },
    {
      id: "log2",
      action: "POST",
      entity: "StockReceipt",
      code: "NK-2026-0234",
      user: "Nguyễn Văn B (Thủ kho)",
      time: "2026-11-04 13:45:12",
      ip: "192.168.1.15",
    },
    {
      id: "log3",
      action: "CONVERT",
      entity: "Lead",
      code: "L-0912",
      user: "Trần Văn Sales",
      time: "2026-11-04 11:20:05",
      ip: "192.168.1.22",
    },
    {
      id: "log4",
      action: "LOGIN",
      entity: "UserSession",
      code: "USR-001",
      user: "Nguyễn Văn A (Admin)",
      time: "2026-11-04 08:15:20",
      ip: "192.168.1.10",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Cấu hình & Quản trị Hệ thống
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập thông tin tổ chức, phân quyền vai trò (RBAC) và nhật ký kiểm toán (Audit Logs).
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("ORG")}
          className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all border-b-2 ${
            activeTab === "ORG"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building className="w-4 h-4" />
          Hồ sơ Tổ chức
        </button>

        <button
          onClick={() => setActiveTab("RBAC")}
          className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all border-b-2 ${
            activeTab === "RBAC"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Shield className="w-4 h-4" />
          Vai trò & Phân quyền (RBAC)
        </button>

        <button
          onClick={() => setActiveTab("AUDIT")}
          className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all border-b-2 ${
            activeTab === "AUDIT"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-4 h-4" />
          Nhật ký Kiểm toán (Audit Logs)
        </button>
      </div>

      {/* Tab 1: Organization Settings Form */}
      {activeTab === "ORG" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-3xl">
          <form onSubmit={handleSaveOrg} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên doanh nghiệp / Công ty
              </label>
              <input
                type="text"
                required
                value={orgForm.name}
                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                className="w-full px-3 py-2 text-xs font-semibold text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã tổ chức
                </label>
                <input
                  type="text"
                  readOnly
                  value={orgForm.code}
                  className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-500 bg-slate-100 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã số thuế (Tax Code)
                </label>
                <input
                  type="text"
                  value={orgForm.taxCode}
                  onChange={(e) => setOrgForm({ ...orgForm, taxCode: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiền tệ hiển thị
                </label>
                <input
                  type="text"
                  value={orgForm.currency}
                  readOnly
                  className="w-full px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Múi giờ hệ thống
                </label>
                <input
                  type="text"
                  value={orgForm.timezone}
                  readOnly
                  className="w-full px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ trụ sở chính
              </label>
              <input
                type="text"
                value={orgForm.address}
                onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === "RBAC" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-2">
            Vai trò hệ thống & Ma trận quyền năng
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Được phân giải theo cấu trúc: <code>&lt;module&gt;.&lt;resource&gt;.&lt;action&gt;</code> kết hợp phạm vi dữ liệu (Scope: <b>OWN</b> | <b>DEPARTMENT</b> | <b>ALL</b>).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                role: "Organization Admin",
                badge: "bg-purple-100 text-purple-800",
                desc: "Toàn quyền quản trị tổ chức, người dùng, vai trò và toàn bộ dữ liệu.",
                count: "66/66 Quyền (Scope: ALL)",
              },
              {
                role: "Sales Staff",
                badge: "bg-blue-100 text-blue-800",
                desc: "Tạo và chăm sóc Lead, Khách hàng, cơ hội kinh doanh và lập đơn bán hàng.",
                count: "18 Quyền (Scope: OWN)",
              },
              {
                role: "Warehouse Manager",
                badge: "bg-amber-100 text-amber-800",
                desc: "Quản lý xuất nhập tồn kho, đăng sổ chứng từ và kiểm kê điều chỉnh kho.",
                count: "24 Quyền (Scope: ALL kho)",
              },
            ].map((r) => (
              <div key={r.role} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.badge}`}>
                  {r.role}
                </span>
                <p className="text-xs text-slate-600 mt-2 mb-3 leading-relaxed">{r.desc}</p>
                <span className="text-[11px] font-semibold text-slate-900 block border-t border-slate-200 pt-2">
                  {r.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === "AUDIT" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">
              Nhật ký kiểm toán hệ thống (Audit Trail)
            </h3>
            <p className="text-xs text-slate-400">
              Ghi nhận bất biến mọi thao tác quan trọng liên quan đến đơn hàng, kho và khách hàng.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Hành động</th>
                  <th className="py-3 px-4">Đối tượng</th>
                  <th className="py-3 px-4">Mã tham chiếu</th>
                  <th className="py-3 px-4">Người thực hiện</th>
                  <th className="py-3 px-4">Địa chỉ IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 font-mono">
                    <td className="py-3 px-4 text-slate-500 font-sans">{log.time}</td>
                    <td className="py-3 px-4 font-bold text-blue-600">{log.action}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{log.entity}</td>
                    <td className="py-3 px-4 text-slate-700">{log.code}</td>
                    <td className="py-3 px-4 font-sans text-slate-800">{log.user}</td>
                    <td className="py-3 px-4 text-slate-400">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
