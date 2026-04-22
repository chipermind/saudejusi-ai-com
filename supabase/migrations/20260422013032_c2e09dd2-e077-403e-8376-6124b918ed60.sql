-- Demo requests captured from the public landing page
CREATE TABLE IF NOT EXISTS public.demo_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  firm_name TEXT NOT NULL,
  team_size TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated visitors) can submit a demo request
DROP POLICY IF EXISTS "anyone can submit demo request" ON public.demo_requests;
CREATE POLICY "anyone can submit demo request"
ON public.demo_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- No client may read demo requests (only service role / backend access)
-- Intentionally no SELECT/UPDATE/DELETE policies.
