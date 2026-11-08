"use client";

import React, { useState } from "react";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import SpotlightCard from "@/components/animation/SpotlightCard";
import ShinyButton from "@/components/animation/ShinyButton";
import { useApp } from "@/context/AppContext";

export default function ContactPage() {
  const { showToast } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    subject: "support",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.message) {
      showToast("Vui lòng nhập đầy đủ họ tên, số điện thoại và nội dung!", "error");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      showToast("Gửi thông điệp thành công! BizPro+ sẽ phản hồi sớm nhất.", "success");
    }, 600);
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
                headset_mic
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                KẾT NỐI TRỰC TIẾP &amp; VĂN PHÒNG TOÀN QUỐC
              </span>
            </div>

            <h1 className="font-headline-lg md:font-display text-headline-lg md:text-display text-on-surface max-w-4xl tracking-tight leading-tight">
              Đồng hành cùng doanh nghiệp bạn trên từng bước chuyển đổi số
            </h1>

            <p className="mt-space-md font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Dù bạn đang tìm hiểu giải pháp, cần hỗ trợ kỹ thuật hay đề xuất hợp tác kinh doanh, đội ngũ chuyên gia BizPro+ luôn sẵn sàng hỗ trợ.
            </p>
          </div>
        </section>

        {/* OFFICES GRID & CONTACT FORM */}
        <section className="max-w-7xl mx-auto px-margin py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            {/* Office Locations */}
            <div className="lg:col-span-5 space-y-space-md">
              <div className="bg-surface-container-lowest p-space-xl rounded-2xl border border-surface-container shadow-sm">
                <div className="flex items-center gap-space-sm mb-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">apartment</span>
                  </div>
                  <div>
                    <h3 className="font-title-md text-title-md font-bold text-on-surface">Trụ sở Hà Nội</h3>
                    <p className="font-caption text-caption text-on-surface-variant">Trung tâm Nghiên cứu &amp; Phát triển</p>
                  </div>
                </div>
                <div className="space-y-space-xs text-on-surface-variant font-body-md text-body-md mt-space-md">
                  <div className="flex items-start gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">location_on</span>
                    <span>Tầng 12, Keangnam Landmark 72, Đường Phạm Hùng, Quận Nam Từ Liêm, Hà Nội</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0">call</span>
                    <span>024 3999 8888</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0">mail</span>
                    <span>hanoi@bizpro.vn</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-space-xl rounded-2xl border border-surface-container shadow-sm">
                <div className="flex items-center gap-space-sm mb-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">domain</span>
                  </div>
                  <div>
                    <h3 className="font-title-md text-title-md font-bold text-on-surface">Chi nhánh TP. Hồ Chí Minh</h3>
                    <p className="font-caption text-caption text-on-surface-variant">Trung tâm Tư vấn &amp; Triển khai Miền Nam</p>
                  </div>
                </div>
                <div className="space-y-space-xs text-on-surface-variant font-body-md text-body-md mt-space-md">
                  <div className="flex items-start gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">location_on</span>
                    <span>Tầng 8, Bitexco Financial Tower, Số 2 Hải Triều, Bến Nghé, Quận 1, TP. HCM</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0">call</span>
                    <span>028 3999 8888</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0">mail</span>
                    <span>hcm@bizpro.vn</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-space-xl rounded-2xl border border-surface-container shadow-sm">
                <div className="flex items-center gap-space-sm mb-space-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">support_agent</span>
                  </div>
                  <div>
                    <h3 className="font-title-md text-title-md font-bold text-on-surface">Hỗ trợ Kỹ thuật 24/7</h3>
                    <p className="font-caption text-caption text-on-surface-variant">SLA phản hồi nhanh</p>
                  </div>
                </div>
                <div className="space-y-space-xs text-on-surface-variant font-body-md text-body-md mt-space-md">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0">phone_in_talk</span>
                    <span className="font-bold text-primary">Hotline: 1900 6886</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0">mark_email_read</span>
                    <span>support@bizpro.vn</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7 bg-surface-container-lowest p-space-xl md:p-8 rounded-2xl border border-surface-container shadow-md">
              {submitted ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-space-md">
                    <span className="material-symbols-outlined text-[36px]">check_circle</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-space-xs">
                    Thông tin đã được ghi nhận!
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md leading-relaxed mb-space-lg">
                    Cảm ơn bạn đã liên hệ với BizPro+. Đội ngũ phụ trách chuyên môn sẽ liên hệ lại với bạn trong thời gian sớm nhất.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-space-lg py-space-sm rounded-lg bg-primary-container text-on-primary font-body-md-medium text-body-md-medium hover:bg-primary transition-colors"
                  >
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-space-md">
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      Gửi tin nhắn cho chúng tôi
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                      Chúng tôi cam kết bảo mật thông tin và phản hồi trong vòng 2 giờ làm việc.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">
                        Họ và tên <span className="text-error">*</span>
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
                        Số điện thoại <span className="text-error">*</span>
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
                        Email liên hệ
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
                        Mục đích liên hệ
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-space-md py-2.5 rounded-lg border border-surface-container bg-surface text-on-surface text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      >
                        <option value="sales">Tư vấn mua gói dịch vụ &amp; Báo giá</option>
                        <option value="support">Hỗ trợ kỹ thuật &amp; Hướng dẫn sử dụng</option>
                        <option value="partnership">Hợp tác đại lý &amp; Tích hợp công nghệ</option>
                        <option value="press">Báo chí &amp; Tuyển dụng</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1 font-medium">
                      Nội dung tin nhắn <span className="text-error">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Mô tả chi tiết câu hỏi hoặc nhu cầu của bạn..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
                          <span>Đang gửi...</span>
                        </>
                      ) : (
                        <>
                          <span>Gửi thông điệp liên hệ</span>
                          <span className="material-symbols-outlined text-[20px]">send</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
