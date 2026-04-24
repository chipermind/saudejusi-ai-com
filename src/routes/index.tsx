import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, MessageSquare, BookOpen, FileText, Bell } from "lucide-react";
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
import { trackEvent, type CtaLocation } from "@/lib/plausible";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SaudeJusia — Seus direitos no plano de saúde" },
      {
        name: "description",
        content:
          "Plataforma que ajuda beneficiários de plano de saúde a entender e exercer seus direitos. Gere notificações, recursos à ANS e reconsiderações sem precisar de advogado.",
      },
      { property: "og:title", content: "SaudeJusia — Seus direitos no plano de saúde" },
      {
        property: "og:description",
        content:
          "Plataforma que ajuda beneficiários de plano de saúde a entender e exercer seus direitos. Gere notificações, recursos à ANS e reconsiderações sem precisar de advogado.",
      },
      { name: "twitter:title", content: "SaudeJusia — Seus direitos no plano de saúde" },
      {
        name: "twitter:description",
        content:
          "Entenda e exerça seus direitos como beneficiário. Gere documentos sem advogado.",
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
      <Direitos />
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
          <p className="caption-blue">Direitos do beneficiário de plano de saúde</p>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-text-primary sm:text-6xl">
            Seu plano negou.
            <br />
            <span className="text-text-secondary">A gente te mostra como virar o jogo.</span>
          </h1>
          {/*
            Alinhado ao FAQ: para ação judicial é preciso advogado. Trocamos
            "Sem advogado no meio" (que prometia o oposto do FAQ) por "sem
            intermediário, na maioria dos casos", preservando a promessa forte
            sem criar expectativa impossível.
          */}
          <p className="mt-6 max-w-xl text-base leading-relaxed text-text-secondary">
            A SaudeJusia é a plataforma que explica, em linguagem clara, os seus direitos
            como beneficiário de plano de saúde — e gera as notificações, os recursos à
            ANS e as cartas de reconsideração que você mesmo envia. Resolva direto com
            a operadora e com a ANS, sem intermediário, na maioria dos casos. Sem custo
            surpresa.
          </p>
          <p className="mt-4 max-w-xl text-xs leading-relaxed text-text-tertiary">
            Serviço de informação e geração de documentos para o próprio beneficiário.
            Não prestamos serviços jurídicos e não representamos o usuário em juízo.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/waitlist"
              onClick={() => trackEvent("CTA Click", { location: "hero" })}
            >
              <Button size="lg" className="h-11 px-6">
                Entrar na waitlist <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <a href="#como-funciona">
              <Button size="lg" variant="ghost" className="h-11 px-6">
                Ver como funciona
              </Button>
            </a>
          </div>
          <p className="mt-10 text-xs text-text-tertiary">
            Construído ao lado de beneficiários, médicos e especialistas em saúde
            suplementar. Beta fechado · lançamento público em 2026.
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
      value: "6 em cada 10",
      label:
        "negativas de plano são revertidas na via administrativa, sem processo judicial",
      source: "dados agregados de NIPs resolvidas na ANS (2023)",
    },
    {
      value: "R$ 4,2 bi",
      label: "em demandas contra operadoras de plano de saúde só em 2024",
      source: "ANS",
    },
    {
      value: "80%",
      label:
        "dos beneficiários desistem no primeiro \"não\" do plano porque não sabem o caminho",
      source: "pesquisa Proteste sobre saúde suplementar",
    },
  ];
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="caption">O problema</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-text-primary">
            Quem paga plano, paga duas vezes:
            <br />
            <span className="text-text-tertiary">na mensalidade e no tempo perdido.</span>
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
      icon: MessageSquare,
      title: "Conte o que aconteceu",
      desc: "Descreva a negativa em linguagem comum. Anexe a carta do plano, o pedido médico e a carteirinha. A gente cuida do resto.",
    },
    {
      n: "02",
      icon: BookOpen,
      title: "Entenda seu direito",
      desc: "Em minutos, você recebe uma explicação clara do que diz a ANS, o seu contrato e a jurisprudência sobre o seu caso específico.",
    },
    {
      n: "03",
      icon: FileText,
      title: "Gere o documento certo",
      desc: "Reconsideração para a operadora, NIP para a ANS, notificação extrajudicial, carta médica de urgência — cada documento no formato certo para o canal certo.",
    },
    {
      n: "04",
      icon: Bell,
      title: "Acompanhe a resposta",
      desc: "A gente te lembra dos prazos, avisa quando a operadora responder e indica o próximo passo se a negativa continuar.",
    },
  ];
  return (
    <section id="como-funciona" className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="caption">Como funciona</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-text-primary">
            Quatro passos.
            <br />
            <span className="text-text-tertiary">Do "não" do plano à virada do jogo.</span>
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

/* ---------- Direitos (substitui Jurimetria) ---------- */
function Direitos() {
  return (
    <section id="direitos" className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2">
        <div>
          <p className="caption">Direitos, não opinião</p>
          {/*
            Tom neutralizado: "suas chances" + "antes de gastar com advogado" podem
            ser lidos como promessa de resultado e desestímulo à advocacia
            (Provimento OAB 205/2021). Mantém o valor informativo sem risco.
          */}
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-text-primary">
            Um panorama claro,
            <br />
            <span className="text-text-tertiary">baseado em dados reais da ANS e dos tribunais.</span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-text-secondary">
            Cruzamos o tipo de negativa, a operadora e o histórico de resolução
            administrativa e judicial para mostrar, em linguagem clara, qual o caminho
            mais rápido e barato para o seu caso — antes de você decidir o próximo passo.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-text-secondary">
            {[
              "Base atualizada com decisões de NIPs na ANS e processos em tribunais estaduais",
              "Recortes por tipo de negativa (OPME, oncologia, home care, saúde mental, urgência)",
              "Tempo médio de resposta por operadora",
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
  ctaLocation: CtaLocation;
};

function Pricing() {
  const plans: Plan[] = [
    {
      name: "Livre",
      price: "Grátis",
      desc: "Para quem quer entender seus direitos.",
      features: [
        "Biblioteca completa de direitos do beneficiário",
        "2 consultas com a IA da SaudeJusia por mês",
        "1 documento gerado por mês (reconsideração ou NIP)",
        "Comunidade de beneficiários",
      ],
      highlighted: false,
      ctaLocation: "pricing_livre",
    },
    {
      name: "Essencial",
      price: "R$ 29",
      desc: "Para quem tem um caso ativo agora.",
      features: [
        "Tudo do Livre, mais:",
        "IA ilimitada",
        "Geração ilimitada de documentos (NIP, reconsideração, notificação, carta de urgência)",
        "Rastreador de prazos automático",
        "Alertas por e-mail e WhatsApp",
        "Suporte humano em até 24h",
      ],
      highlighted: true,
      ctaLocation: "pricing_essencial",
    },
    {
      name: "Família",
      price: "R$ 49",
      desc: "Para cuidar de quem você ama.",
      features: [
        "Tudo do Essencial",
        "Até 4 beneficiários (você + dependentes)",
        "Histórico consolidado da família",
        "Perfil específico para idosos e crianças",
      ],
      highlighted: false,
      ctaLocation: "pricing_familia",
    },
  ];

  return (
    <section id="precos" className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="caption">Preços</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-text-primary">
            Acessível para quem mais precisa.
          </h2>
        </div>

        {/* ROI block — "30 anos" era hipérbole que insinuava certeza de reversão; neutralizado. */}
        <div className="mt-10 rounded-xl border border-border bg-surface p-6">
          <p className="text-sm leading-relaxed text-text-secondary">
            Uma mensalidade por menos do que um remédio de farmácia.{" "}
            <span className="font-medium text-text-primary">
              Uma negativa revertida paga muitos meses de assinatura.
            </span>
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <Link
                  to="/waitlist"
                  onClick={() =>
                    trackEvent("CTA Click", { location: p.ctaLocation })
                  }
                >
                  <Button
                    className="w-full"
                    variant={p.highlighted ? "default" : "secondary"}
                  >
                    Entrar na waitlist
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-xs leading-relaxed text-text-tertiary">
          14 dias grátis em qualquer plano pago. Cancele quando quiser, sem multa.
          Cobrança mensal, sem fidelidade — Código de Defesa do Consumidor (Lei 8.078/90).
        </p>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function Faq() {
  const items = [
    {
      q: "A SaudeJusia substitui um advogado?",
      a: "Não. Nós te ajudamos a resolver sua negativa na via administrativa — conversando com a operadora e, se preciso, com a ANS. Isso resolve a maioria dos casos sem precisar de processo. Se o seu caso precisar ir para o Judiciário, indicamos esse caminho e orientamos sobre como encontrar um advogado de sua confiança. Nós não representamos você em juízo.",
    },
    {
      q: "É seguro enviar meus dados de saúde para vocês?",
      a: "Sim. Dados de saúde são pessoais sensíveis (art. 11, LGPD) e tratamos com: criptografia AES-256 em repouso e TLS 1.3 em trânsito; segregação por usuário; você pode apagar tudo a qualquer momento em dois cliques; DPO nomeado e canal dedicado em privacidade@saudejusia.com.br. Nunca vendemos, nunca compartilhamos com operadoras, nunca usamos seus dados para treinar modelos de IA de terceiros.",
    },
    {
      q: "Vocês têm vínculo com a ANS ou com alguma operadora?",
      a: "Não. A SaudeJusia é uma iniciativa privada e independente. Não somos fiscalizados pela ANS, não somos parceiros de nenhuma operadora, não recebemos comissão quando você move um processo. Nosso único cliente é você.",
    },
    {
      q: "E se a operadora continuar negando depois da reconsideração e da NIP?",
      a: "Esgotada a via administrativa, o caminho é o Judiciário. A SaudeJusia prepara um dossiê organizado (cronologia dos pedidos, negativas, respostas da ANS, documentos médicos) que você leva a um advogado de sua escolha. Escritório e advogado são contratação sua, direta, sem intermediação nossa.",
    },
    {
      q: "Quanto custa usar a SaudeJusia?",
      a: "O Plano Livre é grátis para sempre e já resolve casos simples. O Plano Essencial custa R$ 29/mês e serve para quem tem um caso ativo agora — uma mensalidade é menos que uma caixa de remédio, e uma negativa revertida paga anos de assinatura. Sem fidelidade, cancela quando quiser.",
    },
    {
      q: "Quando o beta abre?",
      a: "O beta fechado está rodando com um grupo pequeno de beneficiários convidados. A abertura pública está prevista para o segundo semestre de 2026. Entre na waitlist para receber convite prioritário.",
    },
  ];
  return (
    <section id="faq" className="border-b border-border bg-surface">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <p className="caption">Perguntas frequentes</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-text-primary">
          Dúvidas comuns.
        </h2>
        <Accordion
          type="single"
          collapsible
          className="mt-12"
          onValueChange={(value) => {
            if (!value) return;
            const idx = Number(value.replace("item-", ""));
            const q = items[idx]?.q;
            if (q) trackEvent("FAQ Open", { question: q.slice(0, 50) });
          }}
        >
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
