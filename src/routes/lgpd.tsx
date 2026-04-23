import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const Route = createFileRoute("/lgpd")({
  head: () => ({
    meta: [
      { title: "LGPD — Defere" },
      { name: "description", content: "Conformidade LGPD da plataforma Defere." },
    ],
  }),
  component: LgpdPage,
});

function LgpdPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <p className="caption">Legal</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text-primary">
          LGPD
        </h1>
        <p className="mt-8 text-base leading-relaxed text-text-secondary">
          Documento em elaboração. Última atualização: abril/2026. Para dúvidas,
          escreva para{" "}
          <a
            href="mailto:contato@defere.com.br"
            className="text-primary hover:text-primary/80"
          >
            contato@defere.com.br
          </a>
          .
        </p>
        <div className="mt-12">
          <Link
            to="/"
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            ← Voltar para a home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
