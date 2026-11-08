# BIZPRO+ PHASE 1D — API CONTRACT SPECIFICATION
**Tài liệu:** `docs/PHASE_1D_API_CONTRACT.md`  
**Phiên bản:** 3.2.0-SYNCHRONIZED (Comprehensive API Contract Specification)  
**Tác giả:** Principal Backend Architect, Security Architect & API Designer  
**Trạng thái tài liệu:** SPECIFICATION SYNCHRONIZED — CONTROLLED DOCUMENTATION (DESIGN ONLY)  
**Gate Status:** NOT APPROVED (HOLD) — Implementation Gate Strict Preservation  

---

## 1. TỔNG QUAN TIÊU CHUẨN GIAO THỨC & QUY TẮC AN NINH

### 1.1. Chuẩn Thiết Kế RESTful & Định Danh
- **Base URL:** `/api/v1/auth`
- **Content-Type:** `application/json; charset=utf-8`
- **Data Transfer Object (DTO) Validation:** NestJS `ValidationPipe` toàn cục với `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`. Mọi trường không khai báo trong DTO đều bị loại bỏ tự động.
- **Idempotency Header:** Mọi request làm mới token bắt buộc gửi kèm header:
  `Idempotency-Key: <UUIDv4>` (ví dụ: `Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`).

### 1.2. Phân Tách Kiến Trúc Dual-Endpoint Cho Web và Mobile
Hệ thống bãi bỏ hoàn toàn việc phân loại client bằng sự hiện diện của Cookie. Thay vào đó, thiết lập 2 endpoint làm mới token tách biệt:
- **Web SPA:** Gọi `/api/v1/auth/refresh/web` (Chỉ chấp nhận Cookie, bắt buộc CSRF Guard).
- **Native Mobile & API:** Gọi `/api/v1/auth/refresh/mobile` (Chỉ chấp nhận Bearer Token trong Header/Body, miễn nhiễm CSRF).

---

## 2. CHÍNH SÁCH RATE LIMITING & THROTTLING HEADERS

Hệ thống áp dụng chính sách điều tiết lưu lượng đa tầng qua NestJS `@nestjs/throttler`:
- **Đăng nhập (`/auth/login`):** Tối đa 5 requests / 60 seconds per IP và per Email.
- **Làm mới token (`/auth/refresh/*`):** Tối đa 30 requests / 60 seconds per Session.
- **Yêu cầu mở khóa / Quên mật khẩu (`/auth/request-unlock`, `/auth/forgot-password`):** Tối đa 3 requests / 15 minutes per IP. Giãn cách gửi email tối thiểu 60s / tài khoản.
- **Thử mã OTP (`/auth/unlock`):** Tối đa 3 lần thử sai trên 1 mã OTP. Quá 3 lần mã tự động bị hủy.

Mọi phản hồi từ hệ thống đều trả về các tiêu đề chuẩn IETF:
```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 58
Retry-After: 900 (khi bị HTTP 423 hoặc 429)
```

---

## 3. ĐẶC TẢ CHI TIẾT CÁC ENDPOINTS AUTHENTICATION & SESSION

### 3.1. POST `/api/v1/auth/login`
- **Mục đích:** Xác thực người dùng bằng email và mật khẩu, thiết lập phiên làm việc vật lý và cấp phát cặp token đầu tiên.
- **Xác thực:** Public (`@Public()`).

