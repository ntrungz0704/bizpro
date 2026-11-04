# ĐẶC TẢ KỸ THUẬT GIAI ĐOẠN 1: SYSTEM CORE & INFRASTRUCTURE
**PHASE 1 TECHNICAL SPECIFICATION: BIZPRO+ PLATFORM FOUNDATION**

* **Mã tài liệu:** `DOCS-TECH-SPEC-06`
* **Phiên bản:** 1.0 (Phê duyệt trước khi triển khai)
* **Tác giả:** Principal Software Architect, Senior Full-Stack Engineer, Database Engineer & Security Reviewer
* **Nguyên tắc cốt lõi:** Bền vững, bảo mật, dữ liệu nhất quán, không mock/stub, chuẩn bị sẵn sàng cho Multi-tenant Enterprise.

---

## 1. CÁC QUYẾT ĐỊNH KIẾN TRÚC CỐT LÕI (ARCHITECTURAL DECISIONS - ADRs)

### ADR-01: Kiến trúc Modular Monolith trên nền tảng NestJS
* **Bối cảnh:** Dự án BizPro+ có nhiều phân hệ nghiệp vụ liên kết chặt chẽ (CRM, Kho, Đơn hàng, Nhân sự). Cần một kiến trúc đủ mạnh để bảo đảm tính toàn vẹn giao dịch (ACID) nhưng đủ tách bạch để không biến thành một "khối mã nguồn lộn xộn" (Spaghetti Monolith).
* **Quyết định:** Sử dụng **NestJS Modular Monolith** tại thư mục `/backend`.
* **Ranh giới Module (Module Boundaries):**
  * Mỗi module tự quản lý: Controllers, Services, DTOs, Entities, Repositories và Unit/Integration Tests riêng.
  * Các module giao tiếp với nhau qua Service Interface đã định nghĩa hoặc qua In-Process Event Bus (`EventEmitter2`), **tuyệt đối không truy cập trực tiếp repository của module khác**.
* **Quy chuẩn API & Versioning:**
  * Toàn bộ API được đặt tiền tố: `/api/v1/<module>/<resource>`.
  * Hỗ trợ URI Versioning (`v1`) để đảm bảo tính tương thích ngược khi phát triển lâu dài.

### ADR-02: Chuẩn hóa Xử lý Dữ liệu đầu vào & Ngoại lệ toàn cục
* **DTO Validation:** Sử dụng `class-validator` và `class-transformer` với `GlobalValidationPipe`:
  ```typescript
  new ValidationPipe({
    whitelist: true, // Tự động loại bỏ các trường không khai báo trong DTO
    forbidNonWhitelisted: true, // Ném lỗi 400 nếu client gửi trường lạ
    transform: true, // Tự động ép kiểu dữ liệu nguyên thủy
    transformOptions: { enableImplicitConversion: true }
  })
  ```
* **Exception Filter:** Sử dụng `GlobalHttpExceptionFilter` chuẩn hóa cấu trúc lỗi trả về cho mọi lỗi hệ thống:
  ```json
  {
    "success": false,
    "statusCode": 400,
    "error": "Bad Request",
    "message": ["sku must be a valid string"],
    "timestamp": "2026-11-04T22:15:00.000Z",
    "path": "/api/v1/inventory/products"
  }
  ```
