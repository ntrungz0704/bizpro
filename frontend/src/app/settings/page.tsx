"use client";

import React, { useState, useEffect } from "react";
import { useApp, OrgProfile, AuditLog } from "@/context/AppContext";
import {
  Settings,
  Shield,
  History,
  Building,
  Save,
  RotateCcw,
  Check,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Lock,
  Eye,
  KeyRound,
  FileSpreadsheet,
} from "lucide-react";

export default function SettingsPage() {
  const {
    orgProfile,
    updateOrgProfile,
    resetOrgProfile,
    auditLogs,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"ORG" | "RBAC" | "AUDIT">("ORG");

  // Controlled form state bound to orgProfile
  const [formData, setFormData] = useState<OrgProfile>(orgProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(orgProfile);
  }, [orgProfile]);

  // Strict Validation Helpers
  const isValidTaxCode = (val: string) => {
    const cleaned = (val || "").trim();
    return /^(\d{10}|\d{13}|\d{10}-\d{3})$/.test(cleaned);
  };

  const isValidPhone = (val: string) => {
    const cleaned = (val || "").trim();
    return /^(\+84|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9\d|2\d{1,2})[\s.-]?\d{3,4}[\s.-]?\d{3,4}$/.test(cleaned);
  };

  const isValidEmail = (val: string) => {
    const cleaned = (val || "").trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
  };

  const isValidOrgCode = (val: string) => {
    const cleaned = (val || "").trim().toUpperCase();
    return /^[A-Z0-9_-]+$/.test(cleaned);
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Tên doanh nghiệp / Công ty không được để trống!";
    }

    if (!formData.code?.trim()) {
      newErrors.code = "Mã tổ chức không được để trống!";
    } else if (!isValidOrgCode(formData.code)) {
      newErrors.code = "Mã tổ chức chỉ chấp nhận chữ in hoa, chữ số và gạch ngang (-)!";
    }

    if (!formData.taxCode?.trim()) {
      newErrors.taxCode = "Mã số thuế không được để trống!";
    } else if (!isValidTaxCode(formData.taxCode)) {
      newErrors.taxCode = "Mã số thuế không hợp lệ! Chỉ gồm 10 hoặc 13 chữ số (ví dụ: 0109988776 hoặc 0109988776-001). Không được chứa chữ cái hay ký tự đặc biệt.";
    }

    const phoneStr = (formData.phone || "").trim();
    if (!phoneStr) {
      newErrors.phone = "Số điện thoại không được để trống!";
    } else if (!isValidPhone(phoneStr)) {
      newErrors.phone = "Số điện thoại không đúng định dạng Việt Nam! Hợp lệ: +84 hoặc đầu số 03, 05, 07, 08, 09 hoặc mã vùng 02x gồm 10-11 số.";
    }

    const emailStr = (formData.email || "").trim();
    if (!emailStr) {
      newErrors.email = "Email liên hệ chính thức không được để trống!";
    } else if (!isValidEmail(emailStr)) {
      newErrors.email = "Email liên hệ chính thức không đúng định dạng!";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      showToast(firstError, "error");
      return;
    }

    setIsSaving(true);
    try {
      await updateOrgProfile(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetOrg = async () => {
    if (confirm("Bạn có chắc chắn muốn khôi phục hồ sơ doanh nghiệp về mặc định ban đầu trong PostgreSQL?")) {
      await resetOrgProfile();
      setErrors({});
    }
  };

  const handleTabChange = (tab: "ORG" | "RBAC" | "AUDIT") => {
    setActiveTab(tab);
  };

  // RBAC State
  const [selectedRole, setSelectedRole] = useState<string>("ORG_ADMIN");
  const [rbacModuleFilter, setRbacModuleFilter] = useState<string>("ALL");

  const rolesList = [
    {
      id: "ORG_ADMIN",
      name: "Organization Admin",
      badge: "bg-purple-100 text-purple-800 border-purple-200",
      desc: "Toàn quyền quản trị tổ chức, thành viên, cấu hình và toàn bộ dữ liệu.",
      scope: "Phạm vi: ALL (Toàn tổ chức)",
      permissionsCount: "66/66 Quyền hạn",
    },
    {
      id: "SALES_STAFF",
      name: "Sales Staff",
      badge: "bg-blue-100 text-blue-800 border-blue-200",
      desc: "Tạo và chăm sóc Lead, Khách hàng, cơ hội kinh doanh và lập đơn bán hàng.",
      scope: "Phạm vi: OWN (Phụ trách trực tiếp)",
      permissionsCount: "18/66 Quyền hạn",
    },
    {
      id: "WAREHOUSE_MGR",
      name: "Warehouse Manager",
      badge: "bg-amber-100 text-amber-800 border-amber-200",
      desc: "Quản lý xuất nhập tồn kho, đăng sổ chứng từ và kiểm kê điều chỉnh kho.",
      scope: "Phạm vi: ALL Kho hàng",
      permissionsCount: "24/66 Quyền hạn",
    },
    {
      id: "HR_MGR",
      name: "HR Manager",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
      desc: "Quản lý hồ sơ nhân sự, bảng chấm công điểm danh và phê duyệt đơn nghỉ phép.",
      scope: "Phạm vi: ALL Phòng ban",
      permissionsCount: "20/66 Quyền hạn",
    },
  ];

  const permissionsMatrix = [
    { module: "CRM", code: "crm.customers.read", name: "Xem danh sách khách hàng", roles: ["ORG_ADMIN", "SALES_STAFF", "WAREHOUSE_MGR", "HR_MGR"] },
    { module: "CRM", code: "crm.customers.write", name: "Thêm & cập nhật khách hàng", roles: ["ORG_ADMIN", "SALES_STAFF"] },
    { module: "CRM", code: "crm.leads.convert", name: "Chuyển đổi Lead thành Khách hàng", roles: ["ORG_ADMIN", "SALES_STAFF"] },
    { module: "CRM", code: "crm.deals.manage", name: "Quản trị cơ hội (Pipeline Deals)", roles: ["ORG_ADMIN", "SALES_STAFF"] },
    { module: "Sales", code: "sales.orders.create", name: "Lập đơn bán hàng (Nháp)", roles: ["ORG_ADMIN", "SALES_STAFF"] },
    { module: "Sales", code: "sales.orders.confirm", name: "Xác nhận & Giữ kho (Reserved)", roles: ["ORG_ADMIN", "SALES_STAFF"] },
    { module: "Sales", code: "sales.orders.fulfill", name: "Xuất kho giao hàng (Fulfill)", roles: ["ORG_ADMIN", "WAREHOUSE_MGR"] },
    { module: "Sales", code: "sales.orders.cancel", name: "Hủy đơn & Hoàn trả giữ kho", roles: ["ORG_ADMIN", "SALES_STAFF"] },
    { module: "Inventory", code: "inventory.products.manage", name: "Quản lý danh mục sản phẩm & giá", roles: ["ORG_ADMIN", "WAREHOUSE_MGR"] },
    { module: "Inventory", code: "inventory.receipts.post", name: "Ghi sổ phiếu nhập kho (Tăng tồn)", roles: ["ORG_ADMIN", "WAREHOUSE_MGR"] },
    { module: "Inventory", code: "inventory.stocktake.apply", name: "Cân bằng & điều chỉnh kiểm kê kho", roles: ["ORG_ADMIN", "WAREHOUSE_MGR"] },
    { module: "HRM", code: "hrm.employees.manage", name: "Quản trị danh sách nhân sự", roles: ["ORG_ADMIN", "HR_MGR"] },
    { module: "HRM", code: "hrm.attendance.record", name: "Điểm danh & Chấm công hàng ngày", roles: ["ORG_ADMIN", "SALES_STAFF", "WAREHOUSE_MGR", "HR_MGR"] },
    { module: "HRM", code: "hrm.leave.approve", name: "Phê duyệt / Từ chối đơn nghỉ phép", roles: ["ORG_ADMIN", "HR_MGR"] },
    { module: "Settings", code: "settings.organization.edit", name: "Cấu hình thông tin doanh nghiệp", roles: ["ORG_ADMIN"] },
    { module: "Settings", code: "settings.audit.view", name: "Tra cứu nhật ký kiểm toán (Audit Trail)", roles: ["ORG_ADMIN"] },
  ];

  const filteredPermissions = permissionsMatrix.filter((p) => {
    if (rbacModuleFilter === "ALL") return true;
    return p.module === rbacModuleFilter;
  });

  // Audit Logs State & Filters
  const [auditSearch, setAuditSearch] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState("ALL");

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchAction = auditActionFilter === "ALL" || log.action === auditActionFilter;
    const matchSearch =
      log.code.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.entity.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(auditSearch.toLowerCase()));
    return matchAction && matchSearch;
  });

  const getActionBadge = (action: AuditLog["action"]) => {
    switch (action) {
      case "CONFIRM":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">XÁC NHẬN</span>;
      case "CANCEL":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">HỦY BỎ</span>;
      case "FULFILL":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">XUẤT KHO</span>;
      case "POST":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">GHI SỔ</span>;
      case "CREATE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">TẠO MỚI</span>;
      case "APPROVE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">PHÊ DUYỆT</span>;
      case "REJECT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">TỪ CHỐI</span>;
      case "CONVERT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">CHUYỂN ĐỔI</span>;
      case "SETTINGS":
      case "UPDATE_ORGANIZATION_PROFILE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">CẤU HÌNH</span>;
      case "RESET_ORGANIZATION_PROFILE":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">KHÔI PHỤC</span>;
      case "LOGIN":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">PHIÊN ĐĂNG NHẬP</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 w-full">
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
          onClick={() => handleTabChange("ORG")}
          className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "ORG"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building className="w-4 h-4" />
          Hồ sơ Tổ chức
        </button>

        <button
          onClick={() => handleTabChange("RBAC")}
          className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "RBAC"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Shield className="w-4 h-4" />
          Vai trò & Phân quyền (RBAC)
        </button>

        <button
          onClick={() => handleTabChange("AUDIT")}
          className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "AUDIT"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-4 h-4" />
          Nhật ký Kiểm toán (Audit Logs)
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Organization Settings Form */}
      {activeTab === "ORG" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 w-full max-w-4xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Thông tin Doanh nghiệp & Thiết lập Chung</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Các thay đổi sẽ được lưu trữ cục bộ bền vững và đồng bộ ngay lập tức tới các module khác.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetOrg}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mặc định</span>
            </button>
          </div>

          <form onSubmit={handleSaveOrg} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên doanh nghiệp / Công ty *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                className={`w-full px-3 py-2 text-xs font-semibold rounded-xl border focus:outline-none shadow-2xs transition-colors ${
                  errors.name
                    ? "border-rose-500 bg-rose-50/30 text-rose-900 focus:border-rose-600"
                    : "border-slate-200 text-slate-800 focus:border-blue-500"
                }`}
                placeholder="Nhập tên đầy đủ của doanh nghiệp"
              />
              {errors.name && (
                <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã tổ chức (Organization Code) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => {
                    setFormData({ ...formData, code: e.target.value.toUpperCase() });
                    if (errors.code) setErrors({ ...errors, code: "" });
                  }}
                  className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border focus:outline-none shadow-2xs transition-colors ${
                    errors.code
                      ? "border-rose-500 bg-rose-50/30 text-rose-900 focus:border-rose-600"
                      : "border-slate-200 text-blue-700 focus:border-blue-500"
                  }`}
                  placeholder="Ví dụ: BIZPRO-CORP"
                />
                {errors.code ? (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.code}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">Chỉ gồm chữ in hoa, số và gạch ngang (-)</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Mã số thuế (Tax Code) *</span>
                  <span className="text-[10px] text-slate-400 font-normal">10 hoặc 13 chữ số</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.taxCode}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, taxCode: val });
                    if (!val.trim()) {
                      setErrors({ ...errors, taxCode: "Mã số thuế không được để trống!" });
                    } else if (!isValidTaxCode(val)) {
                      setErrors({
                        ...errors,
                        taxCode: "Mã số thuế không hợp lệ! Chỉ gồm 10 hoặc 13 chữ số (ví dụ: 0109988776 hoặc 0109988776-001). Không chứa chữ cái.",
                      });
                    } else {
                      const updated = { ...errors };
                      delete updated.taxCode;
                      setErrors(updated);
                    }
                  }}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none font-mono shadow-2xs transition-colors ${
                    errors.taxCode
                      ? "border-rose-500 bg-rose-50/30 text-rose-900 focus:border-rose-600"
                      : "border-slate-200 text-slate-800 focus:border-blue-500"
                  }`}
                  placeholder="Ví dụ: 0109988776 hoặc 0109988776-001"
                />
                {errors.taxCode ? (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.taxCode}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Định dạng hợp lệ (10 hoặc 13 số theo chuẩn thuế Việt Nam)</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiền tệ hiển thị
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as OrgProfile["currency"] })}
                  className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
                >
                  <option value="VND">VND - Đồng Việt Nam (₫)</option>
                  <option value="USD">USD - Đô la Mỹ ($)</option>
                  <option value="EUR">EUR - Đồng Euro (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Múi giờ hệ thống
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-800 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
                >
                  <option value="Asia/Ho_Chi_Minh (GMT+7)">Asia/Ho_Chi_Minh (GMT+7)</option>
                  <option value="Asia/Singapore (GMT+8)">Asia/Singapore (GMT+8)</option>
                  <option value="Asia/Tokyo (GMT+9)">Asia/Tokyo (GMT+9)</option>
                  <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Số điện thoại tổng đài *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Đầu số +84 / 0x</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, phone: val });
                    if (!val.trim()) {
                      setErrors({ ...errors, phone: "Số điện thoại không được để trống!" });
                    } else if (!isValidPhone(val)) {
                      setErrors({
                        ...errors,
                        phone: "Số điện thoại không đúng chuẩn VN (+84 hoặc 03, 05, 07, 08, 09, 02x gồm 10-11 số).",
                      });
                    } else {
                      const updated = { ...errors };
                      delete updated.phone;
                      setErrors(updated);
                    }
                  }}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none shadow-2xs transition-colors ${
                    errors.phone
                      ? "border-rose-500 bg-rose-50/30 text-rose-900 focus:border-rose-600"
                      : "border-slate-200 text-slate-800 focus:border-blue-500"
                  }`}
                  placeholder="Ví dụ: 024 3999 8888 hoặc +84 901 234 567"
                />
                {errors.phone ? (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Đúng chuẩn số điện thoại Việt Nam</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email liên hệ chính thức *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, email: val });
                    if (!val.trim()) {
                      setErrors({ ...errors, email: "Email không được để trống!" });
                    } else if (!isValidEmail(val)) {
                      setErrors({ ...errors, email: "Email không đúng định dạng!" });
                    } else {
                      const updated = { ...errors };
                      delete updated.email;
                      setErrors(updated);
                    }
                  }}
                  className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none shadow-2xs transition-colors ${
                    errors.email
                      ? "border-rose-500 bg-rose-50/30 text-rose-900 focus:border-rose-600"
                      : "border-slate-200 text-slate-800 focus:border-blue-500"
                  }`}
                  placeholder="contact@bizpro.vn"
                />
                {errors.email && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Website doanh nghiệp
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 shadow-2xs"
                  placeholder="https://bizpro.vn"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ trụ sở chính
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 shadow-2xs"
                placeholder="Tòa nhà, số nhà, đường, phường, quận, tỉnh thành"
              />
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/25 transition-all active:scale-95 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang lưu vào PostgreSQL...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu thay đổi hồ sơ</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === "RBAC" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Vai trò hệ thống & Ma trận quyền năng (RBAC)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn một vai trò để kiểm tra phạm vi dữ liệu và danh sách quyền hạn được cấp phép.
                </p>
              </div>
            </div>

            {/* Role Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {rolesList.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/60 border-blue-400 shadow-sm ring-2 ring-blue-500/20"
                        : "bg-slate-50/80 border-slate-200/80 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${r.badge}`}>
                        {r.name}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-xs text-slate-600 mt-2 mb-3 leading-relaxed">{r.desc}</p>
                    <div className="border-t border-slate-200/80 pt-2 space-y-1">
                      <span className="text-[11px] font-semibold text-slate-900 block">
                        {r.permissionsCount}
                      </span>
                      <span className="text-[10px] text-blue-600 font-medium block">
                        {r.scope}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filter and Matrix Table */}
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
              <div className="p-3 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">
                    Bảng kiểm tra quyền hạn thực thi (Quyền vai trò:{" "}
                    <b className="text-blue-600">{rolesList.find((r) => r.id === selectedRole)?.name}</b>)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Lọc module:</span>
                  <select
                    value={rbacModuleFilter}
                    onChange={(e) => setRbacModuleFilter(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                  >
                    <option value="ALL">Tất cả module</option>
                    <option value="CRM">CRM</option>
                    <option value="Sales">Bán hàng (Sales)</option>
                    <option value="Inventory">Kho hàng (Inventory)</option>
                    <option value="HRM">Nhân sự (HRM)</option>
                    <option value="Settings">Cài đặt (Settings)</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[730px]">
                  <thead>
                    <tr className="bg-slate-100/60 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4 min-w-[120px] whitespace-nowrap">Module</th>
                      <th className="py-2.5 px-4 min-w-[220px] whitespace-nowrap">Mã quyền hạn (Permission Key)</th>
                      <th className="py-2.5 px-4 min-w-[260px]">Mô tả hành động</th>
                      <th className="py-2.5 px-4 min-w-[130px] text-center whitespace-nowrap">Trạng thái quyền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPermissions.map((item) => {
                      const hasPerm = item.roles.includes(selectedRole);
                      return (
                        <tr key={item.code} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-4 font-bold text-slate-700 whitespace-nowrap min-w-[120px]">{item.module}</td>
                          <td className="py-2.5 px-4 font-mono font-semibold text-blue-600 whitespace-nowrap min-w-[220px]">{item.code}</td>
                          <td className="py-2.5 px-4 text-slate-800 min-w-[260px]">{item.name}</td>
                          <td className="py-2.5 px-4 text-center whitespace-nowrap min-w-[130px]">
                            {hasPerm ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap">
                                <Check className="w-3 h-3 text-emerald-600" />
                                ĐƯỢC PHÉP
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 whitespace-nowrap">
                                <Lock className="w-3 h-3 text-slate-400" />
                                TỪ CHỐI
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Dynamic Audit Logs */}
      {activeTab === "AUDIT" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Nhật ký kiểm toán hệ thống (Audit Trail)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ghi nhận bất biến mọi thao tác của người dùng: Đơn hàng, Kho, Deal, Lead, Phê duyệt và Cài đặt.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  showToast("Đã trích xuất nhật ký kiểm toán ra tệp tin CSV thành công!", "success");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất CSV</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Tìm theo mã tham chiếu, đối tượng, người làm..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600 font-medium">Hành động:</span>
              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">Tất cả hành động</option>
                <option value="CONFIRM">Xác nhận đơn / Deal</option>
                <option value="FULFILL">Xuất kho (Fulfill)</option>
                <option value="CANCEL">Hủy đơn / Deal</option>
                <option value="POST">Ghi sổ kho (Post)</option>
                <option value="APPROVE">Phê duyệt (Approve)</option>
                <option value="REJECT">Từ chối (Reject)</option>
                <option value="CONVERT">Chuyển đổi (Convert)</option>
                <option value="SETTINGS">Cấu hình hệ thống</option>
                <option value="LOGIN">Đăng nhập / Chấm công</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[1070px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Thời gian</th>
                  <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Hành động</th>
                  <th className="py-3 px-4 min-w-[120px] whitespace-nowrap">Đối tượng</th>
                  <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Mã tham chiếu</th>
                  <th className="py-3 px-4 min-w-[260px]">Chi tiết hành động</th>
                  <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">Người thực hiện</th>
                  <th className="py-3 px-4 min-w-[120px] whitespace-nowrap text-center">Địa chỉ IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">{log.time}</td>
                    <td className="py-3 px-4">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{log.entity}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600">{log.code}</td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs">{log.details || "—"}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">{log.user}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-center">{log.ip}</td>
                  </tr>
                ))}
                {filteredAuditLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      Không tìm thấy bản ghi nhật ký kiểm toán phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}