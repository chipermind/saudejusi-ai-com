DROP POLICY IF EXISTS "update self lawyer" ON public.lawyers;
REVOKE UPDATE ON TABLE public.lawyers FROM PUBLIC, anon, authenticated;
COMMENT ON TABLE public.lawyers IS 'Client is read-only (SELECT by firm). role/law_firm_id changes only via SECURITY DEFINER RPC or service_role.';