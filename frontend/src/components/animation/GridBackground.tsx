"use client";

import React from "react";

interface GridBackgroundProps {
  className?: string;
}

export default function GridBackground({ className = "" }: GridBackgroundProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden -z-10 ${className}`}
      aria-hidden="true"
    >
      {/* Ambient Gradient Glow Orbs */}
      <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent blur-[120px]" />
      <div className="absolute top-1/3 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-sky-400/10 via-blue-600/10 to-transparent blur-[120px]" />
      
      {/* High-tech SVG Grid with Radial Mask (React Bits style) */}
      <svg
        className="absolute inset-0 h-full w-full stroke-slate-300/40 [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="enterprise-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            patternTransform="translate(0, 0)"
          >
            <path d="M.5 40V.5H40" fill="none" strokeDasharray="3 3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth="0" fill="url(#enterprise-grid)" />
      </svg>
    </div>
  );
}
