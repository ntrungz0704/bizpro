-- ============================================================================
-- PHASE 2E: FINAL SECURITY HARDENING - SECURITY DEFINER OWNER
-- File: harden_security_definer_owner.sql
-- ============================================================================

-- 1. Create dedicated non-login role with least privilege
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'bizpro_auth_lookup') THEN
    CREATE ROLE bizpro_auth_lookup WITH
      NOLOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOBYPASSRLS;
  ELSE
    ALTER ROLE bizpro_auth_lookup WITH
      NOLOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOBYPASSRLS;
  END IF;
END $$;

-- 2. Grant minimal schema & table privileges to bizpro_auth_lookup
GRANT USAGE ON SCHEMA public TO bizpro_auth_lookup;
GRANT SELECT ON public.users TO bizpro_auth_lookup;
GRANT SELECT ON public.organizations TO bizpro_auth_lookup;

-- 3. Create dedicated RLS policy on users and organizations for bizpro_auth_lookup
DROP POLICY IF EXISTS auth_lookup_policy ON public.users;
CREATE POLICY auth_lookup_policy ON public.users
  FOR SELECT
  TO bizpro_auth_lookup
  USING (true);

DROP POLICY IF EXISTS auth_lookup_org_policy ON public.organizations;
CREATE POLICY auth_lookup_org_policy ON public.organizations
  FOR SELECT
  TO bizpro_auth_lookup
  USING (true);

-- 4. Transfer ownership of fn_auth_lookup_user to bizpro_auth_lookup
ALTER FUNCTION public.fn_auth_lookup_user(text) OWNER TO bizpro_auth_lookup;

-- 5. Explicitly grant EXECUTE only to bizpro_app and revoke from PUBLIC
REVOKE EXECUTE ON FUNCTION public.fn_auth_lookup_user(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_auth_lookup_user(text) TO bizpro_app;

-- 6. Ensure bizpro_app and bizpro_auth_lookup cannot CREATE objects in schema public
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM bizpro_app;
REVOKE CREATE ON SCHEMA public FROM bizpro_auth_lookup;
