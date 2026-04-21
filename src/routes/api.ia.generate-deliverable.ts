import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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

const TITLES: Record<string, string> = {
  parecer: "Parecer técnico-jurídico",
  recurso_ans: "Recurso administrativo (NIP/ANS)",
  notificacao_extrajudicial: "Notificação extrajudicial",
  peticao_inicial: "Petição inicial com tutela de urgência",
};

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

        const { deliverable_id } = (await request.json().catch(() => ({}))) as {
          deliverable_id?: string;
        };
        if (!deliverable_id) return json({ error: "deliverable_id required" }, 400);

        // RLS check
        const { data: del, error } = await sb
          .from("case_deliverables")
          .select("id, case_id, deliverable_type")
          .eq("id", deliverable_id)
          .single();
        if (error || !del) return json({ error: "not found" }, 404);

        await supabaseAdmin
          .from("case_deliverables")
          .update({ status: "generating" })
          .eq("id", del.id);

        // Simulate generation delay (3-7s) — fire and forget pattern not ideal in workers,
        // so we await but keep it short.
        const delay = 3000 + Math.floor(Math.random() * 4000);
        await new Promise((r) => setTimeout(r, delay));

        const title = TITLES[del.deliverable_type ?? ""] ?? "Documento";
        const placeholder = `[PLACEHOLDER] ${title} — caso #${del.case_id}\n\nEste é um conteúdo provisório. A geração real dos deliverables jurídicos será implementada na próxima sprint, com prompts especializados e formatação .docx.\n\nGerado em ${new Date().toLocaleString("pt-BR")}.`;

        await supabaseAdmin
          .from("case_deliverables")
          .update({
            status: "ready",
            content: placeholder,
            generated_by_model: "stub-v1",
            generated_at: new Date().toISOString(),
          })
          .eq("id", del.id);

        return json({ ok: true });
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
