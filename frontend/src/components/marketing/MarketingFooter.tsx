"use client";

import React from "react";
import Link from "next/link";
import BizProLogo from "@/components/BizProLogo";

export default function MarketingFooter() {
  return (
    <footer className="w-full bg-[#0B1220] text-surface-container-lowest pt-20 pb-12 border-t border-[#1E293B]">
      <div className="max-w-7xl mx-auto px-margin">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl pb-16">
          {/* Cột 1: Thông tin thương hiệu & Địa chỉ */}
          <div className="lg:col-span-1 flex flex-col gap-space-md">
            <BizProLogo variant="full" size="md" theme="dark" href="/" />
            <p className="font-body-md text-body-md text-[#94A3B8] leading-relaxed">
              Nền tảng hợp nhất vận hành doanh nghiệp thế hệ mới. Đơn giản hóa quy trình, tối ưu nguồn lực và thúc đẩy tăng trưởng bền vững.
            </p>
            <div className="space-y-space-xs font-body-md text-body-md text-[#94A3B8] pt-space-xs">
              <div className="flex items-start gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-surface-container-lowest shrink-0 mt-0.5">
                  location_on
                </span>
                <span>Hà Nội: Tầng 12, Keangnam Landmark 72, Nam Từ Liêm</span>
              </div>
              <div className="flex items-start gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-surface-container-lowest shrink-0 mt-0.5">
                  location_on
                </span>
                <span>TP. HCM: Tầng 8, Bitexco Financial Tower, Quận 1</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-surface-container-lowest shrink-0">
                  call
                </span>
                <span>Hotline: 1900 6886 (8:00 - 18:00)</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[18px] text-surface-container-lowest shrink-0">
                  mail
                </span>
                <span>contact@bizpro.vn</span>
              </div>
            </div>
          </div>

          {/* Cột 2: Sản phẩm */}
          <div>
            <h4 className="font-label-md text-label-md uppercase tracking-wider text-surface-container-lowest mb-space-md font-semibold">
              Sản phẩm
            </h4>
            <ul className="space-y-space-sm font-body-md text-body-md text-[#94A3B8]">
              <li>
                <Link href="/features#crm" className="hover:text-surface-container-lowest transition-colors">
                  Quản lý CRM
                </Link>
              </li>
              <li>
                <Link href="/features#inventory" className="hover:text-surface-container-lowest transition-colors">
                  Kho hàng & Tồn kho
                </Link>
              </li>
              <li>
                <Link href="/features#orders" className="hover:text-surface-container-lowest transition-colors">
                  Quản lý Đơn hàng
                </Link>
              </li>
              <li>
                <Link href="/features#hrm" className="hover:text-surface-container-lowest transition-colors">
                  Nhân sự & Tiền lương
                </Link>
              </li>
              <li>
                <Link href="/features#bi" className="hover:text-surface-container-lowest transition-colors">
                  Báo cáo phân tích BI
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Giải pháp */}
          <div>
            <h4 className="font-label-md text-label-md uppercase tracking-wider text-surface-container-lowest mb-space-md font-semibold">
              Giải pháp
            </h4>
            <ul className="space-y-space-sm font-body-md text-body-md text-[#94A3B8]">
              <li>
                <Link href="/solutions#retail" className="hover:text-surface-container-lowest transition-colors">
                  Bán lẻ & TMĐT
                </Link>
              </li>
              <li>
                <Link href="/solutions#wholesale" className="hover:text-surface-container-lowest transition-colors">
                  Bán buôn & Phân phối
                </Link>
              </li>
              <li>
                <Link href="/solutions#sme" className="hover:text-surface-container-lowest transition-colors">
                  Doanh nghiệp SME
                </Link>
              </li>
              <li>
                <Link href="/solutions#chain" className="hover:text-surface-container-lowest transition-colors">
                  Chuỗi nhiều chi nhánh
                </Link>
              </li>
              <li>
                <Link href="/solutions#manufacturing" className="hover:text-surface-container-lowest transition-colors">
                  Sản xuất gia công
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Tài nguyên */}
          <div>
            <h4 className="font-label-md text-label-md uppercase tracking-wider text-surface-container-lowest mb-space-md font-semibold">
              Tài nguyên
            </h4>
            <ul className="space-y-space-sm font-body-md text-body-md text-[#94A3B8]">
              <li>
                <Link href="/resources" className="hover:text-surface-container-lowest transition-colors">
                  Tài liệu hướng dẫn
                </Link>
              </li>
              <li>
                <Link href="/resources#api" className="hover:text-surface-container-lowest transition-colors">
                  API & Kết nối hệ thống
                </Link>
              </li>
              <li>
                <Link href="/customers" className="hover:text-surface-container-lowest transition-colors">
                  Câu chuyện khách hàng
                </Link>
              </li>
              <li>
                <Link href="/resources#blog" className="hover:text-surface-container-lowest transition-colors">
                  Blog kiến thức quản trị
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-surface-container-lowest transition-colors">
                  Câu hỏi thường gặp (FAQ)
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 5: Công ty & Pháp lý */}
          <div>
            <h4 className="font-label-md text-label-md uppercase tracking-wider text-surface-container-lowest mb-space-md font-semibold">
              Công ty & Pháp lý
            </h4>
            <ul className="space-y-space-sm font-body-md text-body-md text-[#94A3B8]">
              <li>
                <Link href="/about" className="hover:text-surface-container-lowest transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-surface-container-lowest transition-colors">
                  Bảng giá dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-surface-container-lowest transition-colors">
                  Liên hệ hợp tác
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-surface-container-lowest transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-surface-container-lowest transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-space-lg border-t border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-space-md text-[#94A3B8] font-body-md text-body-md">
          <div className="flex items-center gap-space-md flex-wrap">
            <p>© 2026 BizPro+ Platform JSC. Bản quyền được bảo lưu.</p>
            <span className="hidden md:inline text-outline-variant">•</span>
            <span className="inline-flex items-center gap-space-xs text-xs text-[#94A3B8]">
              <span className="material-symbols-outlined text-[16px] text-primary-fixed">
                verified_user
              </span>
              Tiêu chuẩn bảo mật ISO 27001:2022
            </span>
          </div>
          <div className="flex items-center gap-space-lg">
            <span className="font-caption text-caption text-[#94A3B8]">
              Chứng thực bởi Trung tâm Giám sát an toàn không gian mạng Quốc gia (NCSC)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
