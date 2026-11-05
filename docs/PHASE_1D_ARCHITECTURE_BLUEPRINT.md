# KIẾN TRÚC TỔNG THỂ XÁC THỰC & PHÂN QUYỀN (PHASE 1D)
## BIZPRO+ AUTHENTICATION & RBAC ARCHITECTURE BLUEPRINT
**Tài liệu:** `docs/PHASE_1D_ARCHITECTURE_BLUEPRINT.md`  
**Phiên bản:** 1.0 (Draft Architecture Specification)  
**Tác giả:** Senior Security Architect, Backend Architect & Database Architect  
**Trạng thái:** SẴN SÀNG ĐỂ REVIEW & CHỜ PHÊ DUYỆT GATE (DESIGN ONLY)  

---

## 1. TỔNG QUAN KIẾN TRÚC (ARCHITECTURE OVERVIEW)

BizPro+ là hệ thống quản trị doanh nghiệp hợp nhất đa tổ chức (Multi-Tenant Modular Monolith). Kiến trúc bảo mật của Phase 1D được thiết kế dựa trên nguyên lý **Zero-Trust**, **Deny-by-Default** và **Defense-in-Depth** (Bảo vệ đa tầng).

```mermaid
graph TD
    Client["Client (Next.js 15 Web / Mobile App)"]
    
    subgraph Edge_Security["Tầng Biên Bảo mật (Edge & Gateway)"]
        RateLimiter["ThrottlerGuard (Rate Limiting 10 req/min)"]
        CorsHelmet["CORS & Helmet (Security Headers)"]
    end

    subgraph Authentication_Layer["Tầng Xác thực (Authentication Engine)"]
        JwtGuard["JwtAuthGuard (Passport JWT)"]
        JwtStrategy["JwtStrategy (Verify Signature & Expiration)"]
        TenantExtractor["TenantContextInterceptor (Resolve Org Context from JWT)"]
    end

    subgraph Authorization_Layer["Tầng Phân quyền (Authorization Engine)"]
        PermGuard["PermissionsGuard (@RequirePermissions)"]
        ScopeEngine["DataScopeEvaluator (OWN | DEPARTMENT | ALL)"]
    end

    subgraph Domain_Services["Tầng Nghiệp vụ (Domain Services)"]
        AuthService["AuthService (Argon2id, Session Lifecycle)"]
        UserService["UsersService / RolesService"]
        BusinessServices["CRM, Sales, Inventory, HRM Services"]
    end

    subgraph Database_Layer["Tầng Cơ sở dữ liệu (PostgreSQL 16)"]
        UsersTable[("users (password_hash, lockout)")]
        SessionsTable[("user_sessions (sha256_refresh_token)")]
        RbacTables[("roles, permissions, role_permissions, user_roles")]
        TenantData[("Multi-Tenant Business Tables")]
    end

    Client --> CorsHelmet --> RateLimiter
    RateLimiter --> JwtGuard --> JwtStrategy
    JwtStrategy --> TenantExtractor
    TenantExtractor --> PermGuard --> ScopeEngine
    ScopeEngine --> BusinessServices
    AuthService --> UsersTable
    AuthService --> SessionsTable
    PermGuard --> RbacTables
    BusinessServices --> TenantData
```

### Các nguyên tắc nền tảng:
1. **Cô lập ngữ cảnh đa tổ chức (Tenant Context Isolation):** `organization_id` tuyệt đối không bao giờ được lấy từ `request.body`, `request.query` hay client headers. Ngữ cảnh tổ chức chỉ được phân giải từ chữ ký số JWT Access Token đã qua kiểm chứng.
2. **Xác thực và Phân quyền phân tách rõ rệt:**
   - *Xác thực (Authentication):* Trả lời câu hỏi *"Bạn là ai? Danh tính của bạn còn hợp lệ không?"* (do `JwtAuthGuard` và `SessionManager` xử lý).
   - *Phân quyền (Authorization):* Trả lời câu hỏi *"Bạn được phép làm gì trên tài nguyên nào và ở phạm vi nào?"* (do `PermissionsGuard` và `DataScopeEngine` xử lý).
