# BÁO CÁO BẢO MẬT RLS & PHÂN TÁCH TENANT: PHASE 2F — HRM
**(PHASE 2F ROW-LEVEL SECURITY & TENANT ISOLATION REPORT)**

**Mã tài liệu:** `docs/PHASE_2F_RLS_SECURITY_REPORT.md`  
**Dự án:** BizPro+ Modular Enterprise ERP & Business Management System  
**Ngày ban hành:** 06/11/2026  
**Chuyên gia thực hiện:** Principal Database Security Auditor  
**Kính gửi:** Senior Technical Lead & Code Auditor (ChatGPT)  
**Trạng thái:** **RLS VERIFICATION — PASS (100% FAIL-CLOSED)**

---

## 1. TIÊU CHUẨN AN TOÀN RLS TẦNG DỮ LIỆU

1. **Loại bỏ hoàn toàn nhánh bypass:** Không bảng nào trong 10 bảng HRM chứa điều kiện `current_setting('app.is_system_context', true) = 'true'`. Runtime role `bizpro_app` không có cách nào vượt qua rào cản phân tách dữ liệu.
2. **Cơ chế Fail-Closed:** Khi `app.current_organization_id` chưa được thiết lập hoặc là chuỗi rỗng:
   `NULLIF(current_setting('app.current_organization_id', true), '')` trả về `NULL`.
   Biểu thức `organization_id = NULL::uuid` trả về `UNKNOWN`, tự động từ chối 100% bản ghi (0 rows returned).
3. **FORCE ROW LEVEL SECURITY:** Kích hoạt `FORCE ROW LEVEL SECURITY` trên cả 10 bảng để ngăn chặn việc bypass khi table owner thực thi truy vấn.

---

## 2. XÁC MINH RUNTIME ROLE `bizpro_app`

- **Least Privilege:**
  - `rolsuper`: `false` (Không có đặc quyền SUPERUSER).
  - `rolbypassrls`: `false` (Không có quyền BYPASSRLS).
  - `rolcreaterole`: `false`.
  - Không có quyền nâng cấp đặc quyền sang `bizpro_user` (Lệnh `SET ROLE bizpro_user` bị chặn với lỗi `SQLSTATE 42501 permission denied`).
- **Quyền thao tác DML:** `GRANT SELECT, INSERT, UPDATE, DELETE` trên cả 10 bảng HRM.
- **Quyền DDL:** `REVOKE CREATE ON SCHEMA public FROM bizpro_app` (Ngăn chặn Object Shadowing).

---

## 3. THIẾT LẬP TENANT CONTEXT TẠI TẦNG ỨNG DỤNG (NESTJS)

1. **Nguồn gốc Tenant ID:** `organizationId` được trích xuất duy nhất từ Header JWT `Authorization: Bearer <token>` đã được xác minh mật mã bởi `JwtStrategy` tại Backend.
2. **Nguyên tắc không tin tưởng Client:** Tuyệt đối không nhận `organization_id` từ URL params, query string hay request body.
3. **Phạm vi Transaction (is_local = true):**
   ```typescript
   await tx.$queryRaw`SELECT set_config('app.current_organization_id', ${orgId}, true)`;
   ```
   Cờ `is_local = true` đảm bảo biến cấu hình tự động giải phóng ngay khi transaction commit/rollback, triệt tiêu 100% nguy cơ ô nhiễm Connection Pool.

---

## 4. BẰNG CHỨNG KIỂM THỬ THỰC TẾ (TC-HRM-12)

- Truy vấn danh sách nhân viên từ Org B: 0 bản ghi của Org A xuất hiện.
- Truy vấn nhân viên Org A theo ID từ Org B: Trả về `404 Not Found` (Fail-Closed).
- Cố gắng duyệt đơn nghỉ phép của Org A từ Org B: Trả về `404 Not Found`.
- Đánh giá: **ĐẠT TIÊU CHUẨN AN TOÀN RLS ĐA TỔ CHỨC**.
