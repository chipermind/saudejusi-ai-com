import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Check, X, FileText, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/casos/$id")({
  component: CaseDetailPage,
});

interface CaseRow {
  id: string;
  client_name: string;
  operadora: string | null;
  denial_category: string | null;
  status: string | null;
  created_at: string | null;
  jurimetrics: Record<string, unknown> | null;
  ai_classification: Record<string, unknown> | null;
}
interface DocRow { id: string; doc_type: string | null; file_name: string | null }
interface DelRow {
  id: string; deliverable_type: string | null; status: string | null;
  content: string | null; error_message: string | null;
}

const DEL_TITLES: Record<string, string> = {
  parecer: "Parecer técnico-jurídico",
  recurso_ans: "Recurso administrativo (NIP/ANS)",
  notificacao_extrajudicial: "Notificação extrajudicial",
  peticao_inicial: "Petição inicial com tutela de urgência",
};

function CaseDetailPage() {
  const { id } = Route.useParams();
  const [c, setC] = useState<CaseRow | null>(null);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [dels, setDels] = useState<DelRow[]>([]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      const { data: caseRow } = await supabase.from("cases").select("*").eq("id", id).single();
      if (cancelled) return;
      if (caseRow) setC(caseRow as CaseRow);
      const { data: d } = await supabase
        .from("case_documents").select("id, doc_type, file_name").eq("case_id", id);
      if (cancelled) return;
      setDocs((d ?? []) as DocRow[]);
      const { data: dd } = await supabase
        .from("case_deliverables")
        .select("id, deliverable_type, status, content, error_message")
        .eq("case_id", id);
      if (cancelled) return;
      setDels((dd ?? []) as DelRow[]);

      // Resolve user's law firm to scope the realtime channel topic.
      // Realtime authorization policy on `realtime.messages` only allows
      // subscriptions to `case_deliverables:firm:<law_firm_id>`.
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) return;
      const { data: lawyer } = await supabase
        .from("lawyers")
        .select("law_firm_id")
        .eq("id", uid)
        .maybeSingle();
      const firmId = lawyer?.law_firm_id;
      if (!firmId || cancelled) return;

      // Use Realtime Authorization (private channel). RLS on realtime.messages
      // restricts subscribers to channels scoped to their own firm.
      await supabase.realtime.setAuth();
      channel = supabase
        .channel(`case_deliverables:firm:${firmId}`, { config: { private: true } })
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "case_deliverables", filter: `case_id=eq.${id}` },
          (payload) => {
            const row = payload.new as DelRow;
            setDels((prev) => {
              const ix = prev.findIndex((p) => p.id === row.id);
              if (ix === -1) return [...prev, row];
              const next = [...prev];
              next[ix] = row;
              return next;
            });
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [id]);

  if (!c) return <div className="p-8 text-sm text-text-tertiary">Carregando…</div>;

  const j = c.jurimetrics as { probabilidade_exito?: number; tempo_medio_meses?: number; dano_moral?: { mediana: number } } | null;

  return (
    <div className="mx-auto max-w-6xl px-8 py-8">
      <Link to="/app/casos" className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Casos
      </Link>

      <div className="mt-4 rounded-xl border border-border bg-surface p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{c.client_name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <span>{c.operadora ?? "—"}</span>
              <span className="text-text-tertiary">·</span>
              <span className="rounded bg-info/15 px-2 py-0.5 text-xs font-medium text-info">{c.denial_category ?? "—"}</span>
              <span className="text-text-tertiary">·</span>
              <span className="rounded bg-success/15 px-2 py-0.5 text-xs font-medium text-success">{c.status ?? "analise"}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Editar</Button>
            <Button variant="outline" size="sm">Arquivar</Button>
            <Button size="sm">Exportar</Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="docs">Documentos</TabsTrigger>
          <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {j ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-surface p-5">
                <p className="caption">Probabilidade</p>
                <p className="mt-2 font-mono text-3xl font-semibold">{Math.round((j.probabilidade_exito ?? 0) * 100)}%</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-5">
                <p className="caption">Tempo médio</p>
                <p className="mt-2 font-mono text-3xl font-semibold">{j.tempo_medio_meses ?? "—"}m</p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-5">
                <p className="caption">Dano moral (mediana)</p>
                <p className="mt-2 font-mono text-2xl font-semibold">
                  {(j.dano_moral?.mediana ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-tertiary">Sem análise preditiva ainda.</p>
          )}
        </TabsContent>

        <TabsContent value="docs" className="mt-6">
          <div className="rounded-xl border border-border bg-surface">
            {docs.length === 0 ? (
              <p className="p-6 text-sm text-text-tertiary">Nenhum documento.</p>
            ) : (
              <ul className="divide-y divide-border">
                {docs.map((d) => (
                  <li key={d.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-text-tertiary" />
                      <span>{d.file_name}</span>
                    </div>
                    <span className="text-xs text-text-tertiary">{d.doc_type}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="deliverables" className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {dels.map((d) => (
              <div key={d.id} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold">{DEL_TITLES[d.deliverable_type ?? ""] ?? d.deliverable_type}</h3>
                  <StatusBadge status={d.status} />
                </div>
                {d.error_message && <p className="mt-2 text-xs text-danger">{d.error_message}</p>}
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" disabled={d.status !== "ready"}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" /> Visualizar
                  </Button>
                  <Button size="sm" variant="outline" disabled={d.status !== "ready"}>
                    <Download className="mr-1.5 h-3.5 w-3.5" /> .docx
                  </Button>
                </div>
              </div>
            ))}
            {dels.length === 0 && (
              <p className="text-sm text-text-tertiary">Nenhum deliverable ainda.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (status === "ready")
    return <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-xs font-medium text-success"><Check className="h-3 w-3" />Pronto</span>;
  if (status === "failed")
    return <span className="inline-flex items-center gap-1 rounded bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger"><X className="h-3 w-3" />Falhou</span>;
  return <span className="inline-flex items-center gap-1 rounded bg-info/15 px-2 py-0.5 text-xs font-medium text-info"><Loader2 className="h-3 w-3 animate-spin" />Gerando…</span>;
}
