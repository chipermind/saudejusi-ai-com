-- 1) Fix PRIVILEGE_ESCALATION: remove permissive self-insert on lawyers.
-- The signup_create_firm() SECURITY DEFINER function is the only sanctioned
-- way to create a lawyers row. Direct client inserts via the anon/authenticated
-- API let users attach themselves to any existing law_firm_id, which grants
-- access to that firm's cases, documents, deliverables, AI logs, and storage
-- via current_law_firm_id(). Drop the policy so direct inserts are denied.
DROP POLICY IF EXISTS "insert self lawyer" ON public.lawyers;

-- Defense in depth: enforce one lawyer row per auth user so even a future
-- policy regression cannot create duplicate memberships for the same user.
CREATE UNIQUE INDEX IF NOT EXISTS lawyers_id_unique ON public.lawyers (id);

-- 2) Fix EXPOSED_SENSITIVE_DATA: explicitly deny SELECT on waitlist.
-- RLS already blocks unlisted operations by default, but an explicit
-- USING (false) policy makes the intent unambiguous and prevents accidental
-- exposure if a future policy is added without proper scoping.
DROP POLICY IF EXISTS "no read on waitlist" ON public.waitlist;
CREATE POLICY "no read on waitlist"
  ON public.waitlist
  FOR SELECT
  TO anon, authenticated
  USING (false);