3. **Mặc định từ chối (Deny by Default):** Mọi endpoint không được gắn decorator `@Public()` đều mặc định yêu cầu Access Token hợp lệ. Mọi thao tác ghi/đọc dữ liệu đều đòi hỏi quyền năng tường minh.
4. **Không tin cậy tầng Client:** Ẩn/hiện nút bấm trên giao diện Next.js chỉ là cải thiện trải nghiệm người dùng (UX). Toàn bộ quy tắc bảo mật và phạm vi dữ liệu được ép buộc $100\%$ tại NestJS Controller, Service và Database Queries.

---

## 2. LUỒNG XÁC THỰC CHI TIẾT (AUTHENTICATION FLOWS)

### 2.1. Luồng Đăng nhập (Login Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Client
    participant Controller as AuthController
    participant Guard as LocalAuthGuard / Throttler
    participant Service as AuthService
    participant Hasher as PasswordHasher (Argon2id)
    participant DB as PostgreSQL 16
    participant Audit as AuditLogService

    User->>Controller: POST /api/v1/auth/login { email, password, deviceInfo }
    Controller->>Guard: Kiểm tra Brute-force Rate Limit (IP & Email)
    Guard-->>Controller: Cho phép tiếp tục
    Controller->>Service: authenticate(email, password, metadata)
    Service->>DB: SELECT * FROM users WHERE email = ? (Organization-scoped/Global unique)
    DB-->>Service: User Record (kèm password_hash, status, failed_attempts, locked_until)
    
    alt Tài khoản bị khóa (locked_until > NOW)
        Service-->>Controller: Ném lỗi 423 Locked ("Tài khoản tạm khóa do đăng nhập sai nhiều lần")
        Service->>Audit: Ghi log AUTH_LOGIN_LOCKED
    else User status <> 'ACTIVE'
        Service-->>Controller: Ném lỗi 403 Forbidden ("Tài khoản đã bị vô hiệu hóa")
    else Mật khẩu không khớp
        Service->>Hasher: verify(password, passwordHash)
        Hasher-->>Service: FALSE
        Service->>DB: UPDATE users SET failed_attempts = failed_attempts + 1, locked_until = CASE...
        Service->>Audit: Ghi log AUTH_LOGIN_FAILED
        Service-->>Controller: Ném lỗi 401 Unauthorized ("Email hoặc mật khẩu không chính xác")
    else Mật khẩu hợp lệ
        Service->>Hasher: verify(password, passwordHash)
        Hasher-->>Service: TRUE
        Service->>DB: UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login_at = NOW()
        
        Note over Service: 1. Tạo JWT Access Token (TTL: 15 phút)<br/>2. Tạo Refresh Token ngẫu nhiên (CSPRNG 64 bytes)<br/>3. Băm Refresh Token = SHA-256
        
        Service->>DB: INSERT INTO user_sessions (user_id, organization_id, refresh_token_hash, device_info, ip_address, expires_at)
        DB-->>Service: Session Created
        Service->>Audit: Ghi log AUTH_LOGIN_SUCCESS
        Service-->>Controller: Return { accessToken, refreshToken, user, organization }
        Controller-->>User: HTTP 200 OK (Set HttpOnly Cookie cho Refresh Token & Bearer Body)
    end
