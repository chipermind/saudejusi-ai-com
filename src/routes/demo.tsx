import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Agendar demo — Defere" },
      {
        name: "description",
        content:
          "Mostramos o Defere em 20 minutos, aplicado a casos reais do seu escritório de direito médico.",
      },
      { property: "og:title", content: "Agendar demo — Defere" },
      {
        property: "og:description",
        content:
          "20 minutos com o time do Defere, aplicados a casos reais do seu escritório.",
      },
    ],
  }),
  component: DemoPage,
});

function maskWhatsapp(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function DemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [firmName, setFirmName] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!teamSize) {
      toast.error("Selecione quantos advogados.");
      return;
    }
    setLoading(true);

    const { error } = await supabase.from("demo_requests").insert({
      full_name: fullName,
      email,
      whatsapp,
      firm_name: firmName,
      team_size: teamSize,
      message: message || null,
    });

    setLoading(false);

    if (error) {
      toast.error("Não foi possível enviar agora. Tente de novo em instantes.");
      return;
    }

    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-[440px]">
        <Link to="/" className="mb-10 flex justify-center">
          <Logo size="lg" />
        </Link>

        <div className="rounded-xl border border-border bg-surface p-8">
          {submitted ? (
            <div className="text-center">
              <h1 className="text-xl font-semibold text-text-primary">
                Recebemos sua solicitação.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                Retornamos em até 1 dia útil no WhatsApp.
              </p>
              <Link to="/" className="mt-8 inline-block">
                <Button variant="ghost" size="sm">
                  Voltar para a página inicial
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-text-primary">
                Agendar demo com o time
              </h1>
              <p className="mt-1 text-sm text-text-tertiary">
                Mostramos o Defere em 20 minutos, aplicado a casos reais do seu
                escritório.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome completo</Label>
                  <Input
                    id="full_name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

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
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    inputMode="tel"
                    placeholder="(00) 00000-0000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(maskWhatsapp(e.target.value))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firm">Nome do escritório</Label>
                  <Input
                    id="firm"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team_size">Quantos advogados</Label>
                  <Select value={teamSize} onValueChange={setTeamSize}>
                    <SelectTrigger id="team_size">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2-5">2 a 5</SelectItem>
                      <SelectItem value="6-15">6 a 15</SelectItem>
                      <SelectItem value="16+">16 ou mais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem (opcional)</Label>
                  <Textarea
                    id="message"
                    rows={3}
                    placeholder="Casos típicos que atendem, ou qualquer coisa que queiram contar"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Solicitar demo"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
