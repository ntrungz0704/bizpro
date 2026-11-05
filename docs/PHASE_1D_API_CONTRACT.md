# BizPro+ Phase 1D — API Contract Specification
**Tài liệu:** Thiết kế Chi tiết Giao thức & Đặc tả Hợp đồng API Xác thực và Phân quyền (Authentication & RBAC)  
**Giai đoạn:** Phase 1D Architecture Blueprint  
**Phiên bản:** 1.0.0 (Design Only — Gate Pre-Implementation)  
**Trạng thái:** DRAFT FOR ARCHITECTURAL REVIEW  

---

## 1. TỔNG QUAN TIÊU CHUẨN KỸ THUẬT API

### 1.1. Chuẩn thiết kế RESTful & Định danh
- **Base URL:** `/api/v1/auth`
- **Content-Type:** `application/json; charset=utf-8`
- **Data Transfer Object (DTO) Validation:** NestJS `ValidationPipe` toàn cục với `{ whitelist: true, forbidNonWhitelisted: true, transform: true }`.
- **Cơ chế xác thực (Authentication Mechanism):**
  - **Access Token:** Bearer Token trong Header `Authorization: Bearer <access_token>`. Thời gian sống: 15 phút.
  - **Refresh Token:** Lưu trữ ưu tiên trong **HttpOnly, Secure, SameSite=Strict Cookie** tên `bizpro_refresh_token` (Path: `/api/v1/auth/refresh`). Hỗ trợ fallback qua Request Body `refreshToken` cho Native Client/Mobile App. Thời gian sống: 7 ngày.
- **Envelope phản hồi thành công chuẩn:**
```json
{
  "statusCode": 200,
  "message": "Thành công",
  "data": { ... },
  "meta": {
    "timestamp": "2026-11-05T03:30:00.000Z",
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
  "timestamp": "2026-11-05T03:30:00.000Z",
  "path": "/api/v1/auth/login",
  "requestId": "req_c84a8b79-5632-491a-8219-c68e7f1e941b"
}
```

---

## 2. MA TRẬN RATE LIMITING (THROTTLING POLICY)

Áp dụng `@nestjs/throttler` dựa trên client IP và định danh tài khoản:

| Endpoint | Throttling Window | Giới hạn | Cơ chế chặn / Khóa |
| :--- | :--- | :--- | :--- |
| `POST /api/v1/auth/login` | 60 giây (1 min) | 5 requests | HTTP 429 + Khóa tài khoản sau 5 lần sai liên tiếp (15 phút, HTTP 423) |
| `POST /api/v1/auth/refresh` | 60 giây (1 min) | 30 requests | HTTP 429 ThrottlerException |
| `POST /api/v1/auth/forgot-password` | 900 giây (15 min) | 3 requests | HTTP 429 chống spam mail / Enumeration |
| `POST /api/v1/auth/reset-password` | 300 giây (5 min) | 5 requests | HTTP 429 chống brute-force token |
| `POST /api/v1/auth/change-password` | 60 giây (1 min) | 3 requests | HTTP 429 |
| Tất cả GET endpoints | 60 giây (1 min) | 120 requests | HTTP 429 ThrottlerException |

---

## 3. ĐẶC TẢ CHI TIẾT CÁC ENDPOINT

