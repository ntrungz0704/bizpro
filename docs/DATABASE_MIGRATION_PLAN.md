# KẾ HOẠCH TRIỂN KHAI MIGRATION & RÀNG BUỘC CƠ SỞ DỮ LIỆU
**Dự án:** BizPro+ Integrated Modular Business Management System  
**Giai đoạn:** Phase 1C-C Blueprint (Chờ phê duyệt trước khi thực thi)  
**Tài liệu:** DATABASE_MIGRATION_PLAN.md  
**Phiên bản:** 1.2 — Pre-Migration Gate  

---

## 1. NGUYÊN TẮC QUẢN TRỊ MIGRATION BẮT BUỘC

1. **Tuyệt đối không dùng `prisma db push`:** Mọi thay đổi cấu trúc dữ liệu đều phải thông qua migration có quản lý phiên bản với Prisma Migrate.
2. **Quy trình 3 chặng tách bạch rõ ràng:**
   - *Chặng 1 (Generate):* Sinh migration draft bằng cờ `--create-only`.
   - *Chặng 2 (Review & Enrich):* Kiểm toán từng dòng SQL DDL và chèn các CHECK constraints, triggers, partial indexes thủ công.
   - *Chặng 3 (Dry-run & Apply):* Kiểm thử chạy migration trên database test cô lập trước khi áp dụng chính thức.
   *(Việc dùng `--create-only` chỉ là bước tạo bản nháp để review, không tự động đảm bảo SQL không có lỗi. An toàn chỉ đạt được khi vượt qua bước Dry-run và Test tự động).*
3. **Tính khả lập lại (Reproducibility):** Database phải có khả năng dựng lại sạch sẽ từ con số 0 trên bất kỳ môi trường nào (CI/CD, Staging, Production) thông qua lệnh `npx prisma migrate deploy`.
4. **Không làm mất dữ liệu & Zero-breaking Data Migration:**
   - Kịch bản migration kiểm tra toàn diện và di chuyển dữ liệu liên kết User - Employee trước khi xóa cột thừa.
   - Mọi cột mới đều có giá trị DEFAULT hoặc NULLABLE.

---

## 2. KỊCH BẢN THỰC THI CHI TIẾT (STEP-BY-STEP MIGRATION BLUEPRINT)

### BƯỚC 1: Chuẩn bị Cấu hình Schema
Cập nhật `prisma/schema.prisma` và `backend/prisma/schema.prisma` theo đúng bảng đối chiếu được duyệt:
1. `EmployeeContract`: Thêm `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)`.
2. `Employee`: Xóa cột scalar `userId String? @unique`, giữ quan hệ ảo `user User? @relation("UserEmployee")`.
3. `User`: Giữ `employeeId String? @unique` làm bên sở hữu duy nhất khóa ngoại vật lý (`onDelete: SetNull`).
4. `StocktakeItem`: Thêm `@@unique([stocktakeId, productId], name: "uq_stocktake_items_product")`.
5. `SalesOrder`:
   - Bổ sung `paymentStatus PaymentStatus @default(UNPAID) @map("payment_status")`.
   - Bổ sung `paidAmount Decimal @default(0.00) @map("paid_amount") @db.Decimal(15, 2)`.
   - Bổ sung `remainingBalance Decimal @default(0.00) @map("remaining_balance") @db.Decimal(15, 2)`.
   - Bổ sung `overpaidAmount Decimal @default(0.00) @map("overpaid_amount") @db.Decimal(15, 2)`.
   - Bổ sung `shippingAddressSnapshot Json @map("shipping_address_snapshot")`.
   - Bổ sung các cột tra cứu: `shippingRecipientName`, `shippingPhone`, `shippingProvinceCode`, `shippingDistrictCode`, `shippingWardCode`, `shippingFullAddress`.
   - Thêm `@@unique([id, organizationId])` phục vụ composite FK bảo vệ đa tổ chức.
6. Bổ sung Model `PaymentTransaction` với `status TransactionStatus @default(PENDING)`.
7. Bổ sung 15 chỉ mục có căn cứ cho các bảng chi tiết.

### BƯỚC 2: Sinh Migration Draft với cờ `--create-only`
```bash
cd backend
npx prisma migrate dev --name init_database_foundation --create-only
```
Lệnh này tạo thư mục `backend/prisma/migrations/<timestamp>_init_database_foundation/migration.sql` mà **chưa** thực thi lên PostgreSQL.

### BƯỚC 3: Rà soát & Chèn khối SQL Nâng cao vào `migration.sql`
Mở tệp `migration.sql` vừa sinh và chèn khối SQL bảo vệ toàn vẹn ở cuối tệp:

```sql
-- =======================================================
-- 1. PRE-MIGRATION ASSERTIONS & DATA MIGRATION: USER - EMPLOYEE
-- =======================================================
DO $$
DECLARE
  v_conflicts INT := 0;
  v_multi_user INT := 0;
  v_multi_emp INT := 0;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'user_id'
  ) THEN
    -- 1.1 Kiểm tra quan hệ mâu thuẫn chéo giữa 2 cột
    SELECT COUNT(*) INTO v_conflicts
    FROM users u
    JOIN employees e ON u.employee_id = e.id
    WHERE e.user_id IS NOT NULL AND e.user_id <> u.id;

    IF v_conflicts > 0 THEN
      RAISE EXCEPTION 'MIGRATION ABORTED: Phát hiện % bản ghi có quan hệ mâu thuẫn giữa users.employee_id và employees.user_id!', v_conflicts;
    END IF;

    -- 1.2 Kiểm tra 1 Employee bị liên kết bởi nhiều User
    SELECT COUNT(*) INTO v_multi_user
    FROM (
      SELECT employee_id FROM users WHERE employee_id IS NOT NULL GROUP BY employee_id HAVING COUNT(*) > 1
    ) sub;

    IF v_multi_user > 0 THEN
      RAISE EXCEPTION 'MIGRATION ABORTED: Phát hiện % Employee đang bị liên kết bởi nhiều User!', v_multi_user;
    END IF;

    -- 1.3 Kiểm tra 1 User bị liên kết bởi nhiều Employee
    SELECT COUNT(*) INTO v_multi_emp
    FROM (
      SELECT user_id FROM employees WHERE user_id IS NOT NULL GROUP BY user_id HAVING COUNT(*) > 1
    ) sub;

    IF v_multi_emp > 0 THEN
      RAISE EXCEPTION 'MIGRATION ABORTED: Phát hiện % User đang bị liên kết bởi nhiều Employee!', v_multi_emp;
    END IF;

    -- 1.4 Đồng bộ employee_id sang users nếu chưa có
    UPDATE users u
    SET employee_id = e.id
    FROM employees e
    WHERE e.user_id = u.id AND u.employee_id IS NULL;

    -- 1.5 Xóa cột user_id thừa trên employees
    ALTER TABLE "employees" DROP COLUMN IF EXISTS "user_id";
  END IF;
END $$;

-- =======================================================
-- 2. BIZPRO+ PHYSICAL INVARIANT CHECK CONSTRAINTS
-- =======================================================

-- 2.1 BẢO VỆ BẤT BIẾN TỒN KHO: OnHand >= 0, Reserved >= 0, Reserved <= OnHand
ALTER TABLE "inventory_balances"
  ADD CONSTRAINT "chk_inventory_balances_on_hand_non_negative" 
    CHECK ("quantity_on_hand" >= 0),
  ADD CONSTRAINT "chk_inventory_balances_reserved_non_negative" 
    CHECK ("quantity_reserved" >= 0),
  ADD CONSTRAINT "chk_inventory_balances_reserved_lte_on_hand" 
    CHECK ("quantity_reserved" <= "quantity_on_hand");

-- 2.2 BẢO VỆ GIỮ HÀNG: Số lượng giữ chỗ phải lớn hơn 0
ALTER TABLE "inventory_reservations"
  ADD CONSTRAINT "chk_inventory_reservations_quantity_positive" 
    CHECK ("quantity" > 0);

-- 2.3 BẢO VỆ ĐƠN HÀNG: Số lượng đặt phải > 0, số lượng đã xuất >= 0 và <= số lượng đặt
ALTER TABLE "sales_order_items"
  ADD CONSTRAINT "chk_sales_order_items_quantity_positive" 
    CHECK ("quantity" > 0),
  ADD CONSTRAINT "chk_sales_order_items_fulfilled_non_negative" 
    CHECK ("fulfilled_quantity" >= 0),
  ADD CONSTRAINT "chk_sales_order_items_fulfilled_lte_quantity" 
    CHECK ("fulfilled_quantity" <= "quantity");

-- 2.4 BẢO VỆ THANH TOÁN: Số tiền giao dịch phải lớn hơn 0
ALTER TABLE "payment_transactions"
  ADD CONSTRAINT "chk_payment_transactions_amount_positive" 
    CHECK ("amount" > 0);

-- 2.5 BẢO VỆ TỔNG HỢP THANH TOÁN ĐƠN HÀNG
ALTER TABLE "sales_orders"
  ADD CONSTRAINT "chk_sales_orders_paid_amount_non_negative" 
    CHECK ("paid_amount" >= 0),
  ADD CONSTRAINT "chk_sales_orders_remaining_balance_non_negative" 
    CHECK ("remaining_balance" >= 0),
  ADD CONSTRAINT "chk_sales_orders_overpaid_amount_non_negative" 
    CHECK ("overpaid_amount" >= 0);

-- =======================================================
-- 3. CHỐNG TRÙNG MÃ THAM CHIẾU NGÂN HÀNG (PARTIAL UNIQUE INDEX)
-- =======================================================
CREATE UNIQUE INDEX "uq_payment_transactions_org_ref_code" 
ON "payment_transactions" ("organization_id", "reference_code") 
WHERE "reference_code" IS NOT NULL;

-- =======================================================
-- 4. BẢO VỆ ĐA TỔ CHỨC (COMPOSITE FOREIGN KEY)
-- =======================================================
ALTER TABLE "payment_transactions"
  ADD CONSTRAINT "fk_payment_transactions_sales_order_tenant"
  FOREIGN KEY ("sales_order_id", "organization_id")
  REFERENCES "sales_orders" ("id", "organization_id")
  ON DELETE RESTRICT;

-- =======================================================
-- 5. TRIGGER ĐÓNG BĂNG ĐỊA CHỈ GIAO HÀNG ĐƠN ĐÃ XÁC NHẬN
-- =======================================================
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

DROP TRIGGER IF EXISTS trg_freeze_sales_order_shipping_address ON "sales_orders";
CREATE TRIGGER trg_freeze_sales_order_shipping_address
BEFORE UPDATE ON "sales_orders"
FOR EACH ROW EXECUTE FUNCTION fn_freeze_sales_order_shipping_address();
```

