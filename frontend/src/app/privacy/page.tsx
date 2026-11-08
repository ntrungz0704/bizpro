"use client";

import React from "react";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function PrivacyPage() {
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
              <span className="material-symbols-outlined text-[26px]">shield</span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary">
                PHÁP LÝ &amp; BẢO VỆ DỮ LIỆU
              </span>
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-0.5">
                Chính sách bảo mật thông tin
              </h1>
            </div>
          </div>
          <p className="font-caption text-caption text-on-surface-variant mb-space-xl">
            Cập nhật lần cuối: Tháng 11/2026 • Tuân thủ Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân &amp; Tiêu chuẩn ISO 27001:2022
          </p>

          <div className="space-y-space-lg font-body-md text-body-md text-on-surface-variant leading-relaxed">
            <div className="bg-surface-container-lowest p-space-xl rounded-2xl border border-surface-container shadow-sm">
              <h2 className="font-title-md text-title-md font-bold text-on-surface mb-space-xs">
                1. Cam kết quyền sở hữu và Bảo vệ dữ liệu doanh nghiệp
              </h2>
              <p>
                Công ty Cổ phần Nền tảng Doanh nghiệp BizPro+ (BizPro+ Platform JSC) cam kết bảo mật tuyệt đối toàn bộ dữ liệu kinh doanh, thông tin khách hàng, số liệu đơn hàng, kho vận và hồ sơ nhân sự của Quý khách hàng. Quý khách hàng là chủ sở hữu hợp pháp duy nhất của mọi dữ liệu được lưu trữ trên nền tảng.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-space-xl rounded-2xl border border-surface-container shadow-sm space-y-space-sm">
              <h2 className="font-title-md text-title-md font-bold text-on-surface">
                2. Hạ tầng kỹ thuật và Tiêu chuẩn mã hóa
              </h2>
              <p>
                Mọi kết nối truyền tải giữa thiết bị người dùng và máy chủ BizPro+ đều được mã hóa bằng giao thức Transport Layer Security (TLS 1.3). Dữ liệu tĩnh (Data at Rest) được mã hóa bằng tiêu chuẩn mã hóa quân đội AES-256. Hệ thống thực hiện sao lưu dự phòng (Automated Snapshot Backup) mỗi 6 giờ và lưu trữ phân tán tại hai trung tâm dữ liệu độc lập chuẩn Tier 3 tại Việt Nam.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-space-xl rounded-2xl border border-surface-container shadow-sm space-y-space-sm">
              <h2 className="font-title-md text-title-md font-bold text-on-surface">
                3. Quyền kết xuất và di chuyển dữ liệu
              </h2>
              <p>
                Doanh nghiệp có toàn quyền yêu cầu sao lưu toàn bộ cơ sở dữ liệu hoặc kết xuất dữ liệu sang định dạng Excel/CSV/JSON bất kỳ lúc nào thông qua trang Quản trị hệ thống hoặc gửi văn bản chính thức đến bộ phận Hỗ trợ khách hàng.
              </p>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
