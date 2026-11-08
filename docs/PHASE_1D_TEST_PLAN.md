# BIZPRO+ PHASE 1D — TEST PLAN & QUALITY ASSURANCE STRATEGY
**Tài liệu:** `docs/PHASE_1D_TEST_PLAN.md`  
**Phiên bản:** 3.2.0-SYNCHRONIZED (Comprehensive Test Plan Specification)  
**Tác giả:** Principal QA Engineer, Security Architect & Performance Engineer  
**Trạng thái tài liệu:** SPECIFICATION SYNCHRONIZED — CONTROLLED DOCUMENTATION (DESIGN ONLY)  
**Gate Status:** NOT APPROVED (HOLD) — Implementation Gate Strict Preservation  
**Công cụ kiểm thử mục tiêu:** Vitest / Jest, Supertest, PostgreSQL 16 Test Container, k6 / Autocannon, Python SciPy (KS-Test)  

---

## 1. MỤC TIÊU & NGUYÊN TẮC KIỂM THỬ AN NINH

1. **Bảo Toàn Invariant Database Phase 1C-C:** Mọi bài test Authentication & RBAC tuyệt đối không được làm sai lệch hoặc vô hiệu hóa các Invariant vật lý đã được nghiệm thu (11 CHECK constraints, Composite FKs, Trigger Snapshot, User-Employee 1-1).
2. **Kiểm Thử Trên Môi Trường Cơ Sở Dữ Liệu Thực:** Không dùng Mock/Stub cho PostgreSQL; 100% test tích hợp, transaction locking và concurrency phải chạy trực tiếp trên PostgreSQL 16 container.
3. **Cấu Trúc Chuẩn Mực Của Test Case:** Mọi ca kiểm thử bắt buộc phải có đầy đủ 8 trường thuộc tính:
   `Test ID` | `Preconditions` | `Input` | `Execution Steps` | `Expected HTTP Response` | `Expected Database State` | `Expected Security Event` | `Expected Authorization Result`
4. **Kiểm Định Thống Kê Thay Vì Con Số Cảm Tính:** Kiểm thử Timing Attack bắt buộc áp dụng kiểm định giả thuyết thống kê Kolmogorov-Smirnov Test ($N=1,000, p > 0.05$).

---

## 2. MA TRẬN TEST CASES TOÀN DIỆN (COMPREHENSIVE TEST MATRIX)

### 2.1. Nhóm 1: Authentication, Lockout & Account Lifecycle

| Thuộc tính | Chi tiết kiểm thử TC-AUTH-01 (Account Lockout Thống nhất) | Chi tiết kiểm thử TC-AUTH-02 (Anti-Enumeration KS-Test) |
| :--- | :--- | :--- |
| **Test ID** | **TC-AUTH-01: Brute-Force Lockout & Fast-Path 423** | **TC-AUTH-02: Statistical KS-Test Timing Attack Defense** |
| **Preconditions** | User `admin@bizpro.vn` ở trạng thái `ACTIVE`, `failed_login_attempts = 0`, `locked_until = NULL`. | Môi trường test container mạng cục bộ (< 1ms jitter). |
| **Input** | `POST /api/v1/auth/login` với email đúng nhưng mật khẩu sai 6 lần liên tiếp. | 1,000 requests với email có thật (sai pass) và 1,000 requests với email hoàn toàn không tồn tại. |
| **Execution Steps**| 1. Gọi login 4 lần với mật khẩu sai.<br/>2. Gọi login lần thứ 5.<br/>3. Gọi login lần thứ 6 khi đang bị khóa. | 1. Thực thi 1,000 requests email thật; ghi nhận mảng latency $L_{\text{real}}$.<br/>2. Thực thi 1,000 requests email ảo; ghi nhận mảng latency $L_{\text{dummy}}$.<br/>3. Chạy hàm kiểm định 2 mẫu `scipy.stats.ks_2samp(L_real, L_dummy)`. |
| **Expected HTTP** | - Lần 1-4: `401 Unauthorized` (`AUTH_INVALID_CREDENTIALS`).<br/>- Lần 5: `423 Locked` (`AUTH_ACCOUNT_LOCKED`, có `lockedUntil`, `retryAfter: 900`).<br/>- Lần 6: `423 Locked` ngay lập tức (Fast-Path). | Toàn bộ 2,000 requests đều trả về `401 Unauthorized` (`AUTH_INVALID_CREDENTIALS`). Kiểm định KS-Test cho giá trị $p\text{-value} > 0.05$. |
| **Expected DB State** | `users.failed_login_attempts = 5`, `users.locked_until = NOW() + 15 minutes`. | Dữ liệu `users` không bị ô nhiễm. |
| **Expected Event** | `AUTH_LOGIN_FAILED` (4 lần), `AUTH_ACCOUNT_LOCKED` (lần 5). | `AUTH_LOGIN_FAILED` với thời gian xử lý cân bằng qua Dummy Argon2id hash. |
| **Auth Result** | Bị từ chối truy cập tuyệt đối cho đến khi mở khóa hoặc hết hạn. | Kẻ tấn công không thể suy diễn sự tồn tại của email qua phân phối thời gian. |