* **Response Envelope:** Mọi API thành công trả về vỏ bọc đồng nhất:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": { ... },
    "meta": { "page": 1, "limit": 20, "total": 150 },
    "timestamp": "2026-11-04T22:15:00.000Z"
  }
  ```

### ADR-03: Đánh giá Nhu cầu Thực tế của Redis trong giai đoạn MVP
* **Đánh giá chuyên sâu:**
  * *Nhu cầu khóa giao dịch kho (Inventory Locking):* PostgreSQL 16 xử lý lệnh `SELECT ... FOR UPDATE` cực kỳ mạnh mẽ, an toàn tuyệt đối và có ACID transaction rollback tự nhiên. Không cần Redis Redlock để thay thế khóa của PostgreSQL.
  * *Nhu cầu quản lý phiên (Session):* JWT Access Token (ngắn hạn) + Refresh Token lưu bảng `sessions` trên PostgreSQL đáp ứng hoàn hảo yêu cầu bảo mật, hỗ trợ thu hồi token tức thì mà không cần Redis.
* **Kết luận kiến trúc:** **Redis KHÔNG PHẢI LÀ DEPENDENCY BẮT BUỘC** trong Phase 1. PostgreSQL 16 sẽ đảm nhiệm 100% việc lưu trữ và khóa giao dịch. Redis chỉ được thêm vào như dịch vụ tùy chọn trong `docker-compose.yml` khi bước vào giai đoạn Background Job Processing (ví dụ: xuất báo cáo Excel nặng qua BullMQ).

---

## 2. CẤU TRÚC THƯ MỤC HỆ THỐNG ĐỀ XUẤT (DIRECTORY STRUCTURE)

Dự án duy trì 2 thư mục độc lập ở thư mục gốc:

```
e:\dự án\
├── docs\                               # Tài liệu kiến trúc, audit, roadmap, specs
├── prisma\                             # Schema gốc và migrations dùng chung
│   ├── schema.prisma
│   └── migrations\
├── frontend\                           # Ứng dụng Next.js 15 (Port 3000)
│   ├── src\
│   │   ├── app\                        # Next.js App Router (17 trang đã có)
│   │   ├── components\                 # UI Components theo chuẩn BizPro+
│   │   ├── services\                   # Tầng API Client gọi về Backend (mới)
│   │   ├── hooks\                      # Custom hooks & TanStack Query (mới)
│   │   ├── context\                    # AppContext (giữ lại và chuyển dần sang API)
│   │   └── lib\                        # Utilities
│   ├── package.json
│   └── tailwind.config.ts
├── backend\                            # Ứng dụng NestJS Modular Monolith (Port 4000)
│   ├── src\
│   │   ├── app.module.ts               # Root Module
│   │   ├── main.ts                     # Entrypoint (Pipes, Filters, Swagger, CORS)
│   │   ├── common\                     # Shared Kernel & Base classes
│   │   │   ├── decorators\             # @CurrentUser(), @Permissions(), @Roles()
│   │   │   ├── filters\                # AllExceptionsFilter, HttpExceptionFilter
│   │   │   ├── guards\                 # JwtAuthGuard, PermissionsGuard, RolesGuard
│   │   │   ├── interceptors\           # TenantContextInterceptor, AuditLogInterceptor, TransformResponse
│   │   │   ├── pipes\                  # ParseUuidPipe, ValidationPipe
│   │   │   └── dto\                    # PaginationDto, BaseFilterDto
│   │   ├── config\                     # Configuration & Environment Validation
│   │   ├── database\                   # PrismaModule, PrismaService, TenantExtension
│   │   └── modules\                    # Bounded Contexts
│   │       ├── auth\                   # AuthModule (Login, Refresh, Hash, Session)
│   │       ├── users\                  # UsersModule (User, Role, Permission)
│   │       ├── organizations\          # OrganizationsModule (Tenancy, Settings)
│   │       ├── audit\                  # AuditModule (Audit Trail Service)
│   │       ├── crm\                    # CrmModule (Leads, Customers, Deals)
│   │       ├── inventory\              # InventoryModule (Products, Balances, Ledger)
│   │       ├── sales\                  # SalesModule (Orders, Reservations)
│   │       └── hrm\                    # HrmModule (Employees, Attendance, Leave)
│   ├── test\                           # E2E & Integration Tests
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── docker-compose.yml                  # Docker Compose chạy PostgreSQL 16
└── .gitignore                          # Cấu hình bỏ qua tệp tin toàn diện
```

---

## 3. CẤU HÌNH HẠ TẦNG & DOCKER (INFRASTRUCTURE DESIGN)

### 3.1. Thiết lập `docker-compose.yml` cho PostgreSQL 16
* **Database Image:** `postgres:16-alpine` (Gọn nhẹ, tối ưu tài nguyên, hiệu năng cao).
* **Cổng:** `5432:5432`.
* **Persistent Volume:** `bizpro_postgres_data` lưu trữ dữ liệu bền vững trên ổ đĩa máy trạm.
* **Healthcheck:**
  ```yaml
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U bizpro_user -d bizpro_db"]
    interval: 5s
    timeout: 5s
    retries: 5
  ```
* **Môi trường & Biến môi trường chuẩn (`backend/.env`):**
  ```env
  NODE_ENV=development
  PORT=4000
  DATABASE_URL="postgresql://bizpro_user:bizpro_password@localhost:5432/bizpro_db?schema=public"
  JWT_ACCESS_SECRET="bizpro_access_secret_super_secure_key_32bytes"
  JWT_REFRESH_SECRET="bizpro_refresh_secret_super_secure_key_32bytes"
  JWT_ACCESS_EXPIRATION="15m"
  JWT_REFRESH_EXPIRATION="7d"
  CORS_ORIGIN="http://localhost:3000"
  ```

---

## 4. CHIẾN LƯỢC CƠ SỞ DỮ LIỆU & KIỂM TOÁN 50 MODELS (DATABASE STRATEGY)

### 4.1. Kế hoạch Hoàn thiện Schema trước Migration
Trước khi chạy `prisma migrate dev`, các bổ sung bắt buộc sau sẽ được thực thi:
1. **Bổ sung Composite Indexes cho Khóa ngoại trên bảng con:**
   * `sales_order_items`: `@@index([salesOrderId])`, `@@index([productId])`.
   * `stock_receipt_items`: `@@index([receiptId])`, `@@index([productId])`.
   * `stock_issue_items`: `@@index([issueId])`, `@@index([productId])`.
   * `stock_transfer_items`: `@@index([transferId])`.
   * `stock_adjustment_items`: `@@index([adjustmentId])`.
   * `stocktake_items`: `@@index([stocktakeId])`.
   * `inventory_balances`: Bổ sung `@@index([organizationId, productId])`.
2. **Bổ sung các trường nghiệp vụ thực tế cho `SalesOrder`:**
   * Enum `PaymentStatus`: `UNPAID`, `PARTIALLY_PAID`, `PAID`, `REFUNDED` (mặc định: `UNPAID`).
   * Trường `shippingAddress: String? @map("shipping_address") @db.Text`.
3. **Thêm Check Constraints vật lý vào file migration SQL:**
   ```sql
   ALTER TABLE "inventory_balances"
     ADD CONSTRAINT "chk_inventory_balances_positive_on_hand" CHECK ("quantity_on_hand" >= 0),
     ADD CONSTRAINT "chk_inventory_balances_positive_reserved" CHECK ("quantity_reserved" >= 0),
     ADD CONSTRAINT "chk_inventory_balances_valid_available" CHECK ("quantity_on_hand" >= "quantity_reserved");
   ```

### 4.2. Chiến lược Seed Dữ liệu Khởi tạo (Database Seed Strategy)
Tệp `prisma/seed.ts` sẽ nạp dữ liệu nền tảng phục vụ kiểm thử và vận hành:
1. Tạo 1 **Organization** mẫu: "Tập đoàn Công nghệ & Thương mại BizPro Việt Nam" (`code: BIZPRO-VN`).
2. Nạp toàn bộ **66 Permission Codes** chuẩn hóa (theo `05-permission-matrix-physical.md`).
3. Tạo các **System Roles** mặc định:
   * `SUPER_ADMIN` (Gán full 66 permissions với scope `ALL`).
   * `ORG_ADMIN` (Toàn quyền quản trị doanh nghiệp).
   * `SALES_MANAGER`, `SALES_STAFF`.
   * `WAREHOUSE_MANAGER`, `WAREHOUSE_STAFF`.
   * `HR_MANAGER`, `EMPLOYEE`.
4. Tạo tài khoản **Super Admin** khởi tạo: `admin@bizpro.com` / Mật khẩu băm Argon2id.

---

## 5. THIẾT KẾ XÁC THỰC (AUTHENTICATION) & BẢO VỆ PHIÊN

### 5.1. Băm mật khẩu với Argon2id
* Sử dụng thư viện `argon2` chuẩn mật mã hiện đại (vượt trội hơn bcrypt về khả năng chống tấn công brute-force GPU/ASIC):
  * Thuật toán: Argon2id (kết hợp Argon2i và Argon2d).
  * Bộ nhớ: 65,536 KiB (64 MB).
  * Số vòng (iterations): 3 vòng.

### 5.2. Chiến lược Quản lý Token An toàn
* **Access Token:** JWT ngắn hạn (**15 phút**), chứa payload tối giản: `{ sub: userId, orgId, email }`.
* **Refresh Token:** JWT dài hạn (**7 ngày**).
  * Lưu trữ hash của Refresh Token trong bảng `sessions` tại PostgreSQL.
  * **Cơ chế Xoay vòng (Refresh Token Rotation):** Mỗi lần client gửi Refresh Token để lấy cặp token mới, Refresh Token cũ bị vô hiệu hóa lập tức và một Refresh Token mới được cấp phát.
  * **Phát hiện tái sử dụng (Reuse Detection):** Nếu một Refresh Token đã bị thu hồi/đã sử dụng mà lại được gửi lên, hệ thống sẽ đánh dấu phiên bị thỏa hiệp và vô hiệu hóa toàn bộ phiên đăng nhập của người dùng đó.
* **Lưu trữ trên Frontend:**
  * **Tuyệt đối không lưu Access Token hoặc Refresh Token trong `localStorage`** (tránh lỗ hổng tấn công XSS).
  * Refresh Token được lưu trong **HttpOnly, Secure, SameSite=Lax Cookie** (trình duyệt tự động gửi kèm, JavaScript không thể đọc trộm).
  * Access Token được lưu trong bộ nhớ RAM của ứng dụng hoặc đồng bộ qua Next.js Server Session.

---

## 6. THIẾT KẾ PHÂN QUYỀN 2 LỚP: RBAC & DATA SCOPE ENGINE

```mermaid
flowchart TD
    API["API Endpoint: GET /api/v1/sales/orders"] --> G1["JwtAuthGuard (Xác thực Bearer JWT)"]
    G1 --> G2["PermissionsGuard: Check 'sales.orders.read'"]
    G2 --> G3["DataScopeInterceptor: Đọc Scope của User trên quyền này"]
    
    G3 --> S1{"Scope của User là gì?"}
    S1 -->|OWN| C1["where: { organizationId, createdBy: user.id }"]
    S1 -->|DEPARTMENT| C2["where: { organizationId, employee: { departmentId: user.departmentId } }"]
    S1 -->|ALL| C3["where: { organizationId }"]
    
    C1 & C2 & C3 --> DB[(PostgreSQL Database)]
