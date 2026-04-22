-- Replace the always-true insert policy with one that enforces basic input
-- shape, so anonymous abuse is bounded without blocking legitimate submissions.
DROP POLICY IF EXISTS "anyone can submit demo request" ON public.demo_requests;

CREATE POLICY "anyone can submit demo request"
ON public.demo_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(full_name) BETWEEN 2 AND 120
  AND length(email) BETWEEN 5 AND 200
  AND email LIKE '%_@_%.__%'
  AND length(whatsapp) BETWEEN 8 AND 30
  AND length(firm_name) BETWEEN 2 AND 200
  AND team_size IN ('1', '2-5', '6-15', '16+')
  AND (message IS NULL OR length(message) <= 2000)
);
