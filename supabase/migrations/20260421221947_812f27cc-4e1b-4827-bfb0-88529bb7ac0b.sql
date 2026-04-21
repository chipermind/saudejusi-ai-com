drop policy if exists "insert firm on signup" on public.law_firms;
create policy "authenticated can create firm" on public.law_firms for insert
  to authenticated
  with check (true);