### 3.1. POST `/api/v1/auth/login`
- **Mục đích:** Xác thực người dùng bằng Email/Password, tạo phiên đăng nhập mới trong `user_sessions`, phát hành cặp Access Token và Refresh Token.
- **Xác thực:** Public (Không yêu cầu JWT).
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
  "deviceName": "Chrome on Windows 11",
  "rememberMe": false
}
```
*Validation Rules:*
- `email`: `@IsEmail()`, `@IsNotEmpty()`, `@Transform(({ value }) => value.trim().toLowerCase())`
- `password`: `@IsString()`, `@IsNotEmpty()`, `@MinLength(8)`, `@MaxLength(128)`
- `deviceName`: `@IsOptional()`, `@IsString()`, `@MaxLength(100)`
- `rememberMe`: `@IsOptional()`, `@IsBoolean()`

#### Response Headers:
```http
Set-Cookie: bizpro_refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6...; Path=/api/v1/auth/refresh; Max-Age=604800; HttpOnly; Secure; SameSite=Strict
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
      "roles": ["ADMIN", "SALES_DIRECTOR"],
      "permissions": [
        "crm.customers.read",
        "crm.customers.write",
        "crm.deals.read",
        "crm.deals.write",
        "sales.orders.read",
        "sales.orders.write",
        "inventory.products.read",
        "inventory.stock.manage"
      ],
      "dataScopes": {
        "crm": "ALL",
        "sales": "DEPARTMENT",
        "inventory": "ALL",
        "hrm": "DEPARTMENT"
      }
    },
    "session": {
      "id": "sess_84b391d1-7290-482a-a92c-0e78f993104a",
      "deviceName": "Chrome on Windows 11",
      "expiresAt": "2026-11-12T03:30:00.000Z"
    }
  },
  "meta": {
    "timestamp": "2026-11-05T03:30:00.000Z",
    "requestId": "req_84b1-912f-4831"
  }
}
```

#### Error Responses:
- **400 Bad Request:** Payload sai định dạng email hoặc thiếu password (`AUTH_VALIDATION_ERROR`).
- **401 Unauthorized:** Mật khẩu hoặc email sai (`AUTH_INVALID_CREDENTIALS`). *Thời gian xử lý luôn được chuẩn hóa bằng dummy hash để chống Timing Attack.*
- **403 Forbidden:** Tài khoản bị vô hiệu hóa (`status = 'INACTIVE'` hoặc `'SUSPENDED'`) (`AUTH_ACCOUNT_DISABLED`).
- **423 Locked:** Tài khoản bị tạm khóa do nhập sai liên tiếp quá 5 lần (`AUTH_ACCOUNT_LOCKED`). Body trả về thời điểm `lockedUntil` để UI đếm ngược.
- **429 Too Many Requests:** Vượt quá tần suất 5 req/phút từ cùng một IP (`AUTH_RATE_LIMIT_EXCEEDED`).

---

### 3.2. POST `/api/v1/auth/refresh`
- **Mục đích:** Đổi Refresh Token cũ lấy Access Token mới và Refresh Token mới (Refresh Token Rotation - RTR).
- **Xác thực:** Public hoặc Cookie-based (Kiểm tra Refresh Token).
- **Rate Limit:** 30 requests / 60 seconds.

#### Request Headers:
```http
Cookie: bizpro_refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```
*(Nếu là Mobile Client, gửi qua body `{"refreshToken": "..."}`)*

#### Logic kiểm soát an ninh nâng cao (Reuse Detection):
1. Tính `hash = SHA256(refreshToken)`.
2. Truy vấn `user_sessions` theo `refresh_token_hash = hash`.
3. **Phát hiện tái sử dụng (Reuse Detection):** Nếu tìm thấy session có `status = 'REVOKED'` hoặc `replaced_by_session_id IS NOT NULL`, hệ thống lập tức kích hoạt chuỗi phản ứng an ninh:
   - Thu hồi **toàn bộ** session thuộc cùng `user_id` (`UPDATE user_sessions SET status = 'REVOKED' WHERE user_id = ...`).
   - Ghi nhật ký cảnh báo an ninh cấp độ Critical vào `AuditLog`.
   - Trả về mã lỗi `401 Unauthorized` (`AUTH_TOKEN_REUSE_DETECTED`).
4. Nếu session hợp lệ (`status = 'ACTIVE'`, chưa hết hạn, `user.status = 'ACTIVE'`):
   - Đánh dấu session hiện tại là `REVOKED`, cập nhật `replaced_by_session_id = newSession.id`.
   - Tạo session mới, lưu `SHA-256` của refresh token mới.
   - Trả về Access Token mới và Set-Cookie Refresh Token mới.

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
    "timestamp": "2026-11-05T03:45:00.000Z",
    "requestId": "req_refresh_93a1"
  }
}
```

---

### 3.3. POST `/api/v1/auth/logout`
- **Mục đích:** Thu hồi session hiện tại, vô hiệu hóa Refresh Token và xóa cookie phía Client.
- **Xác thực:** Yêu cầu Bearer Access Token hoặc Refresh Token hợp lệ.

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
- **Mục đích:** Thu hồi tất cả các phiên đăng nhập đang hoạt động của người dùng (khi nghi ngờ rò rỉ tài khoản hoặc người dùng chủ động đăng xuất khỏi mọi thiết bị).
- **Xác thực:** Yêu cầu Bearer Access Token.