### BƯỚC 4: Dry-run & Áp dụng Migration lên PostgreSQL
```bash
cd backend
npx prisma migrate dev
```
Prisma sẽ:
- Thực thi toàn bộ DDL tạo 51 bảng (50 bảng ban đầu + bảng `payment_transactions`).
- Chạy khối kiểm tra tiền di trú (Pre-migration validation).
- Áp dụng các index B-Tree và Composite Unique Constraints.
- Áp dụng các PostgreSQL CHECK constraints vật lý.
- Áp dụng Partial Unique Index và Trigger đóng băng snapshot.
- Cập nhật bảng quản lý phiên bản `_prisma_migrations`.
- Tự động sinh Prisma Client mới nhất với đầy đủ typing TypeScript.

---

## 3. PHƯƠNG ÁN PHỤC HỒI & ROLLBACK (RECOVERY STRATEGY)

Để đảm bảo an toàn tuyệt đối khi xảy ra sự cố ngoài ý muốn trong quá trình deploy, hệ thống chuẩn bị sẵn kịch bản Rollback DDL (`down.sql`):

```sql
-- DOWN MIGRATION (ROLLBACK DDL)
DROP TRIGGER IF EXISTS trg_freeze_sales_order_shipping_address ON "sales_orders";
DROP FUNCTION IF EXISTS fn_freeze_sales_order_shipping_address();

ALTER TABLE "payment_transactions" DROP CONSTRAINT IF EXISTS "fk_payment_transactions_sales_order_tenant";
DROP INDEX IF EXISTS "uq_payment_transactions_org_ref_code";

ALTER TABLE "sales_orders" DROP CONSTRAINT IF EXISTS "chk_sales_orders_overpaid_amount_non_negative";
ALTER TABLE "sales_orders" DROP CONSTRAINT IF EXISTS "chk_sales_orders_remaining_balance_non_negative";
ALTER TABLE "sales_orders" DROP CONSTRAINT IF EXISTS "chk_sales_orders_paid_amount_non_negative";
ALTER TABLE "payment_transactions" DROP CONSTRAINT IF EXISTS "chk_payment_transactions_amount_positive";
ALTER TABLE "sales_order_items" DROP CONSTRAINT IF EXISTS "chk_sales_order_items_fulfilled_lte_quantity";
ALTER TABLE "sales_order_items" DROP CONSTRAINT IF EXISTS "chk_sales_order_items_fulfilled_non_negative";
ALTER TABLE "sales_order_items" DROP CONSTRAINT IF EXISTS "chk_sales_order_items_quantity_positive";
ALTER TABLE "inventory_reservations" DROP CONSTRAINT IF EXISTS "chk_inventory_reservations_quantity_positive";
ALTER TABLE "inventory_balances" DROP CONSTRAINT IF EXISTS "chk_inventory_balances_reserved_lte_on_hand";
ALTER TABLE "inventory_balances" DROP CONSTRAINT IF EXISTS "chk_inventory_balances_reserved_non_negative";
ALTER TABLE "inventory_balances" DROP CONSTRAINT IF EXISTS "chk_inventory_balances_on_hand_non_negative";

DROP TABLE IF EXISTS "payment_transactions" CASCADE;
```

