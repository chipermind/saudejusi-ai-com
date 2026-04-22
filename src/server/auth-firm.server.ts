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

  // Trial plan must be within the trial window
  if (plan === "trial") {
    if (!trialEndsAt) {
      return { ok: false, status: 402, error: "subscription_required" };
    }
    if (new Date(trialEndsAt).getTime() < Date.now()) {
      return { ok: false, status: 402, error: "subscription_required" };
    }
  }

  // Explicit suspension states block access
  if (plan === "suspended" || plan === "cancelled" || plan === "expired") {
    return { ok: false, status: 402, error: "subscription_required" };
  }

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
