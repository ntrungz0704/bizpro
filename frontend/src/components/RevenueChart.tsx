"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { BarChart3, MoreHorizontal, RefreshCw, FileSpreadsheet, ExternalLink } from "lucide-react";
import { useApp } from "@/context/AppContext";

const baseData = [
  { day: "T2", current: 110, previous: 85 },
  { day: "T3", current: 180, previous: 140 },
  { day: "T4", current: 240, previous: 190 },
  { day: "T5", current: 235, previous: 160 },
  { day: "T6", current: 240, previous: 220 },
  { day: "T7", current: 270, previous: 210 },
  { day: "CN", current: 320.5, previous: 260 },
];

export default function RevenueChart() {
  const { showToast } = useApp();
  const [mounted, setMounted] = useState(false);
  const [showCurrent, setShowCurrent] = useState(true);
  const [showPrevious, setShowPrevious] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [chartData, setChartData] = useState(baseData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Add slight jitter to simulate real-time live data refresh
      setChartData(
        baseData.map((d) => ({
          ...d,
          current: +(d.current * (0.98 + Math.random() * 0.04)).toFixed(1),
        }))
      );
      setIsRefreshing(false);
      setShowMenu(false);
      showToast("Dữ liệu biểu đồ doanh thu đã được đồng bộ mới nhất!", "success");
    }, 400);
  };

  const handleExport = () => {
    setShowMenu(false);
    showToast("Đã xuất file báo cáo doanh thu tuần (XLSX) thành công!", "success");
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">
            Doanh thu theo thời gian
          </h3>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Toggle Tháng này */}
          <button
            type="button"
            onClick={() => {
              if (showCurrent && !showPrevious) {
                showToast("Cần hiển thị ít nhất 1 chu kỳ dữ liệu!", "info");
                return;
              }
              setShowCurrent(!showCurrent);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              showCurrent
                ? "bg-blue-50 border-blue-200 text-blue-700 font-semibold shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
            }`}
            title="Bấm để bật/tắt hiển thị Tháng này"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                showCurrent ? "bg-blue-600" : "bg-slate-300"
              }`}
            ></span>
            <span>Tháng này</span>
          </button>

          {/* Toggle Tháng trước */}
          <button
            type="button"
            onClick={() => {
              if (showPrevious && !showCurrent) {
                showToast("Cần hiển thị ít nhất 1 chu kỳ dữ liệu!", "info");
                return;
              }
              setShowPrevious(!showPrevious);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
              showPrevious
                ? "bg-sky-50 border-sky-200 text-sky-800 font-semibold shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
            }`}
            title="Bấm để bật/tắt hiển thị Tháng trước"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                showPrevious ? "bg-blue-300" : "bg-slate-300"
              }`}
            ></span>
            <span>Tháng trước</span>
          </button>

          {/* Action Menu (...) */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Tùy chọn biểu đồ"
              aria-label="Tùy chọn biểu đồ"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-40 animate-scale-up text-xs">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-slate-700 hover:bg-slate-50 rounded-lg text-left transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span>{isRefreshing ? "Đang làm mới..." : "Làm mới dữ liệu"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-slate-700 hover:bg-slate-50 rounded-lg text-left transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xuất file Excel</span>
                </button>
                <Link
                  href="/reports"
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-slate-700 hover:bg-slate-50 rounded-lg text-left transition-colors border-t border-slate-100 mt-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                  <span>Xem báo cáo chi tiết</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
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
                formatter={(value: any, name: any) => [
                  `${value} triệu đ`,
                  name === "current" ? "Tháng này" : "Tháng trước",
                ]}
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
              {showPrevious && (
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke="#BFDBFE"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
              {showCurrent && (
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#FFFFFF" }}
                  activeDot={{ r: 6, fill: "#2563EB" }}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
        )}
      </div>
    </div>
  );
}
