export function SobreSection() {
  return (
    <section id="sobre" className="border-b border-border bg-background">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <p className="caption">Sobre</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-text-primary">
          Construído por quem atua no contencioso de saúde.
        </h2>
        <p className="mt-6 text-base leading-relaxed text-text-secondary">
          O Defere nasceu da observação de um gargalo real: advogados de direito médico
          gastam metade do tempo produtivo em tarefas de análise e redação que a IA já
          faz bem, enquanto o trabalho estratégico — negociação, audiência,
          relacionamento com o cliente — fica espremido. Estamos construindo a
          ferramenta que queríamos ter quando operávamos o contencioso todos os dias.
        </p>
      </div>
    </section>
  );
}
