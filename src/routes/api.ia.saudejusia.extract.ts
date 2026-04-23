// Endpoint de extração de documentos. Aceita multipart com PDF ou imagem.
// Diferente dos demais, não usa o handler genérico porque precisa lidar com
// upload binário e usar o helper multimodal.

import { createFileRoute } from "@tanstack/react-router";
import { ExtractOutputSchema } from "@/server/ai-schemas";
import {
  callAiWithMedia,
  tryParseJson,
  calcCostUsd,
  type MediaMimeType,
} from "@/server/ai-gateway.server";
import {
  parseAndValidate,
  detectInjectionAttempt,
} from "@/server/ai-guardrails.server";
import {
  buildExtractPrompt,
  PROMPT_VERSIONS,
} from "@/server/ai-prompts.server";
import {
  getAuthedUser,
  jsonResponse,
  corsPreflight,
} from "@/server/ai-endpoint-handler.server";
import { checkAndIncrementRateLimit } from "@/server/ai-rate-limits.server";
import {
  encryptArtifact,
  isEncryptionConfigured,
} from "@/server/artifacts.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DISCLAIMER_PADRAO } from "@/server/ai-schemas";

const MAX_MB = 10;
const ALLOWED_MIMES: MediaMimeType[] = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
];

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)),
    );
  }
  return btoa(bin);
}

