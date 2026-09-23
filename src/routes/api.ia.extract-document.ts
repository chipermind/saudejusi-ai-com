import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  callAiWithMedia,
  calcCostUsd,
  modelForTask,
  type MediaMimeType,
} from "@/server/ai-gateway.server";
import { EXTRACTION_PROMPTS, EXTRACTION_SCHEMAS } from "@/server/ai-prompts.server";
import { assertActiveFirm, sanitizeAiError } from "@/server/auth-firm.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_MEDIA_BYTES = 18 * 1024 * 1024; // 18MB — Gemini limit is ~20MB; leave headroom

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

function detectMime(fileName: string): MediaMimeType {
  const n = fileName.toLowerCase();
  if (n.endsWith(".pdf")) return "application/pdf";
  if (n.endsWith(".png")) return "image/png";
  if (n.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

function bytesToBase64(bytes: Uint8Array): string {
  // Chunked to avoid stack overflow on large files via String.fromCharCode(...spread)
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function logCall(args: {
  law_firm_id?: string | null;
  case_id?: string | null;
  call_type: string;
  model: string;
  input_tokens?: number;
  output_tokens?: number;
  cost_usd?: number;
  latency_ms?: number;
  success: boolean;
  error_message?: string;
}) {
  try {
    await supabaseAdmin.from("ai_calls_log").insert({
      law_firm_id: args.law_firm_id ?? null,
      case_id: args.case_id ?? null,
      call_type: args.call_type,
      model: args.model,
      input_tokens: args.input_tokens ?? null,
      output_tokens: args.output_tokens ?? null,
      cost_usd: args.cost_usd ?? null,
      latency_ms: args.latency_ms ?? null,
      success: args.success,
      error_message: args.error_message ?? null,
    });
  } catch (e) {
    console.error("logCall failed", e);
  }
}

export const Route = createFileRoute("/api/ia/extract-document")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.replace(/^Bearer\s+/i, "");
        if (!token) return json({ error: "unauthorized" }, 401);

        const sb = authedClient(token);
        const { data: claims } = await sb.auth.getClaims(token);
        if (!claims?.claims?.sub) return json({ error: "unauthorized" }, 401);

        const firmCheck = await assertActiveFirm(claims.claims.sub);
        if (!firmCheck.ok) return json({ error: firmCheck.error }, firmCheck.status);

        const body = (await request.json().catch(() => ({}))) as {
          case_document_id?: string;
        };
        if (!body.case_document_id) return json({ error: "case_document_id required" }, 400);

        // RLS-scoped read of the document
        const { data: doc, error: docErr } = await sb
          .from("case_documents")
          .select("id, case_id, doc_type, file_path, file_name")
          .eq("id", body.case_document_id)
          .single();
        if (docErr || !doc) return json({ error: "not found" }, 404);

        const docType = doc.doc_type ?? "outro";
        const prompt = EXTRACTION_PROMPTS[docType] ?? EXTRACTION_PROMPTS.outro;
        const schema = EXTRACTION_SCHEMAS[docType] ?? EXTRACTION_SCHEMAS.outro;

        // Get firm id for log
        const { data: lawyer } = await sb
          .from("lawyers")
          .select("law_firm_id")
          .eq("id", claims.claims.sub)
          .maybeSingle();
        const firmId = lawyer?.law_firm_id ?? null;

        // Path binding: the admin client bypasses Storage RLS, so never follow a
        // file_path that is not bound to this firm and this case.
        const expectedPrefix = `${firmCheck.lawFirmId}/${doc.case_id}/`;
        if (
          !doc.case_id ||
          typeof doc.file_path !== "string" ||
          !doc.file_path.startsWith(expectedPrefix) ||
          doc.file_path.length <= expectedPrefix.length
        ) {
          console.warn("extract-document: invalid_document_path", {
            doc_id: doc.id,
            firm_id: firmCheck.lawFirmId,
            case_id: doc.case_id,
          });
          return json({ error: "invalid_document_path" }, 400);
        }

        // Download the file directly via admin client (private bucket).
        // Gemini processes PDFs natively, so no signed URL or PDF→image step is needed.
        const { data: fileBlob, error: dlErr } = await supabaseAdmin.storage
          .from("case-documents")
          .download(doc.file_path);
        if (dlErr || !fileBlob) {
          const msg = `download failed: ${dlErr?.message ?? "unknown"}`;
          await supabaseAdmin
            .from("case_documents")
            .update({ extraction_error: "Não foi possível baixar o arquivo." })
            .eq("id", doc.id);
          await logCall({
            law_firm_id: firmId,
            case_id: doc.case_id,
            call_type: "ocr_extract",
            model: modelForTask("ocr"),
            success: false,
            error_message: msg,
          });
          return json({ error: "could not download file" }, 500);
        }

        const arrayBuffer = await fileBlob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        if (bytes.length > MAX_MEDIA_BYTES) {
          const sizeMB = (bytes.length / (1024 * 1024)).toFixed(1);
          const errMsg = `Arquivo muito grande (${sizeMB}MB). Máximo suportado: 18MB.`;
          await supabaseAdmin
            .from("case_documents")
            .update({ extraction_error: errMsg })
            .eq("id", doc.id);
          await logCall({
            law_firm_id: firmId,
            case_id: doc.case_id,
            call_type: "ocr_extract",
            model: modelForTask("ocr"),
            success: false,
            error_message: errMsg,
          });
          return json({ error: "file_too_large" }, 400);
        }

        const base64 = bytesToBase64(bytes);
        const mimeType = detectMime(doc.file_name ?? doc.file_path);

        try {
          const result = await callAiWithMedia({
            task: "ocr",
            prompt,
            mediaBase64: base64,
            mediaMimeType: mimeType,
            tools: [
              {
                type: "function",
                function: {
                  name: "extract_fields",
                  description: "Extract structured fields from the document",
                  parameters: schema,
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "extract_fields" } },
            temperature: 0,
            max_tokens: 2000,
          });

          const extracted = (result.toolArgs as Record<string, unknown>) ?? {};
          const cost = calcCostUsd(result.model, result.inputTokens, result.outputTokens);

          await supabaseAdmin
            .from("case_documents")
            .update({
              extracted_data: extracted as never,
              ocr_extracted_at: new Date().toISOString(),
              extraction_error: null,
            })
            .eq("id", doc.id);

          await logCall({
            law_firm_id: firmId,
            case_id: doc.case_id,
            call_type: "ocr_extract",
            model: result.model,
            input_tokens: result.inputTokens,
            output_tokens: result.outputTokens,
            cost_usd: cost,
            latency_ms: result.latencyMs,
            success: true,
          });

          return json({ extracted });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "unknown";
          const userMsg =
            msg === "AI_RATE_LIMITED"
              ? "Limite de requisições atingido. Tente novamente em instantes."
              : msg === "AI_PAYMENT_REQUIRED"
                ? "Créditos da IA esgotados. Adicione créditos para continuar."
                : "Falha ao extrair dados. Você pode tentar novamente ou preencher manualmente.";

          await supabaseAdmin
            .from("case_documents")
            .update({ extraction_error: userMsg })
            .eq("id", doc.id);

          await logCall({
            law_firm_id: firmId,
            case_id: doc.case_id,
            call_type: "ocr_extract",
            model: modelForTask("ocr"),
            success: false,
            error_message: msg,
          });
          if (msg === "AI_RATE_LIMITED") return json({ error: "rate_limited" }, 429);
          if (msg === "AI_PAYMENT_REQUIRED") return json({ error: "payment_required" }, 402);
          return json({ error: sanitizeAiError(msg, "extract-document") }, 500);
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
