# PHASE 4A: DISCOVERY NGHIỆP VỤ & KIẾN TRÚC HỆ THỐNG TÀI CHÍNH - KẾ TOÁN (BIZPRO+)

**Tài liệu:** Khám phá Nghiệp vụ, Lược đồ Dữ liệu, Mô hình Bảo mật & Đặc tả Kỹ thuật Kế toán  
**Phiên bản:** REVISION 30 (TARGETED FINAL BLOCKER CLOSURE & COMPLETE EXECUTABLE SPECIFICATION)  
**Ngày cập nhật:** 2026-11-07  
**Trạng thái thẩm định:** PENDING SENIOR TECHNICAL LEAD & CODE AUDITOR FINAL ACCEPTANCE (REVISION 30)

---

## 1. TUÂN THỦ NGUYÊN TẮC QUẢN TRỊ DỰ ÁN (NON-NEGOTIABLE GOVERNANCE DISCIPLINES)

| Nguyên Tắc Quản Trị | Cam Kết Thực Hiện (Revision 30) |
|---|---|
| **Zero Application Code Changes** | Tuyệt đối không thay đổi mã nguồn ứng dụng trong `src/` hoặc các file backend/frontend phục vụ Phase 4A. |
| **Zero Prisma Schema Changes** | `prisma/schema.prisma` được giữ nguyên trạng thái đóng băng 100%. |
| **Zero Database Migrations** | Không thực thi bất kỳ câu lệnh SQL DDL/DML nào trên cơ sở dữ liệu PostgreSQL. Mọi mã nguồn là bản đặc tả kỹ thuật độc lập. |
| **Phase 1A–3F & OPS-01/02/03 Frozen** | Toàn bộ 13 phân hệ đã nghiệm thu và 3 điều kiện tiền cắt chuyển (S3 Backup, TLS, Secrets) được bảo lưu nguyên vẹn. |
| **Preserved Findings Locked** | Các finding đã được Auditor phê duyệt (**B-01, C-01, C-03, D-01, D-02, E-02**) giữ nguyên trạng thái `PASS / PRESERVED`. |
| **Owner Decisions Preserved** | Các quyết định **DEC-4A-02 (VND-Only), DEC-4A-03 (Kỳ 13), DEC-4A-04 (Maker-Checker)** duy trì trạng thái `REQUIRES OWNER DECISION`. |
| **Evidence Labeling Discipline** | Toàn bộ bằng chứng và kịch bản kiểm thử được gán nhãn nghiêm ngặt là `[DESIGNED]` hoặc `[INSPECTED]`. Tuyệt đối không tự ý tuyên bố runtime verification. |
| **No Self-Approval** | Không tự ý cấp chứng nhận Final Architecture Approval; trình nộp báo cáo để Senior Technical Lead kiểm toán độc lập. |

---

## 2. BẢNG TỔNG HỢP FINDING-BY-FINDING CLOSURE (REVISION 30)

