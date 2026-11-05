# BIZPRO+ PHASE 1D — DATABASE DESIGN & SECURITY SCHEMA SPECIFICATION
**Tài liệu:** `docs/PHASE_1D_DATABASE_DESIGN.md`  
**Phiên bản:** 2.0.0 (Comprehensive Cross-Document Architecture Revision)  
**Tác giả:** Senior Database Architect & Backend Architect  
**Trạng thái tài liệu:** DRAFT SPECIFICATION FOR ARCHITECTURAL REVIEW (DESIGN ONLY)  
**Gate Status:** NOT APPROVED — Awaiting Independent Multi-Agent Review  

---

## 1. ĐỐI SOÁT HIỆN TRẠNG CƠ SỞ DỮ LIỆU (EXISTING SCHEMA AUDIT)

Dựa trên kết quả truy vấn thực tế từ PostgreSQL 16 Catalog và tệp `backend/prisma/schema.prisma` tại Phase 1C-C:

| Bảng / Model | Trạng thái vật lý | Cấu trúc vật lý hiện có | Đánh giá & Khoảng trống bảo mật (Security Gap) |
| :--- | :---: | :--- | :--- |
| `organizations` | `VERIFIED` | `id`, `name`, `code` (Unique), `status`, `currency`, `timezone`... | Đã đầy đủ thông tin tổ chức. Sử dụng `CommonStatus` (`ACTIVE`, `INACTIVE`, `SUSPENDED`). |
| `users` | `VERIFIED` | `id`, `organization_id`, `employee_id` (Unique, Nullable), `full_name`, `email`, `password_hash`, `status`, `last_login_at` | **Thiếu các trường an ninh cốt lõi:** Chưa có đếm số lần đăng nhập sai (`failed_login_attempts`), thời gian khóa tài khoản (`locked_until`), thời điểm đổi mật khẩu (`password_changed_at`), mã băm đặt lại mật khẩu (`password_reset_token_hash`), và đặc biệt là **phiên bản xác thực (`auth_version`)** để thu hồi Access Token tức thời. |
| `roles` | `VERIFIED` | `id`, `organization_id`, `name`, `code`, `is_system` | Đã có khóa ngoại tới Organization (`ON DELETE CASCADE`). Đã có cờ `is_system` bảo vệ vai trò hệ thống không bị xóa. |
| `permissions` | `VERIFIED` | `id`, `code` (Unique), `module`, `action`, `description` | Đã chuẩn hóa danh mục 66 quyền toàn hệ thống. Bảng mang tính chất Global System Catalog. |
| `role_permissions`| `VERIFIED` | `role_id`, `permission_id`, `scope` (`DataScope`: `OWN`, `DEPARTMENT`, `ALL`) | Đã có Composite PK `@@id([role_id, permission_id])`. Khóa ngoại `ON DELETE CASCADE`. |
| `user_roles` | `VERIFIED` | `user_id`, `role_id` | Đã có Composite PK `@@id([user_id, role_id])`. Khóa ngoại `ON DELETE CASCADE`. |
| `user_sessions` | `MISSING` | **Chưa tồn tại trong PostgreSQL và Schema** | **LỖ HỔNG CỐT LÕI:** Không có bảng lưu phiên làm việc, không thể quản lý đăng nhập đa thiết bị và thu hồi phiên từ xa. |
| `refresh_tokens` | `MISSING` | **Chưa tồn tại trong PostgreSQL và Schema** | **LỖ HỔNG CỐT LÕI:** Chưa có bảng lưu vết lịch sử xoay vòng token (Token Family RTR), không thể phát hiện token reuse replay attack hay xử lý idempotent retry. |

---

## 2. CÁC THAY ĐỔI ĐỀ XUẤT CHO PHASE 1D (PROPOSED SCHEMA ADDITIONS)

