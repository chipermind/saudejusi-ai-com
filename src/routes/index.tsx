import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Upload, Sparkles, BarChart3, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { HeroCaseCard } from "@/components/landing/HeroCaseCard";
import { JurimetriaChart } from "@/components/landing/JurimetriaChart";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Defere — Do laudo à liminar em 48 horas" },
      {
        name: "description",
        content:
          "Plataforma de IA para escritórios de direito médico. Analisa negativas de plano de saúde, prevê o êxito do caso e gera o parecer, recurso à ANS e petição inicial com tutela de urgência.",
      },
      { property: "og:title", content: "Defere — Inteligência jurídica em saúde suplementar" },
      {
        property: "og:description",
        content: "Do laudo à liminar em 48 horas. IA jurídica para direito médico.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <Problem />
      <HowItWorks />
      <Jurimetria />
      <Pricing />
      <Faq />
      <SiteFooter />
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* subtle radial */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:py-32">
        <div>
          <p className="caption-blue">Inteligência jurídica em saúde suplementar</p>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-text-primary sm:text-6xl">
            Do laudo à liminar
            <br />
            <span className="text-text-secondary">em 48 horas.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary">
            A plataforma de IA que analisa negativas de plano de saúde, prevê o êxito do caso e
            gera o parecer, o recurso à ANS e a petição inicial com tutela de urgência. Para
            escritórios que atuam com direito médico.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="h-11 px-6">
                Solicitar demo <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <a href="#produto">
              <Button size="lg" variant="ghost" className="h-11 px-6">
                Ver como funciona
              </Button>
            </a>
          </div>
          <p className="mt-10 text-xs text-text-tertiary">
            Construído por e para advogados de direito médico. Beta fechado 2026.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroCaseCard />
        </div>
      </div>
    </section>
  );
}

