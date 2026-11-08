# ĐẶC TẢ KIẾN TRÚC MOBILE PWA, QUÉT MÃ VẠCH GS1-128 & KIỂM KÊ KHO NGOẠI TUYẾN (PHASE 4E)

**Mã tài liệu:** `docs/PHASE_4E_MOBILE_PWA_AND_BARCODE_SCANNER_SPECIFICATION.md`  
**Ngày ban hành:** 08/11/2026  
**Thuộc lộ trình:** BizPro+ Enterprise ERP Expansion (Phase 4E — Spec-Only Architecture)  
**Phạm vi áp dụng:** Thiết kế kiến trúc & mô hình nghiệp vụ tham chiếu (Zero Code/Prisma Mutations to Frozen Core)  
**Căn cứ pháp lý & tiêu chuẩn kỹ thuật:**
- Tiêu chuẩn Mã vạch Quốc tế GS1 General Specifications (GS1-128 & GS1 DataMatrix).
- W3C Progressive Web App (PWA) Standards & Service Workers 1.0.
- W3C Web Application Barcode Detection API.
- Chuẩn mực lưu trữ ngoại tuyến Web Storage & IndexedDB API (W3C Recommendation).
- Luật Thương mại Việt Nam & Quy chuẩn quản lý mã số mã vạch của Tổng cục Tiêu chuẩn Đo lường Chất lượng Việt Nam (TCVN 7201:2002 & TCVN 7202:2002).

---

## 1. TỔNG QUAN & BỐI CẢNH NGHIỆP VỤ

Trong các doanh nghiệp phân phối, bán lẻ đa kênh và sản xuất quy mô vừa đến lớn tại Việt Nam, nghiệp vụ kho vận thường đối mặt với các thách thức:
1. **Môi trường kết nối mạng không ổn định (Dead Zones):** Nhà kho diện tích hàng ngàn mét vuông, trần cao, kệ sắt nhiều tầng tạo ra các góc chết sóng Wi-Fi và mạng di động (4G/5G). Thủ kho không thể phụ thuộc vào kết nối HTTP đồng bộ tức thời khi di chuyển giữa các dãy kệ.
2. **Sai sót thao tác thủ công (Human Entry Errors):** Nhập tay mã SKU hoặc số lượng dẫn đến nhầm lẫn màu sắc, kích cỡ, số lô hoặc date sản phẩm, gây bán âm hoặc sai lệch tồn kho vật lý.
3. **Đa dạng phần cứng:** Doanh nghiệp vừa và nhỏ (SMBs) sử dụng camera điện thoại thông minh (iOS/Android), trong khi các kho lớn sử dụng máy quét cầm tay chuyên dụng (Zebra, Honeywell) giao tiếp qua cổng HID (Keyboard Wedge).

Hệ thống **BizPro+ Phase 4E** được thiết kế để giải quyết triệt để các vấn đề trên thông qua kiến trúc **Progressive Web App (PWA) Offline-First** kết hợp **Engine xử lý mã vạch đa tiêu chuẩn GS1-128 / QR Code**.

---

## 2. TIÊU CHUẨN MÃ HÓA GS1-128 & ĐỊNH NGHĨA APPLICATION IDENTIFIERS (AIs)

Hệ thống hỗ trợ chuẩn mã hóa công nghiệp quốc tế **GS1-128** (trước đây là UCC/EAN-128), cho phép nhúng nhiều trường dữ liệu nghiệp vụ vào một chuỗi mã vạch duy nhất thông qua các Mã nhận dạng ứng dụng (*Application Identifiers - AIs*):

| Application Identifier (AI) | Ý nghĩa nghiệp vụ | Định dạng dữ liệu | Ví dụ thực tế |
| :--- | :--- | :--- | :--- |
| **(01)** | GTIN (Mã định danh sản phẩm toàn cầu) | 14 chữ số cố định | `(01)08935001234567` |
| **(10)** | Số Lô sản xuất (Batch / Lot Number) | Tối đa 20 ký tự chữ và số | `(10)LOT20261108` |
| **(17)** | Hạn sử dụng (Expiration Date) | 6 chữ số: Năm-Tháng-Ngày (YYMMDD) | `(17)271108` (HSD: 08/11/2027) |
| **(21)** | Số Sê-ri sản phẩm (Serial Number) | Tối đa 20 ký tự chữ và số | `(21)SN987654321` |
| **(310x)** | Khối lượng tịnh (Net Weight tính bằng kg) | 6 chữ số, $x$ xác định số chữ số thập phân | `(3102)001550` ($15.50$ kg) |

