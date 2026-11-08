ALTER POLICY tenant_child_isolation_policy ON stock_receipt_items
USING (
  current_setting('app.is_system_context', true) = 'true' OR
  EXISTS (
    SELECT 1 FROM stock_receipts p
    WHERE p.id = stock_receipt_items.receipt_id
      AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  )
)
WITH CHECK (
  current_setting('app.is_system_context', true) = 'true' OR
  EXISTS (
    SELECT 1 FROM stock_receipts p
    WHERE p.id = stock_receipt_items.receipt_id
      AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  )
);

ALTER POLICY tenant_child_isolation_policy ON stock_issue_items
USING (
  current_setting('app.is_system_context', true) = 'true' OR
  EXISTS (
    SELECT 1 FROM stock_issues p
    WHERE p.id = stock_issue_items.issue_id
      AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  )
)
WITH CHECK (
  current_setting('app.is_system_context', true) = 'true' OR
  EXISTS (
    SELECT 1 FROM stock_issues p
    WHERE p.id = stock_issue_items.issue_id
      AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  )
);

ALTER POLICY tenant_child_isolation_policy ON stocktake_items
USING (
  current_setting('app.is_system_context', true) = 'true' OR
  EXISTS (
    SELECT 1 FROM stocktakes p
    WHERE p.id = stocktake_items.stocktake_id
      AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  )
)
WITH CHECK (
  current_setting('app.is_system_context', true) = 'true' OR
  EXISTS (
    SELECT 1 FROM stocktakes p
    WHERE p.id = stocktake_items.stocktake_id
      AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  )
);

ALTER POLICY tenant_child_isolation_policy ON stock_transfer_items
USING (
  current_setting('app.is_system_context', true) = 'true' OR
  EXISTS (
    SELECT 1 FROM stock_transfers p
    WHERE p.id = stock_transfer_items.transfer_id
      AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  )
)
WITH CHECK (
  current_setting('app.is_system_context', true) = 'true' OR
  EXISTS (
    SELECT 1 FROM stock_transfers p
    WHERE p.id = stock_transfer_items.transfer_id
      AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  )
);

ALTER POLICY tenant_child_isolation_policy ON stock_adjustment_items
USING (
  current_setting('app.is_system_context', true) = 'true' OR
  EXISTS (
    SELECT 1 FROM stock_adjustments p
    WHERE p.id = stock_adjustment_items.adjustment_id
      AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  )
)
WITH CHECK (
  current_setting('app.is_system_context', true) = 'true' OR
  EXISTS (
    SELECT 1 FROM stock_adjustments p
    WHERE p.id = stock_adjustment_items.adjustment_id
      AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  )
);

ALTER POLICY tenant_child_isolation_policy ON sales_order_items
USING (
  current_setting('app.is_system_context', true) = 'true' OR
  EXISTS (
    SELECT 1 FROM sales_orders p
    WHERE p.id = sales_order_items.sales_order_id
      AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  )
)
WITH CHECK (
  current_setting('app.is_system_context', true) = 'true' OR
  EXISTS (
    SELECT 1 FROM sales_orders p
    WHERE p.id = sales_order_items.sales_order_id
      AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  )
);

ALTER POLICY tenant_child_isolation_policy ON role_permissions
USING (
  current_setting('app.is_system_context', true) = 'true' OR
  EXISTS (
    SELECT 1 FROM roles p
    WHERE p.id = role_permissions.role_id
      AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  )
)
WITH CHECK (
  current_setting('app.is_system_context', true) = 'true' OR
  EXISTS (
    SELECT 1 FROM roles p
    WHERE p.id = role_permissions.role_id
      AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  )
);

ALTER POLICY tenant_child_isolation_policy ON user_roles
USING (
  current_setting('app.is_system_context', true) = 'true' OR
  EXISTS (
    SELECT 1 FROM users p
    WHERE p.id = user_roles.user_id
      AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  )
)
WITH CHECK (
  current_setting('app.is_system_context', true) = 'true' OR
  EXISTS (
    SELECT 1 FROM users p
    WHERE p.id = user_roles.user_id
      AND p.organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid
  )
);
