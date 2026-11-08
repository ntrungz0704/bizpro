"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  CreditCard,
  Plus,
  Check,
  Edit2,
  Trash2,
  ArrowRight,
  Sparkles,
  Zap,
  Users,
  Warehouse,
  Boxes,
  Database,
  CheckCircle2,
  Lock,
} from "lucide-react";
import BizProLogo from "@/components/BizProLogo";

interface PlanConfig {
  id: string;
  name: string;
  badge: string;
  monthlyPrice: number;
  annualPrice: number;
  userLimit: number;
  warehouseLimit: number;
  orderMonthlyLimit: number;
  storageGb: number;
  activeTenants: number;
  features: string[];
  status: "ACTIVE" | "ARCHIVED";
}

export default function PlatformAdminPlansPage() {
  const [plans, setPlans] = useState<PlanConfig[]>([
    {
      id: "PLAN-TRIAL",
      name: "Dùng thử miễn phí",
      badge: "14 Ngày",
      monthlyPrice: 0,
      annualPrice: 0,
      userLimit: 5,
      warehouseLimit: 1,
      orderMonthlyLimit: 100,
      storageGb: 1,
      activeTenants: 100,
      features: [
        "14 ngày trải nghiệm toàn diện",
        "4 Module chính (CRM, Kho, Bán hàng, HRM)",
        "Dữ liệu mẫu demo có sẵn",
        "Hỗ trợ qua trung tâm trợ giúp",
      ],
      status: "ACTIVE",
    },
    {
      id: "PLAN-STARTER",
      name: "Khởi tạo (Starter)",
      badge: "Doanh nghiệp nhỏ",
      monthlyPrice: 499000,
      annualPrice: 399000,
      userLimit: 10,
      warehouseLimit: 1,
      orderMonthlyLimit: 500,
      storageGb: 5,
      activeTenants: 540,
      features: [
        "Tối đa 10 tài khoản nhân viên",
        "1 Kho hàng trung tâm",
        "Đồng bộ đơn hàng cơ bản",
        "Báo cáo doanh thu & tồn kho",
        "Sao lưu đám mây định kỳ",
      ],
      status: "ACTIVE",
    },
    {
      id: "PLAN-PRO",
      name: "Chuyên nghiệp (Pro)",
      badge: "Phổ biến nhất",
      monthlyPrice: 1299000,
      annualPrice: 1039000,
      userLimit: 50,
      warehouseLimit: 5,
      orderMonthlyLimit: 5000,
      storageGb: 25,
      activeTenants: 420,
      features: [
        "Tối đa 50 tài khoản nhân viên",
        "5 Chi nhánh / Kho hàng độc lập",
        "Khóa giữ tồn kho tự động",
        "Quy trình xử lý đơn hàng 5 bước",
        "Phân quyền bảo mật 66 vai trò",
        "Hỗ trợ ưu tiên qua Hotline & Kỹ thuật",
      ],
      status: "ACTIVE",
    },
    {
      id: "PLAN-ENTERPRISE",
      name: "Doanh nghiệp (Enterprise)",
      badge: "Quy mô lớn",
      monthlyPrice: 2999000,
      annualPrice: 2399000,
      userLimit: 99999,
      warehouseLimit: 99999,
      orderMonthlyLimit: 999999,
      storageGb: 250,
      activeTenants: 180,
      features: [
        "Không giới hạn tài khoản nhân viên",
        "Không giới hạn kho hàng",
        "Cơ sở dữ liệu độc lập & VPC riêng",
        "Tích hợp API hải quan, ERP ngoài",
        "Cam kết SLA 99.99% vận hành",
        "Chuyên viên kỹ thuật riêng hỗ trợ 24/7",
      ],
      status: "ACTIVE",
    },
  ]);

  const [selectedPlan, setSelectedPlan] = useState<PlanConfig | null>(plans[2]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col">
      {/* Super Admin Top Header */}
      <header className="border-b border-slate-800 bg-[#0B132B] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <BizProLogo variant="full" size="md" theme="dark" />
          </Link>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 border border-red-500/30">
            SaaS Platform Super Admin
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all"
          >
            Quay lại Tenant App →
          </Link>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            SA
          </div>
        </div>
      </header>

      {/* Nav Sub-bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex items-center gap-6 text-xs font-semibold overflow-x-auto">
        <Link href="/admin" className="text-slate-400 hover:text-slate-200">
          Tổng quan & Chỉ số MRR
        </Link>
        <Link href="/admin/tenants" className="text-slate-400 hover:text-slate-200">
          Quản lý Doanh nghiệp (1,240)
        </Link>
        <Link href="/admin/plans" className="text-blue-400 pb-1 border-b-2 border-blue-400">
          Gói cước & Định mức
        </Link>
        <Link href="/admin/system" className="text-slate-400 hover:text-slate-200">
          Hạ tầng & Nhật ký Hệ thống
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <CreditCard className="w-6 h-6 text-blue-400" />
              <span>Quản lý Gói cước Dịch vụ (Subscription Plans)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Thiết lập chính sách giá, định mức nhân sự, số lượng kho và hạn mức xử lý đơn hàng áp dụng trên toàn hệ thống SaaS.
            </p>
          </div>
          <button
            onClick={() => alert("Tính năng tạo gói cước mới tùy biến đã sẵn sàng trong cấu hình hệ thống.")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm gói cước mới</span>
          </button>
        </div>

        {/* 4 Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => {
            const isSelected = selectedPlan?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p)}
                className={`bg-slate-900 rounded-2xl p-5 border transition-all cursor-pointer relative ${
                  isSelected
                    ? "border-blue-500 ring-2 ring-blue-500/20 bg-slate-900/90 shadow-xl shadow-blue-500/10"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {p.badge}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{p.activeTenants} Doanh nghiệp</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-3">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">
                    {p.monthlyPrice === 0 ? "0 đ" : `${p.monthlyPrice.toLocaleString("vi-VN")} đ`}
                  </span>
                  <span className="text-xs text-slate-400">/tháng</span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nhân sự:</span>
                    <span className="font-semibold text-white">
                      {p.userLimit >= 99999 ? "Không giới hạn" : `${p.userLimit} người`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kho hàng:</span>
                    <span className="font-semibold text-white">
                      {p.warehouseLimit >= 99999 ? "Không giới hạn" : `${p.warehouseLimit} kho`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Đơn hàng/tháng:</span>
                    <span className="font-semibold text-white">
                      {p.orderMonthlyLimit >= 99999 ? "Không giới hạn" : `${p.orderMonthlyLimit.toLocaleString("vi-VN")} đơn`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dung lượng:</span>
                    <span className="font-semibold text-white">{p.storageGb} GB</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-xs font-semibold">
                  <span className={isSelected ? "text-blue-400" : "text-slate-500"}>
                    {isSelected ? "Đang chọn chỉnh sửa" : "Bấm để cấu hình"}
                  </span>
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Plan Editor & Quota Manager */}
        {selectedPlan && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>Cấu hình chi tiết gói:</span>
                  <span className="text-blue-400">{selectedPlan.name}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Thay đổi sẽ có hiệu lực ngay cho các doanh nghiệp đăng ký mới hoặc khi gia hạn chu kỳ tiếp theo.
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Trạng thái: Đang hoạt động
              </span>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Giá cước theo tháng (VNĐ)
                </label>
                <input
                  type="number"
                  defaultValue={selectedPlan.monthlyPrice}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Giá trả trước theo năm (-20%)
                </label>
                <input
                  type="number"
                  defaultValue={selectedPlan.annualPrice}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Hạn mức nhân sự (Tài khoản)
                </label>
                <input
                  type="number"
                  defaultValue={selectedPlan.userLimit}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Số lượng kho hàng tối đa
                </label>
                <input
                  type="number"
                  defaultValue={selectedPlan.warehouseLimit}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Hạn mức đơn bán hàng / tháng
                </label>
                <input
                  type="number"
                  defaultValue={selectedPlan.orderMonthlyLimit}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Dung lượng lưu trữ đám mây (GB)
                </label>
                <input
                  type="number"
                  defaultValue={selectedPlan.storageGb}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Thời hạn dùng thử miễn phí (Ngày)
                </label>
                <input
                  type="number"
                  defaultValue={14}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Cam kết SLA thời gian hoạt động
                </label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-hidden focus:border-blue-500">
                  <option>99.5% Tiêu chuẩn</option>
                  <option>99.9% Nâng cao</option>
                  <option selected>99.99% Doanh nghiệp cao cấp</option>
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-4 flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  {saveSuccess && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đã lưu và đồng bộ hạn mức gói cước thành công!</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => alert("Khôi phục về hạn mức mặc định")}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    Khôi phục mặc định
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
                  >
                    Lưu thay đổi gói cước
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
