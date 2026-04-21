drop policy if exists "authenticated can create firm" on public.law_firms;

create or replace function public.signup_create_firm(
  _firm_name text,
  _full_name text,
  _oab_number text,
  _oab_state text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _firm_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.lawyers where id = auth.uid()) then
    raise exception 'Lawyer profile already exists';
  end if;

  insert into public.law_firms(name) values (_firm_name) returning id into _firm_id;

  insert into public.lawyers(id, law_firm_id, full_name, oab_number, oab_state, role)
  values (auth.uid(), _firm_id, _full_name, _oab_number, _oab_state, 'owner');

  return _firm_id;
end;
$$;

revoke all on function public.signup_create_firm(text,text,text,text) from public;
grant execute on function public.signup_create_firm(text,text,text,text) to authenticated;