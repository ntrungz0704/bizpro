# ĐẶC TẢ KIẾN TRÚC PHÂN HỆ EXECUTIVE BI, HỢP NHẤT BÁO CÁO TÀI CHÍNH & DỰ BÁO KHO VẬN (PHASE 4D)
**Mã tài liệu:** `docs/PHASE_4D_EXECUTIVE_BI_AND_CONSOLIDATION_SPECIFICATION.md`  
**Ngày ban hành:** 08/11/2026  
**Thuộc lộ trình:** BizPro+ Enterprise ERP Expansion (Phase 4D — Spec-Only Architecture)  
**Phạm vi áp dụng:** Thiết kế kiến trúc & mô hình nghiệp vụ (Zero Code/Prisma Mutations to Frozen Core)  
**Căn cứ pháp lý & quy chuẩn kế toán:**
- Luật Kế toán số 88/2015/QH13.
- Chuẩn mực Kế toán Việt Nam số 25 (VAS 25) — *Báo cáo tài chính hợp nhất và kế toán khoản đầu tư vào công ty con*.
- Thông tư 202/2014/TT-BTC hướng dẫn phương pháp lập và trình bày Báo cáo tài chính hợp nhất.
- Tiêu chuẩn IFRS 10 (*Consolidated Financial Statements*) & IFRS 8 (*Operating Segments*).

---

## 1. TỔNG QUAN & BỐI CẢNH NGHIỆP VỤ (EXECUTIVE OVERVIEW)

Khi doanh nghiệp mở rộng từ một cửa hàng đơn lẻ lên mô hình chuỗi đa chi nhánh hoặc mô hình công ty mẹ - con (Holding / Đa pháp nhân), việc quản trị số liệu phân mảnh dẫn đến 3 rủi ro cốt tử:
1. **Ghi nhận ảo doanh thu nội bộ (Double Counting):** Doanh thu bán hàng giữa Tổng kho chi nhánh A sang Điểm bán lẻ chi nhánh B bị cộng dồn hai lần vào báo cáo tổng, làm sai lệch kết quả kinh doanh thực tế trước hội đồng quản trị và cơ quan thuế.
2. **Ứ đọng vốn hoặc đứt gãy chuỗi cung ứng (Bullwhip Effect):** Dự báo nhập hàng dựa trên cảm tính thay vì số liệu thống kê tiêu thụ dẫn đến tình trạng kho thiếu các SKU bán chạy (Stockout) nhưng tồn đọng lượng lớn SKU chậm luân chuyển.
3. **Mù mờ về biên lợi nhuận thực tế theo kênh (Net Margin Blindness):** Doanh nghiệp chỉ nhìn thấy doanh thu gộp (Gross GMV) từ sàn TMĐT (Shopee, TikTok Shop, Lazada) mà không bóc tách được các khoản chi phí ẩn: phí hoa hồng sàn (8 - 14%), phí cố định, phí dịch vụ quảng cáo sàn, trợ giá freeship, chi phí đóng gói và tỷ lệ hoàn hàng (Return & Refusal).

**Mục tiêu của Phase 4D:** Thiết kế kiến trúc giải pháp xử lý triệt để 3 bài toán trên ở cấp độ thiết kế hệ thống, tuân thủ tuyệt đối quy định pháp lý Việt Nam và chuẩn mực kế toán quốc tế, sẵn sàng cho việc kích hoạt triển khai khi ban quản trị phê duyệt.

---

## 2. KIẾN TRÚC HỢP NHẤT BÁO CÁO TÀI CHÍNH ĐA CHI NHÁNH & ĐA PHÁP NHÂN (VAS 25 & TT 202/2014)

### 2.1. Quy trình loại trừ giao dịch nội bộ (Intercompany Elimination Engine)

Theo quy định tại Điều 15 Thông tư 202/2014/TT-BTC, khi lập Báo cáo tài chính hợp nhất, toàn bộ các giao dịch phát sinh trong nội bộ tập đoàn/tổ chức phải được loại trừ 100%:

```
[Chi nhánh / Pháp nhân A]               [Chi nhánh / Pháp nhân B]
      │                                       │
      ├─────── Xuất bán nội bộ (Hóa đơn) ─────┤
      │        TK 5112 / Có 156               │  Nhập kho hàng hóa:
      │        Nợ 1368 (Phải thu NB)          │  Nợ 156 / Có 3368 (Phải trả NB)
      │                                       │
      ▼                                       ▼
┌─────────────────────────────────────────────────────────────┐
│       INTERCOMPANY TRANSACTION ELIMINATION ENGINE           │
│ 1. Khử toàn bộ Doanh thu & Giá vốn bán nội bộ:              │
│    - Nợ TK 5112 (Doanh thu nội bộ)                          │
│    - Có TK 632  (Giá vốn hàng bán)                          │
│ 2. Khử lãi/lỗ chưa thực hiện trong giá trị hàng tồn kho:     │
│    - Nợ TK 632  (Giá vốn hàng bán)                          │
│    - Có TK 156  (Giá trị tồn kho hợp nhất)                  │
│ 3. Khử công nợ tương hỗ nội bộ:                             │
│    - Nợ TK 3368 (Phải trả nội bộ)                           │
│    - Có TK 1368 (Phải thu nội bộ)                           │
└─────────────────────────────────────────────────────────────┘
```