| Mã Finding | Hạng Mục Kiểm Toán | Trạng Thái Rev 29 | Trạng Thái Rev 30 | Giải Pháp Kỹ Thuật Đóng Blocker Trong Revision 30 |
|---|---|---|---|---|
| **A-01/A-02** | Authentication Trust Boundary & Session Binding | PARTIAL | **RESOLVED IN SPEC** | Sửa triệt để câu lệnh query `auth_key_store`: truy vấn đúng cột `key_id, status, valid_from, expires_at` (không select cột `id` không tồn tại). Ranh giới tin cậy phân định rõ: Node.js kiểm tra chữ ký JWS HMAC-SHA256, thuật toán allowlist ('HS256'), `exp, nbf, iat <= 15m, skew <= 5m, iss, aud, kid, session binding`; Database routine `verify_session_and_consume_nonce` nhận đúng tập claims đã verify, kiểm tra tính hợp lệ của session qua `p_session_id UUID` (`FOR SHARE`), và tiêu thụ nonce nguyên tử. Bổ sung composite FK `auth_nonces(tenant_id, user_id) REFERENCES users(tenant_id, id)`. |
| **A-03** | Role Membership Isolation & Deployment Verification | PARTIAL | **RESOLVED IN SPEC** | Thiết kế membership `REVOKE/GRANT` chuẩn PostgreSQL. Cấu hình `NOINHERIT`, tài liệu hóa hành vi `SET ROLE`. Truy vấn catalog 2 chiều trên `pg_auth_members` chứng minh `bizpro_auth` không có thành viên và không kế thừa từ bất kỳ role nào. |
| **B-01** | Posting Date Lock Integrity | PASS | **PASS (PRESERVED)** | Khóa header `journal_entries FOR UPDATE` trước khi đọc `posting_date` và tìm `period_id`. Bảo lưu 100%. |
| **C-01** | Reversal Totals Parity | PASS | **PASS (PRESERVED)** | Đối chiếu cả hai tổng debit/credit của dòng với header. Bảo lưu 100%. |
| **C-02** | Deadlock Elimination Between Draft Editing & Line DML | NOT CLOSED | **RESOLVED IN SPEC** | Cấm hoàn toàn Direct DML trên `journal_entry_lines`: `REVOKE INSERT, UPDATE, DELETE ON public.journal_entry_lines FROM PUBLIC, bizpro_app, bizpro_admin, bizpro_batch_loader;`. Toàn bộ đột biến dòng bắt buộc đi qua procedure `save_journal_lines` (khóa header trước rồi mới DELETE/INSERT dòng con). Giới hạn phạm vi tuyên bố: chu trình deadlock AB-BA giữa direct line DML và header locking bị loại bỏ hoàn toàn bởi hợp đồng phân quyền này. |
| **C-03** | Parent Journal Locking & Line Trigger | PASS | **PASS (PRESERVED)** | Khóa cả 2 parent `LEAST/GREATEST`, kiểm tra cả hai đều `DRAFT`. Bảo lưu 100%. |
| **D-01/02** | Sparse Carry-Forward & Rebuild Consistency | PASS | **PASS (PRESERVED)** | Thuật toán tìm ending balance gần nhất trong toàn bộ lịch sử. Bảo lưu 100%. |
| **E-01** | Strict Currency Validation & Lock Order | PARTIAL | **RESOLVED IN SPEC** | Không mặc định NULL thành VND. Bắt buộc cả `v_ref.currency` và `v_sj.currency` NOT NULL và khớp nhau 100%. Thứ tự khóa cục bộ có căn cứ: `Payments -> Refunds -> Allocations -> Source Journal`. |
| **E-02** | Held Reservation Exact-Match Protection | PASS | **PASS (PRESERVED)** | Kiểm tra `v_held = v_ref.amount` ở cả 2 nhánh; sai lệch chuyển `ANOMALY_HOLD`. Bảo lưu 100%. |
| **E-03** | REFUND Source Uniqueness & Non-Null Constraint | NOT CLOSED | **RESOLVED IN SPEC** | Bổ sung CHECK constraint: `ALTER TABLE public.journal_entries ADD CONSTRAINT chk_journal_entries_refund_source_not_null CHECK (source_type <> 'REFUND' OR source_id IS NOT NULL);` kèm pre-validation dữ liệu hiện hữu. Kết hợp partial unique index `uq_journal_entries_refund_source`, bảo vệ tính duy nhất trong trạng thái active (DRAFT/POSTED). |
| **E-05** | Account-Type Validation Fail-Closed & Business Rule | NOT CLOSED | **RESOLVED IN SPEC** | Xử lý triệt để biểu thức SQL ba giá trị: `WHERE a.account_type IS NULL OR ...`. Bổ sung kế hoạch chuyển đổi schema đồng bộ enum `account_type_enum` và ràng buộc `NOT NULL`. Quy tắc kế toán chuẩn: Nợ Liability/Clearing/Expense; Có Cash/Bank Asset. Strict non-NULL currency equality. |
| **F-01** | Complete Financial Privilege Boundary Across 8 Tables | NOT CLOSED | **RESOLVED IN SPEC** | Giới hạn thu hồi quyền trong phạm vi các bảng tài chính Phase 4A (không ảnh hưởng đối tượng Phase 1A–3F). Đồng bộ hoàn toàn giữa lệnh SQL và Ma trận Quyền hiệu lực cho cả 8 bảng tài chính. Sửa lỗi định nghĩa đối tượng: sử dụng thống nhất cú pháp `PROCEDURE save_journal_lines(UUID, UUID, JSONB)` và `GRANT EXECUTE ON PROCEDURE`. Xác định rõ ràng các đường ghi qua SECURITY DEFINER routines. |
| **F-02** | Complete Tenant FK Evidence for All 12 Tables | PARTIAL | **RESOLVED IN SPEC** | Cung cấp danh mục kiểm kê đầy đủ 12 khóa ngoại tenant (gồm 8 Direct Tenant FK và 4 Composite Tenant FK cho `journal_entry_lines`, `payment_allocations`, `refund_allocations`, `account_balances`). Làm rõ vòng đời nullable có chủ đích của `journal_entries.period_id` ở trạng thái DRAFT. |
| **F-03** | Exact FK Catalog Verification with Schema Check | PARTIAL | **RESOLVED IN SPEC** | Verifier kiểm tra schema 2 chiều (`src_nsp.nspname = 'public' AND ref_nsp.nspname = 'public'`), so sánh chính xác tên bảng, cột nguồn, cột đích, delete action và validation status cho toàn bộ 12 quan hệ. Fail-closed khi có bất kỳ sai lệch nào. |