```

### 2.2. Luồng Xoay vòng Refresh Token (Refresh Token Rotation & Reuse Detection)

Cơ chế **Refresh Token Rotation (RTR)** bảo đảm mỗi Refresh Token chỉ được sử dụng duy nhất một lần. Nếu kẻ tấn công đánh cắp được một Refresh Token cũ và cố tình gửi lại, hệ thống sẽ kích hoạt quy trình **Token Family Invalidation**.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Service as AuthService
    participant DB as PostgreSQL 16
    participant Audit as AuditLogService

    Client->>Service: POST /api/v1/auth/refresh { refreshToken }
    Note over Service: Băm SHA-256(refreshToken)
    Service->>DB: SELECT * FROM user_sessions WHERE refresh_token_hash = ? FOR UPDATE
    
    alt Không tìm thấy hash HOẶC Session đã có trạng thái REVOKED (REUSE DETECTED!)
        Note over Service,Audit: PHÁT HIỆN TẤN CÔNG REPLAY TOKEN CŨ!
        Service->>DB: UPDATE user_sessions SET status = 'REVOKED' WHERE user_id = ? (Thu hồi toàn bộ gia đình Token)
        Service->>Audit: CẢNH BÁO AN NINH: TOKEN_REUSE_DETECTED (Tự động đăng xuất mọi thiết bị)
        Service-->>Client: Ném lỗi 401 Unauthorized ("Phát hiện phiên truy cập không hợp lệ. Vui lòng đăng nhập lại!")
    else Session quá hạn (expires_at < NOW) HOẶC status = 'EXPIRED'
        Service->>DB: UPDATE user_sessions SET status = 'EXPIRED' WHERE id = ?
        Service-->>Client: Ném lỗi 401 Unauthorized ("Phiên đăng nhập đã hết hạn")
    else Session hợp lệ (ACTIVE & Chưa hết hạn)
        Note over Service: 1. Vô hiệu hóa Refresh Token hiện tại<br/>2. Cấp phát cặp Access Token & Refresh Token mới tinh<br/>3. Băm SHA-256 cho Refresh Token mới
        Service->>DB: UPDATE user_sessions SET refresh_token_hash = new_hash, last_used_at = NOW(), expires_at = NOW() + 7 days WHERE id = ?
        Service->>Audit: Ghi log AUTH_TOKEN_ROTATED
        Service-->>Client: HTTP 200 OK { accessToken, refreshToken }
    end
```

---

## 3. QUẢN LÝ PHIÊN ĐĂNG NHẬP (SESSION LIFECYCLE & STATE MACHINE)

### 3.1. Máy trạng thái phiên (Session State Machine)

Một phiên làm việc (`UserSession`) được định nghĩa tuần tự qua 4 trạng thái bất biến:

```mermaid
stateDiagram-v2
    [*] --> ACTIVE: Đăng nhập thành công (Login)
    
    ACTIVE --> ACTIVE: Xoay vòng token thành công (RTR Refresh)
    ACTIVE --> REVOKED: Người dùng chủ động Logout
    ACTIVE --> REVOKED: Admin vô hiệu hóa tài khoản / Thu hồi quyền
    ACTIVE --> REVOKED: Đổi mật khẩu (Revoke All Sessions)
    ACTIVE --> REVOKED: Phát hiện Token Reuse (Security Incident)
    ACTIVE --> EXPIRED: Hết hạn 7 ngày không xoay vòng
    
    REVOKED --> [*]
    EXPIRED --> [*]
```

### 3.2. Bảng ma trận chuyển đổi trạng thái (State Transition Matrix):

| Trạng thái hiện tại | Sự kiện kích hoạt (Event) | Trạng thái đích | Hành động kèm theo (Side Effects) |
| :--- | :--- | :---: | :--- |
| `ACTIVE` | `TOKEN_REFRESH` (Token hợp lệ) | `ACTIVE` | Cập nhật `refresh_token_hash` mới, gia hạn `expires_at`, tăng `rotation_counter`. |
| `ACTIVE` | `USER_LOGOUT` (Thiết bị hiện tại) | `REVOKED` | Cập nhật `revoked_at = NOW()`, `revocation_reason = 'USER_LOGOUT'`. Cookie bị xóa. |
| `ACTIVE` | `LOGOUT_ALL` (Đăng xuất mọi thiết bị) | `REVOKED` | Thu hồi toàn bộ các `user_sessions` đang active của User. |
| `ACTIVE` | `PASSWORD_CHANGED` | `REVOKED` | Thu hồi toàn bộ session cũ (trừ phiên hiện tại nếu client chọn ghi nhớ). |
| `ACTIVE` | `TOKEN_REUSE_DETECTED` | `REVOKED` | Lập tức thu hồi **toàn bộ phiên của người dùng**, gửi cảnh báo qua email/audit log. |
| `ACTIVE` | `TTL_TIMEOUT` (> 7 ngày) | `EXPIRED` | Phiên bị đóng tự nhiên, yêu cầu người dùng xác thực lại từ đầu. |
| `REVOKED` / `EXPIRED` | Mọi request sử dụng lại token | `REJECTED` | Trả về HTTP 401 Unauthorized, không cho phép phục hồi trạng thái. |

