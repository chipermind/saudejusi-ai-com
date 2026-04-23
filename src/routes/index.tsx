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
import { Testimonials } from "@/components/landing/Testimonials";
import { SobreSection } from "@/components/landing/SobreSection";

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
      <Testimonials />
      <Jurimetria />
      <Pricing />
      <Faq />
      <SobreSection />
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
          <p className="mt-4 max-w-xl text-xs leading-relaxed text-text-tertiary">
            Plataforma exclusiva para advogados. Não prestamos serviços jurídicos nem
            intermediamos contratação de advocacia.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="h-11 px-6">
                Entrar na waitlist <ArrowRight className="ml-1 h-4 w-4" />
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
      value: "Maioria",
      label: "das negativas de plano de saúde é revertida no Judiciário",
      source: "IESS, 2023",
    },
    {
      value: "R$ 4.2 bi",
      label: "em demandas contra operadoras em 2024",
      source: "ANS, 2024",
    },
    {
      value: "47 dias",
      label: "tempo médio que um advogado gasta montando um caso do zero",
      source: null,
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
            <div key={s.label} className="border-l-2 border-primary pl-6">
              <p className="font-mono text-5xl font-semibold tracking-tight text-text-primary">
                {s.value}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{s.label}</p>
              {s.source && (
                <p className="mt-2 text-xs text-text-tertiary">Fonte: {s.source}</p>
              )}
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
      desc: "Você recebe indicadores estatísticos de procedência, tempo médio e faixa de dano moral observada na sua comarca.",
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
            Cruzamos tipo de negativa, operadora, comarca e juízo para entregar
            indicadores estatísticos de procedência e faixas históricas de condenação
            por dano moral — atualizado a cada nova decisão publicada.
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
        "Exportação .docx/.pdf (sem integração PJe)",
        "Suporte por email",
      ],
      highlighted: false,
      cta: { label: "Entrar na waitlist", to: "/signup" },
    },
    {
      name: "Dupla",
      price: "R$ 897",
      desc: "Para bancas enxutas de 2 a 3 advogados.",
      features: [
        "Até 3 advogados",
        "60 casos por mês",
        "Todas as features core",
        "Integração PJe incluída",
        "Suporte por email prioritário",
      ],
      highlighted: true,
      cta: { label: "Entrar na waitlist", to: "/signup" },
    },
    {
      name: "Escritório",
      price: "R$ 1.497",
      desc: "Para escritórios em crescimento.",
      features: [
        "Até 5 advogados",
        "Casos ilimitados",
        "Tudo do plano Dupla",
        "Integração PJe + jurimetria avançada por tribunal e operadora",
        "Biblioteca de minutas editáveis",
        "Suporte prioritário",
      ],
      highlighted: false,
      cta: { label: "Entrar na waitlist", to: "/signup" },
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
        "Integração PJe customizada",
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

        {/* ROI block */}
        <div className="mt-10 rounded-xl border border-border bg-surface p-6">
          <p className="text-sm leading-relaxed text-text-secondary">
            Um caso de OPME revertido gera em média{" "}
            <span className="font-medium text-text-primary">
              R$ 30–80 mil em honorários contratuais
            </span>
            . Se o Defere ajudar você a ganhar 1 caso adicional por mês, a assinatura
            Solo se paga em 60x.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function Faq() {
  const items = [
    {
      q: "A IA substitui o advogado?",
      a: "Não. O Defere é uma ferramenta de apoio à atividade advocatícia. Todas as peças geradas — pareceres, recursos à ANS, notificações e petições iniciais — são rascunhos que exigem revisão e assinatura de advogado habilitado. Nosso papel é eliminar as 40 horas de pesquisa e redação inicial, não a responsabilidade técnica do profissional.",
    },
    {
      q: "Como vocês garantem LGPD com dados de saúde?",
      a: "Dados de saúde são pessoais sensíveis (art. 11, LGPD). Tratamos com: (i) criptografia em repouso (AES-256) e em trânsito (TLS 1.3); (ii) segregação lógica por escritório (tenant isolation); (iii) retenção configurável pelo escritório, com expurgo padrão em 5 anos após encerramento do caso; (iv) DPO nomeado e canal dedicado em privacidade@defere.com.br; (v) contrato de operador LGPD firmado com cada escritório cliente, posicionando o escritório como controlador e o Defere como operador. Relatório de Impacto (RIPD) disponível sob NDA para escritórios em avaliação.",
    },
    {
      q: "De onde vem a base de jurisprudência?",
      a: "Usamos coleta pública de decisões a partir de DJEs estaduais, do DataJud/CNJ e dos portais de tribunais, com filtros para excluir processos sob segredo de justiça e mascarar dados pessoais de terceiros antes do ingest. A base é recortada para direito médico e atualizada diariamente.",
    },
    {
      q: "Posso integrar com o PJe?",
      a: "Sim. A integração com PJe (peticionamento eletrônico via certificado A3/A1 do advogado) está disponível a partir do plano Dupla. No plano Solo, você exporta a peça em .docx/.pdf pronta para protocolo manual.",
    },
    {
      q: "O escritório vira cliente exclusivo de vocês?",
      a: "Não há exclusividade. Você pode usar o Defere em paralelo a outras ferramentas e cancelar a qualquer momento com efeito no fim do ciclo corrente de cobrança.",
    },
    {
      q: "Quando o beta abre?",
      a: "O beta fechado está em operação com escritórios-piloto selecionados. A abertura pública está prevista para o segundo semestre de 2026. Entre na waitlist para receber convite prioritário.",
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
