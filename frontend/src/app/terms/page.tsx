"use client";

import React from "react";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface antialiased">
      <MarketingHeader />

      <main className="w-full pt-20 bg-surface">
        <section className="max-w-4xl mx-auto px-margin py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary mb-space-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Quay lại trang chủ</span>
          </Link>

          <div className="flex items-center gap-space-md mb-space-md">
            <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">gavel</span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary">
                ĐIỀU KHOẢN PHÁP LÝ
              </span>
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-0.5">
                Điều khoản dịch vụ BizPro+
              </h1>
            </div>
          </div>
          <p className="font-caption text-caption text-on-surface-variant mb-space-xl">
            Cập nhật lần cuối: Tháng 11/2026 • Áp dụng cho mọi tài khoản đăng ký sử dụng nền tảng BizPro+
          </p>

          <div className="space-y-space-lg font-body-md text-body-md text-on-surface-variant leading-relaxed">
            <div className="bg-surface-container-lowest p-space-xl rounded-2xl border border-surface-container shadow-sm">
              <h2 className="font-title-md text-title-md font-bold text-on-surface mb-space-xs">
                1. Chấp thuận điều khoản sử dụng
              </h2>
              <p>
                Bằng việc đăng ký tài khoản hoặc sử dụng bất kỳ tính năng nào của nền tảng BizPro+, Quý khách hàng đồng ý chịu sự ràng buộc của các điều khoản sử dụng này và Chính sách bảo mật dữ liệu của chúng tôi. Nếu đại diện cho một tổ chức doanh nghiệp, bạn xác nhận có đầy đủ thẩm quyền pháp lý để ràng buộc tổ chức đó.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-space-xl rounded-2xl border border-surface-container shadow-sm space-y-space-sm">
              <h2 className="font-title-md text-title-md font-bold text-on-surface">
                2. Cam kết chất lượng dịch vụ (SLA)
              </h2>
              <p>
                BizPro+ cam kết tỷ lệ thời gian hoạt động của hệ thống (Uptime SLA) đạt tối thiểu 99.98% mỗi tháng. Trong trường hợp xảy ra sự cố gián đoạn dịch vụ ngoài kế hoạch bảo trì đã thông báo trước, khách hàng được hưởng chính sách hoàn trả phí dịch vụ tương ứng theo quy định tại Hợp đồng cung cấp dịch vụ phần mềm.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-space-xl rounded-2xl border border-surface-container shadow-sm space-y-space-sm">
              <h2 className="font-title-md text-title-md font-bold text-on-surface">
                3. Trách nhiệm bảo mật tài khoản
              </h2>
              <p>
                Khách hàng có trách nhiệm bảo mật thông tin đăng nhập của các tài khoản nhân viên trực thuộc tổ chức. BizPro+ cung cấp công cụ phân quyền chi tiết (RBAC) và xác thực đa yếu tố (2FA) để doanh nghiệp chủ động quản trị rủi ro an toàn thông tin nội bộ.
              </p>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
