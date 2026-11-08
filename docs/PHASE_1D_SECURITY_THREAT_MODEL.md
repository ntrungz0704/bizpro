# BIZPRO+ PHASE 1D — SECURITY THREAT MODEL & RISK ANALYSIS
**Tài liệu:** `docs/PHASE_1D_SECURITY_THREAT_MODEL.md`  
**Phiên bản:** 3.2.0-SYNCHRONIZED (Comprehensive Security Threat Model & Risk Analysis)  
**Tác giả:** Principal Security Architect, Independent Security Reviewer & Distributed Systems Architect  
**Trạng thái tài liệu:** SPECIFICATION SYNCHRONIZED — CONTROLLED DOCUMENTATION (DESIGN ONLY)  
**Gate Status:** NOT APPROVED (HOLD) — Implementation Gate Strict Preservation  
**Tiêu chuẩn đối chiếu:** OWASP Top 10 API Security (2023), OWASP ASVS v4.0.3, NIST SP 800-63B, NIST SP 800-38D  

---

## 1. PHẠM VI BẢO MẬT & ĐỊNH DANH TÀI SẢN (ASSET TAXONOMY)

Hệ thống BizPro+ là nền tảng quản trị doanh nghiệp đa tổ chức (Multi-Tenant Modular Monolith). Các tài sản số nhạy cảm cần được bảo vệ theo nguyên tắc Defense-in-Depth:
1. **Thông tin Xác thực & Bí mật Phiên (Credentials & Secrets):** Mật khẩu người dùng (Argon2id Hashes), Refresh Tokens (Token Family Monotonic Chains), Response Envelope Encryption Keys (AES-256-GCM Shared Secret), Server HMAC OTP Secret (`SERVER_HMAC_SECRET`), JWT Signing Keys.
2. **Ngữ cảnh Định danh Tổ chức (Tenant Context):** `organization_id` phân tách dữ liệu đa doanh nghiệp.
3. **Dữ liệu Nghiệp vụ Nhạy cảm:** Đơn hàng (`sales_orders`), Giao dịch tài chính (`payment_transactions`), Cơ hội kinh doanh (`deals`), Hồ sơ nhân sự và bảng lương (`employees`, `payroll`), Tồn kho thực tế (`inventory_balances`).
4. **Nhật ký Kiểm toán (Audit Trails):** Bằng chứng pháp lý về mọi thao tác thay đổi dữ liệu, đăng nhập, phân quyền và sự kiện an ninh (Append-Only).

---

## 2. MA TRẬN MỐI ĐE DỌA THEO PHƯƠNG PHÁP STRIDE

