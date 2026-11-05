# BIZPRO+ PHASE 1D — ARCHITECTURAL DECISION LOG & ADR GOVERNANCE
**Tài liệu:** `docs/PHASE_1D_DECISION_LOG.md`  
**Phiên bản:** 2.0.0 (Comprehensive Cross-Document Architecture Revision)  
**Tác giả:** Senior Security Architect & Backend Architect  
**Trạng thái tài liệu:** DRAFT SPECIFICATION FOR ARCHITECTURAL REVIEW (DESIGN ONLY)  
**Gate Status:** NOT APPROVED — Awaiting Independent Multi-Agent Review  

---

## 1. QUY CHUẨN QUẢN TRỊ QUYẾT ĐỊNH KIẾN TRÚC (ADR GOVERNANCE)

Mọi quyết định kỹ thuật trong Phase 1D đều được lưu vết minh bạch theo chuẩn Architectural Decision Record (ADR). Mỗi quyết định phải thể hiện rõ:
- **Ngữ cảnh & Thách thức (Context)**
- **Quyết định (Decision)**
- **Các phương án đã cân nhắc (Alternatives Considered)**
- **Hệ quả & Đánh đổi (Consequences)**
- **Tác động an ninh (Security Implications)**
- **Tác động triển khai (Implementation Implications)**
- **Mối quan hệ phụ thuộc (Dependencies)**
- **Trạng thái phê duyệt (Status):** Phân định rạch ròi giữa các nhãn:
  - `PROPOSED`: Đề xuất kiến trúc của nhóm thiết kế, đang chờ người dùng/ban dự án review.
  - `PENDING APPROVAL`: Đã qua review kỹ thuật, đang chờ phê duyệt tại phiên Gate chính thức.
  - `ACCEPTED`: Đã được người dùng phê duyệt bằng văn bản/chỉ đạo chính thức.
  - `SUPERSEDED`: Quyết định cũ đã bị bác bỏ và được thay thế bằng một quyết định mới chuẩn xác hơn.
  - `REJECTED`: Quyết định đã bị người dùng bác bỏ hoàn toàn.

---

## 2. BẢNG TỔNG HỢP VÒNG ĐỜI CÁC ADR TRONG PHASE 1D

| ADR ID | Tên Quyết định Kiến trúc | Trạng thái hiện tại | Bản thay thế (Nếu bị thay thế) |
| :--- | :--- | :---: | :--- |
| **ADR-1D-001** | Lựa chọn thuật toán băm mật khẩu Argon2id | `PROPOSED` | Giữ nguyên, bổ sung Benchmark Plan & DoS Mitigations |
| **ADR-1D-002** | Vòng đời Token & Thu hồi tức thời qua `auth_version` | `PROPOSED` | Cập nhật cơ chế Hybrid Token & Immediate Revocation |
| **ADR-1D-003** | Chiến lược lưu trữ Token: Browser Cookie vs Native Mobile | `PROPOSED` | Sửa nhận định XSS/CSRF, bổ sung Mobile Storage Spec |
| **ADR-1D-004** | Quản lý phiên và Token Family Rotation trong PostgreSQL | `PROPOSED` | Tách `user_sessions` và `refresh_tokens`, khóa bi quan |
| **ADR-1D-005** | Mô hình Phân quyền RBAC Deny-by-default | `PROPOSED` | Giữ nguyên 66 permissions, chuẩn hóa 3 cấp độ |
| **ADR-1D-006** | Maximum Scope Priority (`OWN < DEPARTMENT < ALL`) | `SUPERSEDED` | **ĐÃ BỊ BÁC BỎ**, thay thế bằng **ADR-1D-008** |
| **ADR-1D-007** | Phân tách Multi-Tenant dựa vào Prisma Extension | `SUPERSEDED` | **ĐÃ BỊ BÁC BỎ**, thay thế bằng **ADR-1D-009** |
| **ADR-1D-008** | Resource-Specific Data Scope & Contextual Authorization | `PROPOSED` | Thay thế cho ADR-1D-006 |
| **ADR-1D-009** | Layered Multi-Tenant Defense-in-Depth Architecture | `PROPOSED` | Thay thế cho ADR-1D-007 |

---

## 3. CHI TIẾT CÁC BẢN GHI QUYẾT ĐỊNH KIẾN TRÚC (ADRs)

