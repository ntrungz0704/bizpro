"use client";

import React from "react";
import Link from "next/link";

interface BizProLogoProps {
  variant?: "full" | "icon" | "with-tagline";
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "dark" | "light";
  className?: string;
  href?: string;
  showTagline?: boolean;
}

export default function BizProLogo({
  variant = "full",
  size = "md",
  theme = "light",
  className = "",
  href,
  showTagline = false,
}: BizProLogoProps) {
  const isLight = theme === "light";

  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const taglineSizes = {
    sm: "text-[7px]",
    md: "text-[9px]",
    lg: "text-[10px]",
    xl: "text-[12px]",
  };

  // Modern Stylized B with Growth Bars & Upward Growth Arrow (↗)
  const logoEmblem = (
    <div
      className={`${iconSizes[size]} relative flex items-center justify-center shrink-0 drop-shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition-transform duration-200 group-hover:scale-105`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={`bpGrad_${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="45%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id={`arrowGrad_${theme}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#00F0FF" />
          </linearGradient>
        </defs>

        {/* Outer Dark Squircle Container as in official identity badge */}
        <rect width="100" height="100" rx="22" fill={isLight ? "#0B1530" : "#0F172A"} />

        {/* Stylized 'B' Body with Gradient */}
        <path
          d="M20 25C20 18.37 25.37 13 32 13H58C71.25 13 82 23.75 82 37C82 44.5 78.5 51.2 73 55.5C80 59.8 84 67.2 84 76C84 89.25 73.25 99 60 99H32C25.37 99 20 93.63 20 87V25Z"
          fill={`url(#bpGrad_${theme})`}
        />

        {/* Top Inner Cutout Chamber */}
        <path d="M34 25H56C61.5 25 66 29.5 66 35C66 40.5 61.5 45 56 45H34V25Z" fill={isLight ? "#0B1530" : "#0F172A"} />

        {/* Bottom Inner Cutout Chamber */}
        <path d="M34 57H58C63.5 57 68 61.5 68 67C68 72.5 63.5 77 58 77H34V57Z" fill={isLight ? "#0B1530" : "#0F172A"} />

        {/* 3 Ascending Growth Bar Chart Columns */}
        <rect x="38" y="68" width="5" height="7" rx="1.5" fill={`url(#bpGrad_${theme})`} />
        <rect x="46" y="64" width="5" height="11" rx="1.5" fill={`url(#bpGrad_${theme})`} />
        <rect x="54" y="59" width="5" height="16" rx="1.5" fill={`url(#bpGrad_${theme})`} />

        {/* Upward Growth Arrow (↗) */}
        <path
          d="M46 45L68 23M68 23H56M68 23V35"
          stroke={`url(#arrowGrad_${theme})`}
          strokeWidth="4.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  const isFull = variant === "full" || variant === "with-tagline";
  const shouldDisplayTagline = showTagline || variant === "with-tagline";

  const content = (
    <div
      className={`inline-flex items-center gap-2.5 select-none shrink-0 group cursor-pointer ${className}`}
    >
      {logoEmblem}

      {/* Typography: Wordmark with High Contrast & Gradient Pro */}
      {isFull && (
        <div className="flex flex-col justify-center tracking-tight leading-none">
          <div className="flex items-center">
            <span
              className={`${textSizes[size]} font-extrabold tracking-tight ${
                isLight ? "text-[#0B1530]" : "text-white"
              }`}
            >
              Biz
            </span>
            <span
              className={`${textSizes[size]} font-extrabold tracking-tight ml-0.5 bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent`}
            >
              Pro
            </span>
          </div>
          {shouldDisplayTagline && (
            <span
              className={`${taglineSizes[size]} font-bold tracking-[0.16em] uppercase mt-0.5 ${
                isLight ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Drive Business Forward
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
