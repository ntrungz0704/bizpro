"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  icon?: boolean;
  className?: string;
}

export default function ShinyButton({
  children,
  variant = "primary",
  size = "md",
  href,
  icon = false,
  className = "",
  ...props
}: ShinyButtonProps) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(window.matchMedia("(hover: hover) and (min-width: 768px)").matches);
  }, []);

  const sizeClasses = {
    sm: "px-4 py-2 text-xs font-semibold rounded-lg gap-1.5",
    md: "px-5 py-2.5 text-sm font-semibold rounded-xl gap-2",
    lg: "px-7 py-3.5 text-base font-bold rounded-2xl gap-2.5 shadow-lg",
  };

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/30",
    secondary:
      "bg-white text-slate-800 border border-slate-200/90 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-blue-600",
    outline:
      "bg-transparent text-blue-600 border border-blue-500/30 hover:bg-blue-50/50 hover:border-blue-500",
    ghost:
      "bg-transparent text-slate-700 hover:text-blue-600 hover:bg-slate-100/60 border border-transparent",
  };

  const content = (
    <span className="relative z-10 flex items-center justify-center gap-2">
      {children}
      {icon && (
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </span>
  );

  const baseClasses = `group relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 active:scale-95 disabled:opacity-60 disabled:pointer-events-none select-none ${sizeClasses[size]} ${variantClasses[variant]} ${
    isDesktop ? "hover:scale-[1.02] hover:-translate-y-0.5" : ""
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {/* Shimmer light effect for desktop (React Bits style) */}
        {isDesktop && variant === "primary" && (
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
        )}
        {content}
      </Link>
    );
  }

  return (
    <button className={baseClasses} {...props}>
      {isDesktop && variant === "primary" && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      )}
      {content}
    </button>
  );
}
