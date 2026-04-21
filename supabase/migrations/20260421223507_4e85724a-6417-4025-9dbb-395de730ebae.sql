
create or replace function public.validate_case_plan_modality()
returns trigger language plpgsql
set search_path = public
as $$
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

create or replace function public.validate_deliverable_status()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if new.status is not null and new.status not in ('pending','generating','ready','failed') then
    raise exception 'invalid status: %', new.status;
  end if;
  return new;
end $$;
