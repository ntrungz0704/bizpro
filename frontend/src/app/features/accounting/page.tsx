"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calculator,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  Check,
  Search,
  Scale,
  Receipt,
  BookOpen,
  PieChart,
  DollarSign,
  Lock,
  Layers,
  ArrowUpRight,
  Coins,
  FileCheck,
} from "lucide-react";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  note: string;
}

interface AccountingScenario {
  id: string;
  title: string;
  event: string;
  standardNote: string;
  lines: JournalLine[];
}

const ACCOUNTING_SCENARIOS: AccountingScenario[] = [
  {
    id: "sale-delivery",
    title: "1. Bàn giao đơn hàng & Xuất hóa đơn (VAS 14 / IFRS 15)",
    event: "Đơn hàng đã xuất kho bàn giao thành công cho khách hàng B2B, phát hành hóa đơn GTGT 10%",
    standardNote: "Doanh thu CHỈ được ghi nhận khi hoàn thành nghĩa vụ giao nhận, tuyệt đối không ghi nhận ở bước Tạo Sales Order.",
    lines: [
      { accountCode: "131", accountName: "Phải thu của khách hàng (An Phước Corp)", debit: 110000000, credit: 0, note: "Công nợ phát sinh theo HĐ #INV-2026-089" },
      { accountCode: "5111", accountName: "Doanh thu bán hàng hóa", debit: 0, credit: 100000000, note: "Doanh thu thuần bàn giao kỳ này" },
      { accountCode: "33311", accountName: "Thuế GTGT đầu ra phải nộp (10%)", debit: 0, credit: 10000000, note: "Thuế GTGT theo Hóa đơn điện tử TT78" },
      { accountCode: "632", accountName: "Giá vốn hàng bán (COGS)", debit: 65000000, credit: 0, note: "Xuất kho phiếu #PXK-2026-0412" },
      { accountCode: "1561", accountName: "Hàng hóa tồn kho (Kho Tổng)", debit: 0, credit: 65000000, note: "Giảm trừ tồn kho theo phương pháp Bình quân tức thời" },
    ],
  },
  {
    id: "payment-received",
    title: "2. Khách hàng thanh toán qua Ngân hàng",
    event: "Nhận tiền thanh toán qua Vietcombank từ Khách hàng An Phước tất toán công nợ đơn hàng",
    standardNote: "Đối soát tự động với luồng biến động số dư Open Banking, giảm trừ công nợ theo thời gian thực.",
    lines: [
      { accountCode: "1121", accountName: "Tiền gửi Ngân hàng (Vietcombank VNĐ)", debit: 110000000, credit: 0, note: "Báo Có VCB GD #FT2611089901" },
      { accountCode: "131", accountName: "Phải thu của khách hàng (An Phước Corp)", debit: 0, credit: 110000000, note: "Tất toán công nợ HĐ #INV-2026-089" },
    ],
  },
  {
    id: "vendor-purchase",
    title: "3. Nhập kho nguyên vật liệu từ Nhà cung cấp",
    event: "Nhập 500 linh kiện từ Tân Phát Tech, kèm hóa đơn GTGT 8% theo Nghị định 72/2024",
    standardNote: "Ghi nhận giá gốc hàng tồn kho theo hóa đơn đầu vào, theo dõi chi tiết công nợ phải trả NCC 331.",
    lines: [
      { accountCode: "1561", accountName: "Hàng hóa tồn kho (Kho Linh kiện)", debit: 50000000, credit: 0, note: "Nhập kho theo Phiếu nhập #PNK-0842" },
      { accountCode: "1331", accountName: "Thuế GTGT được khấu trừ (8%)", debit: 4000000, credit: 0, note: "Thuế GTGT đầu vào theo Nghị định 72" },
      { accountCode: "331", accountName: "Phải trả cho người bán (Tân Phát Tech)", debit: 0, credit: 54000000, note: "Hạn thanh toán 30 ngày (Net 30)" },
    ],
  },
  {
    id: "salary-expense",
    title: "4. Trích chi phí lương & Bảo hiểm kỳ",
    event: "Tính lương bộ phận kinh doanh và quản lý, trích BHXH, BHYT, BHTN theo quy định",
    standardNote: "Tự động phân bổ chi phí quản lý doanh nghiệp và ghi nhận nghĩa vụ người lao động.",
    lines: [
      { accountCode: "6421", accountName: "Chi phí nhân viên bán hàng", debit: 45000000, credit: 0, note: "Bảng lương bộ phận Kinh doanh T11/2026" },
      { accountCode: "6422", accountName: "Chi phí nhân viên quản lý", debit: 35000000, credit: 0, note: "Bảng lương khối Văn phòng T11/2026" },
      { accountCode: "3341", accountName: "Phải trả người lao động", debit: 0, credit: 69200000, note: "Lương thực lĩnh sau trích BH" },
      { accountCode: "3383", accountName: "Bảo hiểm xã hội (25.5%)", debit: 0, credit: 10800000, note: "Trích BHXH DN + NLĐ" },
    ],
  },
];

