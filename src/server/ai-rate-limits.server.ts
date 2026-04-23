// ─── Rate limit diário do motor SaudeJusia ────────────────────────────────
// Server-only. Limites hardcoded; banco apenas conta.
// Reset diário à meia-noite BRT (03:00 UTC).

import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AiTask = "classify" | "extract" | "analyze" | "generate";
export type PlanTier = "livre" | "essencial" | "familia";

export const DAILY_LIMITS: Record<PlanTier, Record<AiTask, number>> = {
  livre: { classify: 3, extract: 2, analyze: 2, generate: 1 },
  essencial: { classify: 50, extract: 50, analyze: 50, generate: 50 },
  familia: { classify: 100, extract: 100, analyze: 100, generate: 100 },
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
}

function nextResetUtc(): Date {
  // Meia-noite BRT = 03:00 UTC do próximo dia (ou hoje se ainda não passou)
  const now = new Date();
  const reset = new Date(now);
  reset.setUTCHours(3, 0, 0, 0);
  if (reset <= now) reset.setUTCDate(reset.getUTCDate() + 1);
  return reset;
}

export async function checkAndIncrementRateLimit(
  userId: string,
  planTier: PlanTier,
  task: AiTask,
): Promise<RateLimitResult> {
  const limit = DAILY_LIMITS[planTier][task];
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabaseAdmin.rpc("increment_rate_limit", {
    p_user_id: userId,
    p_task: task,
    p_day: today,
    p_limit: limit,
  });

  if (error) throw new Error(`RATE_LIMIT_RPC_FAILED: ${error.message}`);

  // RPC retorna SETOF — pegamos primeira linha
  const row = Array.isArray(data) ? data[0] : data;
  const allowed = row?.allowed === true;
  const newCount = typeof row?.new_count === "number" ? row.new_count : limit + 1;

  return {
    allowed,
    remaining: Math.max(0, limit - newCount),
    resetAt: nextResetUtc(),
    limit,
  };
}
