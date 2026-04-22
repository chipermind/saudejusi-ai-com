import { Logo } from "@/components/Logo";
import { Linkedin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <Logo size="md" />
            <p className="mt-4 text-sm text-text-tertiary">
              Tecnologia jurídica para escritórios de direito médico.
            </p>
            <a
              href="https://linkedin.com"
              className="mt-6 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>

          <div>
            <h4 className="caption mb-4">Produto</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><a href="#produto" className="hover:text-text-primary">Como funciona</a></li>
              <li><a href="#jurimetria" className="hover:text-text-primary">Jurimetria</a></li>
              <li><a href="#precos" className="hover:text-text-primary">Preços</a></li>
            </ul>
          </div>

          <div>
            <h4 className="caption mb-4">Empresa</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li className="text-text-tertiary">Contato: em breve.</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 space-y-4 border-t border-border pt-8">
          <p className="text-xs text-text-tertiary">
            © 2026 Defere Tecnologia Jurídica Ltda.
          </p>
          <p className="max-w-3xl text-xs leading-relaxed text-text-tertiary">
            Defere é uma ferramenta de apoio à atividade advocatícia. Não presta serviços
            jurídicos e não substitui a análise de advogado devidamente habilitado.
          </p>
        </div>
      </div>
    </footer>
  );
}
