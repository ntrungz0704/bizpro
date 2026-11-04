"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Laptop, Mouse, Keyboard, Monitor, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

export default function InventoryAlerts() {
  const { products } = useApp();

  // Find products that are low in available stock (onHand - reserved <= minStock)
  const lowStockProducts = [...products]
    .sort((a, b) => (a.onHand - a.reserved) - (b.onHand - b.reserved))
    .slice(0, 3);

  const getProductIcon = (name: string, category: string) => {
    const lower = (name + " " + category).toLowerCase();
    if (lower.includes("laptop")) return Laptop;
    if (lower.includes("chuột") || lower.includes("mouse")) return Mouse;
    if (lower.includes("phím") || lower.includes("keyboard")) return Keyboard;
    if (lower.includes("màn hình") || lower.includes("monitor")) return Monitor;
    return Package;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-800">Cảnh báo tồn kho</h3>
        </div>
        <Link
          href="/inventory/products"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* List */}
      <div className="space-y-3">
        {lowStockProducts.map((prod) => {
          const available = prod.onHand - prod.reserved;
          const isUrgent = available <= 5;
          const Icon = getProductIcon(prod.name, prod.category);

          return (
            <Link
              key={prod.id}
              href="/inventory/products"
              className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 flex items-center justify-center text-slate-600 shrink-0 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 leading-tight transition-colors">
                    {prod.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Còn {available} {prod.uom} khả dụng (Tồn: {prod.onHand})
                  </p>
                </div>
              </div>

              <span
                className={cn(
                  "px-2.5 py-1 text-[11px] font-semibold rounded-md border whitespace-nowrap",
                  isUrgent
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-amber-50 text-amber-600 border-amber-200"
                )}
              >
                {isUrgent ? "Cần nhập" : "Sắp hết"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