> [!CAUTION]
> **Ràng buộc làm việc nghiêm ngặt (Design Only):** Dưới đây là các định nghĩa đề xuất về mặt kiến trúc. Hệ thống **CHƯA** chỉnh sửa `schema.prisma` và **CHƯA** tạo bất kỳ migration vật lý nào lên PostgreSQL cho đến khi nhận được phê duyệt chính thức từ người dùng.

### 2.1. Bổ sung Model `UserSession` (Bảng `user_sessions`)
- **Mục đích:** Đại diện cho một phiên đăng nhập vật lý của người dùng trên một thiết bị/trình duyệt cụ thể. Quản lý trạng thái phiên, IP, User Agent, và gắn liền với một `token_family_id` duy nhất.

#### Đặc tả Prisma Model:
```prisma
enum SessionStatus {
  ACTIVE
  REVOKED
  EXPIRED

  @@map("session_status")
}

model UserSession {
  id                String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId            String        @map("user_id") @db.Uuid
  organizationId    String        @map("organization_id") @db.Uuid
  tokenFamilyId     String        @unique @default(dbgenerated("gen_random_uuid()")) @map("token_family_id") @db.Uuid
  status            SessionStatus @default(ACTIVE)
  deviceName        String?       @map("device_name") @db.VarChar(100)
  ipAddress         String?       @map("ip_address") @db.VarChar(45)
  userAgent         String?       @map("user_agent") @db.Text
  createdAt         DateTime      @default(now()) @map("created_at") @db.Timestamptz
  lastActiveAt      DateTime      @default(now()) @map("last_active_at") @db.Timestamptz
  expiresAt         DateTime      @map("expires_at") @db.Timestamptz
  revokedAt         DateTime?     @map("revoked_at") @db.Timestamptz
  revocationReason  String?       @map("revocation_reason") @db.VarChar(100)

  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization      Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  refreshTokens     RefreshTokenRecord[]

  @@index([userId, status], name: "idx_user_sessions_user_status")
  @@index([organizationId], name: "idx_user_sessions_org")
  @@index([expiresAt], name: "idx_user_sessions_expires_at")
  @@map("user_sessions")
}
```

---

### 2.2. Bổ sung Model `RefreshTokenRecord` (Bảng `refresh_tokens`)
- **Mục đích:** Lưu trữ từng thế hệ Refresh Token trong chuỗi xoay vòng (Token Rotation Chain). Hỗ trợ phát hiện Token Reuse, kiểm soát race condition bằng khóa bi quan, và xử lý Idempotent Retry.

#### Đặc tả Prisma Model:
```prisma
enum RefreshTokenStatus {
  ACTIVE
  ROTATED
  REVOKED

  @@map("refresh_token_status")
}

model RefreshTokenRecord {
  id                String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  sessionId         String             @map("session_id") @db.Uuid
  tokenFamilyId     String             @map("token_family_id") @db.Uuid
  tokenHash         String             @unique @map("token_hash") @db.VarChar(64)
  sequenceNumber    Int                @default(1) @map("sequence_number")
  status            RefreshTokenStatus @default(ACTIVE)
  createdAt         DateTime           @default(now()) @map("created_at") @db.Timestamptz
  expiresAt         DateTime           @map("expires_at") @db.Timestamptz
  rotatedAt         DateTime?          @map("rotated_at") @db.Timestamptz
  replacedByTokenId String?            @map("replaced_by_token_id") @db.Uuid

  session           UserSession         @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  replacedByToken   RefreshTokenRecord? @relation("TokenReplacement", fields: [replacedByTokenId], references: [id], onDelete: SetNull)
  predecessorTokens RefreshTokenRecord[] @relation("TokenReplacement")

  @@index([tokenFamilyId, status], name: "idx_refresh_tokens_family_status")
  @@index([sessionId], name: "idx_refresh_tokens_session")
  @@index([tokenHash], name: "idx_refresh_tokens_hash")
  @@map("refresh_tokens")
}
```

