"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ShoppingCart,
  Package,
  Boxes,
  Calendar,
  ChevronDown,
  Check,
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import RevenueChart from "@/components/RevenueChart";
import RevenueStructureChart from "@/components/RevenueStructureChart";
import RecentActivities from "@/components/RecentActivities";
import CrmFunnel from "@/components/CrmFunnel";
import InventoryAlerts from "@/components/InventoryAlerts";
import HrOverview from "@/components/HrOverview";
import { useApp } from "@/context/AppContext";
import { formatNumber, formatVND } from "@/lib/utils";

const timeOptions = ["Hôm nay", "Tuần này", "Tháng này", "Quý này", "Năm nay"];

export default function DashboardPage() {
  const { customers, salesOrders, products, showToast } = useApp();
  const [timeRange, setTimeRange] = useState("Tháng này");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(e.target as Node)) {
        setShowTimeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTime = (t: string) => {
    setTimeRange(t);
    setShowTimeDropdown(false);
    showToast(`Đã lọc báo cáo tổng quan: ${t}`, "info");
  };

  // Calculate live dynamic metrics synchronized with AppContext
  const dynamicOrderRevenue = salesOrders
    .filter((o) => o.status === "CONFIRMED" || o.status === "FULFILLED")
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const revenueDisplay = formatVND(dynamicOrderRevenue);

  const customersCountDisplay = customers.length.toString();
  const ordersCountDisplay = salesOrders.length.toString();
  
  const currentAvailableStock = products.reduce((sum, p) => sum + ((Number(p.onHand) || 0) - (Number(p.reserved) || 0)), 0);
  const stockDisplay = formatNumber(currentAvailableStock);

  // Sparklines data
  const sparklineCustomers = [{ v: 30 }, { v: 45 }, { v: 35 }, { v: 60 }, { v: 50 }, { v: 75 }, { v: 95 }];
  const sparklineOrders = [{ v: 40 }, { v: 55 }, { v: 48 }, { v: 70 }, { v: 65 }, { v: 85 }, { v: 110 }];
  const sparklineRevenue = [{ v: 50 }, { v: 70 }, { v: 60 }, { v: 90 }, { v: 80 }, { v: 105 }, { v: 130 }];
  const sparklineStock = [{ v: 85 }, { v: 80 }, { v: 90 }, { v: 75 }, { v: 95 }, { v: 90 }, { v: 100 }];

  return (
    <div className="space-y-6 w-full">
      {/* Page Title & Time Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tổng quan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Chào mừng bạn trở lại! Dưới đây là tổng quan hoạt động của doanh nghiệp.
          </p>
        </div>

        {/* Time Filter Button Dropdown */}
        <div className="relative" ref={timeDropdownRef}>
          <button
            type="button"
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{timeRange}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                showTimeDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showTimeDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-40 animate-scale-up text-xs">
              {timeOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelectTime(opt)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    timeRange === opt
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{opt}</span>
                  {timeRange === opt && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 1: 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/crm/customers" className="block hover:-translate-y-0.5 transition-transform">
          <MetricCard
            title="Khách hàng mới"
            value={customersCountDisplay}
            growth="12.5%"
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            chartColor="#3B82F6"
            sparklineData={sparklineCustomers}
          />
        </Link>

        <Link href="/sales/orders" className="block hover:-translate-y-0.5 transition-transform">
          <MetricCard
            title="Đơn hàng"
            value={ordersCountDisplay}
            growth="18.7%"
            icon={ShoppingCart}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            chartColor="#10B981"
            sparklineData={sparklineOrders}
          />
        </Link>

        <Link href="/reports" className="block hover:-translate-y-0.5 transition-transform">
          <MetricCard
            title="Doanh thu"
            value={revenueDisplay}
            growth="22.1%"
            icon={Package}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            chartColor="#8B5CF6"
            sparklineData={sparklineRevenue}
          />
        </Link>

        <Link href="/inventory/products" className="block hover:-translate-y-0.5 transition-transform">
          <MetricCard
            title="Tồn kho sẵn có"
            value={stockDisplay}
            growth="5.3%"
            icon={Boxes}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            chartColor="#F59E0B"
            sparklineData={sparklineStock}
          />
        </Link>
      </div>

      {/* Row 2: Revenue Chart (50%) + Revenue Structure Donut (25%) + Recent Activities (25%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6">
          <RevenueChart />
        </div>
        <div className="lg:col-span-3">
          <RevenueStructureChart />
        </div>
        <div className="lg:col-span-3">
          <RecentActivities />
        </div>
      </div>

      {/* Row 3: CRM Funnel (33%) + Inventory Low-Stock Alerts (37%) + HR Overview (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <CrmFunnel />
        </div>
        <div className="lg:col-span-4">
          <InventoryAlerts />
        </div>
        <div className="lg:col-span-4">
          <HrOverview />
        </div>
      </div>
    </div>
  );
}
