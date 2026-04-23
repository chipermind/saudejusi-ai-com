import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  handleAiRequest,
  corsPreflight,
} from "@/server/ai-endpoint-handler.server";
import { ClassifyOutputSchema } from "@/server/ai-schemas";
import { buildClassifyPrompt, PROMPT_VERSIONS } from "@/server/ai-prompts.server";

const InputSchema = z.object({
  texto_negativa: z.string().min(20).max(20_000),
});

export const Route = createFileRoute("/api/ia/saudejusia/classify")({
  server: {
    handlers: {
      OPTIONS: () => corsPreflight(),
      POST: ({ request }) =>
        handleAiRequest(request, {
          task: "classify",
          promptVersion: PROMPT_VERSIONS.classify,
          inputSchema: InputSchema,
          outputSchema: ClassifyOutputSchema,
          buildPrompt: (input) => {
            const built = buildClassifyPrompt(input.texto_negativa);
            return { system: built.system, user: built.user };
          },
        }),
    },
  },
});
