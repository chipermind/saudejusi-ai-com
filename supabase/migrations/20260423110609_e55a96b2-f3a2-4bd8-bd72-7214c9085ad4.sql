-- Adapt waitlist table from B2B (lawyers) to B2C (health plan beneficiaries).
-- Old columns (oab_number, oab_state, firm_size, monthly_case_volume) are kept
-- as nullable for legacy preservation. New columns are also nullable to allow
-- legacy rows to coexist; the row-level CHECK ensures at least one shape is valid.

ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS nome_completo text,
  ADD COLUMN IF NOT EXISTS operadora text,
  ADD COLUMN IF NOT EXISTS plan_type text,
  ADD COLUMN IF NOT EXISTS situacao text;

-- Make legacy required-for-lawyer columns nullable so beneficiary rows can omit them.
ALTER TABLE public.waitlist ALTER COLUMN oab_number DROP NOT NULL;
ALTER TABLE public.waitlist ALTER COLUMN oab_state DROP NOT NULL;
ALTER TABLE public.waitlist ALTER COLUMN firm_size DROP NOT NULL;

-- Tag every existing row as belonging to the previous Defere phase so we can
-- segment legacy lawyer signups from new SaudeJusia beneficiary signups.
UPDATE public.waitlist
SET operadora = 'LEGADO_DEFERE'
WHERE operadora IS NULL;

-- Drop the old INSERT policy (which forced lawyer-shaped data) and replace it
-- with one that validates the new beneficiary shape while still allowing the
-- legacy fields to be present (anyone could still send them but they're ignored).
DROP POLICY IF EXISTS "anyone can submit waitlist" ON public.waitlist;

CREATE POLICY "anyone can submit waitlist"
ON public.waitlist
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- email
  length(email) >= 5
  AND length(email) <= 200
  AND email LIKE '%_@_%.__%'
  -- nome
  AND nome_completo IS NOT NULL
  AND length(nome_completo) >= 2
  AND length(nome_completo) <= 200
  -- operadora (texto livre, obrigatório)
  AND operadora IS NOT NULL
  AND length(operadora) >= 2
  AND length(operadora) <= 200
  -- plan_type (lista fechada)
  AND plan_type IN ('individual','familiar','empresarial','nao_tenho_plano')
  -- situacao (lista fechada)
  AND situacao IN (
    'caso_ativo',
    'ja_resolvi_quero_aprender',
    'nenhum_caso_mas_tenho_plano',
    'nao_tenho_plano'
  )
  -- notes opcionais
  AND (notes IS NULL OR length(notes) <= 2000)
);
