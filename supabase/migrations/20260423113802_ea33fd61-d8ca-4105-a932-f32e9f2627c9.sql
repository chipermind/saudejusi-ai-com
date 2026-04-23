-- Hardening: remove privilégios default herdados do template do Supabase.
-- RLS já bloqueia leitura/escrita não autorizada, mas o princípio de menor
-- privilégio exige que anon/authenticated sequer tentem SELECT/UPDATE/DELETE.
-- Defesa em camadas: se uma policy RLS for mal configurada no futuro, a
-- ausência do grant é a segunda linha de defesa.

revoke select on public.waitlist from anon;
revoke update on public.waitlist from anon;
revoke delete on public.waitlist from anon;
revoke truncate on public.waitlist from anon;
revoke references on public.waitlist from anon;

revoke select on public.waitlist from authenticated;
revoke update on public.waitlist from authenticated;
revoke delete on public.waitlist from authenticated;
revoke truncate on public.waitlist from authenticated;
revoke references on public.waitlist from authenticated;

-- INSERT continua concedido (setup correto para o form da landing).
-- service_role mantém tudo (admin interno).