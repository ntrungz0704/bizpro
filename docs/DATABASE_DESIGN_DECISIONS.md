# QUYẾT ĐỊNH THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN DECISIONS)
**Dự án:** BizPro+ Integrated Modular Business Management System  
**Phiên bản:** 1.2 — Technical Review & Pre-Migration Gate  
**Trạng thái:** Hoàn thiện toàn diện theo yêu cầu thẩm định của Tech Lead / Architect — Dừng tại Gate Phase 1C-B  

---

## 1. MỤC ĐÍCH TÀI LIỆU
Tài liệu này chuẩn hóa và chốt dứt điểm các quyết định thiết kế cơ sở dữ liệu vật lý cho BizPro+ trước khi can thiệp vào `prisma/schema.prisma` và khởi tạo migration PostgreSQL đầu tiên.

Mọi quyết định tuân thủ nghiêm ngặt 4 nguyên tắc kỹ thuật cốt lõi:
1. **Toàn vẹn quan hệ (Referential & Relational Integrity) là tối thượng:** Không dựa vào niềm tin rằng tầng ứng dụng luôn chạy đúng; cơ sở dữ liệu PostgreSQL phải là tầng chốt chặn phòng thủ cuối cùng.
2. **Không đa nghĩa dữ liệu (Single Source of Truth):** Một sự kiện chỉ có một nguồn dữ liệu gốc duy nhất. Dữ liệu tổng hợp (materialized aggregate) phải được đồng bộ nguyên khối (atomic) trong cùng một database transaction.
3. **Phòng thủ đa tầng (Defense in Depth):** Ràng buộc dữ liệu được bảo vệ đồng thời ở 3 tầng: Tầng Database (NOT NULL, CHECK, UNIQUE, Composite FK, Trigger), Tầng Application (Zod Pipes, Guards, Transactions `SELECT ... FOR UPDATE`), và Tầng UI (Validation, Feedback).
4. **Phù hợp với phạm vi MVP và sẵn sàng mở rộng (No Over-engineering):** Thiết kế tinh gọn, có khả năng mở rộng không gây phá vỡ cấu trúc (zero-breaking upgrade) khi dự án tiến sang các giai đoạn tiếp theo.

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
- **Lưu ý kỹ thuật về NULLability:** Trong PostgreSQL, điều kiện `CHECK (column >= 0)` sẽ trả về `TRUE` nếu `column` là `NULL`. Do đó, mọi cột áp dụng CHECK constraint bắt buộc phải có thuộc tính **`NOT NULL`**.
- **Kiểm tra schema thực tế:**
  * Bảng `inventory_balances`:
    - `quantity_on_hand Decimal(12, 3) NOT NULL DEFAULT 0.000` (Prisma: `Decimal @default(0.000)`)
    - `quantity_reserved Decimal(12, 3) NOT NULL DEFAULT 0.000` (Prisma: `Decimal @default(0.000)`)
  * Bảng `inventory_reservations`:
    - `quantity Decimal(12, 3) NOT NULL` (Prisma: `Decimal`)
  * Bảng `sales_order_items`:
    - `quantity Decimal(12, 3) NOT NULL` (Prisma: `Decimal`)
    - `fulfilled_quantity Decimal(12, 3) NOT NULL DEFAULT 0.000` (Prisma: `Decimal @default(0.000)`)
  * Bảng `payment_transactions`:
    - `amount Decimal(15, 2) NOT NULL` (Prisma: `Decimal`)
  * Bảng `sales_orders`:
    - `paid_amount Decimal(15, 2) NOT NULL DEFAULT 0.00`
    - `remaining_balance Decimal(15, 2) NOT NULL DEFAULT 0.00`
    - `overpaid_amount Decimal(15, 2) NOT NULL DEFAULT 0.00`
- **Hệ thống bất biến vật lý bắt buộc bảo vệ:**
  $$\text{OnHand} \ge 0$$
  $$\text{Reserved} \ge 0$$
  $$\text{Reserved} \le \text{OnHand}$$
  $$\text{Available} = \text{OnHand} - \text{Reserved} \ge 0$$
  $$\text{FulfilledQuantity} \ge 0$$
  $$\text{FulfilledQuantity} \le \text{Quantity}$$
  $$\text{OrderQuantity} > 0$$
  $$\text{TransactionAmount} > 0$$
  $$\text{PaidAmount} \ge 0, \quad \text{RemainingBalance} \ge 0, \quad \text{OverpaidAmount} \ge 0$$
