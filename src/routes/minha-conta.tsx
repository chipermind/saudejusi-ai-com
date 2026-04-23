// Dashboard B2C SaudeJusia — stub. Conteúdo rico (lista de análises,
// abrir caso novo, etc.) vem na Fatia 2 da entrega.

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

interface ProfileLite {
  nome_completo: string;
  plan_tier: string;
}

export const Route = createFileRoute("/minha-conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — SaudeJusia" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MinhaContaPage,
});

function MinhaContaPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileLite | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate({ to: "/login" });
        return;
      }
      const { data: prof } = await supabase
        .from("profiles")
        .select("nome_completo, plan_tier")
        .eq("id", sess.session.user.id)
        .maybeSingle();
      if (!mounted) return;
      setProfile(
        prof ?? { nome_completo: "Usuário", plan_tier: "livre" },
      );
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-text-tertiary">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/">
            <Logo size="md" />
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-text-primary">
          Olá, {profile?.nome_completo?.split(" ")[0] ?? "tudo bem"}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Plano atual: <span className="font-medium">{profile?.plan_tier}</span>
        </p>

        <section className="mt-10 rounded-xl border border-border bg-surface p-8">
          <h2 className="text-lg font-medium text-text-primary">
            Em construção
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Esta é sua área pessoal. Em breve você poderá descrever seu caso,
            anexar documentos e receber uma análise informativa preliminar
            sobre seus direitos como beneficiário.
          </p>
          <p className="mt-4 text-sm text-text-tertiary">
            O motor de análise (classificação, extração, análise e geração de
            documentos) já está pronto no backend. A interface chega no próximo
            passo.
          </p>
        </section>
      </main>
    </div>
  );
}
