import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — SaudeJusia" },
      { name: "description", content: "Defina uma nova senha para sua conta." },
    ],
  }),
  component: ResetPasswordPage,
});

type Status = "loading" | "valid" | "invalid" | "success";

function ResetPasswordPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let resolved = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        resolved = true;
        setStatus("valid");
      }
    });

    // If the user already has a recovery session (page reload), accept it too.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !resolved) {
        resolved = true;
        setStatus("valid");
      }
    });

    const timer = window.setTimeout(() => {
      if (!resolved) setStatus("invalid");
    }, 2500);

    return () => {
      sub.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  const checks = useMemo(
    () => ({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      number: /\d/.test(password),
      match: password.length > 0 && password === confirm,
    }),
    [password, confirm],
  );

  const allValid = checks.length && checks.upper && checks.number && checks.match;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!allValid) return;
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      toast.error(error.message || "Não foi possível redefinir a senha.");
      return;
    }

    setStatus("success");
    setTimeout(() => {
      window.location.href = "/app";
    }, 2000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-[440px]">
        <Link to="/" className="mb-10 flex justify-center">
          <Logo size="lg" />
        </Link>

        <div className="rounded-xl border border-border bg-surface p-8">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-text-secondary">Validando link...</p>
            </div>
          )}

          {status === "invalid" && (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <h1 className="mt-4 text-xl font-semibold text-text-primary">
                Link inválido ou expirado
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Este link de recuperação não é mais válido. Links de recuperação
                expiram em 1 hora após o envio.
              </p>
              <Button asChild className="mt-6 w-full">
                <Link to="/esqueci-senha">Solicitar novo link</Link>
              </Button>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <h1 className="mt-4 text-xl font-semibold text-text-primary">
                Senha redefinida
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Sua senha foi alterada. Redirecionando para o painel...
              </p>
            </div>
          )}

          {status === "valid" && (
            <>
              <h1 className="text-xl font-semibold text-text-primary">
                Definir nova senha
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Escolha uma senha forte. Mínimo 8 caracteres.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPwd ? "text" : "password"}
                      autoComplete="new-password"
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                      aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <ul className="space-y-1 pt-1 text-[13px]">
                    <Criterion ok={checks.length} label="Mínimo 8 caracteres" />
                    <Criterion ok={checks.upper} label="Pelo menos 1 letra maiúscula" />
                    <Criterion ok={checks.number} label="Pelo menos 1 número" />
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar nova senha</Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                      aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirm.length > 0 && (
                    <p
                      className={`text-[13px] ${
                        checks.match ? "text-success" : "text-danger"
                      }`}
                    >
                      {checks.match ? "As senhas coincidem" : "As senhas não coincidem"}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!allValid || submitting}
                >
                  {submitting ? "Redefinindo..." : "Redefinir senha"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Criterion({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={ok ? "text-success" : "text-text-tertiary"}>
      <span className="mr-1.5">{ok ? "✓" : "○"}</span>
      {label}
    </li>
  );
}
