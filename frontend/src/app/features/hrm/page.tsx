"use client";

import React from "react";
import Link from "next/link";
import {
  UserCheck,
  Clock,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building2,
  ArrowRight,
  Play,
  Star,
  Check,
  Lock,
  Award,
  Sparkles,
  FileText,
  TrendingUp,
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function HRMFeaturePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-indigo-100 selection:text-indigo-800">
      <MarketingHeader />

      <main className="flex-1 w-full overflow-x-hidden">
        {/* =========================================================================
            1. HRM HERO SECTION (100% Vietnamese)
            ========================================================================= */}
        <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-400/10 via-sky-300/10 to-transparent blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-24 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/10 via-indigo-300/10 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              
              {/* Left Column: Hero Text */}
              <div className="lg:col-span-6 space-y-6 text-left">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                  <Link href="/features" className="hover:underline flex items-center gap-1">
                    <span>Tính năng</span>
                  </Link>
                  <span>&gt;</span>
                  <span className="text-slate-800">Quản Trị Nhân Sự (HRM)</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-[1.2] [text-wrap:balance]">
                  Quản Trị Nhân Sự Tinh Gọn, <br className="hidden sm:inline" />
                  <span className="text-indigo-600">Điểm Danh 1 Chạm</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                  Số hóa toàn bộ hồ sơ nhân viên, điểm danh trực tuyến nhanh chóng, phê duyệt nghỉ phép đa cấp và bảo mật tiền lương tuyệt đối theo ma trận 66 vai trò.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
                  >
                    <span>Trải nghiệm Nhân Sự miễn phí</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>

                  <Link
                    href="/demo"
                    className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold shadow-2xs transition-all hover:-translate-y-0.5"
                  >
                    <Play className="w-4 h-4 mr-2 fill-slate-700 text-slate-700" />
                    <span>Xem video giới thiệu</span>
                  </Link>
                </div>

                <div className="pt-6 border-t border-slate-200/70 grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">100%</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Không dùng giấy tờ</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">1 Phút</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Duyệt đơn nghỉ phép</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-black text-slate-900">66 Vai trò</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Phân quyền bảo mật</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual HRM Mockup Card */}
              <div className="lg:col-span-6 relative">
                <div className="relative mx-auto max-w-[640px] rounded-2xl bg-white p-4 sm:p-6 shadow-[0_20px_50px_rgba(79,70,229,0.08)] border border-indigo-100 transition-all">
                  
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800">Bảng Chấm Công Nhân Sự (Tháng 11/2026)</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                      Tỷ lệ đi làm: 98.6%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Tổng nhân sự</div>
                      <div className="text-lg font-extrabold text-slate-900 mt-0.5">286</div>
                    </div>
                    <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                      <div className="text-[11px] text-emerald-700 font-medium">Đã Check-in</div>
                      <div className="text-lg font-extrabold text-emerald-900 mt-0.5">278</div>
                    </div>
                    <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                      <div className="text-[11px] text-amber-700 font-medium">Đi muộn</div>
                      <div className="text-lg font-extrabold text-amber-900 mt-0.5">4</div>
                    </div>
                    <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                      <div className="text-[11px] text-blue-700 font-medium">Nghỉ phép năm</div>
                      <div className="text-lg font-extrabold text-blue-900 mt-0.5">4</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-2">
                    <div className="text-xs font-bold text-slate-800">Hành Động Điểm Danh 1 Chạm</div>
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-bold text-slate-900">Nguyễn Văn Admin</div>
                          <div className="text-[10px] text-slate-500">Giờ vào: 08:24:15 • Wifi Văn Phòng Keangnam</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Đúng giờ
                      </span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            2. EMPLOYEE DIRECTORY & DIGITAL PROFILES
            ========================================================================= */}
        <section className="py-20 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
                  Hồ Sơ Nhân Sự Điện Tử
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Lưu trữ trọn đời hồ sơ ứng viên & nhân viên chính thức
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Quản lý đầy đủ hợp đồng lao động, số bảo hiểm xã hội, bằng cấp chuyên môn, phòng ban và chức vụ. 
                  Dễ dàng tra cứu thông tin liên lạc và người thân khi cần thiết.
                </p>
                <div className="pt-2">
                  <Link
                    href="/hrm/employees"
                    className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>Xem danh sách nhân viên trong ứng dụng</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs font-bold text-slate-800">
                  <span>Hồ Sơ Điện Tử: NV-2026-0042</span>
                  <span className="text-indigo-600">Hợp đồng không thời hạn</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Họ và tên:</span>
                    <span className="font-bold text-slate-900">Trần Thị Thu Thảo</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Phòng ban:</span>
                    <span className="font-bold text-indigo-600">Phòng Kinh Doanh & Tiếp Thị</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Chức vụ:</span>
                    <span className="font-bold text-slate-900">Trưởng nhóm Bán hàng Doanh nghiệp</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Ngày gia nhập:</span>
                    <span className="font-bold text-slate-900">15/03/2023 (3 năm cống hiến)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. 1-TOUCH ATTENDANCE
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
              Chấm Công 1 Chạm
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Điểm danh nhanh chóng, tạm biệt máy quẹt vân tay hỏng
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Nhân viên chỉ cần mở ứng dụng trên điện thoại hoặc máy tính và nhấn nút Check-in khi đến công ty. 
              Hệ thống tự động ghi nhận thời gian chính xác theo giây và vị trí mạng nội bộ.
            </p>
          </div>
        </section>

        {/* =========================================================================
            4. LEAVE MANAGEMENT & APPROVAL FLOW
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 bg-[#F8FAFC] rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="text-xs font-bold text-slate-800 pb-3 border-b border-slate-200">
                  Quy Trình Phê Duyệt Nghỉ Phép Trực Tuyến
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900">Lê Hoàng Long • Xin nghỉ 1 ngày (18/11)</div>
                  <div className="text-[11px] text-slate-500">Lý do: Khám sức khỏe định kỳ • Quỹ phép còn: 8 ngày</div>
                  <div className="flex gap-2 pt-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded">
                      Trưởng phòng đã duyệt
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold text-[10px] rounded">
                      HR đã ghi nhận
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
                  Quản Lý Nghỉ Phép
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Nộp đơn và duyệt phép trong 60 giây
                </h2>
                <p className="text-slate-600 text-base leading-relaxed">
                  Nhân viên nộp đơn nghỉ phép năm, nghỉ ốm hoặc nghỉ việc riêng trực tiếp từ tài khoản của mình. 
                  Trưởng bộ phận nhận thông báo và phê duyệt tức thì mà không cần ký giấy tờ rườm rà.
                </p>
                <div className="pt-2">
                  <Link
                    href="/hrm/leave"
                    className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700"
                  >
                    <span>Xem giao diện Nghỉ Phép trong ứng dụng</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. ORGANIZATIONAL STRUCTURE & DEPARTMENT TREES
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
              Sơ Đồ Tổ Chức
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Phân cấp phòng ban trực quan, rõ ràng quyền hạn
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Thiết lập cây sơ đồ tổ chức linh hoạt từ Ban Giám Đốc, Khối Kinh Doanh, Khối Kho Vận đến Kế Toán và Hành Chính Nhân Sự.
            </p>
          </div>
        </section>

        {/* =========================================================================
            6. PAYROLL PRE-CALCULATION & SALARY CONFIDENTIALITY
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
              Bảo Mật Lương Bổng
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tự động tính lương theo ngày công thực tế, bảo mật tuyệt đối
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Hệ thống tự động tổng hợp số ngày công làm việc, số lần đi muộn và ngày nghỉ phép có lương để tạm tính bảng lương cuối tháng. 
              Chỉ những quản trị viên được cấp quyền mới có thể truy cập số liệu tài chính nhạy cảm này.
            </p>
          </div>
        </section>

        {/* =========================================================================
            7. 66-PERMISSION ROLE-BASED ACCESS CONTROL
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC] border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
              Ma Trận Quyền Hạn
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Phân quyền chi tiết tới 66 quyền năng
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Nhân viên chỉ nhìn thấy dữ liệu thuộc phạm vi công việc của mình: Nhân viên bán hàng chỉ thấy đơn của mình, 
              thủ kho chỉ quản lý phiếu xuất nhập, và kế toán chỉ xem số liệu tài chính.
            </p>
          </div>
        </section>

        {/* =========================================================================
            8. HR ANALYTICS & HEADCOUNT TURNOVER
            ========================================================================= */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-3xl font-black text-indigo-600">98.6%</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Tỷ Lệ Đi Làm Đúng Giờ</div>
              </div>
              <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-3xl font-black text-emerald-600">2.1%</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Tỷ Lệ Nghỉ Việc Thấp</div>
              </div>
              <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-3xl font-black text-blue-600">100%</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Số Hóa Hồ Sơ Lao Động</div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. EMPLOYEE LIFECYCLE JOURNEY
            ========================================================================= */}
        <section className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
              Vòng Đời Nhân Sự
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Đồng hành cùng nhân tài từ lúc ứng tuyển đến khi gắn bó lâu dài
            </h2>
            <p className="text-slate-600 text-base max-w-2xl mx-auto">
              Giai đoạn thử việc 2 tháng → Ký kết hợp đồng chính thức → Đánh giá hiệu suất định kỳ → Bổ nhiệm cán bộ cốt cán.
            </p>
          </div>
        </section>

        {/* =========================================================================
            10. FINAL CALL TO ACTION
            ========================================================================= */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-blue-700 text-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Hiện đại hóa phòng nhân sự của bạn cùng BizPro+ HRM
            </h2>
            <p className="text-indigo-100 text-base sm:text-lg max-w-2xl mx-auto">
              Trải nghiệm điểm danh 1 chạm và quản trị nhân sự số miễn phí 14 ngày.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-full bg-white text-indigo-800 text-sm font-bold shadow-xl hover:bg-indigo-50 transition-all hover:scale-105"
              >
                Dùng thử 14 ngày miễn phí
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 rounded-full bg-indigo-800/60 hover:bg-indigo-800 text-white text-sm font-bold border border-white/20 transition-all"
              >
                Đặt lịch tư vấn giải pháp nhân sự
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