---

## 4. AN NINH ĐA TỔ CHỨC (MULTI-TENANT SECURITY ARCHITECTURE)

BizPro+ áp dụng mô hình **Shared Database, Shared Schema với Discriminator Column (`organization_id`)**. Để bảo đảm tuyệt đối dữ liệu không bị rò rỉ chéo giữa các tổ chức, hệ thống triển khai kiến trúc 3 lớp bảo vệ:

```
[Layer 1: JWT Signature Verification] ──► Giữ organization_id bất biến trong Payload ký số
                  │
[Layer 2: NestJS TenantContextInterceptor] ──► Inject organization_id vào AsyncLocalStorage (Request Scope)
                  │
[Layer 3: Prisma Client Extension] ──► Tự động chèn { where: { organizationId } } vào mọi câu lệnh ORM
```

### 4.1. Cấu trúc JWT Payload chuẩn hóa
```json
{
  "sub": "b2f5c782-9e12-42da-912a-8c7634f1e920",
  "email": "nguyen.vana@bizpro.vn",
  "orgId": "d1c9e421-4321-4a12-8910-123456789abc",
  "sessionId": "a8712345-6789-4def-0123-abcdef456789",
  "roles": ["SALES_STAFF"],
  "iat": 1793849000,
  "exp": 1793849900,
  "iss": "bizpro-auth-service",
  "aud": "bizpro-api"
}
```

### 4.2. Đánh giá kỹ thuật về PostgreSQL Row-Level Security (RLS)
- **Ưu điểm của RLS:** Là tầng bảo vệ tận cùng tại PostgreSQL Engine. Ngay cả khi developer viết query raw thiếu `WHERE organization_id = ...`, PostgreSQL vẫn tự động lọc dữ liệu theo cấu hình session variable `current_setting('app.current_organization_id')`.
- **Thách thức đối với Prisma & Connection Pooling:**
  - Prisma Client sử dụng Connection Pool (PgBouncer hoặc pooling nội bộ). Các kết nối được tái sử dụng liên tục giữa các request của các Organization khác nhau.
  - Nếu sử dụng `SET LOCAL app.current_organization_id = ...`, bắt buộc mọi truy vấn phải được bọc trong một Database Transaction tường minh. Điều này làm tăng độ trễ (overhead) thêm $15-25\%$ và dễ gây nghẽn pool kết nối khi tải cao.
- **Quyết định kiến trúc:**
  - **Phase 1D:** Triển khai **Prisma Client Extension / NestJS Interceptor Enforced Tenancy**. Tầng ORM tự động inject `organizationId` vào 100% queries.
  - **Khuyến nghị RLS:** Chưa bật RLS vật lý ở Phase 1D để tránh xung đột với Prisma Connection Pooling khi chưa có PgBouncer session affinity. Sẽ đánh giá RLS ở giai đoạn Enterprise Hardening khi triển khai Dedicated Read/Write Replicas.