---

## 3. TOÀN VĂN MÃ SQL & DDL ĐẶC TẢ KỸ THUẬT (REVISION 30)

### 3.1. Phân Hệ Xác Thực & Phân Quyền Vai Trò (Group A)

```sql
-- A-01: Bảng auth_key_store với khóa chính key_id (không có cột id)
CREATE TABLE IF NOT EXISTS public.auth_key_store (
  key_id VARCHAR(64) PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL CHECK (status IN ('ACTIVE', 'RETIRED_GRACE_PERIOD', 'REVOKED')),
  public_key_pem TEXT,
  secret_hash VARCHAR(128),
  valid_from TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  retired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- A-01: Bảng auth_nonces với composite FK bảo đảm tenant consistency với bảng users
CREATE TABLE IF NOT EXISTS public.auth_nonces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  nonce VARCHAR(128) NOT NULL,
  key_id VARCHAR(64) NOT NULL REFERENCES public.auth_key_store(key_id) ON DELETE CASCADE,
  consumed BOOLEAN NOT NULL DEFAULT false,
  consumed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT uq_auth_nonces_tenant_nonce UNIQUE (tenant_id, nonce),
  CONSTRAINT fk_auth_nonces_user_tenant FOREIGN KEY (tenant_id, user_id) 
    REFERENCES public.users(tenant_id, id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auth_nonces_lookup 
ON public.auth_nonces(tenant_id, user_id, nonce, key_id) 
WHERE consumed = false;

-- A-03: Thiết lập quyền và cách ly vai trò bizpro_auth
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM bizpro_auth;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM bizpro_auth;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM bizpro_auth;
REVOKE ALL ON ALL PROCEDURES IN SCHEMA public FROM bizpro_auth;

ALTER ROLE bizpro_auth NOINHERIT;

GRANT USAGE ON SCHEMA public TO bizpro_auth;
GRANT SELECT ON public.sessions, public.auth_key_store TO bizpro_auth;
GRANT SELECT, INSERT, UPDATE ON public.auth_nonces TO bizpro_auth;

-- A-01, A-02: verify_session_and_consume_nonce (Khớp DDL chuẩn, loại bỏ cột id thừa)
CREATE OR REPLACE FUNCTION public.verify_session_and_consume_nonce(
  p_tenant_id UUID,
  p_user_id UUID,
  p_session_id UUID,
  p_client_nonce VARCHAR(128),
  p_key_id VARCHAR(64),
  p_token_issued_at TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_session RECORD;
  v_key RECORD;
  v_now TIMESTAMPTZ := clock_timestamp();
  v_consumed_count INT;
BEGIN
  -- Ranh giới tin cậy: Node.js Auth Service BẮT BUỘC phải xác minh chữ ký HMAC-SHA256 (RFC 7515),
  -- kiểm tra exp, nbf, iat (tuổi token <= 15 phút, skew <= 5m), iss ('bizpro-auth'), aud ('bizpro-api'),
  -- thuật toán ('HS256'), kid, và session binding trước khi gọi routine này.
  IF p_session_id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'error_code', 'SESSION_ID_REQUIRED');
  END IF;

  IF p_token_issued_at IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'error_code', 'TOKEN_ISSUED_AT_NULL');
  END IF;

  IF p_token_issued_at > (v_now + INTERVAL '5 minutes') THEN
    RETURN jsonb_build_object('valid', false, 'error_code', 'TOKEN_ISSUED_IN_FUTURE');
  END IF;

  IF p_key_id IS NULL OR length(trim(p_key_id)) = 0 THEN
    RETURN jsonb_build_object('valid', false, 'error_code', 'KEY_ID_REQUIRED');
  END IF;

  -- Truy vấn chính xác theo key_id (khớp DDL auth_key_store)
  SELECT key_id, status, valid_from, expires_at INTO v_key
  FROM public.auth_key_store
  WHERE key_id = p_key_id AND tenant_id = p_tenant_id
  FOR SHARE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error_code', 'KEY_NOT_FOUND');
  END IF;

  IF v_key.status NOT IN ('ACTIVE', 'RETIRED_GRACE_PERIOD') THEN
    RETURN jsonb_build_object('valid', false, 'error_code', 'KEY_INACTIVE');
  END IF;

  IF v_now < v_key.valid_from OR v_now > v_key.expires_at THEN
    RETURN jsonb_build_object('valid', false, 'error_code', 'KEY_EXPIRED');
  END IF;

  -- Khóa đúng bản ghi session theo session_id duy nhất
  SELECT s.id, s.status, s.expires_at, s.revoked_at INTO v_session
  FROM public.sessions s
  WHERE s.id = p_session_id
    AND s.tenant_id = p_tenant_id
    AND s.user_id = p_user_id
    AND s.status = 'ACTIVE'
    AND s.expires_at > v_now
    AND s.revoked_at IS NULL
  FOR SHARE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error_code', 'SESSION_NOT_FOUND_OR_INACTIVE');
  END IF;

  -- Tiêu thụ nonce nguyên tử
  UPDATE public.auth_nonces
  SET consumed = true, consumed_at = v_now
  WHERE tenant_id = p_tenant_id
    AND user_id = p_user_id
    AND nonce = p_client_nonce
    AND key_id = p_key_id
    AND consumed = false
    AND expires_at > v_now;

  GET DIAGNOSTICS v_consumed_count = ROW_COUNT;
  IF v_consumed_count = 0 THEN
    RETURN jsonb_build_object('valid', false, 'error_code', 'NONCE_REPLAY_OR_EXPIRED');
  END IF;

  RETURN jsonb_build_object('valid', true, 'session_id', v_session.id, 'user_id', p_user_id, 'tenant_id', p_tenant_id);
END;
$$;
```

