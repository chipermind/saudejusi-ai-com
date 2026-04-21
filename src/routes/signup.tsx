import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const UF = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB",
  "PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Criar conta — Defere" },
      { name: "description", content: "Comece seu teste gratuito de 14 dias." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [oabNumber, setOabNumber] = useState("");
  const [oabState, setOabState] = useState("");
  const [firmName, setFirmName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!accepted) {
      toast.error("Você precisa aceitar os termos.");
      return;
    }
    if (!oabState) {
      toast.error("Selecione o estado da OAB.");
      return;
    }
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { full_name: fullName },
      },
    });

    if (signUpError) {
      setLoading(false);
      toast.error(signUpError.message);
      return;
    }

    // Ensure session exists (depends on email confirmation setting)
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      // Fallback: try sign in
      await supabase.auth.signInWithPassword({ email, password });
    }

    const { error: rpcError } = await supabase.rpc("signup_create_firm", {
      _firm_name: firmName,
      _full_name: fullName,
      _oab_number: oabNumber,
      _oab_state: oabState,
    });

    setLoading(false);

    if (rpcError) {
      toast.error(`Conta criada, mas falhou ao criar escritório: ${rpcError.message}`);
      return;
    }

    toast.success("Bem-vindo ao Defere.");
    navigate({ to: "/app" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-[440px]">
        <Link to="/" className="mb-10 flex justify-center">
          <Logo size="lg" />
        </Link>

        <div className="rounded-xl border border-border bg-surface p-8">
          <h1 className="text-xl font-semibold text-text-primary">Criar conta</h1>
          <p className="mt-1 text-sm text-text-tertiary">14 dias grátis. Sem cartão.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email profissional</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="grid grid-cols-[1fr_120px] gap-3">
              <div className="space-y-2">
                <Label htmlFor="oab">Número da OAB</Label>
                <Input id="oab" value={oabNumber} onChange={(e) => setOabNumber(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oab_state">UF</Label>
                <Select value={oabState} onValueChange={setOabState}>
                  <SelectTrigger id="oab_state"><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>
                    {UF.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firm">Nome do escritório</Label>
              <Input id="firm" value={firmName} onChange={(e) => setFirmName(e.target.value)} required />
            </div>

            <label className="flex items-start gap-3 pt-2 text-sm text-text-secondary">
              <Checkbox
                checked={accepted}
                onCheckedChange={(v) => setAccepted(v === true)}
                className="mt-0.5"
                aria-label="Aceitar termos"
              />
              <span>
                Li e aceito os{" "}
                <a href="#" className="text-primary hover:text-primary-hover">termos</a>{" "}
                e a{" "}
                <a href="#" className="text-primary hover:text-primary-hover">política de privacidade</a>.
              </span>
            </label>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando..." : "Criar conta"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary hover:text-primary-hover">Entrar →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
