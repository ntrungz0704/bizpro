-- =====================================================================
-- BIZPRO+ PHASE 1D / PHASE 2A: AUTHENTICATION & SECURITY FOUNDATION
-- Migration: 20261105210000_phase_1d_security_foundation
-- =====================================================================

-- 1. Create Enums for Session & Token Management
CREATE TYPE "session_status" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');
CREATE TYPE "token_family_status" AS ENUM ('ACTIVE', 'REVOKED');
CREATE TYPE "refresh_token_status" AS ENUM ('ACTIVE', 'ROTATED', 'REVOKED', 'EXPIRED');

-- 2. Alter Table users with Security Columns
ALTER TABLE "users" 
ADD COLUMN "auth_version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "last_unlock_otp_sent_at" TIMESTAMPTZ,
ADD COLUMN "locked_until" TIMESTAMPTZ,
ADD COLUMN "password_changed_at" TIMESTAMPTZ,
ADD COLUMN "unlock_otp_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "unlock_otp_expires_at" TIMESTAMPTZ,
ADD COLUMN "unlock_otp_hash" VARCHAR(64);

-- 3. Create Table user_sessions
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "session_status" NOT NULL DEFAULT 'ACTIVE',
    "device_id" VARCHAR(128),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "revoked_at" TIMESTAMPTZ,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- 4. Create Table token_families
CREATE TABLE "token_families" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "token_family_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ,

    CONSTRAINT "token_families_pkey" PRIMARY KEY ("id")
);

-- 5. Create Table refresh_tokens
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "token_family_id" UUID NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "status" "refresh_token_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "rotated_at" TIMESTAMPTZ,
    "replaced_by_token_id" UUID,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- 6. Create Table auth_idempotency_records
CREATE TABLE "auth_idempotency_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "idempotency_key" VARCHAR(128) NOT NULL,
    "session_id" UUID NOT NULL,
    "token_family_id" UUID NOT NULL,
    "request_token_hash" VARCHAR(64) NOT NULL,
    "endpoint" VARCHAR(255) NOT NULL,
    "response_status_code" INTEGER NOT NULL,
    "response_headers" JSONB NOT NULL,
    "encrypted_envelope" BYTEA NOT NULL,
    "key_id" VARCHAR(64) NOT NULL,
    "nonce" BYTEA NOT NULL,
    "auth_tag" BYTEA NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "auth_idempotency_records_pkey" PRIMARY KEY ("id")
);

-- 7. Indexes & Unique Constraints
CREATE INDEX "idx_user_sessions_user_status" ON "user_sessions"("user_id", "status");
CREATE INDEX "idx_user_sessions_org" ON "user_sessions"("organization_id");
CREATE INDEX "idx_user_sessions_expires_at" ON "user_sessions"("expires_at");

CREATE UNIQUE INDEX "token_families_session_id_key" ON "token_families"("session_id");

CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");
CREATE UNIQUE INDEX "refresh_tokens_replaced_by_token_id_key" ON "refresh_tokens"("replaced_by_token_id");
CREATE INDEX "idx_refresh_tokens_family_status" ON "refresh_tokens"("token_family_id", "status");
CREATE INDEX "idx_refresh_tokens_session" ON "refresh_tokens"("session_id");
CREATE INDEX "idx_refresh_tokens_hash" ON "refresh_tokens"("token_hash");
CREATE UNIQUE INDEX "refresh_tokens_token_family_id_sequence_number_key" ON "refresh_tokens"("token_family_id", "sequence_number");

CREATE INDEX "idx_auth_idempotency_expires_at" ON "auth_idempotency_records"("expires_at");
CREATE UNIQUE INDEX "auth_idempotency_records_session_id_idempotency_key_key" ON "auth_idempotency_records"("session_id", "idempotency_key");

-- 8. Foreign Keys
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "token_families" ADD CONSTRAINT "token_families_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "user_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "token_families" ADD CONSTRAINT "token_families_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "user_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_token_family_id_fkey" FOREIGN KEY ("token_family_id") REFERENCES "token_families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "auth_idempotency_records" ADD CONSTRAINT "auth_idempotency_records_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "user_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "auth_idempotency_records" ADD CONSTRAINT "auth_idempotency_records_token_family_id_fkey" FOREIGN KEY ("token_family_id") REFERENCES "token_families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 9. Physical Database Invariants (Phase 1D Security)
-- Partial Unique Index: Tối đa 1 token ACTIVE trên mỗi Family
CREATE UNIQUE INDEX "idx_uq_active_token_per_family" ON "refresh_tokens" ("token_family_id") WHERE "status" = 'ACTIVE';

-- Intra-family replacement foreign key
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "uq_refresh_tokens_id_family" UNIQUE ("id", "token_family_id");
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "fk_refresh_tokens_replacement" FOREIGN KEY ("replaced_by_token_id", "token_family_id") REFERENCES "refresh_tokens" ("id", "token_family_id") ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED;

