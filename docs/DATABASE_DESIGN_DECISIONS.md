# QUYẾT ĐỊNH THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN DECISIONS)
**Dự án:** BizPro+ Integrated Modular Business Management System  
**Phiên bản:** 1.1 — Final Pre-Migration Baseline  
**Trạng thái:** Hoàn thiện thiết kế chi tiết — Chờ phê duyệt Gate Phase 1C-B trước khi vào Phase 1C-C  

---

## 1. MỤC ĐÍCH TÀI LIỆU
Tài liệu này chuẩn hóa và chốt dứt điểm các quyết định thiết kế cơ sở dữ liệu vật lý cho BizPro+ trước khi can thiệp vào `prisma/schema.prisma` và khởi tạo migration PostgreSQL đầu tiên.

Mọi quyết định tuân thủ nghiêm ngặt 3 nguyên tắc kỹ thuật cốt lõi:
1. **Toàn vẹn quan hệ (Referential & Relational Integrity) là tối thượng:** Không dựa vào niềm tin rằng tầng ứng dụng luôn chạy đúng; cơ sở dữ liệu PostgreSQL phải là tầng chốt chặn phòng thủ cuối cùng.
2. **Không đa nghĩa dữ liệu (Single Source of Truth):** Không lưu hai khóa ngoại hoặc hai trường biểu diễn cùng một sự kiện nếu không có mục đích nghiệp vụ riêng biệt.
3. **Phù hợp với phạm vi MVP và sẵn sàng mở rộng (No Over-engineering):** Thiết kế tinh gọn, có khả năng mở rộng không gây phá vỡ cấu trúc (zero-breaking upgrade) khi dự án tiến sang các giai đoạn tiếp theo.

---

## 2. CHI TIẾT CÁC QUYẾT ĐỊNH THIẾT KẾ ĐÃ HOÀN THIỆN

### QUYẾT ĐỊNH 01: KHÓA NGOẠI `EmployeeContract.organizationId` VÀ CHÍNH SÁCH XÓA
- **Hiện trạng:** Model `EmployeeContract` có cột `organizationId String @db.Uuid` nhưng thiếu decorator `@relation(fields: [organizationId], references: [id])`.
- **Rủi ro:** Dữ liệu hợp đồng lao động có nguy cơ mất tính toàn vẹn tham chiếu nếu tổ chức bị xóa vật lý hoặc bị sai lệch tenant context.
- **Quyết định chốt:**
  1. Bổ sung quan hệ tường minh với hành vi **`onDelete: Restrict`** (Tuyệt đối không dùng Cascade):
     ```prisma
     organization Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)
     ```
  2. **Lý do từ chối Cascade:** Hợp đồng lao động là chứng từ pháp lý nhân sự có giá trị ràng buộc và nghĩa vụ lịch sử (theo luật lao động cần lưu trữ tối thiểu 5 - 10 năm). Khi tổ chức ngừng hoạt động, hệ thống sử dụng cơ chế **Soft Delete** (`status = ARCHIVED` trên bảng `organizations`). PostgreSQL sẽ chặn đứng (RESTRICT) bất kỳ câu lệnh `DELETE FROM organizations` vật lý nào nếu còn tồn tại dữ liệu hợp đồng phụ thuộc.
  3. Duy trì composite constraint `@@unique([organizationId, contractNumber])` để bảo đảm số hợp đồng không bị trùng lặp trong nội bộ tổ chức.

---

### QUYẾT ĐỊNH 02: BẢO VỆ BẤT BIẾN TỒN KHO BẰNG CHECK CONSTRAINTS TẠI POSTGRESQL
- **Hiện trạng:** Prisma ORM không hỗ trợ native directive cho SQL `CHECK`. Nếu chỉ kiểm tra ở Application Service, trong các kịch bản đua tranh truy cập (high-concurrency race condition) khi nhiều giao dịch bán hàng diễn ra cùng lúc, tồn kho có thể bị ghi nhận âm hoặc số lượng giữ vượt quá tồn kho.
- **Hệ thống bất biến vật lý bắt buộc bảo vệ:**
  $$\text{OnHand} \ge 0$$
  $$\text{Reserved} \ge 0$$
  $$\text{Reserved} \le \text{OnHand}$$
  $$\text{Available} = \text{OnHand} - \text{Reserved} \ge 0$$
