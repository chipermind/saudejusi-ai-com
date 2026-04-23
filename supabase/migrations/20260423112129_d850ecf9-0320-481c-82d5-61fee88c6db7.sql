-- Cleanup smoketest residue from previous run (privileged delete)
DELETE FROM public.waitlist WHERE email ILIKE 'smoketest_%@%';