-- Lifecycle State Machine Check Constraint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "chk_refresh_tokens_lifecycle" CHECK (
  ("status" = 'ACTIVE' AND "rotated_at" IS NULL AND "replaced_by_token_id" IS NULL) OR
  ("status" = 'ROTATED' AND "rotated_at" IS NOT NULL AND "replaced_by_token_id" IS NOT NULL) OR
  ("status" = 'REVOKED') OR
  ("status" = 'EXPIRED')
);

-- Strict Monotonic Sequence & DAG Anti-Cycle Trigger
CREATE OR REPLACE FUNCTION trg_check_refresh_token_monotonic_seq()
RETURNS TRIGGER AS $$
DECLARE
  v_target_seq INT;
BEGIN
  IF NEW.replaced_by_token_id IS NOT NULL THEN
    SELECT sequence_number INTO v_target_seq
    FROM refresh_tokens
    WHERE id = NEW.replaced_by_token_id AND token_family_id = NEW.token_family_id;

    IF v_target_seq IS NULL OR v_target_seq <= NEW.sequence_number THEN
      RAISE EXCEPTION 'ANTI_CYCLE_VIOLATION: Token thay the co seq (%) phai lon hon token hien tai (%)',
        v_target_seq, NEW.sequence_number;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_refresh_tokens_monotonic_seq
AFTER UPDATE OF replaced_by_token_id ON refresh_tokens
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION trg_check_refresh_token_monotonic_seq();

-- 10. ROW LEVEL SECURITY (RLS) POLICIES — FAIL-CLOSED

-- Direct Tenant Tables (having organization_id directly)
DO $$
DECLARE
  tbl text;
  direct_tables text[] := ARRAY[
    'users', 'roles', 'departments', 'positions', 'employees',
    'employee_contracts', 'work_shifts', 'attendance_records', 'leave_types',
    'leave_balances', 'leave_requests', 'employee_histories', 'companies',
    'contacts', 'leads', 'customers', 'pipelines', 'pipeline_stages', 'deals',
    'activities', 'crm_notes', 'product_categories',
    'products', 'warehouses', 'inventory_balances', 'suppliers', 'stock_receipts',
    'stock_issues', 'stock_transfers', 'stock_adjustments', 'stocktakes',
    'inventory_transactions', 'inventory_reservations', 'sales_orders',
    'payment_transactions', 'audit_logs', 'notifications', 'files', 'user_sessions'
  ];
