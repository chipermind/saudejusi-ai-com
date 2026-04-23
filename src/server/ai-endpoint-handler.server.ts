// ─── Handler comum dos 4 endpoints de IA SaudeJusia ───────────────────────
// Server-only. Auth → rate limit → IA → validação Zod com retry → persistir
// artifact criptografado → telemetria → resposta padronizada.

import type { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  callAiTask,
  tryParseJson,
  calcCostUsd,
} from "@/server/ai-gateway.server";
import {
  detectInjectionAttempt,
  parseAndValidate,
} from "@/server/ai-guardrails.server";
import {
  checkAndIncrementRateLimit,
  type AiTask,
  type PlanTier,
} from "@/server/ai-rate-limits.server";
import {
  encryptArtifact,
  isEncryptionConfigured,
} from "@/server/artifacts.server";
import { DISCLAIMER_PADRAO } from "@/server/ai-schemas";

// ─── Helpers HTTP ──────────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// ─── Auth helper ───────────────────────────────────────────────────────────

interface AuthedUser {
  userId: string;
  planTier: PlanTier;
  nomeCompleto: string;
}

export async function getAuthedUser(req: Request): Promise<AuthedUser | null> {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  const sb = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );

  const { data: claimsData, error: claimsErr } = await sb.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims?.sub) return null;
  const userId = claimsData.claims.sub;

  // Profile para plan_tier
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("plan_tier, nome_completo")
    .eq("id", userId)
    .maybeSingle();

  const planTier = (profile?.plan_tier as PlanTier | undefined) ?? "livre";
  return {
    userId,
    planTier,
    nomeCompleto: profile?.nome_completo ?? "Usuário",
  };
}

// ─── Telemetria ────────────────────────────────────────────────────────────

interface TelemetryArgs {
  userId: string;
  task: AiTask;
  promptVersion: string;
  validationPassed: boolean;
  injectionAttempted: boolean;
  retriesUsed: number;
  foraDeEscopo: boolean;
  confianca: string | null;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
}

async function logTelemetry(args: TelemetryArgs): Promise<void> {
  try {
    await supabaseAdmin.from("ai_prompt_runs").insert({
      task: args.task,
      prompt_version: args.promptVersion,
      user_id: args.userId,
      validation_passed: args.validationPassed,
      injection_attempted: args.injectionAttempted,
      retries_used: args.retriesUsed,
      retry_count: args.retriesUsed,
      fora_de_escopo: args.foraDeEscopo,
      confianca: args.confianca,
      model: args.model,
      tokens_in: args.inputTokens,
      tokens_out: args.outputTokens,
      cost_usd: args.costUsd,
      latency_ms: args.latencyMs,
    });
  } catch {
    // Telemetria nunca derruba o request
  }
}

// ─── Persistência criptografada do artifact ────────────────────────────────

