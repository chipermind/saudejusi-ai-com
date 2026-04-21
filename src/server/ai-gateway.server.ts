// Lovable AI Gateway helpers — SERVER ONLY.
// Do not import from client code.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type AiModel =
  | "google/gemini-2.5-pro"
  | "google/gemini-2.5-flash"
  | "google/gemini-2.5-flash-lite"
  | "google/gemini-3-flash-preview";

export interface ChatContent {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      >;
}

export interface AiCallParams {
  model: AiModel;
  messages: ChatContent[];
  max_tokens?: number;
  temperature?: number;
  // Tool calling (used for structured JSON output)
  tools?: Array<{
    type: "function";
    function: {
      name: string;
      description?: string;
      parameters: Record<string, unknown>;
    };
  }>;
  tool_choice?: { type: "function"; function: { name: string } };
}

export interface AiResult {
  text: string;
  toolArgs: unknown | null;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  model: string;
}

// Approx pricing per 1M tokens (USD). Update as needed.
const PRICING: Record<string, { input: number; output: number }> = {
  "google/gemini-2.5-pro": { input: 1.25, output: 5.0 },
  "google/gemini-2.5-flash": { input: 0.3, output: 2.5 },
  "google/gemini-2.5-flash-lite": { input: 0.1, output: 0.4 },
  "google/gemini-3-flash-preview": { input: 0.3, output: 2.5 },
};

export function calcCostUsd(model: string, inTok: number, outTok: number): number {
  const p = PRICING[model] ?? PRICING["google/gemini-2.5-flash"];
  return (inTok * p.input + outTok * p.output) / 1_000_000;
}

export async function callAi(params: AiCallParams): Promise<AiResult> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

  const start = Date.now();
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      max_tokens: params.max_tokens ?? 2000,
      temperature: params.temperature ?? 0.2,
      tools: params.tools,
      tool_choice: params.tool_choice,
    }),
  });

  const latencyMs = Date.now() - start;

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("AI_RATE_LIMITED");
    if (res.status === 402) throw new Error("AI_PAYMENT_REQUIRED");
    throw new Error(`AI_GATEWAY_${res.status}: ${text}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  const msg = choice?.message ?? {};
  let toolArgs: unknown | null = null;
  if (msg.tool_calls?.[0]?.function?.arguments) {
    try {
      toolArgs = JSON.parse(msg.tool_calls[0].function.arguments);
    } catch {
      toolArgs = null;
    }
  }
  const text: string = msg.content ?? "";
  return {
    text,
    toolArgs,
    inputTokens: data.usage?.prompt_tokens ?? 0,
    outputTokens: data.usage?.completion_tokens ?? 0,
    latencyMs,
    model: data.model ?? params.model,
  };
}

export function tryParseJson<T = unknown>(s: string): T | null {
  if (!s) return null;
  const cleaned = s.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Try to find first {...} block
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
