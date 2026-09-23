ALTER TABLE public.ai_rate_limits DROP CONSTRAINT ai_rate_limits_task_check;
ALTER TABLE public.ai_rate_limits ADD CONSTRAINT ai_rate_limits_task_check
  CHECK (task = ANY (ARRAY['classify','extract','analyze','generate','defere_classify','defere_extract']::text[]));