---

### 2.2. Nhóm 2: Token Family Refresh & Two-Step Idempotency Resolution

| Thuộc tính | Chi tiết kiểm thử TC-IDEMP-01 (Recovery Hợp lệ Trong 30s) | Chi tiết kiểm thử TC-IDEMP-02 (Payload Mismatch 422) | Chi tiết kiểm thử TC-IDEMP-03 (Token Reuse Phân giải) |
| :--- | :--- | :--- | :--- |
| **Test ID** | **TC-IDEMP-01: Two-Step Replay Recovery** | **TC-IDEMP-02: Same Key Different Token Mismatch** | **TC-IDEMP-03: Rotated Token Reuse Detection** |
| **Preconditions** | Token 1 vừa rotate sang Token 2 cách đây 5s. Record K tồn tại trong `auth_idempotency_records` (`expires_at > NOW()`). | Token 1 vừa rotate với Key K. Token 3 là một token khác trong cùng session. | Token 1 đã rotate sang Token 2. Kẻ tấn công gửi lại Token 1 kèm Key mới $K'$. |
| **Input** | `POST /refresh/web` gửi lại Token 1 + Header `Idempotency-Key: K`. | `POST /refresh/web` gửi Token 3 + Header `Idempotency-Key: K`. | `POST /refresh/web` gửi Token 1 + Header `Idempotency-Key: K'`. |
| **Execution Steps**| 1. Server khóa dòng Token 1 (`ROTATED`).<br/>2. Tra cứu Step 2 theo `(session_id, K)`.<br/>3. Khớp token hash và còn hạn. | 1. Server khóa dòng Token 3.<br/>2. Tra cứu Step 2 theo `(session_id, K)`.<br/>3. Phát hiện `request_token_hash` không khớp. | 1. Server khóa dòng Token 1 (`ROTATED`).<br/>2. Tra cứu Step 2 theo `(session_id, K')` $\to$ `NOT FOUND`. |
| **Expected HTTP** | `200 OK` (Replay chính xác Response gốc và Cookie Token 2). | `422 Unprocessable Entity` (`AUTH_IDEMPOTENCY_PAYLOAD_MISMATCH`). | `401 Unauthorized` (`AUTH_TOKEN_REUSE_DETECTED`). |
| **Expected DB State** | Token Family giữ nguyên trạng thái `ACTIVE`. Không tạo token mới. | Token Family giữ nguyên trạng thái `ACTIVE`. Ghi log audit. | Toàn bộ tokens trong Family chuyển `REVOKED`. `user_sessions.status = 'REVOKED'`. |
| **Expected Event** | `AUTH_IDEMPOTENT_RECOVERY_HIT`. | `AUTH_SECURITY_WARNING: IDEMPOTENCY_PAYLOAD_MISMATCH`.| `AUTH_SECURITY_ALERT: TOKEN_REUSE_DETECTED` (Critical). |
| **Auth Result** | Client phục hồi phiên thành công không bị gián đoạn. | Yêu cầu client sửa lỗi logic gửi key trùng lặp. | Chặn đứng toàn bộ chuỗi phiên của kẻ tấn công và nạn nhân. |

---

### 2.3. Nhóm 3: Mật Mã Học Envelope & Token Chain Invariants

