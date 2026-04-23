import { ShieldAlert } from "lucide-react";

export function HeroCaseCard() {
  return (
    <div className="relative w-full max-w-md">
      {/* Glow */}
      <div className="absolute -inset-4 -z-10 rounded-2xl bg-primary/10 blur-3xl" />

      <div className="rounded-xl border border-border-strong bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <p className="caption">Sua situação</p>
            <p className="mt-1 text-sm font-medium text-text-primary">Beneficiário · plano negado</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-danger/10 px-2 py-1 text-xs font-medium text-danger">
            <ShieldAlert className="h-3 w-3" /> Negativa
          </span>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <Row label="Procedimento" value="Prótese de joelho (OPME)" />
          <Row label="Operadora" value="Bradesco Saúde" />
          <Row label="CID" value="M17.1" mono />
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <p className="caption mb-3">O que a SaudeJusia diz</p>
          <div className="space-y-3">
            <Metric
              label="Enquadramento"
              value="Rol ANS"
              tone="success"
            />
            <Metric label="Prazo do plano para resposta" value="10 dias" />
            <Metric label="Próximo passo" value="Reconsideração" />
            <Metric label="Se negar de novo" value="NIP ANS" />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 p-3">
          <div className="h-2 w-2 rounded-full bg-success" />
          <p className="text-xs text-text-secondary">
            Documento pronto em minutos. <span className="font-medium text-text-primary">Sem advogado. Sem custo surpresa.</span>
          </p>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-text-tertiary">
        Cobertura prevista no Rol ANS (RN 465/2021). Prazo de urgência: 3 dias úteis.
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
        className={`font-mono text-sm font-semibold ${
          tone === "success" ? "text-success" : "text-text-primary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
