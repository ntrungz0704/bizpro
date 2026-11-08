# BÁO CÁO XÁC MINH AN NINH RLS SYSTEM CONTEXT: PHASE 2E
**(PHASE 2E RLS SYSTEM CONTEXT FINAL SECURITY AUDIT REPORT)**

**Dự án**: BizPro+ Modular Enterprise ERP & Business Management System  
**Mã tài liệu**: `docs/PHASE_2E_RLS_SYSTEM_CONTEXT_FINAL_VERIFICATION.md`  
**Ngày ban hành**: 06/11/2026  
**Chuyên gia thực hiện**: Principal Software Architect & Senior Database Security Auditor  
**Kính gửi**: Senior Technical Lead & Code Auditor (ChatGPT)  
**Trạng thái kết luận**: **RLS SYSTEM CONTEXT VULNERABLE — BLOCKER REMAINS**

---

## 1. RUNTIME GUC BYPASS VERIFICATION (KIỂM TRA THỰC NGHIỆM TẦNG POSTGRESQL)

Toàn bộ các lệnh kiểm tra dưới đây được thực thi trực tiếp trên container PostgreSQL 16 vật lý (`bizpro_postgres`) sử dụng chính runtime database role **`bizpro_app`** của ứng dụng NestJS:

### 1.1. Thực nghiệm 1: Khả năng tự thiết lập custom GUC `app.is_system_context`
```sql
SELECT current_user, session_user;
SELECT set_config('app.is_system_context', 'true', true);
SELECT current_setting('app.is_system_context', true);
```

**Kết quả thực tế từ PostgreSQL**:
```text
 current_user | session_user 
--------------+--------------
 bizpro_app   | bizpro_app
(1 row)

 set_config 
------------
 true
(1 row)

 current_setting 
-----------------
 true
(1 row)
```
$\rightarrow$ **Xác nhận 1**: Runtime role `bizpro_app` **hoàn toàn có thể tự gọi `set_config('app.is_system_context', 'true', true)`** mà không bị PostgreSQL từ chối.

---

### 1.2. Thực nghiệm 2: Khả năng đọc dữ liệu Cross-Tenant khi kích hoạt System Context
Thực thi kiểm tra đọc dữ liệu trên bảng `sales_orders` trong 2 trường hợp:

#### Trường hợp A: Không có context (Fail-Closed kiểm chứng)
```sql
BEGIN;
SELECT count(*) as total_orders_fail_closed FROM sales_orders;
COMMIT;
```
**Kết quả**: `total_orders_fail_closed = 0` (Fail-Closed hoạt động chính xác khi không có tham số).

#### Trường hợp B: Runtime role `bizpro_app` tự bật `app.is_system_context = 'true'`
```sql
BEGIN;
SELECT set_config('app.is_system_context', 'true', true);
SELECT count(*) as total_orders_in_system FROM sales_orders;
SELECT organization_id, count(*) FROM sales_orders GROUP BY organization_id;
COMMIT;
```
**Kết quả thực tế từ PostgreSQL**:
```text
 total_orders_in_system 
------------------------
                     14
(1 row)

           organization_id            | count 
--------------------------------------+-------
 c478491c-76e9-4e0a-9d9e-108b3e811100 |    14
(1 row)
```
$\rightarrow$ **Xác nhận 2 (Vulnerability Confirmed)**: Khi `bizpro_app` gọi `set_config('app.is_system_context', 'true', true)`, nhánh OR trong policy:
```sql
((current_setting('app.is_system_context', true) = 'true') OR (organization_id = ...))
```
ngay lập tức trả về `TRUE`, cho phép session đọc **100% dữ liệu của toàn bộ các tổ chức (Cross-Tenant Access)**.

---

## 2. PRIVILEGED DATABASE ROLE & ROLE MEMBERSHIP VERIFICATION

Kiểm tra quan hệ giữa `bizpro_app` và `bizpro_user`:

### 2.1. Quyền hạn trong `pg_roles`:
```sql
SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin, rolbypassrls 
FROM pg_roles 
WHERE rolname IN ('bizpro_app', 'bizpro_user');
```
```text
   rolname   | rolsuper | rolinherit | rolcreaterole | rolcreatedb | rolcanlogin | rolbypassrls 
-------------+----------+------------+---------------+-------------+-------------+--------------
 bizpro_app  | f        | t          | f             | f           | t           | f
 bizpro_user | t        | t          | t             | t           | t           | t
```

### 2.2. Kiểm tra Role Membership (`pg_auth_members`):
```sql
SELECT r.rolname as role, m.rolname as member, a.admin_option 
FROM pg_auth_members a 
JOIN pg_roles r ON a.roleid = r.oid 
JOIN pg_roles m ON a.member = m.oid;
```
$\rightarrow$ `bizpro_app` **không phải là member của `bizpro_user`**.

### 2.3. Thực nghiệm chuyển quyền (`SET ROLE`):
```sql
-- Chạy dưới quyền bizpro_app:
SET ROLE bizpro_user;
```
**Kết quả**:
```text
ERROR: permission denied to set role "bizpro_user"
```
$\rightarrow$ **Xác nhận 3**: `bizpro_app` **không thể leo quyền thành superuser `bizpro_user`**.

---

## 3. SYSTEM CONTEXT SOURCE-CODE TRACE & ỨNG DỤNG THỰC TẾ