#### Request Body (`LoginDto`):
```json
{
  "email": "admin@bizpro.vn",
  "password": "Password123!@#",
  "deviceId": "dev_chrome_win11_01"
}
```

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "email": "admin@bizpro.vn",
      "fullName": "Nguyễn Văn Admin",
      "organizationId": "org_c478491c-76e9-4e0a-9d9e-108b3e811100",
      "roles": ["ADMIN"],
      "permissions": ["crm.customers.read", "sales.orders.read", "inventory.products.read"]
    },
    "session": {
      "id": "sess_84b391d1-7290-482a-a92c-0e78f993104a",
      "expiresAt": "2026-11-12T04:00:00.000Z"
    }
  }
}
```

#### Chính Sách Phản Hồi Khi Thất Bại & Khóa Tài Khoản:
- **Lần sai 1 đến 4:** Trả về **HTTP `401 Unauthorized`** (`AUTH_INVALID_CREDENTIALS`). *Thời gian xử lý luôn được đồng nhất qua Dummy Argon2id Verification.*
- **Lần sai thứ 5:** Tài khoản bị tạm khóa 15 phút. Server trả về **HTTP `423 Locked`** (`AUTH_ACCOUNT_LOCKED`), kèm `lockedUntil` và `retryAfter: 900`.
- **Lần sai thứ 6+ (khi đang bị khóa):** Trả về ngay **HTTP `423 Locked`** (Fast-Path không tốn CPU tính Argon2id).

---

### 3.2A. POST `/api/v1/auth/refresh/web` (Dành Cho Web Browser SPA)
- **Mục đích:** Làm mới Access Token và Refresh Token dành riêng cho ứng dụng Web.
- **Phương thức truyền Credential:** **COOKIE ONLY** (`bizpro_refresh_token`).
- **CSRF Protection:** Bắt buộc kích hoạt `WebCsrfGuard`:
  - Header `Origin` bắt buộc khớp chính xác Whitelist cấu hình (ví dụ `https://app.bizpro.vn`).
  - Header `X-Requested-With: XMLHttpRequest` hoặc `X-BizPro-Client: WebSPA` là bắt buộc.
- **Ràng buộc nghiêm ngặt:** Nếu request gửi token qua JSON Body hoặc Authorization Header $\to$ Lập tức từ chối **HTTP `400 Bad Request`** (`AUTH_CREDENTIAL_TRANSPORT_INVALID`).

#### Response Headers:
```http
Set-Cookie: bizpro_refresh_token=rt_new_...; Path=/api/v1/auth/refresh/web; Max-Age=604800; HttpOnly; Secure; SameSite=Strict
```

---

### 3.2B. POST `/api/v1/auth/refresh/mobile` (Dành Cho Native Mobile & API)
- **Mục đích:** Làm mới Access Token và Refresh Token dành riêng cho ứng dụng Native Mobile (iOS/Android) hoặc Server M2M.
- **Phương thức truyền Credential:** **BEARER ONLY** (Trong Header `Authorization: Bearer <refreshToken>` hoặc JSON Body `{ "refreshToken": "rt_..." }`).
- **CSRF Protection:** **Không áp dụng**. Endpoint hoàn toàn bỏ qua và không đọc Cookie, miễn nhiễm tự nhiên với CSRF.

---

### 3.3. Quy Trình Xử Lý & Response Chung Cho Refresh (`/refresh/web` & `/refresh/mobile`)
Cả 2 endpoint đều dùng chung tầng dịch vụ `AuthService.rotateToken(token, idempotencyKey)` với quy trình 2 bước:
1. **Bước 1 (Auth & Lock):** `SELECT * FROM refresh_tokens WHERE token_hash = SHA256(token) FOR UPDATE`.
   - Nếu `ACTIVE` $\to$ Xoay vòng tạo token mới (seq = seq + 1), mã hóa response envelope (AES-256-GCM, Nonce Hybrid 96-bit), lưu `auth_idempotency_records` với TTL 30s. Trả về HTTP `200 OK`.
   - Nếu `ROTATED` $\to$ Chuyển sang Bước 2.
