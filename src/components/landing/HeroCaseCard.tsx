import { ShieldAlert } from "lucide-react";

export function HeroCaseCard() {
  return (
    <div className="relative w-full max-w-md">
      {/* Glow */}
      <div className="absolute -inset-4 -z-10 rounded-2xl bg-primary/10 blur-3xl" />

      <div className="rounded-xl border border-border-strong bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <p className="caption">Caso #2847</p>
            <p className="mt-1 text-sm font-medium text-text-primary">M. Silva, 54 anos</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-danger/10 px-2 py-1 text-xs font-medium text-danger">
            <ShieldAlert className="h-3 w-3" /> Negativa
          </span>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <Row label="Categoria" value="OPME — Prótese de joelho" />
          <Row label="Operadora" value="Bradesco Saúde" />
          <Row label="CID" value="M17.1" mono />
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <p className="caption mb-3">Análise do Defere</p>
          <div className="space-y-3">
            <Metric
              label="Indicador estatístico de procedência"
              value="87%"
              tone="success"
            />
            <Metric label="Dano moral estimado" value="R$ 12.400" />
            <Metric label="Tempo médio" value="6 meses" />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 p-3">
          <div className="h-2 w-2 rounded-full bg-success" />
          <p className="text-xs text-text-secondary">
            Kit jurídico pronto em <span className="font-medium text-text-primary">38h desde o upload</span>
          </p>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-text-tertiary">
        Indicadores são baseados em decisões históricas e não constituem garantia de
        resultado.
      </p>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-tertiary">{label}</span>
      <span className={`text-text-primary ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-text-secondary">{label}</span>
      <span
        className={`font-mono text-base font-semibold ${
          tone === "success" ? "text-success" : "text-text-primary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
