import { Link } from "@tanstack/react-router";
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
              Tecnologia a serviço do beneficiário de plano de saúde.
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
              <li><a href="/#como-funciona" className="hover:text-text-primary">Como funciona</a></li>
              <li><a href="/#direitos" className="hover:text-text-primary">Direitos</a></li>
              <li><a href="/#precos" className="hover:text-text-primary">Preços</a></li>
            </ul>
          </div>

          <div>
            <h4 className="caption mb-4">Empresa</h4>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><a href="/#sobre" className="hover:text-text-primary">Sobre</a></li>
              {/* <li><Link to="/blog" className="hover:text-text-primary">Blog</Link></li> */}
              <li>
                <a href="mailto:contato@saudejusia.com.br" className="hover:text-text-primary">
                  Contato
                </a>
              </li>
              <li>
                <Link to="/termos" className="hover:text-text-primary">Termos de uso</Link>
              </li>
              <li>
                <Link to="/privacidade" className="hover:text-text-primary">Privacidade</Link>
              </li>
              <li>
                <Link to="/lgpd" className="hover:text-text-primary">LGPD</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 space-y-4 border-t border-border pt-8">
          <p className="text-xs text-text-tertiary">
            © 2026 SaudeJusia Tecnologia Ltda. CNPJ em processo de registro.
          </p>
          <p className="text-xs text-text-tertiary">
            Canal de contato:{" "}
            <a
              href="mailto:contato@saudejusia.com.br"
              className="hover:text-text-primary"
            >
              contato@saudejusia.com.br
            </a>
            .
          </p>
          <p className="max-w-3xl text-xs leading-relaxed text-text-tertiary">
            A SaudeJusia é uma plataforma de informação e geração de documentos para o
            próprio beneficiário. Não prestamos serviços jurídicos, não representamos
            usuários em juízo e não somos intermediadores de advocacia. Para ação
            judicial, consulte um advogado de sua confiança.
          </p>
        </div>
      </div>
    </footer>
  );
}