2. **Bước 2 (Idempotency Resolution):** `SELECT * FROM auth_idempotency_records WHERE session_id = token.session_id AND idempotency_key = K FOR UPDATE`.
   - Tìm thấy, khớp token hash, còn hạn ($\le 30\text{s}$) $\to$ Giải mã envelope, trả lại Response gốc (HTTP `200 OK`).
   - Tìm thấy, khớp token hash, quá hạn ($> 30\text{s}$) $\to$ Fail-Closed: Targeted Family Invalidation, trả về HTTP `401 Unauthorized` (`AUTH_RECOVERY_WINDOW_EXPIRED`).
   - Tìm thấy, nhưng khác token hash $\to$ HTTP `422 Unprocessable Entity` (`AUTH_IDEMPOTENCY_PAYLOAD_MISMATCH`).
   - Không tìm thấy record $\to$ Nhận diện Token Reuse Replay Attack $\to$ Thu hồi Token Family, trả về HTTP `401 Unauthorized` (`AUTH_TOKEN_REUSE_DETECTED`).

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Làm mới phiên làm việc thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```

---

### 3.4. POST `/api/v1/auth/request-unlock`
- **Mục đích:** Yêu cầu gửi mã OTP mở khóa tài khoản qua email khi tài khoản bị khóa do thử sai mật khẩu.
- **Xác thực:** Public (`@Public()`).
- **Chống Account Enumeration:** Dù email có tồn tại hay không, server **LUÔN TRẢ VỀ HTTP `200 OK`** với thông điệp đồng nhất kèm delay jitter $50\text{ms} - 100\text{ms}$.

#### Request Body (`RequestUnlockDto`):
```json
{
  "email": "user@bizpro.vn"
}
```

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Nếu email của bạn tồn tại trên hệ thống, mã mở khóa đã được gửi tới hòm thư của bạn.",
  "data": null
}
```

---

### 3.5. POST `/api/v1/auth/unlock`
- **Mục đích:** Xác thực mã OTP 6 chữ số để mở khóa tài khoản tức thì.
- **Mật mã học:** Server kiểm tra băm `HMAC-SHA256(otpCode, SERVER_HMAC_SECRET)` với giá trị lưu trong `users.unlock_otp_hash`.
- **Ràng buộc:** Tối đa 3 lần thử sai. Quá 3 lần mã OTP lập tức bị hủy bỏ.

