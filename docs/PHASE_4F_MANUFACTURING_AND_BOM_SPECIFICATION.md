# ĐẶC TẢ KIẾN TRÚC QUẢN LÝ SẢN XUẤT, ĐỊNH MỨC NGUYÊN VẬT LIỆU (BOM) & TÍNH GIÁ THÀNH THÀNH PHẨM (PHASE 4F)

**Mã tài liệu:** `docs/PHASE_4F_MANUFACTURING_AND_BOM_SPECIFICATION.md`  
**Ngày ban hành:** 08/11/2026  
**Thuộc lộ trình:** BizPro+ Enterprise ERP Expansion (Phase 4F — Spec-Only Architecture)  
**Phạm vi áp dụng:** Thiết kế kiến trúc & mô hình nghiệp vụ tham chiếu (Zero Code/Prisma Mutations to Frozen Core)  
**Căn cứ pháp lý & chuẩn mực kỹ thuật:**
- Thông tư 200/2014/TT-BTC hướng dẫn Chế độ Kế toán Doanh nghiệp (Tập hợp chi phí và tính giá thành sản phẩm: TK 621, TK 622, TK 627, TK 154, TK 155).
- Chuẩn mực Kế toán Việt Nam số 02 (VAS 02) — *Hàng tồn kho* (Nguyên tắc tính giá gốc hàng tồn kho sản xuất).
- Tiêu chuẩn Quản lý Chất lượng TCVN ISO 9001:2015 trong điều hành sản xuất.
- Chuẩn mực quốc tế APICS / ASCM (Association for Supply Chain Management) về định mức nguyên vật liệu (BOM) và hoạch định nguồn lực sản xuất (MRP II).

---

## 1. TỔNG QUAN & BỐI CẢNH DOANH NGHIỆP SẢN XUẤT VIỆT NAM

Các doanh nghiệp vừa và nhỏ (SMBs) trong các lĩnh vực chế biến thực phẩm, đóng gói hàng hóa tiêu dùng (FMCG), may mặc thời trang và lắp ráp cơ khí tại Việt Nam thường gặp phải các bài toán hóc búa:
1. **Thiếu định mức nguyên vật liệu (BOM) chuẩn xác:** Hao hụt thực tế vượt quá định mức dự kiến do không kiểm soát được phế phẩm (*Scrap rate*) và dung sai định lượng (*Wastage tolerance*).
2. **Sai lệch giá vốn hàng bán (COGS Discrepancy):** Doanh nghiệp chỉ tính giá nguyên vật liệu thô mà bỏ quên chi phí nhân công trực tiếp (TK 622) và chi phí sản xuất chung (TK 627 - khấu hao máy móc, tiền điện, bao bì phụ trợ), dẫn đến báo cáo lãi ảo nhưng dòng tiền thực tế âm.
3. **Mất cân đối giữa kế hoạch mua hàng (PO) và lệnh sản xuất (MO):** Xuất hiện tình trạng đứt gãy dây chuyền vì thiếu 1-2 phụ liệu nhỏ (tem nhãn, màng co, túi zipper), hoặc tồn kho quá mức nguyên vật liệu có hạn sử dụng ngắn.

Phân hệ **BizPro+ Phase 4F** được thiết kế để giải quyết trọn vẹn chuỗi giá trị sản xuất tinh gọn (*Lean Manufacturing*) kết hợp kế toán chi phí chuẩn mực theo Thông tư 200.

---

## 2. KIẾN TRÚC ĐỊNH MỨC NGUYÊN VẬT LIỆU ĐA CẤP (MULTI-LEVEL BOM)

```
┌────────────────────────────────────────────────────────────────────────┐
│             THÀNH PHẨM (FINISHED GOOD - SKU: FG-COF-PREMIUM)          │
└────────────────────────────────────────────────────────────────────────┘
                    │                                   │
       (Bán thành phẩm cấp 1 - 70%)         (Vật tư bao bì cấp 1 - 30%)
                    ▼                                   ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│  BÁN THÀNH PHẨM: Cà phê rang xay     │  │ Hộp thiếc dập nổi cao cấp   │
│  (Mã: SFG-COF-ROASTED)               │  │ (Mã: PKG-CAN-01)             │
└──────────────────────────────────────┘  └──────────────────────────────┘
         │                  │                             │
    (85% Arabica)      (15% Robusta)              (Màng nhôm niêm phong)
         ▼                  ▼                             ▼
┌──────────────────┐┌──────────────────┐  ┌──────────────────────────────┐
│ Hạt cà phê nhân  ││ Hạt cà phê nhân  │  │ Cuộn màng nhôm thực phẩm     │
│ Arabica Cầu Đất  ││ Robusta Buôn Mê  │  │ (Mã: RAW-FOIL-ROLL)          │
│ (RAW-COF-ARA)    ││ (RAW-COF-ROB)    │  └──────────────────────────────┘
└──────────────────┘└──────────────────┘
```