- **Cấu trúc trường thực tế trên bảng `inventory_balances`:**
  * `quantity_on_hand Decimal(12, 3) NOT NULL DEFAULT 0.000`
  * `quantity_reserved Decimal(12, 3) NOT NULL DEFAULT 0.000`
  * Không có trường NULL, dữ liệu khởi tạo ban đầu sạch.
- **Quy tắc bảo toàn bất biến trong toàn bộ vòng đời kho:**
  | Nghiệp vụ kho | `quantity_on_hand` ($H$) | `quantity_reserved` ($R$) | Đánh giá điều kiện $R \le H$ và $H, R \ge 0$ |
  |---|:---:|:---:|---|
  | **Nhập kho (`StockReceipt`)** | $+ \Delta Q$ ($\Delta Q > 0$) | Không đổi ($0$) | $H$ tăng, $R$ giữ nguyên $\rightarrow$ Luôn thỏa mãn. |
  | **Xác nhận đơn (`CONFIRMED`)** | Không đổi ($0$) | $+ \Delta Q$ ($\Delta Q > 0$) | $R$ tăng. Nếu $R + \Delta Q > H$, PostgreSQL ném lỗi vi phạm CHECK ngay lập tức $\rightarrow$ Rollback transaction. |
  | **Xuất kho hoàn tất (`FULFILLED`)**| $- \Delta Q$ | $- \Delta Q$ | Cả $H$ và $R$ cùng giảm một lượng bằng nhau $\rightarrow$ Hiệu số $(H - R)$ không đổi, bất biến bảo toàn. |
  | **Hủy đơn hàng (`CANCELLED`)** | Không đổi ($0$) | $- \Delta Q$ | $R$ giảm về mức cũ $\rightarrow$ Luôn thỏa mãn. |
  | **Xuất kho khác / Hao hụt** | $- \Delta Q$ | Không đổi ($0$) | $H$ giảm. Nếu lượng hàng khả dụng không đủ ($H - \Delta Q < R$), PostgreSQL chặn đứng lệnh xuất kho. |
  | **Điều chỉnh kiểm kê giảm** | $- \Delta Q$ | Không đổi ($0$) | Tương tự xuất kho: Không thể giảm tồn thực tế xuống dưới số lượng đã cam kết giữ hàng cho khách. |
- **SQL Migration thực thi trong Phase 1C-C:**
  ```sql
  ALTER TABLE "inventory_balances"
    ADD CONSTRAINT "chk_inventory_balances_on_hand_non_negative" CHECK ("quantity_on_hand" >= 0),
    ADD CONSTRAINT "chk_inventory_balances_reserved_non_negative" CHECK ("quantity_reserved" >= 0),
    ADD CONSTRAINT "chk_inventory_balances_reserved_lte_on_hand" CHECK ("quantity_reserved" <= "quantity_on_hand");

  ALTER TABLE "inventory_reservations"
    ADD CONSTRAINT "chk_inventory_reservations_quantity_positive" CHECK ("quantity" > 0);
  ```

---