### ADR-1D-001: Lựa chọn thuật toán băm mật khẩu Argon2id
- **Trạng thái:** `PROPOSED` (Chờ Benchmark kiểm chứng trên phần cứng mục tiêu).
- **Context:** Cần một giải thuật băm mật khẩu một chiều có khả năng kháng cự trước dàn trâu cày GPU/ASIC và Side-channel timing attacks.
- **Decision:** Sử dụng **Argon2id** với cấu hình tài nguyên khởi điểm: `memoryCost = 65536 KB (64MB)`, `timeCost = 3 iterations`, `parallelism = 4 threads`.
- **Alternatives Considered:**
  - *bcrypt:* Tốt, nhưng giới hạn độ dài mật khẩu 72 bytes và dễ bị tối ưu hóa giải mã bằng phần cứng GPU chuyên dụng.
  - *PBKDF2:* Chuẩn NIST cũ, không có tính chất memory-hard, yếu trước các đòn tấn công brute-force hiện đại.
- **Consequences:** Thời gian tính toán trên CPU có thể mất từ 80ms - 150ms tùy phần cứng.
- **Security Implications:** Cần chặn độ dài mật khẩu tối đa 128 ký tự (`@MaxLength(128)`) và áp dụng Rate Limiting 5 req/phút để triệt tiêu nguy cơ kẻ gian làm treo CPU máy chủ (Hash Exhaustion DoS).
- **Implementation Implications:** Cần thực thi bài test benchmark thực tế trên môi trường Docker để tinh chỉnh bộ tham số trước khi đưa lên Production.
- **Dependencies:** Thư viện `argon2` trong Node.js / NestJS.

---

### ADR-1D-002: Vòng đời Token và Cơ chế Thu hồi Tức thời qua `auth_version`
- **Trạng thái:** `PROPOSED`.
- **Context:** JWT Access Token là stateless nên không thể tự động bị thu hồi nếu chỉ dựa vào thời hạn `exp` (15 phút). Cần cơ chế thu hồi tức thời khi đổi mật khẩu, bị khóa tài khoản hoặc tước quyền.
- **Decision:**
  - Cố định Access Token TTL = **15 phút**.
  - Bổ sung trường `auth_version INT DEFAULT 1` trên bảng `users` và claim `ver` trong JWT.
  - Khi có sự kiện an ninh nhạy cảm: Tăng `auth_version = auth_version + 1`. `AuthVersionInterceptor` chặn đứng tức thì các token có phiên bản cũ.
  - Đối với các Mutation API đặc biệt nhạy cảm (Thanh toán, Đổi cấu hình hệ thống, Quản trị nhân sự), bắt buộc sử dụng `RealtimeSessionGuard` tra cứu trực tiếp trạng thái `ACTIVE` của session trong database.
- **Alternatives Considered:**
  - *Token Blacklist hoàn toàn trên Redis:* Tốt nhưng phụ thuộc vào Redis cluster; nếu Redis gặp sự cố thì toàn bộ hệ thống auth bị sụp đổ.
  - *Truy vấn DB ở 100% mọi request:* Biến JWT thành stateful session, làm mất toàn bộ ưu thế hiệu năng của stateless token, gây nghẽn kết nối database.
- **Consequences:** Phải thực hiện kiểm tra `auth_version` (có cache cục bộ 30s) trên tầng Interceptor.
- **Security Implications:** Giải quyết dứt điểm vấn đề thu hồi token giữa chừng (Mid-flight Revocation).
- **Dependencies:** Bảng `users`, `AuthVersionInterceptor`.

---

### ADR-1D-003: Chiến lược lưu trữ Refresh Token phía Client (Browser vs Native Mobile)
- **Trạng thái:** `PROPOSED`.
- **Context:** Trình duyệt web (SPA) và ứng dụng di động (Mobile App) có mô hình bảo mật và bề mặt rủi ro khác nhau đối với lưu trữ token.
- **Decision:**
  - *Trình duyệt Web (Next.js 15 SPA):* Bắt buộc lưu Refresh Token trong **HttpOnly, Secure, SameSite=Strict Cookie** với đường dẫn `Path=/api/v1/auth/refresh`. Tuyệt đối không lưu Refresh Token trong LocalStorage/SessionStorage.
  - *Ứng dụng Di động (Native Mobile):* Nhận và gửi Refresh Token qua JSON Payload/Header, lưu trữ bắt buộc trong **Encrypted Keystore (Android)** hoặc **Keychain (iOS)**.
- **Alternatives Considered:**
  - *Lưu trong LocalStorage cho cả Web:* Tiện lợi nhưng cực kỳ nguy hiểm nếu có lỗ hổng XSS từ thư viện bên thứ ba (npm dependencies).
