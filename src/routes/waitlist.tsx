import { createFileRoute, Link } from "@tanstack/react-router";
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
import { CheckCircle2 } from "lucide-react";
import { trackEvent } from "@/lib/plausible";

const UF = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB",
  "PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

const FIRM_SIZE_OPTIONS: { value: string; label: string }[] = [
  { value: "solo", label: "Solo" },
  { value: "2-3", label: "2-3 advogados" },
  { value: "4-10", label: "4-10 advogados" },
  { value: "11+", label: "11+" },
];

export const Route = createFileRoute("/waitlist")({
  head: () => ({
    meta: [
      { title: "Entrar na waitlist — Defere" },
      {
        name: "description",
        content:
          "Solicite convite para o beta fechado do Defere — IA jurídica para escritórios de direito médico.",
      },
    ],
  }),
  component: WaitlistPage,
});

function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [oabNumber, setOabNumber] = useState("");
  const [oabState, setOabState] = useState("");
  const [firmSize, setFirmSize] = useState("");
  const [monthlyVolume, setMonthlyVolume] = useState("");
  // Honeypot field — must remain empty for legitimate users.
  const [website, setWebsite] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Honeypot trip: pretend success, never call the API. Don't tip off the bot.
    if (website.trim().length > 0) {
      setSubmitted(true);
      return;
    }

    if (!accepted) {
      toast.error("Você precisa aceitar os termos.");
      return;
    }
    if (!oabState) {
      toast.error("Selecione o estado da OAB.");
      return;
    }
    if (!firmSize) {
      toast.error("Selecione o porte do escritório.");
      return;
    }

    setLoading(true);

    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null;

    const { error } = await supabase.from("waitlist").insert({
      email: email.trim(),
      oab_number: oabNumber.trim(),
      oab_state: oabState,
      firm_size: firmSize,
      monthly_case_volume: monthlyVolume.trim() || null,
      user_agent: userAgent,
    });

    setLoading(false);

    if (error) {
      // Postgres unique violation = email already on the list. Silent success
      // to avoid leaking whether an email exists (privacy + spam mitigation).
      const code = (error as { code?: string }).code;
      const isDuplicate =
        code === "23505" || error.message.toLowerCase().includes("duplicate");

      // Honeypot trigger raises a generic 'rejected' exception; treat as silent success.
      const isHoneypotRejected = error.message.toLowerCase().includes("rejected");

      if (isDuplicate || isHoneypotRejected) {
        setSubmitted(true);
        return;
      }

      toast.error(
        error.message.includes("violates")
          ? "Verifique os dados informados e tente novamente."
          : "Não foi possível enviar agora. Tente novamente em instantes.",
      );
      return;
    }

    trackEvent("Waitlist Submit", {
      firm_size: firmSize,
      has_volume: String(monthlyVolume.trim().length > 0),
    });

    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-[460px]">
        <Link to="/" className="mb-10 flex justify-center">
          <Logo size="lg" />
        </Link>

        <div className="rounded-xl border border-border bg-surface p-8">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <h1 className="mt-6 text-xl font-semibold text-text-primary">
                Pedido recebido
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Recebemos seu pedido. Convites são enviados por ordem de chegada e
                perfil de escritório. Acompanhe o e-mail informado.
              </p>
              <div className="mt-8">
                <Link to="/">
                  <Button variant="secondary" className="w-full">
                    Voltar para a home
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-text-primary">
                Entrar na waitlist
              </h1>
              <p className="mt-1 text-sm text-text-tertiary">
                Beta fechado em andamento. Acesso por convite.
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

                <div className="grid grid-cols-[1fr_120px] gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="oab">Número da OAB</Label>
                    <Input
                      id="oab"
                      value={oabNumber}
                      onChange={(e) => setOabNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oab_state">UF</Label>
                    <Select value={oabState} onValueChange={setOabState}>
                      <SelectTrigger id="oab_state">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {UF.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firm_size">Porte do escritório</Label>
                  <Select value={firmSize} onValueChange={setFirmSize}>
                    <SelectTrigger id="firm_size">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIRM_SIZE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volume">
                    Volume mensal estimado de casos de direito médico{" "}
                    <span className="text-text-tertiary">(opcional)</span>
                  </Label>
                  <Input
                    id="volume"
                    placeholder="Ex.: 5 a 10 casos/mês"
                    value={monthlyVolume}
                    onChange={(e) => setMonthlyVolume(e.target.value)}
                    maxLength={50}
                  />
                </div>

                {/*
                  Honeypot field. Visible to bots that parse the DOM, hidden from
                  humans via off-screen positioning (NOT display:none — bots skip those).
                */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    top: "auto",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                >
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <label className="flex items-start gap-3 pt-2 text-sm text-text-secondary">
                  <Checkbox
                    checked={accepted}
                    onCheckedChange={(v) => setAccepted(v === true)}
                    className="mt-0.5"
                    aria-label="Aceitar termos"
                  />
                  <span>
                    Concordo com os{" "}
                    <Link to="/termos" className="text-primary hover:text-primary/80">
                      Termos
                    </Link>{" "}
                    e com a{" "}
                    <Link
                      to="/privacidade"
                      className="text-primary hover:text-primary/80"
                    >
                      Política de Privacidade
                    </Link>
                    .
                  </span>
                </label>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Solicitar convite"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-text-secondary">
                Já tem conta?{" "}
                <Link to="/login" className="text-primary hover:text-primary/80">
                  Entrar →
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
