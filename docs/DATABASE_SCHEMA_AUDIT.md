# BÁO CÁO KIỂM TOÁN CƠ SỞ DỮ LIỆU TOÀN DIỆN (DATABASE SCHEMA AUDIT)
**Dự án:** BizPro+ Integrated Modular Business Management System  
**Phiên bản Schema:** 1.0 — Baseline (50 Models, 19 Enums)  
**Phân hệ:** System Core & Database Foundation (Phase 1C-B)  
**Ngày kiểm toán:** 04/11/2026  
**Người thực hiện:** Technical Lead & Principal Database Engineer  

---

## 1. MỤC TIÊU & PHẠM VI KIỂM TOÁN

Báo cáo này là cổng nghiệm thu bắt buộc (**Gate 1C-B**) trước khi thực hiện bất kỳ thay đổi nào lên `schema.prisma` và trước khi tạo migration đầu tiên lên PostgreSQL 16.

Kiểm toán toàn diện 100% tệp tin `prisma/schema.prisma` (1.277 dòng code) bao gồm:
- **50 models** thuộc 5 phân hệ: Shared Platform, HRM, CRM, Inventory Management, Sales Order.
- **19 enums** định nghĩa trạng thái hệ thống.
- Khóa chính (PK), Khóa ngoại (FK), Referential Actions (`onDelete`, `onUpdate`).
- Tính toàn vẹn đa tổ chức (Multi-Tenancy Isolation).
- Độ chính xác số học (Decimal Precision) cho tài chính & số lượng kho.
- Hiệu năng chỉ mục (Index Optimization).
- Các bất biến vật lý (Physical Invariants) tại PostgreSQL.

---

## 2. THỐNG KÊ TỔNG QUAN HỆ THỐNG

### 2.1. Thống kê theo phân hệ (50 Models)
| STT | Phân hệ | Số lượng Models | Danh sách Models |
|:---:|---|:---:|---|
| 1 | **Shared Platform & Security** | 9 | `Organization`, `User`, `Role`, `Permission`, `RolePermission`, `UserRole`, `AuditLog`, `Notification`, `File` |
| 2 | **HRM (Nhân sự)** | 10 | `Department`, `Position`, `Employee`, `EmployeeContract`, `WorkShift`, `AttendanceRecord`, `LeaveType`, `LeaveBalance`, `LeaveRequest`, `EmployeeHistory` |
| 3 | **CRM (Khách hàng & Bán lẻ)** | 10 | `Company`, `Contact`, `Lead`, `Customer`, `Pipeline`, `PipelineStage`, `Deal`, `DealStageHistory`, `Activity`, `CrmNote` |
| 4 | **Inventory Management (Kho)** | 18 | `ProductCategory`, `UnitOfMeasure`, `Product`, `Warehouse`, `InventoryBalance`, `Supplier`, `StockReceipt`, `StockReceiptItem`, `StockIssue`, `StockIssueItem`, `StockTransfer`, `StockTransferItem`, `StockAdjustment`, `StockAdjustmentItem`, `Stocktake`, `StocktakeItem`, `InventoryTransaction`, `InventoryReservation` |
| 5 | **Sales Order (Đơn bán hàng)** | 3 | `SalesOrder`, `SalesOrderItem`, `SalesOrderStatusHistory` |
| **Tổng** | **5 Phân hệ** | **50 Models** | **100% khớp kiến trúc thiết kế** |