- **Security Implications:**
  - Cờ `HttpOnly` ngăn chặn JavaScript đọc trộm chuỗi token, nhưng không thể ngăn chặn hoàn toàn các request tự động do mã độc XSS gửi đi qua phiên của nạn nhân. Do đó, phải kết hợp cùng Content Security Policy (CSP) và input sanitization.
  - Cờ `SameSite=Strict` ngăn chặn hoàn toàn việc trình duyệt tự động gửi cookie trong các truy vấn Cross-Site (CSRF Defense).
- **Dependencies:** Cấu hình Cookie của NestJS `res.cookie()`.

---

### ADR-1D-004: Quản lý Phiên và Lịch sử Xoay vòng Token Family trong PostgreSQL
- **Trạng thái:** `PROPOSED`.
- **Context:** Mô hình cũ chỉ lưu một `refresh_token_hash` trên `user_sessions` không thể phân biệt giữa retry hợp lệ do timeout mạng với tấn công token reuse replay, dẫn đến nguy cơ thu hồi nhầm tài khoản của người dùng.
- **Decision:**
  - Tách thành 2 bảng quan hệ: `user_sessions` (quản lý phiên vật lý, thiết bị, IP, trạng thái chung) và `refresh_tokens` (quản lý từng thế hệ token trong chuỗi xoay vòng có `token_family_id`, `token_hash`, `seq`, `status`, `replaced_by_token_id`).
  - Mọi thao tác xoay vòng token bắt buộc phải bọc trong Transaction với khóa bi quan `SELECT ... FOR UPDATE` trên bảng `refresh_tokens`.
  - Cung cấp cửa sổ **Idempotent Grace Period $\le 5$ giây** cho phép client retry nhận lại token an toàn nếu bị rớt mạng sau khi DB đã commit.
  - Khi phát hiện Token Reuse (dùng lại token đã xoay vòng quá 5s): Kích hoạt **Targeted Family Invalidation**, chỉ thu hồi Token Family và Session của thiết bị bị tấn công, không tự ý đăng xuất toàn bộ thiết bị khác của người dùng trừ khi có chỉ đạo leo thang an ninh.
- **Alternatives Considered:**
  - *Lưu phiên hoàn toàn trên Redis:* Đưa vào lộ trình nâng cấp hạ tầng khi hệ thống vượt quy mô 50,000 kết nối đồng thời.
- **Consequences:** Tăng thêm 1 bảng trong cơ sở dữ liệu và yêu cầu transaction locking cẩn trọng để tránh deadlock.
- **Dependencies:** PostgreSQL 16 Transaction Engine, bảng `user_sessions`, `refresh_tokens`.

---

### ADR-1D-005: Mô hình Phân quyền RBAC Deny-by-default và Cấu trúc Permission
- **Trạng thái:** `PROPOSED`.
- **Context:** Hệ thống cần quy chuẩn phân quyền rõ ràng, tường minh và dễ kiểm toán cho 66 permissions nghiệp vụ.
- **Decision:**
  - Áp dụng chuẩn 3 cấp độ: `<module>.<resource>.<action>` (Ví dụ: `crm.customers.read`, `sales.orders.approve`, `inventory.stock.manage`).
  - Toàn bộ endpoints áp dụng nguyên tắc **Deny-by-default**: Nếu không có `@RequirePermissions()`, mặc định cấm truy cập (trừ khi có `@Public()`).
- **Dependencies:** `PermissionsGuard`, danh mục 66 permissions trong `docs/05-permission-matrix-physical.md`.

---

### ADR-1D-006: Maximum Scope Priority (`OWN < DEPARTMENT < ALL`) [BÁC BỎ]
- **Trạng thái:** **`SUPERSEDED` (ĐÃ BỊ BÁC BỎ HOÀN TOÀN)**.
- **Lý do bác bỏ:** Thang thứ bậc tuyến tính `OWN < DEPARTMENT < ALL` là một giả định sai lầm, không thể áp dụng cho mọi tài nguyên doanh nghiệp. Nó vi phạm nguyên tắc Separation of Duties (ví dụ: Quản lý HR không được tự duyệt lương của chính mình, Kho hàng không có khái niệm Department mà theo Warehouse Assignment).
- **Bản thay thế:** Được thay thế toàn diện bởi **ADR-1D-008**.

---

