"use client";

import React from "react";

interface BizProLogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function BizProLogo({
  variant = "full",
  size = "md",
  className = "",
}: BizProLogoProps) {
  // Dimension mappings
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Dynamic Geometric Core SVG Icon */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center shrink-0 drop-shadow-[0_4px_12px_rgba(37,99,235,0.4)] transition-transform duration-300 hover:scale-105`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Top Isometric Facet */}
            <linearGradient id="topFacet" x1="24" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>

            {/* Left Isometric Facet */}
            <linearGradient id="leftFacet" x1="6" y1="14" x2="24" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* Right Isometric Facet */}
            <linearGradient id="rightFacet" x1="42" y1="14" x2="24" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            {/* Glowing Plus Gradient */}
            <linearGradient id="plusGlow" x1="16" y1="16" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            {/* Glow Filter */}
            <filter id="neonBloom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Isometric Hexagon Core */}
          <polygon
            points="24,4 42,14 42,34 24,44 6,34 6,14"
            fill="url(#leftFacet)"
            stroke="#1E293B"
            strokeWidth="1"
          />

          {/* Top Facet */}
          <polygon
            points="24,4 42,14 24,24 6,14"
            fill="url(#topFacet)"
            opacity="0.9"
          />

          {/* Right Facet */}
          <polygon
            points="24,24 42,14 42,34 24,44"
            fill="url(#rightFacet)"
            opacity="0.95"
          />

          {/* Left Facet Highlight */}
          <polygon
            points="6,14 24,24 24,44 6,34"
            fill="url(#leftFacet)"
          />

          {/* Inner Geometric Shield Overlay */}
          <polygon
            points="24,12 34,18 34,30 24,36 14,30 14,18"
            fill="#0B132B"
            fillOpacity="0.75"
            stroke="#38BDF8"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Glowing Plus (+) Core Symbol */}
          <g filter="url(#neonBloom)">
            {/* Horizontal Bar */}
            <rect
              x="18"
              y="22.5"
              width="12"
              height="3"
              rx="1.5"
              fill="url(#plusGlow)"
            />
            {/* Vertical Bar */}
            <rect
              x="22.5"
              y="18"
              width="3"
              height="12"
              rx="1.5"
              fill="url(#plusGlow)"
            />
          </g>

          {/* Micro Tech Accents */}
          <circle cx="24" cy="4" r="1.5" fill="#38BDF8" />
          <circle cx="42" cy="14" r="1.5" fill="#38BDF8" />
          <circle cx="42" cy="34" r="1.5" fill="#2563EB" />
          <circle cx="24" cy="44" r="1.5" fill="#38BDF8" />
          <circle cx="6" cy="34" r="1.5" fill="#1E40AF" />
          <circle cx="6" cy="14" r="1.5" fill="#38BDF8" />
        </svg>
      </div>

      {/* Typography for Full Variant */}
      {variant === "full" && (
        <div className="flex items-center tracking-tight font-extrabold leading-none">
          <span className={`${textSizes[size]} text-white font-black tracking-tight`}>
            Biz
          </span>
          <span className={`${textSizes[size]} text-slate-200 font-bold ml-0.5 tracking-tight`}>
            Pro
          </span>
          <span
            className={`${textSizes[size]} font-black bg-gradient-to-tr from-sky-400 to-blue-500 bg-clip-text text-transparent ml-0.5 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]`}
          >
            +
          </span>
        </div>
      )}
    </div>
  );
}
