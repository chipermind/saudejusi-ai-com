// Baseline jurimetrics dataset — server-only.
// Honest mock based on aggregate public stats (CNJ Justiça em Números 2024,
// ANS reports, STJ jurisprudence). Will be replaced by proprietary data.

export interface BaselineEntry {
  procedencia: number; // 0-1
  meses: number;
  dm_min: number;
  dm_med: number;
  dm_max: number;
  n: number;
}

export interface CategoryBaseline {
  base: BaselineEntry;
  por_tribunal?: Record<string, Partial<BaselineEntry>>;
}

export const JURIMETRICS_BASELINE: Record<string, CategoryBaseline> = {
  fora_do_rol: {
    base: { procedencia: 0.87, meses: 7, dm_min: 5000, dm_med: 10000, dm_max: 20000, n: 420 },
    por_tribunal: {
      TJSP: { procedencia: 0.91, dm_med: 12000 },
      TJRJ: { procedencia: 0.89, dm_med: 10000 },
      TJMG: { procedencia: 0.85, dm_med: 8000 },
      TJPE: { procedencia: 0.88, dm_med: 10000 },
      TJRS: { procedencia: 0.83, dm_med: 9000 },
    },
  },
  opme: {
    base: { procedencia: 0.93, meses: 6, dm_min: 8000, dm_med: 15000, dm_max: 30000, n: 680 },
    por_tribunal: {
      TJSP: { procedencia: 0.95, dm_med: 18000 },
      TJRJ: { procedencia: 0.92, dm_med: 15000 },
    },
  },
  home_care: {
    base: { procedencia: 0.89, meses: 5, dm_min: 6000, dm_med: 12000, dm_max: 25000, n: 310 },
  },
  medicamento_off_label: {
    base: { procedencia: 0.81, meses: 8, dm_min: 5000, dm_med: 10000, dm_max: 22000, n: 190 },
  },
  medicamento_importado: {
    base: { procedencia: 0.62, meses: 11, dm_min: 3000, dm_med: 8000, dm_max: 18000, n: 95 },
  },
  bariatrica: {
    base: { procedencia: 0.85, meses: 6, dm_min: 6000, dm_med: 10000, dm_max: 20000, n: 240 },
  },
  oncologico: {
    base: { procedencia: 0.95, meses: 4, dm_min: 10000, dm_med: 20000, dm_max: 50000, n: 520 },
  },
  aba_autismo: {
    base: { procedencia: 0.91, meses: 5, dm_min: 8000, dm_med: 15000, dm_max: 30000, n: 370 },
  },
  transplante: {
    base: { procedencia: 0.88, meses: 4, dm_min: 15000, dm_med: 25000, dm_max: 60000, n: 80 },
  },
  urgencia_emergencia: {
    base: { procedencia: 0.92, meses: 3, dm_min: 8000, dm_med: 15000, dm_max: 35000, n: 450 },
  },
  carencia: {
    base: { procedencia: 0.58, meses: 9, dm_min: 3000, dm_med: 6000, dm_max: 14000, n: 210 },
  },
  preexistente: {
    base: { procedencia: 0.71, meses: 10, dm_min: 4000, dm_med: 8000, dm_max: 18000, n: 140 },
  },
  rescisao_unilateral: {
    base: { procedencia: 0.79, meses: 7, dm_min: 5000, dm_med: 12000, dm_max: 25000, n: 180 },
  },
  reajuste_abusivo: {
    base: { procedencia: 0.68, meses: 13, dm_min: 2000, dm_med: 5000, dm_max: 12000, n: 290 },
  },
  reembolso: {
    base: { procedencia: 0.74, meses: 8, dm_min: 2000, dm_med: 4000, dm_max: 10000, n: 160 },
  },
  outros: {
    base: { procedencia: 0.65, meses: 9, dm_min: 3000, dm_med: 7000, dm_max: 15000, n: 100 },
  },
};

export const OPERADORA_MODIFIERS: Record<
  string,
  { procedencia_delta: number; dm_multiplier: number }