export const Route = createFileRoute("/api/ia/saudejusia/extract")({
  server: {
    handlers: {
      OPTIONS: () => corsPreflight(),
      POST: async ({ request }) => {
        const user = await getAuthedUser(request);
        if (!user) return jsonResponse({ error: "not_authenticated" }, 401);

        // Parse multipart
        let formData: FormData;
        try {
          formData = await request.formData();
        } catch {
          return jsonResponse(
            { error: "invalid_input", message: "Envie um arquivo válido." },
            400,
          );
        }

        const file = formData.get("file");
        if (!(file instanceof File)) {
          return jsonResponse(
            { error: "invalid_input", message: "Campo 'file' obrigatório." },
            400,
          );
        }

        if (file.size > MAX_MB * 1024 * 1024) {
          return jsonResponse(
            { error: "file_too_large", max_mb: MAX_MB },
            413,
          );
        }

        const mime = file.type as MediaMimeType;
        if (!ALLOWED_MIMES.includes(mime)) {
          return jsonResponse(
            {
              error: "invalid_input",
              message: "Formato não suportado. Use PDF, PNG, JPEG ou WebP.",
            },
            415,
          );
        }

        // Rate limit
        let rl;
        try {
          rl = await checkAndIncrementRateLimit(
            user.userId,
            user.planTier,
            "extract",
          );
        } catch (e) {
          console.error("[extract] rate limit erro", e);
          return jsonResponse({ error: "internal_error" }, 500);
        }
        if (!rl.allowed) {
          return jsonResponse(
            {
              error: "rate_limit_exceeded",
              retry_at: rl.resetAt.toISOString(),
              limit: rl.limit,
            },
            429,
          );
        }

        // Encode base64
        const buf = new Uint8Array(await file.arrayBuffer());
        const b64 = bytesToBase64(buf);

        // Build prompt — input é o nome do arquivo apenas (texto vai no media)
        const built = buildExtractPrompt(
          `Documento enviado: ${file.name}. Extraia os campos do documento anexado.`,
        );

        // Retry com temperatura decrescente
        const temps = [0.2, 0.1, 0.05];
        let validated: unknown = null;
        let retriesUsed = 0;
        let lastModel = "";
        let inTok = 0;
        let outTok = 0;
        let totalLatency = 0;

        for (let i = 0; i < temps.length; i++) {
          try {
            const result = await callAiWithMedia({
              task: "ocr",
              prompt: built.user,
              system: built.system,
              mediaBase64: b64,
              mediaMimeType: mime,
              temperature: temps[i],
              max_tokens: 3000,
            });
            lastModel = result.model;
            inTok += result.inputTokens;
            outTok += result.outputTokens;
            totalLatency += result.latencyMs;

            const parsed = tryParseJson<unknown>(result.text);
            if (!parsed) {
              retriesUsed = i + 1;
              continue;
            }
            const valid = parseAndValidate(parsed, ExtractOutputSchema);
            if (!valid.ok || !valid.data) {
              retriesUsed = i + 1;
              continue;
            }
            validated = valid.data;
            retriesUsed = i;
            break;
          } catch (e) {
            const msg = e instanceof Error ? e.message : "unknown";
            if (msg === "AI_RATE_LIMITED") {
              return jsonResponse(
                {
                  error: "ai_unavailable",
                  message: "Serviço sobrecarregado, tente em alguns minutos.",
                },
                429,
              );
            }
            retriesUsed = i + 1;
            console.error(`[extract] tentativa ${i + 1} falhou`, msg);
          }
        }

        const promptVersion = PROMPT_VERSIONS.extract;

        if (!validated) {
          await supabaseAdmin
            .from("ai_prompt_runs")
            .insert({
              task: "extract",
              prompt_version: promptVersion,
              user_id: user.userId,
              validation_passed: false,
              injection_attempted: false,
              retries_used: retriesUsed,
              retry_count: retriesUsed,
              fora_de_escopo: false,
              confianca: null,
              model: lastModel,
              tokens_in: inTok,
              tokens_out: outTok,
              cost_usd: calcCostUsd(lastModel, inTok, outTok),
              latency_ms: totalLatency,
            })
            .then(() => undefined, () => undefined);
          return jsonResponse(
            {
              error: "validation_failed",
              message:
                "Não conseguimos interpretar este documento. Tente uma foto mais nítida ou outro arquivo.",
            },
            422,
          );
        }

        // Detectar injection no output (texto extraído pode conter ataque)
        const injectionAttempted = detectInjectionAttempt(JSON.stringify(validated));

        // Persistir artifact criptografado — só output, não input binário
        let artifactId: string | null = null;
        let artifactWarning: string | null = null;

        if (isEncryptionConfigured()) {
          artifactId = crypto.randomUUID();
          const expiresAt = new Date();
          expiresAt.setDate(
            expiresAt.getDate() + (user.planTier === "livre" ? 30 : 180),
          );
          const storagePath = `${user.userId}/${artifactId}.enc`;
          try {
            const blob = await encryptArtifact(
              {
                artifact_id: artifactId,
                user_id: user.userId,
                task: "extract",
                prompt_version: promptVersion,
                created_at: new Date().toISOString(),
                input: { file_name: file.name, file_size: file.size, mime },
                output: validated,
              },
              artifactId,
            );
            const { error: upErr } = await supabaseAdmin.storage
              .from("case-artifacts")
              .upload(storagePath, blob, {
                contentType: "application/octet-stream",
                upsert: false,
              });
            if (upErr) {
              artifactWarning = "storage_upload_failed";
              artifactId = null;
            } else {
              const { error: insErr } = await supabaseAdmin
                .from("ai_artifacts")
                .insert({
                  id: artifactId,
                  user_id: user.userId,
                  task: "extract",
                  prompt_version: promptVersion,
                  storage_path: storagePath,
                  expires_at: expiresAt.toISOString(),
                });
              if (insErr) {
                await supabaseAdmin.storage
                  .from("case-artifacts")
                  .remove([storagePath]);
                artifactWarning = "metadata_insert_failed";
                artifactId = null;
              }
            }
          } catch (e) {
            console.error("[extract] persistência erro", e);
            artifactWarning = "persistence_error";
            artifactId = null;
          }
        } else {
          artifactWarning = "encryption_not_configured";
        }

        const outAsRecord = validated as Record<string, unknown>;
        await supabaseAdmin
          .from("ai_prompt_runs")
          .insert({
            task: "extract",
            prompt_version: promptVersion,
            user_id: user.userId,
            validation_passed: true,
            injection_attempted: injectionAttempted,
            retries_used: retriesUsed,
            retry_count: retriesUsed,
            fora_de_escopo: outAsRecord.fora_de_escopo === true,
            confianca:
              typeof outAsRecord.confianca === "string"
                ? outAsRecord.confianca
                : null,
            model: lastModel,
            tokens_in: inTok,
            tokens_out: outTok,
            cost_usd: calcCostUsd(lastModel, inTok, outTok),
            latency_ms: totalLatency,
          })
          .then(() => undefined, () => undefined);

        return jsonResponse({
          analysis: validated,
          disclaimer: DISCLAIMER_PADRAO,
          artifact_id: artifactId,
          artifact_warning: artifactWarning,
        });
      },
    },
  },
});
