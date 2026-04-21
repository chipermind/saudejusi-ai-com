import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

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
          "Plataforma de IA para escritórios de direito médico. Do laudo à liminar em 48 horas.",
      },
      { name: "author", content: "Defere" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Defere — Inteligência jurídica em saúde suplementar" },
      { name: "twitter:title", content: "Defere — Inteligência jurídica em saúde suplementar" },
      { name: "description", content: "Defere is a B2B SaaS platform that automates the analysis of health insurance coverage denials and generates comprehensive legal documentation for lawyers." },
      { property: "og:description", content: "Defere is a B2B SaaS platform that automates the analysis of health insurance coverage denials and generates comprehensive legal documentation for lawyers." },
      { name: "twitter:description", content: "Defere is a B2B SaaS platform that automates the analysis of health insurance coverage denials and generates comprehensive legal documentation for lawyers." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5041c031-6cb9-49c1-a62a-18c33a38fe95/id-preview-f0bc17f8--f751e5d3-39e9-4cd2-b492-5620facf2a10.lovable.app-1776810309076.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5041c031-6cb9-49c1-a62a-18c33a38fe95/id-preview-f0bc17f8--f751e5d3-39e9-4cd2-b492-5620facf2a10.lovable.app-1776810309076.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
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