### QUYẾT ĐỊNH 03: GIẢI QUYẾT DỨT ĐIỂM QUAN HỆ USER – EMPLOYEE VỚI 1 KHÓA NGOẠI DUY NHẤT
- **Vấn đề đã rà soát:** Trong schema hiện tại, `User` có `employee_id` (với quan hệ `@relation` và `@unique`) trỏ sang `Employee`. Đồng thời `Employee` lại có cột `user_id` (scalar UUID, `@unique`) nhưng không gắn quan hệ. Việc duy trì 2 cột FK trỏ chéo nhau dẫn đến nguy cơ sai lệch trạng thái (User A trỏ sang Emp 1 trong khi Emp 1 trỏ sang User B).
- **Phân tích bản chất nghiệp vụ 1-1:**
  1. **Tính tùy chọn 2 chiều (Optional 1-1: 0..1 to 0..1):**
     * Một `Employee` (Hồ sơ nhân sự) có thể **chưa hoặc không có** tài khoản đăng nhập (ví dụ: công nhân kho, tạp vụ, nhân viên thời vụ). Do đó quan hệ là tùy chọn từ phía Employee.
     * Một `User` (Tài khoản người dùng) có thể là tài khoản quản trị hệ sinh thái (System Superadmin, External Technical Auditor) không thuộc biên chế nhân sự của doanh nghiệp. Do đó quan hệ là tùy chọn từ phía User.
  2. **Bên sở hữu khóa ngoại (FK Ownership):**
     * `User` là thực thể sở hữu khóa ngoại vật lý: `users.employee_id REFERENCES employees(id)`.
     * `Employee` là thực thể nhân sự gốc (chứa lý lịch, phòng ban, chức vụ, hợp đồng). `User` là thông tin xác thực (Email, Password Hash, Quyền hạn) được sinh ra để định danh cho nhân viên đó trên hệ thống số.
     * Ràng buộc: `users.employee_id` được gắn thuộc tính **`@unique`** và **`onDelete: SetNull`**. Khi tài khoản đăng nhập bị xóa, hồ sơ nhân viên trong bảng `employees` vẫn được bảo toàn nguyên vẹn cho mục đích chấm công và khai báo thuế.
- **Quyết định thiết kế cuối cùng:**
  1. **Loại bỏ hoàn toàn cột vật lý `user_id` trên bảng `employees`.** Bảng `employees` không lưu bất kỳ khóa ngoại nào về bảng `users`.
  2. Trong Prisma Schema:
     * Model `User`:
       ```prisma
       employeeId String?   @unique @map("employee_id") @db.Uuid
       employee   Employee? @relation("UserEmployee", fields: [employeeId], references: [id], onDelete: SetNull)
       ```
     * Model `Employee`:
       ```prisma
       user User? @relation("UserEmployee")
       // Tuyệt đối không có trường scalar userId!
       ```
  3. **Chiến lược Migration:**
     * Trước khi xóa cột `employees.user_id`, chạy script chuyển tiếp:
       ```sql
       UPDATE users u
       SET employee_id = e.id
       FROM employees e
       WHERE e.user_id = u.id AND u.employee_id IS NULL;
       
       ALTER TABLE "employees" DROP COLUMN IF EXISTS "user_id";
       ```
  4. **Tác động đến Backend:**
     * `AuthService` / `UsersService`: Khi liên kết người dùng với nhân viên, cập nhật trường `users.employeeId`.
     * `EmployeesService`: Khi cần thông tin tài khoản của nhân viên, sử dụng truy vấn `prisma.employee.findUnique({ include: { user: true } })`. Cơ chế eager load của Prisma hoàn toàn tự động dựa trên quan hệ 1-1 ảo.

---

