"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { UserCheck, Plus, Search, UserPlus, Phone, Mail, Building2, Loader2, RefreshCw } from "lucide-react";
import { crmApi, LeadDto } from "@/lib/api-client";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";

export default function LeadsPage() {
  const { showToast } = useApp();
  const [leads, setLeads] = useState<LeadDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formData, setFormData] = useState({
    contactName: "",
    companyName: "",
    phone: "",
    email: "",
    source: "Facebook",
    status: "NEW" as const,
    assignedTo: "",
  });

  const loadLeads = async (showFeedback = false) => {
    try {
      if (showFeedback) setIsReloading(true);
      else setLoading(true);

      const res = await crmApi.getLeads({ limit: 100 });
      if (res && res.items) {
        setLeads(res.items);
      }
      if (showFeedback) {
        showToast("Đã làm mới danh sách khách hàng tiềm năng thành công!", "success");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Không thể tải danh sách Leads!", "error");
    } finally {
      setLoading(false);
      setIsReloading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const filtered = leads.filter(
    (l) =>
      l.contactName.toLowerCase().includes(search.toLowerCase()) ||
      (l.companyName && l.companyName.toLowerCase().includes(search.toLowerCase())) ||
      (l.phone && l.phone.includes(search))
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedLeads = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contactName.trim()) {
      showToast("Vui lòng nhập tên người liên hệ!", "error");
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
        showToast("Địa chỉ email không đúng định dạng!", "error");
        return;
      }
    }

    try {
      const created = await crmApi.createLead({
        contactName: formData.contactName.trim(),
        companyName: formData.companyName.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        source: formData.source,
      });

      showToast(`Đã thêm Lead "${created.contactName}" vào cơ sở dữ liệu thật!`, "success");
      setShowModal(false);
      setFormData({
        contactName: "",
        companyName: "",
        phone: "",
        email: "",
        source: "Facebook",
        status: "NEW",
        assignedTo: "",
      });
      await loadLeads();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Không thể tạo Lead";
      showToast(Array.isArray(msg) ? msg.join("; ") : msg, "error");
    }
  };

  const handleConvertLead = async (leadId: string) => {
    try {
      setConvertingId(leadId);
      const res = await crmApi.convertLead(leadId);
      showToast(
        `Chuyển đổi thành công! Đã tạo Khách hàng "${res.customer?.name || 'mới'}" và Cơ hội bán hàng trong 1 giao dịch.`,
        "success"
      );
      await loadLeads();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Không thể chuyển đổi Lead";
      showToast(Array.isArray(msg) ? msg.join("; ") : msg, "error");
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600 shrink-0" />
            <span>Khách hàng tiềm năng (Leads)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị nguồn đầu vào cơ hội bán hàng và chuyển đổi tự động 1-transaction vào PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => loadLeads(true)}
            disabled={isReloading}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-2xs"
            title="Làm mới dữ liệu từ PostgreSQL"
            aria-label="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isReloading ? "animate-spin text-blue-600" : ""}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Lead mới</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên liên hệ, công ty, SĐT..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 text-xs text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table - Responsive & Compact */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {loading && leads.length === 0 ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-500 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Đang tải danh sách Leads từ PostgreSQL...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3.5 whitespace-nowrap">Người liên hệ</th>
                  <th className="py-3 px-3.5">Đơn vị / Doanh nghiệp</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Thông tin liên lạc</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Nguồn Lead</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Phụ trách</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Trạng thái</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">{lead.contactName}</td>
                    <td className="py-3 px-3.5 text-slate-700 max-w-[200px] truncate">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{lead.companyName || "Cá nhân"}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3.5 space-y-0.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{lead.phone || "—"}</span>
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 font-medium whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                        {lead.source || "Trực tiếp"}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 font-medium whitespace-nowrap">
                      {lead.assignee?.fullName || "Chưa phân công"}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {lead.status === "CONVERTED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Đã chuyển đổi
                        </span>
                      ) : lead.status === "NEW" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                          Mới tiếp nhận
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          {lead.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      {lead.status !== "CONVERTED" ? (
                        <button
                          onClick={() => handleConvertLead(lead.id)}
                          disabled={convertingId === lead.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          {convertingId === lead.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserPlus className="w-3.5 h-3.5" />
                          )}
                          <span>{convertingId === lead.id ? "Đang xử lý..." : "Chuyển đổi"}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Đã là khách hàng</span>
                      )}
                    </td>
                  </tr>
                ))}
                {paginatedLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      Không tìm thấy Lead phù hợp.
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
          itemName="khách hàng tiềm năng"
        />
      </div>

      {/* PORTAL MODAL: Add Lead (Overlays 100vw x 100vh) */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Thêm khách hàng tiềm năng mới"
        icon={<Plus className="w-5 h-5 text-blue-600" />}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Họ tên người liên hệ *
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Lê Tuấn Anh"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên công ty / Doanh nghiệp
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Công ty TNHH Giải Pháp Số..."
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="lead@company.vn"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nguồn tiếp cận Lead
            </label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="Facebook">Facebook Ads / Fanpage</option>
              <option value="Google">Google Tìm kiếm / SEO</option>
              <option value="Website">Website Form đăng ký</option>
              <option value="Referral">Khách hàng giới thiệu</option>
              <option value="Direct">Tiếp cận trực tiếp / Hội thảo</option>
            </select>
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
              Lưu khách hàng tiềm năng
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
