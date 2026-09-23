import { describe, it, expect, vi, beforeEach } from "vitest";

const maybeSingle = vi.fn();
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
  },
}));

import { assertActiveFirm, evaluateFirmPlan } from "../auth-firm.server";

const NOW = Date.parse("2026-09-23T12:00:00Z");
const future = "2026-10-01T00:00:00Z";
const past = "2026-09-01T00:00:00Z";

describe("evaluateFirmPlan (fail-closed allowlist)", () => {
  it("trial sem data => block", () => {
    expect(evaluateFirmPlan("trial", null, NOW)).toMatchObject({ ok: false, status: 402 });
  });
  it("trial data inválida => block", () => {
    expect(evaluateFirmPlan("trial", "not-a-date", NOW)).toMatchObject({ ok: false, status: 402 });
  });
  it("trial expirada => block", () => {
    expect(evaluateFirmPlan("trial", past, NOW)).toMatchObject({ ok: false, status: 402 });
  });
  it("trial exatamente agora => block", () => {
    expect(evaluateFirmPlan("trial", new Date(NOW).toISOString(), NOW)).toMatchObject({ ok: false });
  });
  it("trial futura => allow", () => {
    expect(evaluateFirmPlan("trial", future, NOW)).toEqual({ ok: true });
  });
  it.each(["solo", "escritorio", "enterprise"])("%s => allow", (p) => {
    expect(evaluateFirmPlan(p, null, NOW)).toEqual({ ok: true });
  });
  it.each([null, undefined, "", "suspended", "cancelled", "expired", "SOLO", "free"])(
    "%s => block",
    (p) => {
      expect(evaluateFirmPlan(p as string | null | undefined, future, NOW)).toEqual({
        ok: false,
        status: 402,
        error: "subscription_required",
      });
    },
  );
});

describe("assertActiveFirm", () => {
  beforeEach(() => maybeSingle.mockReset());

  it("sem membership => 403", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await assertActiveFirm("u1")).toEqual({ ok: false, status: 403, error: "no_firm_membership" });
  });
  it("plan null => 402", async () => {
    maybeSingle.mockResolvedValue({
      data: { law_firm_id: "f1", law_firms: { plan: null, trial_ends_at: future } },
      error: null,
    });
    expect(await assertActiveFirm("u1")).toMatchObject({ ok: false, status: 402 });
  });
  it("solo => ok com lawFirmId", async () => {
    maybeSingle.mockResolvedValue({
      data: { law_firm_id: "f1", law_firms: { plan: "solo", trial_ends_at: null } },
      error: null,
    });
    expect(await assertActiveFirm("u1")).toMatchObject({ ok: true, lawFirmId: "f1" });
  });
});
