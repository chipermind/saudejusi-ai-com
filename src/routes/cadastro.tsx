import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — SaudeJusia" },
      {
        name: "description",
        content:
          "Crie sua conta gratuita na SaudeJusia para entender melhor seus direitos como beneficiário de plano de saúde.",
      },
    ],
  }),
  component: CadastroPage,
});

function CadastroPage() {
  const navigate = useNavigate();
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome_completo: nomeCompleto },
        emailRedirectTo: `${window.location.origin}/minha-conta`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/confirmar-email" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-[420px]">
        <Link to="/" className="mb-10 flex justify-center">
          <Logo size="lg" />
        </Link>

        <div className="rounded-xl border border-border bg-surface p-8">
          <h1 className="text-xl font-semibold text-text-primary">Criar conta</h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Conta gratuita. Comece em menos de 1 minuto.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                type="text"
                autoComplete="name"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha (mínimo 8 caracteres)</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-text-secondary">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary hover:text-primary-hover">
              Entrar
            </Link>
          </p>
        </div>

        <p className="mt-6 px-2 text-center text-xs text-text-tertiary">
          Ao criar conta você concorda com nossos{" "}
          <Link to="/termos" className="underline">Termos</Link> e{" "}
          <Link to="/privacidade" className="underline">Política de Privacidade</Link>.
        </p>
      </div>
    </div>
  );
}
