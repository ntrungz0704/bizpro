# BizPro+ Phase 1D — Architectural Decision Log & ADRs
**Tài liệu:** Nhật Ký Quyết Định Kiến Trúc & Tiêu Chuẩn Phê Duyệt Cổng Nghiệm Thu  
**Giai đoạn:** Phase 1D Architecture Blueprint  
**Phiên bản:** 1.0.0 (Design Only — Gate Pre-Implementation)  
**Trạng thái:** DRAFT FOR ARCHITECTURAL APPROVAL  

---

## 1. TỔNG QUAN NHẬT KÝ QUYẾT ĐỊNH (ADR OVERVIEW)

Tài liệu này ghi nhận toàn bộ các quyết định kiến trúc then chốt (Architectural Decision Records - ADRs) được đưa ra trong quá trình thiết kế Phase 1D: Authentication & RBAC. Mọi quyết định đều được đánh giá kỹ lưỡng dựa trên tiêu chuẩn bảo mật doanh nghiệp, tính khả thi trong triển khai thực tế trên Tech Stack hiện tại (NestJS, PostgreSQL 16, Prisma ORM, Next.js 15), và sự bảo toàn tuyệt đối các Invariant cơ sở dữ liệu đã nghiệm thu ở Phase 1C-C.

---

## 2. DANH SÁCH CHI TIẾT CÁC QUYẾT ĐỊNH KIẾN TRÚC (ADRs)

### ADR-1D-001: Lựa chọn thuật toán băm mật khẩu Argon2id
- **Trạng thái:** ĐÃ CHỐT (ACCEPTED).
- **Ngữ cảnh:** Hệ thống cần một thuật toán băm mật khẩu một chiều có khả năng chống lại các cuộc tấn công Brute-force và sử dụng GPU/ASIC cracking hiện đại.
- **Các phương án so sánh:**
  1. *bcrypt:* Phổ biến, nhưng dễ bị tăng tốc cracking bằng phần cứng GPU chuyên dụng; giới hạn độ dài mật khẩu 72 bytes.
  2. *PBKDF2:* Đạt chuẩn NIST cũ, nhưng hoàn toàn không có khả năng chống lại GPU/ASIC do không yêu cầu tài nguyên bộ nhớ (memory-hard).
  3. *Argon2id:* Quán quân cuộc thi Password Hashing Competition (PHC). Kết hợp giữa Argon2d (chống GPU) và Argon2i (chống Side-Channel Timing Attacks).
- **Quyết định:** Sử dụng **Argon2id** với cấu hình tài nguyên cân bằng:
  - `memoryCost`: 65,536 KB (64 MB)
  - `timeCost`: 3 iterations
  - `parallelism`: 4 threads
- **Hệ quả & Đánh giá rủi ro:** Thời gian băm trên CPU máy chủ dao động từ 80ms - 120ms. Cần áp dụng giới hạn độ dài mật khẩu tối đa 128 ký tự và Rate Limiting 5 req/phút để triệt tiêu nguy cơ DoS bằng thuật toán băm.

---

### ADR-1D-002: Cấu hình vòng đời Token (Access Token 15 phút, Refresh Token 7 ngày)
- **Trạng thái:** ĐÃ CHỐT (ACCEPTED).
- **Ngữ cảnh:** Cần cân bằng giữa bảo mật (giảm thiểu thiệt hại khi token bị rò rỉ) và trải nghiệm người dùng (UX không bị bắt đăng nhập lại liên tục).
- **Quyết định:**
  - **Access Token TTL:** **15 phút** (`900 giây`). Access Token là stateless, chứa claims về User, Organization, Roles, Permissions và DataScopes.
  - **Refresh Token TTL:** **7 ngày** (`604,800 giây`). Có cơ chế gia hạn trượt (Sliding expiration) khi người dùng tích cực tương tác.
