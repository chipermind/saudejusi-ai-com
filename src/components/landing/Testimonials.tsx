// TODO: substituir depoimentos placeholders por citações reais dos pilotos do beta.
type Testimonial = {
  quote: string;
  initials: string;
  name: string;
  role: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Cortei pela metade o tempo de montagem de caso. O que eu fazia em 3 dias, saio com rascunho pronto na mesma tarde.",
    initials: "MA",
    name: "Dra. M. A.",
    role: "Sócia em escritório boutique de direito médico, São Paulo/SP",
  },
  {
    quote:
      "A previsão de procedência por comarca me ajudou a calibrar expectativa com o cliente logo na primeira reunião. Mudou a conversa comercial.",
    initials: "RT",
    name: "Dr. R. T.",
    role: "Advogado autônomo, Belo Horizonte/MG",
  },
  {
    quote:
      "Recurso administrativo à ANS era a parte que mais atrasava no meu fluxo. Agora sai em 20 minutos.",
    initials: "CS",
    name: "Dra. C. S.",
    role: "Sócia de banca com 4 advogados, Recife/PE",
  },
];

export function Testimonials() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <p className="caption">Prova social</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-text-primary">
            Quem já está usando no beta.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex h-full flex-col rounded-xl border border-border bg-surface p-6"
            >
              <blockquote className="flex-1 text-sm italic leading-relaxed text-text-secondary">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-semibold text-primary"
                  aria-hidden="true"
                >
                  {t.initials}
                </div>
                <div className="text-xs">
                  <p className="font-medium text-text-primary">{t.name}</p>
                  <p className="mt-0.5 text-text-tertiary">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-10 text-xs text-text-tertiary">
          Depoimentos de escritórios participantes do beta fechado, com iniciais por
          solicitação dos profissionais.
        </p>
      </div>
    </section>
  );
}
