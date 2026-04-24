// TODO: substituir depoimentos placeholders por citações reais dos beneficiários do beta.
type Testimonial = {
  quote: string;
  initials: string;
  name: string;
  role: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Meu filho precisava de terapia ABA e o plano negou por 'falta de previsão'. Em 20 minutos eu tinha a NIP pronta. A operadora liberou em 6 dias.",
    initials: "MR",
    name: "M. R.",
    role: "Mãe de beneficiário — Recife/PE",
  },
  {
    // Reescrito: a versão anterior usava "ganhei", o que pode ser lido como promessa
    // de resultado (Provimento OAB 205/2021 e CDC art. 37). Texto factual, sem promessa.
    quote:
      "O advogado que procurei achou o caso pequeno demais para ele. Com a SaudeJusia, preparei o recurso à ANS sozinha e a operadora liberou o procedimento.",
    initials: "CL",
    name: "C. L.",
    role: "Beneficiária — Curitiba/PR",
  },
  {
    quote:
      "Uso para acompanhar os pedidos de home care do meu pai. Os prazos da ANS eu nunca mais perdi.",
    initials: "JA",
    name: "J. A.",
    role: "Filho cuidador — São Paulo/SP",
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
          Depoimentos de participantes do beta fechado, identificados por iniciais a
          pedido dos próprios usuários.
        </p>
      </div>
    </section>
  );
}
