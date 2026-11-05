# BIZPRO+ PHASE 1D — API CONTRACT SPECIFICATION
**Tài liệu:** `docs/PHASE_1D_API_CONTRACT.md`  
**Phiên bản:** 2.0.0 (Comprehensive Cross-Document Architecture Revision)  
**Tác giả:** Senior Backend Architect & Security Architect  
**Trạng thái tài liệu:** DRAFT SPECIFICATION FOR ARCHITECTURAL REVIEW (DESIGN ONLY)  
**Gate Status:** NOT APPROVED — Awaiting Independent Multi-Agent Review  

---

## 1. TỔNG QUAN TIÊU CHUẨN GIAO THỨC & QUY TẮC AN NINH

### 1.1. Chuẩn thiết kế RESTful & Định danh
- **Base URL:** `/api/v1/auth`
- **Content-Type:** `application/json; charset=utf-8`
- **Data Transfer Object (DTO) Validation:** NestJS `ValidationPipe` toàn cục với `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`.
- **Cơ chế xác thực (Authentication Protocol):**
  - **Access Token:** Bearer Token trong Header `Authorization: Bearer <access_token>`. TTL: **15 phút**. Stateless, mang theo `auth_version` để thu hồi tức thời.
  - **Refresh Token (Browser SPA Client):** Lưu trữ ưu tiên trong **HttpOnly, Secure, SameSite=Strict Cookie** tên `bizpro_refresh_token` (Path: `/api/v1/auth/refresh`, Max-Age: `604800` tương đương 7 ngày).
  - **Refresh Token (Native Mobile Client):** Gửi qua Request Body `{"refreshToken": "..."}` và trả về trong Response Body JSON khi client gửi header `X-Client-Type: mobile`.
- **Envelope phản hồi thành công chuẩn:**
```json
{
  "statusCode": 200,
  "message": "Thao tác thành công",
  "data": { ... },
  "meta": {
    "timestamp": "2026-11-05T04:00:00.000Z",
    "requestId": "req_c84a8b79-5632-491a-8219-c68e7f1e941b"
  }
}
```
- **Envelope phản hồi lỗi chuẩn (RFC 7807 Problem Details adapted):**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "errorCode": "AUTH_INVALID_CREDENTIALS",
  "message": "Thông tin đăng nhập không chính xác",
  "details": [],
  "timestamp": "2026-11-05T04:00:00.000Z",
  "path": "/api/v1/auth/login",
  "requestId": "req_c84a8b79-5632-491a-8219-c68e7f1e941b"
}
```

---

## 2. CHÍNH SÁCH RATE LIMITING & THROTTLING HEADERS

Áp dụng `@nestjs/throttler` dựa trên client IP và định danh tài khoản:

| Endpoint | Throttling Window | Giới hạn | Headers phản hồi | Cơ chế chặn / Khóa |
| :--- | :--- | :--- | :--- | :--- |
| `POST /api/v1/auth/login` | 60 giây (1 min) | 5 requests | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` | HTTP 429 + Khóa tài khoản tạm thời sau 5 lần sai liên tiếp (15 phút, HTTP 423) |
| `POST /api/v1/auth/refresh` | 60 giây (1 min) | 30 requests | Standard Throttler Headers | HTTP 429 ThrottlerException |
| `POST /api/v1/auth/forgot-password` | 900 giây (15 min) | 3 requests | Standard Throttler Headers | HTTP 429 chống lạm dụng email & Enumeration |
| `POST /api/v1/auth/reset-password` | 300 giây (5 min) | 5 requests | Standard Throttler Headers | HTTP 429 chống brute-force token |
| `POST /api/v1/auth/change-password` | 60 giây (1 min) | 3 requests | Standard Throttler Headers | HTTP 429 |
| Tất cả GET endpoints | 60 giây (1 min) | 120 requests | Standard Throttler Headers | HTTP 429 ThrottlerException |

---

## 3. ĐẶC TẢ CHI TIẾT 10 ENDPOINTS AUTHENTICATION & SESSION

### 3.1. POST `/api/v1/auth/login`
- **Mục đích:** Xác thực người dùng bằng Email/Password, tạo phiên `UserSession` mới, phát hành thế hệ token đầu tiên trong `refresh_tokens`, cấp Access Token.
- **Xác thực:** Public (`@Public()`).
- **Rate Limit:** 5 requests / 60 seconds per IP.

