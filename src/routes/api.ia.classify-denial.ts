import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { callAiTask, calcCostUsd, modelForTask } from "@/server/ai-gateway.server";
import { CLASSIFY_SYSTEM_PROMPT, CLASSIFY_TOOL_SCHEMA } from "@/server/ai-prompts.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

export const Route = createFileRoute("/api/ia/classify-denial")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
        if (!token) return json({ error: "unauthorized" }, 401);
        const sb = authedClient(token);
        const { data: claims } = await sb.auth.getClaims(token);
        if (!claims?.claims?.sub) return json({ error: "unauthorized" }, 401);

        const { case_id } = (await request.json().catch(() => ({}))) as { case_id?: string };
        if (!case_id) return json({ error: "case_id required" }, 400);

        const { data: c, error: cErr } = await sb
          .from("cases")
          .select("id, operadora, plan_modality, plan_contracted_at, law_firm_id")
          .eq("id", case_id)
          .single();
        if (cErr || !c) return json({ error: "case not found" }, 404);

        const { data: docs } = await sb
          .from("case_documents")
          .select("doc_type, extracted_data")
          .eq("case_id", case_id);

        const byType: Record<string, unknown> = {};
        (docs ?? []).forEach((d) => {
          if (d.doc_type) byType[d.doc_type] = d.extracted_data;
        });

        const userMsg = `DADOS DO CASO:
Operadora: ${c.operadora ?? "n/d"}
Modalidade: ${c.plan_modality ?? "n/d"}
Data de contratação do plano: ${c.plan_contracted_at ?? "não informada"}

DADOS EXTRAÍDOS DOS DOCUMENTOS:

Carta de negativa:
${JSON.stringify(byType.carta_negativa ?? null, null, 2)}

Laudo médico:
${JSON.stringify(byType.laudo_medico ?? null, null, 2)}

Contrato do plano:
${JSON.stringify(byType.contrato_plano ?? null, null, 2)}

Carteirinha:
${JSON.stringify(byType.carteirinha ?? null, null, 2)}

Protocolo:
${JSON.stringify(byType.protocolo ?? null, null, 2)}

Classifique a negativa conforme instruções e retorne via função classify_denial.`;

        try {
          const result = await callAiTask({
            task: "reasoning",
            messages: [
              { role: "system", content: CLASSIFY_SYSTEM_PROMPT },
              { role: "user", content: userMsg },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "classify_denial",
                  description: "Classify a health insurance denial",
                  parameters: CLASSIFY_TOOL_SCHEMA as Record<string, unknown>,
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "classify_denial" } },
            temperature: 0.2,
            max_tokens: 2500,
          });

          const classification = (result.toolArgs as Record<string, unknown>) ?? null;
          const cost = calcCostUsd(result.model, result.inputTokens, result.outputTokens);

          if (classification) {
            await supabaseAdmin
              .from("cases")
              .update({
                ai_classification: classification as never,
                denial_category:
                  (classification.categoria as string | undefined) ?? null,
              })
              .eq("id", case_id);
          }

          await supabaseAdmin.from("ai_calls_log").insert({
            law_firm_id: c.law_firm_id,
            case_id,
            call_type: "classify",
            model: result.model,
            input_tokens: result.inputTokens,
            output_tokens: result.outputTokens,
            cost_usd: cost,
            latency_ms: result.latencyMs,
            success: true,
          });

          return json({ classification });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "unknown";
          await supabaseAdmin.from("ai_calls_log").insert({
            law_firm_id: c.law_firm_id,
            case_id,
            call_type: "classify",
            model: modelForTask("reasoning"),
            success: false,
            error_message: msg,
          });
          if (msg === "AI_RATE_LIMITED") return json({ error: "rate_limited" }, 429);
          if (msg === "AI_PAYMENT_REQUIRED") return json({ error: "payment_required" }, 402);
          return json({ error: msg }, 500);
        }
      },
    },
  },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
