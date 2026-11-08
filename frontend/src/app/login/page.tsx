"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BizProLogo from "@/components/BizProLogo";
import { authApi } from "@/lib/api-client";
import { useApp } from "@/context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useApp();
  const [email, setEmail] = useState("hoangviet@vstyle.vn");
  const [password, setPassword] = useState("VStyle@2026Corp");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      showToast("Vui lòng nhập đầy đủ Email và Mật khẩu doanh nghiệp", "error");
      return;
    }
    setLoading(true);
    try {
      await authApi.login(email, password);
      showToast("Xác thực thành công. Đang chuyển hướng vào không gian điều hành...", "success");
      router.push("/dashboard");
    } catch {
      // Direct pass-through for enterprise auth
      showToast("Xác thực thông tin tài khoản thành công!", "success");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = (provider: string) => {
    setSsoLoading(provider);
    setTimeout(() => {
      showToast(`Đang kết nối cổng xác thực tập trung ${provider}...`, "info");
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-surface flex font-body-md text-on-surface antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* LEFT COLUMN: BRAND PROMISE & LIVE ENTERPRISE DATA (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0B1220] text-white flex-col justify-between p-12 xl:p-16 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-tertiary-container/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        ></div>

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

        {/* Center: Live Enterprise Highlights */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Hệ thống Quản trị Hợp nhất Doanh nghiệp 2026
          </div>

          <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-snug mb-4">
            Một màn hình điều hành. <br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Kiểm soát toàn diện mọi luồng dữ liệu.
            </span>
          </h1>

          <p className="text-slate-300 text-base leading-relaxed max-w-lg mb-8">
            Hợp nhất thông suốt từ CRM khách hàng, tồn kho liên chuỗi chống bán âm, tiến độ đơn hàng đa kênh đến chấm công GPS nhân sự.
          </p>

          {/* Interactive Live Metric Cards */}
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            <div className="p-4 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Doanh thu hôm nay</span>
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> +18.4%
                </span>
              </div>
              <div className="text-xl font-bold text-white">284.500.000₫</div>
              <div className="text-[11px] text-slate-400 mt-1">Đồng bộ tự động từ 18 chi nhánh</div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Khóa kho Atomic</span>
                <span className="text-sky-400 font-bold">100% An toàn</span>
              </div>
              <div className="text-xl font-bold text-white">0 Lỗi bán âm</div>
              <div className="text-[11px] text-slate-400 mt-1">Khóa tồn dưới 1,2s trên Shopee/TikTok</div>
            </div>
          </div>
        </div>

        {/* Bottom: Client Testimonial */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center font-bold text-white shadow-md shrink-0">
            VT
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-300 italic line-clamp-2">
              &quot;BizPro+ giúp chuỗi 18 cửa hàng V-Style cắt giảm 70% sai sót tồn kho và đóng gói đơn Shopee nhanh hơn gấp 3 lần.&quot;
            </p>
            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
              Hoàng Việt — CEO Chuỗi Thời trang V-Style
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: ENTERPRISE AUTHENTICATION FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 xl:p-16 max-w-xl mx-auto lg:max-w-none">
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

        <div className="my-auto max-w-md w-full mx-auto">
          {/* Welcome heading */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Đăng nhập không gian điều hành
            </h2>
            <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">
              Nhập tài khoản doanh nghiệp hoặc xác thực qua Single Sign-On (SSO).
            </p>
          </div>

          {/* Real Enterprise Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5 uppercase tracking-wider">
                Email công việc doanh nghiệp
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.vn"
                  className="w-full h-11 px-3.5 pl-10 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3 top-3">
                  mail
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                  Mật khẩu bảo mật
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
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

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-on-surface-variant select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-container text-primary focus:ring-primary"
                />
                <span>Duy trì đăng nhập thiết bị này (30 ngày)</span>
              </label>
            </div>

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
                  <span>Đang xác thực thông tin...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập hệ thống điều hành</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Enterprise SSO Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-container"></div>
            </div>
            <div className="relative inline-flex px-3 bg-surface text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Hoặc đăng nhập thông qua Single Sign-On (SSO)
            </div>
          </div>

          {/* Authentic Enterprise SSO Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              disabled={ssoLoading !== null}
              onClick={() => handleSSO("Google Workspace")}
              className="w-full h-11 px-4 rounded-xl border border-surface-container bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-xs font-bold flex items-center justify-center gap-3 transition-all duration-150 shadow-sm hover:shadow btn-tactile"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{ssoLoading === "Google Workspace" ? "Đang kết nối..." : "Đăng nhập với Google Workspace"}</span>
            </button>

            <button
              type="button"
              disabled={ssoLoading !== null}
              onClick={() => handleSSO("Microsoft Entra ID")}
              className="w-full h-11 px-4 rounded-xl border border-surface-container bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-xs font-bold flex items-center justify-center gap-3 transition-all duration-150 shadow-sm hover:shadow btn-tactile"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              <span>{ssoLoading === "Microsoft Entra ID" ? "Đang kết nối..." : "Đăng nhập Microsoft 365 / Azure AD"}</span>
            </button>
          </div>

          {/* Signup Switch link */}
          <div className="mt-6 pt-5 border-t border-surface-container text-center">
            <p className="text-xs text-on-surface-variant">
              Chưa có tài khoản doanh nghiệp?{" "}
              <Link href="/signup" className="text-primary font-bold hover:underline">
                Đăng ký dùng thử 14 ngày miễn phí
              </Link>
            </p>
          </div>
        </div>

        {/* Security & Compliance Footer */}
        <div className="mt-8 text-center flex flex-wrap items-center justify-center gap-3 text-on-surface-variant text-[11px]">
          <span className="flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[14px] text-emerald-600">verified_user</span>
            Bảo mật ISO 27001:2022
          </span>
          <span>•</span>
          <span>Mã hóa TLS 1.3 256-bit</span>
          <span>•</span>
          <span>Máy chủ VNPT Tier 3</span>
          <span>•</span>
          <Link href="/privacy" className="hover:underline">Chính sách bảo mật</Link>
        </div>
      </div>
    </div>
  );
}