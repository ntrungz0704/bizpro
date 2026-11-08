"use client";

import React, { useState } from "react";
import Link from "next/link";
import BizProLogo from "@/components/BizProLogo";
import { useApp } from "@/context/AppContext";

export default function ForgotPasswordPage() {
  const { showToast } = useApp();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showToast("Đã gửi liên kết khôi phục tới email của bạn!", "success");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-body-md text-on-surface antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex justify-center mb-space-md">
          <BizProLogo variant="full" size="lg" href="/" />
        </div>
        <h1 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
          Khôi phục mật khẩu
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">
          Nhập email đăng ký để nhận mã xác thực và liên kết bảo mật
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface-container-lowest py-8 px-6 sm:px-10 rounded-2xl border border-surface-container shadow-xl">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[36px]">mark_email_read</span>
              </div>
              <h3 className="font-title-md text-title-md font-bold text-on-surface">
                Email khôi phục đã được gửi
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                BizPro+ đã gửi liên kết đặt lại mật khẩu tới <strong className="text-on-surface">{email}</strong>. Vui lòng kiểm tra hộp thư.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-bold text-sm inline-flex items-center justify-center gap-2 shadow-sm hover:bg-primary transition-all duration-150"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Quay lại đăng nhập</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5 uppercase tracking-wider">
                  Email doanh nghiệp đã đăng ký
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@bizpro.vn"
                    className="w-full h-11 px-3.5 pl-10 rounded-xl border border-surface-container bg-surface-container-lowest text-on-surface text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                  />
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3 top-3">
                    mail
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-primary hover:shadow-lg transition-all duration-150 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      progress_activity
                    </span>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <span>Gửi liên kết khôi phục</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </>
                )}
              </button>

              <div className="pt-4 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Quay lại trang đăng nhập</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