### Bộ giải mã chuỗi mã vạch (Barcode Parser Engine):
Chuỗi mã quét thô (*Raw scan string*) được chuẩn hóa và tách biệt bằng ký tự điều khiển ASCII `FNC1` (mã hex `\x1d` hoặc `<GS>` - Group Separator):

$$\text{Raw String} = \text{"010893500123456710LOT20261108\x1d1727110821SN987654321"}$$

Hệ thống bóc tách tự động:
- $\text{GTIN}: 08935001234567 \to \text{Truy vấn SKU tương ứng trong danh mục}$
- $\text{Batch}: \text{LOT20261108} \to \text{Ghi nhận số lô nhập kho}$
- $\text{ExpDate}: 2027-11-08 \to \text{Quản lý FEFO (First-Expired-First-Out)}$
- $\text{Serial}: \text{SN987654321} \to \text{Ghi nhận lịch sử bảo hành từng chiếc}$

---

## 3. QUY TRÌNH NGHIỆP VỤ KHO VẬN TRÊN THIẾT BỊ DI ĐỘNG

```
┌───────────────────────────────────────────────────────────────────────────┐
│              BIZPRO+ MOBILE WAREHOUSE OPERATIONS (PWA)                    │
└───────────────────────────────────────────────────────────────────────────┘
         │                                  │                     │
         ▼                                  ▼                     ▼
┌──────────────────┐               ┌──────────────────┐  ┌──────────────────┐
│  NHẬP KHO & PO   │               │ VỊ TRÍ Ô KỆ BIN  │  │   KIỂM KÊ MÙ     │
│ (Inbound Goods)  │               │ (Directed Put)   │  │(Blind Stocktake) │
└──────────────────┘               └──────────────────┘  └──────────────────┘
         │                                  │                     │
         ├─ Quét mã đơn PO                  ├─ Quét mã Vị trí     ├─ Không hiển thị
         ├─ Quét mã từng kiện/SKU           │  Khu-Dãy-Kệ-Tầng    │  số tồn sổ sách
         ├─ Phát hiện thừa/thiếu            ├─ Hệ thống gợi ý     ├─ Quét đếm thực tế
         └─ Ghi nhận số lô, hạn dùng        └─ Khóa vị trí lưu trữ└─ So lệch & đối soát
```

### 3.1. Nhập kho theo đơn mua (Guided Inbound Receiving)
1. **Khởi tạo:** Thủ kho chọn hoặc quét mã vạch Đơn mua hàng (PO). Hệ thống nạp danh mục sản phẩm dự kiến vào bộ nhớ đệm thiết bị.
2. **Quét thực nhận (Scan Verification):**
   - Quét mã vạch từng kiện hoặc sản phẩm. Hệ thống tự động nhảy tăng số lượng đếm thực tế (`scannedQuantity`).
   - Cảnh báo âm thanh và rung (*Haptic feedback*):
     * *Thành công (Green tone):* SKU hợp lệ thuộc đơn PO, số lượng trong định mức.
     * *Cảnh báo (Amber tone):* Đã quét đủ số lượng đặt của dòng SKU đó.
     * *Lỗi (Red tone):* SKU lạ không có trong đơn PO hoặc số lượng quét vượt quá dung sai cho phép (Over-receipt policy).
3. **Chốt nhập kho:** Tạo tự động Phiếu nhập kho (Goods Receipt Note - GRN) kèm danh sách chênh lệch (nếu có).

### 3.2. Định vị vị trí ô kệ (Bin/Rack Directed Putaway)
Hệ thống mã hóa không gian lưu trữ theo cấu trúc 5 cấp:
$$\text{Location Code} = \text{Zone} - \text{Aisle} - \text{Rack} - \text{Shelf} - \text{Bin}$$
*Ví dụ:* `A-02-04-03-01` (Khu A, Dãy 2, Kệ 4, Tầng 3, Ô 1).

- **Thuật toán gợi ý vị trí ô kệ (Putaway Engine):**
  - Ưu tiên 1: Ô kệ đang chứa cùng SKU (đáp ứng điều kiện dung tích còn trống).
  - Ưu tiên 2: Vị trí trống gần nhất thuộc Khu vực tương thích (hàng cồng kềnh xếp tầng thấp, hàng nhỏ/nhẹ xếp tầng trung, hàng giá trị cao xếp khu vực an ninh).
- **Xác thực 2 chiều:** Thủ kho bắt buộc phải quét mã vạch của Ô kệ trước khi bấm xác nhận đặt hàng, triệt tiêu 100% tình trạng "đặt một nơi, ghi sổ một nẻo".