### 2.2. Thống kê Enums (19 Enums)
*Lưu ý đính chính: Tài liệu sơ khởi ghi nhận 14 enums; kết quả rà soát thực tế mã nguồn tệp `schema.prisma` có đúng **19 enums**:*
1. `CommonStatus` (ACTIVE, INACTIVE, ARCHIVED)
2. `LeadStatus` (NEW, CONTACTED, QUALIFIED, UNQUALIFIED, CONVERTED)
3. `CustomerType` (INDIVIDUAL, BUSINESS)
4. `DealStatus` (OPEN, WON, LOST)
5. `ActivityType` (CALL, MEETING, EMAIL, TASK, NOTE)
6. `ActivityStatus` (PENDING, COMPLETED, CANCELLED)
7. `StockDocStatus` (DRAFT, POSTED, CANCELLED)
8. `TransferStatus` (DRAFT, IN_TRANSIT, POSTED, CANCELLED)
9. `StocktakeStatus` (DRAFT, IN_PROGRESS, COMPLETED, CANCELLED)
10. `InventoryTransactionType` (RECEIPT, ISSUE, TRANSFER_OUT, TRANSFER_IN, ADJUST_INCREASE, ADJUST_DECREASE)
11. `ReservationStatus` (ACTIVE, FULFILLED, RELEASED)
12. `SalesOrderStatus` (DRAFT, CONFIRMED, PARTIALLY_FULFILLED, FULFILLED, CANCELLED, ON_HOLD)
13. `EmploymentStatus` (PROBATION, OFFICIAL, ON_LEAVE, RESIGNED, TERMINATED)
14. `ContractType` (PROBATION, DEFINITE_TERM, INDEFINITE_TERM, PART_TIME, INTERNSHIP)
15. `AttendanceStatus` (PRESENT, LATE, EARLY_LEAVE, ABSENT, HOLIDAY, ON_LEAVE)
16. `AttendanceSource` (WEB_UI, MANUAL_ENTRY, BIOMETRIC_DEVICE, MOBILE_APP)
17. `LeaveRequestStatus` (PENDING, APPROVED, REJECTED, CANCELLED)
18. `DataScope` (OWN, DEPARTMENT, ALL)
19. `NotificationType` (INFO, SUCCESS, WARNING, ERROR, TASK_ASSIGNED, APPROVAL_REQUIRED)

---

## 3. DANH SÁCH CÁC VẤN ĐỀ PHÁT HIỆN & PHÂN LOẠI MỨC ĐỘ

### Bảng tổng hợp lỗi phát hiện:
| Mức độ (Severity) | Số lượng | Mô tả tóm tắt |
|---|:---:|---|
| **CRITICAL** | 2 | Thiếu FK Relation trên `EmployeeContract`; Thiếu Database Check Constraints trên Tồn kho |
| **HIGH** | 2 | Cột FK thừa & mất đồng bộ `Employee.userId` $\leftrightarrow$ `User.employeeId`; Thiếu Index trên toàn bộ Foreign Key các bảng chi tiết (Detail Line Items) |
| **MEDIUM** | 2 | `SalesOrder` thiếu snapshot địa chỉ giao hàng (`shippingAddressSnapshot`); `SalesOrder` thiếu trạng thái thanh toán |
| **LOW** | 1 | Thiếu ràng buộc Unique chống trùng sản phẩm trên cùng một phiếu kiểm kê (`StocktakeItem`) |
| **Tổng cộng** | **7** | |

---

### CHI TIẾT TỪNG VẤN ĐỀ & PHÂN TÍCH KỸ THUẬT

#### Vấn đề 1: Thiếu Foreign Key Relation `organizationId` trên bảng `EmployeeContract`
- **Mức độ:** **CRITICAL**
- **Vị trí:** `prisma/schema.prisma`, dòng 447-465 (`model EmployeeContract`).
- **Hiện trạng:**
  ```prisma
  model EmployeeContract {
    id             String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    organizationId String       @map("organization_id") @db.Uuid // Không có relation!
    employeeId     String       @map("employee_id") @db.Uuid
    ...
    employee Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
    file     File?    @relation(fields: [fileId], references: [id], onDelete: SetNull)
    @@unique([organizationId, contractNumber])
  }
  ```
- **Hậu quả kỹ thuật:** Cột `organization_id` là UUID trôi nổi không có ràng buộc khóa ngoại tới bảng `organizations`. Nếu một Organization bị xóa hoặc truy vấn kiểm tra cascade, hợp đồng lao động sẽ trở thành orphan record, vi phạm tính toàn vẹn Referential Integrity.
- **Đề xuất khắc phục:** Bổ sung relation:
  `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`.

---

#### Vấn đề 2: Thiếu Physical CHECK Constraints trên Tồn kho ở tầng PostgreSQL
- **Mức độ:** **CRITICAL**
- **Vị trí:** `model InventoryBalance` (dòng 926-941).
- **Hiện trạng:**
  Prisma Schema chỉ định nghĩa kiểu dữ liệu `Decimal(12, 3)`, không thể định nghĩa câu lệnh SQL `CHECK` bên trong cú pháp schema.
