import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/plausible";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center">
          <Logo size="md" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="/#como-funciona"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Como funciona
          </a>
          <a
            href="/#direitos"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Direitos
          </a>
          <a
            href="/#precos"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Preços
          </a>
          <a
            href="/#faq"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/waitlist"
            onClick={() => trackEvent("CTA Click", { location: "header" })}
          >
            <Button size="sm">Entrar na waitlist</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
