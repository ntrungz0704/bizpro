# BIZPRO+ PHASE 1D — ARCHITECTURAL DECISION LOG & ADR GOVERNANCE
**Tài liệu:** `docs/PHASE_1D_DECISION_LOG.md`  
**Phiên bản:** 3.2.0-SYNCHRONIZED (Comprehensive Architectural Decision Log)  
**Tác giả:** Principal Security Architect, Backend Architect & Database Architect  
**Trạng thái tài liệu:** SPECIFICATION SYNCHRONIZED — CONTROLLED DOCUMENTATION (DESIGN ONLY)  
**Gate Status:** NOT APPROVED (HOLD) — Implementation Gate Strict Preservation  

---

## 1. QUY CHUẨN QUẢN TRỊ QUYẾT ĐỊNH KIẾN TRÚC (ADR GOVERNANCE)

Mọi quyết định kỹ thuật trong Phase 1D đều được lưu vết minh bạch theo chuẩn Architectural Decision Record (ADR). Mỗi quyết định thể hiện rõ:
- **Ngữ cảnh & Thách thức (Context)**
- **Quyết định (Decision)**
- **Các phương án đã cân nhắc (Alternatives Considered)**
- **Hệ quả & Đánh đổi (Consequences)**
- **Tác động an ninh (Security Implications)**
- **Trạng thái phê duyệt (Status):**
  - `PROPOSED`: Đề xuất kiến trúc đã qua kiểm định kỹ thuật R3.2, đang chờ phê duyệt.
  - `SUPERSEDED`: Quyết định cũ đã bị bác bỏ và được thay thế bằng quyết định mới.
  - `ACCEPTED`: Chỉ được áp dụng khi người dùng phê duyệt bằng văn bản chính thức.

---

## 2. BẢNG TỔNG HỢP VÒNG ĐỜI CÁC ADR TRONG PHASE 1D

| ADR ID | Tên Quyết định Kiến trúc | Trạng thái | Ghi chú & Liên kết |
| :--- | :--- | :---: | :--- |
| **ADR-1D-001** | Thuật toán băm mật khẩu Argon2id | `PROPOSED` | $m=64\text{MB}, t=3, p=4$, MaxLength 128 chars chống DoS CPU |
| **ADR-1D-002** | Vòng đời Token & Dedicated Connection LISTEN/NOTIFY | `PROPOSED` | Dedicated Connection, Heartbeat 15s ($T_{\text{detect}} \le 18\text{s}$), Safe Degradation |
| **ADR-1D-003** | Kiến trúc Dual-Endpoint CSRF (`/refresh/web` vs `/mobile`) | `PROPOSED` | Tách riêng Web (Cookie-only) và Mobile (Bearer-only); Bỏ đoán client qua Cookie |
| **ADR-1D-004** | Two-Step Idempotency Resolution & AES-256-GCM Envelope | `PROPOSED` | Tra cứu 2 bước scoped session; Nonce 96-bit Hybrid; Canonical Binary AAD |
| **ADR-1D-005** | Mô hình Phân quyền RBAC Deny-by-default | `PROPOSED` | 66 permissions nghiệp vụ chuẩn 3 cấp độ `<module>.<resource>.<action>` |
| **ADR-1D-006** | Maximum Scope Priority (`OWN < DEPARTMENT < ALL`) | `SUPERSEDED` | **BÁC BỎ HOÀN TOÀN**, thay thế bằng **ADR-1D-008** |
| **ADR-1D-007** | Phân tách Multi-Tenant dựa vào Prisma Extension | `SUPERSEDED` | **BÁC BỎ HOÀN TOÀN**, thay thế bằng **ADR-1D-009** |
| **ADR-1D-008** | Resource-Specific Data Scope & Contextual Authorization | `PROPOSED` | Thay thế ADR-1D-006: Đánh giá theo 5 yếu tố ngữ cảnh tài nguyên |
| **ADR-1D-009** | Layered Multi-Tenant Defense-in-Depth & PostgreSQL RLS | `PROPOSED` | Thay thế ADR-1D-007: RLS 51 bảng thực tế + Prisma `$queryRaw` với `set_config` |
| **ADR-1D-010** | Strict Directed Linear Token Chain & Anti-Cycle DDL | `PROPOSED` | Tạo mới R3.2: Khóa ngoại hỗn hợp `(replaced_by, family_id)`, Monotonic Sequence |
| **ADR-1D-011** | Account Lockout Thống Nhất (423 Lần 5), HMAC-OTP & KS-Test | `PROPOSED` | Tạo mới R3.2: 423 Lần 5, mã hóa OTP bằng Server-side HMAC, KS-Test $p > 0.05$ |
| **ADR-1D-012** | Giao thức Khóa Bi quan Phân tầng Triệt tiêu TOCTOU | `PROPOSED` | Tạo mới R3.2: Revocation Linearization Point, khóa kép `FOR SHARE`, thứ tự tăng dần |