```

### 6.1. Lớp 1: RBAC Decorator & Guard
Khai báo quyền yêu cầu trên Controller method:
```typescript
@Get()
@RequirePermissions('sales.orders.read')
async getOrders(@CurrentUser() user: UserPayload, @Query() query: GetOrdersDto) {
  return this.ordersService.findAll(user, query);
}
```

### 6.2. Lớp 2: Data Scope Query Builder
Service tự động áp bộ lọc bản ghi dựa trên quyền đã được giải mã từ JWT:
```typescript
buildScopeFilter(user: UserPayload, permissionCode: string): Prisma.SalesOrderWhereInput {
  const scope = user.permissions[permissionCode]; // 'OWN' | 'DEPARTMENT' | 'ALL'
  if (scope === DataScope.OWN) {
    return { createdBy: user.id };
  }
  if (scope === DataScope.DEPARTMENT) {
    return { employee: { departmentId: user.departmentId } };
  }
  return {}; // ALL: không lọc thêm điều kiện người tạo
}
```

---

## 7. THIẾT KẾ CÔ LẬP ĐA TỔ CHỨC (TENANT ISOLATION) & AUDIT TRAIL

### 7.1. Phòng thủ Đa tầng cho Multi-tenancy (Defense-in-Depth)
1. **Tầng 1 - Request Context:** `TenantInterceptor` đọc `orgId` từ JWT đã verify chữ ký số và đưa vào `AsyncLocalStorage`.
2. **Tầng 2 - Service Injection:** Mọi method của Service đều nhận `orgId` làm tham số định danh bắt buộc.
3. **Tầng 3 - Prisma Extension Scoping:** Prisma Client tự động tiêm `organizationId` vào mọi câu lệnh `findMany`, `findFirst`, `update`, `delete`.
4. **Tầng 4 - Raw SQL Parameterization:** Các câu lệnh `$queryRaw` bắt buộc ép kiểu tham số `organization_id = ${orgId}::uuid`.
5. **Tầng 5 - Security Test Suite:** Bộ kiểm thử tự động giả lập 2 Tenant A và B; gọi API chéo ID và kiểm tra chắc chắn trả về `404 Not Found` hoặc `403 Forbidden`.

### 7.2. Cơ chế Ghi vết Tự động (Immutable Audit Trail)
* `AuditLogInterceptor` bắt các method `POST`, `PUT`, `PATCH`, `DELETE`:
  * Ghi nhận: `userId`, `organizationId`, `module`, `action`, `entityType`, `entityId`.
  * Ghi nhận snapshot thay đổi: `oldValues` (trước update) và `newValues` (sau update).
  * Ghi nhận dấu vết mạng: `ipAddress` và `userAgent`.
  * Dữ liệu được ghi thẳng vào bảng `audit_logs` trên PostgreSQL. Bảng này không có quyền Update/Delete từ bất kỳ API người dùng nào (Append-Only).

---

## 8. CHIẾN LƯỢC KIỂM THỬ GIAI ĐOẠN 1 (TESTING STRATEGY)

Để đạt mục tiêu sản phẩm có thể kiểm chứng được, Phase 1 bao gồm 4 cấp độ kiểm thử:
1. **Unit Tests (Vitest / Jest):**
   * Test băm mật khẩu Argon2id và xác thực mật khẩu.
   * Test ký và verify JWT Access/Refresh Token.
   * Test thuật toán tính Data Scope Filter.
2. **Integration Tests (PostgreSQL Test Database):**
   * Test kết nối cơ sở dữ liệu thật trong Docker.
   * Test tính toàn vẹn của 50 bảng vật lý và các khóa ngoại.
   * Test các Check Constraints vật lý của kho (`on_hand >= reserved`).
3. **Security Tests:**
   * Test Cross-Tenant Data Leak: User Org 1 truy cập dữ liệu Org 2 bị chặn.
   * Test RBAC: User không có quyền bị từ chối với mã lỗi 403.
   * Test Refresh Token Reuse: Cố tình dùng lại token cũ bị phát hiện và hủy toàn bộ phiên.
4. **Smoke & Health Tests:**
   * Endpoint `/api/health` trả về trạng thái HTTP và CSDL `status: "ok"`.
   * Endpoint Swagger `/api/docs` hiển thị đầy đủ tài liệu API.

---

## 9. TIÊU CHUẨN NGHIỆM THU PHASE 1 (ACCEPTANCE CHECKLIST)

Giai đoạn 1 chỉ được tuyên bố hoàn thành khi đạt đủ **9/9 tiêu chí nghiệm thu bắt buộc**:

- [ ] **1. Quản lý mã nguồn an toàn:** Git repository khởi tạo sạch sẽ, `.gitignore` bảo vệ secrets, baseline commit lưu giữ toàn bộ mã nguồn hiện có.
- [ ] **2. Hạ tầng Docker chạy thật:** PostgreSQL 16 container khởi chạy ổn định, chấp nhận kết nối qua cổng 5432.
- [ ] **3. Backend NestJS hoạt động:** Dự án `/backend` biên dịch không lỗi, có Swagger `/api/docs` và Healthcheck `/api/health`.
- [ ] **4. CSDL 50 bảng áp dụng thành công:** Đã hoàn thiện composite indexes, migration chạy exit code 0, có ràng buộc check kho vật lý.
- [ ] **5. Dữ liệu Seed nạp đầy đủ:** Organization, danh mục 66 quyền, Super Admin đã được tạo thành công trong database thật.
- [ ] **6. Xác thực Auth & Phiên an toàn:** Đăng nhập/đăng xuất hoạt động, mật khẩu băm Argon2id, JWT Access + Refresh token rotation hoạt động chuẩn xác.
- [ ] **7. Phân quyền 2 lớp (RBAC + Scope):** Chặn đứng truy cập trái quyền ở Backend; Data Scope lọc đúng bản ghi theo `OWN` / `DEPARTMENT` / `ALL`.
- [ ] **8. Cô lập Tenant & Audit Trail:** Bảo đảm không rò rỉ dữ liệu chéo giữa các tổ chức; mọi thao tác C/U/D ghi nhận vào `audit_logs`.
- [ ] **9. Bộ test tự động pass 100%:** Toàn bộ Unit test và Integration test của Phase 1 chạy thành công, không có lỗi Critical hoặc High.