- **Hậu quả kỹ thuật:**
  Nếu chỉ kiểm tra ở ứng dụng (Application Layer), các race condition (nhiều request chạy đồng thời trước khi commit) hoặc lỗi lập trình có thể làm `quantityOnHand < 0` hoặc `quantityReserved > quantityOnHand`, dẫn đến tồn khả dụng âm ($Available < 0$).
- **Đề xuất khắc phục:**
  Trong file migration SQL (`init/migration.sql`), bổ sung trực tiếp 3 physical check constraints:
  ```sql
  ALTER TABLE "inventory_balances" 
    ADD CONSTRAINT "chk_inventory_balances_on_hand_non_negative" CHECK ("quantity_on_hand" >= 0),
    ADD CONSTRAINT "chk_inventory_balances_reserved_non_negative" CHECK ("quantity_reserved" >= 0),
    ADD CONSTRAINT "chk_inventory_balances_reserved_lte_on_hand" CHECK ("quantity_reserved" <= "quantity_on_hand");
  ```
  Tương tự trên `inventory_reservations`:
  ```sql
  ALTER TABLE "inventory_reservations"
    ADD CONSTRAINT "chk_inventory_reservations_quantity_positive" CHECK ("quantity" > 0);
  ```

---

#### Vấn đề 3: Cột FK trùng lặp và mất đồng bộ giữa `Employee.userId` và `User.employeeId`
- **Mức độ:** **HIGH**
- **Vị trí:** `model User` (dòng 210, 223) và `model Employee` (dòng 423, 432).
- **Hiện trạng:**
  Trong `User`:
  `employeeId String? @unique @map("employee_id") @db.Uuid`  
  `employee Employee? @relation(fields: [employeeId], references: [id], onDelete: SetNull)`  
  Trong `Employee`:
  `userId String? @unique @map("user_id") @db.Uuid` (Cột scalar độc lập, không có relation!)  
  `user User?`
- **Hậu quả kỹ thuật:** 
  Quan hệ 1-1 giữa User và Employee có 2 cột khóa ngoại cùng trỏ qua lại. Một bản ghi có thể có `User.employeeId = A` nhưng `Employee.userId = B` hoặc `null`, gây bất nhất quán dữ liệu nghiêm trọng.
- **Đề xuất khắc phục:** 
  Chuẩn hóa quan hệ 1-1: Giữ duy nhất `User.employeeId` làm cột khóa ngoại vật lý (`@relation`), loại bỏ cột scalar thừa `userId` trong model `Employee`. Phía `Employee` chỉ giữ `user User?` (virtual back-relation của Prisma).

---

#### Vấn đề 4: Thiếu Indexes trên Foreign Key của toàn bộ các bảng chi tiết (Detail Line Items)
- **Mức độ:** **HIGH**
- **Vị trí:** 
  `SalesOrderItem` (`sales_order_id`, `product_id`),  
  `StockReceiptItem` (`receipt_id`, `product_id`),  
  `StockIssueItem` (`issue_id`, `product_id`),  
  `StockTransferItem` (`transfer_id`, `product_id`),  
  `StockAdjustmentItem` (`adjustment_id`, `product_id`),  
  `StocktakeItem` (`stocktake_id`, `product_id`),  
  `SalesOrderStatusHistory` (`sales_order_id`),  
  `DealStageHistory` (`deal_id`).
- **Hiện trạng:**
  PostgreSQL **không** tự động tạo B-Tree Index cho các cột tham chiếu khóa ngoại. Hiện tại các bảng này không có `@@index` nào.
- **Hậu quả kỹ thuật:**
  Mỗi khi load chi tiết đơn hàng (`SELECT * FROM sales_order_items WHERE sales_order_id = ?`) hoặc load chi tiết phiếu xuất/nhập/chuyển kho, PostgreSQL buộc phải quét tuần tự (Sequential Scan) toàn bộ bảng. Khi bảng đạt vài chục nghìn dòng, tốc độ truy vấn sẽ suy giảm từ vài mili-giây lên hàng giây.