### 4.3. Kế hoạch bổ sung Composite Foreign Keys cho Inventory
Tại Phase 1C-C, kiểm toán đã ghi nhận các bảng `inventory_reservations` và `inventory_balances` hiện chưa có Composite FK đa cột đến `sales_orders(id, organization_id)` và `warehouses(id, organization_id)`.
- **Đánh giá ảnh hưởng đến Phase 1D:** Việc thiếu Composite FK ở tầng tồn kho **KHÔNG ẢNH HƯỞNG ĐẾN AUTHENTICATION & RBAC**, vì Phase 1D chỉ làm việc trên các bảng `users`, `user_sessions`, `roles`, `permissions`, `organizations`.
- **Lộ trình thực hiện:** Đã đưa vào danh mục Hardening đợt 2, sẽ bổ sung migration tạo Composite FK cho Inventory đồng thời với việc tích hợp API đơn hàng ở Phase 2.

---

## 5. KIẾN TRÚC PHÂN QUYỀN RBAC & DATA SCOPE ENGINE

### 5.1. Mô hình Phân quyền (RBAC Entity Relationship)

```mermaid
erDiagram
    ORGANIZATION ||--o{ ROLE : "owns"
    ORGANIZATION ||--o{ USER : "employs"
    USER ||--o{ USER_ROLE : "assigned"
    ROLE ||--o{ USER_ROLE : "granted"
    ROLE ||--o{ ROLE_PERMISSION : "contains"
    PERMISSION ||--o{ ROLE_PERMISSION : "maps"
    USER ||--o{ USER_SESSION : "establishes"

    ROLE {
        uuid id PK
        uuid organization_id FK
        varchar code
        varchar name
        boolean is_system
    }

    PERMISSION {
        uuid id PK
        varchar code UK
        varchar module
        varchar action
        text description
    }

    ROLE_PERMISSION {
        uuid role_id PK,FK
        uuid permission_id PK,FK
        DataScope scope
    }

    USER_ROLE {
        uuid user_id PK,FK
        uuid role_id PK,FK
    }

    USER_SESSION {
        uuid id PK
        uuid user_id FK
        uuid organization_id FK
        varchar refresh_token_hash
        SessionStatus status
        timestamptz expires_at
    }
```

### 5.2. Danh mục Vai trò Hệ thống (System Predefined Roles)
BizPro+ định nghĩa sẵn 6 System Roles (có `is_system = true`, không thể bị xóa):
1. **Organization Admin (`ORG_ADMIN`):** Quản trị toàn bộ tổ chức, quản lý người dùng, phân vai trò, xem toàn bộ dữ liệu (Scope: `ALL` trên toàn bộ 66 permissions).
2. **Sales Manager (`SALES_MANAGER`):** Quản lý đội ngũ bán hàng, duyệt báo giá, xem toàn bộ dữ liệu CRM và Đơn hàng của phòng ban (Scope: `DEPARTMENT`).
3. **Sales Staff (`SALES_STAFF`):** Tạo và chăm sóc Lead, Khách hàng, Deal được giao; lập đơn hàng nháp (Scope: `OWN`).
4. **Warehouse Manager (`WAREHOUSE_MANAGER`):** Quản lý xuất nhập tồn, lập lệnh kiểm kê, xác nhận phiếu xuất/nhập kho (Scope: `ALL` các kho trong tổ chức).
5. **HR Manager (`HR_MANAGER`):** Quản lý hồ sơ nhân sự, hợp đồng lao động, phê duyệt đơn xin nghỉ phép, chốt công (Scope: `ALL`).
6. **Viewer / Regular Employee (`EMPLOYEE`):** Tự chấm công, gửi đơn xin nghỉ phép cá nhân, xem thông tin bảng lương của chính mình (Scope: `OWN`).

### 5.3. Động cơ Đánh giá Phạm vi Dữ liệu (Data Scope Engine)
Khi User sở hữu nhiều vai trò (Multi-Role), quyền hạn được áp dụng theo **Nguyên tắc Hợp nhất Quyền cao nhất (Most Permissive Scope Union)**:
$$\text{EffectiveScope} = \max(\text{Scope}_{\text{Role}_1}, \text{Scope}_{\text{Role}_2}, \dots)$$
Với thứ tự ưu tiên:
$$\text{ALL} > \text{DEPARTMENT} > \text{OWN}$$