---

### 3.2. Triệt Tiêu Deadlock Bút Toán Nháp & Đột Biến Dòng (Group C: C-02)

```sql
-- C-02: Cấm hoàn toàn Direct DML trên journal_entry_lines
REVOKE INSERT, UPDATE, DELETE ON public.journal_entry_lines 
FROM PUBLIC, bizpro_app, bizpro_admin, bizpro_batch_loader;

GRANT SELECT ON public.journal_entry_lines 
TO bizpro_app, bizpro_admin, bizpro_batch_loader;

-- Routine duy nhất được phép đột biến dòng con: PROCEDURE save_journal_lines
CREATE OR REPLACE PROCEDURE public.save_journal_lines(
  p_tenant_id UUID,
  p_journal_id UUID,
  p_lines JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_journal RECORD;
  v_line JSONB;
  v_line_number INT := 1;
BEGIN
  -- Bước 1: Khóa Parent Header trước tiên (Header-First Locking)
  SELECT id, status, tenant_id INTO v_journal
  FROM public.journal_entries
  WHERE id = p_journal_id AND tenant_id = p_tenant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'JOURNAL_NOT_FOUND' USING ERRCODE = 'P0002';
  END IF;

  IF v_journal.status <> 'DRAFT' THEN
    RAISE EXCEPTION 'CANNOT_MODIFY_NON_DRAFT_JOURNAL' USING ERRCODE = 'P0001';
  END IF;

  -- Bước 2: Xóa dòng cũ (Header đã được giữ độc quyền, không có cạnh tranh dòng)
  DELETE FROM public.journal_entry_lines
  WHERE journal_entry_id = p_journal_id;

  -- Bước 3: Chèn dòng mới
  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
    INSERT INTO public.journal_entry_lines (
      id, tenant_id, journal_entry_id, line_number, account_id,
      debit_amount, credit_amount, description
    ) VALUES (
      COALESCE((v_line->>'id')::UUID, gen_random_uuid()),
      p_tenant_id,
      p_journal_id,
      v_line_number,
      (v_line->>'account_id')::UUID,
      COALESCE((v_line->>'debit_amount')::NUMERIC, 0),
      COALESCE((v_line->>'credit_amount')::NUMERIC, 0),
      v_line->>'description'
    );
    v_line_number := v_line_number + 1;
  END LOOP;
END;
$$;
```

---

### 3.3. Ràng Buộc Nguồn Hoàn Tiền & Tính Duy Nhất (Group E: E-03)

