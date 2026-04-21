import { createFileRoute, Link, Outlet, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  BookOpen,
  FileText,
  Bell,
  Search,
  Settings,
  LogOut,
  ChevronUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppContext {
  fullName: string;
  firmName: string;
  initials: string;
}

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

const navItems = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/casos", label: "Casos", icon: FolderOpen, exact: false },
  { to: "/app/jurimetria", label: "Jurimetria", icon: BarChart3, exact: false },
  { to: "/app/jurisprudencia", label: "Jurisprudência", icon: BookOpen, exact: false },
  { to: "/app/minutas", label: "Minutas", icon: FileText, exact: false },
] as const;

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ctx, setCtx] = useState<AppContext>({
    fullName: "Carregando...",
    firmName: "",
    initials: "—",
  });

  useEffect(() => {
    async function load() {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: lawyer } = await supabase
        .from("lawyers")
        .select("full_name, law_firm_id, law_firms(name)")
        .eq("id", u.user.id)
        .maybeSingle();

      const fullName = lawyer?.full_name ?? u.user.email ?? "Usuário";
      const firmRel = (lawyer as { law_firms?: { name?: string } | null } | null)?.law_firms;
      const firmName: string = firmRel?.name ?? "";
      const initials = fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p: string) => p[0]?.toUpperCase())
        .join("");
      setCtx({ fullName, firmName, initials: initials || "U" });
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  // breadcrumb
  const crumbs = breadcrumbFor(location.pathname);

  return (
    <div className="flex min-h-screen bg-background text-text-primary">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-border bg-surface">
        <div className="flex h-12 items-center border-b border-border px-4">
          <Link to="/app">
            <Logo size="sm" />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                  active
                    ? "bg-surface-elevated text-text-primary"
                    : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-surface-elevated">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {ctx.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{ctx.fullName}</p>
                <p className="truncate text-xs text-text-tertiary">{ctx.firmName}</p>
              </div>
              <ChevronUp className="h-4 w-4 text-text-tertiary" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="w-56">
              <DropdownMenuItem onSelect={() => navigate({ to: "/app" })}>
                <Settings className="mr-2 h-4 w-4" /> Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout} className="text-danger">
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 items-center justify-between border-b border-border bg-background px-6">
          <nav className="flex items-center gap-2 text-sm">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-text-tertiary">/</span>}
                <span
                  className={
                    i === crumbs.length - 1
                      ? "text-text-primary"
                      : "text-text-tertiary"
                  }
                >
                  {c}
                </span>
              </span>
            ))}
          </nav>

          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
            <Input
              placeholder="Buscar casos, clientes..."
              className="h-8 border-border bg-surface pl-9 text-sm"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary">
              ⌘K
            </kbd>
          </div>

          <button
            aria-label="Notificações"
            className="relative flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function breadcrumbFor(path: string): string[] {
  if (path === "/app") return ["Defere", "Dashboard"];
  if (path.startsWith("/app/casos")) return ["Defere", "Casos"];
  if (path.startsWith("/app/jurimetria")) return ["Defere", "Jurimetria"];
  if (path.startsWith("/app/jurisprudencia")) return ["Defere", "Jurisprudência"];
  if (path.startsWith("/app/minutas")) return ["Defere", "Minutas"];
  return ["Defere"];
}
