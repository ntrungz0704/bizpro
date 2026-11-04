"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { PieChart as PieIcon, ChevronDown } from "lucide-react";

const data = [
  { name: "Sản phẩm", value: 45.2, color: "#2563EB" },
  { name: "Dịch vụ", value: 34.1, color: "#F59E0B" },
  { name: "Khác", value: 20.7, color: "#10B981" },
];

export default function RevenueStructureChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">Cơ cấu doanh thu</h3>
        </div>

        <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors">
          Tháng này
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Donut Chart with Center Text */}
      <div className="relative h-44 w-full flex items-center justify-center">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
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
          <div className="text-base font-bold text-slate-900 leading-tight">548.2tr</div>
          <div className="text-[10px] text-slate-400">Tổng doanh thu</div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
        {data.map((item) => (
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
