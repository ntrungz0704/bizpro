"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { ClipboardCheck, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function StocktakesPage() {
  const { products, showToast } = useApp();
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    products.forEach((p) => {
      initial[p.id] = p.onHand;
    });
    return initial;
  });

  const handleCountChange = (productId: string, val: number) => {
    setCounts((prev) => ({ ...prev, [productId]: Math.max(0, val) }));
  };

  const handleApplyStocktake = () => {
    showToast("Đã hoàn tất đợt kiểm kê và lập phiếu điều chỉnh chênh lệch kho!");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
            Kiểm kê Kho định kỳ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đối soát số lượng tồn sổ sách hệ thống với số lượng kiểm đếm thực tế tại kệ hàng.
          </p>
        </div>

        <button
          onClick={handleApplyStocktake}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Hoàn tất & Cân bằng kho</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Mã SKU</th>
                <th className="py-3 px-4">Tên hàng hóa</th>
                <th className="py-3 px-4 text-center">Tồn sổ sách</th>
                <th className="py-3 px-4 text-center">Thực đếm</th>
                <th className="py-3 px-4 text-center">Chênh lệch</th>
                <th className="py-3 px-4 text-center">Đánh giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {products.map((prod) => {
                const counted = counts[prod.id] !== undefined ? counts[prod.id] : prod.onHand;
                const diff = counted - prod.onHand;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{prod.sku}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{prod.name}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {prod.onHand} {prod.uom}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="number"
                        min={0}
                        value={counted}
                        onChange={(e) =>
                          handleCountChange(prod.id, parseInt(e.target.value) || 0)
                        }
                        className="w-20 px-2.5 py-1 text-center font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      {diff === 0 ? (
                        <span className="text-slate-400">0</span>
                      ) : diff > 0 ? (
                        <span className="text-emerald-600">+{diff} (Thừa)</span>
                      ) : (
                        <span className="text-rose-600">{diff} (Thiếu)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {diff === 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          KHỚP SỔ SÁCH
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          LỆCH KHO
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
  );
}
