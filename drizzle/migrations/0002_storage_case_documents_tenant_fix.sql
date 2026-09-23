DROP POLICY IF EXISTS case_artifacts_deny_all ON storage.objects;
DROP POLICY IF EXISTS case_docs_select_own_firm ON storage.objects;
DROP POLICY IF EXISTS case_docs_insert_own_firm ON storage.objects;
DROP POLICY IF EXISTS case_docs_update_own_firm ON storage.objects;
DROP POLICY IF EXISTS case_docs_delete_own_firm ON storage.objects;

CREATE POLICY case_docs_select_own_firm ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'case-documents' AND public.current_law_firm_id() IS NOT NULL
       AND (storage.foldername(name))[1] = public.current_law_firm_id()::text);

CREATE POLICY case_docs_insert_own_firm ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'case-documents' AND public.current_law_firm_id() IS NOT NULL
       AND (storage.foldername(name))[1] = public.current_law_firm_id()::text);

REVOKE ALL PRIVILEGES ON storage.objects FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON storage.objects TO authenticated;