### QUYẾT ĐỊNH 04: CẤU TRÚC SNAPSHOT ĐỊA CHỈ GIAO HÀNG (SHIPPING ADDRESS SNAPSHOT)
- **Vấn đề nghiệp vụ:** Khách hàng (`Customer`) có thể cập nhật thông tin địa chỉ văn phòng hoặc chuyển trụ sở. Nếu đơn hàng cũ chỉ join động sang `Customer.address`, các đơn hàng đã hoàn tất trong quá khứ sẽ bị sai lệch thông tin lịch sử giao nhận, gây rủi ro tranh chấp pháp lý và kiểm toán kế toán.
- **Quy tắc thiết kế chốt:**
  1. **Độc lập và Bất biến (Immutable Snapshot):**
     * Dữ liệu địa chỉ giao nhận tại thời điểm đặt hàng được chụp lại thành một JSON document lưu vào trường `shippingAddressSnapshot` kiểu `Json` (PostgreSQL `JSONB`) trên bảng `sales_orders`.
     * Một khi đơn hàng được tạo (`INSERT`), document này trở thành **bất biến**; không bao giờ bị ghi đè khi thông tin khách hàng trong danh mục đối tác thay đổi.
  2. **Các trường tra cứu phục vụ báo cáo và lọc dữ liệu (Queryable Lookup Fields):**
     * Để báo cáo doanh thu theo Tỉnh/Thành phố hoặc tích hợp phân vùng giao vận không phải parse JSON trong mệnh đề `WHERE` và `GROUP BY`, bổ sung 3 cột tra cứu chuẩn hóa:
       - `shippingRecipientName String? @map("shipping_recipient_name") @db.VarChar(255)`
       - `shippingPhone String? @map("shipping_phone") @db.VarChar(50)`
       - `shippingProvinceCode String? @map("shipping_province_code") @db.VarChar(20)`
       - `shippingDistrictCode String? @map("shipping_district_code") @db.VarChar(20)`
       - `shippingWardCode String? @map("shipping_ward_code") @db.VarChar(20)`
       - `shippingFullAddress String? @map("shipping_full_address") @db.Text`
  3. **Nguyên tắc đồng bộ:**
     * Các cột tra cứu (`shippingProvinceCode`, v.v.) **bắt buộc được trích xuất trực tiếp từ chính `shippingAddressSnapshot`** tại thời điểm tạo đơn hàng (trong câu lệnh `INSERT`).
     * Không có luồng dữ liệu thứ hai cập nhật các trường này từ bảng `customers`, triệt tiêu hoàn toàn nguy cơ lệch pha dữ liệu.
  4. **Cấu trúc JSON Schema chuẩn hóa cho `shippingAddressSnapshot`:**
     ```json
     {
       "recipientName": "Nguyễn Văn Hùng",
       "phone": "0912345678",
       "alternatePhone": "0987654321",
       "addressLine": "Số 18, Ngõ 45, Đường Trần Thái Tông",
       "wardCode": "0012",
       "wardName": "Phường Dịch Vọng Hậu",
       "districtCode": "005",
       "districtName": "Quận Cầu Giấy",
       "provinceCode": "01",
       "provinceName": "Thành phố Hà Nội",
       "deliveryNotes": "Giao hàng trong giờ hành chính, gọi điện trước khi đến"
     }
     ```

---

### QUYẾT ĐỊNH 05: KIẾN TRÚC THANH TOÁN (PAYMENT ARCHITECTURE) VÀ CÔNG NỢ
- **Phân định rõ ràng các khái niệm nghiệp vụ:**
  1. **Trạng thái Đơn hàng (`SalesOrderStatus`):** Phản ánh tiến độ giao vận và giữ chỗ hàng hóa (`DRAFT`, `CONFIRMED`, `PARTIALLY_FULFILLED`, `FULFILLED`, `CANCELLED`, `ON_HOLD`).
  2. **Trạng thái Thanh toán (`PaymentStatus`):** Phản ánh nghĩa vụ tài chính của khách hàng đối với đơn hàng (`UNPAID`, `PARTIALLY_PAID`, `PAID`, `REFUNDED`).
  3. **Giao dịch Thanh toán (`PaymentTransaction`):** Ghi nhận từng lần phát sinh dòng tiền thực tế (thanh toán cọc, trả theo đợt, thanh toán nốt hoặc hoàn tiền).
- **Phạm vi MVP vs Phạm vi Mở rộng tương lai:**
  * **Triển khai trong MVP (Phase 1C):**
    - Thêm model `PaymentTransaction` lưu lịch sử giao dịch tiền mặt, chuyển khoản ngân hàng (Napas/VietQR), quẹt thẻ.
    - Hỗ trợ thanh toán một phần (đặt cọc, trả góp theo đợt).
    - Hỗ trợ hoàn tiền (Refund) khi hủy đơn hoặc giảm giá trị đơn hàng.
    - Cập nhật số tiền thực thu (`paidAmount`) và số tiền còn nợ (`remainingBalance`) trực tiếp trên `SalesOrder` trong cùng 1 database transaction.
  * **Để dành cho giai đoạn mở rộng sau MVP:**
    - Kết nối Webhook tự động đối soát với cổng thanh toán ngân hàng / Open Banking API.
    - Bù trừ công nợ đa đơn hàng phức tạp (Credit Memo / Debit Memo kế toán doanh nghiệp lớn).