> = {
  Amil: { procedencia_delta: 0.02, dm_multiplier: 1.15 },
  "Bradesco Saúde": { procedencia_delta: 0.0, dm_multiplier: 1.0 },
  SulAmérica: { procedencia_delta: -0.01, dm_multiplier: 1.05 },
  "NotreDame Intermédica": { procedencia_delta: 0.03, dm_multiplier: 1.1 },
  Hapvida: { procedencia_delta: 0.03, dm_multiplier: 1.1 },
  "Unimed Nacional": { procedencia_delta: 0.01, dm_multiplier: 1.0 },
  "Prevent Senior": { procedencia_delta: 0.04, dm_multiplier: 1.2 },
};

export interface JurimetricsResult {
  probabilidade_exito: number;
  intervalo_confianca: { min: number; max: number };
  tempo_medio_meses: number;
  dano_moral: { min: number; mediana: number; max: number };
  n_casos_base: number;
  fontes: string[];
  data_baseline: string;
  versao_modelo: string;
  disclaimer: string;
  alertas: string[];
}

export function computeJurimetrics(args: {
  category: string | null | undefined;
  operadora: string | null | undefined;
  tribunal: string | null | undefined;
  denialDate?: string | null;
  prescriptionDate?: string | null;
  urgency?: string | null;
  hasContract?: boolean;
}): JurimetricsResult {
  const cat = args.category && JURIMETRICS_BASELINE[args.category] ? args.category : "outros";
  const cb = JURIMETRICS_BASELINE[cat];
  const tribOverride = (args.tribunal && cb.por_tribunal?.[args.tribunal]) || {};
  const merged: BaselineEntry = { ...cb.base, ...tribOverride } as BaselineEntry;

  const opMod = (args.operadora && OPERADORA_MODIFIERS[args.operadora]) || null;
  let prob = merged.procedencia + (opMod?.procedencia_delta ?? 0);
  prob = Math.max(0.05, Math.min(0.98, prob));
  const dmMul = opMod?.dm_multiplier ?? 1.0;

  const alertas: string[] = [];
  if (args.denialDate) {
    const dDays = Math.floor((Date.now() - new Date(args.denialDate).getTime()) / 86400000);
    if (dDays >= 1)
      alertas.push(
        "Prazo de 24h da RN 395/ANS vencido — fortalece pedido de tutela de urgência",
      );
  }
  if (args.urgency === "urgencia" || args.urgency === "emergencia") {
    alertas.push("Caráter de urgência/emergência — aplicação da Súmula Normativa 21 ANS");
  }
  if (opMod && opMod.procedencia_delta >= 0.03) {
    alertas.push(
      `Operadora ${args.operadora} historicamente reincidente — dano moral tende à mediana alta`,
    );
  }
  if (args.hasContract === false) {
    alertas.push(
      "Ausência do contrato pode embasar pedido de inversão do ônus da prova (CDC art. 6º, VIII)",
    );
  }
  if (cat === "oncologico") {
    alertas.push(
      "Tema oncológico: jurisprudência amplamente favorável ao beneficiário (Lei 14.454/22)",
    );
  }

  return {
    probabilidade_exito: Number(prob.toFixed(2)),
    intervalo_confianca: {
      min: Number(Math.max(0.05, prob - 0.07).toFixed(2)),
      max: Number(Math.min(0.99, prob + 0.05).toFixed(2)),
    },
    tempo_medio_meses: merged.meses,
    dano_moral: {
      min: Math.round(merged.dm_min * dmMul),
      mediana: Math.round(merged.dm_med * dmMul),
      max: Math.round(merged.dm_max * dmMul),
    },
    n_casos_base: merged.n,
    fontes: [
      "CNJ — Justiça em Números 2024",
      "ANS — Relatórios de litigiosidade 2023-2024",
      "STJ — pesquisa jurisprudencial 2022-2024",
    ],
    data_baseline: "2024-Q4",
    versao_modelo: "baseline-v1-publico",
    disclaimer:
      "Estimativa baseada em estatísticas públicas agregadas. Versões futuras incorporarão dataset proprietário.",
    alertas,
  };
}
