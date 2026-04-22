-- Enable RLS on realtime.messages for Realtime Authorization
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to subscribe to / receive messages only on channels
-- scoped to their own law firm. Topic format: "case_deliverables:firm:<law_firm_id>"
DROP POLICY IF EXISTS "firm scoped realtime read" ON realtime.messages;
CREATE POLICY "firm scoped realtime read"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'case_deliverables:firm:' || public.current_law_firm_id()::text
);

-- Disallow broadcasting from clients (only Postgres-driven changes are used)
DROP POLICY IF EXISTS "no client broadcast" ON realtime.messages;
CREATE POLICY "no client broadcast"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (false);