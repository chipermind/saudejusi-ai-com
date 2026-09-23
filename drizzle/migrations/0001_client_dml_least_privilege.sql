REVOKE ALL PRIVILEGES ON TABLE public.cases, public.case_documents, public.case_deliverables, public.law_firms, public.lawyers, public.profiles, public.ai_calls_log, public.ai_artifacts, public.demo_requests, public.waitlist FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.cases TO authenticated;
GRANT SELECT, INSERT ON TABLE public.case_documents TO authenticated;
GRANT SELECT, INSERT ON TABLE public.case_deliverables TO authenticated;
GRANT SELECT ON TABLE public.law_firms, public.lawyers, public.profiles, public.ai_calls_log, public.ai_artifacts TO authenticated;
GRANT INSERT ON TABLE public.demo_requests, public.waitlist TO anon, authenticated;