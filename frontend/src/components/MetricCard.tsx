"use client";

import React, { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  growth: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  chartColor: string;
  sparklineData: { v: number }[];
}

export default function MetricCard({
  title,
  value,
  growth,
  icon: Icon,
  iconBg,
  iconColor,
  chartColor,
  sparklineData,
}: MetricCardProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 pt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{growth}</span>
          </div>
        </div>

        {/* Icon box */}
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>

      {/* Mini Sparkline Chart */}
      <div className="h-10 mt-3 -mx-2 -mb-2">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={chartColor}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#grad-${title})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-slate-50/50 rounded" />
        )}
      </div>
    </div>
  );
}
