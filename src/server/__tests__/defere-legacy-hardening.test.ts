import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const rpc = vi.fn();
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { rpc: (...a: unknown[]) => rpc(...a) },
}));

import {
  checkAndIncrementTechnicalLimit,
  DEFERE_TECHNICAL_DAILY_LIMIT,
  DAILY_LIMITS,
} from "../ai-rate-limits.server";
import {
  buildLegacyClassifyDocumentBlock,
  LEGACY_DOCUMENT_UNTRUSTED_RULE,
  LEGACY_MEDIA_UNTRUSTED_RULE,
  LEGACY_DOC_CONTEXT_MAX_CHARS,
  LEGACY_DOC_OMITTED,
} from "../ai-prompts.server";

const src = (p: string): string => readFileSync(resolve(__dirname, "..", "..", p), "utf8");
const classify = src("routes/api.ia.classify-denial.ts");
const extract = src("routes/api.ia.extract-document.ts");
const idx = (s: string, needle: string): number => {
  const i = s.indexOf(needle);
  expect(i, needle).toBeGreaterThan(-1);
  return i;
};

describe("technical limiter", () => {
  beforeEach(() => rpc.mockReset());

  it("uses increment_rate_limit atomically with given task", async () => {
    rpc.mockResolvedValue({ data: [{ allowed: true, new_count: 1 }], error: null });
    const r = await checkAndIncrementTechnicalLimit("u1", "defere_classify", 100);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc.mock.calls[0][0]).toBe("increment_rate_limit");
    expect(rpc.mock.calls[0][1]).toMatchObject({ p_user_id: "u1", p_task: "defere_classify", p_limit: 100 });
    expect(r).toMatchObject({ allowed: true, remaining: 99, limit: 100 });
  });

  it("101st call => allowed false", async () => {
    rpc.mockResolvedValue({ data: [{ allowed: false, new_count: 101 }], error: null });
    const r = await checkAndIncrementTechnicalLimit("u1", "defere_extract", DEFERE_TECHNICAL_DAILY_LIMIT);
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  it("fails closed on RPC error and on invalid limit", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "boom" } });
    await expect(checkAndIncrementTechnicalLimit("u1", "defere_classify", 100)).rejects.toThrow();
    await expect(checkAndIncrementTechnicalLimit("u1", "defere_classify", 0)).rejects.toThrow();
    await expect(checkAndIncrementTechnicalLimit("u1", "defere_classify", 1.5)).rejects.toThrow();
  });

  it("B2C limits unchanged and constant is 100", () => {
    expect(DEFERE_TECHNICAL_DAILY_LIMIT).toBe(100);
    expect(DAILY_LIMITS).toEqual({
      livre: { classify: 3, extract: 2, analyze: 2, generate: 1 },
      essencial: { classify: 50, extract: 50, analyze: 50, generate: 50 },
      familia: { classify: 100, extract: 100, analyze: 100, generate: 100 },
    });
  });
});

describe("classify document context", () => {
  it("caps at 20 rows and ~12k chars, delimited", () => {
    const big = { t: "x".repeat(5000) };
    const docs = [
      ...Array.from({ length: 30 }, () => ({ doc_type: "outro", extracted_data: big })),
      { doc_type: "carta_negativa", extracted_data: big }, // row 31 → ignored
    ];
    const r1 = buildLegacyClassifyDocumentBlock(docs);
    expect(r1.block).not.toContain("xxxxx");

    const five = ["carta_negativa", "laudo_medico", "contrato_plano", "carteirinha", "protocolo"].map(
      (t) => ({ doc_type: t, extracted_data: big }),
    );
    const r2 = buildLegacyClassifyDocumentBlock(five);
    expect(r2.usedChars).toBeLessThanOrEqual(LEGACY_DOC_CONTEXT_MAX_CHARS);
    expect(r2.block).toContain(LEGACY_DOC_OMITTED);
    expect(r2.block.startsWith("<document_data>")).toBe(true);
    expect(r2.block.trimEnd().endsWith("</document_data>")).toBe(true);
  });

  it("rules present", () => {
    expect(LEGACY_DOCUMENT_UNTRUSTED_RULE).toContain("DADO NÃO CONFIÁVEL");
    expect(LEGACY_MEDIA_UNTRUSTED_RULE).toContain("NÃO CONFIÁVEL");
  });
});

describe("route ordering (static)", () => {
  it("classify: auth → firm → case → limiter → docs(limit) → AI; system has rule", () => {
    const auth = idx(classify, '"unauthorized" }, 401');
    const firm = idx(classify, "assertActiveFirm(");
    const cs = idx(classify, '"case not found" }, 404');
    const lim = idx(classify, 'checkAndIncrementTechnicalLimit(');
    const docs = idx(classify, ".limit(LEGACY_DOC_MAX_ROWS)");
    const ai = idx(classify, "callAiTask({");
    expect(auth < firm && firm < cs && cs < lim && lim < docs && docs < ai).toBe(true);
    expect(classify).toContain('"rate_limited" }, 429');
    expect(classify).toContain('"service_unavailable" }, 503');
    expect(classify).toContain("LEGACY_DOCUMENT_UNTRUSTED_RULE}");
    expect(classify).not.toContain("plan_tier");
  });

  it("extract: path → size → limiter → base64 → AI; system rule", () => {
    const path = idx(extract, '"invalid_document_path" }, 400');
    const dl = idx(extract, ".download(");
    const size = idx(extract, '"file_too_large" }, 400');
    const lim = idx(extract, "checkAndIncrementTechnicalLimit(");
    const b64 = idx(extract, "bytesToBase64(bytes)");
    const ai = idx(extract, "callAiWithMedia({");
    expect(path < dl && dl < size && size < lim && lim < b64 && b64 < ai).toBe(true);
    expect(extract).toContain("system: LEGACY_MEDIA_UNTRUSTED_RULE");
    expect(extract).not.toContain("plan_tier");
  });

  it("no document/prompt content in limiter logs", () => {
    for (const s of [classify, extract]) {
      const logs = s.match(/console\.(warn|error)\([^;]*;/gs) ?? [];
      for (const l of logs) expect(l).not.toMatch(/extracted_data|base64|userMsg|prompt|file_path/);
    }
  });
});