/* ---------- Problem ---------- */
function Problem() {
  const stats = [
    {
      value: "8 em 10",
      label: "negativas de plano têm reversão possível no Judiciário",
    },
    {
      value: "R$ 4.2 bi",
      label: "em demandas contra operadoras em 2024 (ANS)",
    },
    {
      value: "47 dias",
      label: "tempo médio que um advogado gasta montando um caso do zero",
    },
  ];
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="caption">O problema</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-text-primary">
            Negar virou estratégia.
            <br />
            <span className="text-text-tertiary">Reverter virou burocracia.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.value} className="border-l-2 border-primary pl-6">
              <p className="font-mono text-5xl font-semibold tracking-tight text-text-primary">
                {s.value}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- How it works ---------- */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      icon: Upload,
      title: "Upload",
      desc: "Anexe a carta de negativa, laudo, contrato e carteirinha. OCR extrai tudo automaticamente.",
    },
    {
      n: "02",
      icon: Sparkles,
      title: "Análise",
      desc: "A IA classifica a negativa em uma das 20 categorias e cruza com jurisprudência atualizada.",
    },
    {
      n: "03",
      icon: BarChart3,
      title: "Previsão",
      desc: "Você recebe a probabilidade de êxito, tempo médio e dano moral esperado na sua comarca.",
    },
    {
      n: "04",
      icon: FileText,
      title: "Entrega",
      desc: "Parecer, recurso à ANS, notificação e petição inicial com tutela de urgência — prontos para revisão.",
    },
  ];
  return (
    <section id="produto" className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="caption">Como funciona</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-text-primary">
            Quatro passos.
            <br />
            <span className="text-text-tertiary">Quarenta e oito horas.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ n, icon: Icon, title, desc }) => (
            <div key={n} className="bg-surface p-6 transition-colors hover:bg-surface-elevated">
              <div className="flex items-start justify-between">
                <span className="font-mono text-sm text-text-tertiary">{n}</span>
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-8 text-lg font-semibold text-text-primary">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Jurimetria ---------- */
function Jurimetria() {
  return (
    <section id="jurimetria" className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2">
        <div>
          <p className="caption">Jurimetria</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-text-primary">
            Decisões baseadas em
            <br />
            <span className="text-text-tertiary">dados, não em achismo.</span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-text-secondary">
            Cruzamos tipo de negativa, operadora, comarca e juízo para entregar a probabilidade
            de procedência e o valor esperado de condenação por dano moral — atualizado a cada
            nova decisão publicada.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-text-secondary">
            {[
              "Base própria com 200 mil decisões em direito médico",
              "Atualização diária a partir de DJEs e portais dos tribunais",
              "Recortes por comarca, juízo e câmara",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <JurimetriaChart />
      </div>
    </section>
  );
}

/* ---------- Pricing ---------- */
function Pricing() {
  const plans = [
    {
      name: "Solo",
      price: "R$ 497",
      desc: "Para o advogado individual.",
      features: ["1 advogado", "20 casos por mês", "Todas as features core", "Suporte por email"],
      highlighted: false,
    },
    {
      name: "Escritório",
      price: "R$ 1.497",
      desc: "Para escritórios em crescimento.",
      features: [
        "Até 5 advogados",
        "Casos ilimitados",
        "Jurimetria avançada",
        "Suporte prioritário",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Sob consulta",
      desc: "Para operações de alto volume.",
      features: [
        "6+ advogados",
        "API de integração",
        "White-label",
        "Integração PJe",
      ],
      highlighted: false,
    },
  ];

  return (
    <section id="precos" className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="caption">Preços</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-text-primary">
            Um plano por porte de escritório.
          </h2>
          <p className="mt-4 text-base text-text-secondary">
            14 dias grátis, sem cartão.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.name}
              className={`relative flex flex-col gap-6 rounded-xl border bg-surface p-8 ${
                p.highlighted
                  ? "border-primary shadow-[0_0_0_1px_var(--primary)]"
                  : "border-border"
              }`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Mais popular
                </span>
              )}
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{p.name}</h3>
                <p className="mt-1 text-sm text-text-tertiary">{p.desc}</p>
              </div>
              <div>
                <span className="font-mono text-4xl font-semibold text-text-primary">
                  {p.price}
                </span>
                {p.price.startsWith("R$") && (
                  <span className="ml-1 text-sm text-text-tertiary">/mês</span>
                )}
              </div>
              <ul className="space-y-3 text-sm text-text-secondary">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="mt-auto">
                <Button
                  className="w-full"
                  variant={p.highlighted ? "default" : "secondary"}
                >
                  Começar 14 dias grátis
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function Faq() {
  const items = [
    {
      q: "A IA substitui o advogado?",
      a: "Não. O Defere é uma ferramenta de apoio que acelera o trabalho técnico — classificação da negativa, levantamento de jurisprudência, redação inicial das peças. Toda peça gerada deve ser revisada pelo advogado responsável antes de qualquer protocolo.",
    },
    {
      q: "Como vocês garantem LGPD com dados de saúde?",
      a: "Dados são criptografados em trânsito e em repouso. Acesso restrito por escritório (cada cliente vê apenas seus próprios casos). Servidores em território nacional. Termo de uso prevê que o controlador dos dados é o escritório — o Defere atua como operador.",
    },
    {
      q: "De onde vem a base de jurisprudência?",
      a: "Coletamos diariamente acórdãos publicados nos portais dos tribunais estaduais e regionais federais, além de decisões monocráticas em direito médico. A base é classificada manualmente em uma camada de qualidade antes de entrar no modelo.",
    },
    {
      q: "Posso integrar com o PJe?",
      a: "Integração com PJe está disponível no plano Enterprise. Para os planos Solo e Escritório, oferecemos exportação dos documentos prontos em .docx e .pdf para protocolo manual.",
    },
    {
      q: "O escritório vira cliente exclusivo de vocês?",
      a: "Não. Não há cláusula de exclusividade. Você cancela a qualquer momento e pode exportar todo o histórico dos seus casos a qualquer tempo, em formato aberto.",
    },
  ];
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <p className="caption">Perguntas frequentes</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-text-primary">
          Dúvidas comuns.
        </h2>
        <Accordion type="single" collapsible className="mt-12">
          {items.map((it, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-border"
            >
              <AccordionTrigger className="text-left text-base font-medium text-text-primary hover:no-underline">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-text-secondary">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
