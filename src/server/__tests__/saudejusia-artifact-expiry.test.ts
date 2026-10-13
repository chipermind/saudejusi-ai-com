import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks determinísticos: nenhum banco, storage ou chave real é tocado.
const state: {
  user: { userId: string } | null;
  meta: Record<string, unknown> | null;
  downloads: number;
} = { user: null, meta: null, downloads: 0 };

vi.mock("@/server/ai-endpoint-handler.server", () => ({
  getAuthedUser: async () => state.user,
  jsonResponse: (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status }),
  corsPreflight: () => new Response(null, { status: 204 }),
}));

vi.mock("@/server/artifacts.server", () => ({
  decryptArtifact: async () => ({ output: { ok: true } }),
}));

vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: state.meta, error: null }),
        }),
      }),
    }),
    storage: {
      from: () => ({
        download: async () => {
          state.downloads++;
          return { data: new Blob([new Uint8Array([1])]), error: null };
        },
      }),
    },
  },
}));

const { Route } = await import("@/routes/api.ia.saudejusia.artifact.$id");
type GetHandler = (a: { request: Request; params: { id: string } }) => Promise<Response>;
const GET = (Route.options as unknown as { server: { handlers: { GET: GetHandler } } })
  .server.handlers.GET;

const OWNER = "11111111-1111-1111-1111-111111111111";
const call = () =>
  GET({ request: new Request("http://x/"), params: { id: "a1" } });
const meta = (expires_at: unknown, user_id = OWNER) => ({
  id: "a1",
  user_id,
  task: "analyze",
  prompt_version: "v",
  storage_path: `${OWNER}/a1.enc`,
  created_at: "2026-01-01T00:00:00Z",
  expires_at,
  deleted_at: null,
});

describe("GET artifact: retenção fail-closed e autorização", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-13T12:00:00.000Z"));
    state.user = { userId: OWNER };
    state.downloads = 0;
  });

  it("expirado no limite exato (expires_at == agora) => 404 sem download", async () => {
    state.meta = meta("2026-10-13T12:00:00.000Z");
    expect((await call()).status).toBe(404);
    expect(state.downloads).toBe(0);
  });

  it("expirado no passado => 404", async () => {
    state.meta = meta("2026-10-13T11:59:59.999Z");
    expect((await call()).status).toBe(404);
    expect(state.downloads).toBe(0);
  });

  it.each(["", "not-a-date", null])("expires_at malformado (%s) => 404", async (v) => {
    state.meta = meta(v);
    expect((await call()).status).toBe(404);
    expect(state.downloads).toBe(0);
  });

  it("expiração futura válida (1ms) => 200 com artifact", async () => {
    state.meta = meta("2026-10-13T12:00:00.001Z");
    const res = await call();
    expect(res.status).toBe(200);
    const body = (await res.json()) as { artifact: { id: string } };
    expect(body.artifact.id).toBe("a1");
    expect(state.downloads).toBe(1);
  });

  it("outro usuário => 404 sem download", async () => {
    state.meta = meta("2027-01-01T00:00:00Z", "22222222-2222-2222-2222-222222222222");
    expect((await call()).status).toBe(404);
    expect(state.downloads).toBe(0);
  });

  it("sem sessão => 401", async () => {
    state.user = null;
    state.meta = meta("2027-01-01T00:00:00Z");
    expect((await call()).status).toBe(401);
  });
});
