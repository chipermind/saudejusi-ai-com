import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/confirmar-email")({
  head: () => ({
    meta: [
      { title: "Confirme seu email — SaudeJusia" },
      {
        name: "description",
        content: "Verifique seu email para ativar sua conta na SaudeJusia.",
      },
    ],
  }),
  component: ConfirmarEmailPage,
});

function ConfirmarEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-[420px]">
        <Link to="/" className="mb-10 flex justify-center">
          <Logo size="lg" />
        </Link>

        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <h1 className="text-xl font-semibold text-text-primary">
            Confira seu email
          </h1>
          <p className="mt-3 text-sm text-text-secondary">
            Acabamos de enviar um link de confirmação. Abra o email e clique no
            link para ativar sua conta.
          </p>
          <p className="mt-2 text-xs text-text-tertiary">
            Não chegou em alguns minutos? Confira a caixa de spam ou tente
            cadastrar novamente.
          </p>

          <div className="mt-8 space-y-2">
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Já confirmei — entrar
              </Button>
            </Link>
            <Link to="/cadastro">
              <Button variant="ghost" className="w-full">
                Voltar para o cadastro
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
