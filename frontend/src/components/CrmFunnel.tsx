"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function CrmFunnel() {
  const { deals } = useApp();

  // Dynamically calculate stage counts from live deals state
  const newDealsCount = deals.filter((d) => d.stage === "New").length;
  const contactedDealsCount = deals.filter(
    (d) => d.stage === "Contacted" || d.stage === "Qualified"
  ).length;
  const negotiationDealsCount = deals.filter(
    (d) => d.stage === "Proposal" || d.stage === "Negotiation"
  ).length;
  const wonDealsCount = deals.filter((d) => d.stage === "Won").length;

  const stages = [
    { name: "Mới", count: newDealsCount, color: "#3B82F6" },
    { name: "Đã liên hệ", count: contactedDealsCount, color: "#10B981" },
    { name: "Đang đàm phán", count: negotiationDealsCount, color: "#F59E0B" },
    { name: "Thành công", count: wonDealsCount, color: "#8B5CF6" },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">
          CRM - Cơ hội kinh doanh
        </h3>
        <Link
          href="/crm/deals"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          Xem chi tiết <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Funnel Visual + Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* SVG Funnel Shape */}
        <div className="flex justify-center">
          <svg viewBox="0 0 160 130" className="w-36 h-28 drop-shadow-sm">
            {/* Level 1: Mới */}
            <polygon points="10,5 150,5 135,32 25,32" fill="#3B82F6" />
            {/* Level 2: Đã liên hệ */}
            <polygon points="27,36 133,36 120,63 40,63" fill="#10B981" />
            {/* Level 3: Đang đàm phán */}
            <polygon points="42,67 118,67 105,94 55,94" fill="#F59E0B" />
            {/* Level 4: Thành công */}
            <polygon points="57,98 103,98 90,125 70,125" fill="#8B5CF6" />
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-2.5">
          {stages.map((stage) => (
            <div
              key={stage.name}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: stage.color }}
                ></span>
                <span className="text-slate-600 font-medium">{stage.name}</span>
              </div>
              <span className="font-bold text-slate-900">{stage.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
