import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/esqueci-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — Defere" },
      { name: "description", content: "Recupere o acesso à sua conta no Defere." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    setLoading(false);

    if (error) {
      // Don't reveal whether the email exists. Only surface infra/rate-limit issues.
      const status = (error as { status?: number }).status;
      const isUserNotFound = /user.*not.*found|invalid/i.test(error.message);
      if (status === 429) {
        setErrorMsg(
          "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
        );
        return;
      }
      if (!isUserNotFound && status && status >= 500) {
        setErrorMsg(
          "Não foi possível processar a solicitação. Tente novamente em instantes.",
        );
        return;
      }
      // Treat user-not-found and similar as success to prevent enumeration.
    }

    setSubmittedEmail(email);
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-[440px]">
        <Link to="/" className="mb-10 flex justify-center">
          <Logo size="lg" />
        </Link>

        <div className="rounded-xl border border-border bg-surface p-8">
          {!sent ? (
            <>
              <h1 className="text-xl font-semibold text-text-primary">Recuperar senha</h1>
              <p className="mt-1 text-sm text-text-secondary">
                Enviaremos um link seguro para o seu email. O link expira em 1 hora.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email profissional</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {errorMsg && (
                  <p className="text-sm text-danger" role="alert">
                    {errorMsg}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar link de recuperação"}
                </Button>
              </form>

              <p className="mt-6 text-center text-[13px] text-text-tertiary">
                Lembrou a senha?{" "}
                <Link to="/login" className="text-primary hover:text-primary-hover">
                  Voltar ao login →
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-text-primary">Email enviado</h1>
              <p className="mt-3 text-sm text-text-secondary">
                Se existe uma conta com o email{" "}
                <span className="text-text-primary">{submittedEmail}</span>, você
                receberá um link para redefinir sua senha em instantes. Verifique também
                a caixa de spam.
              </p>

              <Button asChild variant="outline" className="mt-8 w-full">
                <Link to="/login">Voltar ao login</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
