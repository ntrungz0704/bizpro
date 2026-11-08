-- ============================================================================
-- ROLLBACK SCRIPT FOR PHASE 2E SECURITY DEFINER OWNER HARDENING
-- File: rollback_security_definer_owner.sql
-- ============================================================================

ALTER FUNCTION public.fn_auth_lookup_user(text) OWNER TO bizpro_user;
DROP POLICY IF EXISTS auth_lookup_policy ON public.users;
DROP POLICY IF EXISTS auth_lookup_org_policy ON public.organizations;
REVOKE USAGE ON SCHEMA public FROM bizpro_auth_lookup;
REVOKE SELECT ON public.users FROM bizpro_auth_lookup;
REVOKE SELECT ON public.organizations FROM bizpro_auth_lookup;
DROP ROLE IF EXISTS bizpro_auth_lookup;
