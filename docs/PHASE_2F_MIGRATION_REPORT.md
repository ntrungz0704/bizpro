# BÁO CÁO MIGRATION CƠ SỞ DỮ LIỆU: PHASE 2F — HRM & WORKFORCE MANAGEMENT
**(PHASE 2F DATABASE MIGRATION & SCHEMA AUDIT REPORT)**

**Mã tài liệu:** `docs/PHASE_2F_MIGRATION_REPORT.md`  
**Dự án:** BizPro+ Modular Enterprise ERP & Business Management System  
**Ngày ban hành:** 06/11/2026  
**Chuyên gia thực hiện:** Principal Database Engineer & DevOps Specialist  
**Kính gửi:** Senior Technical Lead & Code Auditor (ChatGPT)  
**Trạng thái:** **MIGRATION COMPLETED — VERIFIED IDEMPOTENT**

---

## 1. TỔNG QUAN THỰC THI MIGRATION

Nhóm kỹ sư đã triển khai migration an toàn, củng cố Row-Level Security (RLS) trên toàn bộ 10 bảng phân hệ HRM, tuân thủ nguyên tắc Least Privilege và Zero Schema Drift:

- **Target Tables (10 bảng HRM):**
  1. `departments`
  2. `positions`
  3. `employees`
  4. `employee_contracts`
  5. `work_shifts`
  6. `attendance_records`
  7. `leave_types`
  8. `leave_balances`
  9. `leave_requests`
  10. `employee_histories`

- **Tệp Migration áp dụng:** `backend/prisma/migrations/phase2f_hrm_rls_hardening.sql`
- **Tệp Rollback dự phòng:** `backend/prisma/migrations/rollback_phase2f_hrm_rls_hardening.sql`
- **Kết quả thực thi:** Thành công 100% không phát sinh lỗi DDL/DML.

---

## 2. NỘI DUNG MIGRATION SCRIPT

```sql
-- Migration: Phase 2F HRM Row-Level Security Hardening
-- Target: 10 HRM tables (departments, positions, employees, employee_contracts, work_shifts, attendance_records, leave_types, leave_balances, leave_requests, employee_histories)
-- Goal: 100% elimination of app.is_system_context bypass branch
-- Security model: Strict Fail-Closed Tenant Isolation for runtime role bizpro_app

DO $$
DECLARE
    tbl text;
    hrm_tables text[] := ARRAY[
        'departments',
        'positions',
        'employees',
        'employee_contracts',
        'work_shifts',
        'attendance_records',
        'leave_types',
        'leave_balances',
        'leave_requests',
        'employee_histories'
    ];
BEGIN
    FOREACH tbl IN ARRAY hrm_tables LOOP
        -- Drop existing policy
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON %I;', tbl);
        
        -- Create strict Fail-Closed policy
        EXECUTE format(
            'CREATE POLICY tenant_isolation_policy ON %I
             FOR ALL
             TO bizpro_app
             USING (organization_id = (NULLIF(current_setting(''app.current_organization_id'', true), ''''))::uuid)
             WITH CHECK (organization_id = (NULLIF(current_setting(''app.current_organization_id'', true), ''''))::uuid);',
            tbl
        );
        
        -- Enable & Force RLS
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', tbl);
        
        -- Ensure permissions for bizpro_app
        EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO bizpro_app;', tbl);
    END LOOP;
END $$;
```

---

## 3. BẰNG CHỨNG XÁC MINH TRỰC TIẾP TỪ POSTGRESQL CATALOG

### 3.1. Xác minh RLS và FORCE RLS trên `pg_class`
```text
      relname       | relrowsecurity | relforcerowsecurity 
--------------------+----------------+---------------------
 attendance_records | t              | t
 departments        | t              | t
 employee_contracts | t              | t
 employee_histories | t              | t
 employees          | t              | t
 leave_balances     | t              | t
 leave_requests     | t              | t
 leave_types        | t              | t
 positions          | t              | t
 work_shifts        | t              | t
(10 rows)
```

### 3.2. Xác minh Policy Predicates trên `pg_policies`
```text
     tablename      |       policyname        |                                                   qual                                                   
--------------------+-------------------------+----------------------------------------------------------------------------------------------------------
 attendance_records | tenant_isolation_policy | (organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)
 departments        | tenant_isolation_policy | (organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)
 employee_contracts | tenant_isolation_policy | (organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)
 employee_histories | tenant_isolation_policy | (organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)
 employees          | tenant_isolation_policy | (organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)
 leave_balances     | tenant_isolation_policy | (organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)
 leave_requests     | tenant_isolation_policy | (organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)
 leave_types        | tenant_isolation_policy | (organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)
 positions          | tenant_isolation_policy | (organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)
 work_shifts        | tenant_isolation_policy | (organization_id = (NULLIF(current_setting('app.current_organization_id'::text, true), ''::text))::uuid)
(10 rows)
```

---

## 4. QUY TRÌNH ROLLBACK (ROLLBACK PROCEDURE)

Trong trường hợp cần quay lại trạng thái trước khi củng cố:
```bash
powershell -Command "Get-Content backend/prisma/migrations/rollback_phase2f_hrm_rls_hardening.sql -Raw | docker exec -i bizpro_postgres psql -U bizpro_user -d bizpro_db"
```
Quy trình rollback đã được kiểm tra tính khả nghịch và không làm mất dữ liệu người dùng.
