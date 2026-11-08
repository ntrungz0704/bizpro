"use client";

import React, { useState } from "react";
import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import SpotlightCard from "@/components/animation/SpotlightCard";
import ShinyButton from "@/components/animation/ShinyButton";

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openItems, setOpenItems] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const faqs = [
    {
      category: "deploy",
      q: "Thời gian triển khai BizPro+ cho một doanh nghiệp mất bao lâu?",
      a: "Với các doanh nghiệp SME và chuỗi bán lẻ tiêu chuẩn, thời gian khởi tạo và kích hoạt hệ thống chỉ mất từ 24 đến 48 giờ. Đội ngũ chuyên gia kỹ thuật BizPro+ sẽ đồng hành hỗ trợ import dữ liệu tồn kho, danh mục sản phẩm và đào tạo nhân sự trực tiếp 1-1."
    },
    {
      category: "deploy",
      q: "Chúng tôi đang dùng Excel hoặc phần mềm cũ, chuyển sang BizPro+ có khó không?",
      a: "Hoàn toàn đơn giản. BizPro+ cung cấp công cụ tự động chuyển đổi dữ liệu thông minh qua file mẫu Excel tiêu chuẩn. Đội ngũ kỹ thuật sẽ hỗ trợ rà soát, làm sạch và import toàn bộ dữ liệu khách hàng, nhà cung cấp, tồn kho và công nợ ban đầu mà không làm gián đoạn bán hàng."
    },
    {
      category: "pricing",
      q: "Có phát sinh bất kỳ khoản phí ẩn hoặc phụ phí duy trì nào không?",
      a: "BizPro+ cam kết 100% minh bạch về chi phí. Mức giá niêm yết đã bao gồm hạ tầng máy chủ điện toán đám mây tốc độ cao, sao lưu dữ liệu tự động hàng ngày, các bản cập nhật tính năng mới và đội ngũ hỗ trợ kỹ thuật 24/7."
    },
    {
      category: "pricing",
      q: "Chính sách dùng thử 14 ngày có bị giới hạn tính năng không?",
      a: "Không. Bạn được trải nghiệm 100% toàn bộ sức mạnh của BizPro+, bao gồm cả 4 module cốt lõi (CRM, Kho hàng, Đơn hàng, Nhân sự) mà không cần cung cấp bất kỳ thông tin thẻ tín dụng nào."
    },
    {
      category: "features",
      q: "Cơ chế 'Khóa giữ tồn kho tự động' (Atomic Stock Lock) hoạt động ra sao?",
      a: "Khi một đơn hàng mới được tạo từ POS tại cửa hàng, website hoặc sàn TMĐT (Shopee, TikTok Shop), BizPro+ lập tức áp dụng khóa giao dịch ở cấp cơ sở dữ liệu (Database Row Locking). Số lượng tồn khả dụng được trừ tức thì trong vòng dưới 1,2 giây, triệt tiêu 100% nguy cơ bán âm hoặc lệch kho."
    },
    {
      category: "features",
      q: "Hệ thống có đồng bộ tự động với sàn Shopee, TikTok Shop, Lazada không?",
      a: "Có. BizPro+ tích hợp trực tiếp qua Open API chính thức của các sàn TMĐT. Đơn hàng mới, trạng thái giao vận và thay đổi tồn kho được cập nhật realtime hai chiều, giúp nhân viên không cần thao tác thủ công."
    },
    {
      category: "security",
      q: "Dữ liệu kinh doanh của doanh nghiệp tôi được bảo vệ như thế nào?",
      a: "Dữ liệu được lưu trữ trên hạ tầng đám mây đạt tiêu chuẩn an toàn thông tin ISO 27001:2022 và chứng nhận của NCSC. Mọi dữ liệu nhạy cảm đều được mã hóa chuẩn quân đội AES-256 (At Rest) và TLS 1.3 (In Transit) với sao lưu độc lập mỗi 6 giờ."
    },
    {
      category: "security",
      q: "Nếu sau này doanh nghiệp ngừng sử dụng, dữ liệu có được xuất ra không?",
      a: "Bạn hoàn toàn làm chủ tài sản số của mình. Quản trị viên có toàn quyền kết xuất toàn bộ cơ sở dữ liệu của doanh nghiệp dưới dạng file Excel hoặc SQL Backup bất kỳ lúc nào mà không gặp bất kỳ rào cản kỹ thuật nào."
    }
  ];

  const filteredFaqs = activeCategory === "all" ? faqs : faqs.filter(f => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface antialiased">
      <MarketingHeader />

      <main className="w-full pt-20 bg-surface">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-surface py-16 lg:py-24 border-b border-surface-container">
          <div className="max-w-7xl mx-auto px-margin text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-primary-fixed text-on-primary-fixed shadow-sm mb-space-md">
              <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                help
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                TRUNG TÂM GIẢI ĐÁP &amp; HƯỚNG DẪN
              </span>
            </div>

            <h1 className="font-headline-lg md:font-display text-headline-lg md:text-display text-on-surface max-w-4xl tracking-tight leading-tight">
              Câu hỏi thường gặp về Nền tảng BizPro+
            </h1>

            <p className="mt-space-md font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Tất cả những gì bạn cần biết về lộ trình triển khai, cam kết chi phí minh bạch, an toàn dữ liệu và khả năng tích hợp đa kênh.
            </p>

            {/* Filter categories */}
            <div className="mt-space-xl p-space-xs rounded-full bg-surface-container-high shadow-inner inline-flex items-center gap-space-xs flex-wrap justify-center">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`px-space-lg py-space-sm rounded-full font-body-md-medium text-body-md-medium transition-all ${
                  activeCategory === "all"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Tất cả câu hỏi
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("deploy")}
                className={`px-space-lg py-space-sm rounded-full font-body-md-medium text-body-md-medium transition-all ${
                  activeCategory === "deploy"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Triển khai &amp; Vận hành
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("pricing")}
                className={`px-space-lg py-space-sm rounded-full font-body-md-medium text-body-md-medium transition-all ${
                  activeCategory === "pricing"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Bảng giá &amp; Thanh toán
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("features")}
                className={`px-space-lg py-space-sm rounded-full font-body-md-medium text-body-md-medium transition-all ${
                  activeCategory === "features"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Tính năng &amp; Đa kênh
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("security")}
                className={`px-space-lg py-space-sm rounded-full font-body-md-medium text-body-md-medium transition-all ${
                  activeCategory === "security"
                    ? "bg-surface-container-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                An toàn &amp; Bảo mật
              </button>
            </div>
          </div>
        </section>

        {/* ACCORDION FAQ SECTION */}
        <section className="max-w-4xl mx-auto px-margin py-16">
          <div className="space-y-space-md">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openItems.includes(idx);
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-surface-container-lowest border border-surface-container shadow-sm overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(idx)}
                    className="w-full p-space-lg md:p-6 text-left flex items-center justify-between gap-space-md hover:bg-surface-container-low/50 transition-colors"
                  >
                    <span className="font-title-md text-title-md font-semibold text-on-surface">
                      {faq.q}
                    </span>
                    <span
                      className={`material-symbols-outlined text-primary text-[24px] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-space-lg md:px-6 pb-space-lg text-on-surface-variant font-body-md text-body-md leading-relaxed border-t border-surface-container/60 pt-space-sm animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* STILL HAVE QUESTIONS BANNER */}
          <div className="mt-16 p-space-xl rounded-2xl bg-surface-container-low border border-surface-container flex flex-col md:flex-row items-center justify-between gap-space-lg text-center md:text-left">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Chưa tìm thấy câu trả lời cho vấn đề của bạn?
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Đội ngũ chuyên viên tư vấn giàu kinh nghiệm luôn sẵn sàng lắng nghe và giải đáp chi tiết.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-space-sm shrink-0">
              <Link
                href="/demo"
                className="px-space-lg py-space-sm rounded-lg bg-primary-container text-on-primary font-body-md-medium text-body-md-medium hover:bg-primary transition-colors flex items-center justify-center gap-1"
              >
                <span>Đặt lịch Demo 1:1</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                href="/contact"
                className="px-space-lg py-space-sm rounded-lg bg-surface-container text-on-surface font-body-md-medium text-body-md-medium hover:bg-surface-container-high transition-colors flex items-center justify-center"
              >
                Gửi câu hỏi trực tiếp
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
