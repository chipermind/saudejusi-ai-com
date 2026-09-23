CREATE OR REPLACE FUNCTION public.guard_case_document_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
declare
  v_firm uuid;
  v_case_firm uuid;
  v_path text;
  v_prefix text;
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  v_firm := public.current_law_firm_id();
  if v_firm is null then
    raise exception 'forbidden';
  end if;

  if new.case_id is null then
    raise exception 'Documento inválido';
  end if;

  select law_firm_id into v_case_firm from public.cases where id = new.case_id;
  if v_case_firm is null or v_case_firm <> v_firm then
    raise exception 'Documento inválido';
  end if;

  v_path := btrim(coalesce(new.file_path, ''));
  v_prefix := v_firm::text || '/' || new.case_id::text || '/';
  if length(v_path) = 0
     or length(v_path) > 1000
     or left(v_path, length(v_prefix)) <> v_prefix
     or length(v_path) <= length(v_prefix) then
    raise exception 'Caminho de documento inválido';
  end if;
  new.file_path := v_path;

  new.extracted_data := null;
  new.ocr_extracted_at := null;
  new.extraction_error := null;
  new.uploaded_at := now();
  return new;
end;
$$;

REVOKE ALL ON FUNCTION public.guard_case_document_insert() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_guard_case_document_insert ON public.case_documents;
CREATE TRIGGER trg_guard_case_document_insert
BEFORE INSERT ON public.case_documents
FOR EACH ROW EXECUTE FUNCTION public.guard_case_document_insert();