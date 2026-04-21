-- Tenants
create table public.law_firms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text,
  plan text default 'trial' check (plan in ('trial','solo','escritorio','enterprise')),
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz default now()
);

create table public.lawyers (
  id uuid primary key references auth.users(id) on delete cascade,
  law_firm_id uuid references public.law_firms(id) on delete cascade,
  full_name text not null,
  oab_number text,
  oab_state text,
  role text default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz default now()
);

create table public.cases (
  id uuid primary key default gen_random_uuid(),
  law_firm_id uuid references public.law_firms(id) on delete cascade,
  created_by uuid references public.lawyers(id),
  client_name text not null,
  client_cpf text,
  operadora text,
  procedure_requested text,
  cid text,
  denial_category text check (denial_category in (
    'fora_do_rol','opme','home_care','medicamento_off_label',
    'medicamento_importado','bariatrica','oncologico','aba_autismo',
    'transplante','urgencia_emergencia','carencia','preexistente',
    'rescisao_unilateral','reajuste_abusivo','reembolso','outros'
  )),
  denial_date date,
  status text default 'analise' check (status in (
    'analise','parecer_gerado','acao_proposta','em_andamento','ganho','perdido','acordo'
  )),
  success_probability numeric(3,2),
  estimated_damages numeric(12,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id) on delete cascade,
  doc_type text check (doc_type in (
    'carta_negativa','laudo_medico','contrato_plano','carteirinha',
    'protocolo','prescricao','outro'
  )),
  file_path text not null,
  file_name text,
  file_size integer,
  ocr_extracted_at timestamptz,
  extracted_data jsonb,
  uploaded_at timestamptz default now()
);

create table public.case_deliverables (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id) on delete cascade,
  deliverable_type text check (deliverable_type in (
    'parecer','recurso_ans','notificacao_extrajudicial','peticao_inicial'
  )),
  content text,
  generated_at timestamptz default now(),
  generated_by_model text,
  reviewed_by uuid references public.lawyers(id),
  reviewed_at timestamptz
);

-- Security definer to read current user's law_firm_id without recursion
create or replace function public.current_law_firm_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select law_firm_id from public.lawyers where id = auth.uid()
$$;

-- Enable RLS
alter table public.law_firms enable row level security;
alter table public.lawyers enable row level security;
alter table public.cases enable row level security;
alter table public.case_documents enable row level security;
alter table public.case_deliverables enable row level security;

-- law_firms: members can view their own firm; owner can update
create policy "view own firm" on public.law_firms for select
  using (id = public.current_law_firm_id());
create policy "insert firm on signup" on public.law_firms for insert
  with check (true);

-- lawyers: a user can see lawyers in their firm; insert self
create policy "view firm lawyers" on public.lawyers for select
  using (law_firm_id = public.current_law_firm_id());
create policy "insert self lawyer" on public.lawyers for insert
  with check (id = auth.uid());
create policy "update self lawyer" on public.lawyers for update
  using (id = auth.uid());

-- cases
create policy "firm cases all" on public.cases for all
  using (law_firm_id = public.current_law_firm_id())
  with check (law_firm_id = public.current_law_firm_id());

-- case_documents
create policy "firm case docs all" on public.case_documents for all
  using (case_id in (select id from public.cases where law_firm_id = public.current_law_firm_id()))
  with check (case_id in (select id from public.cases where law_firm_id = public.current_law_firm_id()));

-- case_deliverables
create policy "firm case deliverables all" on public.case_deliverables for all
  using (case_id in (select id from public.cases where law_firm_id = public.current_law_firm_id()))
  with check (case_id in (select id from public.cases where law_firm_id = public.current_law_firm_id()));