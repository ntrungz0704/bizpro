# BizPro+ Phase 1D — Test Plan & Quality Assurance Strategy
**Tài liệu:** Kế hoạch Kiểm thử Toàn diện & Chiến lược Đảm bảo Chất lượng Xác thực và Phân quyền  
**Giai đoạn:** Phase 1D Architecture Blueprint  
**Phiên bản:** 1.0.0 (Design Only — Gate Pre-Implementation)  
**Công cụ kiểm thử:** Vitest / Jest, Supertest, PostgreSQL 16 Test Container, k6 / Autocannon  

---

## 1. MỤC TIÊU & NGUYÊN TẮC KIỂM THỬ

1. **Bảo toàn Invariant Database:** Mọi bài test Authentication & RBAC tuyệt đối không được làm sai lệch hoặc vô hiệu hóa các Invariant vật lý đã được nghiệm thu ở Phase 1C-C (11 CHECK constraints, Composite FKs, Trigger Snapshot, User-Employee 1-1).
2. **Kiểm thử trên Môi trường Thực tế:** Không sử dụng Mock/Stub cho PostgreSQL; 100% test tích hợp và kiểm thử đồng thời phải chạy trực tiếp trên PostgreSQL 16.
3. **Mục tiêu độ bao phủ (Coverage Target):**
   - Unit Tests: >= 95% code coverage cho Auth & RBAC Services, Guards, Interceptors.
   - Integration Tests: 100% các endpoint trong API Contract được kiểm thử đường chính (Happy Path) và đường biên (Edge Cases).
   - Security & Concurrency: 100% các kịch bản phát hiện xâm nhập (Token Reuse, IDOR, Lockout, Race Condition) có bài test tự động.

---

## 2. MA TRẬN TEST CASES (TEST MATRIX)

### 2.1. Nhóm 1: Unit Tests (Tầng Logic Độc lập)

| Test ID | Hạng mục | Kịch bản kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **UT-AUTH-01** | Argon2id Hash | Băm mật khẩu với tham số chuẩn (memoryCost: 65536, timeCost: 3, parallelism: 4). | Chuỗi hash có tiền tố `$argon2id$v=19$m=65536...`. |
| **UT-AUTH-02** | Argon2id Verify | Kiểm tra mật khẩu đúng và mật khẩu sai. | Mật khẩu đúng trả về `true`, sai trả về `false`. |
| **UT-AUTH-03** | Timing Attack Protection | Xác thực người dùng với email không tồn tại. | Hàm vẫn thực hiện hash giả định (dummy verify) để thời gian thực thi xấp xỉ thời gian hash thật (~80-120ms). |
| **UT-AUTH-04** | JWT Payload Creation | Tạo Access Token cho người dùng có vai trò và quyền. | Payload chứa đúng `sub`, `email`, `organizationId`, `employeeId`, `roles`, `permissions`, `exp - iat = 900s`. |
| **UT-AUTH-05** | JWT Expiration | Giải mã Access Token đã quá hạn 15 phút. | `TokenExpiredError` được ném ra, mã lỗi `AUTH_TOKEN_EXPIRED`. |
| **UT-AUTH-06** | DataScope Calculator | Người dùng có 2 vai trò: Vai trò A có scope `OWN`, vai trò B có scope `DEPARTMENT`. | Kết quả hợp nhất quyền lấy mức cao nhất: `DEPARTMENT`. |
| **UT-AUTH-07** | DataScope Maximum | Người dùng có vai trò với scope `ALL` kết hợp vai trò `OWN`. | Kết quả hợp nhất: `ALL`. |
| **UT-AUTH-08** | Permission Matcher | Kiểm tra quyền yêu cầu `crm.customers.write` đối với user có danh sách quyền. | Trả về `true` nếu có, `false` nếu không. |

---

### 2.2. Nhóm 2: Integration Tests (Kiểm thử Tích hợp API & Database)