#### Request Body (`LogoutAllDto`):
```json
{
  "excludeCurrentSession": false
}
```

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Đã thu hồi tất cả các phiên đăng nhập",
  "data": {
    "revokedCount": 4
  }
}
```

---

### 3.5. GET `/api/v1/auth/me`
- **Mục đích:** Trả về toàn bộ hồ sơ bảo mật, vai trò, danh sách quyền thực tế và Data Scope đã được giải nén của người dùng đăng nhập hiện tại.
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
    "organization": {
      "id": "org_c478491c-76e9-4e0a-9d9e-108b3e811100",
      "code": "BIZPRO-CORP",
      "name": "Công ty Cổ phần Giải pháp Doanh nghiệp BizPro+"
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
        "name": "ADMIN",
        "description": "Quản trị viên toàn hệ thống",
        "dataScope": "ALL"
      }
    ],
    "permissions": [
      "crm.customers.read",
      "crm.customers.write",
      "crm.customers.export",
      "sales.orders.read",
      "sales.orders.write",
      "sales.orders.approve",
      "inventory.products.read",
      "inventory.stock.manage",
      "system.audit.read"
    ],
    "dataScopes": {
      "crm": "ALL",
      "sales": "ALL",
      "inventory": "ALL",
      "hrm": "ALL",
      "system": "ALL"
    }
  }
}
```

---

### 3.6. GET `/api/v1/auth/sessions`
- **Mục đích:** Liệt kê tất cả các phiên đăng nhập (thiết bị) đang hoạt động của người dùng hiện tại để phục vụ quản trị phiên từ xa.
- **Xác thực:** Yêu cầu Bearer Access Token.

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Danh sách phiên hoạt động",
  "data": [
    {
      "id": "sess_84b391d1-7290-482a-a92c-0e78f993104a",
      "deviceName": "Chrome on Windows 11",
      "ipAddress": "113.190.234.12",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
      "isCurrent": true,
      "createdAt": "2026-11-05T03:30:00.000Z",
      "lastUsedAt": "2026-11-05T03:45:00.000Z",
      "expiresAt": "2026-11-12T03:30:00.000Z"
    },
    {
      "id": "sess_112039aa-9901-419b-bb33-4411eeff0011",
      "deviceName": "BizPro Mobile on iPhone 15 Pro",
      "ipAddress": "14.232.18.90",
      "userAgent": "BizProMobile/1.0 (iOS 18.1)",
      "isCurrent": false,
      "createdAt": "2026-11-03T10:15:00.000Z",
      "lastUsedAt": "2026-11-04T18:20:00.000Z",
      "expiresAt": "2026-11-10T10:15:00.000Z"
    }
  ]
}
```

---

### 3.7. DELETE `/api/v1/auth/sessions/:id`
- **Mục đích:** Thu hồi một phiên đăng nhập cụ thể theo `sessionId` (ví dụ: đăng xuất từ xa máy tính ở cơ quan khi về nhà).
- **Xác thực:** Yêu cầu Bearer Access Token (`JwtAuthGuard`). Người dùng chỉ được xóa session của chính mình (kiểm tra `user_id` bắt buộc).

#### Path Parameters:
- `id`: UUID của session cần xóa.

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Thu hồi phiên đăng nhập thành công",
  "data": {
    "sessionId": "sess_112039aa-9901-419b-bb33-4411eeff0011",
    "status": "REVOKED"
  }
}
```

---

### 3.8. POST `/api/v1/auth/change-password`
- **Mục đích:** Người dùng đã đăng nhập tự đổi mật khẩu.
- **Xác thực:** Yêu cầu Bearer Access Token.
- **An ninh:** Sau khi đổi mật khẩu thành công:
  - Cập nhật `users.password_hash` bằng Argon2id.
  - Cập nhật `users.password_changed_at = NOW()`.
  - Thu hồi **toàn bộ các session khác** ngoại trừ session hiện tại (hoặc thu hồi toàn bộ bắt buộc đăng nhập lại).