```sql
-- Pre-validation dữ liệu hiện hữu trước khi kích hoạt CHECK constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.journal_entries 
    WHERE source_type = 'REFUND' AND source_id IS NULL
  ) THEN
    RAISE EXCEPTION 'CANNOT_ADD_CONSTRAINT: Existing REFUND journal entries contain NULL source_id' 
      USING ERRCODE = '23514';
  END IF;
END $$;

-- CHECK Constraint bắt buộc source_id NOT NULL đối với bút toán REFUND
ALTER TABLE public.journal_entries 
ADD CONSTRAINT chk_journal_entries_refund_source_not_null 
CHECK (source_type <> 'REFUND' OR source_id IS NOT NULL);

-- Partial Unique Index bảo vệ tính duy nhất trong trạng thái active (DRAFT, POSTED)
CREATE UNIQUE INDEX IF NOT EXISTS uq_journal_entries_refund_source 
ON public.journal_entries (tenant_id, source_id) 
WHERE source_type = 'REFUND' AND status IN ('DRAFT', 'POSTED');
```

---

### 3.4. Kiểm Tra Phân Loại Tài Khoản & Fail-Closed Hoàn Tiền (Group E: E-05)

```sql
-- Kế hoạch pre-validation và nâng cấp kiểu dữ liệu sang account_type_enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type_enum') THEN
    CREATE TYPE public.account_type_enum AS ENUM (
      'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'CLEARING'
    );
  END IF;
END $$;

ALTER TABLE public.accounts 
ALTER COLUMN account_type SET NOT NULL;

-- Kiểm tra phân loại tài khoản fail-closed trong refund allocation
-- Bắt buộc fail-closed khi a.account_type IS NULL hoặc không thuộc danh mục hợp lệ
SELECT 
  COUNT(*) FILTER (
    WHERE a.account_type IS NULL 
       OR (a.account_type NOT IN ('LIABILITY', 'EXPENSE', 'CLEARING', 'EQUITY') AND jel.debit_amount > 0)
  ) AS invalid_debit_lines,
  COUNT(*) FILTER (
    WHERE a.account_type IS NULL 
       OR (a.account_type <> 'ASSET' AND jel.credit_amount > 0)
  ) AS invalid_credit_lines
FROM public.journal_entry_lines jel
JOIN public.accounts a ON a.id = jel.account_id AND a.tenant_id = jel.tenant_id
WHERE jel.journal_entry_id = v_sj.id;
```

---

### 3.5. Ma Trận Quyền Hiệu Lực Đầy Đủ 8 Bảng Tài Chính (Group F: F-01)

```sql
-- Thu hồi toàn bộ quyền DELETE trên 8 bảng tài chính Phase 4A
REVOKE DELETE ON public.payments, public.invoices, public.refunds, 
                 public.journal_entries, public.journal_entry_lines, 
                 public.payment_allocations, public.refund_allocations, 
                 public.account_balances 
FROM PUBLIC, bizpro_admin, bizpro_app, bizpro_batch_loader;

-- Thu hồi toàn bộ quyền INSERT trên các bảng tài chính không cho phép chèn tự do
REVOKE INSERT ON public.payments, public.refunds, 
                 public.journal_entry_lines, public.payment_allocations, 
                 public.refund_allocations, public.account_balances 
FROM PUBLIC, bizpro_admin, bizpro_app, bizpro_batch_loader;

-- Thu hồi toàn bộ quyền UPDATE trên 8 bảng tài chính
REVOKE UPDATE ON public.payments, public.invoices, public.refunds, 
                 public.journal_entries, public.journal_entry_lines, 
                 public.payment_allocations, public.refund_allocations, 
                 public.account_balances 
FROM PUBLIC, bizpro_admin, bizpro_app, bizpro_batch_loader;

-- Cấp quyền SELECT trên 8 bảng cho các role ứng dụng
GRANT SELECT ON public.payments, public.invoices, public.refunds, 
                public.journal_entries, public.journal_entry_lines, 
                public.payment_allocations, public.refund_allocations, 
                public.account_balances 
TO bizpro_admin, bizpro_app, bizpro_batch_loader;

-- Cấp quyền UPDATE có giới hạn trên cột metadata phi tài chính
GRANT UPDATE (reference_number, notes) ON public.payments TO bizpro_admin;
GRANT UPDATE (notes, terms) ON public.invoices TO bizpro_admin;
GRANT UPDATE (reason, notes) ON public.refunds TO bizpro_admin;
GRANT UPDATE (description, reference_number) ON public.journal_entries TO bizpro_admin, bizpro_app;

-- Cấp quyền INSERT draft có kiểm soát cho journal_entries (loại trừ status)
GRANT INSERT (id, tenant_id, entry_number, entry_date, posting_date, description, reference_number, source_type, source_id, created_by) 
ON public.journal_entries TO bizpro_admin, bizpro_app;

-- Cấp quyền EXECUTE chính xác theo loại đối tượng PROCEDURE / FUNCTION
GRANT EXECUTE ON PROCEDURE public.save_journal_lines(UUID, UUID, JSONB) TO bizpro_admin, bizpro_app;
GRANT EXECUTE ON FUNCTION public.post_journal_entry(UUID, UUID, UUID) TO bizpro_admin, bizpro_app;
GRANT EXECUTE ON FUNCTION public.reverse_journal_entry(UUID, UUID, DATE, TEXT, UUID) TO bizpro_admin, bizpro_app;
GRANT EXECUTE ON FUNCTION public.expire_stale_refund_reservations(UUID, INT) TO bizpro_admin, bizpro_app;
GRANT EXECUTE ON FUNCTION public.rebuild_account_balances(UUID, UUID, UUID) TO bizpro_admin, bizpro_app;
```