---

### 2.3. Bổ sung các cột an ninh vào Model `User` (Bảng `users`)
- **Mục đích:** Hỗ trợ kiểm soát Brute-force lockout, luồng Forgot/Reset Password an toàn, và cơ chế **Immediate Access Token Revocation** qua `auth_version`.

#### Đặc tả Prisma Model cập nhật:
```prisma
model User {
  // ... các trường hiện có ...

  // Bổ sung cho Phase 1D Security:
  authVersion            Int       @default(1) @map("auth_version")
  failedLoginAttempts    Int       @default(0) @map("failed_login_attempts")
  lockedUntil            DateTime? @map("locked_until") @db.Timestamptz
  passwordChangedAt      DateTime? @map("password_changed_at") @db.Timestamptz
  passwordResetTokenHash String?   @map("password_reset_token_hash") @db.VarChar(64)
  passwordResetExpiresAt DateTime? @map("password_reset_expires_at") @db.Timestamptz

  sessions               UserSession[]

  // ... các relations hiện có ...
}
```

---

### 2.4. Bản thiết kế DDL vật lý (PostgreSQL 16 SQL Migration Blueprint)
Dưới đây là mã SQL thuần được chuẩn bị sẵn cho migration Phase 1D:

```sql
-- 1. Tạo Enums mới cho quản lý phiên và token
CREATE TYPE session_status AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');
CREATE TYPE refresh_token_status AS ENUM ('ACTIVE', 'ROTATED', 'REVOKED');

-- 2. Cập nhật bảng users với các cột an ninh
ALTER TABLE users 
ADD COLUMN auth_version INT NOT NULL DEFAULT 1,
ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0,
ADD COLUMN locked_until TIMESTAMPTZ,
ADD COLUMN password_changed_at TIMESTAMPTZ,
ADD COLUMN password_reset_token_hash VARCHAR(64),
ADD COLUMN password_reset_expires_at TIMESTAMPTZ;

CREATE INDEX idx_users_reset_token ON users(password_reset_token_hash) 
WHERE password_reset_token_hash IS NOT NULL;

-- 3. Tạo bảng user_sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    token_family_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    status session_status NOT NULL DEFAULT 'ACTIVE',
    device_name VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    revocation_reason VARCHAR(100)
);

CREATE INDEX idx_user_sessions_user_status ON user_sessions(user_id, status);
CREATE INDEX idx_user_sessions_org ON user_sessions(organization_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- 4. Tạo bảng refresh_tokens
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
    token_family_id UUID NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    sequence_number INT NOT NULL DEFAULT 1,
    status refresh_token_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    rotated_at TIMESTAMPTZ,
    replaced_by_token_id UUID REFERENCES refresh_tokens(id) ON DELETE SET NULL
);

CREATE INDEX idx_refresh_tokens_family_status ON refresh_tokens(token_family_id, status);
CREATE INDEX idx_refresh_tokens_session ON refresh_tokens(session_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);
```

---

## 3. LƯỢC ĐỒ QUAN HỆ THỰC THỂ BẢO MẬT (SECURITY ERD)