### 3.1. Điểm khởi tạo System Context duy nhất trong mã nguồn
Trong toàn bộ mã nguồn backend, `set_config('app.is_system_context', ...)` chỉ tồn tại tại:
`backend/src/prisma/prisma.service.ts`:
```typescript
  async runInSystemContext<T>(
    fn: (tx: import('@prisma/client').Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT set_config('app.is_system_context', 'true', true);`;
      return fn(tx);
    });
  }
```

### 3.2. Các module đang sử dụng `runInSystemContext`
1. **`AuthService`**: Tra cứu người dùng theo email khi login (lúc này chưa biết `organization_id`), đếm số lần sai mật khẩu để khóa tài khoản, tạo phiên làm việc `user_sessions`, xác minh OTP mở khóa.
2. **`PermissionsGuard`**: Tra cứu bảng phân quyền `user_roles` và `role_permissions` trong hệ thống.
3. **`UserService`**: Quản trị tài khoản người dùng bởi Quản trị viên tổ chức.

### 3.3. Ranh giới API thông thường (External Attack Surface)
- `app.current_organization_id` **KHÔNG** thể bị client can thiệp trực tiếp từ payload hay query params: toàn bộ các Controller nghiệp vụ (`SalesController`, `InventoryController`, `CrmController`) đều trích xuất `orgId` từ JWT đã được ký mật mã.
- Phân hệ `SalesService` **100% sử dụng `runInTenantContext(orgId)`**, không có bất kỳ endpoint Sales nào gọi `runInSystemContext`.

---

## 4. KẾT LUẬN MỨC ĐỘ ẢNH HƯỞNG & ĐÁNH GIÁ RỦI RO (ROOT CAUSE ANALYSIS)

### Bản chất của Lỗ hổng:
- **Thiếu Defense-in-Depth tại tầng Cơ sở Dữ liệu**: Ranh giới bảo mật đa người thuê (Multi-Tenancy) hiện đang **phụ thuộc hoàn toàn vào kỷ luật lập trình của tầng ứng dụng** (`runInTenantContext` vs `runInSystemContext`).
- Tại tầng cơ sở dữ liệu PostgreSQL, vì `bizpro_app` có toàn quyền thực thi hàm `set_config` cho bất kỳ biến custom GUC nào (`app.*`), PostgreSQL Engine **không thể phân biệt** được lệnh `SELECT set_config('app.is_system_context', 'true', true)` được gọi từ quy trình Auth hợp lệ hay từ một đoạn mã độc / truy vấn SQL Injection khai thác qua session của `bizpro_app`.

---

## 5. PHƯƠNG ÁN KHẮC PHỤC TỐI THIỂU & TẬN GỐC (MINIMAL REMEDIATION PLAN)

Để biến chính sách RLS thành **Zero-Trust Fail-Closed 100% ở tầng Database**, không cho phép `bizpro_app` tùy tiện bật System Context, đề xuất 2 phương án tối thiểu:

### Phương án Khuyến nghị (HMAC-SHA256 Token Protection):
1. **Bảo vệ biến System Context bằng Secret Token**:
   Thay vì chỉ kiểm tra giá trị `'true'`, Policy RLS kiểm tra chữ ký bí mật chỉ có tại server:
   ```sql
   current_setting('app.system_context_secret', true) = '<SHARED_SYSTEM_INTERNAL_SECRET>'
   ```
   Hoặc:
2. **Tách biệt Role Database (Dual Connection Pools)**:
   - `bizpro_app` (Runtime API): **KHÔNG CÓ NHÁNH OR `app.is_system_context` TRONG POLICY**. Mọi truy vấn từ `bizpro_app` bắt buộc 100% phải có `organization_id` hợp lệ.
   - `bizpro_system` (Auth/Worker Pool): Sử dụng một database user riêng biệt dành cho Login / Background Jobs, được cấp quyền truy cập bảng cross-tenant thông qua policy riêng biệt hoặc role chuyên biệt.

---

## 6. THÔNG BÁO VỀ AN NINH CREDENTIAL

Đội ngũ kỹ thuật đã ghi nhận cảnh báo bảo mật về database password:
- Đã cách ly chuỗi kết nối nhạy cảm khỏi các báo cáo tiếp theo.
- Sẵn sàng quy trình đổi mật khẩu `bizpro_app` và cập nhật `.env` ngay khi chuyển sang bước cấu hình môi trường sản xuất.

---

## 7. KẾT LUẬN & TRẠNG THÁI CHÍNH THỨC

# **RLS SYSTEM CONTEXT VULNERABLE — BLOCKER REMAINS**

Đội ngũ kỹ thuật hoàn toàn thống nhất với nhận định chuẩn xác của Senior Technical Lead (ChatGPT):
**Multi-Tenant Isolation là ranh giới sống còn của Enterprise ERP**. Bằng chứng thực nghiệm đã chỉ rõ `app.is_system_context` là một điểm nghẽn kiến trúc (Architectural Vulnerability) tại tầng PostgreSQL RLS cần được bịt kín trước khi hệ thống được cấp chứng nhận xuất xưởng.

Kính đề nghị Senior Technical Lead (ChatGPT) phê duyệt phương án khắc phục tối thiểu để đội ngũ tiến hành đóng gói giải pháp dứt điểm!