### 2.2. Bảng đối chiếu số dư và giao dịch liên kết nội bộ

```typescript
// Interface mô tả cấu trúc giao dịch nội bộ cần loại trừ khi hợp nhất
export interface IntercompanyTransaction {
  id: string;
  sourceOrganizationId: string; // Pháp nhân xuất
  targetOrganizationId: string; // Pháp nhân nhập
  transactionDate: Date;
  transferType: "GOODS_TRANSFER" | "SERVICE_FEE" | "INTERNAL_LOAN";
  grossAmount: number;
  internalUnrealizedProfit: number; // Lãi chưa thực hiện trong giá bán nội bộ
  status: "PENDING_RECONCILIATION" | "RECONCILED" | "ELIMINATED";
  sourceVoucherCode: string; // Số chứng từ xuất (PXK kiêm VCNB)
  targetVoucherCode: string; // Số chứng từ nhập kho
}

export interface ConsolidatedBalanceSheetRow {
  itemCode: string;
  itemName: string;
  explanationNote: string;
  grossAmountAllEntities: number;
  eliminationAdjustment: number; // Số điều chỉnh giảm loại trừ
  consolidatedFinalAmount: number; // Số liệu hợp nhất sau loại trừ
}
```

---

## 3. THUẬT TOÁN DỰ BÁO NHU CẦU & ĐIỂM ĐẶT HÀNG LẠI (ROP & SAFETY STOCK)

### 3.1. Mô hình toán học kiểm soát tồn kho tối ưu

Hệ thống BizPro+ áp dụng mô hình toán học thống kê phân phối chuẩn (Gaussian Normal Distribution) để tính toán điểm đặt hàng lại:

$$\text{ROP} = (\bar{d} \times \bar{L}) + \text{SS}$$

Trong đó:
- $\bar{d}$ (*Average Daily Demand*): Mức tiêu thụ trung bình hàng ngày trong khoảng thời gian phân tích (30, 60 hoặc 90 ngày gần nhất).
- $\bar{L}$ (*Average Lead Time*): Thời gian trung bình từ khi phát hành Đơn mua hàng (PO) đến khi hàng nhập kho vật lý (tính bằng ngày).
- $\text{SS}$ (*Safety Stock* — Tồn kho an toàn): Lượng hàng dự phòng để triệt tiêu rủi ro biến động nhu cầu khách hàng và thời gian giao hàng của nhà cung cấp.

$$\text{SS} = Z \times \sqrt{\bar{L} \cdot \sigma_d^2 + \bar{d}^2 \cdot \sigma_L^2}$$

- $Z$: Hệ số mức dịch vụ (*Service Level Factor*):
  - 90% Service Level: $Z = 1.28$
  - 95% Service Level: $Z = 1.65$ (Khuyến nghị cho ngành bán lẻ tiêu chuẩn)
  - 99% Service Level: $Z = 2.33$ (Áp dụng cho SKU chủ lực / Top 20% doanh số Pareto)
- $\sigma_d$: Độ lệch chuẩn của mức tiêu thụ hàng ngày.
- $\sigma_L$: Độ lệch chuẩn của thời gian giao hàng nhà cung cấp.

### 3.2. Thuật toán phân loại hàng tồn kho theo nguyên lý Pareto (ABC Analysis)

```
        % Doanh số tích lũy
100% ┌──────────────────────────────────────────┐
     │                                     ░░░░░│ Nhóm C: 50% SKU còn lại
 95% │                             ▓▓▓▓▓▓▓▓     │ (Chiếm 5% doanh số - Kiểm soát lỏng)
     │                     ▒▒▒▒▒▒▒▒             │ Nhóm B: 30% SKU tiếp theo
 80% │             ████████                     │ (Chiếm 15% doanh số - Kiểm soát vừa)
     │     ████████                             │ Nhóm A: 20% SKU dẫn đầu
     │ ████                                     │ (Chiếm 80% doanh số - Kiểm soát chặt)
  0% └─────┴───────┴───────┴───────┴───────┴────┘
     0%   20%     40%     60%     80%    100%   % Tổng số lượng SKU
```

---

## 4. CÔNG THỨC TÍNH TOÁN LỢI NHUẬN THỰC TẾ THEO SKU & KÊNH BÁN (REAL-TIME NET MARGIN)

Để phản ánh chính xác hiệu quả kinh doanh trên từng sản phẩm, hệ thống bóc tách lợi nhuận ròng (*True Net Margin*) theo công thức:

$$\text{Net Profit}_{\text{SKU}} = \text{GMV} - \text{COGS} - \text{Platform Fees} - \text{Marketing CAC} - \text{Logistics Loss} - \text{Packaging}$$

