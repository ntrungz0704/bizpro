"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Users, Plus, Search, Filter, Phone, Mail, MapPin, Building, User, FileText, Loader2, RefreshCw } from "lucide-react";
import { crmApi, CustomerDto } from "@/lib/api-client";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";

export default function CustomersPage() {
  const { customers: mockCustomers, addCustomer: addMockCustomer, showToast } = useApp();
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [showModal, setShowModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    phone: "",
    email: "",
    taxCode: "",
    type: "BUSINESS" as "BUSINESS" | "INDIVIDUAL",
    address: "",
  });

  const loadCustomers = async (showFeedback = false) => {
    try {
      if (showFeedback) setIsReloading(true);
      else setLoading(true);

      const res = await crmApi.getCustomers({ limit: 100 });
      if (res && res.items) {
        setCustomers(res.items);
      }
      if (showFeedback) {
        showToast("Đã làm mới danh sách khách hàng thành công!", "success");
      }
    } catch (err: any) {
      // Map mock customers as fallback
      setCustomers(
        mockCustomers.map((c) => ({
          id: c.id,
          customerCode: c.code,
          customerType: c.type === "Doanh nghiệp" ? "BUSINESS" : "INDIVIDUAL",
          name: c.name,
          email: c.email,
          phone: c.phone,
          address: c.address,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
          _count: { deals: 0 },
        }))
      );
    } finally {
      setLoading(false);
      setIsReloading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      code: `KH-${Math.floor(1000 + Math.random() * 9000)}`,
      name: "",
      phone: "",
      email: "",
      taxCode: "",
      type: "BUSINESS",
      address: "",
    });
    setShowModal(true);
  };

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.taxCode && c.taxCode.includes(search)) ||
      c.customerCode.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "ALL" || c.customerType === filterType;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedCustomers = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Vui lòng điền họ tên khách hàng / doanh nghiệp!", "error");
      return;
    }
    if (!formData.phone.trim()) {
      showToast("Vui lòng điền số điện thoại liên hệ!", "error");
      return;
    }

    const VN_PHONE_REGEX = /^(\+84|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9\d|2\d{1,2})[\s.-]?\d{3,4}[\s.-]?\d{3,4}$/;
    if (!VN_PHONE_REGEX.test(formData.phone.trim())) {
      showToast("Số điện thoại không đúng định dạng (+84 hoặc 0, 10 số)!", "error");
      return;
    }

    if (formData.taxCode && formData.taxCode.trim()) {
      const VN_TAX_REGEX = /^(\d{10}|\d{13}|\d{10}-\d{3})$/;
      if (!VN_TAX_REGEX.test(formData.taxCode.trim())) {
        showToast("Mã số thuế không hợp lệ. Chỉ chấp nhận 10 hoặc 13 chữ số!", "error");
        return;
      }
    }

    try {
      const payload = {
        name: formData.name.trim(),
        customerCode: formData.code,
        customerType: formData.type,
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        taxCode: formData.taxCode.trim() || undefined,
        address: formData.address.trim() || undefined,
      };

      const created = await crmApi.createCustomer(payload);
      showToast(`Đã lưu khách hàng "${created.name || payload.name}" vào cơ sở dữ liệu thật!`, "success");

      addMockCustomer({
        code: created.customerCode || payload.customerCode,
        name: created.name || payload.name,
        phone: created.phone || payload.phone,
        email: created.email || payload.email || "",
        type: payload.customerType === "BUSINESS" ? "Doanh nghiệp" : "Cá nhân",
        address: created.address || payload.address || "",
        totalSpent: 0,
        status: "ACTIVE",
      });

      setShowModal(false);
      await loadCustomers();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Không thể lưu khách hàng vào cơ sở dữ liệu";
      showToast(Array.isArray(msg) ? msg.join("; ") : msg, "error");
    }
  };

  return (
    <div className="space-y-5 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 shrink-0" />
            <span>Quản lý Khách hàng & Đối tác</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Danh sách đối tác khách hàng cá nhân và doanh nghiệp lưu trữ bền vững trong cơ sở dữ liệu PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => loadCustomers(true)}
            disabled={isReloading}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200 shadow-2xs"
            title="Làm mới dữ liệu từ PostgreSQL"
            aria-label="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isReloading ? "animate-spin text-blue-600" : ""}`} />
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm khách hàng</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, mã KH, số điện thoại, MST..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 text-xs text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 whitespace-nowrap">Phân loại:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
          >
            <option value="ALL">Tất cả ({customers.length})</option>
            <option value="BUSINESS">Doanh nghiệp</option>
            <option value="INDIVIDUAL">Cá nhân</option>
          </select>
        </div>
      </div>

      {/* Table - Responsive & Compact */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {loading && customers.length === 0 ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-500 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Đang tải danh sách khách hàng từ PostgreSQL...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3.5 whitespace-nowrap">Mã KH</th>
                  <th className="py-3 px-3.5">Tên khách hàng</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Phân loại</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Mã số thuế</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Liên hệ</th>
                  <th className="py-3 px-3.5">Địa chỉ</th>
                  <th className="py-3 px-3.5 text-right whitespace-nowrap">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-blue-600 font-mono whitespace-nowrap">{cust.customerCode}</td>
                    <td className="py-3 px-3.5 font-bold text-slate-900 max-w-[200px] truncate">{cust.name}</td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${
                          cust.customerType === "BUSINESS"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        }`}
                      >
                        {cust.customerType === "BUSINESS" ? (
                          <Building className="w-3 h-3 shrink-0" />
                        ) : (
                          <User className="w-3 h-3 shrink-0" />
                        )}
                        {cust.customerType === "BUSINESS" ? "Doanh nghiệp" : "Cá nhân"}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {cust.taxCode ? (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{cust.taxCode}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 space-y-0.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{cust.phone || "—"}</span>
                      </div>
                      {cust.email && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span>{cust.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-slate-500 max-w-[220px] truncate">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{cust.address || "—"}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap">
                        HOẠT ĐỘNG
                      </span>
                    </td>
                  </tr>
                ))}
                {paginatedCustomers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      Không tìm thấy khách hàng phù hợp.
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
          itemName="khách hàng"
        />
      </div>

      {/* PORTAL MODAL: Add Customer (Overlays 100vw x 100vh) */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Thêm khách hàng mới"
        icon={<Plus className="w-5 h-5 text-blue-600" />}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mã khách hàng
            </label>
            <input
              type="text"
              value={formData.code}
              readOnly
              className="w-full px-3 py-2 bg-slate-100 text-xs font-semibold text-slate-500 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên khách hàng / Doanh nghiệp *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Tập đoàn ABC hoặc Nguyễn Văn A"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phân loại đối tác
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="BUSINESS">Doanh nghiệp</option>
                <option value="INDIVIDUAL">Cá nhân</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại *
              </label>
              <input
                type="text"
                required
                placeholder="09... / +84..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email liên hệ
              </label>
              <input
                type="email"
                placeholder="contact@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã số thuế (MST)
              </label>
              <input
                type="text"
                placeholder="10 hoặc 13 chữ số"
                value={formData.taxCode}
                onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Địa chỉ trụ sở / Giao dịch
            </label>
            <input
              type="text"
              placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
              Lưu khách hàng
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