- **Mô hình `PaymentTransaction` trong Prisma Schema:**
  ```prisma
  enum PaymentMethod {
    CASH
    BANK_TRANSFER
    CREDIT_CARD
    E_WALLET
    OTHER
  }

  enum PaymentTransactionType {
    PAYMENT    // Thanh toán / Đặt cọc
    REFUND     // Hoàn trả tiền cho khách
  }

  enum TransactionStatus {
    PENDING
    SUCCESS
    FAILED
    CANCELLED
  }

  model PaymentTransaction {
    id              String                 @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    organizationId  String                 @map("organization_id") @db.Uuid
    salesOrderId    String                 @map("sales_order_id") @db.Uuid
    customerId      String                 @map("customer_id") @db.Uuid
    transactionCode String                 @map("transaction_code") @db.VarChar(50)
    idempotencyKey  String?                @map("idempotency_key") @db.VarChar(100)
    type            PaymentTransactionType @default(PAYMENT)
    method          PaymentMethod          @default(BANK_TRANSFER)
    status          TransactionStatus      @default(SUCCESS)
    amount          Decimal                @db.Decimal(15, 2)
    referenceCode   String?                @map("reference_code") @db.VarChar(100) // Mã tham chiếu ngân hàng/FT code
    transactedAt    DateTime               @default(now()) @map("transacted_at") @db.Timestamptz
    note            String?                @db.Text
    createdBy       String                 @map("created_by") @db.Uuid
    createdAt       DateTime               @default(now()) @map("created_at") @db.Timestamptz

    organization Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)
    salesOrder   SalesOrder   @relation(fields: [salesOrderId], references: [id], onDelete: Restrict)
    customer     Customer     @relation(fields: [customerId], references: [id], onDelete: Restrict)
    creator      User         @relation("UserCreatedPayments", fields: [createdBy], references: [id], onDelete: Restrict)

    @@unique([organizationId, transactionCode])
    @@unique([organizationId, idempotencyKey])
    @@index([organizationId, salesOrderId])
    @@index([organizationId, customerId])
    @@map("payment_transactions")
  }
  ```
- **Quy tắc toán học tính Số tiền Thực thu và Công nợ:**
  1. **Số tiền thực thu của đơn hàng (`paidAmount`):**
     $$\text{paidAmount} = \sum_{\substack{\text{type} = \text{PAYMENT} \\ \text{status} = \text{SUCCESS}}} \text{amount} - \sum_{\substack{\text{type} = \text{REFUND} \\ \text{status} = \text{SUCCESS}}} \text{amount}$$
     *Các giao dịch có `status = FAILED`, `CANCELLED` hoặc `PENDING` bị loại bỏ 100% khỏi công thức tính toán.*
  2. **Số tiền còn phải thanh toán của đơn hàng (`remainingBalance`):**
     $$\text{remainingBalance} = \max(0, \text{totalAmount} - \text{paidAmount})$$
  3. **Tổng công nợ phải thu của khách hàng (Customer Receivables):**
     $$\text{Total Customer Debt} = \sum_{\substack{\text{sales\_orders} \\ \text{status} \ne \text{CANCELLED}}} \text{remainingBalance}$$
  4. **Quy tắc chuyển dịch trạng thái thanh toán (`PaymentStatus`):**
     * Nếu $\text{paidAmount} = 0$: `UNPAID`.
     * Nếu $0 < \text{paidAmount} < \text{totalAmount}$: `PARTIALLY_PAID` (Áp dụng khi khách đặt cọc hoặc thanh toán theo tiến độ).
     * Nếu $\text{paidAmount} \ge \text{totalAmount}$: `PAID`.
     * Nếu đơn hàng từng có thanh toán nhưng sau đó được hoàn trả toàn bộ ($\text{paidAmount} = 0$ sau khi có giao dịch `REFUND`): `REFUNDED`.
  5. **Chống ghi nhận giao dịch trùng lặp (Deduplication):**
     * Tầng API áp dụng Header `Idempotency-Key` lưu vào cột `idempotency_key` có ràng buộc `@@unique([organizationId, idempotencyKey])`. Nếu client nhấn đúp hoặc mạng retry, request thứ hai bị PostgreSQL từ chối vi phạm unique constraint ngay lập tức.
     * Cột `referenceCode` (mã giao dịch ngân hàng/Napas) ngăn chặn việc kế toán nhập trùng một ủy nhiệm chi hai lần cho cùng một tổ chức.

