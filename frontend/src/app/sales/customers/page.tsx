"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatVND } from "@/lib/utils";
import { ShoppingBag, Search, Plus, ShoppingCart, DollarSign, CreditCard } from "lucide-react";

export default function SalesCustomersPage() {
  const { customers, salesOrders } = useApp();
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            Khách hàng Thương mại & Bán hàng (Sales Customers)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi lịch sử mua hàng, công nợ phải thu và trạng thái đơn hàng của từng đối tác khách hàng.
          </p>
        </div>

        <Link
          href="/sales/orders"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Xem tất cả Đơn hàng</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên khách mua hàng, mã KH, SĐT..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 text-xs text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Mã KH</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Điện thoại</th>
                <th className="py-3 px-4 text-center">Số đơn đã mua</th>
                <th className="py-3 px-4">Tổng doanh số mua</th>
                <th className="py-3 px-4">Hạn mức công nợ</th>
                <th className="py-3 px-4 text-right">Lập đơn nhanh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((cust) => {
                const custOrders = salesOrders.filter((o) => o.customerId === cust.id);
                return (
                  <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-600">{cust.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{cust.name}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{cust.phone}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {custOrders.length} đơn
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatVND(cust.totalSpent || 285000000)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CreditCard className="w-3 h-3" /> 500.000.000đ
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href="/sales/orders"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tạo đơn</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
