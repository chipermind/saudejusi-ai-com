// Shared authorization helpers for AI routes.
// - assertActiveFirm() validates that the caller's law firm has an active plan
//   (paid plan, or trial that hasn't expired).
// - sanitizeError() returns a safe error message + logs the raw error server-side.

import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AssertFirmOk = {
  ok: true;
  lawFirmId: string;
  plan: string | null;
  trialEndsAt: string | null;
};
export type AssertFirmFail = { ok: false; status: number; error: string };

/** Paid plans that grant access without a trial window. Explicit allowlist. */
export const PAID_FIRM_PLANS: readonly string[] = ["solo", "escritorio", "enterprise"];

const SUBSCRIPTION_REQUIRED: AssertFirmFail = {
  ok: false,
  status: 402,
  error: "subscription_required",
};

/**
 * Pure, fail-closed plan evaluation. Anything not explicitly allowed is blocked.
 */
export function evaluateFirmPlan(
  plan: string | null | undefined,
  trialEndsAt: string | null | undefined,
  nowMs: number = Date.now(),
): { ok: true } | AssertFirmFail {
  if (plan === "trial") {
    if (!trialEndsAt) return SUBSCRIPTION_REQUIRED;
    const endMs = new Date(trialEndsAt).getTime();
    if (!Number.isFinite(endMs) || endMs <= nowMs) return SUBSCRIPTION_REQUIRED;
    return { ok: true };
  }
  if (typeof plan === "string" && PAID_FIRM_PLANS.includes(plan)) {
    return { ok: true };
  }
  return SUBSCRIPTION_REQUIRED;
}

export async function assertActiveFirm(userId: string): Promise<AssertFirmOk | AssertFirmFail> {
  const { data: lawyer, error } = await supabaseAdmin
    .from("lawyers")
    .select("law_firm_id, law_firms(plan, trial_ends_at)")
    .eq("id", userId)
    .maybeSingle();

  if (error || !lawyer?.law_firm_id) {
    return { ok: false, status: 403, error: "no_firm_membership" };
  }

  const firm = (lawyer as unknown as {
    law_firms?: { plan: string | null; trial_ends_at: string | null } | null;
  }).law_firms ?? null;

  const plan = firm?.plan ?? null;
  const trialEndsAt = firm?.trial_ends_at ?? null;

  const verdict = evaluateFirmPlan(plan, trialEndsAt);
  if (!verdict.ok) return verdict;

  return {
    ok: true,
    lawFirmId: lawyer.law_firm_id,
    plan,
    trialEndsAt,
  };
}

// Generic public-facing message for unhandled errors. Always log the original
// message server-side via console.error — never return raw internal details.
export function sanitizeAiError(rawMessage: string, scope: string): string {
  console.error(`[ai:${scope}] ${rawMessage}`);
  return "AI service temporarily unavailable";
}
