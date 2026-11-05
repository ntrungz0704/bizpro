# BIZPRO+ PHASE 1D — TEST PLAN & QUALITY ASSURANCE STRATEGY
**Tài liệu:** `docs/PHASE_1D_TEST_PLAN.md`  
**Phiên bản:** 2.0.0 (Comprehensive Cross-Document Architecture Revision)  
**Tác giả:** Senior QA Engineer & Security Architect  
**Trạng thái tài liệu:** DRAFT SPECIFICATION FOR ARCHITECTURAL REVIEW (DESIGN ONLY)  
**Gate Status:** NOT APPROVED — Awaiting Independent Multi-Agent Review  
**Công cụ kiểm thử mục tiêu:** Vitest / Jest, Supertest, PostgreSQL 16 Test Container, k6 / Autocannon  

---

## 1. MỤC TIÊU & NGUYÊN TẮC KIỂM THỬ AN NINH

1. **Bảo toàn Invariant Database Phase 1C-C:** Mọi bài test Authentication & RBAC tuyệt đối không được làm sai lệch hoặc vô hiệu hóa các Invariant vật lý đã được nghiệm thu (11 CHECK constraints, Composite FKs, Trigger Snapshot, User-Employee 1-1).
2. **Kiểm thử trên Môi trường Cơ sở Dữ liệu Thực:** Không dùng Mock/Stub cho PostgreSQL; 100% test tích hợp và concurrency phải chạy trực tiếp trên PostgreSQL 16 container.
3. **Cấu trúc chuẩn mực của Test Case:** Mọi ca kiểm thử bắt buộc phải có đầy đủ 8 trường thuộc tính:
   `Test ID` | `Preconditions` | `Input` | `Execution Steps` | `Expected HTTP Response` | `Expected Database State` | `Expected Security Event` | `Expected Authorization Result`
4. **Loại bỏ số liệu hiệu năng suy đoán:** Không đưa ra các con số P95 vô căn cứ. Toàn bộ chỉ số về độ trễ Argon2id, Memory footprint và khả năng chịu tải đồng thời phải được xác định thông qua **Kế hoạch Benchmark (Benchmark Plan)** trên phần cứng mục tiêu.

---

## 2. MA TRẬN TEST CASES TOÀN DIỆN (COMPREHENSIVE TEST MATRIX)

### 2.1. Nhóm 1: Authentication & Account Lifecycle

| Thuộc tính | Chi tiết kiểm thử TC-AUTH-01 (Đăng nhập sai quá 5 lần) | Chi tiết kiểm thử TC-AUTH-02 (Timing Attack Defense) |
| :--- | :--- | :--- |
| **Test ID** | **TC-AUTH-01: Brute-Force Account Lockout** | **TC-AUTH-02: Constant-Time Dummy Verification** |
| **Preconditions** | User `admin@bizpro.vn` ở trạng thái `ACTIVE`, `failed_login_attempts = 0`, `locked_until = NULL`. | User `nonexistent@bizpro.vn` không tồn tại trong hệ thống. |
| **Input** | `POST /api/v1/auth/login` với email đúng nhưng mật khẩu sai 5 lần liên tiếp. | 100 requests `POST /api/v1/auth/login` với email tồn tại và 100 requests với email không tồn tại. |
| **Execution Steps**| 1. Gọi login 4 lần với mật khẩu sai.<br/>2. Kiểm tra `failed_login_attempts`.<br/>3. Gọi login lần thứ 5.<br/>4. Gọi login lần thứ 6. | 1. Đo thời gian phản hồi (latency) của 100 request email thật (sai pass).<br/>2. Đo thời gian phản hồi của 100 request email không tồn tại.<br/>3. So sánh độ lệch chuẩn phân phối thời gian. |
| **Expected HTTP** | - Lần 1-4: `401 Unauthorized` (`AUTH_INVALID_CREDENTIALS`).<br/>- Lần 5: `401 Unauthorized`.<br/>- Lần 6: `423 Locked` (`AUTH_ACCOUNT_LOCKED`). | Toàn bộ 200 requests đều trả về `401 Unauthorized` (`AUTH_INVALID_CREDENTIALS`). |
| **Expected DB State** | `users.failed_login_attempts = 5`, `users.locked_until = NOW() + 15 minutes`. | `users` không bị thay đổi dữ liệu bất thường. |
| **Expected Event** | `AUTH_LOGIN_FAILED` (4 lần), `AUTH_ACCOUNT_LOCKED` (lần 5). | `AUTH_LOGIN_FAILED` với metadata ghi rõ lý do. |
| **Auth Result** | Bị từ chối truy cập tuyệt đối cho đến khi hết thời hạn `locked_until`. | Bị từ chối truy cập. Thời gian phản hồi cân bằng (không chênh lệch > 15%). |

