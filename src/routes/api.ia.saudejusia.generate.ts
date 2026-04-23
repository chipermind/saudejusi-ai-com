import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  handleAiRequest,
  corsPreflight,
} from "@/server/ai-endpoint-handler.server";
import { GenerateOutputSchema, TipoPecaSchema } from "@/server/ai-schemas";
import { buildGeneratePrompt, PROMPT_VERSIONS } from "@/server/ai-prompts.server";

const InputSchema = z.object({
  tipo_peca: TipoPecaSchema,
  contexto: z.record(z.string(), z.unknown()),
});

export const Route = createFileRoute("/api/ia/saudejusia/generate")({
  server: {
    handlers: {
      OPTIONS: () => corsPreflight(),
      POST: ({ request }) =>
        handleAiRequest(request, {
          task: "generate",
          promptVersion: PROMPT_VERSIONS.generate,
          inputSchema: InputSchema,
          outputSchema: GenerateOutputSchema,
          buildPrompt: (input) => {
            const ctxText = `CONTEXTO DO CASO (em JSON):\n${JSON.stringify(input.contexto, null, 2)}`;
            const built = buildGeneratePrompt({
              tipoPeca: input.tipo_peca,
              rawUserInput: ctxText,
            });
            return { system: built.system, user: built.user };
          },
        }),
    },
  },
});