```mermaid
flowchart TD
    Req["Request Client gọi API (VD: GET /api/v1/crm/deals)"] --> JWT["JwtAuthGuard: Giải mã User ID & Org ID"]
    JWT --> PermGuard["PermissionsGuard: Kiểm tra mã 'crm.deals.read'"]
    PermGuard --> HasPerm{"User có quyền này không?"}
    HasPerm -- "KHÔNG" --> Err403["403 Forbidden: Không có quyền truy cập"]
    HasPerm -- "CÓ" --> ScopeEval["Đánh giá Data Scope từ các Roles"]
    
    ScopeEval --> CheckScope{"Phạm vi lớn nhất là gì?"}
    CheckScope -- "ALL" --> QueryAll["WHERE organization_id = :orgId"]
    CheckScope -- "DEPARTMENT" --> QueryDept["WHERE organization_id = :orgId AND department_id = :userDeptId"]
    CheckScope -- "OWN" --> QueryOwn["WHERE organization_id = :orgId AND (created_by = :userId OR assigned_to = :userId)"]
    
    QueryAll --> ReturnData["Trả về dữ liệu đã được lọc an toàn"]
    QueryDept --> ReturnData
    QueryOwn --> ReturnData
```

---

## 6. XỬ LÝ CÁC TÌNH HUỐNG BIÊN BẢO MẬT (SECURITY EDGE CASES)

| Tình huống biên (Edge Case) | Hành vi và Ràng buộc Kỹ thuật được Thực thi |
| :--- | :--- |
| **1. User bị khóa khi đang có JWT Access Token còn hạn** | Access Token có thời hạn ngắn (15 phút). Khi hết 15 phút, request gọi refresh token sẽ bị chặn đứng tại DB vì `users.status = 'INACTIVE'` hoặc `locked_until > NOW()`. Đối với thao tác nhạy cảm (Đổi mật khẩu, Chuyển tiền), hệ thống kiểm tra trạng thái User realtime trong DB. |
| **2. Admin thu hồi Role / Permission của User đang đăng nhập** | Khi RolePermission bị thay đổi, hệ thống phát tín hiệu `UserPermissionsChangedEvent`. Toàn bộ phiên làm việc của User trong bảng `user_sessions` được cập nhật `status = 'REVOKED'`, buộc người dùng phải xác thực lại để lấy quyền mới. |
| **3. Employee bị xóa vật lý nhưng User vẫn tồn tại** | Nhờ ràng buộc `ON DELETE SET NULL` trên `users.employee_id`, User vẫn tồn tại nhưng không còn liên kết nhân viên. Data Scope `DEPARTMENT` lập tức thoái lui về `OWN` (vì `user.employee.departmentId = NULL`), ngăn chặn lộ dữ liệu phòng ban cũ. |
| **4. User bị điều chuyển sang Phòng ban khác** | Khi `employees.department_id` cập nhật sang phòng ban B, câu truy vấn dữ liệu Scope `DEPARTMENT` tiếp theo sẽ tự động đọc `department_id` mới từ bảng `employees`, lập tức tước quyền xem dữ liệu phòng ban A mà không cần đăng xuất. |
| **5. Organization bị vô hiệu hóa (Disabled Tenant)** | Khi `organizations.status = 'INACTIVE'`, `TenantContextInterceptor` chặn đứng 100% request từ cửa ngõ Controller với mã lỗi `403 Forbidden: Tổ chức của bạn đã bị tạm khóa`. |
| **6. Đổi mật khẩu thành công** | Cập nhật `users.password_hash`, đồng thời cập nhật `user_sessions.status = 'REVOKED'` cho toàn bộ các session của User (ngoại trừ session hiện tại đang thực hiện lệnh đổi mật khẩu). |