export default function AccountingFeaturePage() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>("sale-delivery");

  const currentScenario = ACCOUNTING_SCENARIOS.find((s) => s.id === activeScenarioId) || ACCOUNTING_SCENARIOS[0];

  const totalDebit = currentScenario.lines.reduce((acc, l) => acc + l.debit, 0);
  const totalCredit = currentScenario.lines.reduce((acc, l) => acc + l.credit, 0);
  const isBalanced = totalDebit === totalCredit;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-indigo-100 selection:text-indigo-800">
      <MarketingHeader />

      <main className="flex-1 w-full overflow-x-hidden">
        {/* =========================================================================
            1. ACCOUNTING HERO SECTION
            ========================================================================= */}
        <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden border-b border-slate-200/80 bg-white">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-400/10 via-sky-300/10 to-transparent blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-24 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/10 via-indigo-300/10 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Left Column: Hero Copy & Value Prop */}
              <div className="lg:col-span-7 space-y-6 text-left">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                  <Link href="/features" className="hover:underline flex items-center gap-1">
                    <span>Tính năng</span>
                  </Link>
                  <span>&gt;</span>
                  <span className="text-slate-800">Kế toán &amp; Quản trị Tài chính</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  <span>Tuân thủ Chuẩn mực Kế toán TT 200/2014 &amp; TT 133/2016</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-slate-900 leading-[1.2] [text-wrap:balance]">
                  Kế Toán Doanh Nghiệp Tự Động <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    Định Khoản Kép Chuẩn Mực 100%
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                  Khép kín chu trình tài chính kế toán từ đơn hàng, xuất nhập kho đến sổ cái tổng hợp.
                  Phân định rõ ràng thời điểm <strong className="text-slate-800">Bàn giao hàng hóa vs Ghi nhận doanh thu</strong> theo
                  chuẩn VAS 14 và IFRS 15, loại bỏ hoàn toàn sai số và rủi ro thuế.
                </p>

                {/* Key Metric Highlights */}
                <div className="grid grid-cols-3 gap-4 py-2 border-y border-slate-100">
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">0%</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Lệch sổ Nợ / Có</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">100%</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Khớp Hóa đơn TT78</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">3 Giây</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">Kết chuyển kỳ kế toán</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all"
                  >
                    <span>Dùng thử phân hệ Kế toán</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#simulator"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-all"
                  >
                    <Calculator className="w-4 h-4 text-indigo-600" />
                    <span>Trải nghiệm Sổ cái trực tiếp</span>
                  </a>
                </div>
              </div>

              {/* Right Column: General Ledger Card Visual */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-6 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Ledger Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Sổ Nhật Ký Chung (General Journal)</div>
                        <div className="text-xs text-slate-400">Kỳ hạch toán: Tháng 11/2026 • Realtime</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Khớp 100%
                    </span>
                  </div>

                  {/* Summary Balance Cards */}
                  <div className="grid grid-cols-2 gap-3 my-4">
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <div className="text-xs text-slate-400 font-medium">Tổng phát sinh Nợ</div>
                      <div className="text-lg font-bold text-indigo-400 mt-1">2,845,900,000 ₫</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                      <div className="text-xs text-slate-400 font-medium">Tổng phát sinh Có</div>
                      <div className="text-lg font-bold text-emerald-400 mt-1">2,845,900,000 ₫</div>
                    </div>
                  </div>

                  {/* Live Feed Entries */}
                  <div className="space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                      <div>
                        <span className="font-mono text-indigo-300 font-bold">TK 131</span> → <span className="font-mono text-emerald-300 font-bold">TK 5111, 33311</span>
                        <div className="text-slate-400 text-[11px] mt-0.5">Doanh thu giao hàng HĐ #INV-089</div>
                      </div>
                      <div className="text-right font-mono font-bold text-slate-200">
                        +110,000,000 ₫
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                      <div>
                        <span className="font-mono text-indigo-300 font-bold">TK 632</span> → <span className="font-mono text-emerald-300 font-bold">TK 1561</span>
                        <div className="text-slate-400 text-[11px] mt-0.5">Giá vốn xuất kho phiếu #PXK-0412</div>
                      </div>
                      <div className="text-right font-mono font-bold text-slate-200">
                        +65,000,000 ₫
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
                      <div>
                        <span className="font-mono text-indigo-300 font-bold">TK 1121</span> → <span className="font-mono text-emerald-300 font-bold">TK 131</span>
                        <div className="text-slate-400 text-[11px] mt-0.5">Thu tiền VCB khách hàng An Phước</div>
                      </div>
                      <div className="text-right font-mono font-bold text-emerald-400">
                        +110,000,000 ₫
                      </div>
                    </div>
                  </div>

                  {/* Lock Indicator */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      Chốt sổ kỳ tự động (Immutable Audit Log)
                    </span>
                    <span className="text-slate-500 font-mono">HASH: SHA256-VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. INTERACTIVE SIMULATOR (Live Double-Entry Playground)
            ========================================================================= */}
        <section id="simulator" className="py-16 md:py-24 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold mb-3">
                <Calculator className="w-3.5 h-3.5" />
                <span>Trải Nghiệm Nghiệp Vụ Thực Tế</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Mô Phỏng Định Khoản Kép Chuẩn Mực Doanh Nghiệp
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2">
                Bấm chọn các tình huống nghiệp vụ thực tế dưới đây để thấy BizPro+ tự động sinh bút toán Nợ/Có cân bằng tuyệt đối
                theo đúng quy định của Bộ Tài Chính.
              </p>
            </div>

            {/* Scenario Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {ACCOUNTING_SCENARIOS.map((sc) => {
                const isSelected = sc.id === activeScenarioId;
                return (
                  <button
                    key={sc.id}
                    onClick={() => setActiveScenarioId(sc.id)}
                    className={`p-4 rounded-xl text-left transition-all duration-200 border ${
                      isSelected
                        ? "bg-white border-indigo-600 shadow-md ring-2 ring-indigo-600/10"
                        : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="text-xs font-bold text-indigo-600 mb-1">TÌNH HUỐNG THỰC TẾ</div>
                    <div className="text-sm font-semibold text-slate-900 line-clamp-1">{sc.title}</div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">{sc.event}</div>
                  </button>
                );
              })}
            </div>

            {/* Live Interactive Ledger View */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              {/* Scenario Context Banner */}
              <div className="p-5 bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">Diễn giải sự kiện nghiệp vụ</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{currentScenario.event}</div>
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200/60 rounded-md px-2.5 py-1 mt-2 inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>{currentScenario.standardNote}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Trạng thái Bút toán</div>
                    <div className="text-sm font-bold text-emerald-600 flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isBalanced ? "Cân đối Nợ = Có" : "Lệch sổ"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Journal Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Tài khoản</th>
                      <th className="py-3 px-4">Tên tài khoản theo TT 200</th>
                      <th className="py-3 px-4">Diễn giải chi tiết</th>
                      <th className="py-3 px-4 text-right">Phát sinh Nợ (VND)</th>
                      <th className="py-3 px-4 text-right">Phát sinh Có (VND)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                    {currentScenario.lines.map((l, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                          {l.accountCode}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {l.accountName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs sm:text-sm">
                          {l.note}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                          {l.debit > 0 ? l.debit.toLocaleString("vi-VN") + " ₫" : "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                          {l.credit > 0 ? l.credit.toLocaleString("vi-VN") + " ₫" : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50/80 border-t-2 border-slate-300 font-bold text-slate-900">
                    <tr>
                      <td colSpan={3} className="py-3.5 px-4 text-right uppercase tracking-wider text-xs">
                        Tổng cộng phát sinh:
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-sm text-indigo-700">
                        {totalDebit.toLocaleString("vi-VN")} ₫
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-sm text-emerald-700">
                        {totalCredit.toLocaleString("vi-VN")} ₫
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. CORE ACCOUNTING MODULE ARCHITECTURE (5 Pillars)
            ========================================================================= */}
        <section className="py-16 md:py-24 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                5 Trụ Cột Vận Hành Kế Toán Doanh Nghiệp Trên BizPro+
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2">
                Được thiết kế bởi các chuyên gia tài chính và kiểm toán doanh nghiệp hàng đầu Việt Nam.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Pillar 1 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Hệ Thống Tài Khoản Đa Cấp</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Cài đặt sẵn danh mục tài khoản cấp 1, cấp 2 theo Thông tư 200/2014/TT-BTC và Thông tư 133/2016/TT-BTC.
                  Cho phép doanh nghiệp mở rộng tài khoản chi tiết theo từng chi nhánh, kho hàng hoặc trung tâm chi phí (Cost Center).
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Phân Định Doanh Thu Chuẩn VAS 14</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Không đánh đồng việc Tạo Sales Order với ghi nhận Doanh thu kế toán. Hệ thống chỉ ghi nhận doanh thu
                  khi hàng hóa đã được xuất kho bàn giao hoặc nghĩa vụ cung cấp dịch vụ được hoàn thành kèm chứng từ hợp lệ.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Báo Cáo Tài Chính Tự Động</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Xuất tức thời Bảng Cân Đối Kế Toán (Mẫu B01-DN), Báo Cáo Kết Quả Kinh Doanh (Mẫu B02-DN) và Báo Cáo
                  Lưu Chuyển Tiền Tệ (Mẫu B03-DN). Hỗ trợ kết xuất định dạng XML nộp trực tuyến cho Cơ quan Thuế.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Khóa Sổ Kỳ Kế Toán Tuyệt Đối</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Cơ chế khóa kỳ kế toán (Period Lock) bảo vệ tính toàn vẹn dữ liệu. Bất kỳ sự thay đổi hồi tố nào
                  đều yêu cầu phê duyệt đa tầng và được ghi nhận qua bút toán điều chỉnh với Audit Trail mã hóa SHA-256.
                </p>
              </div>

              {/* Pillar 5 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
                  <Coins className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Đối Soát Công Nợ Tuổi Nợ (Aging)</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Theo dõi chính xác thời hạn công nợ phải thu (AR) và phải trả (AP) theo các dải thời gian 0-30 ngày,
                  31-60 ngày, 61-90 ngày và trên 90 ngày. Cảnh báo vượt hạn mức tín dụng ngay khi nhân viên tạo đơn.
                </p>
              </div>

              {/* Pillar 6 */}
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Đồng Bộ Hóa Đơn Điện Tử TT 78</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tích hợp sẵn cổng kết nối các nhà cung cấp giải pháp Hóa đơn điện tử hàng đầu (VNPT, Viettel, MISA meInvoice).
                  Tự động tra cứu và lưu trữ hóa đơn đầu vào kèm mã xác thực từ Tổng cục Thuế.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. BOTTOM CTA SECTION
            ========================================================================= */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Nâng Tầm Quản Trị Tài Chính Doanh Nghiệp Với BizPro+
            </h2>
            <p className="text-indigo-200 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Bắt đầu 14 ngày dùng thử miễn phí đầy đủ tính năng phân hệ Kế toán và Sổ cái Doanh nghiệp. Không yêu cầu thẻ tín dụng.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/signup"
                className="px-8 py-3.5 rounded-xl bg-white text-indigo-900 font-bold text-sm hover:bg-indigo-50 shadow-lg shadow-white/10 transition-all flex items-center gap-2"
              >
                <span>Đăng ký Trải nghiệm Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl bg-indigo-800/60 hover:bg-indigo-800 text-white font-semibold text-sm border border-indigo-700 transition-all"
              >
                Đặt lịch tư vấn với Chuyên gia Tài chính
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
