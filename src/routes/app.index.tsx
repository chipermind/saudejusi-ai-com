import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/")({
  component: DashboardPage,
});

const kpis = [
  { label: "Casos ativos", value: "47", delta: "+12%", trend: "up" as const, hint: "vs. mês anterior" },
  { label: "Taxa de êxito", value: "84%", delta: "+3pp", trend: "up" as const, hint: "últimos 90 dias" },
  { label: "Tempo médio", value: "5.8m", delta: "−0.4m", trend: "up" as const, hint: "do protocolo à decisão" },
  { label: "Recuperado no mês", value: "R$ 184k", delta: "+R$ 41k", trend: "up" as const, hint: "valor de condenação" },
];

const recentCases = [
  {
    id: "2847",
    client: "M. Silva",
    operadora: "Bradesco Saúde",
    category: "OPME",
    prob: 87,
    status: "Parecer gerado",
    statusTone: "info",
  },
  {
    id: "2846",
    client: "J. Almeida",
    operadora: "Amil",
    category: "Bariátrica",
    prob: 92,
    status: "Em análise",
    statusTone: "warn",
  },
  {
    id: "2845",
    client: "R. Costa",
    operadora: "Unimed Recife",
    category: "Home care",
    prob: 78,
    status: "Ação proposta",
    statusTone: "success",
  },
  {
    id: "2844",
    client: "L. Pereira",
    operadora: "SulAmérica",
    category: "Off-label",
    prob: 71,
    status: "Em andamento",
    statusTone: "info",
  },
  {
    id: "2843",
    client: "A. Santos",
    operadora: "Hapvida",
    category: "ABA / autismo",
    prob: 89,
    status: "Ganho",
    statusTone: "success",
  },
] as const;

function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-8 py-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="caption">Visão geral</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
            Dashboard
          </h1>
        </div>
        <Link to="/app/casos">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" /> Novo caso
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="flex flex-col gap-3 bg-surface p-5">
            <p className="caption">{k.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-semibold text-text-primary">
                {k.value}
              </span>
              <span
                className={`flex items-center gap-0.5 font-mono text-xs ${
                  k.trend === "up" ? "text-success" : "text-danger"
                }`}
              >
                {k.trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {k.delta}
              </span>
            </div>
            <p className="text-xs text-text-tertiary">{k.hint}</p>
          </div>
        ))}
      </div>

      {/* Recent cases */}
      <div className="mt-10 rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Casos recentes</h2>
            <p className="text-xs text-text-tertiary">Últimas 5 atualizações</p>
          </div>
          <Link
            to="/app/casos"
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover"
          >
            Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="caption px-5 py-3 font-medium">Caso</th>
                <th className="caption py-3 font-medium">Cliente</th>
                <th className="caption py-3 font-medium">Operadora</th>
                <th className="caption py-3 font-medium">Categoria</th>
                <th className="caption py-3 font-medium">Êxito</th>
                <th className="caption px-5 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentCases.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-elevated"
                >
                  <td className="px-5 py-4 font-mono text-text-tertiary">#{c.id}</td>
                  <td className="py-4 font-medium text-text-primary">{c.client}</td>
                  <td className="py-4 text-text-secondary">{c.operadora}</td>
                  <td className="py-4 text-text-secondary">{c.category}</td>
                  <td className="py-4">
                    <span className="font-mono font-medium text-text-primary">{c.prob}%</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <StatusPill label={c.status} tone={c.statusTone} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  const cls =
    tone === "success"
      ? "bg-success/10 text-success"
      : tone === "warn"
      ? "bg-warning/10 text-warning"
      : tone === "danger"
      ? "bg-danger/10 text-danger"
      : "bg-info/10 text-info";
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