### 2.1. Cấu trúc dữ liệu của một dòng BOM Component
Mỗi dòng định mức bao gồm:
1. **Gross Quantity (Số lượng gộp):**
   $$\text{Gross Quantity} = \text{Net Quantity} \times \left(1 + \frac{\text{Scrap Percentage}}{100}\right)$$
   *Ví dụ:* Cần 100g bột cà phê sạch thành phẩm, tỷ lệ hao hụt khi xay và đóng gói là 3%, thì số lượng nguyên liệu thô cần cấp là $100 \times 1.03 = 103$g.
2. **Substitute Materials (Vật tư thay thế):**
   Trong trường hợp mã nguyên vật liệu chính hết hàng tồn kho, hệ thống cho phép kích hoạt danh mục vật tư thay thế tương đương (*Alternative BOM Item*) với hệ số quy đổi xác định trước.
3. **Engineering Change Order (ECO - Quản lý phiên bản BOM):**
   Mỗi công thức BOM mang mã phiên bản (`version: "v1.2"`), ngày hiệu lực (*Effective Date*) và ngày hết hiệu lực (*Expiration Date*). Tuyệt đối không xóa đè công thức cũ để đảm bảo truy vết kiểm toán chi phí sản xuất trong quá khứ.

---

## 3. VÒNG ĐỜI LỆNH SẢN XUẤT (MANUFACTURING WORK ORDER LIFECYCLE)

Quy trình điều hành lệnh sản xuất được chuẩn hóa thành 5 giai đoạn tuần tự nghiêm ngặt:

```
[1. DRAFT] ──────► [2. SCHEDULED] ──────► [3. IN_PROGRESS] ──────► [4. QC_INSPECTION] ──────► [5. COMPLETED]
 Khởi tạo           Lên lịch &             Xuất kho NVL               Kiểm định chất lượng      Nhập kho Thành phẩm
 Lệnh SX            Khóa giữ NVL           Vận hành dây chuyền        Nghiệm thu đạt chuẩn      Tất toán chi phí TK 154
```

1. **Giai đoạn 1: Khởi tạo Lệnh sản xuất (DRAFT):**
   - Bộ phận kế hoạch chọn Thành phẩm cần sản xuất và Số lượng mục tiêu (`targetQuantity`).
   - Hệ thống tự động nạp BOM phiên bản đang hiệu lực và phân tích khả năng đáp ứng của kho NVL (*Material Availability Check*).
2. **Giai đoạn 2: Lên lịch & Khóa giữ NVL (SCHEDULED):**
   - Đặt lịch ngày bắt đầu (`plannedStartDate`) và ngày hoàn thành dự kiến (`plannedEndDate`).
   - Tự động khóa giữ lượng tồn kho khả dụng của nguyên vật liệu liên quan, ngăn ngừa bộ phận bán hàng xuất bán nhầm NVL sản xuất.
3. **Giai đoạn 3: Xuất kho NVL & Vận hành sản xuất (IN_PROGRESS):**
   - Tự động sinh **Phiếu xuất kho nguyên vật liệu sản xuất** (Nợ TK 621 / Có TK 152).
   - Ghi nhận thời gian máy chạy, nhân công vận hành phân xưởng (Nợ TK 622).
4. **Giai đoạn 4: Kiểm tra chất lượng (QC_INSPECTION):**
   - Phân loại sản lượng thực tế sau ca máy:
     * Số lượng đạt tiêu chuẩn (*Accepted Quantity*).
     * Số lượng lỗi có thể sửa chữa (*Rework Quantity*).
     * Phế phẩm hủy bỏ (*Scrap / Rejection Quantity*).