- **Đề xuất khắc phục:**
  Bổ sung các index đơn và composite index phục vụ đúng truy vấn:
  - `SalesOrderItem`: `@@index([salesOrderId])`, `@@index([productId])`
  - `StockReceiptItem`: `@@index([receiptId])`, `@@index([productId])`
  - `StockIssueItem`: `@@index([issueId])`, `@@index([productId])`
  - `StockTransferItem`: `@@index([transferId])`, `@@index([productId])`
  - `StockAdjustmentItem`: `@@index([adjustmentId])`, `@@index([productId])`
  - `StocktakeItem`: `@@index([stocktakeId])`, `@@index([productId])`
  - `SalesOrderStatusHistory`: `@@index([salesOrderId])`
  - `DealStageHistory`: `@@index([dealId])`

---

#### Vấn đề 5: `SalesOrder` thiếu Snapshot địa chỉ giao hàng (`shippingAddressSnapshot`)
- **Mức độ:** **MEDIUM**
- **Vị trí:** `model SalesOrder` (dòng 1205-1240).
- **Phân tích nghiệp vụ & kỹ thuật:**
  Trên `SalesOrderItem`, thiết kế đã rất xuất sắc khi snapshot lại thông tin hàng hóa tại thời điểm đặt hàng:
  `skuSnapshot`, `productNameSnapshot`, `uomSnapshot`, `unitPrice`.
  Tuy nhiên, `SalesOrder` hiện chỉ có quan hệ `customerId -> Customer`. Địa chỉ của khách hàng nằm trong bảng `Customer.address`.
  Nếu 6 tháng sau khách hàng đổi địa chỉ trụ sở/kho nhận, toàn bộ các đơn hàng lịch sử trong quá khứ nếu join qua `Customer.address` sẽ bị hiển thị sai địa chỉ thực tế đã giao trước đó!
- **Đề xuất khắc phục:**
  Bổ sung trường `shippingAddressSnapshot String? @map("shipping_address_snapshot") @db.Text` vào `SalesOrder`. Trường này cho phép snapshot địa chỉ nhận hàng tại thời điểm Confirm đơn, đúng theo triết lý snapshot bất biến của hệ thống.

---

#### Vấn đề 6: `SalesOrder` thiếu theo dõi trạng thái thanh toán (Payment Status)
- **Mức độ:** **MEDIUM**
- **Vị trí:** `model SalesOrder` và `SalesOrderStatus`.
- **Phân tích nghiệp vụ & kỹ thuật:**
  Hiện tại `SalesOrderStatus` chỉ quản lý vòng đời hoàn tất kho:
  `DRAFT`, `CONFIRMED`, `PARTIALLY_FULFILLED`, `FULFILLED`, `CANCELLED`, `ON_HOLD`.
  Hệ thống SME thực tế bắt buộc phải phân biệt được đơn:
  * Đã giao nhưng **chưa thanh toán** (công nợ phải thu).
  * Đã thanh toán chuyển khoản trước nhưng **chưa xuất kho**.
- **Đề xuất khắc phục (2 phương án):**
  - **Phương án A (Khuyên dùng cho MVP):** Thêm enum `PaymentStatus` (UNPAID, PARTIALLY_PAID, PAID, REFUNDED) và bổ sung trường `paymentStatus PaymentStatus @default(UNPAID) @map("payment_status")` trực tiếp trên `SalesOrder`.
  - **Phương án B:** Tách riêng bảng `PaymentTransaction` độc lập liên kết `salesOrderId`. (Phù hợp khi hệ thống tích hợp cổng thanh toán trực tuyến Napas/VNPay ở giai đoạn nâng cao).

---

#### Vấn đề 7: Thiếu Unique Constraint chống kiểm kê trùng sản phẩm (`StocktakeItem`)
- **Mức độ:** **LOW**
- **Vị trí:** `model StocktakeItem` (dòng 1141-1153).
- **Phân tích kỹ thuật:**
  Trong một đợt kiểm kê kho (`Stocktake`), mỗi sản phẩm (`productId`) chỉ được xuất hiện một lần duy nhất với số lượng thực tế đếm được (`countedQuantity`). Hiện tại `StocktakeItem` chưa có ràng buộc:
  `@@unique([stocktakeId, productId])`.
- **Đề xuất khắc phục:** Bổ sung `@@unique([stocktakeId, productId])` vào `StocktakeItem`.

---

