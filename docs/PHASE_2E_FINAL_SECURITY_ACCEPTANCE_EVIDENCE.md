# BẰNG CHỨNG KIỂM TOÁN BẢO MẬT CUỐI CÙNG: PHASE 2E
**(PHASE 2E FINAL SECURITY ACCEPTANCE EVIDENCE)**

**Mã tài liệu:** `docs/PHASE_2E_FINAL_SECURITY_ACCEPTANCE_EVIDENCE.md`  
**Dự án:** BizPro+ Enterprise ERP & Business Management Platform  
**Ngày thực hiện:** 06/11/2026  
**Chuyên gia thực hiện:** Principal Database Security Auditor & Backend Architect  
**Kính gửi:** Senior Technical Lead & Code Auditor (ChatGPT)  
**Trạng thái kiểm toán:** **FINAL SECURITY VERIFICATION — PASS**  

---

## 1. BẰNG CHỨNG KIỂM TOÁN SECURITY DEFINER FUNCTION (`fn_auth_lookup_user`)

### 1.1. Catalog Metadata từ `pg_proc` và `pg_roles`
Truy vấn trực tiếp trên PostgreSQL catalog:
```sql
SELECT 
  p.proname, 
  r.rolname as owner, 
  p.prosecdef as is_security_definer, 
  p.proconfig as search_path_config
FROM pg_proc p 
JOIN pg_roles r ON p.proowner = r.oid 
WHERE p.proname = 'fn_auth_lookup_user';
```
**Kết quả thực thi thực tế:**
```text
       proname       |    owner    | is_security_definer |       search_path_config        
---------------------+-------------+---------------------+---------------------------------
 fn_auth_lookup_user | bizpro_user | t                   | {"search_path=public, pg_temp"}
(1 row)
```

### 1.2. Định nghĩa hàm đầy đủ (`pg_get_functiondef`)
```sql
CREATE OR REPLACE FUNCTION public.fn_auth_lookup_user(p_email text)
 RETURNS TABLE(
   id uuid, 
   organization_id uuid, 
   organization_code character varying, 
   organization_status "CommonStatus", 
   email character varying, 
   password_hash character varying, 
   full_name character varying, 
   status "CommonStatus", 
   auth_version integer, 
   failed_login_attempts integer, 
   locked_until timestamp with time zone, 
   unlock_otp_hash character varying, 
   unlock_otp_expires_at timestamp with time zone, 
   unlock_otp_attempts integer
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    u.id, 
    u.organization_id, 
    o.code as organization_code,
    o.status as organization_status,
    u.email, 
    u.password_hash, 
    u.full_name, 
    u.status, 
    u.auth_version, 
    u.failed_login_attempts, 
    u.locked_until,
    u.unlock_otp_hash,
    u.unlock_otp_expires_at, 
    u.unlock_otp_attempts
  FROM users u
  JOIN organizations o ON u.organization_id = o.id
  WHERE lower(u.email) = lower(trim(p_email))
  LIMIT 1;
END;
$function$;
```

### 1.3. Đánh giá tính an toàn của Function
1. **Không ghép chuỗi SQL (No Dynamic SQL / SQL Injection Immunity):** Hàm sử dụng câu lệnh tĩnh hoàn toàn với biến định kiểu `p_email text`. Biểu thức `lower(u.email) = lower(trim(p_email))` được tham số hóa 100% bởi PostgreSQL PL/pgSQL engine.
2. **Dữ liệu trả về tối thiểu:** Chỉ trả về đúng 1 bản ghi (`LIMIT 1`) phục vụ đối soát mật khẩu, kiểm tra tài khoản khóa (`locked_until`, `failed_login_attempts`), và thông tin phiên (`auth_version`). Không trả về bất kỳ dữ liệu nhạy cảm nghiệp vụ nào khác.
3. **Phân quyền thực thi (EXECUTE Privileges) & Phòng chống Object Shadowing:**
   - Đã thu hồi quyền EXECUTE từ `PUBLIC`: `REVOKE EXECUTE ON FUNCTION fn_auth_lookup_user(text) FROM PUBLIC;`
   - Chỉ cấp quyền EXECUTE duy nhất cho runtime role: `GRANT EXECUTE ON FUNCTION fn_auth_lookup_user(text) TO bizpro_app;`
   - Đã thu hồi quyền CREATE trên schema `public` từ `bizpro_app`: `REVOKE CREATE ON SCHEMA public FROM bizpro_app;`
   - `pg_temp` được đặt sau `public` trong cấu hình `search_path`, và cả `PUBLIC` lẫn `bizpro_app` đều **KHÔNG CÓ QUYỀN CREATE** trên schema `public`, triệt tiêu hoàn toàn nguy cơ kẻ tấn công tạo bảng hoặc hàm giả mạo để chiếm quyền (Object Shadowing / Search Path Hijacking / CWE-426).

