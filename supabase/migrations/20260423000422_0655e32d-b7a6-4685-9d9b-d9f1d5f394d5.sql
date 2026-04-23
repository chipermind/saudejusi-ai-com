create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  oab_number text not null,
  oab_state text not null,
  firm_size text not null,
  monthly_case_volume text,
  notes text,
  created_at timestamp with time zone not null default now()
);

alter table public.waitlist enable row level security;

create policy "anyone can submit waitlist"
on public.waitlist
for insert
to anon, authenticated
with check (
  length(email) between 5 and 200
  and email like '%_@_%.__%'
  and length(oab_number) between 1 and 30
  and oab_state in ('AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO')
  and firm_size in ('solo','2-3','4-10','11+')
  and (monthly_case_volume is null or length(monthly_case_volume) <= 50)
  and (notes is null or length(notes) <= 2000)
);

create index waitlist_created_at_idx on public.waitlist (created_at desc);