---

### 2.2. Nhóm 2: Token Family Refresh, Rotation & Reuse Detection

| Thuộc tính | Chi tiết kiểm thử TC-RTR-01 (Xoay vòng Token Hợp lệ) | Chi tiết kiểm thử TC-RTR-02 (Targeted Reuse Detection) |
| :--- | :--- | :--- |
| **Test ID** | **TC-RTR-01: Token Family Sequential Rotation** | **TC-RTR-02: Targeted Token Family Revocation on Reuse** |
| **Preconditions** | UserSession A đang `ACTIVE`, sở hữu `token_family_id = F1`. `refresh_tokens` có Token 1 (`status = 'ACTIVE'`). | Token 1 (`F1`) đã được xoay vòng sang Token 2 (`F1`). Token 1 hiện có `status = 'ROTATED'` đã quá 5 giây. |
| **Input** | `POST /api/v1/auth/refresh` gửi kèm Cookie `bizpro_refresh_token = Token 1`. | Kẻ tấn công gửi `POST /api/v1/auth/refresh` với Cookie `bizpro_refresh_token = Token 1` (Replay Attack). |
| **Execution Steps**| 1. Client gửi request refresh.<br/>2. DB thực thi transaction với khóa bi quan `SELECT ... FOR UPDATE`.<br/>3. Cập nhật trạng thái và tạo token mới. | 1. Kẻ tấn công gửi Token 1 cũ.<br/>2. Server khóa dòng, phát hiện Token 1 đã `ROTATED` quá 5s.<br/>3. Kích hoạt thu hồi toàn bộ Token Family `F1`. |
| **Expected HTTP** | `200 OK` { accessToken, expiresIn: 900 }. Header `Set-Cookie` chứa Token 2 mới. | `401 Unauthorized` (`AUTH_TOKEN_REUSE_DETECTED`). |
| **Expected DB State** | - Token 1: `status = 'ROTATED'`, `rotated_at = NOW()`, `replaced_by_token_id = Token 2.id`.<br/>- Token 2: `status = 'ACTIVE'`, `seq = 2`, `family = F1`. | - Toàn bộ tokens thuộc `token_family_id = F1` (Token 1, Token 2) chuyển `status = 'REVOKED'`.<br/>- `UserSession A.status = 'REVOKED'`, `revocation_reason = 'TOKEN_REUSE_ATTACK'`.<br/>- Các session khác của User trên thiết bị khác **VẪN GIỮ NGUYÊN ACTIVE**. |
| **Expected Event** | `AUTH_TOKEN_ROTATED` (kèm `sessionId`, `familyId`, `seq: 2`). | `AUTH_SECURITY_ALERT: TOKEN_REUSE_DETECTED` (Severity: CRITICAL). |
| **Auth Result** | Cấp quyền phiên tiếp tục hoạt động an toàn. | Toàn bộ chuỗi phiên bị thu hồi tức thì. Cả kẻ tấn công và nạn nhân trên thiết bị này đều không thể refresh tiếp. |

---

### 2.3. Nhóm 3: Concurrency, Atomic Locks & Idempotent Retry