| Thuộc tính | Chi tiết kiểm thử TC-CIPHER-01 (GCM Tag Tampering) | Chi tiết kiểm thử TC-CYCLE-01 (Strict Anti-Cycle DDL) |
| :--- | :--- | :--- |
| **Test ID** | **TC-CIPHER-01: AES-256-GCM Envelope Integrity** | **TC-CYCLE-01: Monotonic Sequence & Cycle Prevention** |
| **Preconditions** | Bản ghi Idempotency tồn tại với Ciphertext và Auth Tag hợp lệ. | Bảng `refresh_tokens` có Token 1 (`seq: 1`) và Token 2 (`seq: 2`, `replaced_by = Token 2`). |
| **Input** | Can thiệp sửa đổi đúng 1 byte trong Ciphertext, Nonce hoặc Canonical AAD. | Thực thi câu lệnh SQL thô cố tình cập nhật `Token 2.replaced_by_token_id = Token 1.id` (Tạo chu trình $1 \to 2 \to 1$). |
| **Execution Steps**| 1. Client gửi request retry hợp lệ.<br/>2. Server đọc bản ghi và tiến hành giải mã bằng `crypto.createDecipheriv`. | 1. Mở psql console.<br/>2. Chạy lệnh UPDATE vi phạm chu trình hoặc vi phạm tính đơn điệu của `sequence_number`. |
| **Expected HTTP** | Server ném ngoại lệ xác thực GCM thất bại $\to$ Trả về `401 Unauthorized` (`AUTH_ENVELOPE_DECRYPT_FAILED`). | Không áp dụng (Tầng Database chặn đứng câu lệnh). |
| **Expected DB State** | Hệ thống chuyển sang Fail-Closed: Thu hồi Token Family, bảo vệ bí mật. | PostgreSQL từ chối câu lệnh với mã lỗi `23503` (Foreign Key) hoặc vi phạm thứ tự khóa/sequence. Chu trình không thể hình thành. |
| **Expected Event** | `AUTH_SECURITY_ALERT: CIPHERTEXT_TAMPER_DETECTED`. | `DATABASE_CONSTRAINT_VIOLATION`. |
| **Auth Result** | Dữ liệu bị can thiệp không bao giờ được giải mã ra ngoài. | Cấu trúc chuỗi token duy trì vĩnh viễn là Strict Directed Linear Chain. |

---

### 2.4. Nhóm 4: TOCTOU Elimination & LISTEN/NOTIFY Safe Degradation

| Thuộc tính | Chi tiết kiểm thử TC-TOCTOU-01 (Concurrent Revoke vs Payment) | Chi tiết kiểm thử TC-LISTEN-01 (Socket Outage Safe Degradation) |
| :--- | :--- | :--- |
| **Test ID** | **TC-TOCTOU-01: Double Share-Lock TOCTOU Elimination** | **TC-LISTEN-01: LISTEN 3-Tier Health & Fail-Closed** |
| **Preconditions** | User có đơn hàng 100tr cần thanh toán. Admin chuẩn bị lệnh khóa user. | Node NestJS đang chạy bình thường với kết nối Dedicated LISTEN. |
| **Input** | Chạy 50 requests thanh toán đồng thời với 50 lệnh khóa user từ Admin. | Dùng `iptables` hoặc ngắt kết nối socket TCP giữa PostgreSQL và Node NestJS. |
| **Execution Steps**| 1. Bắn 100 concurrent transactions vào PostgreSQL.<br/>2. Giao dịch thanh toán giữ `FOR SHARE` trên `users` và `user_sessions`.<br/>3. Giao dịch Admin yêu cầu `EXCLUSIVE LOCK` trên `users`. | 1. Ngắt socket kết nối.<br/>2. Bắt đầu đếm thời gian tới khi Heartbeat Ping phát hiện lỗi.<br/>3. Kiểm tra cờ `caching_enabled` và hành vi các API xác thực tiếp theo. |
| **Expected HTTP** | Tuyệt đối **0%** giao dịch thanh toán nào được commit sau khi giao dịch Admin commit hoàn tất (Linearization Point). Các request sau bị `401 Unauthorized`. | Trong vòng tối đa $\le 18\text{s}$, instance phát hiện sự cố, tự động chuyển sang Direct DB Verification (0ms lag thu hồi). |
| **Expected DB State** | `users.auth_version = 2`, `users.status = 'LOCKED'`, `user_sessions.status = 'REVOKED'`. | Trạng thái nhất quán tuyệt đối. Nếu PostgreSQL sập hoàn toàn $\to$ Trả về `503 Service Unavailable` (Fail-Closed). |
| **Expected Event** | `PAYMENT_REJECTED_USER_REVOKED`. | `SYSTEM_ALERT: LISTEN_CONNECTION_LOST_SAFE_DEGRADED`. |
| **Auth Result** | Tiền bạc và giao dịch doanh nghiệp được bảo vệ 100% không bị rút ruột. | Không có phiên bị thu hồi nào bị bỏ lọt trong thời gian đứt kết nối. |

