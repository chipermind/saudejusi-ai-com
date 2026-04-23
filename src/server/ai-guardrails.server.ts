// ─── Guardrails do motor de IA SaudeJusia ─────────────────────────────────
// Server-only. Não importar do client.
//
// Responsabilidades:
//  1. Sanitizar input do beneficiário antes de injetar no prompt.
//  2. Detectar tentativas de prompt injection (não bloquear, marcar e seguir).
//  3. Validar pós-geração: regex de frases banidas + parse Zod do schema.
//
// LGPD art. 11: nenhum input/output de usuário é logado em produção.

import type { z } from "zod";

// ─── 1. Sanitização de input ───────────────────────────────────────────────

const INJECTION_DELIMITERS_REGEX =
  /<\/?user_input>|<\|[^|]*\|>|^#\s*(system|assistant|user)\s*:?/gim;

const MARKDOWN_ROLE_REGEX = /^\s*###\s*(system|assistant|user)\b/gim;

/**
 * Remove delimitadores XML/Markdown que poderiam fechar o bloco
 * <user_input> e fazer o restante do texto ser interpretado como instrução.
 * Não tenta "limpar" o sentido do texto — só neutraliza marcadores estruturais.
 */
export function sanitizeUserInput(raw: string): string {
  if (!raw) return "";
  let s = raw;
  s = s.replace(INJECTION_DELIMITERS_REGEX, " ");
  s = s.replace(MARKDOWN_ROLE_REGEX, " ");
  // Hard cap para prevenir DoS via prompt gigante
  if (s.length > 30_000) s = s.slice(0, 30_000) + "\n…[input truncado]";
  return s.trim();
}

// ─── 2. Detecção (não bloqueio) de prompt injection ────────────────────────

const INJECTION_PATTERNS: RegExp[] = [
  /\bignore\s+(all\s+)?previous\s+(instructions|prompts?)/i,
  /\bdisregard\s+(the\s+)?(above|previous|prior)/i,
  /\byou\s+are\s+now\b/i,
  /\bnova\s+instru[cç][aã]o\b/i,
  /\bignore\s+(as\s+)?instru[cç][õo]es?\s+(anteriores|acima)/i,
  /\besque[cç]a\s+(tudo|as\s+instru[cç][õo]es)/i,
  /\bact\s+as\s+(if|though)\b/i,
  /\bfinja\s+(que|ser)\b/i,
];

export function detectInjectionAttempt(sanitized: string): boolean {
  return INJECTION_PATTERNS.some((re) => re.test(sanitized));
}

// ─── 3. Frases banidas (validação pós-geração) ─────────────────────────────
// Se a saída do modelo contiver QUALQUER uma destas, rejeita e re-prompta.

const BANNED_PHRASES_REGEX: RegExp[] = [
  /\bganho\s+garantido\b/i,
  /\b100\s*%\s+de\s+chance\b/i,
  /\bsem\s+d[uú]vida\s+(vai|ir[áa])\s+ganhar\b/i,
  /\bcertamente\s+(vai|ir[áa])\s+ganhar\b/i,
  /\bvit[óo]ria\s+judicial\s+garantida\b/i,
  /\bresultado\s+garantido\b/i,
  /\bliminar\s+certa\b/i,
  /\bsubstitui\s+(o\s+)?advogado\b/i,
  /\bn[aã]o\s+precisa\s+de\s+advogado\b/i,
  // "a operadora é obrigada" só é banido quando NÃO acompanha citação de norma.
  // Heurística: presença da frase sem nenhum marcador típico de norma próxima.
];

const NORMA_MARKERS = /\b(RN|Lei|S[uú]mula|art\.?|artigo|CDC|ANS|STJ|STF|Decreto)\b/i;

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

export function checkBannedPhrases(text: string): ValidationResult {
  for (const re of BANNED_PHRASES_REGEX) {
    if (re.test(text)) {
      return { ok: false, reason: `banned_phrase: ${re.source}` };
    }
  }
  // "operadora é obrigada" sem norma citada
  const obrigadaIdx = text.search(/\ba\s+operadora\s+[ée]\s+obrigada\b/i);
  if (obrigadaIdx >= 0) {
    const window = text.slice(Math.max(0, obrigadaIdx - 80), obrigadaIdx + 200);
    if (!NORMA_MARKERS.test(window)) {
      return { ok: false, reason: "operadora_obrigada_sem_norma" };
    }
  }
  return { ok: true };
}

// ─── 4. Parse + validação completa ────────────────────────────────────────

export interface ParsedOutput<T> {
  ok: boolean;
  data?: T;
  reason?: string;
}

/**
 * Tenta parsear o output do modelo com o schema fornecido e roda a checagem
 * de frases banidas no JSON serializado. Use o resultado para decidir
 * re-prompt (até 2 tentativas) ou retornar erro ao consumidor.
 */
export function parseAndValidate<T>(
  raw: unknown,
  schema: z.ZodType<T>,
): ParsedOutput<T> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, reason: `schema_invalid: ${parsed.error.message.slice(0, 200)}` };
  }
  const banned = checkBannedPhrases(JSON.stringify(parsed.data));
  if (!banned.ok) return { ok: false, reason: banned.reason };
  return { ok: true, data: parsed.data };
}

// ─── 5. Logging seguro (sem PII) ──────────────────────────────────────────
// LGPD art. 11 — PII de saúde não vai para logs de produção.

const AI_DEBUG_LOG_PII =
  process.env.NODE_ENV !== "production" && process.env.AI_DEBUG_LOG_PII === "true";

export function safeDebugLog(label: string, payload: unknown): void {
  // Em produção isto é sempre no-op, mesmo se a env vier setada.
  if (!AI_DEBUG_LOG_PII) return;
  // eslint-disable-next-line no-console
  console.debug(`[ai-debug:${label}]`, payload);
}
