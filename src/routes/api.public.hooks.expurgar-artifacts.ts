// Endpoint de expurgo automático de artifacts expirados.
// Autenticação por header X-Cron-Secret (constant-time compare).
// Pensado para ser chamado por pg_cron + pg_net OU cron externo.

import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute(
  "/api/public/hooks/expurgar-artifacts",
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.CRON_SECRET ?? "";
        if (!expected) {
          return json({ error: "cron_not_configured" }, 503);
        }
        const provided = request.headers.get("X-Cron-Secret") ?? "";
        if (!timingSafeEqual(provided, expected)) {
          return json({ error: "forbidden" }, 403);
        }

        const { data: expirados, error } = await supabaseAdmin
          .from("ai_artifacts")
          .select("id, storage_path")
          .lt("expires_at", new Date().toISOString())
          .is("deleted_at", null)
          .limit(500);

        if (error) {
          console.error("[expurgo] query erro", error);
          return json({ error: "query_failed" }, 500);
        }

        let deletadosOk = 0;
        let falhasStorage = 0;
        const falhasIds: string[] = [];

        for (const row of expirados ?? []) {
          const { error: storageErr } = await supabaseAdmin.storage
            .from("case-artifacts")
            .remove([row.storage_path]);

          if (storageErr) {
            falhasStorage++;
            falhasIds.push(row.id);
            console.error(`[expurgo] storage falha ${row.id}`, storageErr.message);
            continue;
          }

          const { error: updErr } = await supabaseAdmin
            .from("ai_artifacts")
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", row.id);

          if (updErr) {
            falhasIds.push(row.id);
            console.error(`[expurgo] update falha ${row.id}`, updErr.message);
            continue;
          }

          deletadosOk++;
        }

        const summary = {
          total_candidatos: expirados?.length ?? 0,
          deletados: deletadosOk,
          falhas: falhasStorage,
          falhas_ids: falhasIds,
          at: new Date().toISOString(),
        };
        console.log("[expurgo] resumo", JSON.stringify(summary));
        return json(summary);
      },
    },
  },
});
