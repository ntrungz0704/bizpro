"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BizProLogo from "@/components/BizProLogo";

export default function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const linkClass = (path: string) =>
    `py-space-sm transition-colors font-body-md text-body-md inline-flex items-center gap-space-xs ${
      isActive(path)
        ? "text-primary font-body-md-medium border-b-2 border-primary"
        : "text-on-surface-variant hover:text-on-surface"
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 max-w-7xl mx-auto px-margin flex items-center justify-between gap-gutter">
        {/* Brand Logo - Unified Clean Component */}
        <BizProLogo variant="full" size="md" href="/" />

        {/* Desktop Navigation */}
        <nav
          className="hidden lg:flex items-center gap-space-lg"
          data-active-classes="text-primary font-body-md-medium border-b-2 border-primary"
        >
          <Link href="/" className={linkClass("/")}>
            Trang chủ
          </Link>

          {/* Dropdown: Sản phẩm */}
          <div className="relative group py-space-sm">
            <Link href="/features" className={linkClass("/features")}>
              <span>Sản phẩm</span>
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:rotate-180">
                expand_more
              </span>
            </Link>
            <div className="absolute left-0 top-full hidden group-hover:block w-72 pt-space-xs">
              <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_6px_-1px_rgba(15,23,42,0.07),0_2px_4px_-2px_rgba(15,23,42,0.04)] border border-surface-container p-space-sm flex flex-col gap-space-xs">
                <Link
                  href="/features#crm"
                  className="p-space-sm rounded-lg hover:bg-surface-container-low transition-colors block"
                >
                  <div className="font-body-md-medium text-body-md-medium text-on-surface">
                    CRM &amp; Bán hàng
                  </div>
                  <div className="font-caption text-caption text-on-surface-variant">
                    Quản trị quan hệ &amp; luồng giao dịch
                  </div>
                </Link>
                <Link
                  href="/features#inventory"
                  className="p-space-sm rounded-lg hover:bg-surface-container-low transition-colors block"
                >
                  <div className="font-body-md-medium text-body-md-medium text-on-surface">
                    Kho hàng &amp; Tồn kho
                  </div>
                  <div className="font-caption text-caption text-on-surface-variant">
                    Kiểm soát xuất nhập tồn thời gian thực
                  </div>
                </Link>
                <Link
                  href="/features#orders"
                  className="p-space-sm rounded-lg hover:bg-surface-container-low transition-colors block"
                >
                  <div className="font-body-md-medium text-body-md-medium text-on-surface">
                    Quản lý Đơn hàng
                  </div>
                  <div className="font-caption text-caption text-on-surface-variant">
                    Tự động hoá xử lý đa kênh
                  </div>
                </Link>
                <Link
                  href="/features#hrm"
                  className="p-space-sm rounded-lg hover:bg-surface-container-low transition-colors block"
                >
                  <div className="font-body-md-medium text-body-md-medium text-on-surface">
                    Nhân sự &amp; Tiền lương
                  </div>
                  <div className="font-caption text-caption text-on-surface-variant">
                    Chấm công, KPI và tính lương tự động
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Dropdown: Giải pháp */}
          <div className="relative group py-space-sm">
            <Link href="/solutions" className={linkClass("/solutions")}>
              <span>Giải pháp</span>
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:rotate-180">
                expand_more
              </span>
            </Link>
            <div className="absolute left-0 top-full hidden group-hover:block w-72 pt-space-xs">
              <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_6px_-1px_rgba(15,23,42,0.07),0_2px_4px_-2px_rgba(15,23,42,0.04)] border border-surface-container p-space-sm flex flex-col gap-space-xs">
                <Link
                  href="/solutions#retail"
                  className="p-space-sm rounded-lg hover:bg-surface-container-low transition-colors block"
                >
                  <div className="font-body-md-medium text-body-md-medium text-on-surface">
                    Bán lẻ &amp; TMĐT
                  </div>
                  <div className="font-caption text-caption text-on-surface-variant">
                    Tích hợp sàn và cửa hàng vật lý
                  </div>
                </Link>
                <Link
                  href="/solutions#wholesale"
                  className="p-space-sm rounded-lg hover:bg-surface-container-low transition-colors block"
                >
                  <div className="font-body-md-medium text-body-md-medium text-on-surface">
                    Phân phối &amp; Bán buôn
                  </div>
                  <div className="font-caption text-caption text-on-surface-variant">
                    Tối ưu chuỗi cung ứng và đại lý
                  </div>
                </Link>
                <Link
                  href="/solutions#sme"
                  className="p-space-sm rounded-lg hover:bg-surface-container-low transition-colors block"
                >
                  <div className="font-body-md-medium text-body-md-medium text-on-surface">
                    Doanh nghiệp SME
                  </div>
                  <div className="font-caption text-caption text-on-surface-variant">
                    Vận hành tinh gọn, triển khai nhanh
                  </div>
                </Link>
                <Link
                  href="/solutions#chain"
                  className="p-space-sm rounded-lg hover:bg-surface-container-low transition-colors block"
                >
                  <div className="font-body-md-medium text-body-md-medium text-on-surface">
                    Chuỗi Đa chi nhánh
                  </div>
                  <div className="font-caption text-caption text-on-surface-variant">
                    Đồng bộ quản trị hệ thống đa điểm
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <Link href="/pricing" className={linkClass("/pricing")}>
            Bảng giá
          </Link>
          <Link href="/customers" className={linkClass("/customers")}>
            Khách hàng
          </Link>
          <Link href="/about" className={linkClass("/about")}>
            Về chúng tôi
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-space-md">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center px-space-md py-space-sm rounded-lg font-body-md-medium text-body-md-medium text-on-surface hover:bg-surface-container transition-colors"
          >
            Đăng nhập
          </Link>

          <Link
            href="/signup"
            className="inline-flex items-center px-space-lg py-space-sm rounded-lg bg-primary-container text-on-primary font-body-md-medium text-body-md-medium hover:bg-primary transition-colors shadow-sm"
          >
            Dùng thử miễn phí
          </Link>

          <Link
            href="/dashboard"
            aria-label="Vào App quản trị"
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-on-primary text-[18px]">
              person
            </span>
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-container-lowest border-b border-surface-container px-margin py-space-md flex flex-col gap-space-sm shadow-xl animate-fade-in max-h-[calc(100vh-80px)] overflow-y-auto">
          <Link
            href="/"
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              isActive("/") && pathname === "/"
                ? "bg-primary-fixed text-on-primary-fixed"
                : "text-on-surface hover:bg-surface-container"
            }`}
          >
            Trang chủ
          </Link>

          <div className="border-t border-surface-container/60 my-1 pt-1">
            <div className="px-3 py-1 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Sản phẩm
            </div>
            <Link
              href="/features"
              className="px-3 py-2 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container flex items-center justify-between"
            >
              <span>Tổng quan tất cả tính năng</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <Link
              href="/features#crm"
              className="px-5 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-primary block"
            >
              CRM &amp; Bán hàng
            </Link>
            <Link
              href="/features#inventory"
              className="px-5 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-primary block"
            >
              Kho hàng &amp; Tồn kho
            </Link>
            <Link
              href="/features#orders"
              className="px-5 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-primary block"
            >
              Quản lý Đơn hàng
            </Link>
            <Link
              href="/features#hrm"
              className="px-5 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-primary block"
            >
              Nhân sự &amp; Tiền lương
            </Link>
          </div>

          <div className="border-t border-surface-container/60 my-1 pt-1">
            <div className="px-3 py-1 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Giải pháp
            </div>
            <Link
              href="/solutions"
              className="px-3 py-2 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container flex items-center justify-between"
            >
              <span>Tất cả giải pháp ngành</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
            <Link
              href="/solutions#retail"
              className="px-5 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-primary block"
            >
              Bán lẻ &amp; TMĐT
            </Link>
            <Link
              href="/solutions#wholesale"
              className="px-5 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-primary block"
            >
              Phân phối &amp; Bán buôn
            </Link>
            <Link
              href="/solutions#sme"
              className="px-5 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-primary block"
            >
              Doanh nghiệp SME
            </Link>
            <Link
              href="/solutions#chain"
              className="px-5 py-1.5 rounded-lg text-xs text-on-surface-variant hover:text-primary block"
            >
              Chuỗi Đa chi nhánh
            </Link>
          </div>

          <div className="border-t border-surface-container/60 my-1 pt-1 flex flex-col gap-1">
            <Link
              href="/pricing"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive("/pricing")
                  ? "bg-primary-fixed text-on-primary-fixed"
                  : "text-on-surface hover:bg-surface-container"
              }`}
            >
              Bảng giá dịch vụ
            </Link>
            <Link
              href="/customers"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive("/customers")
                  ? "bg-primary-fixed text-on-primary-fixed"
                  : "text-on-surface hover:bg-surface-container"
              }`}
            >
              Khách hàng &amp; Case Studies
            </Link>
            <Link
              href="/about"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive("/about")
                  ? "bg-primary-fixed text-on-primary-fixed"
                  : "text-on-surface hover:bg-surface-container"
              }`}
            >
              Về chúng tôi
            </Link>
            <Link
              href="/resources"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive("/resources")
                  ? "bg-primary-fixed text-on-primary-fixed"
                  : "text-on-surface hover:bg-surface-container"
              }`}
            >
              Tài nguyên &amp; Cẩm nang
            </Link>
            <Link
              href="/faq"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive("/faq")
                  ? "bg-primary-fixed text-on-primary-fixed"
                  : "text-on-surface hover:bg-surface-container"
              }`}
            >
              Hỏi đáp (FAQ)
            </Link>
            <Link
              href="/contact"
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive("/contact")
                  ? "bg-primary-fixed text-on-primary-fixed"
                  : "text-on-surface hover:bg-surface-container"
              }`}
            >
              Liên hệ hợp tác
            </Link>
          </div>

          <div className="border-t border-surface-container/60 pt-3 flex flex-col gap-2">
            <Link
              href="/signup"
              className="w-full h-11 rounded-lg bg-primary-container text-on-primary font-body-md-medium text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Dùng thử miễn phí 14 ngày</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <Link
              href="/login"
              className="w-full h-11 rounded-lg bg-surface-container text-on-surface font-body-md-medium text-sm flex items-center justify-center"
            >
              Đăng nhập tài khoản
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
