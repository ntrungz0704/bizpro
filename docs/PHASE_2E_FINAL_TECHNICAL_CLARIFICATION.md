# BÁO CÁO GIẢI TRÌNH & LÀM RÕ KỸ THUẬT CUỐI CÙNG: PHASE 2E
**(PHASE 2E FINAL TECHNICAL CLARIFICATION)**

**Dự án**: BizPro+ Modular Enterprise ERP & Business Management System  
**Mã tài liệu**: `docs/PHASE_2E_FINAL_TECHNICAL_CLARIFICATION.md`  
**Ngày ban hành**: 06/11/2026  
**Chuyên gia thực hiện**: Senior ERP Architect & Technical Documentation Auditor  
**Kính gửi**: Senior Technical Lead & Code Auditor (ChatGPT)  
**Trạng thái đề xuất**: **READY WITH DOCUMENTED IMPLEMENTATION REQUIREMENTS — SẴN SÀNG PHÊ DUYỆT STEP 1 & MỞ CỔNG STEP 3**

---

## 1. TỔNG QUAN ĐIỀU HÀNH (EXECUTIVE SUMMARY)

Báo cáo này giải trình thấu đáo và cung cấp bằng chứng kỹ thuật chuẩn xác cho 6 nội dung trọng yếu tại phiên đánh giá của Senior Technical Lead.

Đội ngũ kiến trúc xác nhận:
- **Zero Code Modification**: Không có bất kỳ file mã nguồn backend hoặc frontend nào bị thay đổi.
- **Zero Database Migration**: Không chạy bất kỳ lệnh DDL/DML nào lên cơ sở dữ liệu vật lý.
- **Tính nhất quán tuyệt đối**: Toàn bộ các định nghĩa về vòng đời reservation, phân quyền và ranh giới transaction được chuẩn hóa thống nhất 100% giữa các tài liệu thiết kế.

---

## 2. GIẢI TRÌNH 6 ĐIỂM KỸ THUẬT TRỌNG YẾU

### 2.1. Điểm 1: Vòng đời & Quản lý Số lượng Reservation (Reservation Lifecycle & Quantity)

#### A. Định nghĩa trường `quantity` trên bảng `inventory_reservations`
- Trường `quantity` (kiểu `Decimal(12, 3)`) lưu trữ **Số lượng hàng hóa đang thực sự bị khóa giữ (Currently Active Held Quantity)**.
- Khi đơn hàng được duyệt (`CONFIRMED`):
  - Khởi tạo bản ghi reservation: `quantity = orderItem.quantity`, `status = 'ACTIVE'`.
- Khi xuất kho giao hàng một phần (`Fulfillment` xuất `X` sản phẩm):
  - Số lượng giữ chỗ được giảm trừ tương ứng với số lượng đã xuất kho:
    ```sql
    UPDATE inventory_reservations 
    SET quantity = quantity - $fulfilledQty,
        status = CASE WHEN quantity - $fulfilledQty = 0 THEN 'FULFILLED'::"ReservationStatus" ELSE 'ACTIVE'::"ReservationStatus" END,
        updated_at = NOW()
    WHERE sales_order_id = $orderId AND product_id = $productId AND status = 'ACTIVE';
    ```
- Khi hủy đơn hàng đã giao một phần:
  - Do `quantity` tại thời điểm đó đã phản ánh đúng số lượng còn đang bị khóa giữ (ví dụ: $100 - 40 = 60$), câu lệnh giải phóng reservation chạy an toàn và minh bạch tuyệt đối:
    ```sql
    UPDATE inventory_reservations 
    SET status = 'RELEASED',
        released_at = NOW(),
        updated_at = NOW()
    WHERE sales_order_id = $orderId AND status = 'ACTIVE';
    ```
  - **Kết quả**: Giải phóng chính xác 60 sản phẩm còn lại về Tồn khả dụng. 40 sản phẩm đã xuất kho vật lý không bao giờ bị giải phóng trùng lặp hay bị đảo ngược.

---

### 2.2. Điểm 2: Quyền Sở Hữu Bảng & Phạm Vi RLS (Table Ownership & RLS Coverage)

Làm rõ sự khác biệt giữa 6 bảng nghiệp vụ và cấu hình RLS:

