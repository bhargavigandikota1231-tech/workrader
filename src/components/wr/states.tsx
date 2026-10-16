import { AlertTriangle, CheckCircle2, SearchX, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function EmptyState({ title, text, icon }: { title: string; text?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      {icon ?? <CheckCircle2 className="h-8 w-8 text-done-fg" />}
      <p className="font-medium">{title}</p>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export const AttentionEmpty = () => <EmptyState title="All clear for now" text="No overdue tickets, failing builds or escalations." />;
export const BlockedEmpty = () => <EmptyState title="Nobody is blocked." />;

export function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="card-surface flex flex-col items-center gap-3 p-10 text-center">
      <SearchX className="h-8 w-8 text-muted-foreground" />
      <p className="font-medium">No results for '{query}'.</p>
      <p className="text-sm text-muted-foreground">Try a ticket ID, a teammate's name or a project.</p>
      <Button variant="outline" onClick={onClear}>Clear search</Button>
    </div>
  );
}

export function AiError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <XCircle className="h-6 w-6 shrink-0 text-sev-high-fg" />
      <div className="flex-1">
        <p className="font-semibold">We couldn't write today's brief</p>
        <p className="text-sm opacity-80">The AI service didn't respond. Your raw updates are still shown below.</p>
      </div>
      <Button variant="secondary" onClick={onRetry}>Try again</Button>
    </div>
  );
}

export function PartialDataBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="status" className="flex flex-col gap-3 rounded-[var(--radius)] border border-sev-medium-fg/30 bg-sev-medium p-4 text-sev-medium-fg sm:flex-row sm:items-center">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm">
        <strong>Partial data:</strong> GitHub could not be reached. Pull requests and builds are shown as of 08:42.
      </p>
      <Button variant="outline" onClick={onRetry}>Retry now</Button>
    </div>
  );
}
