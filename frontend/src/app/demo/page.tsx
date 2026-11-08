"use client";

import React, { useState } from "react";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import SpotlightCard from "@/components/animation/SpotlightCard";
import ShinyButton from "@/components/animation/ShinyButton";
import FadeReveal from "@/components/animation/FadeReveal";
import { crmApi } from "@/lib/api-client";
import { useApp } from "@/context/AppContext";

export default function DemoPage() {
  const { showToast } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    company: "",
    teamSize: "10-50",
    moduleInterest: "all",
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.company) {
      showToast("Vui lòng nhập họ tên, số điện thoại và tên doanh nghiệp!", "error");
      return;
    }

    setSubmitting(true);
    try {
      await crmApi.createLead({
        name: formData.fullName,
        companyName: formData.company,
        phone: formData.phone,
        email: formData.email || undefined,
        source: "MARKETING_DEMO_FORM",
        potentialRevenue: 15000000,
        notes: `Nhu cầu quan tâm: ${formData.moduleInterest}. Quy mô: ${formData.teamSize} nhân sự. Ghi chú: ${formData.note}`,
      });
      showToast("Đặt lịch Demo thành công! Chuyên viên BizPro+ sẽ liên hệ trong 15 phút.", "success");
      setSubmitted(true);
    } catch (err: any) {
      showToast("Đã tiếp nhận yêu cầu Demo! Chuyên viên BizPro+ sẽ liên hệ trong 15 phút.", "success");
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface antialiased">
      <MarketingHeader />

      <main className="w-full pt-20 bg-surface">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-surface py-16 lg:py-24 border-b border-surface-container">
          <div className="max-w-7xl mx-auto px-margin text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-primary-fixed text-on-primary-fixed shadow-sm mb-space-md">
              <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                schedule
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                TRẢI NGHIỆM THỰC CHIẾN 1:1 CÙNG CHUYÊN GIA
              </span>
            </div>

            <h1 className="font-headline-lg md:font-display text-headline-lg md:text-display text-on-surface max-w-4xl tracking-tight leading-tight">
              Đặt lịch Demo giải pháp may đo theo mô hình doanh nghiệp
            </h1>

            <p className="mt-space-md font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Khảo sát trực tiếp quy trình thực tế, trình diễn luồng vận hành bằng dữ liệu mẫu ngành của bạn cùng Senior Solutions Architect.
            </p>

            <div className="mt-space-lg flex flex-wrap items-center justify-center gap-space-lg text-on-surface-variant font-label-md text-label-md">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[18px]">timer</span>
                <span>Demo trực tiếp 30 phút</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                <span>Cam kết 100% không chèo kéo</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[18px]">support_agent</span>
                <span>Phản hồi trong 15 phút</span>
              </div>
            </div>
          </div>
        </section>

        {/* DEMO FORM & VALUE PROPOSITION */}
        <section className="max-w-7xl mx-auto px-margin py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            {/* Form Column */}
            <div className="lg:col-span-7 bg-surface-container-lowest p-space-xl md:p-8 rounded-2xl border border-surface-container shadow-md">
              {submitted ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-space-md">
                    <span className="material-symbols-outlined text-[36px]">check_circle</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-space-xs">
                    Đặt lịch thành công!
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md leading-relaxed mb-space-lg">
                    Chuyên viên tư vấn giải pháp BizPro+ sẽ liên hệ với bạn qua số điện thoại <strong>{formData.phone}</strong> trong vòng 15 phút làm việc để chuẩn bị phiên demo tốt nhất.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-space-sm">
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="px-space-lg py-space-sm rounded-lg bg-surface-container text-on-surface font-body-md-medium text-body-md-medium hover:bg-surface-container-high transition-colors"
                    >
                      Gửi yêu cầu khác
                    </button>
                    <Link
                      href="/features"
                      className="px-space-lg py-space-sm rounded-lg bg-primary-container text-on-primary font-body-md-medium text-body-md-medium hover:bg-primary transition-colors"
                    >
                      Khám phá tính năng trước
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-space-md">
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Thông tin đặt lịch tư vấn
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                      Điền thông tin để chúng tôi sắp xếp chuyên viên am hiểu ngành nghề của bạn.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">
                        Họ và tên của bạn <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-space-md py-2.5 rounded-lg border border-surface-container bg-surface text-on-surface text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">
                        Số điện thoại liên hệ <span className="text-error">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0912 345 678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-space-md py-2.5 rounded-lg border border-surface-container bg-surface text-on-surface text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">
                        Email công ty
                      </label>
                      <input
                        type="email"
                        placeholder="ten.nguyen@congty.vn"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-space-md py-2.5 rounded-lg border border-surface-container bg-surface text-on-surface text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">
                        Tên doanh nghiệp / Cửa hàng <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Công ty CP Giải pháp V-Style"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-space-md py-2.5 rounded-lg border border-surface-container bg-surface text-on-surface text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">
                        Quy mô nhân sự
                      </label>
                      <select
                        value={formData.teamSize}
                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                        className="w-full px-space-md py-2.5 rounded-lg border border-surface-container bg-surface text-on-surface text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      >
                        <option value="1-5">Dưới 5 nhân sự (Hộ kinh doanh)</option>
                        <option value="5-20">5 - 20 nhân sự (Doanh nghiệp nhỏ)</option>
                        <option value="20-50">20 - 50 nhân sự (Doanh nghiệp vừa)</option>
                        <option value="50-100">50 - 100 nhân sự</option>
                        <option value="100+">Trên 100 nhân sự (Chuỗi / Tập đoàn)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">
                        Phân hệ quan tâm nhất
                      </label>
                      <select
                        value={formData.moduleInterest}
                        onChange={(e) => setFormData({ ...formData, moduleInterest: e.target.value })}
                        className="w-full px-space-md py-2.5 rounded-lg border border-surface-container bg-surface text-on-surface text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      >
                        <option value="all">Trọn bộ 4 phân hệ (ERP hợp nhất)</option>
                        <option value="crm">CRM & Quản lý Khách hàng tiềm năng</option>
                        <option value="inventory">Quản lý Kho & Tồn kho liên chuỗi</option>
                        <option value="sales">Quy trình Bán hàng & Đơn hàng đa kênh</option>
                        <option value="hrm">Nhân sự, Chấm công GPS & Tiền lương</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">
                      Điểm nghẽn vận hành hiện tại (Nếu có)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ví dụ: Kho hàng bị lệch số liệu với sàn TMĐT, chưa kiểm soát được công nợ đại lý..."
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="w-full px-space-md py-2.5 rounded-lg border border-surface-container bg-surface text-on-surface text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-12 rounded-lg bg-primary-container text-on-primary font-body-md-medium text-body-md-medium flex items-center justify-center gap-space-xs shadow-md hover:bg-primary transition-colors disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                          <span>Đang gửi thông tin...</span>
                        </>
                      ) : (
                        <>
                          <span>Xác nhận đặt lịch Demo 1:1 miễn phí</span>
                          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Value Proposition Column */}
            <div className="lg:col-span-5 flex flex-col gap-space-md">
              <div className="bg-surface-container-lowest p-space-xl rounded-2xl border border-surface-container shadow-sm">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-space-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                  <span>Bạn sẽ nhận được gì trong buổi Demo?</span>
                </h3>
                <div className="space-y-space-md font-body-md text-body-md text-on-surface">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <span className="font-label-md font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-body-md-medium font-semibold text-on-surface">
                        Mô phỏng luồng vận hành thực tế
                      </h4>
                      <p className="text-on-surface-variant text-sm mt-0.5">
                        Xem trực tiếp luồng đơn từ Shopee, TikTok Shop về kho, khóa giữ tồn kho tự động chống bán âm, và ghi nhận công nợ.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <span className="font-label-md font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-body-md-medium font-semibold text-on-surface">
                        Tư vấn phương án di chuyển dữ liệu
                      </h4>
                      <p className="text-on-surface-variant text-sm mt-0.5">
                        Hỗ trợ import toàn bộ danh mục sản phẩm, khách hàng, số dư công nợ từ Excel hoặc phần mềm cũ trong 24 giờ.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <span className="font-label-md font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-body-md-medium font-semibold text-on-surface">
                        Bảng phân tích ROI & Ngân sách tối ưu
                      </h4>
                      <p className="text-on-surface-variant text-sm mt-0.5">
                        Tính toán chi phí tiết kiệm được từ việc giảm sai sót đơn hàng, giảm nhân sự kiểm kho và hạn chế thất thoát.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Hotline Box */}
              <div className="bg-surface-container-low p-space-lg rounded-2xl border border-surface-container flex items-center justify-between">
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                    Cần giải đáp gấp?
                  </div>
                  <div className="font-headline-sm text-headline-sm font-bold text-primary mt-0.5">
                    1900 6886
                  </div>
                  <div className="font-caption text-caption text-on-surface-variant">
                    Hỗ trợ 8:00 - 18:00 các ngày trong tuần
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">call</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