| STRIDE Category | Tên Mối Đe Dọa | Kịch bản Tấn công Thực tế | Cấp độ Rủi ro | Giải pháp Kiểm soát Kỹ thuật (Mitigation) |
| :--- | :--- | :--- | :---: | :--- |
| **Spoofing** | JWT Signature Forgery / Weak Secret | Giả mạo token hoặc khai thác khóa yếu. | **CRITICAL** | Khóa bí mật đối xứng 256-bit tạo bởi CSPRNG; Cố định giải thuật `HS256`; Chặn tuyệt đối `alg: none`; Kiểm tra `iss`, `aud`, và `ver` khớp `users.auth_version`. |
| **Spoofing** | Distributed Credential Stuffing / Brute-force | Botnet dò quét mật khẩu từ hàng ngàn IP. | **HIGH** | Rate limit kép (IP & Account); CAPTCHA Turnstile sau 3 lần sai; Khóa tài khoản tạm thời 15 phút sau 5 lần sai liên tiếp (HTTP 423); Mở khóa tự phục vụ qua HMAC OTP. |
| **Tampering** | Tenant Context Tampering | Người dùng Tenant A sửa `organizationId` trong request payload để truy cập Tenant B. | **CRITICAL** | **Zero-Trust Input:** Trích xuất `organizationId` duy nhất từ JWT đã ký; Cấm ghi đè từ request; Thực thi PostgreSQL Row Level Security (RLS) trên 51 bảng vật lý. |
| **Tampering** | AES-GCM Nonce Reuse / Ciphertext Tampering | Tái sử dụng Nonce làm lộ khóa GMAC; hoặc sửa đổi tham số ngữ cảnh trong AAD. | **CRITICAL** | Cấu trúc Nonce 96-bit Hybrid (`Timestamp 48b || Worker ID 16b || CSPRNG 32b`); Giới hạn invocations $< 2^{32}$; Canonical Length-Prefixed Binary AAD Encoding. |
| **Tampering** | Token Chain Branching & Cycle Injection | Kẻ tấn công tạo chu trình $A \to B \to A$ hoặc nhiều cha cùng trỏ đến 1 token con. | **HIGH** | Strict Monotonic Sequence (`seq = seq + 1`); Ràng buộc `UNIQUE (replaced_by_token_id)`; Khóa ngoại hỗn hợp `(replaced_by, family_id) REFERENCES (id, family_id)`. |
| **Repudiation**| Hành động không thể truy vết | Quản trị viên xóa nhân sự hoặc sửa đơn hàng rồi chối bỏ hành vi. | **MEDIUM** | Ghi nhật ký tự động vào bảng `audit_logs` (Append-Only: Thu hồi quyền `UPDATE, DELETE, TRUNCATE` của DB user ứng dụng). |
| **Information Disclosure** | Timing Attack / Account Enumeration | Dò quét tài khoản qua thời gian phản hồi hoặc mã lỗi đăng nhập / quên mật khẩu. | **HIGH** | Thực thi Dummy Argon2id Verification khi email không tồn tại; Phản hồi HTTP 200 đồng nhất trên `/request-unlock`; Phương pháp luận kiểm định KS-Test ($p > 0.05$). |
| **Information Disclosure** | Cross-Session Idempotency Leakage | Lấy cắp response chứa Token của session khác qua tra cứu Idempotency Key trùng lặp. | **CRITICAL** | Scoped Unique Constraint `(session_id, idempotency_key)`; Truy vấn Bước 2 bắt buộc ràng buộc `session_id = token.session_id` từ token đã xác thực ở Bước 1. |
| **Denial of Service** | Account-Locking DoS Attack | Kẻ tấn công cố tình nhập sai mật khẩu 5 lần để khóa tài khoản của giám đốc/đồng nghiệp. | **HIGH** | IP-Level CAPTCHA Challenge sau 3 lần sai; Flow mở khóa tức thì tự phục vụ qua email OTP 6 chữ số; Giãn cách gửi email 60s để chống mail-bombing. |
| **Denial of Service** | Database / Network Partitioning Outage | Mất kết nối LISTEN/NOTIFY dẫn tới dùng cache cũ hoặc hệ thống bị treo. | **HIGH** | Dedicated Connection; 3-Tier Health Check ($T_{\text{detect}} \le 18\text{s}$); Tự động chuyển sang Safe Degradation (Direct DB Lookup); Fail-Closed (503) khi DB sập. |
| **Elevation of Privilege** | Time-of-Check to Time-of-Use (TOCTOU) | Thực hiện thanh toán trong khi tài khoản vừa bị Admin khóa ở transaction đồng thời. | **CRITICAL** | Revocation Linearization Point (Commit); Giao thức khóa kép bi quan `FOR SHARE` trên `users` và `user_sessions`; Thứ tự khóa xác định triệt tiêu Deadlock. |
| **Elevation of Privilege** | CSRF Credential Confusion | Lợi dụng việc chấp nhận cả Cookie và Bearer trên cùng endpoint để bypass CSRF. | **CRITICAL** | Kiến trúc Tách biệt Dual-Endpoint: `/refresh/web` (Cookie-only, bắt buộc Origin + Custom Header) vs `/refresh/mobile` (Bearer-only, hoàn toàn không đọc Cookie). |

---

## 3. PHÂN TÍCH CHUYÊN SÂU CÁC KỊCH BẢN TẤN CÔNG & ĐỐI SÁCH MỚI

### 3.1. Kịch bản 1: Phân Định Token Reuse Tấn Công vs Sự Cố Mạng Khôi Phục (B-01)
- **Thực tế:** Không thể dùng thời gian trôi qua ($5\text{s}$ hay $30\text{s}$) làm bằng chứng an ninh chứng minh ý đồ tấn công. Một kẻ tấn công trộm được token vẫn có thể replay trong $500\text{ms}$; người dùng hợp lệ có thể retry sau $40\text{s}$ do rớt mạng.
- **Quy trình phân giải an toàn 2 bước:**
  - Khi token đã `ROTATED`, server chỉ phục hồi response khi tìm thấy bản ghi `auth_idempotency_records` khớp `(session_id, idempotency_key, request_token_hash)` còn hạn trong cửa sổ $30\text{s}$.
  - Nếu không tìm thấy bản ghi hoặc bản ghi đã quá $30\text{s}$: Server không suy diễn mà thực thi chính sách an ninh **Fail-Closed (Targeted Family Invalidation)**: Chuyển toàn bộ Token Family và Session sang `REVOKED`, trả về HTTP `401 Unauthorized` (`AUTH_TOKEN_REUSE_DETECTED` hoặc `AUTH_RECOVERY_WINDOW_EXPIRED`).

