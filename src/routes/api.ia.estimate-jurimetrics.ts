import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { computeJurimetrics } from "@/server/jurimetrics-baseline.server";
import { assertActiveFirm } from "@/server/auth-firm.server";

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

export const Route = createFileRoute("/api/ia/estimate-jurimetrics")({
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

        const { case_id } = (await request.json().catch(() => ({}))) as { case_id?: string };
        if (!case_id) return json({ error: "case_id required" }, 400);

        const start = Date.now();
        const { data: c, error: cErr } = await sb
          .from("cases")
          .select(
            "id, denial_category, operadora, tribunal, denial_date, prescription_date, urgency, law_firm_id",
          )
          .eq("id", case_id)
          .single();
        if (cErr || !c) return json({ error: "case not found" }, 404);

        const { data: docs } = await sb
          .from("case_documents")
          .select("doc_type")
          .eq("case_id", case_id);
        const hasContract = (docs ?? []).some((d) => d.doc_type === "contrato_plano");

        const result = computeJurimetrics({
          category: c.denial_category,
          operadora: c.operadora,
          tribunal: c.tribunal,
          denialDate: c.denial_date,
          prescriptionDate: c.prescription_date,
          urgency: c.urgency,
          hasContract,
        });

        await supabaseAdmin
          .from("cases")
          .update({ jurimetrics: result as never })
          .eq("id", case_id);

        await supabaseAdmin.from("ai_calls_log").insert({
          law_firm_id: c.law_firm_id,
          case_id,
          call_type: "jurimetrics",
          model: "baseline-v1",
          input_tokens: 0,
          output_tokens: 0,
          cost_usd: 0,
          latency_ms: Date.now() - start,
          success: true,
        });

        return json({ jurimetrics: result });
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
