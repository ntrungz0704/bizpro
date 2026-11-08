"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatVND } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Plus, CheckCircle, PackagePlus, FileText } from "lucide-react";

export default function ReceiptsIssuesPage() {
  const { stockReceipts, stockIssues, products, postStockReceipt, addStockReceipt } = useApp();
  const [activeTab, setActiveTab] = useState<"RECEIPTS" | "ISSUES">("RECEIPTS");
  const [showModal, setShowModal] = useState(false);

  // New Receipt Form State
  const [supplier, setSupplier] = useState("Công ty Thiết Bị Công Nghệ Tân Tiến");
  const [warehouse, setWarehouse] = useState("Kho Tổng Hà Nội");
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [quantity, setQuantity] = useState(10);
  const [cost, setCost] = useState(20000000);

  const handleCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    addStockReceipt({
      code: `NK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier,
      warehouse,
      date: new Date().toISOString().split("T")[0],
      status: "DRAFT",
      totalAmount: cost * quantity,
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          quantity,
          cost,
        },
      ],
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <PackagePlus className="w-6 h-6 text-blue-600" />
            Quản lý Nhập - Xuất kho
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận chứng từ nhập kho từ nhà cung cấp và chứng từ xuất kho bán hàng/nội bộ.
          </p>
        </div>

        {activeTab === "RECEIPTS" && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Lập phiếu nhập kho</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("RECEIPTS")}
          className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all border-b-2 ${
            activeTab === "RECEIPTS"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          Phiếu Nhập kho (Stock Receipts)
          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center font-bold">
            {stockReceipts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("ISSUES")}
          className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold transition-all border-b-2 ${
            activeTab === "ISSUES"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Phiếu Xuất kho (Stock Issues)
          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center font-bold">
            {stockIssues.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Receipts Table */}
      {activeTab === "RECEIPTS" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Mã phiếu</th>
                  <th className="py-3 px-4 min-w-[180px]">Nhà cung cấp</th>
                  <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Kho nhập</th>
                  <th className="py-3 px-4 min-w-[240px]">Hàng hóa nhập</th>
                  <th className="py-3 px-4 min-w-[140px] text-right whitespace-nowrap">Tổng giá trị</th>
                  <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">Ngày nhập</th>
                  <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Trạng thái</th>
                  <th className="py-3 px-4 min-w-[160px] text-right whitespace-nowrap">Ghi sổ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {stockReceipts.map((rcp) => (
                  <tr key={rcp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-600 font-mono whitespace-nowrap min-w-[130px]">{rcp.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 min-w-[180px]">{rcp.supplier}</td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap min-w-[160px]">{rcp.warehouse}</td>
                    <td className="py-3.5 px-4 text-slate-700 min-w-[240px]">
                      {rcp.items.map((it) => (
                        <div key={it.productId} className="py-0.5">
                          • {it.productName} <b className="text-slate-900 whitespace-nowrap">+{it.quantity}</b>
                        </div>
                      ))}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-right whitespace-nowrap min-w-[140px]">
                      {formatVND(rcp.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono whitespace-nowrap min-w-[110px]">{rcp.date}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">
                      {rcp.status === "POSTED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Đã vào sổ kho
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          Chờ ghi sổ
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap min-w-[160px]">
                      {rcp.status === "DRAFT" ? (
                        <button
                          onClick={() => postStockReceipt(rcp.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors active:scale-95"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Ghi sổ (Tăng tồn)</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Đã vào sổ cái</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Issues Table */}
      {activeTab === "ISSUES" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Mã phiếu xuất</th>
                  <th className="py-3 px-4 min-w-[170px] whitespace-nowrap">Đơn bán hàng liên kết</th>
                  <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Kho xuất</th>
                  <th className="py-3 px-4 min-w-[240px]">Hàng hóa xuất</th>
                  <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">Ngày xuất</th>
                  <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {stockIssues.map((iss) => (
                  <tr key={iss.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-rose-600 font-mono whitespace-nowrap min-w-[130px]">{iss.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600 font-mono whitespace-nowrap min-w-[170px]">
                      {iss.orderCode || "Xuất nội bộ"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap min-w-[160px]">{iss.warehouse}</td>
                    <td className="py-3.5 px-4 text-slate-700 min-w-[240px]">
                      {iss.items.map((it) => (
                        <div key={it.productId} className="py-0.5">
                          • {it.productName} <b className="text-rose-600 whitespace-nowrap">-{it.quantity}</b>
                        </div>
                      ))}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono whitespace-nowrap min-w-[110px]">{iss.date}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap min-w-[140px]">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Đã xuất sổ kho
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add Stock Receipt */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Lập phiếu nhập kho mới
            </h2>
            <form onSubmit={handleCreateReceipt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nhà cung cấp
                </label>
                <input
                  type="text"
                  required
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sản phẩm nhập *
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số lượng nhập *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đơn giá vốn (VND)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={cost}
                    onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all"
                >
                  Tạo phiếu nháp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