#### Request Body (`UnlockAccountDto`):
```json
{
  "email": "user@bizpro.vn",
  "otpCode": "849201"
}
```

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Mở khóa tài khoản thành công. Bạn có thể đăng nhập bình thường.",
  "data": {
    "unlockedAt": "2026-11-05T12:00:00.000Z"
  }
}
```

---

### 3.6. POST `/api/v1/auth/logout`
- **Mục đích:** Thu hồi phiên làm việc hiện tại, vô hiệu hóa Token Family thuộc phiên, xóa Cookie phía Client.
- **Xác thực:** Yêu cầu Bearer Access Token.

---

### 3.7. POST `/api/v1/auth/logout-all`
- **Mục đích:** Thu hồi tất cả các phiên đăng nhập đang hoạt động của người dùng trên mọi thiết bị, đồng thời tăng `users.auth_version` để thu hồi tức thời toàn bộ Access Token đang lưu hành.
- **Xác thực:** Yêu cầu Bearer Access Token (`JwtAuthGuard`).

---

### 3.8. Giao Thức Khóa Bi Quan Trên Critical Mutation APIs
Mọi API nghiệp vụ trọng yếu (Thanh toán đơn hàng `/sales/orders/:id/payments`, Duyệt đơn `/sales/orders/:id/approve`, Xuất kho `/inventory/issues`) bắt buộc thực thi giao thức kiểm tra kép trong transaction:
```sql
BEGIN;
SET LOCAL lock_timeout = '2000ms';
SELECT auth_version, status FROM users WHERE id = :user_id FOR SHARE;
SELECT status FROM user_sessions WHERE id = :session_id FOR SHARE;
-- Nếu auth_version không khớp hoặc trạng thái != ACTIVE -> ROLLBACK và trả 401
COMMIT;
```

---

## 4. BẢNG MÃ LỖI ĐỒNG BỘ TOÀN HỆ THỐNG (SYSTEM ERROR CODES)

| HTTP Status | Error Code | Mô tả Kỹ thuật | Hành vi Khuyến nghị Client |
| :---: | :--- | :--- | :--- |
| **400** | `AUTH_VALIDATION_ERROR` | Tham số gửi lên không đúng định dạng DTO | Hiển thị lỗi form tại trường tương ứng |
| **400** | `AUTH_CREDENTIAL_TRANSPORT_INVALID` | Truyền token qua sai phương thức (ví dụ gửi Body vào endpoint Web) | Sửa đổi mã nguồn client gọi đúng endpoint |
| **401** | `AUTH_INVALID_CREDENTIALS` | Sai email hoặc mật khẩu (Chuẩn hóa Dummy Hash) | Báo lỗi thông tin đăng nhập không hợp lệ |
| **401** | `AUTH_TOKEN_EXPIRED` | Access Token hoặc Refresh Token đã quá hạn | Thực hiện refresh hoặc điều hướng về `/login` |
| **401** | `AUTH_TOKEN_INVALID` | Chữ ký token không hợp lệ hoặc định dạng hỏng | Xóa credential client, yêu cầu đăng nhập lại |
| **401** | `AUTH_TOKEN_REVOKED` | Token bị thu hồi do `token.ver < user.auth_version` | Buộc đăng nhập lại toàn bộ thiết bị |
| **401** | `AUTH_SESSION_REVOKED` | Phiên làm việc đã bị thu hồi đơn lẻ từ xa | Điều hướng người dùng về màn hình đăng nhập |
| **401** | `AUTH_TOKEN_REUSE_DETECTED` | Phát hiện token đã rotated bị dùng lại không có Idempotency Record | Thu hồi Token Family, buộc đăng nhập lại |
| **401** | `AUTH_RECOVERY_WINDOW_EXPIRED` | Gửi retry hợp lệ nhưng quá thời hạn lưu trữ 30 giây | Fail-Closed: Thu hồi Family, yêu cầu đăng nhập |
| **401** | `AUTH_ENVELOPE_DECRYPT_FAILED`| Khóa giải mã bị revoke hoặc tag GCM không khớp | Cảnh báo an ninh, hủy phiên, yêu cầu đăng nhập |
| **403** | `CSRF_ORIGIN_INVALID` | Request Web vi phạm kiểm tra Origin Whitelist | Chặn đứng hành vi Cross-Site Request |
| **403** | `AUTH_ACCOUNT_DISABLED` | Tài khoản ở trạng thái `INACTIVE` | Thông báo liên hệ quản trị viên |
| **403** | `AUTH_ORGANIZATION_SUSPENDED`| Tổ chức đang bị tạm đình chỉ hoạt động | Thông báo liên hệ quản trị viên hệ thống |
| **403** | `AUTH_TENANT_ACCESS_DENIED` | Vi phạm chính sách Row Level Security (RLS) | Ghi log kiểm toán an ninh, từ chối tuyệt đối |
| **422** | `AUTH_IDEMPOTENCY_PAYLOAD_MISMATCH`| Cùng Idempotency-Key nhưng gửi kèm Token khác trong session | Báo lỗi logic client, giữ nguyên Token Family |
| **423** | `AUTH_ACCOUNT_LOCKED` | Tài khoản bị tạm khóa sau 5 lần nhập sai liên tiếp | Hiển thị bộ đếm ngược `lockedUntil` (15m) |
| **429** | `AUTH_RATE_LIMIT_EXCEEDED` | Vượt ngưỡng ThrottlerGuard theo IP hoặc Account | Thử lại sau khoảng thời gian `Retry-After` |
| **503** | `MUTATION_LOCK_TIMEOUT` | Tranh chấp khóa quá 2000ms trên API nghiệp vụ trọng yếu | Thử lại sau ít giây (Backoff Jitter) |
| **503** | `SERVICE_UNAVAILABLE_DATABASE_DOWN`| Cơ sở dữ liệu ngừng hoạt động (Fail-Closed) | Thông báo bảo trì hệ thống tạm thời |
