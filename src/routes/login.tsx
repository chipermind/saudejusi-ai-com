import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Defere" },
      { name: "description", content: "Acesse sua conta no Defere." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/app" });
  }

  async function handleMagic() {
    if (!email) {
      toast.error("Informe seu email primeiro.");
      return;
    }
    setMagicLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/app` },
    });
    setMagicLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Verifique seu email para o link de acesso.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-[400px]">
        <Link to="/" className="mb-10 flex justify-center">
          <Logo size="lg" />
        </Link>

        <div className="rounded-xl border border-border bg-surface p-8">
          <h1 className="text-xl font-semibold text-text-primary">Entrar no Defere</h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Acesse o painel do seu escritório.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email profissional</Label>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  to="/esqueci-senha"
                  className="text-[13px] text-text-secondary no-underline hover:text-primary"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-text-tertiary">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleMagic}
            disabled={magicLoading}
          >
            {magicLoading ? "Enviando..." : "Receber link por email"}
          </Button>

          <p className="mt-8 text-center text-sm text-text-secondary">
            Não tem conta?{" "}
            <Link to="/signup" className="text-primary hover:text-primary-hover">
              Criar conta →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