| Thuộc tính | Chi tiết kiểm thử TC-CONC-01 (Parallel Refresh Race Condition) | Chi tiết kiểm thử TC-CONC-02 (Network Timeout Idempotent Retry) |
| :--- | :--- | :--- |
| **Test ID** | **TC-CONC-01: Concurrent Refresh Race Condition Resolution** | **TC-CONC-02: Idempotent Retry within 5s Grace Window** |
| **Preconditions** | Session A có Token 1 (`ACTIVE`). | Token 1 vừa được xoay vòng sang Token 2 cách đây 2 giây (`rotated_at = NOW() - 2s`). |
| **Input** | Gửi đồng thời **10 requests** `POST /api/v1/auth/refresh` cùng lúc bằng chính xác chuỗi `Token 1`. | Client gửi lại `POST /api/v1/auth/refresh` với `Token 1` (do client bị timeout mạng không nhận được response trước). |
| **Execution Steps**| 1. Bắn đồng thời 10 HTTP requests trong cùng 1 millisecond.<br/>2. PostgreSQL xử lý hàng đợi transaction thông qua `SELECT ... FOR UPDATE`. | 1. Client gửi lại Token 1 trong vòng 2s từ cùng một IP/User-Agent.<br/>2. Server tra cứu phát hiện `status = 'ROTATED'` nhưng $\le 5\text{s}$.<br/>3. Server đọc `replaced_by_token_id` = Token 2. |
| **Expected HTTP** | - 1 request đầu tiên: `200 OK` (cấp Token 2).<br/>- 9 requests tiếp theo đến trong vòng 5s: `200 OK` (Idempotent response) HOẶC an toàn mà **KHÔNG KÍCH HOẠT NHẦM REUSE DETECTION**. | `200 OK` (Cấp lại Access Token mới tương ứng phiên hiện tại, không tạo token nhánh). |
| **Expected DB State** | Đúng 1 bản ghi token mới (Token 2) được tạo ra. Không có token con trùng lặp (`sequence_number = 2` duy nhất). | Không tạo thêm bản ghi token mới trong `refresh_tokens`. Trạng thái gia đình token giữ nguyên vẹn. |
| **Expected Event** | 1 `AUTH_TOKEN_ROTATED`, các request sau ghi nhận `AUTH_REFRESH_IDEMPOTENT_HIT`. | `AUTH_REFRESH_IDEMPOTENT_RETRY`. |
| **Auth Result** | Hệ thống duy trì tính toàn vẹn phiên, không gây ra lỗi giả lập đăng xuất người dùng. | Client phục hồi phiên thành công sau sự cố chập chờn mạng. |

---

### 2.4. Nhóm 4: Immediate Access Token Revocation via `auth_version`

| Thuộc tính | Chi tiết kiểm thử TC-REV-01 (Đổi mật khẩu vô hiệu hóa tức thời) | Chi tiết kiểm thử TC-REV-02 (Admin tước quyền tài khoản) |
| :--- | :--- | :--- |
| **Test ID** | **TC-REV-01: Immediate Revocation on Password Change** | **TC-REV-02: Immediate Role Demotion & Lockout** |
| **Preconditions** | User đăng nhập, sở hữu Access Token A (`ver: 1`, còn hạn 14 phút). `users.auth_version = 1`. | User đăng nhập có quyền `sales.orders.approve` trong JWT Access Token B (`ver: 1`). |
| **Input** | User gọi `POST /api/v1/auth/change-password` từ Thiết bị 1. Sau đó từ Thiết bị 2 dùng Token A gọi `GET /api/v1/sales/orders`. | Admin tước vai trò Trưởng phòng của User. Sau đó User dùng Token B gọi `POST /api/v1/sales/orders/ord_123/approve`. |
| **Execution Steps**| 1. Thiết bị 1 đổi pass thành công.<br/>2. Thiết bị 2 gửi request với Token A cũ. | 1. Admin gọi API xóa vai trò của User, hệ thống tăng `auth_version`.<br/>2. User cố tình gửi request phê duyệt bằng Token B cũ. |
| **Expected HTTP** | - Đổi pass: `200 OK`.<br/>- Gọi đơn hàng từ Thiết bị 2: `401 Unauthorized` (`AUTH_TOKEN_REVOKED`). | `401 Unauthorized` (`AUTH_TOKEN_REVOKED`). |
| **Expected DB State** | `users.auth_version = 2`, `users.password_changed_at = NOW()`. | `users.auth_version = 2`, `user_roles` bị xóa bản ghi tương ứng. |
| **Expected Event** | `AUTH_PASSWORD_CHANGED`, `AUTH_TOKEN_REJECTED_VERSION_MISMATCH`. | `USER_ROLE_REVOKED`, `AUTH_TOKEN_REJECTED_VERSION_MISMATCH`. |
| **Auth Result** | Token A bị từ chối ngay lập tức dù thời hạn `exp` còn hiệu lực. | Thao tác phê duyệt bị chặn đứng tức thì, không bị độ trễ 15 phút của stateless JWT. |

---

### 2.5. Nhóm 5: Resource-Specific Data Scope & Multi-Tenant Isolation

