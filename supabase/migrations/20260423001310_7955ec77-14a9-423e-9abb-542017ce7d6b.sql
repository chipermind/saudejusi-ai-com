-- Anti-bot columns
alter table public.waitlist
  add column if not exists honeypot text,
  add column if not exists user_agent text;

-- Case-insensitive unique email (silent dedupe at the app layer)
create unique index if not exists waitlist_email_lower_unique
  on public.waitlist (lower(email));

-- Server-side honeypot enforcement: reject any insert that has honeypot content
create or replace function public.waitlist_reject_honeypot()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.honeypot is not null and length(trim(new.honeypot)) > 0 then
    raise exception 'rejected';
  end if;
  -- Defensive: never persist whatever value was sent
  new.honeypot := null;
  return new;
end;
$$;

drop trigger if exists waitlist_reject_honeypot_trigger on public.waitlist;
create trigger waitlist_reject_honeypot_trigger
  before insert on public.waitlist
  for each row
  execute function public.waitlist_reject_honeypot();