- **Hệ quả:**
  - Khi thu hồi quyền hạn hoặc vô hiệu hóa tài khoản, độ trễ tối đa để hiệu lực triệt để là 15 phút (trừ khi áp dụng token blacklist).
  - Kết hợp với Refresh Token Rotation (RTR), mỗi lần cấp lại Access Token sẽ phát hành Refresh Token mới, giảm thiểu triệt để nguy cơ Replay Attack.

---

### ADR-1D-003: Chiến lược lưu trữ Refresh Token phía Client (HttpOnly Cookie)
- **Trạng thái:** ĐÃ CHỐT (ACCEPTED).
- **Ngữ cảnh:** Nơi lưu trữ Refresh Token phía trình duyệt quyết định bề mặt rủi ro XSS và CSRF.
- **Các phương án so sánh:**
  1. *LocalStorage / SessionStorage:* Tiện lợi cho Single Page App (SPA), nhưng bất kỳ lỗ hổng XSS nào từ thư viện bên thứ ba (npm supply chain) đều có thể đánh cắp toàn bộ token.
  2. *HttpOnly Cookie:* JavaScript hoàn toàn không có quyền đọc (miễn nhiễm XSS); tuy nhiên có rủi ro CSRF nếu không cấu hình đúng cờ.
- **Quyết định:** Lưu Refresh Token trong **HttpOnly, Secure, SameSite=Strict Cookie** với đường dẫn giới hạn `Path=/api/v1/auth/refresh`. Đối với ứng dụng di động Native (Mobile App), hỗ trợ gửi qua Request Body `refreshToken`.
- **Hệ quả:** Triệt tiêu hoàn toàn nguy cơ đánh cắp Refresh Token qua tấn công XSS; Cờ `SameSite=Strict` loại bỏ hoàn toàn nguy cơ tấn công CSRF.

---

### ADR-1D-004: Lưu trữ và Quản lý Phiên trong Cơ sở Dữ liệu (In-Database PostgreSQL Session Store)
- **Trạng thái:** ĐÃ CHỐT (ACCEPTED) CHO GIAI ĐOẠN 1D.
- **Ngữ cảnh:** Cần một kho lưu trữ để theo dõi phiên làm việc, lưu hash Refresh Token, kiểm soát xoay vòng (RTR) và phát hiện tái sử dụng (Reuse Detection).
- **Các phương án so sánh:**
  1. *Redis In-Memory:* Tốc độ siêu nhanh (< 2ms), hỗ trợ TTL tự nhiên, nhưng bổ sung thêm một thành phần hạ tầng (Infrastructure Overhead), yêu cầu cấu hình dự phòng HA và tách rời giao dịch ACID của PostgreSQL.
  2. *PostgreSQL `user_sessions` Table:* Tận dụng cơ sở dữ liệu hiện có; đảm bảo tính toàn vẹn tham chiếu với `users.id` (ON DELETE CASCADE); tham gia trọn vẹn vào transaction ACID; dễ dàng backup và audit.
- **Quyết định:** Sử dụng bảng **`user_sessions` trong PostgreSQL 16** với khóa chỉ mục b-tree trên `refresh_token_hash` cho Phase 1D. Lưu Refresh Token dưới dạng chuỗi băm **SHA-256** (không lưu token dạng rõ).
- **Lộ trình tương lai:** Khi hệ thống đạt quy mô > 50,000 người dùng trực tuyến đồng thời, sẽ di chuyển cache phiên sang Redis Cluster mà không làm thay đổi API Contract.

---

