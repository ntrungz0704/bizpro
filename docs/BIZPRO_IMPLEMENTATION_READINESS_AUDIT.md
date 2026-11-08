# BÁO CÁO KIỂM TOÁN TÍNH SẴN SÀNG TRIỂN KHAI & KẾ HOẠCH DỮ LIỆU THẬT
**Mã tài liệu:** `docs/BIZPRO_IMPLEMENTATION_READINESS_AUDIT.md`  
**Giai đoạn:** Phase 0 — Implementation Readiness Audit & Real-Data Execution Preparation  
**Thời gian thực hiện:** 05/11/2026  
**Chuyên gia thực hiện:** Senior Technical Lead, Principal Software Architect, Database Engineer & Implementation Orchestrator  
**Trạng thái Implementation Gate:** `NOT APPROVED (HOLD)` — Đóng băng mã nguồn và schema, hoàn tất kiểm toán tiền triển khai.

---

## 1. TỔNG QUAN ĐIỀU HÀNH (EXECUTIVE SUMMARY)

Dự án **BizPro+ (Hệ thống Quản trị Doanh nghiệp Hợp nhất Enterprise B2B)** đang đứng trước bước ngoặt quyết định: **Chuyển từ giai đoạn thiết kế kiến trúc (Phase 1) sang giai đoạn triển khai hệ thống thực tế (Phase 2)**. 

Báo cáo kiểm toán Phase 0 này được thực hiện với tôn chỉ kỹ thuật: **Sự thật tuyệt đối (Absolute Reality), Không ngụy tạo dữ liệu (Zero-Mock), Phòng thủ đa tầng (Defense in Depth), và Dữ liệu bền vững (Persistent Data)**.