**Bằng chứng kiểm tra đặc quyền sau tôi luyện (Hardening):**
```text
 public_can_execute | bizpro_app_can_execute | public_can_create | bizpro_app_can_create 
--------------------+------------------------+-------------------+-----------------------
 f                  | t                      | f                 | f
(1 row)
```

### 1.4. Kiểm tra đặc quyền Role Owner vs Runtime Role
```sql
SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin, rolreplication, rolbypassrls 
FROM pg_roles 
WHERE rolname IN ('bizpro_user', 'bizpro_app');
```
**Kết quả thực thi:**
```text
   rolname   | rolsuper | rolinherit | rolcreaterole | rolcreatedb | rolcanlogin | rolreplication | rolbypassrls 
-------------+----------+------------+---------------+-------------+-------------+----------------+--------------
 bizpro_user | t        | t          | t             | t           | t           | t              | t
 bizpro_app  | f        | t          | f             | f           | t           | f              | f
(2 rows)
```
- Role membership kiểm tra qua `pg_auth_members`: `bizpro_app` có **0 memberships** (không thuộc `bizpro_user`).
- Runtime role `bizpro_app` không có quyền SUPERUSER, không có BYPASSRLS, không thể `SET ROLE bizpro_user` (bị PostgreSQL chặn với mã lỗi `42501`).

---

## 2. BẰNG CHỨNG RLS POLICY & RUNTIME ROLE VERIFICATION (11 BẢNG)

### 2.1. Xác nhận RLS ENABLED & FORCE RLS từ `pg_class`
```sql
SELECT 
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relname IN (
    'sales_orders', 'sales_order_items', 'sales_order_status_histories',
    'fulfillments', 'fulfillment_items', 'payment_transactions',
    'inventory_reservations', 'inventory_balances', 'inventory_transactions',
    'stock_issues', 'stock_issue_items'
  )
ORDER BY c.relname;
```
**Kết quả thực thi:**
```text
          table_name          | rls_enabled | force_rls 
------------------------------+-------------+-----------
 fulfillment_items            | t           | t
 fulfillments                 | t           | t
 inventory_balances           | t           | t
 inventory_reservations       | t           | t
 inventory_transactions       | t           | t
 payment_transactions         | t           | t
 sales_order_items            | t           | t
 sales_order_status_histories | t           | t
 sales_orders                 | t           | t
 stock_issue_items            | t           | t
 stock_issues                 | t           | t
(11 rows)
```
**100% (11/11 bảng) đều có `rls_enabled = true` VÀ `force_rls = true`.**

### 2.2. Toàn bộ định nghĩa Policy hiện hành từ `pg_policies`
```sql
SELECT 
  tablename, 
  policyname, 
  qual as using_expr, 
  with_check as with_check_expr
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN (
    'sales_orders', 'sales_order_items', 'sales_order_status_histories',
    'fulfillments', 'fulfillment_items', 'payment_transactions',
    'inventory_reservations', 'inventory_balances', 'inventory_transactions',
    'stock_issues', 'stock_issue_items'
  )
ORDER BY tablename;
```
**Kết quả thực thi thực tế từ PostgreSQL 16 Catalog:**
1. `sales_orders`:
   - `USING`: `(organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)`
   - `WITH CHECK`: `(organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)`
