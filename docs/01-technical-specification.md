# TECHNICAL SPECIFICATION (ĐẶC TẢ KỸ THUẬT HỆ THỐNG)
## BUSINESS MANAGEMENT SYSTEM (CRM + INVENTORY + HRM + SALES ORDER)
**Phiên bản:** 1.0  
**Trạng thái:** Sẵn sàng triển khai kỹ thuật (Pre-implementation Approved)  
**Kiến trúc:** Modular Monolith (Clean Architecture & Domain-Driven Design Lite)  
**Mục tiêu:** Hệ thống quản trị doanh nghiệp hợp nhất, đa chi nhánh/kho, Multi-tenant Ready  

---

## 1. TỔNG QUAN KIẾN TRÚC KỸ THUẬT (SYSTEM ARCHITECTURE)

### 1.1. Mô hình kiến trúc tổng thể: Modular Monolith
Hệ thống được thiết kế theo mô hình **Modular Monolith** sử dụng **NestJS** (Backend) và **Next.js 15 App Router** (Frontend), kết nối cơ sở dữ liệu **PostgreSQL** thông qua **Prisma ORM**.

```
+-----------------------------------------------------------------------------------+
|                           FRONTEND: Next.js 15 (React 19)                         |
|  - App Router, Tailwind CSS, shadcn/ui, TanStack Query (React Query), Zustand     |
|  - Server Components (RSC) cho SSR/SEO + Client Components cho nghiệp vụ tương tác|
+-----------------------------------------------------------------------------------+
                                         | REST API (JSON) + SSE / WebSocket
                                         v
+-----------------------------------------------------------------------------------+
|                           BACKEND: NestJS Modular Monolith                        |
|                                                                                   |
|  +------------------------- SHARED KERNEL & PLATFORM --------------------------+  |
|  | - Auth Module (JWT + Refresh Token, Session)                                |  |
|  | - Multi-tenant Context Interceptor & Guard (Organization Isolation)        |  |
|  | - RBAC & Data Scope Engine (Guards & Decorators)                            |  |
|  | - Audit Log Interceptor (Tự động chụp Diff và lưu bất biến)                 |  |
|  | - Notification Module (SSE/WebPush/In-app)                                  |  |
|  | - Storage Module (S3 / MinIO / Local driver)                                 |  |
|  | - Event Bus (NestJS EventEmitter2 / In-process Domain Events)                |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +--------------------------- BOUNDED CONTEXT DOMAINS -------------------------+  |
|  | [CRM Module]      [Inventory Module]      [Sales Order]      [HRM Module]   |  |
|  | - Leads            - Products & UoM        - Orders & Items   - Employees    |  |
|  | - Customers        - Multi-Warehouse       - Reservations     - Departments  |  |
|  | - Deals & Pipeline - Receipts & Issues     - Fulfillment      - Attendance   |  |
|  | - Activities       - Stock Transfer        - Price Snapshot   - Leave Mgmt   |  |
|  |                    - Stocktake & Adjust                                      |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +---------------------------- INFRASTRUCTURE LAYER ---------------------------+  |
|  | - Prisma ORM Client (với Tenant Extension tự động chèn organization_id)    |  |
|  | - Database Transaction Manager ($transaction & Pessimistic Locks)           |  |
|  | - Redis (Cache + BullMQ cho Async Background Jobs)                           |  |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                           DATABASE: PostgreSQL 16+                                |
|  - Multi-tenant with organization_id partition/indexing                           |
|  - ACID Transactions, Pessimistic Locking (SELECT ... FOR UPDATE)                |
|  - Immutable Ledger for Inventory Transactions & Audit Logs                       |
+-----------------------------------------------------------------------------------+
```

### 1.2. Phân lớp kiến trúc bên trong mỗi Module (Layered Pattern)
Mỗi module độc lập tuân thủ 4 tầng trách nhiệm rõ ràng:
1. **Presentation Layer (Controllers):** Nhận HTTP request, validate DTO bằng `class-validator`, decode user/tenant context từ Guards, trả về chuẩn RESTful.
2. **Application Layer (Services & Use Cases):** Điều phối luồng nghiệp vụ (Orchestration), quản lý Database Transaction (`$transaction`), phát Domain Events sau khi commit.
3. **Domain Layer (Entities & Rules):** Thực thi các quy tắc bất biến (Business Invariants) như: `Available = OnHand - Reserved`, không cho phép tồn âm, kiểm tra điều kiện chuyển trạng thái đơn hàng.
4. **Persistence Layer (Prisma Repositories / Mappers):** Tương tác với cơ sở dữ liệu qua Prisma, đóng gói các câu query phức tạp và các lệnh khóa dòng (`FOR UPDATE`).

---

## 2. NGUYÊN TẮC BẢO MẬT & PHÂN QUYỀN (AUTHENTICATION, TENANCY & RBAC)

