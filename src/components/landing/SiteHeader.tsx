import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center">
          <Logo size="md" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="/#produto"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Produto
          </a>
          <a
            href="/#jurimetria"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Jurimetria
          </a>
          <a
            href="/#precos"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Preços
          </a>
          <a
            href="/#sobre"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Sobre
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Entrar na waitlist</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
