-- Telemetria sem PII das execuções do motor de IA SaudeJusia.
-- LGPD art. 11: NUNCA gravar input nem output do usuário aqui.

create table if not exists public.ai_prompt_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  task text not null,
  prompt_version text not null,
  model text not null,
  confianca text null,
  fora_de_escopo boolean not null default false,
  validation_passed boolean not null default true,
  retry_count integer not null default 0,
  latency_ms integer null,
  tokens_in integer null,
  tokens_out integer null,
  cost_usd numeric(10,6) null,
  created_at timestamptz not null default now()
);

-- Validar enum de task via trigger (não CHECK, para permitir evolução sem migration)
create or replace function public.validate_ai_prompt_run()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.task not in ('classify','extract','analyze','generate') then
    raise exception 'invalid task: %', new.task;
  end if;
  if new.confianca is not null and new.confianca not in ('alta','media','baixa') then
    raise exception 'invalid confianca: %', new.confianca;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_ai_prompt_run on public.ai_prompt_runs;
create trigger trg_validate_ai_prompt_run
before insert or update on public.ai_prompt_runs
for each row execute function public.validate_ai_prompt_run();

create index if not exists idx_ai_prompt_runs_created_at
  on public.ai_prompt_runs (created_at desc);

create index if not exists idx_ai_prompt_runs_task_version
  on public.ai_prompt_runs (task, prompt_version);

-- RLS: bloqueia tudo para anon/authenticated. Apenas service_role escreve/lê.
alter table public.ai_prompt_runs enable row level security;

-- Sem policies para anon/authenticated => nega tudo por padrão.
-- service_role bypassa RLS automaticamente.

-- Hardening de grants (defesa em camadas)
revoke all on table public.ai_prompt_runs from anon;
revoke all on table public.ai_prompt_runs from authenticated;