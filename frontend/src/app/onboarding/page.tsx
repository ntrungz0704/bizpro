"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  Package,
  ShoppingCart,
  UserCheck,
  Check,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Mail,
  Zap,
} from "lucide-react";
import BizProLogo from "@/components/BizProLogo";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("Viet An Solutions JSC");
  const [taxCode, setTaxCode] = useState("0109988776");
  const [industry, setIndustry] = useState("Retail & E-commerce");
  const [teamSize, setTeamSize] = useState("10-50 employees");
  const [selectedModules, setSelectedModules] = useState<string[]>(["crm", "inventory", "sales", "hrm"]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitedList, setInvitedList] = useState<string[]>(["manager@vietan.vn", "sales.lead@vietan.vn"]);

  const toggleModule = (id: string) => {
    if (selectedModules.includes(id)) {
      setSelectedModules(selectedModules.filter(m => m !== id));
    } else {
      setSelectedModules([...selectedModules, id]);
    }
  };

  const addInvite = () => {
    if (inviteEmail.trim() && !invitedList.includes(inviteEmail.trim())) {
      setInvitedList([...invitedList, inviteEmail.trim()]);
      setInviteEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-900">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <BizProLogo variant="full" size="md" theme="light" />
        </Link>
        <div className="text-xs font-semibold text-slate-500">
          Organization Setup • Step {step} of 4
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 flex flex-col justify-center">
        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-1" />
          
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center relative z-10 bg-[#F8FAFC] px-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step >= s
                    ? "bg-[#0066FF] text-white shadow-md shadow-blue-500/25"
                    : "bg-white border border-slate-300 text-slate-400"
                }`}
              >
                {step > s ? <Check className="w-4 h-4 stroke-[3]" /> : s}
              </div>
              <span className="text-[11px] font-semibold text-slate-500 mt-1">
                {s === 1 && "Company"}
                {s === 2 && "Modules"}
                {s === 3 && "Invite Team"}
                {s === 4 && "Launch"}
              </span>
            </div>
          ))}
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl shadow-slate-200/50">
          
          {/* STEP 1: COMPANY PROFILE */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 1 of 4</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Tell us about your organization</h2>
                <p className="text-xs text-slate-500 mt-1">
                  We'll tailor your workspaces, tax rules, and initial reports accordingly.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Company / Organization Name *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 font-medium"
                    placeholder="e.g. Viet An Solutions JSC"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Tax Code (Mã số thuế) *</label>
                    <input
                      type="text"
                      value={taxCode}
                      onChange={(e) => setTaxCode(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 font-medium"
                      placeholder="10 or 13 digits"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Primary Industry</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 font-medium bg-white"
                    >
                      <option>Retail & E-commerce</option>
                      <option>B2B Wholesales & Distribution</option>
                      <option>Manufacturing & FMCG</option>
                      <option>Services & Agency</option>
                      <option>Other Services</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Company Size</label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 font-medium bg-white"
                  >
                    <option>1-10 employees</option>
                    <option>10-50 employees</option>
                    <option>50-200 employees</option>
                    <option>200+ enterprise</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-7 py-3 rounded-full bg-[#0066FF] hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-95"
                >
                  <span>Continue to Modules</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MODULE SELECTION */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 2 of 4</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Select your active modules</h2>
                <p className="text-xs text-slate-500 mt-1">
                  You can enable or disable any module at any time from your settings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => toggleModule("crm")}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                    selectedModules.includes("crm")
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">CRM System</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Leads, sales pipeline & 360 customer profile</p>
                  </div>
                </div>

                <div
                  onClick={() => toggleModule("inventory")}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                    selectedModules.includes("inventory")
                      ? "border-emerald-600 bg-emerald-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Inventory & Stock</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Multi-warehouse, atomic reservation & audits</p>
                  </div>
                </div>

                <div
                  onClick={() => toggleModule("sales")}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                    selectedModules.includes("sales")
                      ? "border-amber-600 bg-amber-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">5-Stage Sales Orders</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Shopee/TikTok flow, invoice VAT & shipping</p>
                  </div>
                </div>

                <div
                  onClick={() => toggleModule("hrm")}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                    selectedModules.includes("hrm")
                      ? "border-purple-600 bg-purple-50/50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">HRM & Attendance</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Digital check-in, leaves & 66-role RBAC</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-7 py-3 rounded-full bg-[#0066FF] hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-95"
                >
                  <span>Continue to Team Invites</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: INVITE TEAM */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step 3 of 4</span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Invite your teammates</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Collaborate in real time. Invites can be modified later in user management.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addInvite()}
                      placeholder="colleague@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 text-xs"
                    />
                  </div>
                  <button
                    onClick={addInvite}
                    className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending invitations ({invitedList.length})</div>
                  {invitedList.map((em, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <span className="font-semibold text-slate-800">{em}</span>
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">Standard Role</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-7 py-3 rounded-full bg-[#0066FF] hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-95"
                >
                  <span>Complete Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: LAUNCH */}
          {step === 4 && (
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900">Your Workspace is Ready!</h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                  <strong>{companyName}</strong> has been configured with 4 enterprise modules, real-time sync, and sample records to test immediately.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 max-w-sm mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan:</span>
                  <span className="font-bold text-blue-600">14-Day Free Enterprise Trial</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Modules:</span>
                  <span className="font-bold text-slate-800">{selectedModules.length} Active Modules</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Teammates:</span>
                  <span className="font-bold text-slate-800">{invitedList.length} Invites Sent</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-8 py-3.5 rounded-full bg-[#0066FF] hover:bg-blue-700 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Launch Enterprise Dashboard</span>
                </Link>

                <Link
                  href="/settings"
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs"
                >
                  Configure RBAC Roles
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400">
        © 2026 BizPro+ Enterprise SaaS. Need help? Call <strong className="text-slate-600">024 3999 8888</strong>.
      </footer>
    </div>
  );
}
