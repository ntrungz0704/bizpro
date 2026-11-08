"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ShieldCheck,
  Zap,
  Check,
  ArrowRight,
  Download,
  Clock,
  Sparkles,
  Users,
  HardDrive,
  Building2,
} from "lucide-react";

export default function BillingPage() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const invoices = [
    { id: "INV-2026-003", date: "01/11/2026", amount: "1,299,000 đ", status: "Paid", method: "Visa •••• 4242" },
    { id: "INV-2026-002", date: "01/10/2026", amount: "1,299,000 đ", status: "Paid", method: "Visa •••• 4242" },
    { id: "INV-2026-001", date: "01/09/2026", amount: "1,299,000 đ", status: "Paid", method: "Visa •••• 4242" },
  ];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gói dịch vụ & Thanh toán (Subscription & Billing)</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý gói thuê bao doanh nghiệp, hạn mức tài khoản, phương thức thanh toán và lịch sử hóa đơn VAT.
            </p>
          </div>

          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-5 py-2.5 rounded-full bg-[#0066FF] hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-95 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Nâng cấp gói dịch vụ</span>
          </button>
        </div>

        {/* Current Active Plan Card */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-bold">
              <span>Đang hoạt động (Active)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">BizPro+ Professional Edition</h2>
            <p className="text-xs text-blue-200 max-w-lg leading-relaxed">
              Dành cho doanh nghiệp quy mô vừa và chuỗi cửa hàng. Bao gồm đầy đủ 4 module CRM, Kho hàng nguyên tử, Bán hàng 5 bước và HRM chấm công.
            </p>
            <div className="text-xs text-slate-300 pt-1">
              Chu kỳ thanh toán: <strong className="text-white">1.299.000 đ / tháng</strong> • Ngày gia hạn kế tiếp: <strong className="text-white">01/12/2026</strong>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 w-full md:w-64 shrink-0 space-y-3 relative z-10 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Nhân viên active:</span>
              <span className="font-bold text-white">18 / 25 seats</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-blue-400 h-2 rounded-full" style={{ width: "72%" }} />
            </div>

            <div className="flex justify-between items-center text-slate-300 pt-2">
              <span>Dung lượng dữ liệu:</span>
              <span className="font-bold text-white">4.2 GB / 50 GB</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-emerald-400 h-2 rounded-full" style={{ width: "8.4%" }} />
            </div>
          </div>
        </div>

        {/* Payment Method & Company Invoice Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Phương thức thanh toán mặc định</h3>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">Tự động gia hạn</span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-8 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                VISA
              </div>
              <div className="flex-1 text-xs">
                <div className="font-bold text-slate-900">Visa Corporate •••• 4242</div>
                <div className="text-slate-400 text-[11px]">Hết hạn: 12/2028 • Cổng Napas / Stripe</div>
              </div>
              <button className="text-xs font-semibold text-blue-600 hover:underline">
                Thay đổi
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Thông tin xuất hóa đơn VAT điện tử</h3>
              <button className="text-xs font-semibold text-blue-600 hover:underline">Chỉnh sửa</button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1 text-slate-600">
              <div className="font-bold text-slate-900">Công ty Cổ phần Giải pháp Doanh nghiệp BizPro+</div>
              <div>Mã số thuế: <strong className="text-slate-800">0109988776</strong></div>
              <div>Địa chỉ: Tòa nhà Keangnam Landmark 72, Đường Phạm Hùng, Cầu Giấy, Hà Nội</div>
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Lịch sử hóa đơn thanh toán</h3>
            <span className="text-xs text-slate-500">Tự động gửi qua email kế toán</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Mã hóa đơn</th>
                  <th className="p-3.5">Ngày lập</th>
                  <th className="p-3.5">Số tiền</th>
                  <th className="p-3.5">Phương thức</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5 text-right">Tải về</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="p-3.5 font-bold text-slate-900">{inv.id}</td>
                    <td className="p-3.5 text-slate-600">{inv.date}</td>
                    <td className="p-3.5 font-bold text-slate-900">{inv.amount}</td>
                    <td className="p-3.5 text-slate-600">{inv.method}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Nâng cấp lên BizPro+ Enterprise</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Không giới hạn người dùng, kho phân tán và SLA 99.99%</p>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Không giới hạn tài khoản nhân viên (Unlimited Seats)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Không giới hạn số lượng điểm kho và chi nhánh bán lẻ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Dedicated Server Database & sao lưu dự phòng theo giây</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Chuyên viên kỹ thuật riêng hỗ trợ 24/7 qua Hotline VIP</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-blue-600 font-semibold">Gói Enterprise theo năm</div>
                  <div className="text-xl font-black text-slate-900">2.999.000 đ <span className="text-xs font-normal text-slate-500">/ tháng</span></div>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-6 py-2.5 rounded-full bg-[#0066FF] hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25"
                >
                  Xác nhận nâng cấp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