#### Request Headers:
```http
Content-Type: application/json
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...
X-Forwarded-For: 113.190.234.12
```

#### Request Body (`LoginDto`):
```json
{
  "email": "admin@bizpro.vn",
  "password": "Password123!@#",
  "deviceName": "Chrome on Windows 11"
}
```
*Validation Rules:*
- `email`: `@IsEmail()`, `@IsNotEmpty()`, `@Transform(({ value }) => value.trim().toLowerCase())`
- `password`: `@IsString()`, `@IsNotEmpty()`, `@MinLength(8)`, `@MaxLength(128)`
- `deviceName`: `@IsOptional()`, `@IsString()`, `@MaxLength(100)`

#### Response Headers:
```http
Set-Cookie: bizpro_refresh_token=rt_9b1deb4d...; Path=/api/v1/auth/refresh; Max-Age=604800; HttpOnly; Secure; SameSite=Strict
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 58
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
      "organizationCode": "BIZPRO-CORP",
      "organizationName": "Công ty Cổ phần Giải pháp Doanh nghiệp BizPro+",
      "employeeId": "emp_f842345e-8551-419b-a010-062e73177699",
      "departmentId": "dept_3b1d8481-9b1b-4351-92b8-93e1104e4321",
      "roles": ["ADMIN"],
      "permissions": [
        "crm.customers.read",
        "crm.customers.write",
        "sales.orders.read",
        "sales.orders.write",
        "inventory.products.read"
      ]
    },
    "session": {
      "id": "sess_84b391d1-7290-482a-a92c-0e78f993104a",
      "tokenFamilyId": "fam_11a84b39-91d1-482a-a92c-0e78f993104b",
      "deviceName": "Chrome on Windows 11",
      "expiresAt": "2026-11-12T04:00:00.000Z"
    }
  },
  "meta": {
    "timestamp": "2026-11-05T04:00:00.000Z",
    "requestId": "req_84b1-912f-4831"
  }
}
```

#### Mã lỗi có thể trả về:
- **400 Bad Request:** Payload sai định dạng (`AUTH_VALIDATION_ERROR`).
- **401 Unauthorized:** Mật khẩu hoặc email sai (`AUTH_INVALID_CREDENTIALS`). *Thời gian xử lý luôn được chuẩn hóa bằng dummy hash để chống Timing Attack.*
- **403 Forbidden:** Tài khoản bị vô hiệu hóa (`status = 'INACTIVE'`) (`AUTH_ACCOUNT_DISABLED`), hoặc tổ chức bị đình chỉ (`AUTH_ORGANIZATION_SUSPENDED`).
- **423 Locked:** Tài khoản bị tạm khóa do nhập sai liên tiếp quá 5 lần (`AUTH_ACCOUNT_LOCKED`). Body trả về `lockedUntil` để UI hiển thị đếm ngược.
- **429 Too Many Requests:** Vượt quá 5 req/phút từ cùng một IP (`AUTH_RATE_LIMIT_EXCEEDED`).

---

### 3.2. POST `/api/v1/auth/refresh`
- **Mục đích:** Đổi Refresh Token cũ lấy Access Token mới và Refresh Token mới (Token Family Rotation & Reuse Detection).
- **Xác thực:** Public hoặc Cookie-based (Kiểm tra Refresh Token).
- **Rate Limit:** 30 requests / 60 seconds.

#### Quy trình xử lý & Concurrency Semantics:
1. Tính `SHA-256(tokenString)`.
2. Mở Transaction, thực thi `SELECT * FROM refresh_tokens WHERE token_hash = ? FOR UPDATE` (Pessimistic Row Lock).
3. **Trường hợp Token Reuse (Status = 'REVOKED'):** Kích hoạt **Targeted Family Invalidation**:
   - `UPDATE refresh_tokens SET status = 'REVOKED' WHERE token_family_id = ?`
   - `UPDATE user_sessions SET status = 'REVOKED', revocation_reason = 'TOKEN_REUSE_DETECTED' WHERE id = ?`
   - Ghi nhật ký cảnh báo an ninh Critical.
   - Trả về mã lỗi `401 Unauthorized` (`AUTH_TOKEN_REUSE_DETECTED`).
