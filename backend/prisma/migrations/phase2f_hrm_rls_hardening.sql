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
