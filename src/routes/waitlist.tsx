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
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { trackEvent } from "@/lib/plausible";

const PLAN_TYPE_OPTIONS = [
  { value: "individual", label: "Individual" },
  { value: "familiar", label: "Familiar" },
  { value: "empresarial", label: "Empresarial" },
  { value: "nao_tenho_plano", label: "Não tenho plano ainda" },
] as const;

const SITUACAO_OPTIONS = [
  { value: "caso_ativo", label: "Tenho um caso ativo com negativa" },
  { value: "ja_resolvi_quero_aprender", label: "Já resolvi um caso e quero me preparar" },
  { value: "nenhum_caso_mas_tenho_plano", label: "Tenho plano mas sem caso ativo" },
  { value: "nao_tenho_plano", label: "Não tenho plano mas quero me informar" },
] as const;

const OPERADORAS_SUGERIDAS = [
  "Bradesco Saúde",
  "Amil",
  "Hapvida / NotreDame Intermédica",
  "Unimed",
  "SulAmérica",
  "Prevent Senior",
  "Outra",
  "Não tenho plano",
];

export const Route = createFileRoute("/waitlist")({
  head: () => ({
    meta: [
      { title: "Entrar na waitlist — SaudeJusia" },
      {
        name: "description",
        content:
          "Solicite convite para o beta fechado da SaudeJusia — direitos do beneficiário de plano de saúde.",
      },
    ],
  }),
  component: WaitlistPage,
});

function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [operadora, setOperadora] = useState("");
  const [planType, setPlanType] = useState("");
  const [situacao, setSituacao] = useState("");
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
    if (!planType) {
      toast.error("Selecione o tipo do seu plano.");
      return;
    }
    if (!situacao) {
      toast.error("Selecione a sua situação atual.");
      return;
    }
    if (!operadora.trim()) {
      toast.error("Informe a operadora do seu plano.");
      return;
    }

    setLoading(true);

    const userAgent =
      typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null;

    const { error } = await supabase.from("waitlist").insert({
      email: email.trim(),
      nome_completo: nomeCompleto.trim(),
      operadora: operadora.trim(),
      plan_type: planType,
      situacao,
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
      plan_type: planType,
      situacao,
      has_operadora: String(operadora.trim().length > 0),
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
                perfil. Fique de olho no e-mail.
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

              {/*
                Aviso temporário enquanto Termos / Privacidade / LGPD estão em
                redação. Referenciar documentos inexistentes vicia o consentimento
                (LGPD art. 8 §4). Removido quando os documentos forem publicados.
              */}
              <div
                role="note"
                className="mt-6 flex gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4"
              >
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning"
                  aria-hidden="true"
                />
                <div className="text-xs leading-relaxed text-text-secondary">
                  <p className="font-medium text-text-primary">
                    Documentos legais em elaboração
                  </p>
                  <p className="mt-2">
                    Os Termos de Uso, a Política de Privacidade e o documento de
                    conformidade LGPD estão em redação e serão publicados antes da
                    abertura pública do beta. Enquanto isso, seus dados são tratados
                    com criptografia em repouso e em trânsito, usados exclusivamente
                    para envio do convite ao beta, e você pode solicitar exclusão a
                    qualquer momento pelo e-mail{" "}
                    <a
                      href="mailto:privacidade@saudejusia.com.br"
                      className="text-primary hover:text-primary/80"
                    >
                      privacidade@saudejusia.com.br
                    </a>
                    .
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
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
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    type="text"
                    autoComplete="name"
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    minLength={2}
                    maxLength={200}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="operadora">Operadora do seu plano</Label>
                  <Input
                    id="operadora"
                    type="text"
                    list="operadoras-sugeridas"
                    placeholder="Ex.: Bradesco, Amil, Unimed…"
                    value={operadora}
                    onChange={(e) => setOperadora(e.target.value)}
                    minLength={2}
                    maxLength={200}
                    required
                  />
                  <datalist id="operadoras-sugeridas">
                    {OPERADORAS_SUGERIDAS.map((o) => (
                      <option key={o} value={o} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan_type">Tipo do seu plano</Label>
                  <Select value={planType} onValueChange={setPlanType}>
                    <SelectTrigger id="plan_type">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAN_TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="situacao">Sua situação agora</Label>
                  <Select value={situacao} onValueChange={setSituacao}>
                    <SelectTrigger id="situacao">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {SITUACAO_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

                {/*
                  Consentimento LGPD reescrito (art. 8 §4 — informado e específico):
                  descreve o que está sendo consentido (envio de convite ao beta) e
                  preserva o direito de exclusão. Não referencia documentos ainda
                  inexistentes (Termos / Privacidade), o que viciaria o consentimento.
                */}
                <label className="flex items-start gap-3 pt-2 text-sm text-text-secondary">
                  <Checkbox
                    checked={accepted}
                    onCheckedChange={(v) => setAccepted(v === true)}
                    className="mt-0.5"
                    aria-label="Aceitar termos"
                  />
                  <span>
                    Autorizo o uso do meu e-mail e dados informados exclusivamente
                    para envio do convite ao beta e comunicações relacionadas ao
                    lançamento. Ciente de que os Termos e a Política de Privacidade
                    finais serão publicados antes da abertura pública e de que posso
                    solicitar exclusão dos meus dados a qualquer momento em{" "}
                    <a
                      href="mailto:privacidade@saudejusia.com.br"
                      className="text-primary hover:text-primary/80"
                    >
                      privacidade@saudejusia.com.br
                    </a>
                    .
                  </span>
                </label>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Solicitar convite"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