Trong đó:
1. **GMV (*Gross Merchandise Value*):** Doanh thu gộp sau khi trừ chiết khấu voucher người bán.
2. **COGS (*Cost of Goods Sold*):** Giá vốn hàng bán tính theo phương pháp Bình quân gia quyền di động (hoặc FIFO) từ Sổ cái phân hệ Kho (TK 632).
3. **Platform Fees (*Phí sàn TMĐT*):** 
   - Phí thanh toán (2.5% - 5%).
   - Phí cố định (4% - 9% tùy ngành hàng).
   - Phí dịch vụ chương trình (Freeship Xtra, Voucher Xtra: 4% - 8%).
4. **Marketing CAC (*Customer Acquisition Cost*):** Chi phí quảng cáo nội sàn (Shopee Ads, TikTok GMV Max) và ngoại sàn (Meta Ads) phân bổ theo thuật toán Attribution Model.
5. **Logistics Loss (*Thất thoát hoàn đơn*):** $\text{Return Rate} \times (\text{Phí ship chiều đi} + \text{Phí ship hoàn về} + \text{Tỷ lệ hao hụt hàng hỏng})$.

---

## 5. MÔ HÌNH DỮ LIỆU ĐỀ XUẤT (PROPOSED SCHEMA — SPECIFICATION ONLY)

> [!IMPORTANT]
> Toàn bộ các định nghĩa schema dưới đây là **ĐẶC TẢ KIẾN TRÚC THAM CHIẾU (SPEC-ONLY)**. Tuyệt đối **KHÔNG MUTATE** `prisma/schema.prisma` và không chạy bất kỳ database migration nào tại thời điểm này.

```prisma
// Reference Architecture Spec for Phase 4D (NON-EXECUTABLE SPECIFICATION)

enum AbcClassification {
  CLASS_A // 80% doanh thu (Kiểm soát tồn kho nghiêm ngặt)
  CLASS_B // 15% doanh thu (Kiểm soát định kỳ)
  CLASS_C // 5% doanh thu (Kiểm soát tinh giản)
}

enum ReorderTriggerStatus {
  SUFFICIENT // Tồn kho an toàn
  WARNING_NEAR_ROP // Tiệm cận điểm đặt hàng lại
  BREACHED_CRITICAL // Đã vi phạm ngưỡng an toàn (Cần tạo PO ngay)
  ORDER_PLACED // Đã tạo đơn mua hàng chờ giao
}

// Bảng cấu hình chính sách kiểm soát tồn kho theo SKU
model SkuInventoryPolicy {
  id                   String               @id @default(uuid())
  organizationId       String
  productId            String
  warehouseId          String
  leadTimeDays         Int                  @default(7) // Thời gian nhà cung cấp giao
  leadTimeStdDev       Float                @default(1.5)
  serviceLevelZ        Float                @default(1.65) // 95% service level
  safetyStockQuantity  Int                  @default(20)
  reorderPoint         Int                  @default(50)
  economicOrderQty     Int                  @default(100) // EOQ
  abcClass             AbcClassification    @default(CLASS_A)
  status               ReorderTriggerStatus @default(SUFFICIENT)
  updatedAt            DateTime             @updatedAt

  @@unique([organizationId, productId, warehouseId])
}

// Bảng tổng hợp lợi nhuận thực tế theo kênh bán hàng (BI Analytical Aggregate)
model SalesChannelProfitabilityAggregate {
  id                   String   @id @default(uuid())
  organizationId       String
  periodDate           DateTime // Ngày hạch toán (YYYY-MM-DD)
  channelCode          String   // SHOPEE, TIKTOK, LAZADA, DIRECT_STORE, B2B_PORTAL
  grossRevenue         Decimal  @db.Decimal(18, 2)
  cogsAmount           Decimal  @db.Decimal(18, 2)
  platformFees         Decimal  @db.Decimal(18, 2)
  allocatedMarketing   Decimal  @db.Decimal(18, 2)
  shippingCost         Decimal  @db.Decimal(18, 2)
  returnLossAmount     Decimal  @db.Decimal(18, 2)
  netOperatingProfit   Decimal  @db.Decimal(18, 2)
  netMarginPercentage  Float    // Tỷ suất biên lợi nhuận ròng

  @@unique([organizationId, periodDate, channelCode])
}
```

---

## 6. QUY TẮC BẢO TOÀN KIẾN TRÚC & QUẢN TRỊ AN TOÀN (SAFETY & GOVERNANCE)

1. **Tuân thủ quy chế đóng băng Phase 1A-3F và OPS-01/02/03:**
   - Không can thiệp mã nguồn backend đang chạy.
   - Không thay đổi bảng và cấu trúc cơ sở dữ liệu hiện hành.
2. **Tuân thủ chuẩn mực tính toán minh bạch:**
   - Mọi báo cáo phân tích tài chính đều phải có vết truy ngược (*Drill-down Audit Trail*) về chứng từ gốc (Sổ nhật ký chung, Phiếu xuất kho, Bảng kê đối soát sàn TMĐT).
   - Tách bạch rõ ràng số liệu thực tế đo lường được và số liệu dự báo thống kê (Forecast).
3. **Sẵn sàng nghiệm thu độc lập:**
   - Toàn bộ nội dung tài liệu tuân thủ chuẩn mực kỹ thuật cao nhất, logic toán học và nghiệp vụ tài chính Việt Nam chính xác 100%.
