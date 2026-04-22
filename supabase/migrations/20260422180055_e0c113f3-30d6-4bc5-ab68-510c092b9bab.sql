alter table public.case_documents
  add column if not exists extraction_error text;