### 2.1. Quản lý Đa tổ chức (Multi-tenancy Isolation)
- **Cơ chế:** Phân tách ở tầng dữ liệu thông qua cột `organization_id` trên mọi bảng nghiệp vụ.
- **Tenant Context Interceptor:**
  * Trích xuất `organization_id` từ JWT Claims đã ký bí mật.
  * Đưa vào `AsyncLocalStorage` (Node.js) hoặc Request Context của NestJS.
  * Prisma Client Extension tự động gán điều kiện `where: { organization_id }` cho mọi truy vấn Read và tự động điền `data: { organization_id }` cho mọi thao tác Create/Update/Delete.
  * Tuyệt đối ngăn chặn hiện tượng rò rỉ dữ liệu chéo giữa các tổ chức (Cross-Tenant Data Leak).

### 2.2. RBAC kết hợp Data Scope (Role-Based + Scope-Based Access Control)
Quyền truy cập không chỉ dừng lại ở Role (Vai trò), mà phân giải theo ma trận **Permission Code + Data Scope**:

#### Cấu trúc Permission Code:
`<module>.<resource>.<action>`  
*Ví dụ:*
- `crm.leads.create`, `crm.leads.read`, `crm.leads.update`, `crm.leads.delete`
- `inventory.stock.issue`, `inventory.stock.adjust`, `inventory.stock.post`
- `sales.orders.confirm`, `sales.orders.fulfill`, `sales.orders.cancel`
- `hrm.leave.approve`, `hrm.employees.salary_read`

#### 3 Cấp độ Data Scope:
1. **OWN:** Chỉ thao tác trên dữ liệu do chính User đó tạo ra hoặc được chỉ định phụ trách (`assigned_to == currentUser.id` hoặc `created_by == currentUser.id`).
2. **DEPARTMENT:** Thao tác trên dữ liệu của toàn bộ phòng ban mà User trực thuộc (dựa trên cây phân cấp `departments`).
3. **ALL:** Toàn quyền trên toàn bộ dữ liệu của Organization.

---

## 3. CƠ CHẾ ĐỒNG THỜI & TOÀN VẸN DỮ LIỆU KHO (CONCURRENCY & INVENTORY INTEGRITY)

### 3.1. Đại lượng tồn kho & Bất biến nghiệp vụ (Invariants)
Hệ thống quản lý 3 đại lượng cốt lõi trên bảng `inventory_balances`:
- **`quantity_on_hand` (Tồn thực tế):** Lượng hàng vật lý đang nằm trong kho.
- **`quantity_reserved` (Lượng đã giữ):** Lượng hàng đã cam kết cho các đơn bán hàng (`Confirmed`), chờ xuất kho.
- **`quantity_available` (Tồn khả dụng):** Công thức tính:
  $$\text{Available} = \text{quantity\_on\_hand} - \text{quantity\_reserved}$$

**Quy tắc bất biến:**
- $\text{quantity\_on\_hand} \ge 0$ (Không cho phép tồn âm).
- $\text{quantity\_reserved} \ge 0$.
- $\text{quantity\_available} \ge 0$.
- Khi xác nhận đơn: $\text{Requested Quantity} \le \text{Available}$. Nếu vi phạm, Reject giao dịch ngay lập tức.

### 3.2. Chống Race Condition (Bán vượt tồn) bằng Pessimistic Lock
Khi có 2 hoặc nhiều nhân viên kinh doanh cùng bấm xác nhận đơn hàng cho cùng một sản phẩm có số lượng tồn kho khan hiếm tại cùng một thời điểm:
- **Giải pháp:** Sử dụng lệnh `SELECT ... FOR UPDATE` trên dòng `inventory_balances` bên trong Prisma Transaction.
- **Luồng xử lý (Atomic Reservation Flow):**
```sql
-- 1. Mở Transaction
BEGIN;

-- 2. Khóa dòng tồn kho của sản phẩm tại kho cụ thể
SELECT id, quantity_on_hand, quantity_reserved 
FROM inventory_balances 
WHERE warehouse_id = :warehouseId AND product_id = :productId 
FOR UPDATE;

-- 3. Kiểm tra điều kiện tồn khả dụng
-- IF (quantity_on_hand - quantity_reserved) < :orderQuantity THEN ROLLBACK & THROW ERROR

-- 4. Tăng lượng giữ hàng (Reserved)
UPDATE inventory_balances 
SET quantity_reserved = quantity_reserved + :orderQuantity, 
    updated_at = NOW() 
WHERE id = :balanceId;

-- 5. Tạo bản ghi Reservation
INSERT INTO inventory_reservations (organization_id, warehouse_id, product_id, sales_order_id, quantity, status)
VALUES (:orgId, :warehouseId, :productId, :orderId, :orderQuantity, 'ACTIVE');

-- 6. Cập nhật trạng thái Sales Order sang CONFIRMED
UPDATE sales_orders SET status = 'CONFIRMED', confirmed_at = NOW(), confirmed_by = :userId WHERE id = :orderId;

COMMIT;
```

