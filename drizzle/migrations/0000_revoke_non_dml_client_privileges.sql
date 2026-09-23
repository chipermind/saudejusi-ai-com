DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
           WHERE n.nspname='public' AND c.relkind IN ('r','p')
  LOOP
    EXECUTE format('REVOKE TRUNCATE, TRIGGER, REFERENCES, MAINTAIN ON TABLE public.%I FROM PUBLIC, anon, authenticated', r.relname);
  END LOOP;
END $$;