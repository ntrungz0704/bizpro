"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

// Routes that use the Public Marketing Layout (no internal ERP sidebar/navbar)
const isMarketingRoute = (pathname: string): boolean => {
  if (pathname === "/") return true;
  const publicPrefixes = [
    "/features",
    "/solutions",
    "/pricing",
    "/demo",
    "/contact",
    "/login",
    "/signup",
    "/privacy",
    "/terms",
    "/forgot-password",
    "/customers",
    "/about",
    "/resources",
    "/faq",
    "/onboarding",
    "/admin",
  ];
  return publicPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
};

export default function Shell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // If public marketing or auth route, render clean full-width content directly
  if (isMarketingRoute(pathname)) {
    return (
      <div
        className="min-h-screen w-full bg-surface text-on-surface flex flex-col justify-between"
        suppressHydrationWarning
      >
        {children}
      </div>
    );
  }

  // Internal ERP layout
  return (
    <div
      className="flex h-screen max-h-screen w-full overflow-hidden bg-[#F8FAFC]"
      suppressHydrationWarning
    >
      {/* Sidebar with Mobile Toggle */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className="flex-1 flex flex-col min-w-0 h-screen max-h-screen overflow-hidden"
        suppressHydrationWarning
      >
        <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main
          className="flex-1 p-4 sm:p-6 w-full overflow-y-auto"
          suppressHydrationWarning
        >
          {children}
        </main>
      </div>
    </div>
  );
}