BEGIN
  -- Organizations table: isolation where id = current_organization_id
  ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS tenant_isolation_policy ON organizations;
  CREATE POLICY tenant_isolation_policy ON organizations FOR ALL
    USING (id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid)
    WITH CHECK (id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

  -- Other direct tables: isolation where organization_id = current_organization_id
  FOREACH tbl IN ARRAY direct_tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON %I;', tbl);
    EXECUTE format('CREATE POLICY tenant_isolation_policy ON %I FOR ALL USING (organization_id = NULLIF(current_setting(''app.current_organization_id'', true), '''')::uuid) WITH CHECK (organization_id = NULLIF(current_setting(''app.current_organization_id'', true), '''')::uuid);', tbl);
  END LOOP;
END $$;

-- Child Tables (joined through parent tenant table)
-- 1. stock_receipt_items (via stock_receipts.receipt_id)
ALTER TABLE "stock_receipt_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_receipt_items" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_child_isolation_policy ON "stock_receipt_items";
CREATE POLICY tenant_child_isolation_policy ON "stock_receipt_items" FOR ALL
  USING (EXISTS (SELECT 1 FROM stock_receipts p WHERE p.id = stock_receipt_items.receipt_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM stock_receipts p WHERE p.id = stock_receipt_items.receipt_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid));

-- 2. stock_issue_items (via stock_issues.issue_id)
ALTER TABLE "stock_issue_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_issue_items" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_child_isolation_policy ON "stock_issue_items";
CREATE POLICY tenant_child_isolation_policy ON "stock_issue_items" FOR ALL
  USING (EXISTS (SELECT 1 FROM stock_issues p WHERE p.id = stock_issue_items.issue_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM stock_issues p WHERE p.id = stock_issue_items.issue_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid));

-- 3. stock_transfer_items (via stock_transfers.transfer_id)
ALTER TABLE "stock_transfer_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_transfer_items" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_child_isolation_policy ON "stock_transfer_items";
CREATE POLICY tenant_child_isolation_policy ON "stock_transfer_items" FOR ALL
  USING (EXISTS (SELECT 1 FROM stock_transfers p WHERE p.id = stock_transfer_items.transfer_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM stock_transfers p WHERE p.id = stock_transfer_items.transfer_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid));

-- 4. stock_adjustment_items (via stock_adjustments.adjustment_id)
ALTER TABLE "stock_adjustment_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_adjustment_items" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_child_isolation_policy ON "stock_adjustment_items";
CREATE POLICY tenant_child_isolation_policy ON "stock_adjustment_items" FOR ALL
  USING (EXISTS (SELECT 1 FROM stock_adjustments p WHERE p.id = stock_adjustment_items.adjustment_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM stock_adjustments p WHERE p.id = stock_adjustment_items.adjustment_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid));

-- 5. stocktake_items (via stocktakes.stocktake_id)
ALTER TABLE "stocktake_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stocktake_items" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_child_isolation_policy ON "stocktake_items";
CREATE POLICY tenant_child_isolation_policy ON "stocktake_items" FOR ALL
  USING (EXISTS (SELECT 1 FROM stocktakes p WHERE p.id = stocktake_items.stocktake_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM stocktakes p WHERE p.id = stocktake_items.stocktake_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid));

-- 6. sales_order_items (via sales_orders.sales_order_id)
ALTER TABLE "sales_order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sales_order_items" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_child_isolation_policy ON "sales_order_items";
CREATE POLICY tenant_child_isolation_policy ON "sales_order_items" FOR ALL
  USING (EXISTS (SELECT 1 FROM sales_orders p WHERE p.id = sales_order_items.sales_order_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM sales_orders p WHERE p.id = sales_order_items.sales_order_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid));

-- 7. sales_order_status_histories (via sales_orders.sales_order_id)
ALTER TABLE "sales_order_status_histories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sales_order_status_histories" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_child_isolation_policy ON "sales_order_status_histories";
CREATE POLICY tenant_child_isolation_policy ON "sales_order_status_histories" FOR ALL
  USING (EXISTS (SELECT 1 FROM sales_orders p WHERE p.id = sales_order_status_histories.sales_order_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM sales_orders p WHERE p.id = sales_order_status_histories.sales_order_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid));

-- 8. deal_stage_histories (via deals.deal_id)
ALTER TABLE "deal_stage_histories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "deal_stage_histories" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_child_isolation_policy ON "deal_stage_histories";
CREATE POLICY tenant_child_isolation_policy ON "deal_stage_histories" FOR ALL
  USING (EXISTS (SELECT 1 FROM deals p WHERE p.id = deal_stage_histories.deal_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM deals p WHERE p.id = deal_stage_histories.deal_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid));

-- 9. role_permissions (via roles.role_id)
ALTER TABLE "role_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "role_permissions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_child_isolation_policy ON "role_permissions";
CREATE POLICY tenant_child_isolation_policy ON "role_permissions" FOR ALL
  USING (EXISTS (SELECT 1 FROM roles p WHERE p.id = role_permissions.role_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM roles p WHERE p.id = role_permissions.role_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid));

-- 10. user_roles (via users.user_id)
ALTER TABLE "user_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_roles" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_child_isolation_policy ON "user_roles";
CREATE POLICY tenant_child_isolation_policy ON "user_roles" FOR ALL
  USING (EXISTS (SELECT 1 FROM users p WHERE p.id = user_roles.user_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM users p WHERE p.id = user_roles.user_id AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid));

-- 11. Authentication Child Tables: token_families, refresh_tokens, auth_idempotency_records
ALTER TABLE "token_families" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "token_families" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_session_token_family_policy ON "token_families";
CREATE POLICY tenant_session_token_family_policy ON "token_families" FOR ALL
  USING (EXISTS (SELECT 1 FROM user_sessions s WHERE s.id = token_families.session_id AND s.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM user_sessions s WHERE s.id = token_families.session_id AND s.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid));

ALTER TABLE "refresh_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "refresh_tokens" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_session_refresh_tokens_policy ON "refresh_tokens";
CREATE POLICY tenant_session_refresh_tokens_policy ON "refresh_tokens" FOR ALL
  USING (EXISTS (SELECT 1 FROM user_sessions s WHERE s.id = refresh_tokens.session_id AND s.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM user_sessions s WHERE s.id = refresh_tokens.session_id AND s.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid));

ALTER TABLE "auth_idempotency_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auth_idempotency_records" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_session_idempotency_policy ON "auth_idempotency_records";
CREATE POLICY tenant_session_idempotency_policy ON "auth_idempotency_records" FOR ALL
  USING (EXISTS (SELECT 1 FROM user_sessions s WHERE s.id = auth_idempotency_records.session_id AND s.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid))
  WITH CHECK (EXISTS (SELECT 1 FROM user_sessions s WHERE s.id = auth_idempotency_records.session_id AND s.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid));

-- 12. Global / Platform Master Data Tables (Public read-only for all tenants, system managed)
ALTER TABLE "permissions" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS permissions_read_policy ON "permissions";
CREATE POLICY permissions_read_policy ON "permissions" FOR SELECT USING (true);
DROP POLICY IF EXISTS permissions_write_policy ON "permissions";
CREATE POLICY permissions_write_policy ON "permissions" FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE "units_of_measure" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS uom_read_policy ON "units_of_measure";
CREATE POLICY uom_read_policy ON "units_of_measure" FOR SELECT USING (true);
DROP POLICY IF EXISTS uom_write_policy ON "units_of_measure";
CREATE POLICY uom_write_policy ON "units_of_measure" FOR ALL USING (true) WITH CHECK (true);