### 3.2. Kịch bản 2: Tấn Công Tái Sử Dụng Nonce & Phá Vỡ Mật Mã AES-256-GCM (B-02)
- **Mối đe dọa:** Trong AES-GCM, nếu cùng một cặp `(Key, Nonce)` được dùng để mã hóa hai bản tin khác nhau, kẻ tấn công có thể khôi phục khóa xác thực GMAC ($H$), giả mạo thông điệp và giải mã toàn bộ ciphertext.
- **Đối sách:**
  1. **Nonce Hybrid 96-bit Độc bản:** Kết hợp `Timestamp 48b || Worker ID 16b || CSPRNG 32b`. Không thể trùng lặp giữa các instances và xác suất va chạm nội bộ instance đạt $0$.
  2. **Canonical Length-Prefixed Binary AAD (TLV):** Khóa cứng toàn bộ metadata (`key_id`, `idempotency_key`, `session_id`, `token_family_id`, `request_token_hash`, `endpoint`) vào quá trình tính MAC tag. Bất kỳ sự tráo đổi phiên nào đều khiến giải mã thất bại ngay lập tức.
  3. **Vòng đời Khóa:** Khóa `ACTIVE` được xoay vòng định kỳ và lưu ở trạng thái `RETIRED` trong 24h để giải mã bản ghi hợp lệ. Nếu khóa bị lộ (`REVOKED`), hệ thống chuyển sang Fail-Closed.

### 3.3. Kịch bản 3: Tấn Công Đua Thời Gian TOCTOU Trên Critical Mutations (B-03)
- **Mối đe dọa:** Admin thực hiện thu hồi quyền của nhân viên gian lận. Cùng millisecond đó, nhân viên gửi lệnh thanh toán đơn hàng `/sales/orders/:id/payments`. Nếu API thanh toán kiểm tra quyền trước rồi mới ghi sổ mà không có khóa bi quan, giao dịch thanh toán sẽ thực thi thành công bằng phiên đã chết!
- **Đối sách Triệt tiêu TOCTOU:**
  - **Revocation Linearization Point:** Xác lập điểm tuyến tính hóa là thời điểm `COMMIT` của transaction thu hồi quyền.
  - **Khóa kép `FOR SHARE`:** Transaction thanh toán bắt buộc thực hiện `SELECT auth_version, status FROM users FOR SHARE` và `SELECT status FROM user_sessions FOR SHARE`.
  - Transaction thu hồi gọi `UPDATE users` (yêu cầu `EXCLUSIVE LOCK`). PostgreSQL bảo đảm tính tuần tự hóa: Hoặc giao dịch thanh toán xong trước commit thu hồi, hoặc giao dịch thanh toán phải đợi và bị từ chối `401 Unauthorized` ngay khi nhận được khóa.
  - **Thứ tự khóa xác định:** `users -> user_sessions -> business_entities` loại trừ 100% nguy cơ Deadlock.

---

## 4. CÁC MỐI ĐE DỌA MỞ RỘNG ĐƯỢC CHUẨN HÓA TẠI R3.2

### 4.1. Tấn Công Từ Chối Dịch Vụ Khóa Tài Khoản (Account-Locking DoS) & HMAC OTP (B-07)
- **Mối đe dọa:** Kẻ tấn công cố tình gửi sai mật khẩu 5 lần cho tài khoản giám đốc để làm tê liệt hoạt động. Mặt khác, nếu database bị lộ, kẻ tấn công có thể tạo Rainbow Table dò quét toàn bộ $10^6$ mã OTP 6 chữ số trong dưới $1\text{s}$ nếu chỉ lưu hash SHA-256 thô.
- **Đối sách:**
  1. IP-level Turnstile CAPTCHA Challenge sau 3 lần đăng nhập sai từ cùng 1 IP.
  2. Mã OTP 6 chữ số bắt buộc băm bằng **`HMAC-SHA256(otp_code, SERVER_HMAC_SECRET)`** với secret phía server, vô hiệu hóa hoàn toàn tấn công Rainbow Table offline.
  3. Giới hạn 3 lần thử sai trên OTP, thời hạn 10 phút, giãn cách gửi email 60s.

### 4.2. Tấn Công Kênh Bên Thời Gian (Side-Channel Timing Attack) & KS-Test (B-08)
- **Mối đe dọa:** Kẻ tấn công đo đạc thời gian phản hồi của endpoint đăng nhập để xác định email có tồn tại trong hệ thống hay không (do chi phí tính toán Argon2id rất nặng).
- **Đối sách:**
  1. Bắt buộc thực thi `argon2.verify(DUMMY_ARGON2_HASH, password)` khi email không tồn tại.
  2. Bãi bỏ cam kết "độ lệch $\le 8\%$". Thiết lập kiểm định thống kê **Two-Sample Kolmogorov-Smirnov Test ($N=1,000, p > 0.05$)** để chứng minh hai phân phối thời gian là đồng nhất.
  3. Endpoint `/auth/request-unlock` luôn trả về HTTP 200 OK đồng nhất kèm calibrated delay jitter $50\text{ms} - 100\text{ms}$.

