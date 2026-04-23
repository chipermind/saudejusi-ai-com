import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

// NOTE: Update `data-domain` when migrating to the production domain (saudejusia.com.br).
const PLAUSIBLE_DOMAIN = "defere-ia-com.lovable.app";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar para a home
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
      { title: "SaudeJusia — Seus direitos no plano de saúde" },
      {
        name: "description",
        content:
          "Plataforma que ajuda beneficiários de plano de saúde a entender e exercer seus direitos. Gere notificações, recursos à ANS e reconsiderações sem precisar de advogado.",
      },
      { name: "author", content: "SaudeJusia" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:title", content: "SaudeJusia — Seus direitos no plano de saúde" },
      {
        property: "og:description",
        content:
          "Plataforma que ajuda beneficiários de plano de saúde a entender e exercer seus direitos. Gere notificações, recursos à ANS e reconsiderações sem precisar de advogado.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "SaudeJusia — Seus direitos no plano de saúde" },
      {
        name: "twitter:description",
        content:
          "Entenda e exerça seus direitos como beneficiário. Gere documentos sem advogado.",
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
    <html lang="pt-BR">
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