```mermaid
erDiagram
    organizations ||--o{ users : "has"
    organizations ||--o{ roles : "defines"
    organizations ||--o{ user_sessions : "scopes"
    
    employees ||--o| users : "linked_to (0..1, UNIQUE FK, ON DELETE SET NULL)"
    
    users ||--o{ user_sessions : "owns"
    users ||--o{ user_roles : "assigned"
    
    user_sessions ||--o{ refresh_tokens : "tracks history"
    refresh_tokens ||--o| refresh_tokens : "replaces (replaced_by_token_id)"
    
    roles ||--o{ user_roles : "granted_to"
    roles ||--o{ role_permissions : "includes"
    
    permissions ||--o{ role_permissions : "mapped_in"

    users {
        uuid id PK
        uuid organization_id FK
        uuid employee_id FK,UK "Nullable, ON DELETE SET NULL"
        varchar email
        varchar password_hash "Argon2id"
        int auth_version "Immediate Revocation"
        int failed_login_attempts "Default 0"
        timestamptz locked_until "Lockout policy"
        timestamptz password_changed_at
    }

    user_sessions {
        uuid id PK
        uuid user_id FK "ON DELETE CASCADE"
        uuid organization_id FK "ON DELETE CASCADE"
        uuid token_family_id UK "Token Family Boundary"
        session_status status "ACTIVE | REVOKED | EXPIRED"
        varchar device_name
        varchar ip_address
        text user_agent
        timestamptz expires_at "7 days"
        timestamptz revoked_at
    }

    refresh_tokens {
        uuid id PK
        uuid session_id FK "ON DELETE CASCADE"
        uuid token_family_id Index
        varchar token_hash UK "SHA-256 Hex"
        int sequence_number "Monotonic increment"
        refresh_token_status status "ACTIVE | ROTATED | REVOKED"
        timestamptz expires_at "7 days"
        timestamptz rotated_at
        uuid replaced_by_token_id FK
    }

    roles {
        uuid id PK
        uuid organization_id FK
        varchar code "ORG_ADMIN, SALES_STAFF..."
        boolean is_system "Protected system role"
    }

    permissions {
        uuid id PK
        varchar code UK "module.resource.action"
        varchar module
        varchar action
    }

    role_permissions {
        uuid role_id PK,FK
        uuid permission_id PK,FK
        DataScope scope "Resource Contextual Policy"
    }

    user_roles {
        uuid user_id PK,FK
        uuid role_id PK,FK
    }
```

---

## 4. ĐÁNH GIÁ TÁC ĐỘNG VÀ BẢO TOÀN INVARIANT (MIGRATION IMPACT ANALYSIS)

### 4.1. Bảo toàn 100% Invariants đã nghiệm thu tại Phase 1C-C:
1. **User–Employee Relationship:** Giữ nguyên quy chuẩn 0..1 $\leftrightarrow$ 0..1, `users.employee_id` là single physical FK, `UNIQUE` và có hành vi `ON DELETE SET NULL`.
2. **Composite Foreign Keys:** Giữ nguyên khóa ngoại phức hợp `payment_transactions(sales_order_id, organization_id) REFERENCES sales_orders(id, organization_id)`.
3. **11 CHECK Constraints:** Toàn bộ 11 constraints bảo vệ số dư, tiền tệ, giá trị không âm trên Sales Order, Inventory và Payment không bị đụng chạm.
4. **Snapshot Trigger:** Trigger bảo vệ tính toàn vẹn địa chỉ giao hàng và thông tin khách hàng trên đơn hàng không bị ảnh hưởng.

### 4.2. Tác động đến dữ liệu hiện có & Hiệu năng:
- **Thêm bảng mới (`user_sessions`, `refresh_tokens`):** Hoàn toàn là bảng mới, không có bất kỳ xung đột dữ liệu hay rủi ro migration nào.
- **Thêm cột vào bảng `users`:**
  - `auth_version` có `DEFAULT 1` $\rightarrow$ Thao tác metadata-only trong PostgreSQL 11+, không viết lại bảng (không lock bảng).
  - `failed_login_attempts` có `DEFAULT 0` $\rightarrow$ Metadata-only update.
  - Các cột thời gian và hash đều là `NULLABLE` $\rightarrow$ Thực thi tức thì (< 5ms).
- **Chiến lược dọn dẹp dữ liệu (Data Retention & Pruning Policy):**
  - Định kỳ chạy Cron Job hoặc PG_CRON xóa các bản ghi `refresh_tokens` và `user_sessions` có trạng thái `REVOKED` hoặc `EXPIRED` đã quá 30 ngày để tối ưu dung lượng đĩa và chỉ mục.