---

## 4. KẾ HOẠCH KIỂM THỬ ĐỒNG THỜI & TÍNH TOÀN VẸN (CONCURRENCY & INTEGRITY TEST PLAN - PHASE 1C-D)

Sau khi áp dụng migration, đội ngũ sẽ viết và thực thi 7 kịch bản kiểm thử tự động chuyên sâu:

1. **Kiểm thử Đua tranh Giữ chỗ Kho (Concurrent Inventory Reservation Test):**
   * *Kịch bản:* Sản phẩm A có tồn khả dụng = 5. Khởi chạy đồng thời 10 luồng thanh toán / xác nhận đơn hàng, mỗi đơn yêu cầu giữ 1 sản phẩm.
   * *Cơ chế:* Backend sử dụng `SELECT ... FOR UPDATE` trên dòng `inventory_balances` trong isolation level `READ COMMITTED`.
   * *Kỳ vọng:* Đúng 5 transaction đầu tiên thành công; 5 transaction sau bị từ chối với thông báo "Hàng tồn khả dụng không đủ"; giá trị tồn kho cuối cùng giữ nguyên $R = 5, H = 5$; tuyệt đối không bị vi phạm CHECK constraint $R \le H$.
2. **Kiểm thử Đua tranh Hoàn tiền (Concurrent Refund Attack Test):**
   * *Kịch bản:* Đơn hàng đã thu 10 triệu. Gửi đồng thời 2 request yêu cầu hoàn tiền, mỗi request đòi hoàn 7 triệu.
   * *Kỳ vọng:* Do có row locking trên đơn hàng, request đầu tiên thành công hoàn 7 triệu (số dư còn lại = 3 triệu); request thứ hai lập tức bị chặn vì $7 > 3$; không bao giờ xảy ra việc hoàn 14 triệu.
3. **Kiểm thử Deduplication (Idempotency Key & Bank Reference Code):**
   * *Kịch bản:* Gửi 2 request thanh toán có cùng `idempotencyKey` hoặc cùng `referenceCode` của một ngân hàng.
   * *Kỳ vọng:* Request thứ nhất thành công; request thứ hai bị PostgreSQL từ chối với mã lỗi `23505 unique_violation`.
4. **Kiểm thử Tấn công Chéo Tổ chức (Cross-Tenant Poisoning Attack):**
   * *Kịch bản:* Giả lập request từ Tổ chức A cố tình ghi nhận một `PaymentTransaction` hoặc `InventoryReservation` trỏ tới `salesOrderId` thuộc về Tổ chức B.
   * *Kỳ vọng:* PostgreSQL ném lỗi `23503 foreign_key_violation` do vi phạm Composite Foreign Key `(sales_order_id, organization_id)`.
5. **Kiểm thử Đóng băng Địa chỉ Giao hàng (Address Immutability Trigger Test):**
   * *Kịch bản:* Cập nhật địa chỉ khách hàng trong `Customer`; kiểm tra các đơn hàng đã `CONFIRMED`.
   * *Kỳ vọng:* Trigger `trg_freeze_sales_order_shipping_address` chặn đứng mọi câu lệnh UPDATE sửa đổi địa chỉ đơn hàng đã xác nhận.
6. **Kiểm thử Ràng buộc CHECK Âm kho (Physical CHECK Violation):**
   * *Kịch bản:* Thực hiện câu lệnh SQL trực tiếp cố tình cập nhật `quantity_on_hand = -1` hoặc `fulfilled_quantity > quantity`.
   * *Kỳ vọng:* PostgreSQL trả mã lỗi `23514 check_violation` và rollback ngay lập tức.
7. **Kiểm thử Toàn vẹn Tham chiếu Pháp lý (Contract FK Restrict):**
   * *Kịch bản:* Cố tình xóa một `Organization` khi tổ chức đó đang lưu trữ hợp đồng lao động `EmployeeContract`.
   * *Kỳ vọng:* PostgreSQL từ chối với mã lỗi `23503 foreign_key_violation`, bảo toàn 100% hồ sơ.