### 3.3. Kiểm kê mù ngoại tuyến (Offline Blind Stocktaking)
- **Nguyên tắc Kiểm kê mù:** Trên màn hình của thủ kho hoàn toàn **KHÔNG hiển thị số lượng tồn sổ sách** (*System On-hand Qty*). Thủ kho chỉ thực hiện duy nhất hành vi: Đi đến từng vị trí ô kệ, quét mã ô kệ, và quét đếm toàn bộ số lượng thực tế có mặt.
- Cơ chế này loại bỏ hoàn toàn tâm lý ỷ lại vào số liệu phần mềm hoặc đếm đối phó.
- Kết quả kiểm kê sau khi đồng bộ lên hệ sinh thái trung tâm sẽ được Engine so lệch (*Variance Analysis Engine*) tính toán tự động chênh lệch $\Delta = \text{Thực tế} - \text{Sổ sách}$ để trình Ban Lãnh đạo duyệt biên bản điều chỉnh tồn kho theo quy định kế toán.

---

## 4. KIẾN TRÚC PWA OFFLINE-FIRST & ĐỒNG BỘ DỮ LIỆU (DATA RECONCILIATION)

### 4.1. Cấu trúc lưu trữ cục bộ (Local IndexedDB Architecture)

Mọi thao tác quét mã khi không có kết nối mạng được lưu trữ vào bộ lưu trữ cục bộ bảo mật của trình duyệt (*IndexedDB*):

1. **ObjectStore: `OfflineScanQueue`**:
   - `id`: UUID định danh duy nhất cho mỗi lượt quét.
   - `sessionId`: Định danh phiên làm việc (mã đợt kiểm kê hoặc mã phiếu xuất/nhập).
   - `barcode`: Chuỗi mã vạch quét được.
   - `parsedData`: Dữ liệu đã bóc tách (SKU, Lot, Expiry, Serial).
   - `locationCode`: Vị trí ô kệ ghi nhận tại thời điểm quét.
   - `timestamp`: Dấu thời gian cục bộ (ISO 8601 chính xác đến mili-giây).
   - `syncStatus`: `PENDING` | `IN_FLIGHT` | `SYNCED` | `CONFLICT`.
2. **ObjectStore: `OfflineCatalogCache`**:
   - Bảng ánh xạ nhanh giữa mã vạch (`barcode`) $\to$ thông tin SKU cơ bản (tên, hình ảnh thu nhỏ, đơn vị tính) để hiển thị phản hồi ngay lập tức cho thủ kho mà không cần chờ gọi mạng.

### 4.2. Giao thức đồng bộ hóa lũy tiến & Xử lý xung đột (Optimistic UI & Idempotency)

```
[Thiết bị PWA (Ngoại tuyến)]                      [BizPro+ Backend Sync Endpoint]
            │                                                      │
     Quét mã vạch (Offline)                                        │
            │                                                      │
     Ghi vào IndexedDB                                             │
   (Optimistic Scan Queue)                                         │
            │                                                      │
            ├───────────── Sóng mạng phục hồi (Online) ───────────┤
            │                                                      │
            ├── POST /api/v1/warehouse/sync (Batch 50 scans) ─────►│
            │   Header: Idempotency-Key = hash(sessionId, seq)     │ Kiểm tra trùng lặp
            │                                                      │ Hạch toán tuần tự
            │◄── 200 OK: { syncedIds: [...], conflicts: [...] } ───┤ Cập nhật trạng thái
            │                                                      │
     Cập nhật syncStatus = SYNCED                                  │
```

- **Tính bất biến và khóa Idempotency:** Mỗi đợt quét mang một mã băm định danh duy nhất `Idempotency-Key`. Nếu kết nối mạng chập chờn gửi lại nhiều lần, server chỉ xử lý đúng một lần duy nhất, ngăn chặn tình trạng đếm trùng số lượng.
- **Quy tắc giải quyết xung đột (Conflict Resolution Rules):**
  - Nếu phiên kiểm kê đã bị đóng bởi quản lý cấp cao trên Web Portal trong khi thủ kho đang quét ngoại tuyến: Ghi nhận dữ liệu vào danh mục `AUDIT_REVIEW` để người có thẩm quyền quyết định, không tự ý ghi đè hoặc loại bỏ.

---

## 5. MÔ HÌNH DỮ LIỆU ĐỀ XUẤT (PROPOSED SCHEMA — SPECIFICATION ONLY)

> [!IMPORTANT]
> Toàn bộ các định nghĩa model dưới đây là **ĐẶC TẢ KIẾN TRÚC THAM CHIẾU (SPEC-ONLY)** cho Phân hệ Mobile PWA & Barcode Scanner. Tuyệt đối **KHÔNG MUTATE** `prisma/schema.prisma` và không chạy bất kỳ database migration nào tại thời điểm này.

