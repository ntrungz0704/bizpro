# KẾ HOẠCH TRIỂN KHAI MIGRATION & RÀNG BUỘC CƠ SỞ DỮ LIỆU
**Dự án:** BizPro+ Integrated Modular Business Management System  
**Giai đoạn:** Phase 1C-C Blueprint (Chờ phê duyệt trước khi thực thi)  
**Tài liệu:** DATABASE_MIGRATION_PLAN.md  
**Phiên bản:** 1.1 — Updated Final Review  

---

## 1. NGUYÊN TẮC MIGRATION BẮT BUỘC

1. **Tuyệt đối không dùng `prisma db push`:** Mọi thay đổi cấu trúc dữ liệu đều phải tạo migration có quản lý phiên bản (`prisma migrate dev --create-only`), review SQL trước khi áp dụng.
2. **Kiểm tra SQL thủ công trước khi chạy:** Toàn bộ câu lệnh DDL tự sinh bởi Prisma và các câu lệnh `CHECK` bổ sung phải được rà soát kỹ lưỡng từng dòng.
3. **Tính khả lập lại (Reproducibility):** Database phải có khả năng dựng lại sạch sẽ từ con số 0 trên bất kỳ môi trường nào (CI/CD, Staging, Production) thông qua lệnh `npx prisma migrate deploy`.
4. **Không làm mất dữ liệu & Zero-breaking Data Migration:**
   - Script migration kiểm tra và di chuyển dữ liệu liên kết User - Employee trước khi xóa cột thừa.
   - Mọi cột mới đều có giá trị DEFAULT hoặc NULLABLE.

---

## 2. KỊCH BẢN THỰC THI (STEP-BY-STEP MIGRATION BLUEPRINT)

### BƯỚC 1: Cập nhật `prisma/schema.prisma` và `backend/prisma/schema.prisma`
Áp dụng các chỉnh sửa đã được chuẩn hóa:
1. `EmployeeContract`: Thêm `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Restrict)`.
2. `Employee`: Xóa cột scalar `userId String? @unique`, giữ quan hệ ảo `user User? @relation("UserEmployee")`.
3. `User`: Giữ `employeeId String? @unique` làm bên sở hữu duy nhất khóa ngoại vật lý (`onDelete: SetNull`).
4. `StocktakeItem`: Thêm `@@unique([stocktakeId, productId], name: "uq_stocktake_items_product")`.
5. `SalesOrder`:
   - Bổ sung `paymentStatus PaymentStatus @default(UNPAID) @map("payment_status")`.
   - Bổ sung `paidAmount Decimal @default(0.00) @map("paid_amount") @db.Decimal(15, 2)`.
   - Bổ sung `remainingBalance Decimal @default(0.00) @map("remaining_balance") @db.Decimal(15, 2)`.
   - Bổ sung `shippingAddressSnapshot Json @map("shipping_address_snapshot")`.
   - Bổ sung các cột tra cứu: `shippingRecipientName`, `shippingPhone`, `shippingProvinceCode`, `shippingDistrictCode`, `shippingWardCode`, `shippingFullAddress`.
6. Bổ sung Model `PaymentTransaction` độc lập và các enum thanh toán (`PaymentMethod`, `PaymentTransactionType`, `TransactionStatus`, `PaymentStatus`).
7. Bổ sung chính xác 10 index cho 8 bảng chi tiết.

### BƯỚC 2: Tạo Migration đầu tiên với cờ `--create-only`
```bash
cd backend
npx prisma migrate dev --name init_database_foundation --create-only
```
Lệnh này sẽ tạo thư mục `backend/prisma/migrations/<timestamp>_init_database_foundation/migration.sql` mà **chưa** thực thi lên PostgreSQL.

### BƯỚC 3: Chèn SQL Data Migration và Physical Check Constraints vào tệp `migration.sql`
Mở tệp `migration.sql` vừa sinh và chèn khối SQL bảo vệ toàn vẹn ở cuối tệp:

```sql
-- =======================================================
-- 1. DATA MIGRATION: ĐỒNG BỘ USER - EMPLOYEE TRƯỚC KHI XÓA CỘT THỪA
-- =======================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'user_id'
  ) THEN
    -- Đồng bộ employee_id sang users nếu chưa có
    UPDATE users u
    SET employee_id = e.id
    FROM employees e
    WHERE e.user_id = u.id AND u.employee_id IS NULL;

    -- Xóa cột user_id thừa trên employees
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

-- 2.3 BẢO VỆ ĐƠN HÀNG: Số lượng đặt phải > 0, số lượng đã xuất <= số lượng đặt
ALTER TABLE "sales_order_items"
  ADD CONSTRAINT "chk_sales_order_items_quantity_positive" 
    CHECK ("quantity" > 0),
  ADD CONSTRAINT "chk_sales_order_items_fulfilled_lte_quantity" 
    CHECK ("fulfilled_quantity" <= "quantity");

-- 2.4 BẢO VỆ THANH TOÁN: Số tiền giao dịch phải lớn hơn 0
ALTER TABLE "payment_transactions"
  ADD CONSTRAINT "chk_payment_transactions_amount_positive" 
    CHECK ("amount" > 0);
```

### BƯỚC 4: Áp dụng Migration lên PostgreSQL Development Container
```bash
cd backend
npx prisma migrate dev
```
Prisma sẽ:
- Thực thi toàn bộ DDL tạo 51 bảng (50 bảng ban đầu + bảng `payment_transactions`).
- Áp dụng các index B-Tree và Composite Unique Constraints.
- Áp dụng các PostgreSQL CHECK constraints vật lý.
- Cập nhật bảng quản lý phiên bản `_prisma_migrations`.
- Tự động sinh Prisma Client mới nhất với đầy đủ typing TypeScript.

### BƯỚC 5: Kiểm chứng tính toàn vẹn qua Integration Tests (Phase 1C-D)
Viết các bài test tự động chứng minh:
1. **Kiểm tra CHECK Constraint:** Cố tình chèn một bản ghi `inventory_balances` có `quantity_on_hand = -5.000` hoặc `quantity_reserved = 10` trong khi `quantity_on_hand = 5`. Kỳ vọng: PostgreSQL ném lỗi `23514 check_violation` và transaction bị rollback lập tức.
2. **Kiểm tra Foreign Key Restrict:** Cố tình xóa một `Organization` khi đang có hợp đồng lao động `EmployeeContract`. Kỳ vọng: PostgreSQL từ chối với lỗi `23503 foreign_key_violation`.
3. **Kiểm tra Deduplication Thanh toán:** Gửi 2 giao dịch có cùng `idempotencyKey` hoặc cùng `referenceCode`. Kỳ vọng: Giao dịch thứ 2 bị chặn bởi `23505 unique_violation`.
4. **Kiểm tra Bất biến Snapshot Địa chỉ:** Cập nhật địa chỉ khách hàng trong `Customer`; chứng minh `shippingAddressSnapshot` của các đơn hàng cũ giữ nguyên 100%.
5. **Kiểm tra Rollback Đa bảng:** Thực hiện giao dịch (Tạo đơn hàng + Giữ hàng kho); cố tình gây lỗi ở bước thứ 2; chứng minh toàn bộ transaction được rollback sạch sẽ.
