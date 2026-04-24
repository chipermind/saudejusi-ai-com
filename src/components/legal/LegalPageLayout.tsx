import { Link } from "@tanstack/react-router";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";

export type TocItem = { id: string; label: string };

type LegalPageKey = "termos" | "privacidade" | "lgpd";

const PAGE_LABEL: Record<LegalPageKey, string> = {
  termos: "Termos de Uso",
  privacidade: "Política de Privacidade",
  lgpd: "LGPD — Direitos do Titular",
};

interface LegalPageLayoutProps {
  current: LegalPageKey;
  title: string;
  lastUpdated: string;
  version?: string;
  toc: TocItem[];
  children: React.ReactNode;
}

export function LegalPageLayout({
  current,
  title,
  lastUpdated,
  version = "1.0",
  toc,
  children,
}: LegalPageLayoutProps) {
  const otherPages = (Object.keys(PAGE_LABEL) as LegalPageKey[]).filter((k) => k !== current);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-6 py-16">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-text-tertiary">
          <Link to="/" className="hover:text-text-secondary">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span>Legal</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-text-secondary">{PAGE_LABEL[current]}</span>
        </nav>

        {/* Banner — versão preliminar */}
        <div
          role="alert"
          className="mb-10 flex gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm leading-relaxed text-text-secondary"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
          <p>
            <span className="font-medium text-text-primary">
              Versão preliminar 1.0 — em revisão jurídica.
            </span>{" "}
            A versão final será publicada antes da abertura pública do beta. Para dúvidas,
            escreva para{" "}
            <a
              href="mailto:privacidade@saudejusia.com.br"
              className="text-primary hover:text-primary/80"
            >
              privacidade@saudejusia.com.br
            </a>
            .
          </p>
        </div>

        {/* Header do documento */}
        <header className="mb-10">
          <p className="caption">Legal</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-text-primary">
            {title}
          </h1>
          <p className="mt-3 text-sm text-text-tertiary">
            Última atualização: {lastUpdated} · Versão: {version}
          </p>
        </header>

        {/* Sumário */}
        <nav
          aria-label="Sumário"
          className="mb-12 rounded-lg border border-border bg-surface p-5"
        >
          <h2 className="caption mb-3">Sumário</h2>
          <ol className="space-y-2 text-sm">
            {toc.map((item, i) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-text-secondary hover:text-text-primary"
                >
                  {i + 1}. {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Conteúdo */}
        <article className="legal-prose">{children}</article>

        {/* Links cruzados entre documentos legais */}
        <nav
          aria-label="Outros documentos legais"
          className="mt-16 border-t border-border pt-8"
        >
          <p className="caption mb-4">Continue lendo</p>
          <ul className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            {otherPages.map((key) => (
              <li key={key}>
                <Link
                  to={`/${key}`}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                >
                  {PAGE_LABEL[key]}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

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
