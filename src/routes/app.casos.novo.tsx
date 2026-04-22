import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  Loader2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { authedJson } from "@/lib/server-fetch";

const searchSchema = z.object({ draft: z.string().optional() });

export const Route = createFileRoute("/app/casos/novo")({
  validateSearch: searchSchema,
  component: WizardPage,
});

const OPERADORAS = [
  "Amil","Bradesco Saúde","SulAmérica","NotreDame Intermédica","Hapvida",
  "Unimed Nacional","Unimed Recife","Unimed São Paulo","Unimed Rio",
  "Porto Seguro Saúde","Golden Cross","Allianz Saúde","Care Plus","Omint",
  "Prevent Senior","MedSênior","Cassi","GEAP","São Cristóvão","Assim Saúde",
];
const MODALIDADES = [
  { v: "individual", l: "Individual / familiar" },
  { v: "coletivo_empresarial", l: "Coletivo empresarial" },
  { v: "coletivo_por_adesao", l: "Coletivo por adesão" },
  { v: "autogestao", l: "Autogestão" },
];
const TRIBUNAIS = [
  "TJAC","TJAL","TJAP","TJAM","TJBA","TJCE","TJDFT","TJES","TJGO","TJMA",
  "TJMT","TJMS","TJMG","TJPA","TJPB","TJPR","TJPE","TJPI","TJRJ","TJRN",
  "TJRS","TJRO","TJRR","TJSC","TJSP","TJSE","TJTO","TRF1","TRF2","TRF3",
  "TRF4","TRF5","TRF6","STJ",
];
const CATEGORIES: { v: string; l: string }[] = [
  { v: "fora_do_rol", l: "Fora do rol da ANS" },
  { v: "opme", l: "OPME (órtese/prótese)" },
  { v: "home_care", l: "Home care" },
  { v: "medicamento_off_label", l: "Medicamento off-label" },
  { v: "medicamento_importado", l: "Medicamento importado" },
  { v: "bariatrica", l: "Bariátrica" },
  { v: "oncologico", l: "Oncológico" },
  { v: "aba_autismo", l: "ABA / autismo" },
  { v: "transplante", l: "Transplante" },
  { v: "urgencia_emergencia", l: "Urgência / emergência" },
  { v: "carencia", l: "Carência" },
  { v: "preexistente", l: "Preexistente" },
  { v: "rescisao_unilateral", l: "Rescisão unilateral" },
  { v: "reajuste_abusivo", l: "Reajuste abusivo" },
  { v: "reembolso", l: "Reembolso" },
  { v: "outros", l: "Outros" },
];
const DOC_TYPES: { v: string; l: string; required?: boolean }[] = [
  { v: "carta_negativa", l: "Carta de negativa", required: true },
  { v: "laudo_medico", l: "Laudo / prescrição médica", required: true },
  { v: "contrato_plano", l: "Contrato do plano" },
  { v: "carteirinha", l: "Carteirinha" },
  { v: "protocolo", l: "Protocolo / auditoria" },
  { v: "outro", l: "Outros documentos" },
];

interface CaseDraft {
  id?: string;
  client_name?: string;
  client_cpf?: string;
  operadora?: string;
  plan_modality?: string;
  plan_contracted_at?: string;
  card_number?: string;
  cid?: string;
  procedure_requested?: string;
  prescription_date?: string;
  denial_date?: string;
  denial_reason?: string;
  urgency?: string;
  comarca?: string;
  tribunal?: string;
  vara?: string;
  denial_category?: string;
  ai_classification?: Record<string, unknown> | null;
  jurimetrics?: Record<string, unknown> | null;
}
interface DocRow {
  id: string;
  doc_type: string;
  file_name: string | null;
  ocr_extracted_at: string | null;
  extracted_data: Record<string, unknown> | null;
  extraction_error: string | null;
}

function WizardPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<CaseDraft>({});
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [extracting, setExtracting] = useState<Set<string>>(new Set());
  const [manualSkip, setManualSkip] = useState<Set<string>>(new Set());
  const [classifying, setClassifying] = useState(false);
  const [jurimetricsLoading, setJurimetricsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [chosen, setChosen] = useState({
    parecer: true, recurso_ans: true, notificacao_extrajudicial: true, peticao_inicial: true,
  });

  // Load draft if requested
  useEffect(() => {
    (async () => {
      if (!search.draft) return;
      const { data } = await supabase.from("cases").select("*").eq("id", search.draft).single();
      if (data) {
        setDraft(data as CaseDraft);
        setStep(Math.min(4, Math.max(1, (data as { wizard_step?: number }).wizard_step ?? 1)));
        const { data: d } = await supabase
          .from("case_documents")
          .select("id, doc_type, file_name, ocr_extracted_at, extracted_data, extraction_error")
          .eq("case_id", search.draft);
        setDocs((d ?? []) as DocRow[]);
      }
    })();
  }, [search.draft]);

  const persist = useCallback(
    async (patch: Partial<CaseDraft>, nextStep?: number): Promise<string | undefined> => {
      const merged = { ...draft, ...patch };
      const wizard_step = nextStep ?? step;
      if (!merged.id) {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) return;
        const { data: lawyer } = await supabase
          .from("lawyers").select("law_firm_id").eq("id", u.user.id).single();
        const { data, error } = await supabase
          .from("cases")
          .insert({
            client_name: merged.client_name ?? "Sem nome",
            client_cpf: merged.client_cpf ?? null,
            operadora: merged.operadora ?? null,
            plan_modality: merged.plan_modality ?? null,
            plan_contracted_at: merged.plan_contracted_at ?? null,
            card_number: merged.card_number ?? null,
            is_draft: true,
            wizard_step,
            law_firm_id: lawyer?.law_firm_id ?? null,
            created_by: u.user.id,
          })
          .select("id").single();
        if (error || !data) return;
        setDraft({ ...merged, id: data.id });
        return data.id;
      } else {
        await supabase
          .from("cases")
          .update({
            client_name: merged.client_name,
            client_cpf: merged.client_cpf ?? null,
            operadora: merged.operadora ?? null,
            plan_modality: merged.plan_modality ?? null,
            plan_contracted_at: merged.plan_contracted_at ?? null,
            card_number: merged.card_number ?? null,
            cid: merged.cid ?? null,
            procedure_requested: merged.procedure_requested ?? null,
            prescription_date: merged.prescription_date ?? null,
            denial_date: merged.denial_date ?? null,
            denial_reason: merged.denial_reason ?? null,
            urgency: merged.urgency ?? null,
            comarca: merged.comarca ?? null,
            tribunal: merged.tribunal ?? null,
            vara: merged.vara ?? null,
            denial_category: merged.denial_category ?? null,
            wizard_step,
          })
          .eq("id", merged.id);
        setDraft(merged);
        return merged.id;
      }
    },
    [draft, step],
  );

  const canStep1 = !!(draft.client_name && draft.operadora && draft.plan_modality);
  const docResolved = (docType: string) =>
    docs.some(
      (d) =>
        d.doc_type === docType && (d.ocr_extracted_at != null || manualSkip.has(d.id)),
    );
  const hasNegativa = docResolved("carta_negativa");
  const hasLaudo = docResolved("laudo_medico");
  const canStep2 = hasNegativa && hasLaudo;
  const canStep3 = !!(draft.cid && draft.procedure_requested && draft.denial_date && draft.comarca && draft.tribunal && draft.denial_category);

  // Auto-classify when entering step 3
  useEffect(() => {
    if (step !== 3 || !draft.id || draft.ai_classification) return;
    (async () => {
      setClassifying(true);
      try {
        const res = await authedJson<{ classification: Record<string, unknown> }>(
          "/api/ia/classify-denial", { case_id: draft.id });
        setDraft((d) => ({
          ...d,
          ai_classification: res.classification,
          denial_category: (res.classification?.categoria as string) ?? d.denial_category,
        }));
      } catch (e) { console.error(e); }
      finally { setClassifying(false); }
    })();
  }, [step, draft.id, draft.ai_classification]);

  // Auto-jurimetrics on step 4
  useEffect(() => {
    if (step !== 4 || !draft.id) return;
    (async () => {
      setJurimetricsLoading(true);
      try {
        await persist({}, 4);
        const res = await authedJson<{ jurimetrics: Record<string, unknown> }>(
          "/api/ia/estimate-jurimetrics", { case_id: draft.id });
        setDraft((d) => ({ ...d, jurimetrics: res.jurimetrics }));
      } catch (e) { console.error(e); }
      finally { setJurimetricsLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  async function uploadFile(file: File, docType: string) {
    let caseId = draft.id;
    if (!caseId) caseId = await persist({}, 2);
    if (!caseId) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data: lawyer } = await supabase
      .from("lawyers").select("law_firm_id").eq("id", u.user.id).single();
    const firmId = lawyer?.law_firm_id;
    if (!firmId) return;

    const safeName = file.name.replace(/[^\w.-]/g, "_");
    const path = `${firmId}/${caseId}/${docType}/${Date.now()}_${safeName}`;
    const { error: upErr } = await supabase.storage
      .from("case-documents").upload(path, file, { upsert: false });
    if (upErr) { console.error(upErr); return; }

    const { data: doc, error: insErr } = await supabase
      .from("case_documents")
      .insert({ case_id: caseId, doc_type: docType, file_path: path, file_name: file.name, file_size: file.size })
      .select("id, doc_type, file_name, ocr_extracted_at, extracted_data").single();
    if (insErr || !doc) return;
    setDocs((prev) => [...prev, doc as DocRow]);
    setExtracting((s) => new Set(s).add(doc.id));

    try {
      await authedJson("/api/ia/extract-document", { case_document_id: doc.id });
      const { data: refreshed } = await supabase
        .from("case_documents")
        .select("id, doc_type, file_name, ocr_extracted_at, extracted_data")
        .eq("id", doc.id).single();
      if (refreshed) {
        setDocs((prev) => prev.map((d) => (d.id === doc.id ? (refreshed as DocRow) : d)));
        // Pre-fill draft fields from extraction
        const ed = (refreshed as DocRow).extracted_data ?? {};
        if (docType === "carta_negativa") {
          setDraft((d) => ({
            ...d,
            denial_date: d.denial_date ?? (ed.data_negativa as string) ?? undefined,
            denial_reason: d.denial_reason ?? (ed.fundamento_negativa as string) ?? undefined,
            procedure_requested: d.procedure_requested ?? (ed.procedimento_solicitado as string) ?? undefined,
            cid: d.cid ?? (ed.cid_informado as string) ?? undefined,
          }));
        }
        if (docType === "laudo_medico") {
          setDraft((d) => ({
            ...d,
            cid: d.cid ?? (ed.cid as string) ?? undefined,
            procedure_requested: d.procedure_requested ?? (ed.procedimento_indicado as string) ?? undefined,
            prescription_date: d.prescription_date ?? (ed.data_emissao as string) ?? undefined,
            urgency: d.urgency ?? ((ed.urgencia_declarada as boolean) ? "urgencia" : undefined),
          }));
        }
      }
    } catch (e) { console.error(e); }
    finally { setExtracting((s) => { const n = new Set(s); n.delete(doc.id); return n; }); }
  }

  async function finalizeAndGenerate() {
    if (!draft.id) return;
    setSubmitting(true);
    try {
      await supabase
        .from("cases")
        .update({ is_draft: false, status: "parecer_gerado" })
        .eq("id", draft.id);

      const types = (Object.keys(chosen) as (keyof typeof chosen)[])
        .filter((k) => chosen[k]);
      const { data: created } = await supabase
        .from("case_deliverables")
        .insert(types.map((t) => ({ case_id: draft.id!, deliverable_type: t, status: "pending" })))
        .select("id");
      // Fire and forget
      (created ?? []).forEach((d) => {
        authedJson("/api/ia/generate-deliverable", { deliverable_id: d.id }).catch(console.error);
      });
      navigate({ to: "/app/casos/$id", params: { id: draft.id } });
    } finally { setSubmitting(false); }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 pb-32">
      <Stepper step={step} />

      {step === 1 && <Step1 draft={draft} setDraft={setDraft} />}
      {step === 2 && (
        <Step2
          docs={docs}
          extracting={extracting}
          onUpload={uploadFile}
        />
      )}
      {step === 3 && (
        <Step3
          draft={draft}
          setDraft={setDraft}
          classifying={classifying}
        />
      )}
      {step === 4 && (
        <Step4
          draft={draft}
          loading={jurimetricsLoading}
          chosen={chosen}
          setChosen={setChosen}
        />
      )}

      {/* Footer */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Button
            variant="ghost"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
          </Button>
          {step < 4 ? (
            <Button
              disabled={(step === 1 && !canStep1) || (step === 2 && !canStep2) || (step === 3 && !canStep3)}
              onClick={async () => {
                await persist({}, step + 1);
                setStep((s) => s + 1);
              }}
            >
              Continuar <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finalizeAndGenerate} disabled={submitting} size="lg">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Gerar kit completo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  const labels = ["Cliente", "Documentos", "Revisão", "Análise"];
  return (
    <div className="mb-8 flex items-center gap-2">
      {labels.map((l, i) => {
        const n = i + 1;
        const done = n < step, active = n === step;
        return (
          <div key={l} className="flex flex-1 items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
              done ? "border-success bg-success/15 text-success"
              : active ? "border-primary bg-primary/15 text-primary"
              : "border-border text-text-tertiary"
            }`}>
              {done ? <Check className="h-3.5 w-3.5" /> : n}
            </div>
            <span className={`text-sm ${active ? "text-text-primary font-medium" : "text-text-tertiary"}`}>{l}</span>
            {i < labels.length - 1 && <div className={`h-px flex-1 ${done ? "bg-success/40" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Step1({ draft, setDraft }: { draft: CaseDraft; setDraft: (u: (d: CaseDraft) => CaseDraft) => void }) {
  return (
    <Card title="Dados do cliente e do plano">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Nome completo do cliente *">
          <Input value={draft.client_name ?? ""} onChange={(e) => setDraft((d) => ({ ...d, client_name: e.target.value }))} />
        </Field>
        <Field label="CPF">
          <Input value={draft.client_cpf ?? ""} placeholder="000.000.000-00"
            onChange={(e) => setDraft((d) => ({ ...d, client_cpf: e.target.value }))} />
        </Field>
        <Field label="Operadora *">
          <Select value={draft.operadora} onValueChange={(v) => setDraft((d) => ({ ...d, operadora: v }))}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {OPERADORAS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Modalidade do plano *">
          <Select value={draft.plan_modality} onValueChange={(v) => setDraft((d) => ({ ...d, plan_modality: v }))}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {MODALIDADES.map((m) => <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Data de contratação do plano">
          <Input type="date" value={draft.plan_contracted_at ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, plan_contracted_at: e.target.value }))} />
        </Field>
        <Field label="Número da carteirinha">
          <Input value={draft.card_number ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, card_number: e.target.value }))} />
        </Field>
      </div>
      <p className="mt-6 text-xs text-text-secondary">
        Quanto mais completas as informações, mais precisa será a jurimetria.
      </p>
    </Card>
  );
}

function Step2({
  docs, extracting, onUpload,
}: { docs: DocRow[]; extracting: Set<string>; onUpload: (f: File, t: string) => void }) {
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  return (
    <Card title="Documentos do caso" subtitle="Anexe todos os documentos disponíveis. A IA extrai os dados automaticamente.">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {DOC_TYPES.map((t) => {
          const items = docs.filter((d) => d.doc_type === t.v);
          const anyExtracting = items.some((i) => extracting.has(i.id));
          const anyExtracted = items.some((i) => i.ocr_extracted_at);
          return (
            <div key={t.v} className="rounded-lg border border-border bg-surface-elevated p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t.l}{t.required && " *"}</span>
                {items.length === 0 && t.required && (
                  <span className="rounded bg-danger/15 px-1.5 py-0.5 text-[10px] font-medium text-danger">vazio</span>
                )}
                {anyExtracting && <Loader2 className="h-3.5 w-3.5 animate-spin text-info" />}
                {anyExtracted && !anyExtracting && (
                  <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-medium text-success">extraído</span>
                )}
              </div>
              <ul className="mt-2 space-y-1 text-xs text-text-tertiary">
                {items.map((i) => (
                  <li key={i.id} className="truncate">{i.file_name}</li>
                ))}
              </ul>
              <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border py-2 text-xs text-text-secondary hover:border-primary hover:text-primary">
                <Upload className="h-3.5 w-3.5" /> Anexar
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, t.v); e.target.value = ""; }} />
              </label>
            </div>
          );
        })}
      </div>

      <div
        className="mt-6 flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border bg-background p-8"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setPendingFile(f); }}
      >
        <FileText className="h-6 w-6 text-text-tertiary" />
        <p className="text-sm text-text-secondary">Arraste qualquer arquivo aqui (PDF, JPG, PNG)</p>
      </div>

      {pendingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface-elevated p-6">
            <h3 className="text-sm font-semibold">A que tipo de documento isto se refere?</h3>
            <p className="mt-1 truncate text-xs text-text-tertiary">{pendingFile.name}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {DOC_TYPES.map((t) => (
                <Button key={t.v} variant="outline" size="sm"
                  onClick={() => { onUpload(pendingFile, t.v); setPendingFile(null); }}>
                  {t.l}
                </Button>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => setPendingFile(null)}>Cancelar</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Step3({
  draft, setDraft, classifying,
}: { draft: CaseDraft; setDraft: (u: (d: CaseDraft) => CaseDraft) => void; classifying: boolean }) {
  const cls = draft.ai_classification as
    | { categoria?: string; subcategoria?: string; confianca?: string; justificativa_classificacao?: string }
    | null
    | undefined;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card title="Dados clínicos e da negativa">
          <div className="space-y-4">
            <Field label="CID *"><Input value={draft.cid ?? ""} onChange={(e) => setDraft((d) => ({ ...d, cid: e.target.value }))} /></Field>
            <Field label="Procedimento solicitado *"><Input value={draft.procedure_requested ?? ""} onChange={(e) => setDraft((d) => ({ ...d, procedure_requested: e.target.value }))} /></Field>
            <Field label="Data da prescrição"><Input type="date" value={draft.prescription_date ?? ""} onChange={(e) => setDraft((d) => ({ ...d, prescription_date: e.target.value }))} /></Field>
            <Field label="Data da negativa *"><Input type="date" value={draft.denial_date ?? ""} onChange={(e) => setDraft((d) => ({ ...d, denial_date: e.target.value }))} /></Field>
            <Field label="Fundamento da operadora"><Textarea rows={3} value={draft.denial_reason ?? ""} onChange={(e) => setDraft((d) => ({ ...d, denial_reason: e.target.value }))} /></Field>
            <Field label="Caráter">
              <Select value={draft.urgency} onValueChange={(v) => setDraft((d) => ({ ...d, urgency: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="eletivo">Eletivo</SelectItem>
                  <SelectItem value="urgencia">Urgência</SelectItem>
                  <SelectItem value="emergencia">Emergência</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Card>

        <Card title="Jurisdição">
          <div className="space-y-4">
            <Field label="Comarca *"><Input value={draft.comarca ?? ""} onChange={(e) => setDraft((d) => ({ ...d, comarca: e.target.value }))} /></Field>
            <Field label="Tribunal *">
              <Select value={draft.tribunal} onValueChange={(v) => setDraft((d) => ({ ...d, tribunal: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {TRIBUNAIS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Vara / juízo preferencial"><Input value={draft.vara ?? ""} onChange={(e) => setDraft((d) => ({ ...d, vara: e.target.value }))} /></Field>
          </div>
        </Card>
      </div>

      <div className="rounded-xl border border-info/40 bg-info/5 p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-info" />
          <h3 className="text-sm font-semibold">Sugestão de classificação pela IA</h3>
        </div>
        {classifying ? (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ) : cls ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="rounded bg-info/20 px-2 py-1 text-xs font-medium text-info">
                {CATEGORIES.find((c) => c.v === cls.categoria)?.l ?? cls.categoria}
              </span>
              <span className="text-xs uppercase tracking-wider text-text-tertiary">
                Confiança: {cls.confianca ?? "—"}
              </span>
            </div>
            {cls.subcategoria && <p className="text-sm text-text-primary">{cls.subcategoria}</p>}
            {cls.justificativa_classificacao && (
              <p className="text-sm text-text-secondary">{cls.justificativa_classificacao}</p>
            )}
            <div>
              <Label className="text-xs uppercase tracking-wider text-text-tertiary">Categoria final</Label>
              <Select
                value={draft.denial_category}
                onValueChange={(v) => setDraft((d) => ({ ...d, denial_category: v }))}
              >
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-text-tertiary">Aguardando análise…</p>
        )}
      </div>
    </div>
  );
}

function Step4({
  draft, loading, chosen, setChosen,
}: {
  draft: CaseDraft; loading: boolean;
  chosen: { parecer: boolean; recurso_ans: boolean; notificacao_extrajudicial: boolean; peticao_inicial: boolean };
  setChosen: (u: typeof chosen) => void;
}) {
  const j = draft.jurimetrics as {
    probabilidade_exito?: number;
    tempo_medio_meses?: number;
    dano_moral?: { min: number; mediana: number; max: number };
    n_casos_base?: number;
    alertas?: string[];
  } | null | undefined;

  const prob = j?.probabilidade_exito ?? 0;
  const probColor = prob > 0.7 ? "bg-success" : prob > 0.3 ? "bg-warning" : "bg-danger";
  const fmt = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <Card title="Análise preditiva do caso">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Block title="Probabilidade de êxito">
          {loading || !j ? <Skeleton className="h-16 w-32" /> : (
            <>
              <div className="font-mono text-4xl font-semibold">{Math.round(prob * 100)}%</div>
              <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
                <div className={`h-full ${probColor}`} style={{ width: `${Math.round(prob * 100)}%` }} />
              </div>
              <p className="mt-3 text-xs text-text-secondary">
                Procedência em casos similares (n = {j.n_casos_base}).
              </p>
            </>
          )}
        </Block>
        <Block title="Tempo médio até sentença">
          {loading || !j ? <Skeleton className="h-16 w-32" /> : (
            <>
              <div className="font-mono text-4xl font-semibold">{j.tempo_medio_meses} meses</div>
              <p className="mt-3 text-xs text-text-secondary">Mediana com tutela deferida liminarmente. Liminar: ~2 dias.</p>
            </>
          )}
        </Block>
        <Block title="Dano moral esperado">
          {loading || !j ? <Skeleton className="h-16 w-48" /> : (
            <>
              <div className="font-mono text-2xl font-semibold">
                {fmt(j.dano_moral!.min)} — {fmt(j.dano_moral!.max)}
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                Mediana: <span className="font-mono font-semibold text-text-primary">{fmt(j.dano_moral!.mediana)}</span>
              </p>
              <p className="mt-3 text-xs text-text-secondary">Estratificado por tribunal — últimos 24 meses.</p>
            </>
          )}
        </Block>
        <Block title="Fatores de risco">
          {loading || !j ? <Skeleton className="h-16 w-full" /> : (
            <ul className="space-y-2">
              {(j.alertas ?? []).length === 0 && (
                <li className="text-sm text-text-tertiary">Nenhum alerta crítico identificado.</li>
              )}
              {(j.alertas ?? []).map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-warning" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          )}
        </Block>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-surface-elevated p-5">
        <h3 className="text-sm font-semibold">O que será gerado</h3>
        <div className="mt-3 space-y-2">
          {([
            ["parecer", "Parecer técnico-jurídico"],
            ["recurso_ans", "Recurso administrativo (NIP/ANS)"],
            ["notificacao_extrajudicial", "Notificação extrajudicial"],
            ["peticao_inicial", "Petição inicial com tutela de urgência"],
          ] as const).map(([k, label]) => (
            <label key={k} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={chosen[k]}
                onChange={(e) => setChosen({ ...chosen, [k]: e.target.checked })}
                className="h-4 w-4 rounded border-border bg-background"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </Card>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-5">
      <p className="caption">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-text-tertiary">{label}</Label>
      {children}
    </div>
  );
}
