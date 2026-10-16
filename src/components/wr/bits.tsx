import { cva } from "class-variance-authority";
import type { ReactNode } from "react";
import type { Severity, Source, Status } from "@/data/mockData";
import { initials } from "@/lib/derive";
import { cn } from "@/lib/utils";

const pill = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", {
  variants: {
    tone: {
      High: "bg-sev-high text-sev-high-fg",
      Medium: "bg-sev-medium text-sev-medium-fg",
      Low: "bg-sev-low text-sev-low-fg",
      Blocked: "bg-blocked text-blocked-fg",
      Done: "bg-done text-done-fg",
      Neutral: "bg-sev-low text-sev-low-fg",
      Info: "bg-info text-primary",
    },
  },
});

type Tone = "High" | "Medium" | "Low" | "Blocked" | "Done" | "Neutral" | "Info";
export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={pill({ tone })}>{children}</span>;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Pill tone={severity}>{severity}</Pill>;
}

export function StatusBadge({ status }: { status: Status }) {
  const tone: Tone = status === "Blocked" ? "Blocked" : status === "Done" ? "Done" : "Neutral";
  return <Pill tone={tone}>{status}</Pill>;
}

export function SourceChip({ source }: { source: Source }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-chip px-1.5 py-0.5 font-mono text-[11px] text-chip-fg">
      {source}
    </span>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-info font-mono text-xs font-medium text-primary",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export function Card({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("card-surface p-5", className)}>
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function ScoreBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted">
      <div className="h-1.5 rounded-full bg-primary" style={{ width: `${value}%` }} />
    </div>
  );
}
