"use client";

import React from "react";
import Link from "next/link";

interface BizProLogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "dark" | "light";
  className?: string;
  href?: string;
}

export default function BizProLogo({
  variant = "full",
  size = "md",
  theme = "light",
  className = "",
  href,
}: BizProLogoProps) {
  const isLight = theme === "light";

  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const logoEmblem = (
    <div
      className={`${iconSizes[size]} relative flex items-center justify-center shrink-0 drop-shadow-[0_4px_14px_rgba(37,99,235,0.3)] transition-transform duration-200 group-hover:scale-105`}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={`bp-bg-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="45%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id={`bp-cyan-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>

        {/* Outer Squircle Shield */}
        <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#bp-bg-${theme})`} />

        {/* Precision Modern Capital 'B' Monogram using Fill-Rule Evenodd */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M 12 10 C 12 8.895 12.895 8 14 8 L 26 8 C 29.866 8 33 11.134 33 15 C 33 17.55 31.63 19.78 29.58 21 C 32.22 22.28 34 24.97 34 28 C 34 32.418 30.418 36 26 36 L 14 36 C 12.895 36 12 35.105 12 34 L 12 10 Z M 17 13 L 17 19 L 25 19 C 26.657 19 28 17.657 28 16 C 28 14.343 26.657 13 25 13 L 17 13 Z M 17 24 L 17 31 L 26 31 C 27.933 31 29.5 29.433 29.5 27.5 C 29.5 25.567 27.933 24 26 24 L 17 24 Z"
          fill="white"
        />

        {/* Dynamic Glowing Cyan Accent pill inside the lower loop of 'B' */}
        <circle cx="23.5" cy="27.5" r="2.2" fill={`url(#bp-cyan-${theme})`} />

        {/* Integrated Plus '+' Super-Badge Top Right */}
        <g transform="translate(32, 2)">
          <circle cx="7" cy="7" r="6.5" fill="#0B132B" stroke="#38BDF8" strokeWidth="1.8" />
          <path d="M7 4.2V9.8M4.2 7H9.8" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );

  const content = (
    <div
      className={`inline-flex items-center gap-2.5 select-none shrink-0 group cursor-pointer ${className}`}
    >
      {logoEmblem}

      {/* Typography: Wordmark with high-contrast theme support */}
      {variant === "full" && (
        <div className="flex items-center tracking-tight leading-none whitespace-nowrap">
          <span
            className={`${textSizes[size]} font-black tracking-tight ${
              isLight ? "text-[#0F172A]" : "text-white"
            }`}
          >
            Biz
          </span>
          <span
            className={`${textSizes[size]} font-black tracking-tight ml-0.5 ${
              isLight ? "text-primary-container" : "text-[#38BDF8]"
            }`}
          >
            Pro
          </span>
          <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-primary-container text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
            +
          </span>
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