4. **Trường hợp Idempotent Retry (Status = 'ROTATED'):**
   - Nếu thời điểm xoay vòng `rotated_at` nằm trong cửa sổ **Grace Period $\le$ 5 giây** và cùng Client Fingerprint: Server tra cứu `replaced_by_token_id` và cấp Access Token mới tương ứng, bảo toàn trạng thái không tạo token nhánh.
   - Nếu ngoài 5 giây: Nhận diện là hành vi Replay Attack quá hạn $\rightarrow$ Thu hồi Token Family, trả về `AUTH_TOKEN_REUSE_DETECTED`.
5. **Trường hợp Hợp lệ (Status = 'ACTIVE'):**
   - Đánh dấu token hiện tại `ROTATED`, cập nhật `rotated_at = NOW()`.
   - Tạo token mới trong `refresh_tokens` với `status = 'ACTIVE'`, `seq = seq + 1`.
   - Cập nhật `replaced_by_token_id = new_token.id`.
   - Cấp Access Token mới (15m), Set-Cookie Refresh Token mới (7 ngày).

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Làm mới phiên làm việc thành công",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900
  },
  "meta": {
    "timestamp": "2026-11-05T04:15:00.000Z",
    "requestId": "req_refresh_93a1"
  }
}
```

---

### 3.3. POST `/api/v1/auth/logout`
- **Mục đích:** Thu hồi phiên làm việc hiện tại, vô hiệu hóa toàn bộ Token Family thuộc phiên, xóa Cookie phía Client.
- **Xác thực:** Bearer Access Token hoặc Refresh Token hợp lệ.

#### Request Headers:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Cookie: bizpro_refresh_token=...
```

#### Response Headers:
```http
Set-Cookie: bizpro_refresh_token=; Path=/api/v1/auth/refresh; Max-Age=0; HttpOnly; Secure; SameSite=Strict
```

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Đăng xuất thành công",
  "data": {
    "revokedSessionId": "sess_84b391d1-7290-482a-a92c-0e78f993104a"
  }
}
```

---

### 3.4. POST `/api/v1/auth/logout-all`
- **Mục đích:** Thu hồi tất cả các phiên đăng nhập đang hoạt động của người dùng trên mọi thiết bị, đồng thời tăng `users.auth_version` để thu hồi tức thời toàn bộ Access Token đang lưu hành.
- **Xác thực:** Yêu cầu Bearer Access Token (`JwtAuthGuard`).

#### Request Body (`LogoutAllDto`):
```json
{
  "excludeCurrentSession": false
}
```

#### Phản ứng Database:
- `UPDATE user_sessions SET status = 'REVOKED', revoked_at = NOW(), revocation_reason = 'USER_LOGOUT_ALL' WHERE user_id = :userId`
- `UPDATE refresh_tokens SET status = 'REVOKED' WHERE session_id IN (SELECT id FROM user_sessions WHERE user_id = :userId)`
- `UPDATE users SET auth_version = auth_version + 1 WHERE id = :userId`

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Đã thu hồi tất cả các phiên đăng nhập và vô hiệu hóa Access Token cũ",
  "data": {
    "revokedSessionsCount": 3,
    "authVersion": 2
  }
}
```

---