---

### 2.5. Nhóm 5: PostgreSQL RLS 51 Bảng & Dual-Endpoint CSRF

| Thuộc tính | Chi tiết kiểm thử TC-RLS-01 (Prisma `$queryRaw` & Child Table) | Chi tiết kiểm thử TC-CSRF-01 (Dual-Endpoint Enforcement) |
| :--- | :--- | :--- |
| **Test ID** | **TC-RLS-01: Parent-Joined RLS & Transaction Local Context** | **TC-CSRF-01: Dual-Endpoint Strict Separation** |
| **Preconditions** | Đơn hàng 101 và Chi tiết đơn 501 thuộc Org 1. User thuộc Org 2. | Cấu hình Whitelist `Origin: https://app.bizpro.vn`. |
| **Input** | User Org 2 gọi `tx.$queryRaw` với `set_config` Org 2, sau đó query `SELECT * FROM sales_order_items WHERE id = 501`. | 1. Gọi `/refresh/web` không có Header `Origin` hoặc truyền token trong Body.<br/>2. Gọi `/refresh/mobile` truyền token trong Cookie. |
| **Execution Steps**| 1. Thiết lập ngữ cảnh tenant bằng `$queryRaw`.<br/>2. PostgreSQL thực thi RLS Policy với subquery `EXISTS (SELECT 1 FROM sales_orders ...)`. | 1. WebCsrfGuard đánh giá request vào `/refresh/web`.<br/>2. Endpoint `/refresh/mobile` xử lý request. |
| **Expected HTTP** | Truy vấn trả về rỗng (0 rows) hoặc `403 Forbidden` (`AUTH_TENANT_ACCESS_DENIED`). | - Request Web: Bị từ chối ngay lập tức với `403 Forbidden` (`CSRF_ORIGIN_INVALID`) hoặc `400 Bad Request`.<br/>- Request Mobile: Bỏ qua hoàn toàn cookie, yêu cầu Bearer token. |
| **Expected DB State** | Dữ liệu Org 1 không bị đọc trộm. Ngữ cảnh tự động reset sau commit. | Không thay đổi dữ liệu. |
| **Expected Event** | `SECURITY_RLS_VIOLATION_BLOCKED`. | `CSRF_ATTACK_DETECTED`. |
| **Auth Result** | Bảo vệ cô lập dữ liệu 100% cho toàn bộ 39 bảng trực tiếp và 10 bảng con. | Loại trừ hoàn toàn nguy cơ CSRF trên Web và hỗ trợ trơn tru Native Mobile. |

---

## 3. KẾ HOẠCH BENCHMARK HIỆU NĂNG THỰC TẾ TRÊN PHẦN CỨNG MỤC TIÊU

### 3.1. Cấu hình Phần cứng Kiểm chuẩn Mục tiêu (Target Test Bed):
- **CPU:** 4 vCPU (x86_64 hoặc ARM64).
- **RAM:** 8 GB DDR4/DDR5.
- **Database:** PostgreSQL 16 Container (`shared_buffers = 2GB`, `work_mem = 64MB`).
- **Network:** Localhost / Private Subnet độ trễ mạng < 1ms.

### 3.2. Nội dung các bài kiểm thử Benchmark:
1. **Benchmark Two-Sample Kolmogorov-Smirnov Test ($N=1,000$):**
   - Đo đạc phân phối thời gian phản hồi của 1,000 requests email thật và 1,000 requests email ảo.
   - Tiêu chí nghiệm thu: Giá trị $p\text{-value} > 0.05$.
2. **Benchmark Concurrency Refresh & Pessimistic Locking:**
   - Dùng k6 mô phỏng 500 Virtual Users (VUs) gửi đồng thời các request xoay vòng token trong 60 giây.
   - Tiêu chí nghiệm thu: Tỷ lệ Deadlock = $0\%$, Lock acquisition time P95 $< 50\text{ms}$.
3. **Benchmark RLS Query Overhead trên Bảng Con:**
   - So sánh độ trễ truy vấn `sales_order_items` có RLS subquery vs không có RLS.
   - Tiêu chí nghiệm thu: Độ trễ chênh lệch Overhead $\le 5\%$.
