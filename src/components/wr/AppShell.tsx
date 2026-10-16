import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ListOrdered, Menu, Radar, RotateCcw, Search, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useWork, type DemoState } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/feed", label: "Priority Feed", icon: ListOrdered },
  { to: "/search", label: "Search & Ask", icon: Search },
] as const;

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-navy-foreground">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
        <Radar className="h-5 w-5" />
      </span>
      <span className="text-lg font-semibold tracking-tight">WorkRadar</span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => {
        const active = n.to === "/" ? path === "/" : path.startsWith(n.to) || (n.to === "/feed" && path.startsWith("/item"));
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-navy-muted hover:bg-navy-accent hover:text-navy-foreground",
            )}
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  const { demo, setDemo, reset } = useWork();
  const states: DemoState[] = ["normal", "empty", "error"];
  return (
    <div className="space-y-4 border-t border-navy-accent pt-4 text-xs text-navy-muted">
      <div>
        <p className="font-mono uppercase tracking-wider">Demo states</p>
        <div className="mt-2 grid grid-cols-3 gap-1 rounded-lg bg-navy-accent p-1" role="radiogroup" aria-label="Dashboard demo state">
          {states.map((s) => (
            <button
              key={s}
              role="radio"
              aria-checked={demo === s}
              onClick={() => setDemo(s)}
              className={cn(
                "min-h-9 rounded-md capitalize transition-colors",
                demo === s ? "bg-navy-foreground text-navy" : "hover:text-navy-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <button onClick={reset} className="flex min-h-9 items-center gap-2 hover:text-navy-foreground">
        <RotateCcw className="h-3.5 w-3.5" /> Reset demo data
      </button>
      <p className="leading-relaxed">
        <span className="font-mono uppercase tracking-wider">Connected sources:</span>
        <br />Jira · Slack · GitHub · Email
        <br />— Demo mode: mock data
      </p>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between bg-navy p-5 md:flex">
        <div className="space-y-8">
          <Logo />
          <NavLinks />
        </div>
        <SidebarFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-navy px-4 py-2 md:hidden">
          <Logo />
          <Button variant="ghost" size="icon" className="text-navy-foreground hover:bg-navy-accent hover:text-navy-foreground" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </Button>
        </header>
        {open && (
          <div className="z-20 space-y-4 bg-navy p-4 md:hidden">
            <NavLinks onNavigate={() => setOpen(false)} />
            <SidebarFooter />
          </div>
        )}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
