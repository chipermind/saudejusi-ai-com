// Geração real de deliverables do produto Defere (B2B).
// Reutiliza o pipeline canônico (handleAiRequest): auth, rate limit, detecção
// de injection, gateway, retry, validação Zod, artifact cifrado e telemetria.
// Prompt e schema são B2B, separados dos do produto B2C SaudeJusia.

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertActiveFirm } from "@/server/auth-firm.server";
import { handleAiRequest } from "@/server/ai-endpoint-handler.server";
import {
  DefereDeliverableOutputSchema,
  DefereDeliverableTypeSchema,
} from "@/server/ai-schemas";
import {
  DEFERE_DELIVERABLE_PROMPT_VERSION,
  buildDefereDeliverablePrompt,
  type DefereDeliverableTypeName,
} from "@/server/ai-prompts.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Teto simples e explícito do payload de documentos enviado ao modelo.
const MAX_EXTRACTED_DATA_CHARS = 12_000;

function authedClient(token: string) {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

// Schema de entrada do pipeline interno.
const DeliverableInputSchema = z.object({
  deliverable_type: DefereDeliverableTypeSchema,
  contexto: z.record(z.string(), z.unknown()),
});

// Campos do caso liberados para o modelo.
// PII desnecessária (client_cpf, card_number) NUNCA é enviada — vira placeholder
// no documento e é preenchida pelo advogado na revisão.
const CASE_FIELDS = [
  "client_name",
  "operadora",
  "procedure_requested",
  "cid",
  "denial_category",
  "denial_date",
  "status",
  "success_probability",
  "estimated_damages",
  "plan_modality",
  "plan_contracted_at",
  "comarca",
  "tribunal",
  "vara",
  "ai_classification",
  "jurimetrics",
  "denial_reason",
  "prescription_date",
  "urgency",
].join(", ");

export const Route = createFileRoute("/api/ia/generate-deliverable")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
        if (!token) return json({ error: "unauthorized" }, 401);
        const sb = authedClient(token);
        const { data: claims } = await sb.auth.getClaims(token);
        if (!claims?.claims?.sub) return json({ error: "unauthorized" }, 401);

        const firmCheck = await assertActiveFirm(claims.claims.sub);
        if (!firmCheck.ok) return json({ error: firmCheck.error }, firmCheck.status);

        const { deliverable_id } = (await request.json().catch(() => ({}))) as {
          deliverable_id?: string;
        };
        if (!deliverable_id) return json({ error: "deliverable_id required" }, 400);

        // RLS check — só enxerga deliverable do próprio escritório.
        const { data: del, error: delErr } = await sb
          .from("case_deliverables")
          .select("id, case_id, deliverable_type")
          .eq("id", deliverable_id)
          .single();
        if (delErr || !del) return json({ error: "not found" }, 404);

        const parsedType = DefereDeliverableTypeSchema.safeParse(del.deliverable_type);
        if (!parsedType.success) {
          return json({ error: "unsupported_deliverable_type" }, 400);
        }
        const deliverableType: DefereDeliverableTypeName = parsedType.data;

        if (!del.case_id) return json({ error: "not found" }, 404);

        // Contexto mínimo do caso, escopado ao escritório do chamador.
        const { data: caseRow, error: caseErr } = await supabaseAdmin
          .from("cases")
          .select(CASE_FIELDS)
          .eq("id", del.case_id)
          .eq("law_firm_id", firmCheck.lawFirmId)
          .maybeSingle();
        if (caseErr || !caseRow) return json({ error: "not found" }, 404);

        // Documentos: apenas tipo e dados já extraídos, com teto de volume.
        const { data: docs } = await supabaseAdmin
          .from("case_documents")
          .select("doc_type, extracted_data")
          .eq("case_id", del.case_id)
          .limit(20);

        const documentos: Array<{ doc_type: string | null; extracted_data: unknown }> = [];
        let usedChars = 0;
        for (const d of docs ?? []) {
          const serialized = JSON.stringify(d.extracted_data ?? null);
          if (usedChars + serialized.length > MAX_EXTRACTED_DATA_CHARS) {
            documentos.push({ doc_type: d.doc_type, extracted_data: "[OMITIDO POR LIMITE DE TAMANHO]" });
            continue;
          }
          usedChars += serialized.length;
          documentos.push({ doc_type: d.doc_type, extracted_data: d.extracted_data ?? null });
        }

        const contexto: Record<string, unknown> = {
          ...(caseRow as unknown as Record<string, unknown>),
          documentos,
        };

        // Estado: generating antes de qualquer chamada de IA.
        const { error: genErr } = await supabaseAdmin
          .from("case_deliverables")
          .update({ status: "generating", error_message: null })
          .eq("id", del.id);
        if (genErr) {
          console.error("[generate-deliverable] falha ao marcar generating", genErr.message);
          return json({ error: "internal_error" }, 500);
        }

        // Pipeline canônico, chamado server-side (sem loop HTTP externo).
        const internalRequest = new Request("http://internal/ai/generate-deliverable", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            deliverable_type: deliverableType,
            contexto,
          }),
        });

        const aiResponse = await handleAiRequest(internalRequest, {
          task: "generate",
          promptVersion: DEFERE_DELIVERABLE_PROMPT_VERSION,
          inputSchema: DeliverableInputSchema,
          outputSchema: DefereDeliverableOutputSchema,
          buildPrompt: (input) => {
            const built = buildDefereDeliverablePrompt({
              deliverableType: input.deliverable_type,
              rawUserInput: `CONTEXTO DO CASO (JSON):\n${JSON.stringify(input.contexto, null, 2)}`,
            });
            return { system: built.system, user: built.user };
          },
        });

        if (!aiResponse.ok) {
          const code = await safeErrorCode(aiResponse);
          const failed = await markError(del.id, code);
          if (!failed) return json({ error: "internal_error" }, 500);
          return json({ error: code }, aiResponse.status);
        }

        let analysis: unknown;
        try {
          const payload = (await aiResponse.json()) as { analysis?: unknown };
          analysis = payload.analysis;
        } catch {
          analysis = null;
        }

        const validated = DefereDeliverableOutputSchema.safeParse(analysis);
        if (
          !validated.success ||
          validated.data.deliverable_type !== deliverableType ||
          validated.data.corpo_documento.trim().length === 0
        ) {
          const ok = await markError(del.id, "invalid_generation");
          if (!ok) return json({ error: "internal_error" }, 500);
          return json({ error: "invalid_generation" }, 422);
        }

        const { error: readyErr } = await supabaseAdmin
          .from("case_deliverables")
          .update({
            status: "ready",
            content: validated.data.corpo_documento,
            generated_by_model: `ai-pipeline:${DEFERE_DELIVERABLE_PROMPT_VERSION}`,
            generated_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("id", del.id);
        if (readyErr) {
          console.error("[generate-deliverable] falha ao persistir conteúdo", readyErr.message);
          await markError(del.id, "persist_failed");
          return json({ error: "internal_error" }, 500);
        }

        return json({
          ok: true,
          deliverable_id: del.id,
          status: "ready",
          confianca: validated.data.confianca,
          riscos_limites: validated.data.riscos_limites,
          revisar_antes_finalizar: validated.data.revisar_antes_finalizar,
          requires_human_review: true,
        });
      },
    },
  },
});

// Mensagem de erro curta e sanitizada: nunca stack trace, token ou conteúdo.
async function safeErrorCode(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: unknown };
    const code = typeof body.error === "string" ? body.error : "ai_error";
    return code.slice(0, 60).replace(/[^a-z0-9_]/gi, "_");
  } catch {
    return "ai_error";
  }
}

async function markError(deliverableId: string, code: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("case_deliverables")
    .update({ status: "failed", error_message: code })
    .eq("id", deliverableId);
  if (error) {
    console.error("[generate-deliverable] falha ao marcar erro", error.message);
    return false;
  }
  return true;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