### ADR-1D-005: Mô hình RBAC Deny-by-default và Cấu trúc Permission `<module>.<resource>.<action>`
- **Trạng thái:** ĐÃ CHỐT (ACCEPTED).
- **Ngữ cảnh:** Phân quyền cần rõ ràng, dễ hiểu cho người dùng doanh nghiệp, đồng thời có tính mở rộng cao khi bổ sung các module nghiệp vụ mới.
- **Quyết định:**
  - Quy ước định danh quyền chuẩn 3 cấp độ: `<module>.<resource>.<action>` (Ví dụ: `crm.customers.read`, `sales.orders.approve`, `inventory.stock.manage`).
  - Toàn bộ 66 quyền vật lý đã kiểm toán trong `docs/05-permission-matrix-physical.md` được giữ nguyên làm danh mục chuẩn.
  - Áp dụng nguyên tắc **Deny-by-default**: Nếu một endpoint không được gán quyền rõ ràng hoặc user không sở hữu quyền tương ứng, Guard sẽ lập tức trả về `403 Forbidden`.

---

### ADR-1D-006: Thứ bậc tính toán DataScope khi User sở hữu nhiều vai trò
- **Trạng thái:** ĐÃ CHỐT (ACCEPTED).
- **Ngữ cảnh:** Một nhân viên có thể được gán nhiều vai trò khác nhau (ví dụ: vừa là Nhân viên Bán hàng thuộc phòng Sales, vừa là Trưởng ban Dự án CRM). Mỗi vai trò có DataScope khác nhau (`OWN`, `DEPARTMENT`, `ALL`).
- **Quyết định:** Áp dụng nguyên tắc **Quyền hạn Rộng nhất (Least Restrictive Privilege / Maximum Scope Priority)**:
  $$\text{Scope Priority: } \text{OWN} < \text{DEPARTMENT} < \text{ALL}$$
  - Nếu bất kỳ vai trò nào có scope `ALL` trên module $\rightarrow$ Tính toán ra `ALL`.
  - Nếu có vai trò `DEPARTMENT` và vai trò `OWN` $\rightarrow$ Tính toán ra `DEPARTMENT`.
  - Chỉ khi toàn bộ các vai trò đều là `OWN` $\rightarrow$ Tính toán ra `OWN`.

---

### ADR-1D-007: Cơ chế phân tách dữ liệu Multi-Tenant: Tenant Context Guard vs PostgreSQL RLS
- **Trạng thái:** ĐÃ CHỐT (ACCEPTED).
- **Ngữ cảnh:** Hệ thống vận hành trên một database duy nhất chia sẻ giữa các tổ chức (Shared Database, Shared Schema). Cần bảo đảm tuyệt đối không rò rỉ dữ liệu chéo Tenant.
- **Các phương án so sánh:**
  1. *PostgreSQL Row-Level Security (RLS) Native:* Cực kỳ an toàn ở tầng DB, nhưng với Prisma ORM và Connection Pooling, mỗi query đều phải chạy transaction để thực thi `SET LOCAL app.current_organization_id = ...`, làm tăng độ trễ truy vấn từ 15% - 25% và phức tạp hóa connection management.
  2. *Application-level Tenant Context Guard + Prisma Client Extension:* Lấy `organization_id` trực tiếp từ JWT payload đã xác minh; Prisma Extension tự động inject `{ where: { organizationId } }` vào mọi lệnh truy vấn; Kết hợp Composite Foreign Key vật lý đã có ở tầng DB.
- **Quyết định:** Áp dụng **Tenant Context Guard + Prisma Extension** cho Phase 1D. Giữ nguyên và bảo toàn các Composite Foreign Key vật lý đã tạo ở Phase 1C-C. Xem xét kích hoạt native RLS ở Phase 2 khi nâng cấp hạ tầng read-replica.

---

## 3. DANH SÁCH CÁC CÂU HỎI MỞ CẦN THAM VẤN (OPEN QUESTIONS FOR STAKEHOLDER REVIEW)