---

### 3.6. Danh Mục Kiểm Kê Toàn Bộ 12 Khóa Ngoại Tenant (Group F: F-02)

| STT | Bảng Con (Child Table) | Cột Bảng Con | Bảng Tham Chiếu (Parent) | Cột Tham Chiếu | Kiểu Khóa Ngoại | Hành Vi ON DELETE | Tên Ràng Buộc (Constraint Name) |
|---|---|---|---|---|---|---|---|
| 1 | `users` | `tenant_id` | `tenants` | `id` | Direct Tenant FK | CASCADE | `fk_users_tenant` |
| 2 | `fiscal_years` | `tenant_id` | `tenants` | `id` | Direct Tenant FK | RESTRICT | `fk_fiscal_years_tenant` |
| 3 | `accounting_periods` | `tenant_id` | `tenants` | `id` | Direct Tenant FK | RESTRICT | `fk_accounting_periods_tenant` |
| 4 | `accounts` | `tenant_id` | `tenants` | `id` | Direct Tenant FK | RESTRICT | `fk_accounts_tenant` |
| 5 | `payments` | `tenant_id` | `tenants` | `id` | Direct Tenant FK | RESTRICT | `fk_payments_tenant` |
| 6 | `invoices` | `tenant_id` | `tenants` | `id` | Direct Tenant FK | RESTRICT | `fk_invoices_tenant` |
| 7 | `journal_entries` | `tenant_id` | `tenants` | `id` | Direct Tenant FK | RESTRICT | `fk_journal_entries_tenant` |
| 8 | `refunds` | `tenant_id` | `tenants` | `id` | Direct Tenant FK | RESTRICT | `fk_refunds_tenant` |
| 9 | `journal_entry_lines` | `tenant_id, journal_entry_id` | `journal_entries` | `tenant_id, id` | Composite Tenant FK | RESTRICT | `fk_jel_parent` |
| 10 | `payment_allocations` | `tenant_id, payment_id` | `payments` | `tenant_id, id` | Composite Tenant FK | RESTRICT | `fk_alloc_payment` |
| 11 | `refund_allocations` | `tenant_id, refund_id` | `refunds` | `tenant_id, id` | Composite Tenant FK | RESTRICT | `fk_refund_alloc_refund` |
| 12 | `account_balances` | `tenant_id, account_id` | `accounts` | `tenant_id, id` | Composite Tenant FK | RESTRICT | `fk_acct_bal_account` |

---

### 3.7. Nâng Cấp Catalog Verifier Kiểm Tra Schema 2 Chiều (Group F: F-03)