| Thuộc tính | Chi tiết kiểm thử TC-SCOPE-CRM (CRM Deal Ownership) | Chi tiết kiểm thử TC-SCOPE-INV (Kho hàng Assignment) | Chi tiết kiểm thử TC-TENANT-RAW (Raw SQL & Nested Write) |
| :--- | :--- | :--- | :--- |
| **Test ID** | **TC-SCOPE-CRM: Deal Access Boundary** | **TC-SCOPE-INV: Warehouse Staff Boundary** | **TC-TENANT-01: Nested Write & Raw SQL Isolation** |
| **Preconditions** | Deal 1 thuộc User A phụ trách (`assigned_to = emp_A`). Deal 2 thuộc User B phụ trách (`assigned_to = emp_B`). Cả 2 cùng thuộc Org 1. | Kho 1 và Kho 2 cùng thuộc Org 1. User C chỉ được phân công quản lý Kho 1 trong `warehouse_staff`. | Đơn hàng 101 thuộc Org 1. Khách hàng 999 thuộc Org 2. |
| **Input** | User A gọi `GET /api/v1/crm/deals/deal_2` (Deal của đồng nghiệp B). | User C gọi `POST /api/v1/inventory/receipts` tạo phiếu nhập cho Kho 2. | User Org 1 cố ý tạo đơn hàng lồng nhau liên kết với khách hàng Org 2 (`connect: { id: cust_Org2 }`). |
| **Execution Steps**| 1. User A gửi request.<br/>2. `ResourceScopePolicyEngine` kiểm tra quyền sở hữu deal. | 1. User C gửi request nhập kho.<br/>2. Inventory Policy kiểm tra bảng phân công kho. | 1. Service Layer kiểm tra tenant boundary của quan hệ lồng nhau.<br/>2. Database áp dụng Composite FK. |
| **Expected HTTP** | `404 Not Found` (hoặc `403 Forbidden: AUTH_FORBIDDEN_SCOPE`). | `403 Forbidden` (`AUTH_FORBIDDEN_SCOPE`: "Bạn không được phân công quản lý kho này"). | `403 Forbidden` (`AUTH_TENANT_MISMATCH`) hoặc PostgreSQL Foreign Key Violation `23503`. |
| **Expected DB State**| Không có thay đổi dữ liệu. Không lộ lọt dữ liệu Deal 2. | Không có phiếu nhập nào được tạo trong Kho 2. | Đơn hàng không được tạo. Database từ chối liên kết chéo tổ chức. |
| **Expected Event** | `SECURITY_DATA_SCOPE_ACCESS_DENIED`. | `SECURITY_WAREHOUSE_UNAUTHORIZED_ACCESS`. | `SECURITY_CROSS_TENANT_ACCESS_ATTEMPT` (Alert). |
| **Auth Result** | Nhân viên kinh doanh không thể xem trộm deal của người khác. | Thủ kho không thể can thiệp tồn kho của kho khác ngoài thẩm quyền. | Ranh giới dữ liệu đa tổ chức được bảo vệ an toàn ở cả tầng Service và Database. |

---

## 3. KẾ HOẠCH BENCHMARK HIỆU NĂNG TRÊN PHẦN CỨNG MỤC TIÊU (BENCHMARK PLAN)

Thay vì đưa ra các con số giả định, quy chuẩn Benchmark được thiết lập với phương pháp luận kiểm chứng thực tế:

### 3.1. Cấu hình Phần cứng Kiểm chuẩn Mục tiêu (Target Test Bed):
- **CPU:** 4 vCPU (x86_64 hoặc ARM64).
- **RAM:** 8 GB DDR4/DDR5.
- **Database:** PostgreSQL 16 (chạy container với cấu hình `shared_buffers = 2GB`, `work_mem = 64MB`).
- **Network:** Môi trường Localhost / Private Subnet độ trễ mạng < 1ms.

### 3.2. Nội dung các bài kiểm thử Benchmark:
1. **Benchmark Argon2id Cost Tuning:**
   - Chạy 1,000 lần hàm hash với các bộ tham số khác nhau:
     - Cấu hình 1: $m=64\text{MB}, t=3, p=4$.
     - Cấu hình 2: $m=32\text{MB}, t=2, p=2$.
   - **Chỉ tiêu đo đạc:** Thời gian CPU, lượng RAM chiếm dụng trên mỗi thread, và throughput tối đa (requests/giây) trước khi CPU đạt $80\%$.
2. **Benchmark Concurrency Refresh & Pessimistic Locking:**
   - Sử dụng công cụ k6 mô phỏng 500 Virtual Users (VUs) gửi đồng thời các request xoay vòng token trong 60 giây.
   - **Chỉ tiêu đo đạc:** Tỷ lệ Deadlock (kỳ vọng: $0\%$), thời gian chờ giữ khóa dòng (Lock acquisition time P95), và tốc độ giải phóng transaction.
3. **Benchmark Multi-Tenant Query Overhead:**
   - So sánh thời gian thực thi câu truy vấn khi qua Prisma Extension Enforced Tenancy vs Query trực tiếp không có filter.
   - **Chỉ tiêu đo đạc:** Độ trễ chênh lệch (Overhead ratio) phải $\le 5\%$.