```prisma
// Reference Architecture Spec for Phase 4E (NON-EXECUTABLE SPECIFICATION)

enum BarcodeSymbology {
  EAN_13
  CODE_128
  GS1_128
  QR_CODE
  DATA_MATRIX
}

enum StocktakeStatus {
  DRAFT
  IN_PROGRESS
  RECONCILING
  COMPLETED
  CANCELLED
}

// Bảng cấu hình danh mục Vị trí ô kệ trong kho hàng
model WarehouseLocation {
  id             String   @id @default(uuid())
  organizationId String
  warehouseId    String
  zoneCode       String   // Khu vực (A, B, C...)
  aisleCode      String   // Dãy (01, 02...)
  rackCode       String   // Kệ (01, 02...)
  shelfCode      String   // Tầng (01, 02...)
  binCode        String   // Ô (01, 02...)
  locationCode   String   // Chuỗi mã định danh chuẩn: A-01-02-03-01
  barcode        String   // Mã vạch dán trên ô kệ vật lý
  capacityCbm    Float    @default(1.0) // Dung tích chứa tối đa (m3)
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())

  @@unique([organizationId, warehouseId, locationCode])
  @@unique([organizationId, warehouseId, barcode])
}

// Bảng ánh xạ Đa mã vạch cho từng biến thể SKU
model SkuBarcodeMapping {
  id             String           @id @default(uuid())
  organizationId String
  productId      String           // Mã sản phẩm cha
  skuCode        String           // Mã SKU biến thể
  barcode        String           // Chuỗi mã vạch (EAN-13, GS1-128...)
  symbology      BarcodeSymbology @default(CODE_128)
  isPrimary      Boolean          @default(true)
  packQuantity   Int              @default(1) // Quy cách đóng gói (1 chiếc, lốc 6, thùng 24)
  createdAt      DateTime         @default(now())

  @@unique([organizationId, barcode])
}

// Bảng phiên kiểm kê kho hàng (Hỗ trợ Kiểm kê mù & Ngoại tuyến)
model StocktakeSession {
  id             String          @id @default(uuid())
  organizationId String
  warehouseId    String
  sessionCode    String          // Mã phiên: ST-202611-001
  status         StocktakeStatus @default(DRAFT)
  isBlind        Boolean         @default(true) // Cờ kiểm kê mù (Ẩn số tồn sổ sách trên thiết bị)
  assignedUserId String?
  startedAt      DateTime?
  completedAt    DateTime?
  notes          String?
  createdAt      DateTime        @default(now())

  @@unique([organizationId, sessionCode])
}

// Chi tiết các lượt quét mã kiểm kê từ thiết bị di động
model StocktakeScanLine {
  id             String   @id @default(uuid())
  organizationId String
  sessionId      String
  locationCode   String   // Vị trí ô kệ quét được
  productId      String   // Mã sản phẩm cha
  skuCode        String   // Mã SKU cụ thể
  scannedBarcode String   // Chuỗi mã vạch gốc
  lotNumber      String?  // Số lô (nếu có từ GS1-128)
  expiryDate     DateTime? // Hạn dùng (nếu có từ GS1-128)
  serialNumber   String?  // Số sê-ri
  scannedQty     Int      @default(1)
  clientScanTime DateTime // Thời gian quét tại thiết bị di động
  syncedAt       DateTime @default(now())
  deviceClientUuid String // UUID định danh máy quét hoặc điện thoại

  @@index([sessionId, skuCode])
}
```

---

## 6. QUY TẮC BẢO TOÀN KIẾN TRÚC & QUẢN TRỊ AN TOÀN (SAFETY & GOVERNANCE)

1. **Tuân thủ triệt để quy chế đóng băng lõi:**
   - Các phân hệ Phase 1A–3F, OPS-01/02/03 và toàn bộ tài liệu Phase 4A–4D tiếp tục duy trì trạng thái đóng băng nghiêm ngặt.
   - Tài liệu Phase 4E là đặc tả thiết kế kiến trúc chuẩn hóa (SPEC-ONLY), không làm phát sinh bất kỳ thay đổi runtime backend hay database migration nào.
2. **Minh bạch hóa trải nghiệm người dùng:**
   - Mọi chức năng giao diện người dùng (UI) liên quan đến quét mã camera hoặc giao diện PWA khi triển khai ở các giai đoạn sau đều phải có nhãn minh chứng minh bạch rõ ràng giữa chế độ giả lập mô phỏng (Demo Simulation) và chế độ kết nối phần cứng thực tế.
3. **Tiêu chuẩn chất lượng xuất xưởng:**
   - Đặc tả này cung cấp nền tảng chuẩn hóa đầy đủ cho các kỹ sư Frontend (PWA, Service Worker, Web Barcode Detection API) và Kỹ sư Backend (Idempotent Sync Engine) khi bước vào giai đoạn hiện thực hóa trong tương lai.
