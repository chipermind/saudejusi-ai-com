import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  handleAiRequest,
  corsPreflight,
} from "@/server/ai-endpoint-handler.server";
import { AnalyzeOutputSchema } from "@/server/ai-schemas";
import { buildAnalyzePrompt, PROMPT_VERSIONS } from "@/server/ai-prompts.server";

const InputSchema = z.object({
  descricao_caso: z.string().min(20).max(20_000),
  documentos_extraidos: z.array(z.unknown()).max(10).optional(),
});

export const Route = createFileRoute("/api/ia/saudejusia/analyze")({
  server: {
    handlers: {
      OPTIONS: () => corsPreflight(),
      POST: ({ request }) =>
        handleAiRequest(request, {
          task: "analyze",
          promptVersion: PROMPT_VERSIONS.analyze,
          inputSchema: InputSchema,
          outputSchema: AnalyzeOutputSchema,
          buildPrompt: (input) => {
            const docsBlock =
              input.documentos_extraidos && input.documentos_extraidos.length > 0
                ? `\n\nDOCUMENTOS EXTRAÍDOS (em JSON):\n${JSON.stringify(input.documentos_extraidos)}`
                : "";
            const built = buildAnalyzePrompt(input.descricao_caso + docsBlock);
            return { system: built.system, user: built.user };
          },
        }),
    },
  },
});
