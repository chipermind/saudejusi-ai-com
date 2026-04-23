// GET — descriptografa e devolve o artifact se pertence ao usuário.
// DELETE — soft delete + remove do storage (LGPD art. 18).

import { createFileRoute } from "@tanstack/react-router";
import {
  getAuthedUser,
  jsonResponse,
  corsPreflight,
} from "@/server/ai-endpoint-handler.server";
import { decryptArtifact } from "@/server/artifacts.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { DISCLAIMER_PADRAO } from "@/server/ai-schemas";

export const Route = createFileRoute("/api/ia/saudejusia/artifact/$id")({
  server: {
    handlers: {
      OPTIONS: () => corsPreflight(),

      GET: async ({ request, params }) => {
        const user = await getAuthedUser(request);
        if (!user) return jsonResponse({ error: "not_authenticated" }, 401);

        const id = params.id;
        if (!id) return jsonResponse({ error: "invalid_input" }, 400);

        const { data: meta, error } = await supabaseAdmin
          .from("ai_artifacts")
          .select("id, user_id, task, prompt_version, storage_path, created_at, expires_at, deleted_at")
          .eq("id", id)
          .maybeSingle();
        if (error) {
          console.error("[artifact GET] meta erro", error);
          return jsonResponse({ error: "internal_error" }, 500);
        }
        if (!meta || meta.deleted_at) {
          return jsonResponse({ error: "not_found" }, 404);
        }
        if (meta.user_id !== user.userId) {
          return jsonResponse({ error: "not_found" }, 404);
        }

        const { data: blobData, error: dlErr } = await supabaseAdmin.storage
          .from("case-artifacts")
          .download(meta.storage_path);
        if (dlErr || !blobData) {
          return jsonResponse({ error: "not_found" }, 404);
        }
        try {
          const buf = new Uint8Array(await blobData.arrayBuffer());
          const decrypted = await decryptArtifact(buf, id);
          return jsonResponse({
            artifact: {
              id: meta.id,
              task: meta.task,
              prompt_version: meta.prompt_version,
              created_at: meta.created_at,
              expires_at: meta.expires_at,
              ...decrypted,
            },
            disclaimer: DISCLAIMER_PADRAO,
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "unknown";
          if (msg === "ARTIFACT_ENCRYPTION_KEY_NOT_CONFIGURED") {
            return jsonResponse({ error: "encryption_not_configured" }, 503);
          }
          console.error("[artifact GET] decrypt erro", e);
          return jsonResponse({ error: "decrypt_failed" }, 500);
        }
      },

      DELETE: async ({ request, params }) => {
        const user = await getAuthedUser(request);
        if (!user) return jsonResponse({ error: "not_authenticated" }, 401);

        const id = params.id;
        if (!id) return jsonResponse({ error: "invalid_input" }, 400);

        const { data: meta } = await supabaseAdmin
          .from("ai_artifacts")
          .select("id, user_id, storage_path, deleted_at")
          .eq("id", id)
          .maybeSingle();
        if (!meta || meta.user_id !== user.userId) {
          return jsonResponse({ error: "not_found" }, 404);
        }
        if (meta.deleted_at) {
          return jsonResponse({ ok: true, already_deleted: true });
        }

        await supabaseAdmin.storage
          .from("case-artifacts")
          .remove([meta.storage_path]);
        const { error: updErr } = await supabaseAdmin
          .from("ai_artifacts")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id);
        if (updErr) {
          console.error("[artifact DELETE] update erro", updErr);
          return jsonResponse({ error: "internal_error" }, 500);
        }
        return jsonResponse({ ok: true });
      },
    },
  },
});
