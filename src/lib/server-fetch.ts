// Helper to call server routes with the current user's auth token.
import { supabase } from "@/integrations/supabase/client";

export async function authedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...init, headers });
}

export async function authedJson<T = unknown>(url: string, body: unknown): Promise<T> {
  const res = await authedFetch(url, { method: "POST", body: JSON.stringify(body) });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}