---

## 3. CHI TIẾT CÁC BẢN GHI QUYẾT ĐỊNH KIẾN TRÚC MỚI VÀ CẬP NHẬT

### ADR-1D-002: Vòng đời Token và Kênh LISTEN/NOTIFY Chế Độ Suy Thoái An Toàn
- **Trạng thái:** `PROPOSED`.
- **Quyết định:**
  - Token TTL: Access Token 15 phút, Refresh Token 7 ngày.
  - Sử dụng kết nối Dedicated PostgreSQL Client riêng biệt cho `LISTEN auth_version_invalidation`, bỏ qua connection pooling.
  - Giám sát sức khỏe 3 tầng: TCP Keepalive (10s), Application Heartbeat ping mỗi $15\text{s}$ với query timeout 3s ($T_{\text{detect}} \le 18\text{s}$), driver socket error handlers.
  - Safe Degradation: Khi mất kết nối LISTEN $\to$ Tắt cache, truy vấn trực tiếp DB (0ms độ trễ thu hồi). Khi kết nối lại $\to$ `cache.clear()`, đăng ký lại LISTEN. Khi DB sập $\to$ Fail-Closed (HTTP 503).

---

### ADR-1D-003: Kiến Trúc Phân Tách Dual-Endpoint Cho Web và Mobile
- **Trạng thái:** `PROPOSED`.
- **Quyết định:**
  - Bãi bỏ hoàn toàn việc phân loại client bằng sự hiện diện của Cookie.
  - `POST /api/v1/auth/refresh/web`: Nhận Cookie ONLY (`SameSite=Strict`, `HttpOnly`), bắt buộc CSRF Guard (Origin Whitelist và `X-Requested-With`). Chặn token gửi qua Body/Header.
  - `POST /api/v1/auth/refresh/mobile`: Nhận Bearer Token ONLY trong Header/Body, hoàn toàn không đọc Cookie, miễn nhiễm tự nhiên với CSRF.

---

### ADR-1D-004: Two-Step Idempotency Resolution Protocol & AES-256-GCM Envelope
- **Trạng thái:** `PROPOSED`.
- **Quyết định:**
  - Chuẩn hóa quy trình phân giải Idempotency 2 bước: Bước 1 khóa xác thực Token đầu vào (`SELECT ... FOR UPDATE`), Bước 2 tra cứu bản ghi Idempotency có ràng buộc `session_id = token.session_id`.
  - Phân định rõ 6 nhánh: Cùng key/token còn hạn (200 OK replay), cùng key/token quá hạn (401 Fail-Closed Revoke Family), cùng key khác token (422 Payload Mismatch), khác key cùng token đã rotated (401 Token Reuse Detected).
  - Khẳng định: 5s và 30s là Recovery Policy, không phải bằng chứng an ninh.
  - Mã hóa Envelope bằng AES-256-GCM với Nonce 96-bit Hybrid (`Timestamp 48b || Worker ID 16b || CSPRNG 32b`) và Canonical Binary Length-Prefixed AAD. Vòng đời khóa: `ACTIVE` $\to$ `RETIRED` (24h) $\to$ `PURGED`.

---

### ADR-1D-009: Layered Multi-Tenant Defense-in-Depth & PostgreSQL RLS (51 Bảng Thực Tế)
- **Trạng thái:** `PROPOSED`.
- **Quyết định:**
  - Bật PostgreSQL Row Level Security (RLS) trên toàn bộ 51 models đối soát từ `prisma/schema.prisma` thực tế (39 bảng trực tiếp, 10 bảng con với subquery `EXISTS`, 2 bảng gốc).
  - Cú pháp thiết lập tenant context bắt buộc sử dụng:
    `await tx.$queryRawSELECT set_config('app.current_organization_id', ${orgId}::text, true);` với cờ `is_local = true`.
  - Khẳng định: RLS là cơ chế Defense-in-Depth, không thể chống lại Backend RCE hoặc Database Superuser.

---

### ADR-1D-010: Strict Directed Linear Token Chain & Anti-Cycle DDL
- **Trạng thái:** `PROPOSED`.
- **Quyết định:**
  - Khóa ngoại hỗn hợp: `(replaced_by_token_id, token_family_id) REFERENCES refresh_tokens(id, token_family_id)` bảo đảm token con cùng family với token cha.
  - Chống phân nhánh cây: `CONSTRAINT uq_refresh_tokens_replaced_by UNIQUE (replaced_by_token_id)`.
  - Chống chu trình $A \to B \to A$: Strict Monotonic Sequence (`new_token.seq = old_token.seq + 1`) kết hợp `CONSTRAINT uq_refresh_tokens_family_seq UNIQUE (token_family_id, sequence_number)` và `CHECK (sequence_number > 0)`.
  - Duy nhất tối đa 1 token ACTIVE: Partial Unique Index `idx_uq_active_token_per_family`.

