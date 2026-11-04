"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { BarChart3, MoreHorizontal } from "lucide-react";

const data = [
  { day: "T2", current: 110, previous: 85 },
  { day: "T3", current: 180, previous: 140 },
  { day: "T4", current: 240, previous: 190 },
  { day: "T5", current: 235, previous: 160 },
  { day: "T6", current: 240, previous: 220 },
  { day: "T7", current: 270, previous: 210 },
  { day: "CN", current: 320.5, previous: 260 },
];

export default function RevenueChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">
            Doanh thu theo thời gian
          </h3>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Tháng này</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-200"></span>
            <span>Tháng trước</span>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#64748B" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#64748B" }}
                tickFormatter={(value) => (value === 0 ? "0đ" : `${value}tr`)}
                domain={[0, 400]}
                ticks={[0, 100, 200, 300, 400]}
              />
              <Tooltip
                formatter={(value: any) => [`${value} triệu đ`, "Doanh thu"]}
                contentStyle={{
                  backgroundColor: "#2563EB",
                  borderRadius: "10px",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  border: "none",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                }}
                itemStyle={{ color: "#FFFFFF" }}
                labelStyle={{ display: "none" }}
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke="#BFDBFE"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="current"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#FFFFFF" }}
                activeDot={{ r: 6, fill: "#2563EB" }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
        )}
      </div>
    </div>
  );
}