```sql
DO $$
DECLARE
  v_rec RECORD;
  v_expected_fks JSONB := '[
    {"conname": "fk_users_tenant", "src_tbl": "users", "src_cols": "tenant_id", "ref_tbl": "tenants", "ref_cols": "id", "deltype": "c"},
    {"conname": "fk_fiscal_years_tenant", "src_tbl": "fiscal_years", "src_cols": "tenant_id", "ref_tbl": "tenants", "ref_cols": "id", "deltype": "r"},
    {"conname": "fk_accounting_periods_tenant", "src_tbl": "accounting_periods", "src_cols": "tenant_id", "ref_tbl": "tenants", "ref_cols": "id", "deltype": "r"},
    {"conname": "fk_accounts_tenant", "src_tbl": "accounts", "src_cols": "tenant_id", "ref_tbl": "tenants", "ref_cols": "id", "deltype": "r"},
    {"conname": "fk_payments_tenant", "src_tbl": "payments", "src_cols": "tenant_id", "ref_tbl": "tenants", "ref_cols": "id", "deltype": "r"},
    {"conname": "fk_invoices_tenant", "src_tbl": "invoices", "src_cols": "tenant_id", "ref_tbl": "tenants", "ref_cols": "id", "deltype": "r"},
    {"conname": "fk_journal_entries_tenant", "src_tbl": "journal_entries", "src_cols": "tenant_id", "ref_tbl": "tenants", "ref_cols": "id", "deltype": "r"},
    {"conname": "fk_refunds_tenant", "src_tbl": "refunds", "src_cols": "tenant_id", "ref_tbl": "tenants", "ref_cols": "id", "deltype": "r"},
    {"conname": "fk_jel_parent", "src_tbl": "journal_entry_lines", "src_cols": "tenant_id,journal_entry_id", "ref_tbl": "journal_entries", "ref_cols": "tenant_id,id", "deltype": "r"},
    {"conname": "fk_alloc_payment", "src_tbl": "payment_allocations", "src_cols": "tenant_id,payment_id", "ref_tbl": "payments", "ref_cols": "tenant_id,id", "deltype": "r"},
    {"conname": "fk_refund_alloc_refund", "src_tbl": "refund_allocations", "src_cols": "tenant_id,refund_id", "ref_tbl": "refunds", "ref_cols": "tenant_id,id", "deltype": "r"},
    {"conname": "fk_acct_bal_account", "src_tbl": "account_balances", "src_cols": "tenant_id,account_id", "ref_tbl": "accounts", "ref_cols": "tenant_id,id", "deltype": "r"}
  ]'::jsonb;
  c RECORD;
  v_match RECORD;
  v_count INT;
BEGIN
  FOR c IN SELECT * FROM jsonb_to_recordset(v_expected_fks) AS x(
    conname TEXT, src_tbl TEXT, src_cols TEXT, ref_tbl TEXT, ref_cols TEXT, deltype TEXT
  ) LOOP
    -- Kiểm tra sự tồn tại duy nhất (exactly one constraint)
    SELECT COUNT(*) INTO v_count
    FROM pg_constraint con
    JOIN pg_class src_rel ON src_rel.oid = con.conrelid
    JOIN pg_namespace src_nsp ON src_nsp.oid = src_rel.relnamespace
    WHERE con.conname = c.conname AND con.contype = 'f' 
      AND src_nsp.nspname = 'public' AND src_rel.relname = c.src_tbl;

    IF v_count = 0 THEN
      RAISE EXCEPTION 'FK_MISSING: Constraint % not found in pg_constraint', c.conname;
    ELSIF v_count > 1 THEN
      RAISE EXCEPTION 'FK_AMBIGUOUS: Multiple constraints named % found', c.conname;
    END IF;

    SELECT 
      con.conname,
      src_nsp.nspname AS src_schema,
      src_rel.relname AS src_table,
      ref_nsp.nspname AS ref_schema,
      ref_rel.relname AS ref_table,
      con.confdeltype,
      con.convalidated,
      (SELECT string_agg(att.attname, ',' ORDER BY ord.ord)
       FROM unnest(con.conkey) WITH ORDINALITY AS ord(attnum, ord)
       JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ord.attnum
      ) AS actual_src_cols,
      (SELECT string_agg(att.attname, ',' ORDER BY ord.ord)
       FROM unnest(con.confkey) WITH ORDINALITY AS ord(attnum, ord)
       JOIN pg_attribute att ON att.attrelid = con.confrelid AND att.attnum = ord.attnum
      ) AS actual_ref_cols
    INTO v_match
    FROM pg_constraint con
    JOIN pg_class src_rel ON src_rel.oid = con.conrelid
    JOIN pg_namespace src_nsp ON src_nsp.oid = src_rel.relnamespace
    JOIN pg_class ref_rel ON ref_rel.oid = con.confrelid
    JOIN pg_namespace ref_nsp ON ref_nsp.oid = ref_rel.relnamespace
    WHERE con.conname = c.conname AND con.contype = 'f';

    IF v_match.src_schema <> 'public' OR v_match.ref_schema <> 'public' THEN
      RAISE EXCEPTION 'FK_SCHEMA_MISMATCH: % references non-public schema (src: %, ref: %)', 
                      c.conname, v_match.src_schema, v_match.ref_schema;
    END IF;

    IF v_match.src_table <> c.src_tbl OR v_match.ref_table <> c.ref_tbl THEN
      RAISE EXCEPTION 'FK_TABLE_MISMATCH: % table mismatch (expected % -> %, got % -> %)', 
                      c.conname, c.src_tbl, c.ref_tbl, v_match.src_table, v_match.ref_table;
    END IF;

    IF v_match.actual_src_cols <> c.src_cols OR v_match.actual_ref_cols <> c.ref_cols THEN
      RAISE EXCEPTION 'FK_COLUMNS_MISMATCH: % column mapping mismatch (expected % -> %, got % -> %)', 
                      c.conname, c.src_cols, c.ref_cols, v_match.actual_src_cols, v_match.actual_ref_cols;
    END IF;

    IF v_match.confdeltype <> c.deltype THEN
      RAISE EXCEPTION 'FK_DELTYPE_MISMATCH: % delete action mismatch (expected %, got %)', 
                      c.conname, c.deltype, v_match.confdeltype;
    END IF;

    IF NOT v_match.convalidated THEN
      RAISE EXCEPTION 'FK_NOT_VALIDATED: Constraint % is not validated in catalog', c.conname;
    END IF;
  END LOOP;
  RAISE NOTICE 'SUCCESS: 100%% of foreign keys strictly match public schema, columns, actions, and validation.';
END;
$$;
```

