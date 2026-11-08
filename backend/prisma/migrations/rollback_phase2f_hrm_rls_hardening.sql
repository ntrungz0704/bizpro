-- Rollback Migration: Phase 2F HRM Row-Level Security Hardening
-- Reverts policy definition to previous state if needed

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
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_policy ON %I;', tbl);
        EXECUTE format(
            'CREATE POLICY tenant_isolation_policy ON %I
             FOR ALL
             TO bizpro_app
             USING ((current_setting(''app.is_system_context''::text, true) = ''true''::text) OR (organization_id = (NULLIF(current_setting(''app.current_organization_id''::text, true), ''''::text))::uuid))
             WITH CHECK ((current_setting(''app.is_system_context''::text, true) = ''true''::text) OR (organization_id = (NULLIF(current_setting(''app.current_organization_id''::text, true), ''''::text))::uuid));',
            tbl
        );
    END LOOP;
END $$;
