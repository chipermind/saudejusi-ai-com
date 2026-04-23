-- Hotfix: grant INSERT na waitlist para anon e authenticated.
-- Sem esse grant, o PostgREST retorna 401 antes da RLS ser avaliada,
-- fazendo com que o form de /waitlist falhe silenciosamente em produção.

grant insert on table public.waitlist to anon;
grant insert on table public.waitlist to authenticated;

-- Opcional mas recomendado: se houver sequence de id, garantir usage.
do $$
declare seq_name text;
begin
  select pg_get_serial_sequence('public.waitlist', 'id') into seq_name;
  if seq_name is not null then
    execute format('grant usage on sequence %s to anon, authenticated', seq_name);
  end if;
end $$;