### Kết quả kiểm toán then chốt:
1. **Repository & Tech Stack:**
   - **Frontend:** Next.js 15.1.0 App Router, React 19, Tailwind CSS 3.4.16, Lucide React, Recharts. Giao diện trực quan hoàn chỉnh nhưng **100% dữ liệu đang chạy trên in-memory React state** ([AppContext.tsx](file:///e:/dự%20án/frontend/src/context/AppContext.tsx) - 1.698 dòng mock). Chưa tích hợp thư viện gọi API chuyên dụng (`axios` / `@tanstack/react-query`) hoặc validation form (`zod` / `react-hook-form`).
   - **Backend:** NestJS 10.4.15, Prisma 5.22.0. Đã hoàn thiện tầng nền tảng chung: [TransformResponseInterceptor](file:///e:/dự%20án/backend/src/common/interceptors/transform-response.interceptor.ts), [HttpExceptionFilter](file:///e:/dự%20án/backend/src/common/filters/http-exception.filter.ts) (RFC 7807), Environment Validation (Class-Validator), [HealthController](file:///e:/dự%20án/backend/src/health/health.controller.ts). Unit test pass 100% (3 suites, 9 tests). **Hoàn toàn chưa có bất kỳ Domain Module nghiệp vụ nào** (Auth, Users, CRM, Inventory, Sales, HRM).
   - **Database:** PostgreSQL 16 (cấu hình qua Docker Compose). `prisma/schema.prisma` có đúng **51 models** và **23 enums**. Có duy nhất **1 migration ban đầu** (`20261104180033_init_database_foundation`). 4 bảng bảo mật Phase 1D (`user_sessions`, `token_families`, `refresh_tokens`, `auth_idempotency_records`) và Row-Level Security (RLS) DDL **chưa được đưa vào schema runtime**.
   - **Môi trường Database Runtime:** Docker Desktop (`Docker Desktop.exe`) đã cài đặt tại máy local nhưng **chưa được khởi động (Daemon offline)**; cổng `5432` hiện chưa mở. Cần bật Docker service để kích hoạt container `bizpro_postgres`.
2. **Đánh giá mức độ rủi ro (Risk & Blockers):**
   - **2 BLOCKERS KỸ THUẬT:** Cần khởi động môi trường PostgreSQL thực tế và đưa 4 bảng Phase 1D vào `schema.prisma` trước khi viết code nghiệp vụ.
   - **3 MANAGED RISKS:** Kiểm soát connection pool leak bằng `$queryRaw` với `is_local = true`; kiểm soát migration drift; và quản lý chuyển đổi UI State từ mock sang API server state.
   - **4 IMPLEMENTATION REQUIREMENTS:** Bắt buộc sử dụng Zod/Class-Validator regex chặt chẽ cho Mã số thuế và Số điện thoại Việt Nam; bắt buộc có Toast Notifications cho mọi tương tác; bắt buộc Transaction Lock chống bán âm kho; và bắt buộc RBAC Dynamic Guard.
3. **Khuyến nghị Implementation Gate:** **`NOT APPROVED (HOLD)`**. Phê duyệt báo cáo Phase 0 này là điều kiện tiên quyết (Prerequisite Gate) trước khi cấp lệnh mở Gate cho **Phase 2A (Authentication & Security Foundation)**.

---

## 2. KIỂM TOÁN REPOSITORY & TECH STACK (REPOSITORY & TECH STACK AUDIT)

Bằng chứng kỹ thuật được thu thập trực tiếp từ repository tại `e:\dự án`:

| Thành phần kỹ thuật | Phiên bản thực tế | Tệp cấu hình nguồn | Hiện trạng triển khai & Bằng chứng thực tế |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15.1.0, React 19.0.0, React-DOM 19.0.0 | [frontend/package.json](file:///e:/dự%20án/frontend/package.json) | Đang chạy phát triển trên cổng `3000` (Process ID 13676, HTTP 200). App Router, Server Components kết hợp Client Components. |
| **Styling & Icons** | Tailwind CSS 3.4.16, Lucide-React 0.468.0 | [frontend/tailwind.config.ts](file:///e:/dự%20án/frontend/tailwind.config.ts) | Theme Doanh nghiệp nhất quán: Deep Blue, Slate, Emerald, Rose. UI responsive hoàn chỉnh. |
| **Data Visualization** | Recharts 2.15.0 | [frontend/src/components/RevenueChart.tsx](file:///e:/dự%20án/frontend/src/components/RevenueChart.tsx) | Render biểu đồ doanh thu và phễu CRM mượt mà. |
| **Backend Framework** | NestJS 10.4.15 (Express platform) | [backend/package.json](file:///e:/dự%20án/backend/package.json) | Cấu trúc Clean Architecture, TypeScript 5.7.2. Tầng Common hoàn chỉnh. |
| **ORM & Database Client**| Prisma ORM 5.22.0, `@prisma/client` 5.22.0 | [backend/package.json](file:///e:/dự%20án/backend/package.json), [prisma/schema.prisma](file:///e:/dự%20án/prisma/schema.prisma) | 51 models, 23 enums. Model mapping UUID v4, timestamptz, decimal(15,2). |
| **Database Engine** | PostgreSQL 16 Alpine | [docker-compose.yml](file:///e:/dự%20án/docker-compose.yml) | Cấu hình container `bizpro_postgres`, port `5432:5432`, database `bizpro_db`, user `bizpro_user`. |
| **Database Runtime Status**| **OFFLINE** | Lệnh kiểm tra: `docker ps`, `Get-NetTCPConnection -LocalPort 5432` | Docker daemon chưa bật (`dockerDesktopLinuxEngine` socket not found). Cổng 5432 chưa lắng nghe. |
| **Environment Config** | `@nestjs/config` 3.3.0 | [backend/src/config/configuration.ts](file:///e:/dự%20án/backend/src/config/configuration.ts) | Đã cấu hình validate biến môi trường qua class-validator. [backend/.env](file:///e:/dự%20án/backend/.env) đã có `DATABASE_URL`. |
| **API Envelope & Filter** | RFC 7807 Standard Error & Success Envelope | [backend/src/common](file:///e:/dự%20án/backend/src/common) | [HttpExceptionFilter](file:///e:/dự%20án/backend/src/common/filters/http-exception.filter.ts) và [TransformResponseInterceptor](file:///e:/dự%20án/backend/src/common/interceptors/transform-response.interceptor.ts) đạt 100% unit test pass. |
| **API Endpoints hiện có**| Duy nhất `GET /health` | [backend/src/health/health.controller.ts](file:///e:/dự%20án/backend/src/health/health.controller.ts) | Trả về trạng thái server, uptime, memory, database connection. |
| **Test Suite hiện có** | Jest 29.7.0, ts-jest 29.2.5 | [backend/package.json](file:///e:/dự%20án/backend/package.json) | 3 suites unit test pass (9/9 tests passed in 67s). Có 4 integration test e2e trong `backend/test/`. Frontend: 0 tests. |
| **Git Working Tree** | Branch `master` | Lệnh kiểm tra: `git status` | Có các thay đổi docs và frontend uncommitted. Thư mục `docs/` có 7 tài liệu untracked mới tạo. |

---

## 3. MA TRẬN THỰC TẾ TÍNH NĂNG (EXISTING FEATURE REALITY MATRIX)

Phân loại nghiêm ngặt mọi tính năng người dùng theo 5 mức độ:
- `VERIFIED_COMPLETE`: Có bằng chứng chạy thực tế (DB + Backend API + Frontend + Test).
- `PARTIALLY_IMPLEMENTED`: Đã triển khai một phần (ví dụ: DB + Backend hoặc DB + Frontend).
- `MOCK_DATA`: Dữ liệu giả hardcoded hoặc lưu tạm trong React State/localStorage.
- `UI_ONLY`: Chỉ có giao diện tĩnh, bấm nút không tạo giao dịch thực.
- `NOT_IMPLEMENTED`: Chưa có code hoặc chưa có thiết kế chi tiết.

| Màn hình / Tính năng | Thành phần Code nguồn | Nguồn dữ liệu hiện tại (Data Source) | Dữ liệu có lưu vào DB thật? | Phân loại trạng thái | Đánh giá & Bằng chứng thực tế |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Dashboard Tổng quan** | `frontend/src/app/page.tsx` | [AppContext.tsx](file:///e:/dự%20án/frontend/src/context/AppContext.tsx) (hardcoded state) | **KHÔNG** | **`UI_ONLY`** | Biểu đồ doanh thu, cơ cấu, hoạt động gần đây render đẹp mắt nhưng là số liệu giả lập client. |
| **Cấu hình & Cài đặt hệ thống** | `frontend/src/app/settings/page.tsx` | React State `orgProfile`, `userProfile`, `auditLogs` | **KHÔNG** | **`UI_ONLY`** | Sửa hồ sơ công ty bấm "Lưu thay đổi" chỉ cập nhật React memory. Cho phép nhập MST "đá" không validate. Thiếu toast. |
| **CRM — Đầu mối (Leads)** | `frontend/src/app/crm/leads/page.tsx` | `AppContext.leads` | **KHÔNG** | **`MOCK_DATA`** | Tạo lead, lọc status, convert lead chạy bằng hàm trong RAM. Bảng `leads` trong DB chưa có bản ghi. |
| **CRM — Khách hàng (Customers)** | `frontend/src/app/crm/customers/page.tsx`| `AppContext.customers` | **KHÔNG** | **`MOCK_DATA`** | Bảng danh sách khách hàng, form thêm khách hàng hoạt động trên RAM. Chưa gọi API NestJS. |
| **CRM — Cơ hội (Deals Kanban)**| `frontend/src/app/crm/deals/page.tsx` | `AppContext.deals` | **KHÔNG** | **`MOCK_DATA`** | Kéo/bấm chuyển cột pipeline (Mới tạo $\to$ Đã liên hệ $\to$ Gửi báo giá) cập nhật state client, mất khi F5. |
| **Kho — Danh mục Sản phẩm** | `frontend/src/app/inventory/products/page.tsx` | `AppContext.products` | **KHÔNG** | **`MOCK_DATA`** | Hiển thị SKU, Tồn thực tế, Tồn khả dụng từ mock object. Chưa liên kết bảng `products` trong DB. |
| **Kho — Nhập / Xuất kho** | `frontend/src/app/inventory/receipts-issues/page.tsx` | `AppContext.stockReceipts`, `stockIssues` | **KHÔNG** | **`MOCK_DATA`** | Tạo phiếu nhập kho tăng tồn kho trong RAM. Chưa ghi nhận vào sổ cái `inventory_transactions`. |
| **Kho — Kiểm kê (Stocktakes)**| `frontend/src/app/inventory/stocktakes/page.tsx` | Local component state | **KHÔNG** | **`UI_ONLY`** | Giao diện phiếu kiểm kê, chưa có logic cân đối chênh lệch vào database. |
| **Bán hàng — Đơn hàng (Orders)** | `frontend/src/app/sales/orders/page.tsx` | `AppContext.salesOrders` | **KHÔNG** | **`MOCK_DATA`** | Tạo đơn, bấm "Xác nhận đơn" tự động tăng `reserved` trong RAM. Không có cơ chế khóa DB chống bán âm kho. |
| **Bán hàng — Khách hàng sỉ & Nợ**| `frontend/src/app/sales/customers/page.tsx` | Local mock array | **KHÔNG** | **`UI_ONLY`** | Danh sách khách thương mại và hạn mức nợ giả lập. Bảng `payment_transactions` trong DB rỗng. |
| **Nhân sự — Hồ sơ Nhân viên** | `frontend/src/app/hrm/employees/page.tsx` | `AppContext.employees` | **KHÔNG** | **`MOCK_DATA`** | Danh sách nhân viên (Tổng: 143 người) là text giả lập. Chưa kết nối bảng `employees` PostgreSQL. |
| **Nhân sự — Chấm công** | `frontend/src/app/hrm/attendance/page.tsx` | `AppContext.attendanceRecords` | **KHÔNG** | **`MOCK_DATA`** | Bấm Check-in/Check-out thêm 1 dòng vào React state. Chưa lưu vào bảng `attendance_records`. |
| **Nhân sự — Nghỉ phép** | `frontend/src/app/hrm/leave/page.tsx` | `AppContext.leaveRequests` | **KHÔNG** | **`MOCK_DATA`** | Form tạo đơn nghỉ phép, nút Duyệt/Từ chối sửa trạng thái trên RAM. Chưa trừ quỹ phép `leave_balances`. |
| **Báo cáo Phân tích (Reports)** | `frontend/src/app/reports/page.tsx` | Static mock numbers | **KHÔNG** | **`UI_ONLY`** | Biểu đồ doanh thu và cơ cấu chi phí không có API aggregate backend. |
| **Backend Health Check** | `backend/src/health/health.controller.ts` | NestJS Terminus + Prisma ping | **CÓ (Khi DB bật)** | **`VERIFIED_COMPLETE`** | API `GET /health` đã kiểm thử đơn vị và tích hợp pass 100%. |
| **Backend Error/Response Pipe** | `backend/src/common` | NestJS Interceptors & Filters | **N/A (Tầng khung)**| **`VERIFIED_COMPLETE`** | Chuẩn hóa Envelope JSON và RFC 7807 pass 100% test suite. |

---

## 4. BÁO CÁO TÍNH SẴN SÀNG CỦA DATABASE (DATABASE READINESS REPORT)

Kiểm tra trực tiếp tệp [prisma/schema.prisma](file:///e:/dự%20án/prisma/schema.prisma) và thư mục `prisma/migrations`:

### 4.1. Thống kê Định lượng Schema Hiện tại:
- **Tổng số Models:** Đúng **51 models** (Bao phủ 5 phân hệ: Shared Platform, HRM, CRM, Inventory, Sales Orders + Model thứ 51 là `PaymentTransaction`).
- **Tổng số Enums:** Đúng **23 enums** (Bao gồm các trạng thái: `CommonStatus`, `LeadStatus`, `CustomerType`, `DealStatus`, `StockDocStatus`, `InventoryTransactionType`, `PaymentTransactionType`, `TransactionStatus`, `PaymentMethod`, ...).
- **Khóa chính (PK):** 100% sử dụng UUID v4 sinh ngẫu nhiên qua PostgreSQL function `@default(dbgenerated("gen_random_uuid()")) @db.Uuid`.
- **Ràng buộc Toàn vẹn (Referential Actions):** 
  - Khóa ngoại dữ liệu lịch sử/tài chính/kho: Sử dụng `onDelete: Restrict` (bảo đảm an toàn tuyệt đối, không mất dấu vết chứng từ).
  - Khóa ngoại liên kết tenant: Sử dụng `onDelete: Cascade` từ bảng cha `Organization`.

### 4.2. Khảo sát 7 Vấn đề Nghiệp vụ & Toàn vẹn Cốt lõi:

| STT | Vấn đề kiểm tra | Hiện trạng trong Schema & DB | Đánh giá tính sẵn sàng |
| :---: | :--- | :--- | :--- |
| **1** | **Tenant Ownership (`organization_id`)** | Có mặt tại **43 models** nghiệp vụ. Các models dùng chung toàn hệ thống (`Role`, `Permission`, `UnitOfMeasure`) không có `organization_id` theo đúng thiết kế Master Platform. | **SẴN SÀNG** cho RLS. Tuy nhiên RLS DDL chưa được áp dụng vào PostgreSQL. |
| **2** | **Quan hệ User – Employee** | Thiết kế 1-1 tùy chọn (Optional 1-to-1): `User.employeeId` `@unique` trỏ tới `Employee.id` với `onDelete: SetNull`. Nhân viên có thể có tài khoản đăng nhập hoặc không. | **SẴN SÀNG & CHUẨN XÁC**. |
| **3** | **Stock Ledger & Tồn kho hai chiều** | Bảng `inventory_balances` lưu tồn hiện thời (`quantity_on_hand`, `quantity_reserved`). Bảng `inventory_transactions` lưu sổ cái biến động (Double-entry stock ledger). Có `InventoryReservation` giữ hàng cho Sales Order. | **SẴN SÀNG VỀ SCHEMA**. Cần bổ sung CHECK constraints `quantity >= 0` tại tầng PostgreSQL DDL. |
| **4** | **PaymentTransaction & Công nợ** | Bảng `payment_transactions` liên kết chặt chẽ với `SalesOrder` và `Customer`, có `idempotency_key`, trạng thái giao dịch và số tiền Decimal(15,2). | **SẴN SÀNG VỀ SCHEMA**. Chưa có bảng `customer_debt_ledger` riêng, công nợ hiện được tổng hợp từ `SalesOrder - Payments`. |
| **5** | **Audit Log** | Bảng `audit_logs` có đầy đủ: `organization_id`, `user_id`, `module`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`. | **SẴN SÀNG VỀ SCHEMA**. Chưa có Partition DDL cho bảng bảo mật `auth_audit_logs`. |
| **6** | **Token Family & Auth Models (Phase 1D)** | 4 bảng: `user_sessions`, `token_families`, `refresh_tokens`, `auth_idempotency_records` **CHƯA ĐƯỢC THÊM** vào [prisma/schema.prisma](file:///e:/dự%20án/prisma/schema.prisma). | **CHƯA SẴN SÀNG (BLOCKER)**: Phải cập nhật schema trước khi triển khai Auth. |
| **7** | **Lịch sử Migration** | Thư mục `prisma/migrations` chỉ có đúng **1 migration**: `20261104180033_init_database_foundation` (1.303 dòng SQL). | **CẦN MIGRATION MỚI** khi đưa Phase 1D và các Hardening checks vào. |

---

## 5. TÍNH NHẤT QUÁN TÀI LIỆU KIẾN TRÚC (ARCHITECTURE & DOCS CONSISTENCY)

Đã đối chiếu 14 tài liệu kỹ thuật có trong repository:

```mermaid
graph TD
    DOC_TECH["01-technical-specification.md\n02-database-design.md"] --> DOC_DECISION["DATABASE_DESIGN_DECISIONS.md\n(Phase 1C-C Approved)"]
    DOC_DECISION --> DOC_P1D["PHASE_1D_ARCHITECTURE_BLUEPRINT.md\nPHASE_1D_DATABASE_DESIGN.md\nPHASE_1D_API_CONTRACT.md"]
    DOC_P1D --> DOC_CLEANUP["PHASE_1D_POST_SYNCHRONIZATION_CLEANUP_REPORT.md\n(Part 1 Verified)"]
    DOC_CLEANUP --> DOC_ROADMAP["BIZPRO_IMPLEMENTATION_STRATEGY.md\nBIZPRO_MASTER_IMPLEMENTATION_ROADMAP.md"]
```

### Đánh giá tính nhất quán:
1. **Sự đồng thuận tuyệt đối giữa Phase 1C-C và Phase 1D:**
   - [DATABASE_DESIGN_DECISIONS.md](file:///e:/dự%20án/docs/DATABASE_DESIGN_DECISIONS.md) đã chốt 50 models cơ sở và quy tắc `onDelete: Restrict` cho các chứng từ nghiệp vụ.
   - [PHASE_1D_DATABASE_DESIGN.md](file:///e:/dự%20án/docs/PHASE_1D_DATABASE_DESIGN.md) mở rộng bổ sung 4 bảng bảo mật phân tầng (Token Family, Session, Idempotency) và 43 RLS Policies.
   - [PHASE_1D_POST_SYNCHRONIZATION_CLEANUP_REPORT.md](file:///e:/dự%20án/docs/PHASE_1D_POST_SYNCHRONIZATION_CLEANUP_REPORT.md) đã giải quyết triệt để 2 nghi vấn kiến trúc cuối cùng (Anti-cycle invariant & Prisma `$queryRaw` với `is_local = true`).
2. **Không có xung đột tài liệu:** Toàn bộ các tài liệu hiện hành đều thống nhất sử dụng kiến trúc Clean Architecture cho NestJS, RLS cho PostgreSQL, và App Router cho Next.js 15.

---

## 6. TRẠNG THÁI ĐIỀU KIỆN TIÊN QUYẾT PHASE 1C-C & PHASE 1D

| Hạng mục tiên quyết | Tài liệu tham chiếu | Trạng thái kỹ thuật | Đánh giá nghiệm thu |
| :--- | :--- | :---: | :--- |
| **Phase 1C-C: Database Hardening Decisions** | `docs/DATABASE_DESIGN_DECISIONS.md` | **APPROVED IN DESIGN** | Đã chốt: Composite FKs, Check Constraints, Restrict rules, Decimal precision. Sẵn sàng đưa vào migration. |
| **Phase 1D: Architecture Blueprint** | `docs/PHASE_1D_ARCHITECTURE_BLUEPRINT.md` | **APPROVED IN DESIGN** | Đã chốt: Dual-Token, Token Family, AES-256-GCM Envelope, Fail-Closed RLS. |
| **Phase 1D: Database Design & RLS DDL** | `docs/PHASE_1D_DATABASE_DESIGN.md` | **APPROVED IN DESIGN** | Đã định nghĩa 4 tables bảo mật và DDL cho 43 tenant policies. |
| **Phase 1D: API Contract** | `docs/PHASE_1D_API_CONTRACT.md` | **APPROVED IN DESIGN** | Đã chuẩn hóa 5 endpoints `/api/v1/auth/*` theo RFC 7807. |
| **Phase 1D: Threat Model & Test Plan** | `docs/PHASE_1D_SECURITY_THREAT_MODEL.md` | **APPROVED IN DESIGN** | Đã bao phủ 11 kịch bản tấn công: Replay, Session Fixation, TOCTOU, RLS Bypass. |
| **Phase 1D: Post-Sync Cleanup Verification** | `docs/PHASE_1D_POST_SYNCHRONIZATION_CLEANUP_REPORT.md`| **VERIFIED & CLOSED** | Đã xác nhận: Anti-cycle Trigger requirement và Prisma `$queryRaw` `is_local=true`. |

---

## 7. PHÂN LOẠI CÁC VẤN ĐỀ: BLOCKER / MANAGED RISK / IMPLEMENTATION REQUIREMENT

Dựa trên nguyên tắc kỹ thuật không thỏa hiệp:

### 7.1. CÁC ĐIỂM NGHẼN BẮT BUỘC XỬ LÝ (BLOCKERS)
*Những vấn đề này bắt buộc phải giải quyết xong trước khi được phép viết mã nguồn nghiệp vụ:*

- **`BLOCKER-01` — Môi trường PostgreSQL Runtime đang Offline:**  
  *Bằng chứng:* Docker Desktop chưa chạy, cổng 5432 chưa mở, `DATABASE_URL` trong [backend/.env](file:///e:/dự%20án/backend/.env) không thể kết nối.  
  *Biện pháp giải quyết:* Bật Docker Desktop service, khởi chạy container `bizpro_postgres` qua lệnh `docker compose up -d postgres`, kiểm tra kết nối bằng `pg_isready`.
- **`BLOCKER-02` — Thiếu 4 Models Bảo mật Phase 1D trong `schema.prisma`:**  
  *Bằng chứng:* Các bảng `user_sessions`, `token_families`, `refresh_tokens`, `auth_idempotency_records` chưa có trong [prisma/schema.prisma](file:///e:/dự%20án/prisma/schema.prisma).  
  *Biện pháp giải quyết:* Bổ sung 4 models này vào `schema.prisma` và tạo Prisma Migration thứ hai (`20261106000000_phase_1d_security_foundation`) trước khi viết `AuthModule`.

### 7.2. CÁC RỦI RO ĐÃ ĐƯỢC QUẢN LÝ (MANAGED RISKS)
*Những rủi ro đã có giải pháp thiết kế khả thi, không ngăn cản việc mở Gate nếu tuân thủ quy trình:*

- **`RISK-01` — Nguy cơ rò rỉ Connection Pool Setting khi dùng RLS:**  
  *Biện pháp kiểm soát:* Đã quy định rõ ràng trong [PHASE_1D_POST_SYNCHRONIZATION_CLEANUP_REPORT.md](file:///e:/dự%20án/docs/PHASE_1D_POST_SYNCHRONIZATION_CLEANUP_REPORT.md): Mọi lệnh thiết lập tenant context phải dùng `tx.$queryRaw` với `is_local = true` bên trong Interactive Transaction của Prisma.
- **`RISK-02` — Migration Drift & Database Desynchronization:**  
  *Biện pháp kiểm soát:* Đóng băng schema, tuyệt đối không chỉnh sửa migration cũ `20261104180033_init_database_foundation`. Mọi thay đổi mới phải đi qua quy trình `prisma migrate dev --create-only` để review SQL trước khi áp dụng.
- **`RISK-03` — Sự gián đoạn UI khi chuyển đổi từ Mock Data sang Real API:**  
  *Biện pháp kiểm soát:* Triển khai từng trang (Vertical Slice Wire-up). Trang nào có API Backend hoàn thiện sẽ được đấu nối API thật, trang chưa có API vẫn giữ nguyên để không làm gãy luồng trải nghiệm tổng thể.

### 7.3. CÁC YÊU CẦU BẮT BUỘC TRONG QUÁ TRÌNH TRIỂN KHAI (IMPLEMENTATION REQUIREMENTS)
*Các tiêu chuẩn kỹ thuật bắt buộc phải có trong code và bài test:*

- **`REQ-01` — Chặn nhập sai định dạng Việt Nam (Mã số thuế & Số điện thoại):**  
  Phải có Regex Validation ở cả 2 đầu (Frontend Zod + Backend Class-Validator DTO). Chặn tuyệt đối ký tự chữ ("đá") trong MST; MST phải là 10 hoặc 13 số tự nhiên (`/^\d{10}(-\d{3})?$/`). Số điện thoại phải chuẩn `+84` hoặc 10 chữ số nội địa (`/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/`).
- **`REQ-02` — Hệ thống Phản hồi Trực quan Bắt buộc (Toast Notifications):**  
  Mọi thao tác thay đổi trạng thái (Tạo, Sửa, Xóa, Xác nhận đơn, Hủy, Duyệt phép, Đăng nhập) phải bắn Toast nổi trên màn hình: Xanh (Success) hoặc Đỏ (Error kèm message chi tiết từ RFC 7807).
- **`REQ-03` — Khóa Bi quan (Pessimistic Locking) Chống Bán Âm Kho:**  
  Khi xác nhận Đơn bán hàng (Confirm Sales Order), backend phải chạy transaction với `SELECT ... FOR UPDATE` trên bảng `inventory_balances` để kiểm tra tồn khả dụng và khóa giữ hàng (`quantity_reserved`). Thiếu hàng phải rollback ngay lập tức.
- **`REQ-04` — Dynamic RBAC & Fail-Closed Guard:**  
  Tất cả Controller backend (ngoại trừ Health và Auth public) phải được bọc bởi `JwtAuthGuard` và `PermissionsGuard`. Thiếu token $\to$ 401 Unauthorized; thiếu quyền $\to$ 403 Forbidden.

---

## 8. DANH SÁCH FILE VÀ THÀNH PHẦN CẦN THAY ĐỔI (FILE & COMPONENT IMPACT LIST)

Khi Implementation Gate được mở, các file sau đây sẽ được bổ sung và cập nhật:

### 8.1. Database & Schema
- `prisma/schema.prisma`: Thêm 4 models (`UserSession`, `TokenFamily`, `RefreshToken`, `AuthIdempotencyRecord`).
- `prisma/migrations/20261106000000_phase_1d_security_foundation/migration.sql`: File migration mới chứa DDL 4 bảng, RLS DDL cho 43 bảng và Trigger `prevent_token_tree_mutation`.

### 8.2. Backend NestJS
- `backend/package.json`: Cài đặt thêm các dependencies:
  - `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt`
  - `@nestjs/throttler` (chống DDoS & brute-force)
  - `cookie-parser`, `@types/cookie-parser`
- `backend/src/app.module.ts`: Import `AuthModule`, `ThrottlerModule`.
- `backend/src/prisma/prisma.service.ts`: Bổ sung hàm transaction runner `runInTenantContext(tenantId, fn)`.
- Tạo mới các thư mục Domain Module trong `backend/src/`:
  - `auth/`: `auth.controller.ts`, `auth.service.ts`, `refresh-token.service.ts`, `jwt.strategy.ts`, `guards/`, `dto/`
  - `organization/`: `organization.controller.ts`, `organization.service.ts`, `dto/`
  - `users/`: `users.controller.ts`, `users.service.ts`, `dto/`
  - `inventory/`: `inventory.controller.ts`, `inventory.service.ts`, `stock-movement.service.ts`
  - `crm/`: `crm.controller.ts`, `lead.service.ts`, `customer.service.ts`, `deal.service.ts`
  - `sales/`: `sales.controller.ts`, `sales-order.service.ts`, `reservation.service.ts`
  - `hrm/`: `hrm.controller.ts`, `employee.service.ts`, `attendance.service.ts`, `leave.service.ts`

### 8.3. Frontend Next.js
- `frontend/package.json`: Cài đặt thêm:
  - `zod`, `react-hook-form`, `@hookform/resolvers` (Form validation chuẩn mực)
  - `sonner` hoặc component Toast nổi cao cấp
  - `axios` hoặc wrapper `api-client` xử lý silent refresh token
- `frontend/src/lib/api-client.ts`: HTTP client trung tâm bắt lỗi 401 tự động refresh.
- `frontend/src/middleware.ts`: Next.js Route Guard bảo vệ các trang nội bộ.
- `frontend/src/context/AppContext.tsx`: Loại bỏ 1.698 dòng mock state, chuyển sang dùng Server State qua API client.
- Tích hợp Toast Container vào `frontend/src/app/layout.tsx`.

---

## 9. KẾ HOẠCH PHÂN RÃ CÔNG VIỆC TRIỂN KHAI (IMPLEMENTATION TASK BREAKDOWN)

Chi tiết thứ tự 7 giai đoạn triển khai kế thừa từ [BIZPRO_MASTER_IMPLEMENTATION_ROADMAP.md](file:///e:/dự%20án/docs/BIZPRO_MASTER_IMPLEMENTATION_ROADMAP.md):

```mermaid
flowchart TD
    T0["Phase 0: Readiness Audit & Docker Postgres Setup (Hiện tại)"] --> T1["Phase 2A: Authentication & Security Foundation"]
    T1 --> T2["Phase 2B: Multi-Tenant & Master Data Management"]
    T2 --> T3["Phase 2C: Inventory Management Core"]
    T3 --> T4["Phase 2D: CRM & Customer Intelligence"]
    T4 --> T5["Phase 2E: Sales Orders & Fulfillment Integration"]
    T2 --> T6["Phase 2F: HRM & Workforce Management"]
    T5 & T6 --> T7["Phase 2G: Cross-Module Integration, Observability & Hardening"]
```

1. **Phase 2A — Authentication & Security Foundation (Ước tính: Bước khởi đầu bắt buộc):**
   - *Database:* Bổ sung 4 models Phase 1D, chạy migration, kích hoạt PostgreSQL RLS trên 43 bảng.
   - *Backend:* Triển khai `AuthModule`, AES-256-GCM Envelope Encryption cho refresh response, Token Family Rotation, Idempotency Middleware 120s.
   - *Frontend:* Màn hình đăng nhập thật, lưu session cookie, Silent Token Refresh.
2. **Phase 2B — Multi-Tenant & Master Data:**
   - Quản lý Tổ chức, Tài khoản User, Phân quyền động (Dynamic RBAC với 50+ Permissions), Audit Log tự động qua Interceptor.
   - Đấu nối trang `/settings`, form validate MST và SĐT Việt Nam, Floating Toast.
3. **Phase 2C — Inventory Management Core:**
   - Danh mục Sản phẩm, Kho, Đơn vị tính, Thẻ kho hai chiều (`inventory_transactions`), Pessimistic Locking chống âm kho.
   - Đấu nối trang `/inventory/products`, `/inventory/receipts-issues`, `/inventory/stocktakes`.
4. **Phase 2D — CRM & Customer Intelligence:**
   - Quản lý Lead, Khách hàng cá nhân/doanh nghiệp, Chuyển đổi Lead 1-transaction, Pipeline Kanban Deals.
   - Đấu nối trang `/crm/leads`, `/crm/customers`, `/crm/deals`.
5. **Phase 2E — Sales Orders & Fulfillment Integration:**
   - Đơn bán hàng, State Machine, Tự động khóa giữ tồn kho (`InventoryReservation`), Xuất kho giao hàng, Theo dõi công nợ.
   - Đấu nối trang `/sales/orders`, `/sales/customers`.
6. **Phase 2F — HRM & Workforce Management:**
   - Hồ sơ Nhân viên, Chấm công chuẩn thời gian thực, Phê duyệt nghỉ phép và trừ quỹ phép.
   - Đấu nối trang `/hrm/employees`, `/hrm/attendance`, `/hrm/leave`.
7. **Phase 2G — Cross-Module Integration & Hardening:**
   - Event-driven internal bus, Đấu nối Dashboard tổng quan số liệu thật, Báo cáo BI `/reports`, E2E test full flow.

---

## 10. KẾ HOẠCH THỰC THI DATABASE VÀ DỮ LIỆU THẬT (DATABASE & REAL DATA EXECUTION PLAN)

### 10.1. Chiến lược Kết nối & Quản trị PostgreSQL:
- **Chuỗi kết nối (Connection String):** Lưu tại [backend/.env](file:///e:/dự%20án/backend/.env), tuyệt đối không hardcode trong mã nguồn:
  ```env
  DATABASE_URL="postgresql://bizpro_user:bizpro_password@localhost:5432/bizpro_db?schema=public"
  ```
- **Kích hoạt Service:** Khởi động Docker Desktop $\to$ Chạy `docker compose up -d postgres` $\to$ Xác nhận container `bizpro_postgres` đạt trạng thái `healthy`.

### 10.2. Chiến lược Migration Không Phá Hủy (Non-destructive Migration):
- Giữ nguyên migration gốc `20261104180033_init_database_foundation`.
- Tạo migration mới tuần tự bằng lệnh:
  ```bash
  cd backend
  npx prisma migrate dev --name phase_1d_security_foundation
  ```
- Luôn kiểm tra file SQL sinh ra trước khi commit vào git.

### 10.3. Chiến lược Dữ liệu Mồi Hệ thống (System Seed vs Business Data):
- **TUYỆT ĐỐI KHÔNG TẠO DỮ LIỆU NGHIỆP VỤ GIẢ:** Không tự sinh đơn hàng, khách hàng, sản phẩm giả lập.
- **DỮ LIỆU HỆ THỐNG ĐƯỢC PHÉP SEED:**
  - 50+ System Permissions chuẩn doanh nghiệp.
  - 4 Vai trò mặc định: `SUPER_ADMIN`, `ORG_ADMIN`, `MANAGER`, `STAFF`.
  - 1 Tổ chức mẫu ban đầu (`BizPro Enterprise`) và 1 tài khoản quản trị hệ thống (`admin@bizpro.vn`) phục vụ việc đăng nhập lần đầu. Mọi dữ liệu khách hàng, sản phẩm, đơn hàng sau đó phải do người dùng tự tạo qua giao diện thật.

---

## 11. CHIẾN LƯỢC KIỂM THỬ & XÁC MINH CHẤT LƯỢNG (TESTING & VERIFICATION STRATEGY)

Áp dụng Kim tự tháp kiểm thử phần mềm Enterprise:

```
          / \
         / E2E \       --> Playwright (10 kịch bản nghiệp vụ xuyên suốt)
        /-------\
       / Integr. \     --> Supertest + Real PostgreSQL + RLS Tenant Context
      /-----------\
     /  Unit Tests \   --> Jest (Mọi Service, DTO Validation Regex, Token Envelope)
    /---------------\
```

1. **Unit Testing:**
   - Test regex kiểm tra MST Việt Nam: Chấp nhận `0109988776`, `0109988776-001`, từ chối `0109988776đá`, `123`.
   - Test regex kiểm tra Số điện thoại: Chấp nhận `+84912345678`, `0912345678`, từ chối `12345`.
   - Test thuật toán mã hóa/giải mã AES-256-GCM Envelope Encryption (CSPRNG 96-bit nonce, AAD canonical binary encoding).
2. **Integration Testing:**
   - Test Token Replay Attack: Dùng lại Refresh Token cũ $\to$ xác nhận toàn bộ Token Family bị thu hồi (HTTP 401).
   - Test RLS Tenant Isolation: Truy vấn từ Tenant B không thể đọc bản ghi của Tenant A ngay cả khi biết chính xác UUID (Trả về rỗng).
   - Test Concurrency Bán âm kho: Bắn 20 request xác nhận đơn đồng thời cho sản phẩm tồn kho = 10 $\to$ đúng 10 request thành công, 10 request lỗi hết hàng.
3. **E2E Testing:**
   - Kịch bản liên module: Đăng nhập $\to$ Tạo Khách hàng $\to$ Tạo Deal $\to$ Chốt Deal $\to$ Tạo Đơn hàng $\to$ Giữ hàng kho $\to$ Xuất kho $\to$ Kiểm tra trừ tồn kho và ghi sổ cái giao dịch.

---

## 12. KHUYẾN NGHỊ VỀ IMPLEMENTATION GATE (GATE RECOMMENDATION)

### Đánh giá của Senior Technical Lead & Architect:
- **Tình trạng:** Khâu chuẩn bị tài liệu, thiết kế kiến trúc, DDL RLS, và kế hoạch di trú đã đạt độ chín muồi và tính khả thi 100%.
- **Trạng thái Gate đề xuất:** **`NOT APPROVED (HOLD)`** tại thời điểm hiện tại.
- **Điều kiện mở Gate (Criteria to Open Implementation Gate):**
  1. Docker Desktop service được khởi động trên máy trạm Windows và container `bizpro_postgres` sẵn sàng lắng nghe cổng `5432`.
  2. Báo cáo kiểm toán Phase 0 này được Tech Lead / User phê duyệt chính thức.

---

## 13. CHÍNH XÁC MỘT NHIỆM VỤ TRIỂN KHAI TIẾP THEO (NEXT EXECUTABLE TASK)

Sau khi phê duyệt báo cáo kiểm toán này và cấp lệnh mở Gate, **chính xác một nhiệm vụ duy nhất tiếp theo** có thể thực thi ngay lập tức là:

### **TASK 2A-01: KHỞI TẠO MÔI TRƯỜNG POSTGRESQL & BỔ SUNG 4 MODELS PHASE 1D VÀO PRISMA SCHEMA**
- **Mục tiêu:** 
  1. Khởi động container PostgreSQL qua Docker Compose (`docker compose up -d postgres`) và xác nhận kết nối `pg_isready`.
  2. Cập nhật [prisma/schema.prisma](file:///e:/dự%20án/prisma/schema.prisma) bổ sung 4 models bảo mật Phase 1D (`UserSession`, `TokenFamily`, `RefreshToken`, `AuthIdempotencyRecord`).
  3. Tạo migration an toàn `phase_1d_security_foundation` qua Prisma CLI.
- **Tiêu chí hoàn thành (DoD):** Migration chạy thành công vào PostgreSQL thật, 4 bảng bảo mật được khởi tạo vật lý với đầy đủ khóa chính, khóa ngoại, unique constraints và partial index.
