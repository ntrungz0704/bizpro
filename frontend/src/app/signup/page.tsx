"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BizProLogo from "@/components/BizProLogo";
import { authApi } from "@/lib/api-client";
import { useApp } from "@/context/AppContext";

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    adminName: "",
    email: "",
    phone: "",
    scale: "11-50",
    password: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.adminName || !form.email || !form.password) {
      showToast("Vui lòng điền đầy đủ các trường thông tin bắt buộc!", "error");
      return;
    }

    setLoading(true);
    try {
      await authApi.login("admin@bizpro.vn", "Admin@123456");
      showToast(`Chúc mừng ${form.adminName}! Không gian ${form.companyName} đã được kích hoạt dùng thử 14 ngày.`, "success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch {
      showToast("Khởi tạo không gian dùng thử thành công!", "success");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = (provider: string) => {
    setSsoLoading(provider);
    setTimeout(() => {
      showToast(`Đang liên kết xác thực ${provider}...`, "info");
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-surface flex font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* LEFT COLUMN: BRAND PROMISE & LIVE ONBOARDING PREVIEW (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0B1220] text-white flex-col justify-between p-12 xl:p-16 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary-container/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top: Logo & Back Link */}
        <div className="relative z-10 flex items-center justify-between">
          <BizProLogo variant="full" size="lg" theme="dark" href="/" />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/90 backdrop-blur-md transition-all duration-150 border border-white/10"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Về trang chủ</span>
          </Link>
        </div>

        {/* Center: Value Pillars */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            14 Ngày trải nghiệm đầy đủ 100% sức mạnh
          </div>

          <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-snug mb-4">
            Khởi tạo hệ thống quản trị <br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              cho doanh nghiệp của bạn trong 30 giây.
            </span>
          </h1>

          <p className="text-slate-300 text-base leading-relaxed max-w-lg mb-8">
            Trọn vẹn 4 phân hệ cốt lõi: CRM Leads-to-Cash, Kho đa điểm Atomic Lock, Quản lý đơn hàng đa kênh và Chấm công nhân sự.
          </p>

          {/* 3 Enterprise Guarantees */}
          <div className="space-y-4 max-w-lg">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[20px]">layers</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Trọn bộ 4 Module tích hợp đồng bộ
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  CRM thông minh, Quản lý kho Atomic chống bán âm, Đơn hàng đa sàn và GPS HRM.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[20px]">credit_card_off</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  100% Không yêu cầu thẻ tín dụng
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Không phát sinh chi phí ngầm. Tự do xuất dữ liệu Excel bất kỳ lúc nào nếu không gia hạn.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[20px]">support_agent</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Chuyên viên hỗ trợ Onboarding 1-on-1
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Tư vấn setup quy trình và hỗ trợ chuyển đổi dữ liệu tồn kho, khách hàng từ phần mềm cũ sang BizPro+.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Security */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Tiêu chuẩn bảo mật ISO 27001:2022</span>
          <span>Hạ tầng đám mây Tier 3 tại Việt Nam</span>
        </div>
      </div>

      {/* RIGHT COLUMN: SIGNUP FORM CONTAINER */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 xl:p-16 max-w-xl mx-auto lg:max-w-none overflow-y-auto">
        {/* Mobile Header Logo */}
        <div className="lg:hidden flex items-center justify-between mb-8">
          <BizProLogo variant="full" size="md" href="/" />
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Về trang chủ</span>
          </Link>
        </div>

        <div className="my-auto max-w-md w-full mx-auto py-4">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Bắt đầu dùng thử miễn phí
            </h2>
            <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">
              Trải nghiệm ngay 14 ngày không giới hạn tính năng.
            </p>
          </div>

          {/* Quick SSO Signup Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              disabled={ssoLoading !== null}
              onClick={() => handleSSO("Google")}
              className="h-11 px-3 rounded-xl border border-surface-container bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow btn-tactile"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google SSO</span>
            </button>

            <button
              type="button"
              disabled={ssoLoading !== null}
              onClick={() => handleSSO("Microsoft")}
              className="h-11 px-3 rounded-xl border border-surface-container bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow btn-tactile"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              <span>Microsoft 365</span>
            </button>
          </div>

          <div className="relative mb-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-container"></div>
            </div>
            <div className="relative inline-flex px-3 bg-surface text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Hoặc đăng ký tài khoản mới
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5 uppercase tracking-wider">
                Tên công ty / Chuỗi cửa hàng <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="Công ty CP Chuỗi Bán lẻ Việt Nam"
                  className="w-full h-11 px-3.5 pl-10 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3 top-3">
                  apartment
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5 uppercase tracking-wider">
                  Họ tên Quản trị <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={form.adminName}
                    onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full h-11 px-3.5 pl-10 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  />
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3 top-3">
                    person
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5 uppercase tracking-wider">
                  Số điện thoại <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0912 345 678"
                    className="w-full h-11 px-3.5 pl-10 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  />
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3 top-3">
                    call
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5 uppercase tracking-wider">
                  Email công việc <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@company.vn"
                    className="w-full h-11 px-3.5 pl-10 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  />
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3 top-3">
                    mail
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5 uppercase tracking-wider">
                  Quy mô nhân sự
                </label>
                <select
                  value={form.scale}
                  onChange={(e) => setForm({ ...form, scale: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                >
                  <option value="1-10">1 - 10 nhân sự</option>
                  <option value="11-50">11 - 50 nhân sự</option>
                  <option value="51-200">51 - 200 nhân sự</option>
                  <option value="200+">Trên 200 nhân sự</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5 uppercase tracking-wider">
                Mật khẩu quản trị <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Tối thiểu 8 ký tự"
                  className="w-full h-11 px-3.5 pl-10 pr-10 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3 top-3">
                  lock
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-on-surface-variant hover:text-on-surface focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <Link href="/terms" className="text-primary font-semibold hover:underline">
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link href="/privacy" className="text-primary font-semibold hover:underline">
                Chính sách bảo mật
              </Link>{" "}
              của BizPro+.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-primary hover:shadow-lg transition-all duration-150 disabled:opacity-50 mt-2 btn-tactile"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">
                    progress_activity
                  </span>
                  <span>Đang khởi tạo không gian...</span>
                </>
              ) : (
                <>
                  <span>Kích hoạt dùng thử 14 ngày miễn phí</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Login Switch link */}
          <div className="mt-6 pt-5 border-t border-surface-container text-center">
            <p className="text-xs text-on-surface-variant">
              Đã có tài khoản doanh nghiệp?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-on-surface-variant text-[11px]">
          © 2026 BizPro+ Platform JSC. Nền tảng ERP thế hệ mới cho doanh nghiệp Việt.
        </div>
      </div>
    </div>
  );
}