### ADR-1D-007: Phân tách Multi-Tenant dựa vào Prisma Extension [BÁC BỎ]
- **Trạng thái:** **`SUPERSEDED` (ĐÃ BỊ BÁC BỎ HOÀN TOÀN)**.
- **Lý do bác bỏ:** Tuyên bố "Prisma Extension tự động bảo vệ 100% mọi truy vấn" là không chính xác về mặt kỹ thuật. Prisma Extension hoàn toàn bỏ qua Raw SQL (`$queryRaw`), không tự động bảo vệ các trường hợp Nested Writes (`connect`), Aggregations, GroupBy, Upsert và Interactive Transactions.
- **Bản thay thế:** Được thay thế toàn diện bởi **ADR-1D-009**.

---

### ADR-1D-008: Resource-Specific Data Scope & Contextual Authorization Policy (Thay thế ADR-1D-006)
- **Trạng thái:** `PROPOSED`.
- **Context:** Cần một cơ chế đánh giá quyền hạn truy cập tài nguyên chính xác theo đặc thù nghiệp vụ của từng phân hệ (CRM, Sales, Kho, HR).
- **Decision:**
  - Loại bỏ hoàn toàn cơ chế tính `max(OWN, DEPARTMENT, ALL)`.
  - Triển khai **`ResourceScopePolicyEngine`** đánh giá quyền hạn dựa trên 5 yếu tố ngữ cảnh:
    $$\text{AccessDecision} = f(\text{Permission}, \text{ResourceContext}, \text{OwnershipPolicy}, \text{OrgBoundary}, \text{EmployeeContext})$$
  - *Chính sách CRM:* Kiểm tra người tạo (`created_by_id = user.id`) HOẶC người trực tiếp phụ trách (`assigned_to_id = employee.id`) HOẶC quyền quản lý phòng ban.
  - *Chính sách Bán hàng:* Kiểm tra người tạo đơn, trạng thái đơn hàng (`DRAFT` vs `SUBMITTED`), và tách biệt quyền tạo đơn với quyền duyệt/thanh toán đơn.
  - *Chính sách Kho hàng:* Không áp dụng Department; áp dụng theo danh sách kho được phân công (`warehouse_staff`).
  - *Chính sách Nhân sự:* Cho phép xem/tạo đơn cá nhân, duyệt đơn cấp dưới, nhưng **ngăn chặn tuyệt đối việc quản lý tự duyệt đơn của chính mình**.
- **Consequences:** Cần viết các Policy Evaluator chuyên biệt cho từng phân hệ thay vì một hàm so sánh số học đơn giản.
- **Security Implications:** Đảm bảo tuân thủ nghiêm ngặt nguyên tắc đặc quyền tối thiểu (Least Privilege) và phân tách trách nhiệm (Separation of Duties).
- **Dependencies:** `ResourceScopePolicyEngine`, bảng `employees`, `roles`, `permissions`.

---

### ADR-1D-009: Layered Multi-Tenant Defense-in-Depth Architecture (Thay thế ADR-1D-007)
- **Trạng thái:** `PROPOSED`.
- **Context:** Hệ thống sử dụng Shared Database, Shared Schema có Discriminator Column (`organization_id`). Cần bảo vệ biên dữ liệu giữa các tổ chức bằng nhiều tầng độc lập.
- **Decision:**
  - Thiết lập mô hình phòng thủ 6 tầng:
    1. *Tầng Xác thực:* Trích xuất `organization_id` từ chữ ký JWT hợp lệ.
    2. *Tầng Ngữ cảnh:* Lưu trữ vào `AsyncLocalStorage` cho từng request.
    3. *Tầng Dịch vụ (Service Layer):* Mọi hàm service nghiệp vụ bắt buộc nhận `organizationId` làm tham số và chủ động validate.
    4. *Tầng Truy vấn (Repository Layer):* Bọc các phương thức `groupBy`, `aggregate`, `upsert` với filter `organizationId` tường minh.
    5. *Tầng Prisma Extension:* Hỗ trợ tự động chèn `{ where: { organizationId } }` cho các truy vấn CRUD cơ bản.
    6. *Tầng Cơ sở dữ liệu vật lý:* Duy trì các Composite Foreign Keys đã nghiệm thu tại Phase 1C-C `payment_transactions(sales_order_id, organization_id) REFERENCES sales_orders(id, organization_id)` để ngăn chặn ở mức đĩa cứng nếu tầng ứng dụng xảy ra lỗi.
  - Quy định bắt buộc: Mọi lệnh Raw SQL (`$queryRaw`) phải đi qua helper an toàn và bắt buộc có tham số bind `:orgId`.