- **Quy tắc bảo toàn bất biến qua các nghiệp vụ kho:**
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
  -- 1. Bảo vệ tồn kho bất biến
  ALTER TABLE "inventory_balances"
    ADD CONSTRAINT "chk_inventory_balances_on_hand_non_negative" CHECK ("quantity_on_hand" >= 0),
    ADD CONSTRAINT "chk_inventory_balances_reserved_non_negative" CHECK ("quantity_reserved" >= 0),
    ADD CONSTRAINT "chk_inventory_balances_reserved_lte_on_hand" CHECK ("quantity_reserved" <= "quantity_on_hand");

  -- 2. Bảo vệ giữ chỗ kho
  ALTER TABLE "inventory_reservations"
    ADD CONSTRAINT "chk_inventory_reservations_quantity_positive" CHECK ("quantity" > 0);

  -- 3. Bảo vệ chi tiết đơn hàng
  ALTER TABLE "sales_order_items"
    ADD CONSTRAINT "chk_sales_order_items_quantity_positive" CHECK ("quantity" > 0),
    ADD CONSTRAINT "chk_sales_order_items_fulfilled_non_negative" CHECK ("fulfilled_quantity" >= 0),
    ADD CONSTRAINT "chk_sales_order_items_fulfilled_lte_quantity" CHECK ("fulfilled_quantity" <= "quantity");

  -- 4. Bảo vệ giao dịch thanh toán
  ALTER TABLE "payment_transactions"
    ADD CONSTRAINT "chk_payment_transactions_amount_positive" CHECK ("amount" > 0);

  -- 5. Bảo vệ tổng hợp thanh toán đơn hàng
  ALTER TABLE "sales_orders"
    ADD CONSTRAINT "chk_sales_orders_paid_amount_non_negative" CHECK ("paid_amount" >= 0),
    ADD CONSTRAINT "chk_sales_orders_remaining_balance_non_negative" CHECK ("remaining_balance" >= 0),
    ADD CONSTRAINT "chk_sales_orders_overpaid_amount_non_negative" CHECK ("overpaid_amount" >= 0);
  ```

---

### QUYẾT ĐỊNH 03: QUAN HỆ USER – EMPLOYEE (SINGLE PHYSICAL FK & PRE-MIGRATION VALIDATION)
- **Bản chất nghiệp vụ:** Quan hệ **1-1 tùy chọn hai chiều (0..1 to 0..1)**.
  - Một `Employee` có thể không có tài khoản phần mềm (công nhân, tạp vụ, tài xế không dùng hệ thống).
  - Một `User` có thể không thuộc nhân sự công ty (tài khoản IT Support, chuyên gia kiểm toán bên ngoài).
- **Quyền sở hữu khóa ngoại (FK Ownership):**
  - **`User` là bên sở hữu khóa ngoại vật lý duy nhất:** Cột `users.employee_id UUID UNIQUE REFERENCES employees(id) ON DELETE SET NULL`.
  - **`Employee` KHÔNG lưu cột khóa ngoại vật lý:** Loại bỏ hoàn toàn cột `employees.user_id`. Trong model Prisma, chỉ giữ trường quan hệ ảo `user User? @relation("UserEmployee")`.
- **Hành vi tham chiếu (`ON DELETE SET NULL`):** Khi tài khoản `User` bị xóa vật lý, hồ sơ nhân sự của nhân viên trong bảng `employees` vẫn được bảo toàn nguyên vẹn.
  *Lưu ý nghiệp vụ:* Khóa tài khoản nhân viên không kích hoạt `ON DELETE SET NULL`, mà được thực hiện qua trường trạng thái `User.status = INACTIVE` ở tầng nghiệp vụ.
- **Bộ Kiểm tra Tiền di trú (Pre-Migration Validation Queries) nghiêm ngặt:**
  Trước khi thực hiện migration, kịch bản phải thực thi khối kiểm tra sau; nếu có bất kỳ vi phạm nào, migration sẽ **ABORT ngay lập tức** kèm thông báo lỗi chi tiết thay vì âm thầm bỏ qua:

  ```sql
  DO $$
  DECLARE
    v_conflicts INT := 0;
    v_multi_user INT := 0;
    v_multi_emp INT := 0;
  BEGIN
    -- 1. Kiểm tra quan hệ mâu thuẫn giữa 2 cột (User trỏ Emp A nhưng Emp A trỏ User B)
    SELECT COUNT(*) INTO v_conflicts
    FROM users u
    JOIN employees e ON u.employee_id = e.id
    WHERE e.user_id IS NOT NULL AND e.user_id <> u.id;

    IF v_conflicts > 0 THEN
      RAISE EXCEPTION 'MIGRATION ABORTED: Phát hiện % bản ghi có quan hệ mâu thuẫn chéo giữa users.employee_id và employees.user_id!', v_conflicts;
    END IF;

    -- 2. Kiểm tra 1 Employee bị liên kết bởi nhiều User
    SELECT COUNT(*) INTO v_multi_user
    FROM (
      SELECT employee_id FROM users WHERE employee_id IS NOT NULL GROUP BY employee_id HAVING COUNT(*) > 1
    ) sub;

    IF v_multi_user > 0 THEN
      RAISE EXCEPTION 'MIGRATION ABORTED: Phát hiện % Employee đang bị liên kết bởi nhiều User!', v_multi_user;
    END IF;

    -- 3. Kiểm tra 1 User bị liên kết bởi nhiều Employee
    SELECT COUNT(*) INTO v_multi_emp
    FROM (
      SELECT user_id FROM employees WHERE user_id IS NOT NULL GROUP BY user_id HAVING COUNT(*) > 1
    ) sub;

    IF v_multi_emp > 0 THEN
      RAISE EXCEPTION 'MIGRATION ABORTED: Phát hiện % User đang bị liên kết bởi nhiều Employee!', v_multi_emp;
    END IF;

    -- 4. An toàn: Đồng bộ dữ liệu hợp lệ từ employees.user_id sang users.employee_id (nếu u.employee_id còn NULL)
    UPDATE users u
    SET employee_id = e.id
    FROM employees e
    WHERE e.user_id = u.id AND u.employee_id IS NULL;

    -- 5. Xóa bỏ cột vật lý user_id thừa trên employees
    ALTER TABLE "employees" DROP COLUMN IF EXISTS "user_id";
  END $$;
  ```

---

### QUYẾT ĐỊNH 04: KIẾN TRÚC THANH TOÁN (PAYMENT ARCHITECTURE) TOÀN DIỆN
- **Phân định 2 trạng thái độc lập:**
  1. `SalesOrderStatus` (Tiến độ kho/giao nhận): `DRAFT`, `CONFIRMED`, `PARTIALLY_FULFILLED`, `FULFILLED`, `CANCELLED`, `ON_HOLD`.
  2. `PaymentStatus` (Nghĩa vụ tài chính): `UNPAID`, `PARTIALLY_PAID`, `PAID`, `REFUNDED`.

- **Mô hình `PaymentTransaction`:**
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
    status          TransactionStatus      @default(PENDING) // BẮT BUỘC PENDING, TUYỆT ĐỐI KHÔNG DEFAULT SUCCESS
    amount          Decimal                @db.Decimal(15, 2)
    referenceCode   String?                @map("reference_code") @db.VarChar(100)
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

- **Quy trình trạng thái theo từng phương thức thanh toán:**
  * **Mặc định:** Trường `status` khởi tạo là **`PENDING`** (không dùng `SUCCESS` làm giá trị mặc định để bảo đảm an toàn dòng tiền).
  * `CASH` (Tiền mặt): Khởi tạo `PENDING` $\rightarrow$ Chuyển thành `SUCCESS` khi nhân viên thu ngân/kế toán xác nhận đã cầm tiền mặt thực tế.
  * `BANK_TRANSFER` (Chuyển khoản VietQR/Napas): Khởi tạo `PENDING` $\rightarrow$ Chuyển thành `SUCCESS` khi kế toán đối soát khớp sao kê ngân hàng (hoặc webhook báo có tiền).
  * `CREDIT_CARD` / `E_WALLET`: Khởi tạo `PENDING` $\rightarrow$ Chuyển thành `SUCCESS` khi cổng thanh toán trả mã phản hồi 00 (Authorized & Captured) hoặc chuyển `FAILED` nếu quẹt lỗi/hết hạn.

- **Cơ chế Chống trùng `referenceCode` (Deduplication):**
  * `referenceCode` (mã giao dịch ngân hàng / FT code): Cho phép `NULL` (vì thanh toán tiền mặt không có mã ngân hàng).
  * Để chống nhập trùng một ủy nhiệm chi hai lần trong cùng tổ chức, thiết lập **Partial Unique Index** trong PostgreSQL:
    ```sql
    CREATE UNIQUE INDEX "uq_payment_transactions_org_ref_code" 
    ON "payment_transactions" ("organization_id", "reference_code") 
    WHERE "reference_code" IS NOT NULL;
    ```
    *Cơ chế này cho phép nhiều dòng có `reference_code = NULL`, nhưng khi có giá trị chuỗi thì bắt buộc duy nhất 100% trong tổ chức.*
  * Cột `idempotencyKey` bảo vệ chống double-click hoặc network retry từ phía client.

- **Quy tắc bảo vệ Hoàn tiền (Refund Integrity):**
  * Nguyên tắc cốt lõi:
    $$\text{TotalSuccessfulRefund} \le \text{TotalSuccessfulPayment}$$
  * Xử lý chống đua tranh (Concurrent Refund Attack): Khi tạo giao dịch `REFUND`, backend thực hiện khóa bi quan (Pessimistic Lock) dòng đơn hàng:
    ```sql
    SELECT id, total_amount, paid_amount FROM sales_orders WHERE id = :orderId FOR UPDATE;
    ```
    Kiểm tra trong transaction: Nếu `refundAmount > currentPaidAmount`, ném lỗi `RefundExceedsPaidAmountException` và rollback ngay lập tức.

- **Xử lý Khách thanh toán thừa (Overpayment):**
  * Công thức đầy đủ:
    - $\text{PaidAmount} = \sum (\text{SUCCESS PAYMENT}) - \sum (\text{SUCCESS REFUND})$.
    - $\text{RemainingBalance} = \max(0, \text{TotalAmount} - \text{PaidAmount})$: Số tiền khách còn phải trả.
    - $\text{OverpaidAmount} = \max(0, \text{PaidAmount} - \text{TotalAmount})$: Số tiền khách thanh toán thừa.
    - $\text{RefundableAmount} = \text{PaidAmount}$: Số tiền tối đa có thể hoàn lại cho khách.
    - $\text{Customer Outstanding Balance} = \sum \text{RemainingBalance} - \sum \text{OverpaidAmount}$: Tổng công nợ ròng của khách hàng (khoản thừa được trừ vào công nợ chung).
  * Bảng `sales_orders` lưu trữ cả 3 trường: `paid_amount`, `remaining_balance`, `overpaid_amount`.

- **Nguồn Dữ liệu Chuẩn (Single Source of Truth):**
  * `payment_transactions` là **nguồn dữ liệu gốc duy nhất**.
  * Các trường `paid_amount`, `remaining_balance`, `overpaid_amount`, `payment_status` trên `sales_orders` là dữ liệu tổng hợp được tính toán và cập nhật **ngay trong cùng một Database Transaction** (`prisma.$transaction`) với thao tác ghi nhận giao dịch.
  * Cung cấp hàm tự chữa lành (Self-healing reconciliation script) `reconcileOrderPayments(orderId)` để tính lại các trường tổng hợp từ lịch sử `payment_transactions` nếu xảy ra sự cố bất thường.

---

### QUYẾT ĐỊNH 05: SNAPSHOT ĐỊA CHỈ GIAO HÀNG (SHIPPING ADDRESS SNAPSHOT)
- **Cơ chế bảo vệ tính bất biến:**
  1. **Quy tắc vòng đời:** Địa chỉ giao nhận chỉ được phép sửa đổi khi đơn hàng ở trạng thái **`DRAFT`**. Một khi đơn hàng chuyển sang `CONFIRMED`, `PARTIALLY_FULFILLED`, `FULFILLED` hoặc `CANCELLED`, snapshot bị **đóng băng vĩnh viễn (Immutable)**.
  2. **Bảo vệ tầng Database:** Sử dụng PostgreSQL Trigger:
     ```sql
     CREATE OR REPLACE FUNCTION fn_freeze_sales_order_shipping_address()
     RETURNS TRIGGER AS $$
     BEGIN
       IF OLD.status <> 'DRAFT' AND (
         NEW.shipping_address_snapshot <> OLD.shipping_address_snapshot OR
         NEW.shipping_province_code <> OLD.shipping_province_code OR
         NEW.shipping_district_code <> OLD.shipping_district_code OR
         NEW.shipping_ward_code <> OLD.shipping_ward_code OR
         NEW.shipping_phone <> OLD.shipping_phone OR
         NEW.shipping_recipient_name <> OLD.shipping_recipient_name OR
         NEW.shipping_full_address <> OLD.shipping_full_address
       ) THEN
         RAISE EXCEPTION 'DATABASE VIOLATION: Không được phép sửa đổi địa chỉ giao hàng của đơn hàng đã xác nhận (status = %)!', OLD.status;
       END IF;
       RETURN NEW;
     END;
     $$ LANGUAGE plpgsql;

     CREATE TRIGGER trg_freeze_sales_order_shipping_address
     BEFORE UPDATE ON "sales_orders"
     FOR EACH ROW EXECUTE FUNCTION fn_freeze_sales_order_shipping_address();
     ```
  3. **Đồng bộ 100% từ Snapshot:** 6 cột lookup được trích xuất trực tiếp từ chính JSON document snapshot tại thời điểm INSERT, không có luồng dữ liệu thứ hai.
- **Căn cứ nghiệp vụ & Index cho 6 cột Lookup:**
  | Cột Lookup | Kiểu dữ liệu | Query Pattern thực tế cần phục vụ | Index đề xuất |
  |---|---|---|---|
  | `shipping_province_code` | `VARCHAR(20)` | Thống kê doanh thu theo Tỉnh/Thành (`GROUP BY shipping_province_code`), lọc đơn theo địa bàn. | `@@index([organizationId, shippingProvinceCode])` |
  | `shipping_district_code` | `VARCHAR(20)` | Định tuyến đội ngũ giao hàng / phân quyền nhân viên phụ trách khu vực quận huyện. | Không cần index riêng (cardinality thấp, nằm trong composite query). |
  | `shipping_ward_code` | `VARCHAR(20)` | Tích hợp tính cước API đơn vị vận chuyển (GHN, GHTK yêu cầu mã phường xã). | Không index (chỉ đọc chi tiết). |
  | `shipping_phone` | `VARCHAR(50)` | Tra cứu nhanh đơn hàng khi tài xế hoặc khách gọi hotline đọc số điện thoại nhận. | `@@index([organizationId, shippingPhone])` |
  | `shipping_recipient_name`| `VARCHAR(255)` | Tìm kiếm đơn hàng theo tên người nhận (khi khác tên chủ tài khoản khách hàng). | Tìm kiếm full-text hoặc LIKE khi cần. |
  | `shipping_full_address` | `TEXT` | In phiếu giao hàng (Bill of Lading / Packing Slip) trực tiếp mà không cần parse JSON. | Không index (chuỗi text dài). |

---

### QUYẾT ĐỊNH 06: QUY TẮC RÀNG BUỘC PHIẾU KIỂM KÊ KHO (`Stocktake` & `StocktakeItem`)
- **Phân tích nghiệp vụ kho hiện tại:**
  * Mỗi phiếu kiểm kê `Stocktake` luôn thuộc về **một kho xác định** (`warehouseId`).
  * Ở phạm vi kho trung cấp (Intermediate Inventory) của MVP, hệ thống quản lý tồn theo cặp `(warehouseId, productId)` và **chưa quản lý theo vị trí chi tiết (Location/Bin) hoặc số Lô (Lot/Serial)**.
  * Vì vậy, trong phạm vi một phiếu kiểm kê của một kho, một sản phẩm chỉ có thể và chỉ được phép xuất hiện **tối đa một dòng kiểm kê duy nhất**.
- **Ràng buộc MVP:**
  ```prisma
  @@unique([stocktakeId, productId], name: "uq_stocktake_items_product")
  ```
- **Kế hoạch mở rộng tương lai (Zero-breaking Upgrade) & Lưu ý PostgreSQL NULL:**
  * Theo chuẩn SQL-92 và PostgreSQL thông thường, ràng buộc `UNIQUE` coi mỗi giá trị `NULL` là một giá trị riêng biệt. Nếu sau này mở rộng composite key sang `(stocktake_id, product_id, location_id, lot_number)` và cho phép `location_id` hoặc `lot_number` là NULL, PostgreSQL sẽ cho phép chèn nhiều dòng trùng lặp!
  * **Giải pháp chuẩn hóa khi mở rộng ở Phase 3:**
    Sử dụng tính năng **`UNIQUE NULLS NOT DISTINCT`** của PostgreSQL 15+:
    ```sql
    ALTER TABLE "stocktake_items" 
      DROP CONSTRAINT "uq_stocktake_items_product",
      ADD CONSTRAINT "uq_stocktake_items_product_loc_lot" 
        UNIQUE NULLS NOT DISTINCT ("stocktake_id", "product_id", "location_id", "lot_number");
    ```
  * **Cam kết tuyệt đối cho MVP:** Hiện tại KHÔNG thêm trường Location/Lot giả vào schema.

---

### QUYẾT ĐỊNH 07: BẢO VỆ TOÀN VẸN ĐA TỔ CHỨC (MULTI-TENANT INTEGRITY)
- **Vấn đề rủi ro:** Một request cố tình gửi `salesOrderId` thuộc Tổ chức A nhưng lại ghi nhận `payment_transactions` gắn `organizationId` của Tổ chức B (Cross-tenant data pollution).
- **Cơ chế phòng vệ 2 lớp:**
  1. **Lớp Database (Composite Foreign Key):**
     * Để PostgreSQL chặn đứng việc liên kết chéo tenant, bảng cha `sales_orders` được khai báo ràng buộc duy nhất composite `@@unique([id, organizationId])`.
     * Bảng con `payment_transactions` thiết lập khóa ngoại composite:
       ```sql
       ALTER TABLE "payment_transactions"
         ADD CONSTRAINT "fk_payment_transactions_sales_order_tenant"
         FOREIGN KEY ("sales_order_id", "organization_id")
         REFERENCES "sales_orders" ("id", "organization_id")
         ON DELETE RESTRICT;
       ```
       *Nếu kẻ tấn công cố tình truyền `organization_id` khác với `sales_orders.organization_id`, câu lệnh INSERT sẽ bị PostgreSQL ném lỗi `23503 foreign_key_violation` ngay lập tức.*
     * Cơ chế tương tự được áp dụng cho cặp `(sales_order_id, organization_id)` trên `inventory_reservations` và `(warehouse_id, organization_id)` trên `inventory_balances`.
  2. **Lớp Application (Tenant Context Guard & Pipeline):**
     * Mọi query đều được tự động gắn `where: { organizationId: currentTenantId }` từ JWT Claims đã được ký cryptographically.
     * Kiểm tra `parent.organizationId === currentTenantId` trong Validation Pipe.

---

## 3. BẢNG KIỂM TOÁN CHỈ MỤC (INDEX AUDIT MATRIX)

Dưới đây là danh sách chính xác các chỉ mục được đề xuất, kèm query pattern và đánh giá chi phí ghi dữ liệu:

| Bảng (Table) | Cột & Thứ tự (Columns & Order) | Query Pattern thực tế cần phục vụ | Index hiện tại | Đánh giá trùng lặp | Lợi ích dự kiến | Đánh giá chi phí ghi |
|---|---|---|---|---|---|---|
| `sales_order_items` | `[salesOrderId]` | `SELECT * FROM sales_order_items WHERE sales_order_id = :id` (lấy toàn bộ mặt hàng của đơn). | Chưa có | Không trùng (hiện chỉ có PK `id`). | Giảm chi phí Seq Scan xuống Index Scan khi xem đơn hàng. | Thấp (chỉ ghi khi tạo đơn). |
| `sales_order_items` | `[productId]` | `SELECT ... WHERE product_id = :id` (kiểm tra lịch sử bán hàng theo sản phẩm). | Chưa có | Không trùng. | Tăng tốc tính doanh số theo SKU. | Thấp. |
| `stock_receipt_items` | `[receiptId]` | `SELECT * FROM stock_receipt_items WHERE receipt_id = :id` (lấy danh sách hàng nhập). | Chưa có | Không trùng. | Tăng tốc mở phiếu nhập kho. | Rất thấp. |
| `stock_receipt_items` | `[productId]` | `SELECT ... WHERE product_id = :id` (truy vết lịch sử giá vốn nhập). | Chưa có | Không trùng. | Tăng tốc tính giá vốn bình quân gia quyền. | Rất thấp. |
| `stock_issue_items` | `[issueId]` | `SELECT * FROM stock_issue_items WHERE issue_id = :id` (lấy danh sách hàng xuất). | Chưa có | Không trùng. | Tăng tốc mở phiếu xuất kho. | Rất thấp. |
| `stock_issue_items` | `[productId]` | Thống kê sản lượng xuất theo sản phẩm. | Chưa có | Không trùng. | Tăng tốc báo cáo xuất nhập tồn. | Rất thấp. |
| `stock_transfer_items`| `[transferId]` | Lấy danh sách hàng trong phiếu điều chuyển kho. | Chưa có | Không trùng. | Tăng tốc mở phiếu chuyển kho. | Rất thấp. |
| `stock_transfer_items`| `[productId]` | Lịch sử điều chuyển theo sản phẩm. | Chưa có | Không trùng. | Hỗ trợ phân tích luân chuyển hàng hóa. | Rất thấp. |
| `stock_adjustment_items`| `[adjustmentId]`| Lấy chi tiết chênh lệch điều chỉnh kho. | Chưa có | Không trùng. | Tăng tốc mở phiếu điều chỉnh. | Rất thấp. |
| `stock_adjustment_items`| `[productId]` | Lịch sử hao hụt/thừa thiếu theo sản phẩm. | Chưa có | Không trùng. | Phục vụ kiểm soát thất thoát kho. | Rất thấp. |
| `sales_order_status_histories` | `[salesOrderId, changedAt(Asc)]` | `WHERE sales_order_id = :id ORDER BY changed_at ASC` (vẽ timeline đơn). | Chưa có | Không trùng. | Tối ưu tuyệt đối Index Only Scan, không cần Sort memory. | Cực thấp (chỉ ghi 1 dòng khi đổi status). |
| `deal_stage_histories` | `[dealId, changedAt(Asc)]` | `WHERE deal_id = :id ORDER BY changed_at ASC` (tính chu kỳ bán hàng Sales Cycle). | Chưa có | Không trùng. | Tối ưu tính toán phễu chuyển đổi. | Cực thấp. |
| `sales_orders` | `[organizationId, shippingProvinceCode]` | `GROUP BY shipping_province_code WHERE organization_id = :id` (báo cáo doanh thu theo tỉnh). | Chưa có | Không trùng. | Tăng tốc báo cáo phân vùng địa lý. | Thấp. |
| `sales_orders` | `[organizationId, shippingPhone]` | `WHERE organization_id = :id AND shipping_phone = :phone` (tra cứu đơn theo SĐT). | Chưa có | Không trùng. | Tăng tốc tìm kiếm đơn hàng cho chăm sóc khách hàng. | Thấp. |
| `payment_transactions` | `[organizationId, referenceCode]` (Partial) | `WHERE organization_id = :id AND reference_code = :code` (chống trùng ủy nhiệm chi). | Chưa có | Không trùng. | Vừa chống trùng vừa tăng tốc đối soát ngân hàng. | Rất thấp. |

---

## 4. BẢNG TỔNG HỢP TOÀN BỘ THAY ĐỔI SCHEMA TRÌNH DUYỆT (SCHEMA AUDIT TABLE)

| Vấn đề (Issue) | Thiết kế Hiện tại (Current Design) | Thiết kế Đề xuất Cuối cùng (Final Proposed Design) | Căn cứ Nghiệp vụ (Business Reason) | Ràng buộc Kỹ thuật (Technical Enforcement) | Đánh giá Rủi ro (Migration Risk) | Kịch bản Kiểm thử (Test Case) |
|---|---|---|---|---|---|---|
| **ISSUE-01: Contract Org FK** | Có cột `organizationId UUID`, thiếu decorator `@relation`. | `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)` | Bảo vệ hồ sơ pháp lý lao động lịch sử; áp dụng Soft Delete cho Organization. | PostgreSQL FK Restrict (`23503`). | Rất thấp: Chỉ thêm ràng buộc FK. | Cố tình xóa Organization có Contract $\rightarrow$ Bị chặn `23503`. |
| **ISSUE-02: Inventory CHECK** | Không có ràng buộc ở CSDL. | Bổ sung 3 Physical CHECK: $H \ge 0, R \ge 0, R \le H$. | Ngăn chặn vĩnh viễn âm kho do race condition khi bán hàng đồng thời. | PostgreSQL CHECK Constraints (`23514`). | Không có: Dữ liệu sạch, cột đã NOT NULL. | Chèn tồn âm hoặc giữ > tồn $\rightarrow$ Bị chặn `23514`. |
| **ISSUE-03: User-Employee 1-1** | 2 cột FK trỏ chéo nhau (`users.employee_id` và `employees.user_id`). | **Một FK duy nhất trên `users.employee_id` (`UNIQUE`, `onDelete: SetNull`).** Xóa bỏ cột `employees.user_id`. | Tránh mâu thuẫn dữ liệu 2 đầu; chuẩn hóa quan hệ 0..1 to 0..1. | Single Physical FK + Unique Index + Pre-migration Validation. | Rất thấp: Có script kiểm tra phát hiện mâu thuẫn trước khi chạy. | Thử tạo 2 user trỏ cùng 1 employee $\rightarrow$ Bị chặn Unique `23505`. |
| **ISSUE-04: Detail Indexes** | Thiếu index trên các bảng chi tiết. | Bổ sung chính xác 15 index có căn cứ query patterns rõ ràng. | Tăng tốc độ đọc dữ liệu JOIN Master-Detail và vẽ timeline lịch sử. | B-Tree Indexes & Composite Indexes. | Thấp: Tăng tốc độ đọc, tăng nhẹ dung lượng index. | Chạy `EXPLAIN ANALYZE` chứng minh chuyển từ Seq Scan sang Index Scan. |
| **ISSUE-05: Address Snapshot** | Chưa có snapshot địa chỉ, thiếu phân tích địa bàn. | `shippingAddressSnapshot Json` + 6 cột lookup + Trigger đóng băng. | Bảo vệ bất biến thông tin giao hàng lịch sử khi khách đổi trụ sở. | PostgreSQL Trigger `trg_freeze_sales_order_shipping_address` + Zod schema. | Rất thấp: Cột mới có DEFAULT/NULLABLE. | Sửa địa chỉ đơn `CONFIRMED` $\rightarrow$ Bị chặn bởi Trigger. |
| **ISSUE-06: Payment Architecture** | Chưa có thực thể thanh toán; thiếu quản lý cọc và hoàn tiền. | Thêm `PaymentTransaction` (Status: `PENDING`), Partial Unique `referenceCode`, tính `overpaidAmount`. | Quản lý dòng tiền thực tế, cọc, trả góp theo đợt, hoàn tiền và chống trùng giao dịch. | Partial Index `uq_org_ref_code` + `SELECT ... FOR UPDATE` + Same DB Transaction. | Rất thấp: Bổ sung bảng mới độc lập. | 1. Gửi 2 transaction cùng ref code $\rightarrow$ Chặn `23505`.<br>2. Hoàn tiền vượt số đã thu $\rightarrow$ Bị từ chối. |
| **ISSUE-07: Stocktake Unique** | Chưa có unique constraint giữa phiếu và sản phẩm. | `@@unique([stocktakeId, productId], name: "uq_stocktake_items_product")`. | Một sản phẩm chỉ xuất hiện 1 lần trong phiếu kiểm kê kho trung cấp. | PostgreSQL Composite Unique Constraint. | Rất thấp: Dữ liệu hiện tại chưa có trùng lặp. | Thêm 2 dòng cùng 1 sản phẩm vào 1 phiếu $\rightarrow$ Bị chặn `23505`. |
| **ISSUE-08: Cross-tenant Defense** | Chỉ có `organizationId` đơn lẻ trên từng bảng. | Composite FK `(sales_order_id, organization_id)` trên các bảng thanh toán và giữ hàng. | Ngăn chặn việc liên kết nhầm hoặc tiêm dữ liệu chéo tổ chức. | PostgreSQL Composite Foreign Key. | Thấp: Đã có đủ cặp cột trên các bảng. | Tạo Payment Org A trỏ Order Org B $\rightarrow$ Bị chặn `23503`. |

---

## 5. KẾT LUẬN & ĐIỂM KIỂM SOÁT GATE

Toàn bộ 11 tiêu chí kỹ thuật chuyên sâu theo đánh giá của bạn đã được tích hợp đầy đủ vào tài liệu thiết kế.

Hệ thống tuân thủ nghiêm ngặt **STRICT EXECUTION BOUNDARY**:
- **Chưa can thiệp vào `prisma/schema.prisma`.**
- **Chưa tạo migration.**
- **Chưa chạy `db push` hay `migrate dev`.**
- **Toàn bộ source code backend và frontend được giữ nguyên vẹn.**

Hệ thống dừng lại tại đây và chờ quyết định phê duyệt chính thức từ bạn.