| STT | Vấn đề kiến trúc | Các phương án đề xuất | Tác động kỹ thuật / Nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **Q1** | **Chính sách giới hạn số phiên đăng nhập đồng thời trên mỗi tài khoản** | - **Phương án A (Khuyến nghị):** Giới hạn tối đa 5 sessions đồng thời. Khi đăng nhập session thứ 6, tự động thu hồi (evict) session cũ nhất (FIFO).<br>- **Phương án B:** Không giới hạn số lượng thiết bị, cho phép đăng nhập tự do.<br>- **Phương án C:** Nghiêm ngặt kiểu ngân hàng: Chỉ cho phép 1 session duy nhất tại một thời điểm (Single Active Session). | Phương án A cân bằng hoàn hảo giữa tính tiện lợi của nhân viên văn phòng (Laptop cty + Mobile + Desktop ở nhà) và an ninh bảo mật. |
| **Q2** | **Cơ chế xác thực 2 bước (2FA / MFA)** | - **Phương án A (Khuyến nghị):** Chuẩn bị sẵn schema cho 2FA (TOTP RFC 6238 qua Google Authenticator) nhưng kích hoạt ở Phase 2.<br>- **Phương án B:** Bắt buộc triển khai TOTP 2FA ngay trong Phase 1D cho các tài khoản có Role `ADMIN`. | Triển khai ngay trong Phase 1D sẽ tăng khối lượng công việc và kéo dài tiến độ kiểm thử thêm 3-5 ngày. |
| **Q3** | **Khoảng ân hạn (Grace Period) cho Refresh Token Race Condition** | - **Phương án A (Khuyến nghị):** Cho phép khoảng ân hạn **10 giây**. Trong 10 giây sau khi xoay vòng, nếu token cũ được gửi lại, hệ thống trả về cùng token mới đã sinh thay vì kích hoạt Reuse Invalidation.<br>- **Phương án B:** Sử dụng Distributed Lock (Redis Mutex) chặn cứng mọi request refresh đồng thời. | Phương án A không phụ thuộc Redis, xử lý mượt mà hiện tượng người dùng mở nhiều tabs cùng lúc trên trình duyệt web. |

---

## 4. BẢNG TIÊU CHÍ MỞ CỔNG NGHIỆM THU PHASE 1D (GATE APPROVAL CHECKLIST)

Bảng kiểm tra điều kiện tiên quyết trước khi bắt đầu viết code thực thi (Implementation) cho Phase 1D:

- [x] **Audit Hiện trạng:** Rà soát toàn bộ 51 Models, xác nhận tính toàn vẹn của quan hệ `users.employee_id` (Single physical FK, UNIQUE, ON DELETE SET NULL).
- [x] **Kiến trúc Tổng thể:** Hoàn thành tài liệu thiết kế luồng Login, Refresh Token Rotation, Session State Machine và Data Scope Engine (`PHASE_1D_ARCHITECTURE_BLUEPRINT.md`).
- [x] **Thiết kế Cơ sở Dữ liệu:** Hoàn thành lược đồ đề xuất `UserSession`, các trường bảo mật cho `User`, ERD chi tiết và phân tích migration (`PHASE_1D_DATABASE_DESIGN.md`).
- [x] **Hợp đồng API (API Contract):** Đặc tả chi tiết 10 endpoints, JSON schema, mã lỗi và chính sách Rate Limiting (`PHASE_1D_API_CONTRACT.md`).
- [x] **Mô hình Đe dọa An ninh (Threat Model):** Phân tích chi tiết STRIDE, chống Replay Attack, Token Reuse Detection và đối chiếu OWASP API Security Top 10 (`PHASE_1D_SECURITY_THREAT_MODEL.md`).
- [x] **Kế hoạch Kiểm thử (Test Plan):** Thiết lập ma trận Unit Test, Integration Test, Security Test và Concurrency Test (`PHASE_1D_TEST_PLAN.md`).
- [x] **Nhật ký Quyết định (Decision Log):** Hoàn thành 7 ADRs then chốt, xác định các câu hỏi mở cho ban dự án (`PHASE_1D_DECISION_LOG.md`).
- [ ] **Phê duyệt Chính thức:** Ban dự án / Người dùng xem xét và xác nhận thông qua bộ tài liệu kiến trúc Phase 1D Blueprint để chính thức mở Gate triển khai.