2. `sales_order_items`:
   - `USING`: `(EXISTS (SELECT 1 FROM sales_orders p WHERE p.id = sales_order_items.sales_order_id AND p.organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid))`
   - `WITH CHECK`: Tương tự.
3. `sales_order_status_histories`:
   - `USING`: `(EXISTS (SELECT 1 FROM sales_orders p WHERE p.id = sales_order_status_histories.sales_order_id AND p.organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid))`
   - `WITH CHECK`: Tương tự.
4. `fulfillments`:
   - `USING`: `(organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)`
   - `WITH CHECK`: Tương tự.
5. `fulfillment_items`:
   - `USING`: `(EXISTS (SELECT 1 FROM fulfillments p WHERE p.id = fulfillment_items.fulfillment_id AND p.organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid))`
   - `WITH CHECK`: Tương tự.
6. `payment_transactions`:
   - `USING`: `(organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)`
   - `WITH CHECK`: Tương tự.
7. `inventory_reservations`:
   - `USING`: `(organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)`
   - `WITH CHECK`: Tương tự.
8. `inventory_balances`:
   - `USING`: `(organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)`
   - `WITH CHECK`: Tương tự.
9. `inventory_transactions`:
   - `USING`: `(organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)`
   - `WITH CHECK`: Tương tự.
10. `stock_issues`:
    - `USING`: `(organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)`
    - `WITH CHECK`: Tương tự.
11. `stock_issue_items`:
    - `USING`: `(EXISTS (SELECT 1 FROM stock_issues p WHERE p.id = stock_issue_items.issue_id AND p.organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid))`
    - `WITH CHECK`: Tương tự.

**Xác nhận catalog:** **ĐÃ LOẠI BỎ 100% MỌI NHÁNH `app.is_system_context` TRÊN TẤT CẢ 11 BẢNG.**

### 2.3. Xác nhận Runtime Role của NestJS Backend
- `backend/.env`: `DATABASE_URL="postgresql://bizpro_app:bizpro_password@localhost:5432/bizpro_db?schema=public"`
- Xác nhận truy vấn: `SELECT current_user, session_user;` khi kết nối bằng chuỗi kết nối ứng dụng trả về chính xác:
```text
 current_user | session_user 
--------------+--------------
 bizpro_app   | bizpro_app
(1 row)
```

---

## 3. RANH GIỚI BẢO MẬT TENANT CONTEXT (TENANT CONTEXT BOUNDARY)

### 3.1. Truy vết nguồn gốc `organization_id` (Source-code Trace)
- `backend/src/sales/sales.controller.ts`:
  Toàn bộ endpoint nghiệp vụ đều nhận ngữ cảnh thông qua `this.getContext(req)`.
  ```typescript
  let orgId = req.user?.organizationId;
  let userId = req.user?.id;
  ```
- `req.user` được trích xuất và xác thực chữ ký mật mã bởi `JwtAuthGuard` (`backend/src/auth/jwt.strategy.ts`).
- **Không bao giờ tin cậy hoặc nhận `organizationId` từ URL parameters, query parameters, hoặc request body** của người dùng để quyết định tenant scoping.

### 3.2. Phạm vi thiết lập Tenant Context trong Transaction
Tại `backend/src/prisma/prisma.service.ts`:
```typescript
async runInTenantContext<T>(
  orgId: string,
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return this.$transaction(async (tx) => {
    await tx.$queryRaw(
      Prisma.sql`SELECT set_config('app.current_organization_id', ${orgId}::text, true)`,
    );
    return callback(tx);
  });
}
```
- Sử dụng tham số `is_local = true` trong `set_config`: giá trị biến GUC chỉ có hiệu lực trong phạm vi transaction đó. Khi kết thúc commit hoặc rollback, biến tự động được dọn dẹp, triệt tiêu rủi ro rò rỉ tenant khi connection pool tái sử dụng connection.

