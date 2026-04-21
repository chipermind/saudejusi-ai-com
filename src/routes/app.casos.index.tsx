import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface CaseRow {
  id: string;
  client_name: string;
  operadora: string | null;
  denial_category: string | null;
  status: string | null;
  is_draft: boolean | null;
  wizard_step: number | null;
  created_at: string | null;
}

export const Route = createFileRoute("/app/casos/")({
  component: CasesListPage,
});

function CasesListPage() {
  const [drafts, setDrafts] = useState<CaseRow[]>([]);
  const [active, setActive] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("cases")
        .select("id, client_name, operadora, denial_category, status, is_draft, wizard_step, created_at")
        .order("created_at", { ascending: false });
      const list = (data ?? []) as CaseRow[];
      setDrafts(list.filter((c) => c.is_draft));
      setActive(list.filter((c) => !c.is_draft));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-8 py-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="caption">Operação</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Casos</h1>
        </div>
        <Link to="/app/casos/novo">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" /> Novo caso
          </Button>
        </Link>
      </div>

      {drafts.length > 0 && (
        <div className="mt-8 rounded-xl border border-warning/40 bg-warning/5 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-warning" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-text-primary">
                Você tem {drafts.length} rascunho{drafts.length > 1 ? "s" : ""} em andamento
              </h3>
              <ul className="mt-3 space-y-2">
                {drafts.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2"
                  >
                    <div className="text-sm">
                      <span className="font-medium">{d.client_name || "Sem nome"}</span>
                      <span className="ml-2 text-text-tertiary">
                        passo {d.wizard_step ?? 1} de 4
                      </span>
                    </div>
                    <Link
                      to="/app/casos/novo"
                      search={{ draft: d.id }}
                      className="text-sm text-primary hover:text-primary-hover"
                    >
                      Retomar →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">Casos ativos</h2>
        </div>
        {loading ? (
          <div className="p-8 text-sm text-text-tertiary">Carregando…</div>
        ) : active.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <FileText className="h-8 w-8 text-text-tertiary" />
            <p className="text-sm text-text-secondary">Nenhum caso ainda.</p>
            <Link to="/app/casos/novo">
              <Button size="sm">Criar primeiro caso</Button>
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="caption px-5 py-3 font-medium">Cliente</th>
                <th className="caption py-3 font-medium">Operadora</th>
                <th className="caption py-3 font-medium">Categoria</th>
                <th className="caption px-5 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {active.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-elevated"
                >
                  <td className="px-5 py-4 font-medium">
                    <Link to="/app/casos/$id" params={{ id: c.id }} className="hover:text-primary">
                      {c.client_name}
                    </Link>
                  </td>
                  <td className="py-4 text-text-secondary">{c.operadora ?? "—"}</td>
                  <td className="py-4 text-text-secondary">{c.denial_category ?? "—"}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="inline-flex rounded-md bg-info/10 px-2 py-1 text-xs font-medium text-info">
                      {c.status ?? "analise"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