| Test ID | Endpoint / Flow | Kịch bản kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **IT-AUTH-01** | Full Auth Lifecycle | `POST /login` -> `GET /me` -> `POST /refresh` -> `POST /logout` -> `GET /me`. | - Login thành công, nhận token và cookie.<br>- Call `/me` với Access Token trả về 200.<br>- Call `/refresh` cấp Access Token mới.<br>- Call `/logout` thu hồi session.<br>- Call `/me` sau logout trả về 401. |
| **IT-AUTH-02** | Multi-Session Device | Người dùng đăng nhập từ Thiết bị 1 (Desktop) rồi từ Thiết bị 2 (Mobile). | `user_sessions` có 2 bản ghi `ACTIVE`. `GET /sessions` trả về 2 thiết bị. |
| **IT-AUTH-03** | Remote Session Termination | Người dùng tại Thiết bị 1 gọi `DELETE /sessions/:id` của Thiết bị 2. | Session của Thiết bị 2 chuyển sang `REVOKED`. Thiết bị 2 gọi `/refresh` bị từ chối 401. |
| **IT-AUTH-04** | Logout All | Người dùng gọi `POST /logout-all`. | Tất cả bản ghi trong `user_sessions` của user chuyển sang `REVOKED`. Mọi refresh token bị vô hiệu hóa. |
| **IT-AUTH-05** | Account Status Guard | Đổi trạng thái user sang `INACTIVE` hoặc `SUSPENDED` trong DB, sau đó thực hiện gọi API. | Lập tức bị từ chối `403 Forbidden` (`AUTH_ACCOUNT_DISABLED`). |
| **IT-AUTH-06** | Change Password Cascade | Người dùng đổi mật khẩu qua `POST /change-password`. | Mật khẩu mới được cập nhật, `password_changed_at` được set; Các session cũ bị thu hồi. Đăng nhập bằng pass cũ bị 401. |

---

### 2.3. Nhóm 3: Security & Penetration Tests (Kiểm thử An ninh Xâm nhập)

| Test ID | Phân loại | Kịch bản kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **ST-AUTH-01** | Brute-force Lockout | Nhập sai mật khẩu liên tiếp 5 lần với cùng một tài khoản email. | Lần thứ 5 thất bại, tài khoản bị khóa 15 phút (`locked_until = NOW() + 15m`). Request thứ 6 trả về `423 Locked`. |
| **ST-AUTH-02** | Token Tampering | Thay đổi `organizationId` trong payload của JWT đã cấp, giữ nguyên chữ ký. | Server từ chối `401 Unauthorized` (Invalid Signature). |
| **ST-AUTH-03** | Alg None Attack | Gửi JWT với header `{"alg": "none"}` và chữ ký rỗng. | Server từ chối `401 Unauthorized`. |
| **ST-AUTH-04** | Cross-Tenant IDOR | Dùng token của User thuộc Tổ chức A để truy cập: `GET /api/v1/sales/orders/:orderIdB` (đơn hàng thuộc Tổ chức B). | Trả về `404 Not Found` hoặc `403 Forbidden` (`AUTH_TENANT_MISMATCH`). Tuyệt đối không để lộ dữ liệu. |
| **ST-AUTH-05** | Cross-Tenant DB Invariant | Mô phỏng lỗi ứng dụng cố gắng INSERT `payment_transactions` với `sales_order_id` của Org B nhưng `organization_id` của Org A. | PostgreSQL chặn lại ngay tại tầng lưu trữ vật lý bằng Foreign Key Violation: `payment_transactions_sales_order_fk`. |
| **ST-AUTH-06** | User Enumeration | Gọi `POST /forgot-password` với 2 email: 1 email có thật, 1 email không tồn tại. | Cả 2 request đều trả về mã 200 OK với body thông điệp giống hệt nhau, thời gian phản hồi không chênh lệch đáng kể. |
| **ST-AUTH-07** | BFLA Protection | Gửi request `POST /api/v1/hrm/employees` bằng tài khoản chỉ có role `SALES_REP`. | Trả về `403 Forbidden` (`AUTH_FORBIDDEN_PERMISSION`). |

---

### 2.4. Nhóm 4: Concurrency & Race Condition Tests (Kiểm thử Đồng thời & Đua tranh)

