-- ─────────────────────────────────────────────────────────────────────────
-- SaudeJusia — Fatia 1 backend
-- Cria: profiles, ai_rate_limits, ai_artifacts, bucket case-artifacts,
-- colunas extras em ai_prompt_runs, RPC increment_rate_limit, trigger handle_new_user
-- ─────────────────────────────────────────────────────────────────────────

-- 1.1 profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text not null,
  operadora text,
  plan_tier text not null default 'livre' check (plan_tier in ('livre','essencial','familia')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome_completo)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome_completo', 'Usuário'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

grant select, update on public.profiles to authenticated;
revoke all on public.profiles from anon;

-- updated_at trigger reusable
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

-- 1.2 ai_rate_limits
create table if not exists public.ai_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  task text not null check (task in ('classify','extract','analyze','generate')),
  day date not null default current_date,
  count int not null default 0,
  primary key (user_id, task, day)
);

alter table public.ai_rate_limits enable row level security;
revoke all on public.ai_rate_limits from anon, authenticated;

-- RPC atômico para increment + check
create or replace function public.increment_rate_limit(
  p_user_id uuid,
  p_task text,
  p_day date,
  p_limit int
) returns table(allowed boolean, new_count int)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count int;
begin
  insert into public.ai_rate_limits (user_id, task, day, count)
  values (p_user_id, p_task, p_day, 1)
  on conflict (user_id, task, day)
  do update set count = ai_rate_limits.count + 1
  returning count into current_count;

  return query select (current_count <= p_limit)::boolean, current_count;
end;
$$;

revoke all on function public.increment_rate_limit(uuid, text, date, int) from public, anon, authenticated;
grant execute on function public.increment_rate_limit(uuid, text, date, int) to service_role;

-- 1.3 ai_artifacts
create table if not exists public.ai_artifacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task text not null check (task in ('classify','extract','analyze','generate')),
  prompt_version text not null,
  storage_path text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  deleted_at timestamptz
);

create index if not exists idx_ai_artifacts_user_created on public.ai_artifacts (user_id, created_at desc);
create index if not exists idx_ai_artifacts_expires_active on public.ai_artifacts (expires_at) where deleted_at is null;

alter table public.ai_artifacts enable row level security;

drop policy if exists "users read own artifacts metadata" on public.ai_artifacts;
create policy "users read own artifacts metadata" on public.ai_artifacts
  for select to authenticated
  using (auth.uid() = user_id and deleted_at is null);

revoke insert, update, delete on public.ai_artifacts from anon, authenticated;
grant select on public.ai_artifacts to authenticated;

-- 1.4 Storage bucket case-artifacts (privado, deny-all)
insert into storage.buckets (id, name, public)
values ('case-artifacts', 'case-artifacts', false)
on conflict (id) do nothing;

drop policy if exists "case_artifacts_deny_all" on storage.objects;
create policy "case_artifacts_deny_all" on storage.objects
  for all to anon, authenticated
  using (bucket_id <> 'case-artifacts')
  with check (bucket_id <> 'case-artifacts');

-- 1.5 ai_prompt_runs colunas extras
alter table public.ai_prompt_runs
  add column if not exists injection_attempted boolean not null default false,
  add column if not exists retries_used int not null default 0;
-- validation_passed já existe na tabela atual