### 3.3. Tuyên bố rõ ràng về Giới hạn Ranh giới Bảo mật (Security Boundary Limitations)
- **Xác nhận kiến trúc:** Cơ chế custom GUC `set_config('app.current_organization_id', ...)` được thiết lập bởi application role `bizpro_app` là ranh giới phân tách dữ liệu đa khách thuê (Multi-Tenant Data Isolation) ở cấp độ truy vấn thông thường của ứng dụng.
- **Giới hạn kỹ thuật:** Nếu một kẻ tấn công đạt được khả năng **thực thi SQL tùy ý (Arbitrary SQL Execution)** dưới role `bizpro_app`, kẻ đó vẫn có thể gọi lại `set_config('app.current_organization_id', ...)` để đổi tenant context.
- **Do đó, nhóm kiến trúc khẳng định:**
  1. RLS **không thể** và **không được xem là lớp phòng thủ duy nhất** thay thế cho các biện pháp chống SQL Injection ở tầng ứng dụng.
  2. Hệ thống áp dụng mô hình **Defense-in-Depth**:
     - Tầng API: ValidationPipe nghiêm ngặt chặn ký tự lạ.
     - Tầng ORM: Prisma sử dụng prepared statements / parameterized queries 100%, không ghép chuỗi SQL thô.
     - Tầng Database: RLS bắt buộc `organization_id` phải khớp biến session, triệt tiêu sai sót do lập trình viên quên mệnh đề `WHERE organization_id = ...`.
     - Tầng Role: `bizpro_app` không có quyền DDL (`CREATE`), không có SUPERUSER/BYPASSRLS, không thể nâng đặc quyền sang `bizpro_user`.

---

## 4. KẾT QUẢ KIỂM THỬ HỒI QUY TOÀN BỘ (107/107 TEST CASES PASS)

Toàn bộ 11 test suites chạy đơn luồng `--runInBand` đạt 100% PASS:
```text
PASS test/phase2e.e2e-spec.ts (23/23 passed)
PASS test/phase2c.e2e-spec.ts (11/11 passed)
PASS test/auth.e2e-spec.ts (16/16 passed)
PASS test/database-invariants.e2e-spec.ts (5/5 passed)
PASS test/phase2d.e2e-spec.ts (15/15 passed)
PASS test/phase2b.e2e-spec.ts (11/11 passed)
PASS test/rls-system-context.e2e-spec.ts (7/7 passed)
PASS test/health.e2e-spec.ts (2/2 passed)
PASS test/prisma.e2e-spec.ts (2/2 passed)
PASS test/rls.e2e-spec.ts (6/6 passed)
PASS test/validation.e2e-spec.ts (9/9 passed)

Test Suites: 11 passed, 11 total
Tests:       107 passed, 107 total
Snapshots:   0 total
Time:        26.606 s
```

---

## 5. KẾT LUẬN CUỐI CÙNG

Căn cứ trên các bằng chứng catalog PostgreSQL 16 và kết quả kiểm thử thực tế:
- **`fn_auth_lookup_user`**: Đã được tôi luyện (Hardened), cấu hình `search_path = public, pg_temp`, thu hồi quyền EXECUTE từ `PUBLIC`, thu hồi quyền `CREATE` trên schema `public` từ `bizpro_app`.
- **11 Bảng RLS cốt lõi**: Đã xóa bỏ 100% nhánh bypass `app.is_system_context`, kích hoạt `FORCE ROW LEVEL SECURITY`.
- **Tenant Context**: Được bảo vệ đa tầng từ JWT Signature -> Service Transaction -> Database RLS.

**TRẠNG THÁI KIỂM TOÁN CHÍNH THỨC:**
# **FINAL SECURITY VERIFICATION — PASS**

Kính trình Senior Technical Lead & Code Auditor (ChatGPT) xem xét và chính thức phê chuẩn:
1. **ACCEPTANCE: PHASE 2E — SALES ORDERS & FULFILLMENT**
2. **OPEN IMPLEMENTATION GATE: PHASE 2F — HRM & WORKFORCE MANAGEMENT**
