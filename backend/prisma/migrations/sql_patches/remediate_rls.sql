-- ============================================================================
-- PHASE 2E: RLS SYSTEM CONTEXT REMEDIATION SCRIPT
-- Eliminates app.is_system_context bypass from Sales & Inventory RLS policies
-- Implements Security Definer fn_auth_lookup_user for auth pre-lookup
-- ============================================================================

-- 1. Create Security Definer Auth Lookup Function
CREATE OR REPLACE FUNCTION fn_auth_lookup_user(p_email text)
RETURNS TABLE (
  id uuid,
  organization_id uuid,
  organization_code character varying(50),
  organization_status "CommonStatus",
  email character varying(255),
  password_hash character varying(255),
  full_name character varying(255),
  status "CommonStatus",
  auth_version integer,
  failed_login_attempts integer,
  locked_until timestamp with time zone,
  unlock_otp_hash character varying(64),
  unlock_otp_expires_at timestamp with time zone,
  unlock_otp_attempts integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

GRANT EXECUTE ON FUNCTION fn_auth_lookup_user(text) TO bizpro_app;

-- 2. Drop and Recreate RLS Policies on Sales tables (WITHOUT is_system_context bypass)

-- sales_orders
DROP POLICY IF EXISTS tenant_isolation_policy ON sales_orders;
CREATE POLICY tenant_isolation_policy ON sales_orders
  FOR ALL
  TO PUBLIC
  USING (organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid)
  WITH CHECK (organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid);

-- fulfillments
DROP POLICY IF EXISTS tenant_isolation_policy ON fulfillments;
CREATE POLICY tenant_isolation_policy ON fulfillments
  FOR ALL
  TO PUBLIC
  USING (organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid)
  WITH CHECK (organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid);

-- payment_transactions
DROP POLICY IF EXISTS tenant_isolation_policy ON payment_transactions;
CREATE POLICY tenant_isolation_policy ON payment_transactions
  FOR ALL
  TO PUBLIC
  USING (organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid)
  WITH CHECK (organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid);

-- sales_order_items (child)
DROP POLICY IF EXISTS tenant_child_isolation_policy ON sales_order_items;
CREATE POLICY tenant_child_isolation_policy ON sales_order_items
  FOR ALL
  TO PUBLIC
  USING (EXISTS (
    SELECT 1 FROM sales_orders p
    WHERE p.id = sales_order_items.sales_order_id
      AND p.organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM sales_orders p
    WHERE p.id = sales_order_items.sales_order_id
      AND p.organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid
  ));

-- sales_order_status_histories (child)
DROP POLICY IF EXISTS tenant_child_isolation_policy ON sales_order_status_histories;
CREATE POLICY tenant_child_isolation_policy ON sales_order_status_histories
  FOR ALL
  TO PUBLIC
  USING (EXISTS (
    SELECT 1 FROM sales_orders p
    WHERE p.id = sales_order_status_histories.sales_order_id
      AND p.organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM sales_orders p
    WHERE p.id = sales_order_status_histories.sales_order_id
      AND p.organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid
  ));

-- fulfillment_items (child)
DROP POLICY IF EXISTS tenant_child_isolation_policy ON fulfillment_items;
CREATE POLICY tenant_child_isolation_policy ON fulfillment_items
  FOR ALL
  TO PUBLIC
  USING (EXISTS (
    SELECT 1 FROM fulfillments p
    WHERE p.id = fulfillment_items.fulfillment_id
      AND p.organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM fulfillments p
    WHERE p.id = fulfillment_items.fulfillment_id
      AND p.organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid
  ));

-- 3. Drop and Recreate RLS Policies on Inventory Core tables (WITHOUT is_system_context bypass)

-- inventory_reservations
DROP POLICY IF EXISTS tenant_isolation_policy ON inventory_reservations;
CREATE POLICY tenant_isolation_policy ON inventory_reservations
  FOR ALL
  TO PUBLIC
  USING (organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid)
  WITH CHECK (organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid);

-- inventory_balances
DROP POLICY IF EXISTS tenant_isolation_policy ON inventory_balances;
CREATE POLICY tenant_isolation_policy ON inventory_balances
  FOR ALL
  TO PUBLIC
  USING (organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid)
  WITH CHECK (organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid);

-- inventory_transactions
DROP POLICY IF EXISTS tenant_isolation_policy ON inventory_transactions;
CREATE POLICY tenant_isolation_policy ON inventory_transactions
  FOR ALL
  TO PUBLIC
  USING (organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid)
  WITH CHECK (organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid);

-- stock_issues
DROP POLICY IF EXISTS tenant_isolation_policy ON stock_issues;
CREATE POLICY tenant_isolation_policy ON stock_issues
  FOR ALL
  TO PUBLIC
  USING (organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid)
  WITH CHECK (organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid);

-- stock_issue_items (child)
DROP POLICY IF EXISTS tenant_child_isolation_policy ON stock_issue_items;
CREATE POLICY tenant_child_isolation_policy ON stock_issue_items
  FOR ALL
  TO PUBLIC
  USING (EXISTS (
    SELECT 1 FROM stock_issues p
    WHERE p.id = stock_issue_items.stock_issue_id
      AND p.organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM stock_issues p
    WHERE p.id = stock_issue_items.stock_issue_id
      AND p.organization_id = (NULLIF(current_setting('app.current_organization_id', true), ''))::uuid
  ));

-- Ensure FORCE ROW LEVEL SECURITY remains active on all tables
ALTER TABLE sales_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items FORCE ROW LEVEL SECURITY;
ALTER TABLE sales_order_status_histories FORCE ROW LEVEL SECURITY;
ALTER TABLE fulfillments FORCE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_items FORCE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE inventory_reservations FORCE ROW LEVEL SECURITY;
ALTER TABLE inventory_balances FORCE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE stock_issues FORCE ROW LEVEL SECURITY;
ALTER TABLE stock_issue_items FORCE ROW LEVEL SECURITY;