---

### ADR-1D-011: Account Lockout Bậc Thang, Mã Hóa HMAC OTP & Kiểm Định KS-Test
- **Trạng thái:** `PROPOSED`.
- **Quyết định:**
  - Thống nhất mã phản hồi HTTP: Lần 1-4 trả `401 Unauthorized`; Lần 5 trả `423 Locked` (`retryAfter: 900`); Lần 6+ đang bị khóa trả ngay `423 Locked` (Fast-Path).
  - Chống DoS: IP-level Turnstile CAPTCHA sau 3 lần sai; hỗ trợ mở khóa tức thì tự phục vụ qua Email OTP.
  - Bảo vệ không gian $10^6$ của OTP 6 chữ số: Database lưu `HMAC-SHA256(otp_code, SERVER_HMAC_SECRET)`. Kẻ tấn công có bản dump database không thể dò offline.
  - Loại bỏ claim $\le 8\%$ cảm tính; thay thế bằng Phương pháp luận Kiểm định Thống kê Two-Sample Kolmogorov-Smirnov Test ($N=1,000, p > 0.05$) kèm Dummy Argon2id Verification. Endpoint `/request-unlock` trả uniform 200 OK kèm delay jitter $50\text{ms} - 100\text{ms}$.

---

### ADR-1D-012: Giao Thức Khóa Bi Quan Phân Tầng Triệt Tiêu TOCTOU Trên Critical Mutations
- **Trạng thái:** `PROPOSED`.
- **Quyết định:**
  - Xác lập **Revocation Linearization Point** là thời điểm lệnh `COMMIT` của transaction thu hồi quyền hoàn tất ghi xuống WAL.
  - Lập ma trận toàn diện 7 đường dẫn thu hồi (REV-01 đến REV-07).
  - Mọi Critical Mutation (Thanh toán, duyệt đơn, xuất kho) bắt buộc bọc trong transaction với `SET LOCAL lock_timeout = '2000ms'`, kiểm tra kép `SELECT auth_version, status FROM users FOR SHARE` và `SELECT status FROM user_sessions FOR SHARE`.
  - Thứ tự khóa tăng dần ngặt: `users (user_id ASC) -> user_sessions (session_id ASC) -> business_entities (id ASC)` triệt tiêu 100% điều kiện Deadlock.

---

## 4. TIÊU CHÍ MỞ CỔNG NGHIỆM THU PHASE 1D (GATE APPROVAL CHECKLIST)

- [x] **Audit Hiện trạng Database:** Rà soát 51 Models thực tế, xác nhận User-Employee 1-1, 11 CHECK constraints, Composite FKs còn nguyên vẹn.
- [x] **Kiến trúc Blueprint (v3.2.0):** Đồng bộ Two-Step Idempotency, Envelope AES-256-GCM, TOCTOU Linearization Point, Dual-Endpoint CSRF (`PHASE_1D_ARCHITECTURE_BLUEPRINT.md`).
- [x] **Thiết kế Cơ sở Dữ liệu (v3.2.0):** DDL `auth_idempotency_records`, Composite FK Anti-Cycle, Partial Index, RLS 51 bảng, `$queryRaw` (`PHASE_1D_DATABASE_DESIGN.md`).
- [x] **Hợp đồng API (v3.2.0):** Tách `/refresh/web` vs `/refresh/mobile`, endpoints `/request-unlock` và `/unlock`, error codes 422, 423 (`PHASE_1D_API_CONTRACT.md`).
- [x] **Mô hình Đe dọa An ninh (v3.2.0):** Phân tích STRIDE, Nonce Reuse, TOCTOU proof, Account-Locking DoS, HMAC OTP, KS-Test (`PHASE_1D_SECURITY_THREAT_MODEL.md`).
- [x] **Kế hoạch Kiểm thử (v3.2.0):** Test cases Two-step idempotency, GCM tampering, TOCTOU concurrency, LISTEN degradation, KS-test ($N=1000$) (`PHASE_1D_TEST_PLAN.md`).
- [x] **Nhật ký Quyết định (v3.2.0):** Quản trị 12 ADRs minh bạch, cập nhật ADR-002, 003, 004, 009, tạo mới ADR-010, 011, 012 (`PHASE_1D_DECISION_LOG.md`).
- [ ] **Phê duyệt Chính thức từ Người dùng:** Đang chờ người dùng kiểm định và cấp lệnh mở Implementation Gate.

> [!CAUTION]
> **GATE PHÊ DUYỆT TRIỂN KHAI (IMPLEMENTATION GATE): CHƯA PHÊ DUYỆT (NOT APPROVED - HOLD)**  
> Nghiêm ngặt tuân thủ quy tắc DESIGN ONLY, không tự ý viết code triển khai backend/auth hoặc tạo migration vật lý trước khi nhận được phê duyệt chính thức từ người dùng.