async function persistArtifact(args: {
  userId: string;
  task: AiTask;
  promptVersion: string;
  planTier: PlanTier;
  input: unknown;
  output: unknown;
}): Promise<{ artifactId: string | null; warning: string | null }> {
  if (!isEncryptionConfigured()) {
    return {
      artifactId: null,
      warning: "encryption_not_configured",
    };
  }

  const artifactId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(
    expiresAt.getDate() + (args.planTier === "livre" ? 30 : 180),
  );
  const storagePath = `${args.userId}/${artifactId}.enc`;

  try {
    const blob = await encryptArtifact(
      {
        artifact_id: artifactId,
        user_id: args.userId,
        task: args.task,
        prompt_version: args.promptVersion,
        created_at: new Date().toISOString(),
        input: args.input,
        output: args.output,
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
      console.error("[artifacts] upload falhou", upErr.message);
      return { artifactId: null, warning: "storage_upload_failed" };
    }

    const { error: insErr } = await supabaseAdmin.from("ai_artifacts").insert({
      id: artifactId,
      user_id: args.userId,
      task: args.task,
      prompt_version: args.promptVersion,
      storage_path: storagePath,
      expires_at: expiresAt.toISOString(),
    });
    if (insErr) {
      console.error("[artifacts] insert metadata falhou", insErr.message);
      // Tentar limpar storage para não deixar órfão
      await supabaseAdmin.storage.from("case-artifacts").remove([storagePath]);
      return { artifactId: null, warning: "metadata_insert_failed" };
    }

    return { artifactId, warning: null };
  } catch (e) {
    console.error("[artifacts] erro inesperado", e);
    return { artifactId: null, warning: "persistence_error" };
  }
}

// ─── Handler genérico ──────────────────────────────────────────────────────

export interface AiHandlerOptions<TInput, TOutput> {
  task: AiTask;
  promptVersion: string;
  inputSchema: z.ZodType<TInput>;
  outputSchema: z.ZodType<TOutput>;
  buildPrompt: (input: TInput) => { system: string; user: string };
}

export async function handleAiRequest<TInput, TOutput>(
  req: Request,
  opts: AiHandlerOptions<TInput, TOutput>,
): Promise<Response> {
  // 1. Auth
  const user = await getAuthedUser(req);
  if (!user) return jsonResponse({ error: "not_authenticated" }, 401);

  // 2. Body parse
  let bodyJson: unknown;
  try {
    bodyJson = await req.json();
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  const inputParse = opts.inputSchema.safeParse(bodyJson);
  if (!inputParse.success) {
    return jsonResponse(
      {
        error: "invalid_input",
        message: "Os dados enviados não estão no formato esperado.",
      },
      400,
    );
  }
  const input = inputParse.data;

  // 3. Rate limit
  let rl;
  try {
    rl = await checkAndIncrementRateLimit(user.userId, user.planTier, opts.task);
  } catch (e) {
    console.error("[rate-limit] erro", e);
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

  // 4. Detectar injection (não bloqueia)
  const flatInput = JSON.stringify(input);
  const injectionAttempted = detectInjectionAttempt(flatInput);

  // 5. Build prompt
  const built = opts.buildPrompt(input);

  // 6. Chamada IA com retry decrescente
  const temps = [0.2, 0.1, 0.05];
  let validatedOutput: TOutput | null = null;
  let retriesUsed = 0;
  let lastModel = "";
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalLatencyMs = 0;

  for (let i = 0; i < temps.length; i++) {
    try {
      const result = await callAiTask({
        task: opts.task === "extract" ? "ocr" : opts.task === "generate" ? "generation" : "reasoning",
        messages: [
          { role: "system", content: built.system },
          { role: "user", content: built.user },
        ],
        temperature: temps[i],
        max_tokens: opts.task === "generate" ? 4000 : 2500,
      });

      lastModel = result.model;
      totalInputTokens += result.inputTokens;
      totalOutputTokens += result.outputTokens;
      totalLatencyMs += result.latencyMs;

      const parsed = tryParseJson<unknown>(result.text);
      if (!parsed) {
        retriesUsed = i + 1;
        continue;
      }

      const valid = parseAndValidate(parsed, opts.outputSchema);
      if (!valid.ok || !valid.data) {
        retriesUsed = i + 1;
        continue;
      }

      validatedOutput = valid.data;
      retriesUsed = i;
      break;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      if (msg === "AI_RATE_LIMITED") {
        await logTelemetry({
          userId: user.userId,
          task: opts.task,
          promptVersion: opts.promptVersion,
          validationPassed: false,
          injectionAttempted,
          retriesUsed: i,
          foraDeEscopo: false,
          confianca: null,
          model: lastModel,
          inputTokens: totalInputTokens,
          outputTokens: totalOutputTokens,
          costUsd: calcCostUsd(lastModel, totalInputTokens, totalOutputTokens),
          latencyMs: totalLatencyMs,
        });
        return jsonResponse({ error: "ai_unavailable", message: "Serviço sobrecarregado, tente em alguns minutos." }, 429);
      }
      if (msg === "AI_PAYMENT_REQUIRED") {
        return jsonResponse({ error: "ai_unavailable", message: "Serviço temporariamente indisponível." }, 503);
      }
      retriesUsed = i + 1;
      console.error(`[ai-handler] tentativa ${i + 1} falhou`, msg);
    }
  }

  if (!validatedOutput) {
    await logTelemetry({
      userId: user.userId,
      task: opts.task,
      promptVersion: opts.promptVersion,
      validationPassed: false,
      injectionAttempted,
      retriesUsed,
      foraDeEscopo: false,
      confianca: null,
      model: lastModel,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      costUsd: calcCostUsd(lastModel, totalInputTokens, totalOutputTokens),
      latencyMs: totalLatencyMs,
    });
    return jsonResponse(
      {
        error: "validation_failed",
        message:
          "Não conseguimos interpretar o caso. Tente reescrever com mais detalhes.",
      },
      422,
    );
  }

  // 7. Persistir artifact
  const outputAsRecord = validatedOutput as unknown as Record<string, unknown>;
  const foraDeEscopo = outputAsRecord.fora_de_escopo === true;
  const confianca =
    typeof outputAsRecord.confianca === "string" ? outputAsRecord.confianca : null;

  const persisted = await persistArtifact({
    userId: user.userId,
    task: opts.task,
    promptVersion: opts.promptVersion,
    planTier: user.planTier,
    input,
    output: validatedOutput,
  });

  // 8. Telemetria sucesso
  await logTelemetry({
    userId: user.userId,
    task: opts.task,
    promptVersion: opts.promptVersion,
    validationPassed: true,
    injectionAttempted,
    retriesUsed,
    foraDeEscopo,
    confianca,
    model: lastModel,
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
    costUsd: calcCostUsd(lastModel, totalInputTokens, totalOutputTokens),
    latencyMs: totalLatencyMs,
  });

  // 9. Resposta
  return jsonResponse({
    analysis: validatedOutput,
    disclaimer: DISCLAIMER_PADRAO,
    artifact_id: persisted.artifactId,
    artifact_warning: persisted.warning,
  });
}