### 4.3. Tấn Công CSRF Bypass Qua Đa Giao Thức (B-09)
- **Mối đe dọa:** Phân loại client dựa vào sự hiện diện của Cookie tạo cơ hội cho kẻ tấn công giả mạo request không cookie hoặc lợi dụng các lỗ hổng CORS.
- **Đối sách Dual-Endpoint:**
  - `POST /api/v1/auth/refresh/web`: Nhận Cookie ONLY (`SameSite=Strict`, `HttpOnly`), bắt buộc kiểm tra Origin Whitelist và Custom Header `X-Requested-With`. Chặn đứng token gửi qua Body/Header.
  - `POST /api/v1/auth/refresh/mobile`: Nhận Bearer Token ONLY trong Header/Body, hoàn toàn không đọc Cookie, miễn nhiễm tự nhiên với CSRF.

### 4.4. Sự Cố Đứt Kênh LISTEN/NOTIFY & Nguy Cơ Phân Mảnh Mạng (B-04)
- **Mối đe dọa:** Kênh LISTEN/NOTIFY bị đứt ngầm khiến các node backend tiếp tục tin cậy local cache chứa `auth_version` cũ, không nhận được thông báo thu hồi quyền.
- **Đối sách:**
  - Dedicated Connection độc lập với PgBouncer.
  - Giám sát 3 tầng với Application Heartbeat ping mỗi $15\text{s}$ ($T_{\text{detect}} \le 18\text{s}$).
  - Tự động chuyển sang Safe Degradation (Direct DB Verification, 0ms lag thu hồi).
  - Chuyển sang Fail-Closed (HTTP 503) khi database ngừng hoạt động.

### 4.5. Ranh Giới Tin Cậy Thực Tế của PostgreSQL RLS (B-05)
- **Mối đe dọa:** Lỗi lập trình bỏ sót điều kiện lọc tenant trong ORM khiến dữ liệu bị rò rỉ chéo tổ chức.
- **Đối sách & Ranh giới:**
  - RLS được kích hoạt (`ENABLE RLS` và `FORCE RLS`) trên toàn bộ 51 bảng vật lý (39 trực tiếp, 10 bảng con, 2 bảng gốc).
  - Thiết lập biến ngữ cảnh qua `await tx.$queryRawSELECT set_config('app.current_organization_id', ${orgId}::text, true);`.
  - **Tuyên bố Ranh giới (Trust Boundary):** RLS là cơ chế Defense-in-Depth phòng ngừa lỗi ứng dụng. RLS không có khả năng bảo vệ chống lại Backend RCE hoặc Database Superuser.

---

## 5. ĐỐI CHIẾU TIÊU CHUẨN OWASP API SECURITY TOP 10 (2023)

| Mã OWASP | Tên Lỗ hổng | Cơ chế Kiểm soát Cụ thể tại BizPro+ Phase 1D |
| :--- | :--- | :--- |
| **API1:2023** | Broken Object Level Authorization (BOLA) | Resource-Specific Policy Engine + PostgreSQL RLS trên 51 bảng. |
| **API2:2023** | Broken Authentication | Băm Argon2id, JWT ngắn hạn (15m), Token Family Rotation 2 bước, Dual-Endpoint CSRF. |
| **API3:2023** | Broken Object Property Level Authorization | DTO Whitelist toàn cục, chặn ghi đè `organizationId`, `role`, `authVersion`. |
| **API4:2023** | Unrestricted Resource Consumption | Throttling kép IP & Account, giới hạn payload 1MB, password max 128 chars. |
| **API5:2023** | Broken Function Level Authorization (BFLA) | RBAC Deny-by-default, `@RequirePermissions()` cấu trúc module. |
| **API6:2023** | Unrestricted Access to Sensitive Business Flows | Khóa bi quan phân tầng trên Critical Mutations, Account Lockout bậc thang (HTTP 423). |
| **API7:2023** | Server-Side Request Forgery (SSRF) | Whitelist domain, không nhận URL trực tiếp từ client. |
| **API8:2023** | Security Misconfiguration | Dedicated LISTEN connection, Helmet security headers, Safe Degradation Fail-Closed. |
| **API9:2023** | Improper Inventory Management | Định tuyến API tường minh `/api/v1/auth/*`, phân tách `/refresh/web` vs `/refresh/mobile`. |
| **API10:2023**| Unsafe Consumption of APIs | HMAC SHA-256 OTP phía server, Canonical Binary AAD cho AES-256-GCM. |