---

### QUYẾT ĐỊNH 06: QUY TẮC RÀNG BUỘC PHIẾU KIỂM KÊ KHO (`Stocktake` & `StocktakeItem`)
- **Phân tích nghiệp vụ kho hiện tại:**
  * Mỗi phiếu kiểm kê `Stocktake` được gắn cố định với một kho vật lý xác định (`warehouseId`).
  * Ở phạm vi kho trung cấp (Intermediate Inventory) của MVP, hệ thống quản lý tồn kho theo cặp `(warehouseId, productId)` và **chưa quản lý theo vị trí chi tiết (Location/Bin) hoặc số Lô/Hạn dùng (Lot/Serial)**.
  * Vì vậy, trong phạm vi một phiếu kiểm kê của một kho, một sản phẩm chỉ có thể và chỉ được phép xuất hiện **tối đa một dòng kiểm kê duy nhất**.
- **Quyết định thiết kế ràng buộc:**
  1. Áp dụng ràng buộc toàn vẹn dữ liệu ở mức Database:
     ```prisma
     model StocktakeItem {
       id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
       stocktakeId        String   @map("stocktake_id") @db.Uuid
       productId          String   @map("product_id") @db.Uuid
       systemQuantity     Decimal  @map("system_quantity") @db.Decimal(12, 3)
       actualQuantity     Decimal  @map("actual_quantity") @db.Decimal(12, 3)
       differenceQuantity Decimal  @map("difference_quantity") @db.Decimal(12, 3)
       note               String?  @db.Text

       stocktake Stocktake @relation(fields: [stocktakeId], references: [id], onDelete: Cascade)
       product   Product   @relation(fields: [productId], references: [id], onDelete: Restrict)

       @@unique([stocktakeId, productId], name: "uq_stocktake_items_product")
       @@index([stocktakeId])
       @@index([productId])
       @@map("stocktake_items")
     }
     ```
  2. **Kế hoạch mở rộng không phá vỡ (Zero-breaking Evolution) trong tương lai:**
     * Khi hệ thống nâng cấp lên quản lý đa vị trí trong kho hoặc quản lý theo Lô ở Phase 3:
       - Bổ sung 2 cột nullable: `locationId String? @db.Uuid` và `lotNumber String? @db.VarChar(50)`.
       - Migration script trong tương lai chỉ cần DROP constraint `uq_stocktake_items_product` và thay thế bằng `@@unique([stocktakeId, productId, locationId, lotNumber])`.
     * **Cam kết tuyệt đối cho MVP:** Hiện tại KHÔNG thêm các trường ảo Location/Lot vào schema để tránh làm rác cơ sở dữ liệu khi nghiệp vụ chưa vận hành đến.

---

## 3. BẢNG TỔNG HỢP TOÀN BỘ THAY ĐỔI SCHEMA TRÌNH PHÊ DUYỆT TRƯỚC PHASE 1C-C

Dưới đây là bảng đối chiếu chi tiết toàn bộ các thay đổi sẽ được đưa vào `prisma/schema.prisma` trong Phase 1C-C:

| Model | Trường / Quan hệ / Constraint | Thiết kế Hiện tại | Thiết kế Đề xuất Mới | Căn cứ Kỹ thuật & Nghiệp vụ | Đánh giá Rủi ro Migration |
|---|---|---|---|---|---|
| **`EmployeeContract`** | Quan hệ Tổ chức (`organizationId`) | Có cột `organizationId UUID`, thiếu decorator `@relation`. | `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)` | Đảm bảo toàn vẹn tham chiếu tenant; ngăn chặn xóa nhầm dữ liệu pháp lý lịch sử. | Thấp: Đã có cột dữ liệu, chỉ thêm ràng buộc FK. |
| **`User`** | Quan hệ với Nhân viên | `employeeId UUID @unique`, `@relation(onDelete: SetNull)` | Giữ nguyên: Là bên sở hữu khóa ngoại vật lý duy nhất đại diện cho quan hệ 1-1 tùy chọn. | Đã chuẩn hóa đúng chuẩn quan hệ 1-1. | Thấp: Đã có sẵn cột và index. |
| **`Employee`** | Cột liên kết tài khoản (`userId`) | Có cột `userId UUID @unique` (scalar, không có `@relation`). | **Xóa bỏ cột vật lý `userId`.** Chỉ giữ trường quan hệ ảo `user User? @relation("UserEmployee")`. | Loại bỏ khóa ngoại kép gây xung đột dữ liệu; User là bên sở hữu FK duy nhất. | Rất thấp: Cột hiện chưa có dữ liệu production; script migration đã sẵn sàng. |
| **`inventory_balances`** | Kiểm tra số lượng tồn và giữ hàng | Không có ràng buộc ở CSDL (phụ thuộc application). | Bổ sung 3 Physical PostgreSQL **`CHECK Constraints`**: $H \ge 0$, $R \ge 0$, $R \le H$. | Ngăn chặn vĩnh viễn tình trạng âm kho do race condition đa luồng khi bán hàng đồng thời. | Không có rủi ro: Dữ liệu hiện tại sạch, CHECK được thêm qua migration SQL. |
| **`inventory_reservations`** | Số lượng giữ chỗ | Không có ràng buộc CHECK. | Bổ sung Physical CHECK Constraint: `quantity > 0`. | Ngăn chặn việc ghi nhận giữ hàng với số lượng $\le 0$. | Thấp: Bổ sung qua migration SQL. |
| **`SalesOrder`** | Quản lý Dòng tiền & Địa chỉ | Thiếu trạng thái thanh toán, thiếu số tiền đã thanh toán, thiếu snapshot địa chỉ. | Bổ sung: `paymentStatus PaymentStatus @default(UNPAID)`, `paidAmount Decimal(15,2)`, `remainingBalance Decimal(15,2)`, `shippingAddressSnapshot Json`, 4 cột tra cứu địa chỉ. | Tách bạch giữa trạng thái kho và trạng thái dòng tiền; bảo vệ bất biến địa chỉ giao hàng lịch sử. | Thấp: Các trường mới đều có giá trị DEFAULT hoặc NULLABLE. |
| **`PaymentTransaction`** | Thực thể thanh toán | Chưa có trong schema. | **Bổ sung mới model `PaymentTransaction`** (Idempotency key, Cash/BankTransfer/CreditCard, Payment/Refund). | Quản lý lịch sử dòng tiền thực tế, cọc, thanh toán nhiều đợt và chống ghi trùng giao dịch. | Thấp: Bổ sung bảng mới, không ảnh hưởng dữ liệu cũ. |
| **`StocktakeItem`** | Tính độc nhất của dòng kiểm kê | Chưa có unique constraint giữa phiếu và sản phẩm. | Bổ sung `@@unique([stocktakeId, productId], name: "uq_stocktake_items_product")`. | Mỗi sản phẩm chỉ xuất hiện 1 lần trong 1 phiếu kiểm kê kho trung cấp. | Thấp: Không có dữ liệu trùng lặp hiện tại. |
| **8 Bảng chi tiết** | Chỉ mục khóa ngoại tham chiếu | Thiếu index trên các cột FK ở các bảng Detail. | Bổ sung chính xác 10 Index có chọn lọc (cho `sales_order_items`, `stock_receipt_items`, `status_histories`...). | Tối ưu hiệu năng truy vấn JOIN Master-Detail và vẽ timeline lịch sử theo thời gian. | Thấp: Tăng tốc độ đọc dữ liệu, tăng dung lượng lưu trữ index không đáng kể. |

---

## 4. KẾT LUẬN & ĐIỂM KIỂM SOÁT GATE

Toàn bộ 6 yêu cầu kỹ thuật của bạn đối với Database Architecture đã được giải quyết triệt để và văn bản hóa đầy đủ.

Tại thời điểm này, **chưa có bất kỳ thay đổi nào được áp dụng vào `prisma/schema.prisma` hay cơ sở dữ liệu PostgreSQL**. Hệ thống đã sẵn sàng và dừng lại chờ quyết định phê duyệt chính thức để bước vào **Phase 1C-C (Database Migration Execution)**.
