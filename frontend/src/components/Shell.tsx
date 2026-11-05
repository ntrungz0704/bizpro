"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
