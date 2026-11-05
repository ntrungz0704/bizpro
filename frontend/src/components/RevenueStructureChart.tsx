"use client";

import React, { useState, useEffect, useRef } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { PieChart as PieIcon, ChevronDown, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";

type PeriodKey = "Hôm nay" | "Tuần này" | "Tháng này" | "Năm nay";

interface PeriodData {
  total: string;
  items: { name: string; value: number; color: string }[];
}

const periodDatasets: Record<PeriodKey, PeriodData> = {
  "Hôm nay": {
    total: "18.2tr",
    items: [
      { name: "Sản phẩm", value: 58.0, color: "#2563EB" },
      { name: "Dịch vụ", value: 32.0, color: "#F59E0B" },
      { name: "Khác", value: 10.0, color: "#10B981" },
    ],
  },
  "Tuần này": {
    total: "125.4tr",
    items: [
      { name: "Sản phẩm", value: 48.5, color: "#2563EB" },
      { name: "Dịch vụ", value: 36.2, color: "#F59E0B" },
      { name: "Khác", value: 15.3, color: "#10B981" },
    ],
  },
  "Tháng này": {
    total: "548.2tr",
    items: [
      { name: "Sản phẩm", value: 45.2, color: "#2563EB" },
      { name: "Dịch vụ", value: 34.1, color: "#F59E0B" },
      { name: "Khác", value: 20.7, color: "#10B981" },
    ],
  },
  "Năm nay": {
    total: "6.8 tỷ",
    items: [
      { name: "Sản phẩm", value: 42.0, color: "#2563EB" },
      { name: "Dịch vụ", value: 39.0, color: "#F59E0B" },
      { name: "Khác", value: 19.0, color: "#10B981" },
    ],
  },
};

const periods: PeriodKey[] = ["Hôm nay", "Tuần này", "Tháng này", "Năm nay"];

export default function RevenueStructureChart() {
  const { showToast } = useApp();
  const [mounted, setMounted] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("Tháng này");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentDataset = periodDatasets[selectedPeriod];

  const handleSelectPeriod = (period: PeriodKey) => {
    setSelectedPeriod(period);
    setShowDropdown(false);
    showToast(`Đã lọc cơ cấu doanh thu theo: ${period}`, "info");
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">Cơ cấu doanh thu</h3>
        </div>

        {/* Interactive Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
          >
            <span>{selectedPeriod}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                showDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-40 animate-scale-up text-xs">
              {periods.map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => handleSelectPeriod(period)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    selectedPeriod === period
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{period}</span>
                  {selectedPeriod === period && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Donut Chart with Center Text */}
      <div className="relative h-44 w-full flex items-center justify-center">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any, name: any) => [`${value}%`, name]}
                contentStyle={{
                  backgroundColor: "#1E293B",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
                itemStyle={{ color: "#FFFFFF" }}
              />
              <Pie
                data={currentDataset.items}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                isAnimationActive={false}
              >
                {currentDataset.items.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-28 h-28 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin" />
        )}

        {/* Center label */}
        <div className="absolute text-center pointer-events-none">
          <div className="text-base font-bold text-slate-900 leading-tight">
            {currentDataset.total}
          </div>
          <div className="text-[10px] text-slate-400">Tổng doanh thu</div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
        {currentDataset.items.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="text-slate-600">{item.name}</span>
            </div>
            <span className="font-semibold text-slate-800">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