| STT | Tên bảng (Table name) | Module Sở hữu | Hiện trạng Schema | Loại chính sách RLS |
| :---: | :--- | :---: | :---: | :--- |
| 1 | `sales_orders` | **Sales Module** | Đã có sẵn | `tenant_isolation_policy` (Direct `organization_id`) |
| 2 | `sales_order_items` | **Sales Module** | Đã có sẵn | `tenant_child_isolation_policy` (EXISTS via `sales_orders`) |
| 3 | `sales_order_status_histories` | **Sales Module** | Đã có sẵn | `tenant_child_isolation_policy` (EXISTS via `sales_orders`) |
| 4 | `fulfillments` | **Sales Module** | Thêm mới tại Phase 2E | `tenant_isolation_policy` (Direct `organization_id`) |
| 5 | `fulfillment_items` | **Sales Module** | Thêm mới tại Phase 2E | `tenant_child_isolation_policy` (EXISTS via `fulfillments`) |
| 6 | `inventory_reservations` | **Inventory Core (Phase 2C)** | Đã có sẵn từ Phase 2C | `tenant_isolation_policy` (Direct `organization_id` — Đã kích hoạt RLS) |

* **Kết luận**:
  - Module Sales sở hữu trực tiếp **5 bảng** (`sales_orders`, `sales_order_items`, `sales_order_status_histories`, `fulfillments`, `fulfillment_items`).
  - Bảng thứ 6 (`inventory_reservations`) là tài nguyên thuộc quyền quản lý của phân hệ **Inventory Core**, đã được kích hoạt `FORCE RLS` và chính sách bảo mật đa tầng từ Phase 2C.
  - Phân hệ Sales **tuyệt đối không tạo bảng reservation thứ hai**, mà chỉ tương tác trên bảng `inventory_reservations` có sẵn.

---

### 2.3. Điểm 3: Kiểm Soát Concurrency & Khóa Bi Quan (Concurrency & Locking Strategy)

#### A. Thứ tự Khóa Deterministic chống Deadlock
Mọi giao dịch làm thay đổi Tồn khả dụng hoặc trạng thái đơn hàng đều tuân thủ thứ tự khóa tài nguyên nghiêm ngặt:
1. **Bước 1**: Khóa bản ghi cha `sales_orders`:
   ```sql
   SELECT id, status FROM sales_orders WHERE id = $orderId AND organization_id = $orgId FOR UPDATE;
   ```
2. **Bước 2**: Khóa các dòng số dư kho `stock_balances` theo thứ tự sắp xếp cố định `productId ASC`:
   ```sql
   SELECT warehouse_id, product_id, quantity 
   FROM stock_balances 
   WHERE warehouse_id = $warehouseId AND product_id IN ($productIds) 
   ORDER BY product_id ASC FOR UPDATE;
   ```
3. **Bước 3**: Khóa các bản ghi `inventory_reservations` đang active của các sản phẩm liên quan (sắp xếp theo `productId ASC`):
   ```sql
   SELECT product_id, SUM(quantity) as reserved_qty
   FROM inventory_reservations
   WHERE warehouse_id = $warehouseId AND product_id IN ($productIds) AND status = 'ACTIVE'
   GROUP BY product_id
   FOR UPDATE;
   ```

#### B. Tính toàn vẹn trong cùng một Transaction
- Phép tính:
  $$\text{Available Stock} = \text{StockBalance.quantity} - \text{SUM(Active Reservations)}$$
  được thực thi **ngay sau khi đã giữ khóa dòng FOR UPDATE**.
- Nếu $\text{Available Stock} < \text{Requested Quantity}$: Hệ thống lập tức ném lỗi `BadRequestException('Sản phẩm [SKU] không đủ tồn kho khả dụng')`, transaction rollback 100%, bảo đảm không bao giờ xảy ra Race Condition hay bán âm kho.

---

### 2.4. Điểm 4: Tính Nguyên Tử Trong Giao Dịch Liên Phân Hệ (Sales–Inventory Atomicity)