### 3.5. GET `/api/v1/auth/me`
- **Mục đích:** Trả về toàn bộ hồ sơ bảo mật, vai trò, danh sách quyền thực tế và tóm tắt chính sách phạm vi dữ liệu theo ngữ cảnh tài nguyên.
- **Xác thực:** Yêu cầu Bearer Access Token (`JwtAuthGuard`).

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "id": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "email": "admin@bizpro.vn",
    "fullName": "Nguyễn Văn Admin",
    "status": "ACTIVE",
    "authVersion": 1,
    "organization": {
      "id": "org_c478491c-76e9-4e0a-9d9e-108b3e811100",
      "code": "BIZPRO-CORP",
      "name": "Công ty Cổ phần Giải pháp Doanh nghiệp BizPro+",
      "status": "ACTIVE"
    },
    "employee": {
      "id": "emp_f842345e-8551-419b-a010-062e73177699",
      "code": "EMP-001",
      "departmentId": "dept_3b1d8481-9b1b-4351-92b8-93e1104e4321",
      "departmentName": "Khối Kinh Doanh & Tiếp Thị"
    },
    "roles": [
      {
        "id": "role_admin",
        "code": "ORG_ADMIN",
        "name": "Quản trị viên Tổ chức"
      }
    ],
    "permissions": [
      "crm.customers.read",
      "crm.customers.write",
      "sales.orders.read",
      "sales.orders.write",
      "sales.orders.approve",
      "inventory.products.read",
      "system.audit.read"
    ],
    "contextualPolicies": {
      "crm": "OWN_AND_ASSIGNED_OR_ORG_ADMIN",
      "sales": "DEPARTMENT_BOUNDED_OR_ORG_ADMIN",
      "inventory": "ASSIGNED_WAREHOUSES_ONLY",
      "hrm": "SELF_AND_MANAGED_SUBORDINATES"
    }
  }
}
```

---

### 3.6. GET `/api/v1/auth/sessions`
- **Mục đích:** Liệt kê các phiên làm việc đang hoạt động của người dùng để phục vụ quản trị phiên từ xa.
- **Xác thực:** Yêu cầu Bearer Access Token (`JwtAuthGuard`).

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Danh sách phiên hoạt động",
  "data": [
    {
      "id": "sess_84b391d1-7290-482a-a92c-0e78f993104a",
      "tokenFamilyId": "fam_11a84b39-91d1-482a-a92c-0e78f993104b",
      "deviceName": "Chrome on Windows 11",
      "ipAddress": "113.190.234.12",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "isCurrent": true,
      "createdAt": "2026-11-05T04:00:00.000Z",
      "lastActiveAt": "2026-11-05T04:15:00.000Z",
      "expiresAt": "2026-11-12T04:00:00.000Z"
    },
    {
      "id": "sess_223910bb-9901-419b-bb33-4411eeff0011",
      "tokenFamilyId": "fam_99b84b39-11d1-482a-a92c-0e78f993104c",
      "deviceName": "BizPro Mobile on iPhone 15 Pro",
      "ipAddress": "14.232.18.90",
      "userAgent": "BizProMobile/1.0 (iOS 18.1)",
      "isCurrent": false,
      "createdAt": "2026-11-03T10:15:00.000Z",
      "lastActiveAt": "2026-11-04T18:20:00.000Z",
      "expiresAt": "2026-11-10T10:15:00.000Z"
    }
  ]
}
```

---

### 3.7. DELETE `/api/v1/auth/sessions/:id`
- **Mục đích:** Thu hồi từ xa một phiên đăng nhập cụ thể theo `sessionId` (đăng xuất máy tính văn phòng khi ở nhà).
- **Xác thực:** Yêu cầu Bearer Access Token (`JwtAuthGuard`). Bắt buộc xác minh `session.userId == current_user.id`.

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Thu hồi phiên đăng nhập thành công",
  "data": {
    "sessionId": "sess_223910bb-9901-419b-bb33-4411eeff0011",
    "status": "REVOKED",
    "revokedAt": "2026-11-05T04:20:00.000Z"
  }
}
```

---

### 3.8. POST `/api/v1/auth/change-password`
- **Mục đích:** Người dùng đã đăng nhập tự đổi mật khẩu.
- **Xác thực:** Yêu cầu Bearer Access Token.
- **An ninh:** Cập nhật `password_hash` bằng Argon2id, tăng `auth_version = auth_version + 1`, cập nhật `password_changed_at = NOW()`, và thu hồi toàn bộ các phiên làm việc khác ngoại trừ phiên hiện tại.

#### Request Body (`ChangePasswordDto`):
```json
{
  "currentPassword": "OldPassword123!@#",
  "newPassword": "NewSecurePassword456$%"
}
```
*Validation Rules:*
- `currentPassword`: `@IsString()`, `@IsNotEmpty()`
- `newPassword`: `@IsString()`, `@MinLength(8)`, `@MaxLength(128)`, `@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)` (Bao gồm tối thiểu chữ hoa, chữ thường, số, ký tự đặc biệt).

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Đổi mật khẩu thành công. Các phiên làm việc khác đã được tự động đăng xuất.",
  "data": {
    "passwordChangedAt": "2026-11-05T04:25:00.000Z",
    "newAuthVersion": 2
  }
}
```