5. **Giai đoạn 5: Nhập kho Thành phẩm & Tất toán (COMPLETED):**
   - Sinh **Phiếu nhập kho thành phẩm** (Nợ TK 155 / Có TK 154).
   - Khóa sổ lệnh sản xuất, kết chuyển toàn bộ chi phí thực tế phát sinh.

---

## 4. CƠ CHẾ KẾ TOÁN TẬP HỢP CHI PHÍ & TÍNH GIÁ THÀNH (VAS 02 & TT 200/2014)

### 4.1. Bóc tách 3 yếu tố chi phí sản xuất:
1. **Chi phí Nguyên vật liệu trực tiếp (TK 621):**
   - Trị giá thực tế của hạt cà phê, phụ gia, hộp thiếc, màng nhôm xuất kho phục vụ trực tiếp cho lệnh sản xuất.
   - Hạch toán: Nợ TK 621 / Có TK 152.
2. **Chi phí Nhân công trực tiếp (TK 622):**
   - Tiền lương, tiền công và các khoản trích theo lương (BHXH 17.5%, BHYT 3%, BHTN 1%, KPCĐ 2%) của công nhân trực tiếp vận hành dây chuyền sản xuất.
   - Hạch toán: Nợ TK 622 / Có TK 334, Có TK 338.
3. **Chi phí Sản xuất chung (TK 627):**
   - Khấu hao máy móc xưởng sản xuất (TK 6274), tiền điện nước nhà xưởng (TK 6277), lương quản đốc xưởng (TK 6271).
   - Phân bổ cho từng lệnh sản xuất theo tiêu thức phù hợp (theo tỷ lệ chi phí NVL trực tiếp hoặc số giờ máy chạy thực tế).
   - Hạch toán: Nợ TK 627 / Có TK 214, Có TK 112, Có TK 331.

### 4.2. Tập hợp chi phí vào TK 154 và Nhập kho Thành phẩm TK 155:

$$\text{Tổng giá thành sản phẩm} = \text{Chi phí dở dang đầu kỳ} + (\text{TK 621} + \text{TK 622} + \text{TK 627}) - \text{Chi phí dở dang cuối kỳ}$$

$$\text{Giá thành đơn vị (Unit Cost)} = \frac{\text{Tổng giá thành sản phẩm}}{\text{Số lượng thành phẩm hoàn thành nhập kho}}$$

```
  [TK 621: Chi phí NVL trực tiếp] ───────┐
                                          │
  [TK 622: Chi phí Nhân công TT]  ───────┼──► [TK 154: CPSX KD dở dang] ──► [TK 155: Thành phẩm]
                                          │     (Tập hợp chi phí Lệnh SX)     (Nhập kho hoàn thành)
  [TK 627: Chi phí SX chung]      ───────┘
```

**Bút toán kế toán chuẩn mực theo Thông tư 200/2014/TT-BTC:**
1. Cuối kỳ hoặc khi hoàn thành lệnh sản xuất, kết chuyển chi phí:
   - Nợ TK 154 (*Chi phí sản xuất, kinh doanh dở dang*)
   - Có TK 621 (*Chi phí nguyên liệu, vật liệu trực tiếp*)
   - Có TK 622 (*Chi phí nhân công trực tiếp*)
   - Có TK 627 (*Chi phí sản xuất chung*)
2. Nhập kho thành phẩm hoàn thành bàn giao vào kho bảo quản:
   - Nợ TK 155 (*Thành phẩm*)
   - Có TK 154 (*Chi phí sản xuất, kinh doanh dở dang*)

---

## 5. MÔ HÌNH DỮ LIỆU ĐỀ XUẤT (PROPOSED SCHEMA — SPECIFICATION ONLY)

> [!IMPORTANT]
> Toàn bộ các định nghĩa model dưới đây là **ĐẶC TẢ KIẾN TRÚC THAM CHIẾU (SPEC-ONLY)** cho Phân hệ Quản lý Sản xuất & Định mức BOM. Tuyệt đối **KHÔNG MUTATE** `prisma/schema.prisma` và không chạy bất kỳ database migration nào tại thời điểm này.