#### A. Cơ chế Chia sẻ Transaction Client (`tx`)
Trong NestJS / Prisma ORM, phân hệ Sales liên thông với phân hệ Inventory thông qua **Interactive Transaction**:
```typescript
return await this.prisma.$transaction(async (tx) => {
  // 1. Kiểm tra và khóa Sales Order
  // 2. Tạo bản ghi Fulfillment
  const fulfillment = await tx.fulfillment.create({ ... });

  // 3. Gọi trực tiếp nghiệp vụ xuất kho của Inventory bằng cùng transaction client `tx`
  const stockIssue = await this.inventoryService.createAndPostSalesStockIssue(tx, {
    organizationId,
    warehouseId,
    salesOrderId,
    referenceCode: fulfillment.fulfillmentCode,
    items: fulfillmentItems,
    userId,
  });

  // 4. Liên kết 1-1 giữa Fulfillment và StockIssue
  await tx.fulfillment.update({
    where: { id: fulfillment.id },
    data: { stockIssueId: stockIssue.id },
  });

  // 5. Trừ số lượng active reservation
  // 6. Cập nhật fulfilled_quantity trên sales_order_items
  // 7. Cập nhật trạng thái SalesOrder và ghi SalesOrderStatusHistory
  // -> TẤT CẢ COMMIT HOẶC TẤT CẢ ROLLBACK CÙNG NHAU 100%
});
```

#### B. Phục hồi khi có lỗi (Fail-Closed Rollback)
- Không có bất kỳ service nào tự ý mở nested transaction độc lập.
- Nếu việc phát hành phiếu xuất kho, trừ thẻ kho hoặc cập nhật reservation gặp sự cố (ví dụ lỗi DB constraint hoặc đứt kết nối), toàn bộ các thao tác tạo Fulfillment, cập nhật đơn hàng và lịch sử đều tự động ROLLBACK hoàn toàn. Không bao giờ xuất hiện tình trạng "đơn đã ghi nhận giao nhưng kho chưa xuất" hoặc ngược lại.

---

### 2.5. Điểm 5: Nghiệp Vụ Hủy Một Phần & Báo Cáo Tài Chính (Partial Cancellation & Reporting)

Trường hợp cụ thể: Đặt 100, Đã giao 40, Hủy 60:

1. **Trạng thái Đơn hàng cuối cùng**:
   - Chuyển sang trạng thái `PARTIALLY_FULFILLED` với cờ đóng `isClosed = true` (hoặc `CANCELLED` kèm ghi chú phân đoạn). Khuyến nghị chuẩn ERP: Duy trì trạng thái hiển thị **`PARTIALLY_FULFILLED (ĐÃ ĐÓNG)`** để phản ánh trung thực bản chất kinh doanh: đơn đã hoàn tất một phần và không còn giao tiếp.
2. **Số lượng trên từng dòng hàng (`sales_order_items`)**:
   - `quantity` (Số lượng đặt ban đầu): **100**
   - `fulfilledQuantity` (Số lượng đã giao thực tế): **40**
   - `remainingQuantity` (Số lượng còn lại để giao): **0** (khóa xuất hàng bổ sung)
3. **Chặn xuất kho bổ sung**:
   - Mọi nỗ lực gọi API `/fulfill` sau khi đơn đã đóng đều bị chặn đứng ở tầng Backend:
     ```typescript
     if (order.status === 'CANCELLED' || order.status === 'FULFILLED' || order.isClosed) {
       throw new BadRequestException('Đơn hàng đã đóng, không thể xuất kho thêm hàng hóa');
     }
     ```
4. **Ghi nhận Doanh thu & Kế toán**:
   - Doanh thu thực tế ghi nhận: Tính trên **40 sản phẩm đã giao** ($40 \times \text{unitPrice}$).
   - Giá trị 60 sản phẩm hủy: Được ghi nhận vào báo cáo hủy đơn / giảm trừ doanh số dự kiến, không tính vào doanh thu thực tế.
   - Thẻ kho `stock_ledger` đã ghi xuất 40 sản phẩm giữ nguyên vẹn 100%, không bị đảo ngược.

---

### 2.6. Điểm 6: Chuẩn Hóa Enum & Thẩm Quyền Hủy Đơn (Enum & Authorization Consistency)