---

### 3.9. POST `/api/v1/auth/forgot-password`
- **Mục đích:** Yêu cầu liên kết đặt lại mật khẩu qua email.
- **Xác thực:** Public (`@Public()`).
- **Chống User Enumeration Attack:** API **luôn trả về 200 OK** với thông điệp đồng nhất kể cả khi email không tồn tại trong hệ thống.
- **Rate Limit:** 3 requests / 15 minutes per IP.

#### Request Body (`ForgotPasswordDto`):
```json
{
  "email": "user@bizpro.vn"
}
```

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến hòm thư của bạn.",
  "data": null
}
```

---

### 3.10. POST `/api/v1/auth/reset-password`
- **Mục đích:** Xác thực token đặt lại mật khẩu từ email và cập nhật mật khẩu mới.
- **Xác thực:** Public (`@Public()`).
- **Token Design:** Mã CSPRNG 256-bit, lưu hash SHA-256 vào `users.password_reset_token_hash`. Thời hạn: 30 phút.

#### Request Body (`ResetPasswordDto`):
```json
{
  "token": "rst_9a48fbc89210a47eb910...",
  "newPassword": "BrandNewPassword789!#@"
}
```

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.",
  "data": null
}
```

---

## 4. BẢNG MÃ LỖI ĐỒNG BỘ TOÀN HỆ THỐNG (SYSTEM ERROR CODES)

| HTTP Status | Error Code | Mô tả kỹ thuật | Hành vi khuyến nghị phía Client |
| :--- | :--- | :--- | :--- |
| 400 | `AUTH_VALIDATION_ERROR` | Tham số gửi lên không đúng định dạng class-validator | Hiển thị lỗi form tại trường tương ứng |
| 401 | `AUTH_INVALID_CREDENTIALS` | Sai email hoặc mật khẩu | Báo lỗi thông tin đăng nhập không hợp lệ |
| 401 | `AUTH_TOKEN_EXPIRED` | Access Token hoặc Refresh Token đã quá hạn | Gọi endpoint `/refresh` hoặc điều hướng về `/login` |
| 401 | `AUTH_TOKEN_INVALID` | Token chữ ký không khớp hoặc định dạng hỏng | Xóa token client, điều hướng về `/login` |
| 401 | `AUTH_TOKEN_REVOKED` | Token bị thu hồi do `token.ver < user.auth_version` | Buộc đăng nhập lại |
| 401 | `AUTH_TOKEN_REUSE_DETECTED` | Phát hiện tái sử dụng Refresh Token đã xoay vòng | Cảnh báo an ninh, chuyển hướng về `/login` |
| 401 | `AUTH_SESSION_REVOKED` | Phiên làm việc đã bị thu hồi từ xa | Điều hướng người dùng về màn hình đăng nhập |
| 403 | `AUTH_ACCOUNT_DISABLED` | Tài khoản ở trạng thái `INACTIVE` | Thông báo liên hệ quản trị viên |
| 403 | `AUTH_ORGANIZATION_SUSPENDED`| Tổ chức đang bị tạm đình chỉ | Thông báo liên hệ quản trị viên hệ thống |
| 403 | `AUTH_FORBIDDEN_PERMISSION` | Người dùng thiếu quyền `<module>.<resource>.<action>` | Thông báo không có quyền thực hiện hành động |
| 403 | `AUTH_FORBIDDEN_SCOPE` | Bản ghi không thuộc phạm vi sở hữu/phòng ban/kho | Ẩn dữ liệu hoặc thông báo giới hạn phạm vi |
| 403 | `AUTH_TENANT_MISMATCH` | Cố ý truy cập dữ liệu của Organization khác | Ghi log bảo mật, từ chối tuyệt đối |
| 423 | `AUTH_ACCOUNT_LOCKED` | Tài khoản bị tạm khóa do nhập sai liên tiếp quá 5 lần | Hiển thị bộ đếm ngược `lockedUntil` |
| 429 | `AUTH_RATE_LIMIT_EXCEEDED` | Gửi request vượt ngưỡng Throttler | Hiển thị yêu cầu thử lại sau ít phút |