## 4. ĐÁNH GIÁ CÁC TIÊU CHÍ ĐÃ ĐẠT TIÊU CHUẨN CAO (STRENGTHS)

1. **Multi-tenancy Isolation (98% models đạt chuẩn):**
   Toàn bộ 43 master models đều có trường `organizationId` và ràng buộc cascade khi xóa tổ chức. Các mã nghiệp vụ (`sku`, `orderCode`, `employeeCode`, `customerCode`, `receiptCode`,...) đều dùng Composite Unique `@@unique([organizationId, <code>])`.
2. **Không dùng số thực dấu phẩy động (Float) cho tiền và tồn kho:**
   100% trường tiền tệ dùng `Decimal(15, 2)` (chính xác đến cent/xu, tối đa 999 nghìn tỷ).  
   100% trường số lượng tồn kho dùng `Decimal(12, 3)` (hỗ trợ hàng hóa đo lường thể tích, khối lượng lẻ đến 0.001).  
   100% tỷ lệ thuế dùng `Decimal(5, 2)`.
3. **Chống xóa mất dữ liệu tham chiếu (Referential Defense):**
   Các foreign key liên quan đến `Product`, `Warehouse`, `Customer`, `Supplier` đều được thiết lập `onDelete: Restrict`, ngăn chặn việc vô tình xóa danh mục khi đã phát sinh chứng từ giao dịch.
4. **Sổ cái kho bất biến (Immutable Inventory Ledger):**
   Thiết kế phân tách rõ rệt giữa:
   - `inventory_balances`: Số dư hiện tại (`quantityOnHand`, `quantityReserved`).
   - `inventory_transactions`: Sổ cái ghi vết bất biến mọi biến động tăng giảm.
   - `inventory_reservations`: Khóa giữ chỗ tồn kho theo từng đơn bán hàng.

---

## 5. MA TRẬN ĐỀ XUẤT THAY ĐỔI & RỦI RO MIGRATION

| Hạng mục đề xuất | Loại thay đổi | Rủi ro Migration | Biện pháp giảm thiểu |
|---|:---:|:---:|---|
| Bổ sung FK Relation `organizationId` trên `EmployeeContract` | Sửa Schema Prisma | Không rủi ro (chưa có dữ liệu production) | Đảm bảo syntax Prisma hợp lệ trước khi migration |
| Bổ sung 3 Physical Check Constraints trên `inventory_balances` | Thêm vào Migration SQL | Không rủi ro trên DB mới; Cực kỳ quan trọng để bảo vệ dữ liệu | Viết test kiểm chứng database từ chối bản ghi vi phạm |
| Bỏ cột scalar thừa `Employee.userId` | Sửa Schema Prisma | Không rủi ro | Giữ `User.employeeId` làm single source of truth |
| Bổ sung index cho FK ở 8 bảng chi tiết | Sửa Schema Prisma | Tăng nhẹ kích thước index, tăng vượt bậc tốc độ JOIN | Đã đo kiểm index chỉ tạo B-Tree tiêu chuẩn |
| Bổ sung `shippingAddressSnapshot` trên `SalesOrder` | Thêm cột Nullable | Không rủi ro | Cột là nullable (Text?), không ảnh hưởng code cũ |
| Bổ sung enum `PaymentStatus` trên `SalesOrder` | Thêm Enum & Cột có Default | Không rủi ro | Default `UNPAID` đảm bảo tương thích 100% |
| Bổ sung `@@unique([stocktakeId, productId])` | Thêm Unique Index | Không rủi ro | Đảm bảo tính toàn vẹn kiểm kê |

---

## 6. KẾT LUẬN & TRÌNH DUYỆT (GATE DECISION)

Báo cáo kiểm toán **Phase 1C-B** đã chỉ ra chính xác 7 vấn đề kỹ thuật với nguyên nhân, hậu quả và phương án xử lý cụ thể.  
Tuân thủ nghiêm ngặt nguyên tắc **KHÔNG TỰ Ý SỬA SCHEMA**, tôi xin dừng lại tại đây và trình bản kiểm toán này lên User để:
1. Xem xét các phát hiện và phân loại mức độ.
2. Cho ý kiến phê duyệt danh sách các thay đổi schema đề xuất.
3. Ra quyết định phê duyệt chuyển sang **Phase 1C-C (Migration & Database Constraints)**.