| Test ID | Hạng mục | Kịch bản kiểm thử | Kết quả kỳ vọng |
| :--- | :--- | :--- | :--- |
| **CT-AUTH-01** | Parallel Token Refresh | Gửi đồng thời 5 requests `POST /refresh` cùng lúc bằng **chính xác một Refresh Token duy nhất** (mô phỏng 5 tabs trình duyệt cùng refresh khi hết hạn). | **Grace Period Resolution (Khoảng ân hạn 10 giây):**<br>- 1 request đầu tiên thực hiện xoay vòng token thành công, sinh token mới.<br>- 4 requests song song đến trong vòng 10 giây được trả về cùng cặp token đã sinh (hoặc chấp nhận an toàn trong grace period).<br>- Không kích hoạt nhầm cơ chế Reuse Invalidation. |
| **CT-AUTH-02** | Token Reuse Detection Trigger | Sử dụng lại một Refresh Token cũ **sau khi khoảng ân hạn (grace period) đã kết thúc**. | - Hệ thống nhận diện hành vi replay tấn công.<br>- **Lập tức thu hồi TOÀN BỘ phiên làm việc** của user (`UPDATE user_sessions SET status = 'REVOKED' WHERE user_id = ...`).<br>- Trả về lỗi `401 Unauthorized` (`AUTH_TOKEN_REUSE_DETECTED`).<br>- Ghi nhận cảnh báo an ninh cấp độ Critical vào AuditLog. |
| **CT-AUTH-03** | Concurrent Login Quota | Gửi đồng thời 20 request đăng nhập từ các IP/thiết bị khác nhau cho cùng một user. | Toàn bộ các session được tạo thành công nếu dưới ngưỡng tối đa (ví dụ 10 sessions/user); các session cũ nhất tự động bị xoay vòng loại bỏ (FIFO Session Eviction). Không xảy ra deadlock trong database. |

---

## 3. MÔ PHỎNG SCRIPT KIỂM THỬ ĐỒNG THỜI (CONCURRENCY SPECIFICATION)

Để đảm bảo sẵn sàng cho giai đoạn Implementation, dưới đây là đặc tả mã nguồn kiểm thử kịch bản **Parallel Refresh Race Condition** sử dụng Vitest:

```typescript
// test/auth/concurrency-refresh.spec.ts
describe('Auth Concurrency - Refresh Token Rotation Race Condition', () => {
  it('should handle parallel refresh requests gracefully without false-positive reuse invalidation', async () => {
    // 1. Arrange: Đăng nhập và lấy Refresh Token ban đầu
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@bizpro.vn', password: 'Password123!@#' });
    
    const initialRefreshToken = extractRefreshTokenFromCookie(loginRes);

    // 2. Act: Bắn đồng thời 5 requests refresh bằng cùng 1 initialRefreshToken
    const parallelRequests = Array.from({ length: 5 }).map(() =>
      request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`bizpro_refresh_token=${initialRefreshToken}`])
    );

    const responses = await Promise.all(parallelRequests);

    // 3. Assert: Toàn bộ 5 requests phải thành công (200 OK) hoặc request đầu 200, các request sau nhận token mới
    const successResponses = responses.filter(r => r.status === 200);
    expect(successResponses.length).toBeGreaterThanOrEqual(1);

    // Đảm bảo user KHÔNG bị thu hồi phiên nhầm (không bị lock out toàn bộ)
    const meRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${successResponses[0].body.data.accessToken}`);
    expect(meRes.status).toBe(200);
  });
});
```

---

## 4. QUY TRÌNH THỰC THI & TIÊU CHÍ NGHIỆM THU TEST (ACCEPTANCE GATE)
- **100% tests trong ma trận phải vượt qua (Pass Rate = 100%)**.
- **Không có bất kỳ cảnh báo rò rỉ bộ nhớ (Memory Leak)** trong quá trình hash Argon2id dưới tải 100 concurrent requests.
- **Thời gian phản hồi P95:**
  - Login endpoint: <= 200ms (Bao gồm chi phí tính toán Argon2id).
  - Refresh token endpoint: <= 30ms (Truy vấn SHA-256 hash từ index DB).
  - Me / Auth verification endpoint: <= 15ms.