```prisma
// Reference Architecture Spec for Phase 4F (NON-EXECUTABLE SPECIFICATION)

enum BomStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum WorkOrderStatus {
  DRAFT
  SCHEDULED
  IN_PROGRESS
  QC_INSPECTION
  COMPLETED
  CANCELLED
}

// Bảng tiêu đề Định mức Nguyên vật liệu (BOM Header)
model BillOfMaterials {
  id             String      @id @default(uuid())
  organizationId String
  finishedGoodId String      // Dimension: Sản phẩm cha (Parent Product ID)
  skuCode        String      // Dimension: SKU thành phẩm cụ thể
  bomCode        String      // Mã công thức: BOM-COF-PREMIUM-V1
  version        String      @default("v1.0")
  status         BomStatus   @default(ACTIVE)
  yieldRate      Float       @default(1.0) // Hệ số sản lượng đầu ra (1.0 = 100%)
  notes          String?
  effectiveDate  DateTime    @default(now())
  expirationDate DateTime?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  items          BomComponentItem[]

  @@unique([organizationId, skuCode, version])
}

// Bảng chi tiết các thành phần nguyên vật liệu trong công thức BOM
model BomComponentItem {
  id                 String          @id @default(uuid())
  bomId              String
  componentProductId String          // Mã sản phẩm NVL/phụ liệu
  componentSkuCode   String          // Mã SKU NVL/phụ liệu cụ thể
  netQuantity        Float           // Định mức tịnh cần cho 1 đơn vị thành phẩm
  scrapPercentage    Float           @default(0.0) // Tỷ lệ hao hụt dự kiến (%)
  grossQuantity      Float           // Số lượng gộp: netQuantity * (1 + scrapPercentage/100)
  unitOfMeasure      String          // kg, g, cái, m2, hộp
  isOptional         Boolean         @default(false)
  substituteSkuCode  String?         // Mã SKU thay thế khi hết hàng

  bom                BillOfMaterials @relation(fields: [bomId], references: [id])

  @@index([bomId, componentSkuCode])
}

// Bảng Lệnh sản xuất (Work Order / Manufacturing Order)
model WorkOrder {
  id               String          @id @default(uuid())
  organizationId   String
  orderCode        String          // Lệnh sản xuất: WO-202611-008
  bomId            String
  targetSkuCode    String          // SKU thành phẩm cần sản xuất
  warehouseId      String          // Kho xuất NVL và nhập thành phẩm
  targetQuantity   Int             // Sản lượng kế hoạch
  producedQuantity Int             @default(0) // Sản lượng thực tế đạt chuẩn
  scrappedQuantity Int             @default(0) // Sản lượng phế phẩm loại bỏ
  status           WorkOrderStatus @default(DRAFT)
  plannedStartDate DateTime
  plannedEndDate   DateTime
  actualStartDate  DateTime?
  actualEndDate    DateTime?
  
  // Kế toán chi phí giá thành thực tế
  directMaterialCost Decimal       @default(0) @db.Decimal(18, 2) // TK 621
  directLaborCost    Decimal       @default(0) @db.Decimal(18, 2) // TK 622
  overheadCost       Decimal       @default(0) @db.Decimal(18, 2) // TK 627
  totalProductionCost Decimal      @default(0) @db.Decimal(18, 2) // Tổng TK 154
  unitFinishedCost   Decimal       @default(0) @db.Decimal(18, 2) // Giá thành đơn vị TK 155

  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  @@unique([organizationId, orderCode])
}
```

---

## 6. QUY TẮC BẢO TOÀN KIẾN TRÚC & QUẢN TRỊ AN TOÀN (SAFETY & GOVERNANCE)

1. **Tuân thủ quy chế đóng băng nghiêm ngặt:**
   - Các phân hệ Phase 1A–3F, OPS-01/02/03 và Phase 4A–4E tiếp tục duy trì trạng thái đóng băng 100%.
   - Đặc tả Phase 4F được lưu trữ tại `docs/PHASE_4F_MANUFACTURING_AND_BOM_SPECIFICATION.md` ở trạng thái SPEC-ONLY. Không thay đổi file Prisma hoặc chạy lệnh database migration nào.
2. **Minh bạch hóa tính toán giá thành:**
   - Mọi số liệu chi phí giá thành trong tài liệu hoặc giao diện demo đều phải phân định rành mạch giữa 3 yếu tố NVL (TK 621), Nhân công (TK 622) và Sản xuất chung (TK 627).
   - Gắn nhãn minh họa rõ ràng cho các kịch bản demo, không trình bày số liệu giả định như dữ liệu đo lường vận hành thực tế.
