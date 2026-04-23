import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — SaudeJusia" },
      {
        name: "description",
        content: "Receba um link no seu email para criar uma nova senha.",
      },
    ],
  }),
  component: RecuperarSenhaPage,
});

function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Mensagem neutra propositalmente — não revela se o email existe
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-[400px]">
        <Link to="/" className="mb-10 flex justify-center">
          <Logo size="lg" />
        </Link>

        <div className="rounded-xl border border-border bg-surface p-8">
          <h1 className="text-xl font-semibold text-text-primary">
            Recuperar senha
          </h1>

          {submitted ? (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-text-secondary">
                Se este email tiver uma conta na SaudeJusia, você vai receber um
                link para criar uma nova senha em alguns minutos. Confira também
                a caixa de spam.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Voltar para o login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-1 text-sm text-text-tertiary">
                Informe seu email e enviaremos um link para criar uma nova senha.
              </p>
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar link"}
                </Button>
              </form>
              <p className="mt-8 text-center text-sm text-text-secondary">
                Lembrou a senha?{" "}
                <Link to="/login" className="text-primary hover:text-primary-hover">
                  Entrar
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