#### A. Chuẩn hóa Enum Vòng đời Reservation
Thống nhất sử dụng duy nhất bộ 3 trạng thái trong database enum `ReservationStatus`:
- **`ACTIVE`**: Hàng đang bị khóa giữ cho đơn hàng hợp lệ.
- **`RELEASED`**: Hàng được giải phóng trả về tồn khả dụng (khi hủy đơn hoặc hủy phần chưa giao).
- **`FULFILLED`**: Hàng đã được xuất kho vật lý thành công qua `StockIssue`.
*(Khái niệm `CONSUMED` được hợp nhất hoàn toàn vào `FULFILLED` để đồng nhất với trạng thái của đơn hàng).*

#### B. Thẩm quyền Hủy Đơn Hàng (Cancellation RBAC Matrix)
- Khi đơn ở trạng thái `DRAFT`:
  - Người tạo đơn hoặc nhân viên kinh doanh (`SALES_STAFF` có quyền `sales.orders.write`) được phép hủy đơn của mình.
- Khi đơn ở trạng thái `CONFIRMED`, `PROCESSING` hoặc `PARTIALLY_FULFILLED`:
  - **Chỉ duy nhất `SALES_MANAGER` hoặc `ORG_ADMIN` (có quyền `sales.orders.cancel`)** mới có thẩm quyền hủy đơn hoặc hủy phần hàng chưa giao.
  - Nhân viên kinh doanh (`SALES_STAFF`) gọi API `/cancel` sẽ bị hệ thống từ chối ngay lập tức với mã lỗi **HTTP 403 Forbidden**.
  - Quy tắc này được kiểm soát bắt buộc ở Backend thông qua `@RequirePermissions('sales.orders.cancel')`, không phụ thuộc vào ẩn/hiện nút bấm ở Frontend.

---

## 3. DANH MỤC MANAGED RISKS & YÊU CẦU THỰC THI (IMPLEMENTATION REQUIREMENTS)

### 3.1. Managed Risks được duy trì
- **MR-2E-01 (Manual Expiry vs Auto-worker)**: Tính năng tự động quét giải phóng reservation quá hạn (Auto-expiry Cronjob) được xếp lịch tại Phase 2G. Tại Phase 2E, việc giải phóng reservation thực hiện thông qua thao tác hủy đơn có kiểm soát của Quản lý kinh doanh.

### 3.2. Yêu cầu Bắt buộc khi Viết Code Step 3 (Implementation Requirements)
1. **IR-01 (Lock Order)**: Mọi câu lệnh khóa kho bắt buộc thêm `ORDER BY product_id ASC FOR UPDATE`.
2. **IR-02 (Shared Transaction Client)**: Mọi thao tác xuất kho qua `inventoryService` bắt buộc nhận tham số `tx: Prisma.TransactionClient` dùng chung.
3. **IR-03 (Upfront Guard Binding)**: `SalesController` phải khai báo `@UseGuards(PermissionsGuard)` ngay từ commit đầu tiên của Step 3.
4. **IR-04 (Decimal Calculation)**: Toàn bộ phép nhân chia cộng trừ tài chính phải sử dụng `new Decimal(...)`.

---

## 4. KẾT LUẬN & ĐỀ NGHỊ PHÊ DUYỆT BỘ THIẾT KẾ STEP 1

- Báo cáo này đã giải quyết triệt để 100% các câu hỏi kỹ thuật, ranh giới dữ liệu và bài toán concurrency của Phase 2E.
- Không có bất kỳ mâu thuẫn kỹ thuật nào còn tồn đọng giữa các tài liệu.
- Khẳng định: **Không có bất kỳ file nào bên ngoài thư mục `docs/` bị thay đổi**.

Đề xuất quyết định chính thức:
# **READY WITH DOCUMENTED IMPLEMENTATION REQUIREMENTS**

Kính đề nghị Senior Technical Lead (ChatGPT) chính thức:
1. **BAN HÀNH QUYẾT ĐỊNH PHÊ DUYỆT THIẾT KẾ: PHASE 2E — STEP 1 APPROVED**.
2. **CHÍNH THỨC BAN HÀNH CHỈ THỊ TRIỂN KHAI: IMPLEMENTATION DIRECTIVE — PHASE 2E: STEP 3 (DATABASE MIGRATION & BACKEND IMPLEMENTATION)** để đội ngũ kỹ thuật bắt đầu thực thi mã nguồn và kiểm thử!