- **Consequences:** Tăng trách nhiệm kiểm soát chất lượng mã nguồn ở tầng Service và Repository, không còn phụ thuộc duy nhất vào Prisma Extension.
- **Dependencies:** `AsyncLocalStorage`, NestJS Interceptors, Composite Foreign Keys PostgreSQL 16.

---

## 4. CÁC QUYẾT ĐỊNH CẦN THAM VẤN & XIN Ý KIẾN CHỈ ĐẠO (OPEN QUESTIONS)

| STT | Vấn đề Kiến trúc | Đề xuất của Nhóm Kiến trúc | Lựa chọn thay thế |
| :--- | :--- | :--- | :--- |
| **Q1** | **Thời gian Grace Window cho Idempotent Retry** | Đề xuất cố định **5 giây** và chỉ áp dụng cho cùng Client Fingerprint (IP/User-Agent). | Bỏ hoàn toàn Grace Window, bắt buộc client phải gửi request mới và chịu rủi ro bị từ chối nếu mạng rớt sau commit DB. |
| **Q2** | **Phạm vi thu hồi khi phát hiện Token Reuse** | Đề xuất **Targeted Token Family Invalidation**: Chỉ thu hồi phiên của thiết bị có token bị đánh cắp, bảo vệ trải nghiệm của người dùng trên các thiết bị hợp lệ khác. | Thu hồi toàn bộ phiên của User trên mọi thiết bị (Nghiêm ngặt tối đa nhưng gây phiền toái cao cho người dùng). |
| **Q3** | **Tần suất kích hoạt RealtimeSessionGuard** | Đề xuất chỉ ép buộc chạy kiểm tra DB realtime trên các **Mutation APIs nhạy cảm** (Thanh toán, cấu hình, HR), còn các Read APIs thông thường dựa vào `auth_version` để tối ưu hiệu năng. | Ép buộc kiểm tra DB realtime trên 100% mọi request (Làm tăng tải kết nối DB lên 300%). |

---

## 5. BẢNG TIÊU CHÍ MỞ CỔNG NGHIỆM THU PHASE 1D (GATE APPROVAL CHECKLIST)

- [x] **Audit Hiện trạng Database:** Rà soát 51 Models, 23 Enums, xác nhận User-Employee 1-1, 11 CHECK constraints, Composite FKs còn nguyên vẹn.
- [x] **Kiến trúc Blueprint (v2.0):** Hoàn thành tái cấu trúc Token Family, Transaction Locking, Hybrid Revocation, Layered Multi-Tenancy và Contextual Authorization (`PHASE_1D_ARCHITECTURE_BLUEPRINT.md`).
- [x] **Thiết kế Cơ sở Dữ liệu (v2.0):** Tách `user_sessions` và `refresh_tokens`, bổ sung `auth_version`, hoàn thiện ERD và Migration Blueprint (`PHASE_1D_DATABASE_DESIGN.md`).
- [x] **Hợp đồng API (v2.0):** Chuẩn hóa 10 endpoints, cơ chế khóa bi quan, Idempotent retry, Throttling headers và Error codes (`PHASE_1D_API_CONTRACT.md`).
- [x] **Mô hình Đe dọa An ninh (v2.0):** Phân tích STRIDE, kịch bản Token Family Replay, Organization Suspension, Audit Tampering, đối chiếu OWASP API Top 10 (`PHASE_1D_SECURITY_THREAT_MODEL.md`).
- [x] **Kế hoạch Kiểm thử (v2.0):** Ma trận 8 cột chuẩn mực, loại bỏ test sai Maximum Scope, thiết lập Benchmark Plan thực tế (`PHASE_1D_TEST_PLAN.md`).
- [x] **Nhật ký Quyết định (v2.0):** Quản trị 9 ADRs minh bạch, bác bỏ ADR-006 & ADR-007, thiết lập ADR-008 & ADR-009 thay thế (`PHASE_1D_DECISION_LOG.md`).
- [ ] **Phê duyệt Chính thức từ Người dùng:** Chờ kết quả đánh giá vòng 2 từ người dùng.

> [!CAUTION]
> **GATE PHÊ DUYỆT TRIỂN KHAI (IMPLEMENTATION GATE): CHƯA PHÊ DUYỆT (NOT APPROVED)**  
> Nhóm kiến trúc nghiêm ngặt tuân thủ quy tắc DESIGN ONLY, không tự ý viết code triển khai hoặc tạo migration vật lý trước khi nhận được phê duyệt chính thức từ người dùng.