#### Request Body (`ChangePasswordDto`):
```json
{
  "currentPassword": "OldPassword123!@#",
  "newPassword": "NewSecurePassword456$%"
}
```
*Validation Rules:*
- `currentPassword`: `@IsString()`, `@IsNotEmpty()`
- `newPassword`: `@IsString()`, `@MinLength(8)`, `@MaxLength(128)`, `@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)` (Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt).

#### Response 200 OK Body:
```json
{
  "statusCode": 200,
  "message": "Đổi mật khẩu thành công. Các phiên làm việc khác đã được tự động đăng xuất.",
  "data": {
    "passwordChangedAt": "2026-11-05T03:50:00.000Z"
  }
}
```

---

### 3.9. POST `/api/v1/auth/forgot-password`
- **Mục đích:** Yêu cầu gửi email liên kết khôi phục mật khẩu.
- **Xác thực:** Public.
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
- **Mục đích:** Xác thực mã token đặt lại mật khẩu từ email và cập nhật mật khẩu mới.
- **Xác thực:** Public (Token-based).
- **Token Design:** Token ngẫu nhiên cryptographically secure 256-bit (CSPRNG), lưu hash SHA-256 vào `users.password_reset_token_hash`. Thời gian hết hạn: 30 phút.

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

## 4. BẢNG MÃ LỖI CHUẨN TOÀN HỆ THỐNG (ERROR CODES REGISTRY)

| HTTP Status | Error Code | Mô tả | Xử lý khuyến nghị phía Client |
| :--- | :--- | :--- | :--- |
| 400 | `AUTH_VALIDATION_ERROR` | Tham số gửi lên không đúng định dạng class-validator | Hiển thị lỗi form tại trường tương ứng |
| 401 | `AUTH_INVALID_CREDENTIALS` | Sai email hoặc mật khẩu | Báo lỗi thông tin đăng nhập không hợp lệ |
| 401 | `AUTH_TOKEN_EXPIRED` | Access Token hoặc Refresh Token đã hết hạn | Gửi request `/refresh` hoặc điều hướng về `/login` |
| 401 | `AUTH_TOKEN_INVALID` | Token chữ ký không khớp, format rỗng hoặc bị can thiệp | Xóa token tại client, điều hướng về `/login` |
| 401 | `AUTH_TOKEN_REUSE_DETECTED` | Phát hiện tái sử dụng Refresh Token đã bị thu hồi | Xóa toàn bộ cookie/session, cảnh báo người dùng |
| 401 | `AUTH_SESSION_REVOKED` | Phiên đăng nhập đã bị xóa từ xa | Điều hướng người dùng về màn hình đăng nhập |
| 403 | `AUTH_ACCOUNT_DISABLED` | Tài khoản người dùng ở trạng thái INACTIVE/SUSPENDED | Thông báo liên hệ quản trị viên |
| 403 | `AUTH_FORBIDDEN_PERMISSION` | Người dùng thiếu quyền `<module>.<resource>.<action>` | Thông báo không có quyền thực hiện hành động |
| 403 | `AUTH_FORBIDDEN_SCOPE` | Bản ghi không thuộc quyền hạn DataScope của user | Ẩn dữ liệu hoặc thông báo phạm vi truy cập bị giới hạn |
| 403 | `AUTH_TENANT_MISMATCH` | Cố ý truy cập dữ liệu của Organization khác | Ghi log bảo mật, từ chối tuyệt đối |
| 423 | `AUTH_ACCOUNT_LOCKED` | Tài khoản bị tạm khóa do nhập sai liên tiếp quá 5 lần | Hiển thị bộ đếm ngược `lockedUntil` |
| 429 | `AUTH_RATE_LIMIT_EXCEEDED` | Gửi request vượt ngưỡng Throttler | Hiển thị yêu cầu thử lại sau ít phút |

---

## 5. BẢO ĐẢM TƯƠNG THÍCH VỚI DATABASE HARDENING PHASE 1C-C
- Không tạo các cột phá vỡ quan hệ 1-1 vật lý giữa `users.employee_id` và `employees.id` (Single physical FK, UNIQUE, ON DELETE SET NULL).
- Tổ chức truy vấn dữ liệu luôn truyền `organization_id` trích xuất trực tiếp từ JWT payload đã xác minh, đảm bảo tuân thủ tuyệt đối Composite Foreign Key `(sales_order_id, organization_id)` đã thiết lập ở Phase 1C-C.
