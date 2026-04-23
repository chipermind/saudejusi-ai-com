import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

// NOTE: Update `data-domain` when migrating to the production domain (defere.com.br).
const PLAUSIBLE_DOMAIN = "defere-ia-com.lovable.app";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Defere — Inteligência jurídica em saúde suplementar" },
      {
        name: "description",
        content:
          "Defere — IA jurídica especializada em negativas de planos de saúde. Do laudo à liminar em 48 horas. Análise, jurimetria e geração de peças para escritórios de direito médico.",
      },
      { name: "author", content: "Defere" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://defere.com.br" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:title", content: "Defere — Inteligência jurídica em saúde suplementar" },
      {
        property: "og:description",
        content:
          "Do laudo à liminar em 48 horas. Análise de negativas de plano de saúde, jurimetria e geração de peças com IA.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Defere — Inteligência jurídica em saúde suplementar" },
      {
        name: "twitter:description",
        content: "Do laudo à liminar em 48 horas. Para escritórios de direito médico.",
      },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [
      // Plausible — cookieless, LGPD-compliant. Tagged-events build supports custom events.
      {
        defer: true,
        "data-domain": PLAUSIBLE_DOMAIN,
        src: "https://plausible.io/js/script.tagged-events.js",
      },
      // Bridge so window.plausible() is callable before the async script loads.
      {
        children:
          "window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