### 3.3. Sổ cái biến động kho bất biến (Immutable Inventory Ledger)
- Mọi biến động làm thay đổi `quantity_on_hand` (Nhập kho, Xuất kho, Chuyển kho, Điều chỉnh) bắt buộc phải ghi 1 dòng vào bảng `inventory_transactions`.
- Dòng dữ liệu này là **Append-only** (Chỉ ghi, không cho phép Update hoặc Delete).
- Lưu lại snapshot `quantity_change`, `unit_cost`, và `balance_after` để phục vụ đối soát, kiểm toán và báo cáo Nhập - Xuất - Tồn theo thời gian thực.

---

## 4. CHI TIẾT CÁC LUỒNG TÍCH HỢP LIÊN MODULE (CROSS-MODULE LIFECYCLES)

### 4.1. Vòng đời đơn hàng & Xuất kho (Sales Order Fulfillment Lifecycle)
```
[DRAFT] 
   |
   | (User bấm Confirm -> Check Available Stock & Lock Row)
   v
[CONFIRMED] -----> [Tạo INVENTORY_RESERVATION (Status: ACTIVE)]
   |
   +------------------------------------+
   |                                    | (Nhân viên kho xuất hàng)
   |                                    v
   |                             [Tạo STOCK_ISSUE (POSTED)]
   |                                    |
   |                                    +--> Giảm quantity_on_hand
   |                                    +--> Giảm quantity_reserved
   |                                    +--> Ghi INVENTORY_TRANSACTION
   |                                    |
   v                                    v
[PARTIALLY_FULFILLED] <-----------------+ (Nếu xuất chưa đủ 100%)
   |
   v (Xuất đủ 100%)
[FULFILLED]
   |
   +--> Reservation chuyển sang FULFILLED
```
- **Hủy đơn (`CANCELLED`):**
  * Chỉ được hủy khi đơn ở trạng thái `DRAFT` hoặc `CONFIRMED` (chưa xuất kho).
  * Khi hủy đơn `CONFIRMED`: Giải phóng số lượng giữ hàng:
    $$\text{quantity\_reserved} = \text{quantity\_reserved} - \text{reserved\_qty}$$
  * Bản ghi `inventory_reservations` chuyển sang `RELEASED`.
  * Nếu đơn đã xuất một phần (`PARTIALLY_FULFILLED`), không được phép bấm hủy trực tiếp mà phải thực hiện quy trình "Trả hàng / Nhập kho hoàn lại" (Sales Return).

### 4.2. Chuyển đổi Khách hàng tiềm năng (Lead Conversion Pipeline)
1. Kiểm tra tính hợp lệ và chống trùng lặp theo Email/Số điện thoại trong bảng `customers` và `contacts`.
2. Chạy trong một Transaction duy nhất:
   - Tạo hoặc liên kết `companies`.
   - Tạo mới `contacts`.
   - Tạo mới `customers` chính thức.
   - (Tùy chọn) Khởi tạo `deals` tại giai đoạn đầu tiên của Sales Pipeline.
   - Đánh dấu `leads` có `status = 'CONVERTED'`, lưu `converted_at`, `converted_customer_id`.

### 4.3. Quy trình Chấm công & Nghỉ phép (HRM Lifecycle)
1. **Chấm công (Attendance):**
   - Hỗ trợ Check-in / Check-out qua Web UI với IP và Geolocation (tùy chọn).
   - Quản lý / HR có quyền điều chỉnh (Adjustment) nhưng bắt buộc ghi nhận `adjusted_by` và `adjustment_reason`.
2. **Nghỉ phép (Leave Management):**
   - Kiểm tra số ngày phép khả dụng:
     $$\text{Available Leave} = \text{entitled\_days} - \text{used\_days} - \text{pending\_days}$$
   - Khi nhân viên tạo đơn: Chuyển sang `PENDING`, tăng `pending_days`.
   - Khi Quản lý duyệt (`APPROVED`): Giảm `pending_days`, tăng `used_days`.
   - Khi Quản lý từ chối (`REJECTED`) hoặc Nhân viên rút đơn: Giảm `pending_days` hoàn trả hạn mức.

---

## 5. CHUẨN GIAO TIẾP API & XỬ LÝ LỖI (API CONTRACT STANDARDS)

### 5.1. Định dạng phản hồi RESTful chuẩn
Tất cả các API trả về cấu trúc đồng nhất:
```typescript
// Response thành công
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

// Response lỗi (RFC 7807 Problem Details Lite)
interface ApiErrorResponse {
  success: false;
  statusCode: number;
  errorCode: string; // e.g., 'INSUFFICIENT_STOCK', 'TENANT_NOT_FOUND'
  message: string;
  errors?: Record<string, string[]>; // Chi tiết lỗi validation từng field
  timestamp: string;
  path: string;
}
```

### 5.2. Nguyên tắc Idempotency cho các giao dịch nhạy cảm
- Đối với các API: `POST /api/v1/sales-orders`, `POST /api/v1/sales-orders/:id/confirm`, `POST /api/v1/inventory/stock-issues/:id/post`.
- Client gửi kèm Header `Idempotency-Key: <UUID>`.
- Backend lưu cache key trong Redis với TTL 120 giây. Nếu request trùng lặp đến trong khi đang xử lý hoặc đã xử lý xong, trả về ngay kết quả đã cache mà không thực thi lại giao dịch DB.
