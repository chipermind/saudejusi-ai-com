
-- Add wizard/draft fields
alter table public.cases add column if not exists is_draft boolean default true;
alter table public.cases add column if not exists wizard_step integer default 1;
alter table public.cases add column if not exists plan_modality text;
alter table public.cases add column if not exists plan_contracted_at date;
alter table public.cases add column if not exists comarca text;
alter table public.cases add column if not exists tribunal text;
alter table public.cases add column if not exists ai_classification jsonb;
alter table public.cases add column if not exists jurimetrics jsonb;
alter table public.cases add column if not exists card_number text;
alter table public.cases add column if not exists denial_reason text;
alter table public.cases add column if not exists prescription_date date;
alter table public.cases add column if not exists urgency text;
alter table public.cases add column if not exists vara text;

-- plan modality validation via trigger (avoid restrictive CHECK with future enum changes)
create or replace function public.validate_case_plan_modality()
returns trigger language plpgsql as $$
begin
  if new.plan_modality is not null and new.plan_modality not in (
    'individual','coletivo_empresarial','coletivo_por_adesao','autogestao'
  ) then
    raise exception 'invalid plan_modality: %', new.plan_modality;
  end if;
  if new.urgency is not null and new.urgency not in ('eletivo','urgencia','emergencia') then
    raise exception 'invalid urgency: %', new.urgency;
  end if;
  return new;
end $$;

drop trigger if exists trg_validate_case on public.cases;
create trigger trg_validate_case before insert or update on public.cases
for each row execute function public.validate_case_plan_modality();

-- Deliverables status
alter table public.case_deliverables add column if not exists status text default 'pending';
alter table public.case_deliverables add column if not exists error_message text;

create or replace function public.validate_deliverable_status()
returns trigger language plpgsql as $$
begin
  if new.status is not null and new.status not in ('pending','generating','ready','failed') then
    raise exception 'invalid status: %', new.status;
  end if;
  return new;
end $$;

drop trigger if exists trg_validate_deliverable on public.case_deliverables;
create trigger trg_validate_deliverable before insert or update on public.case_deliverables
for each row execute function public.validate_deliverable_status();

-- AI calls log
create table if not exists public.ai_calls_log (
  id uuid primary key default gen_random_uuid(),
  law_firm_id uuid references public.law_firms(id) on delete cascade,
  case_id uuid references public.cases(id) on delete set null,
  call_type text not null,
  model text not null,
  input_tokens integer,
  output_tokens integer,
  cost_usd numeric(10,5),
  latency_ms integer,
  success boolean default true,
  error_message text,
  created_at timestamptz default now()
);

alter table public.ai_calls_log enable row level security;

drop policy if exists "ai_logs_view_firm" on public.ai_calls_log;
create policy "ai_logs_view_firm" on public.ai_calls_log
  for select using (law_firm_id = public.current_law_firm_id());

-- Realtime for deliverables
alter table public.case_deliverables replica identity full;
do $$ begin
  begin
    alter publication supabase_realtime add table public.case_deliverables;
  exception when duplicate_object then null;
  end;
end $$;

-- Storage bucket for case documents (private)
insert into storage.buckets (id, name, public)
values ('case-documents','case-documents', false)
on conflict (id) do nothing;

-- Storage policies: path is {law_firm_id}/{case_id}/{doc_type}/{filename}
drop policy if exists "case_docs_select_own_firm" on storage.objects;
create policy "case_docs_select_own_firm" on storage.objects
  for select using (
    bucket_id = 'case-documents'
    and (storage.foldername(name))[1] = public.current_law_firm_id()::text
  );

drop policy if exists "case_docs_insert_own_firm" on storage.objects;
create policy "case_docs_insert_own_firm" on storage.objects
  for insert with check (
    bucket_id = 'case-documents'
    and (storage.foldername(name))[1] = public.current_law_firm_id()::text
  );

drop policy if exists "case_docs_update_own_firm" on storage.objects;
create policy "case_docs_update_own_firm" on storage.objects
  for update using (
    bucket_id = 'case-documents'
    and (storage.foldername(name))[1] = public.current_law_firm_id()::text
  );

drop policy if exists "case_docs_delete_own_firm" on storage.objects;
create policy "case_docs_delete_own_firm" on storage.objects
  for delete using (
    bucket_id = 'case-documents'
    and (storage.foldername(name))[1] = public.current_law_firm_id()::text
  );
