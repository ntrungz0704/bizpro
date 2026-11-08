"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { UserCheck, Plus, Search, Mail, Phone, Building2, Briefcase, RefreshCw, Loader2 } from "lucide-react";
import { hrmApi } from "@/lib/api-client";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";

export default function EmployeesPage() {
  const { employees: mockEmployees, showToast } = useApp();
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    departmentId: "",
    positionId: "",
    email: "",
    phone: "",
    status: "OFFICIAL",
    hireDate: "2026-01-15",
  });

  const loadData = async (showFeedback = false) => {
    setLoading(true);
    try {
      const [empRes, deptRes, posRes] = await Promise.all([
        hrmApi.getEmployees({ limit: 100 }).catch(() => null),
        hrmApi.getDepartments().catch(() => null),
        hrmApi.getPositions().catch(() => null),
      ]);

      if (empRes?.items && empRes.items.length > 0) {
        setEmployees(
          empRes.items.map((e: any) => ({
            id: e.id,
            code: e.employeeCode,
            name: e.fullName,
            department: e.department?.name || "Chưa phân bổ",
            position: e.position?.name || "Chuyên viên",
            email: e.email,
            phone: e.phone,
            hireDate: e.hireDate ? new Date(e.hireDate).toISOString().split("T")[0] : "2026-01-15",
            status: e.employmentStatus,
          })),
        );
      } else {
        setEmployees(mockEmployees);
      }

      if (Array.isArray(deptRes) && deptRes.length > 0) {
        setDepartments(deptRes);
      }
      if (Array.isArray(posRes) && posRes.length > 0) {
        setPositions(posRes);
      }

      if (showFeedback) {
        showToast("Đã làm mới danh sách nhân sự thành công!", "success");
      }
    } catch {
      showToast("Không thể tải danh sách nhân sự!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      code: `NV-${Math.floor(100 + Math.random() * 900)}`,
      name: "",
      departmentId: departments[0]?.id || "",
      positionId: positions[0]?.id || "",
      email: "",
      phone: "",
      status: "OFFICIAL",
      hireDate: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.code.toLowerCase().includes(search.toLowerCase()) ||
      (e.department && e.department.toLowerCase().includes(search.toLowerCase())) ||
      (e.position && e.position.toLowerCase().includes(search.toLowerCase())),
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedEmployees = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Vui lòng điền họ và tên nhân viên!", "error");
      return;
    }

    if (formData.phone && formData.phone.trim()) {
      const VN_PHONE_REGEX = /^(\+84|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9\d|2\d{1,2})[\s.-]?\d{3,4}[\s.-]?\d{3,4}$/;
      if (!VN_PHONE_REGEX.test(formData.phone.trim())) {
        showToast("Số điện thoại không đúng định dạng (+84 hoặc 0, 10 số)!", "error");
        return;
      }
    }

    if (formData.email && formData.email.trim()) {
      const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!EMAIL_REGEX.test(formData.email.trim())) {
        showToast("Email không đúng định dạng!", "error");
        return;
      }
    }

    try {
      await hrmApi.createEmployee({
        employeeCode: formData.code,
        fullName: formData.name.trim(),
        departmentId: formData.departmentId || undefined,
        positionId: formData.positionId || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        employmentStatus: formData.status,
        hireDate: formData.hireDate,
      });

      showToast(`Đã tiếp nhận nhân sự "${formData.name}" vào cơ sở dữ liệu thật!`, "success");
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Không thể tiếp nhận nhân sự";
      showToast(Array.isArray(msg) ? msg.join("; ") : msg, "error");
    }
  };

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600 shrink-0" />
            <span>Hồ sơ Nhân sự & Phòng ban</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị danh sách nhân sự, chức danh công việc, phòng ban và tình trạng hợp đồng lao động.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => loadData(true)}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-2xs"
            title="Làm mới dữ liệu từ PostgreSQL"
            aria-label="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tiếp nhận nhân viên</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên nhân viên, mã NV, phòng ban..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 text-xs text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table - Responsive & Compact */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {loading && employees.length === 0 ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-500 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Đang tải danh sách nhân sự từ PostgreSQL...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3.5 whitespace-nowrap">Mã NV</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Họ và tên</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Phòng ban</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Chức vụ</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Thông tin liên lạc</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Ngày gia nhập</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-blue-600 whitespace-nowrap">{emp.code}</td>
                    <td className="py-3 px-3.5 font-bold text-slate-900 flex items-center gap-2 whitespace-nowrap">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                        {emp.name ? emp.name.charAt(0) : "N"}
                      </div>
                      <span>{emp.name}</span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{emp.department}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{emp.position}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3.5 space-y-0.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{emp.email}</span>
                      </div>
                      {emp.phone && (
                        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{emp.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap font-mono">{emp.hireDate}</td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap">
                        {emp.status === "OFFICIAL" ? "CHÍNH THỨC" : emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {paginatedEmployees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      Không tìm thấy nhân viên nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemName="nhân sự"
        />
      </div>

      {/* PORTAL MODAL: Add Employee (Overlays 100vw x 100vh) */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tiếp nhận nhân sự mới"
        icon={<Plus className="w-5 h-5 text-blue-600" />}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã nhân viên *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày gia nhập
              </label>
              <input
                type="date"
                required
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Họ và tên đầy đủ *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Nguyễn Văn B..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phòng ban
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chức danh / Vị trí
              </label>
              <select
                value={formData.positionId}
                onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              >
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email doanh nghiệp
              </label>
              <input
                type="email"
                placeholder="user@bizpro.vn"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                placeholder="09..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
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
              Lưu hồ sơ nhân sự
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
