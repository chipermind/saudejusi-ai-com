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
          "Defere — IA jurídica especializada em negativas de planos de saúde. Do laudo à liminar em 48 horas. Análise, jurimetria e geração de peças para escritórios de direito médico.",
      },
      { property: "og:title", content: "Defere — Inteligência jurídica em saúde suplementar" },
      {
        property: "og:description",
        content: "Do laudo à liminar em 48 horas. Análise de negativas de plano de saúde, jurimetria e geração de peças com IA.",
      },
      { name: "twitter:title", content: "Defere — Inteligência jurídica em saúde suplementar" },
      {
        name: "twitter:description",
        content: "Do laudo à liminar em 48 horas. Para escritórios de direito médico.",
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
            <Link to="/demo">
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
            Construído por e para advogados de direito médico. Beta fechado em andamento — acesso por convite.
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
      desc: "A IA classifica a negativa em uma das 16 categorias de recusa e cruza com a jurisprudência aplicável.",
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
              "Baseline público v1 cobre as 16 categorias de negativa com estratificação por tribunal",
              "Atualização trimestral conforme novas edições dos relatórios oficiais (CNJ, ANS, STJ)",
              "Modelo evolui para jurimetria proprietária conforme escritórios utilizam a plataforma",
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
type Plan = {
  name: string;
  price: string;
  desc: string;
  features: string[];
  highlighted: boolean;
  cta: { label: string; to?: "/signup"; href?: string };
};

function Pricing() {
  const plans: Plan[] = [
    {
      name: "Solo",
      price: "R$ 497",
      desc: "Para o advogado individual.",
      features: [
        "1 advogado",
        "Até 20 casos por mês",
        "Wizard completo de análise",
        "Geração de parecer, recurso ANS, notificação e petição",
        "Jurimetria baseline",
        "Suporte por email",
      ],
      highlighted: false,
      cta: { label: "Começar 14 dias grátis", to: "/signup" },
    },
    {
      name: "Escritório",
      price: "R$ 1.497",
      desc: "Para escritórios em crescimento.",
      features: [
        "Até 5 advogados",
        "Casos ilimitados",
        "Tudo do plano Solo",
        "Jurimetria avançada por tribunal e operadora",
        "Biblioteca de minutas editáveis",
        "Suporte prioritário",
      ],
      highlighted: true,
      cta: { label: "Começar 14 dias grátis", to: "/signup" },
    },
    {
      name: "Enterprise",
      price: "Sob consulta",
      desc: "Para operações de alto volume.",
      features: [
        "6+ advogados",
        "Tudo do plano Escritório",
        "Jurimetria proprietária do escritório",
        "API de integração",
        "White-label",
        "Integração PJe (2º semestre 2026)",
        "SLA dedicado",
      ],
      highlighted: false,
      cta: {
        label: "Falar com vendas",
        href:
          "mailto:contato@defere.com.br?subject=Defere%20Enterprise%20%E2%80%94%20solicita%C3%A7%C3%A3o%20de%20proposta",
      },
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
          <p className="mt-4 text-base text-text-secondary">14 dias grátis, sem cartão.</p>
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
              <div className="mt-auto">
                {p.cta.href ? (
                  <a href={p.cta.href}>
                    <Button
                      className="w-full"
                      variant={p.highlighted ? "default" : "secondary"}
                    >
                      {p.cta.label}
                    </Button>
                  </a>
                ) : (
                  <Link to={p.cta.to ?? "/signup"}>
                    <Button
                      className="w-full"
                      variant={p.highlighted ? "default" : "secondary"}
                    >
                      {p.cta.label}
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>

        <p
          className="mx-auto mt-12 max-w-[600px] text-center leading-relaxed text-text-secondary"
          style={{ fontSize: "15px" }}
        >
          Um único caso ganho com honorários médios de R$ 3.000 cobre mais de uma anuidade do
          plano Escritório. A maioria dos escritórios recupera o investimento no primeiro mês.
        </p>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function Faq() {
  const items = [
    {
      q: "A IA substitui o advogado?",
      a: "Não. O Defere é ferramenta de apoio à atividade advocatícia. Toda peça gerada é minuta e precisa de revisão técnica, ajuste ao caso concreto e assinatura de advogado habilitado. A plataforma automatiza o trabalho operacional — leitura de documentos, classificação da negativa, pesquisa de precedentes, montagem da estrutura da petição — para que você foque na estratégia e na revisão crítica.",
    },
    {
      q: "Como vocês garantem LGPD com dados de saúde?",
      a: "Dados de saúde são classificados como sensíveis pela LGPD (art. 11). Operamos com base legal de tutela da saúde combinada com consentimento do titular, criptografia em repouso e em trânsito, isolamento por escritório via Row Level Security, logs de auditoria de todos os acessos e retenção limitada ao período necessário. Assinamos DPA com todos os subprocessadores. DPO designado.",
    },
    {
      q: "De onde vem a base de jurisprudência?",
      a: "A versão atual opera com baseline estatístico construído a partir de fontes públicas agregadas (Justiça em Números do CNJ, relatórios setoriais da ANS e pesquisa jurisprudencial em portais oficiais dos tribunais). Conforme escritórios utilizam a plataforma, dados anonimizados dos casos realimentam o modelo, evoluindo para jurimetria proprietária. Transparência total sobre a versão do modelo em uso.",
    },
    {
      q: "Posso integrar com o PJe?",
      a: "Não na versão atual. Integração com PJe e outros sistemas de tribunal está no roadmap do plano Enterprise para o segundo semestre de 2026. Hoje, as peças são exportadas em .docx editável, prontas para protocolo manual ou para importação em qualquer ferramenta de peticionamento eletrônico.",
    },
    {
      q: "O escritório vira cliente exclusivo de vocês?",
      a: "Não. Você não precisa mudar seu software de gestão, seu CRM ou seu fluxo atual. O Defere é uma camada especializada em direito médico que se soma ao seu stack — não substitui Projuris, Astrea, Legal One ou qualquer outro sistema de gestão.",
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
            <AccordionItem key={i} value={`item-${i}`} className="border-border">
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