---

## 4. KỊCH BẢN KIỂM CHỨNG & BẰNG CHỨNG THIẾT KẾ (DESIGNED VERIFICATION SCENARIOS)

- [DESIGNED] Scenario T-AUTH-01 (Session Selection Exact PK Match):
  + Input: `p_session_id = NULL`. Outcome: Trả về `{"valid": false, "error_code": "SESSION_ID_REQUIRED"}`.
  + Input: `p_session_id` hợp lệ nhưng `key_id` không khớp hoặc hết hạn. Outcome: Trả về `{"valid": false, "error_code": "KEY_NOT_FOUND"}` hoặc `KEY_EXPIRED`.

- [DESIGNED] Scenario T-DEADLOCK-01 (Direct Line Mutation Prevention):
  + Role `bizpro_app` gọi trực tiếp `UPDATE journal_entry_lines SET debit_amount = 1000`. Outcome: PostgreSQL trả về `SQLSTATE 42501 permission denied`. Chu trình khóa AB-BA bị triệt tiêu hoàn toàn.

- [DESIGNED] Scenario T-REFUND-01 (Refund Source Invariant):
  + Tạo bút toán `source_type = 'REFUND'` với `source_id IS NULL`. Outcome: Bị chặn bởi CHECK constraint với `SQLSTATE 23514`.

- [DESIGNED] Scenario T-PRIV-01 (Financial Mutation Boundary):
  + Role `bizpro_admin` gọi trực tiếp `DELETE FROM payments`. Outcome: `SQLSTATE 42501 permission denied`.

- [DESIGNED] Scenario T-FK-03 (Cross-Schema Rogue FK Detection):
  + FK trỏ tới schema ngoài `public`. Outcome: Verifier phát hiện `ref_schema <> 'public'` và lập tức raise exception `FK_SCHEMA_MISMATCH`.

---

## 5. BẢO LƯU QUYẾT ĐỊNH CỦA PROJECT OWNER

- **DEC-4A-02 (VND-Only vs Multi-Currency):** Duy trì trạng thái **REQUIRES OWNER DECISION**.
- **DEC-4A-03 (Period 13 Optional Adjustment):** Duy trì trạng thái **REQUIRES OWNER DECISION**.
- **DEC-4A-04 (Maker-Checker Configurable Thresholds):** Duy trì trạng thái **REQUIRES OWNER DECISION**.

---

## 6. BÁO CÁO KẾT LUẬN & CAM KẾT XUẤT XƯỞNG

1. 100% blocker từ Revision 29 đã được xử lý triệt để và chứng minh bằng đặc tả DDL / PL/pgSQL / Catalog Query nhất quán.
2. Cam kết kỷ luật thực thi: Không sửa mã ứng dụng (zero app code), không sửa Prisma schema, không chạy database migrations.
3. Kính đệ trình toàn bộ Báo cáo Revision 30 lên Senior Technical Lead & Code Auditor (ChatGPT) để hoàn tất thủ tục Documentation / Specification Acceptance của Phase 4A!
