import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItemActionMenu } from "@/components/wr/ItemActions";
import { Pill, ScoreBar, SeverityBadge, SourceChip } from "@/components/wr/bits";
import { EmptyState } from "@/components/wr/states";
import type { Severity, WorkItem } from "@/data/mockData";
import { byScore, formatDue, isOpen } from "@/lib/derive";
import { useWork } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Priority Feed · WorkRadar" },
      { name: "description", content: "All team work ranked by AI priority score: urgency, impact, dependencies and age." },
      { property: "og:title", content: "Priority Feed · WorkRadar" },
      { property: "og:description", content: "All team work ranked by AI priority score: urgency, impact, dependencies and age." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Feed,
});

type StatusFilter = "Open" | "Snoozed" | "Done";
type Sort = "score" | "due" | "waiting";

const statusMatch: Record<StatusFilter, (i: WorkItem) => boolean> = {
  Open: isOpen,
  Snoozed: (i) => !!i.snoozed && i.status !== "Done",
  Done: (i) => i.status === "Done",
};

function Feed() {
  const { items } = useWork();
  const [sev, setSev] = useState<Severity | "All">("All");
  const [status, setStatus] = useState<StatusFilter>("Open");
  const [sort, setSort] = useState<Sort>("score");

  const inStatus = items.filter(statusMatch[status]);
  const rankMap = new Map([...items].filter(isOpen).sort(byScore).map((i, n) => [i.id, n + 1]));
  const list = inStatus
    .filter((i) => sev === "All" || i.severity === sev)
    .sort((a, b) => (sort === "due" ? a.due.localeCompare(b.due) : sort === "waiting" ? (b.blockedSince ?? 0) - (a.blockedSince ?? 0) : byScore(a, b)));

  const count = (s: Severity | "All") => inStatus.filter((i) => s === "All" || i.severity === s).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Priority Feed</h1>
        <p className="mt-1 text-muted-foreground">All team work ranked by AI priority score: urgency, impact, dependencies and age.</p>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Severity filter">
          {(["All", "High", "Medium", "Low"] as const).map((s) => (
            <button key={s} onClick={() => setSev(s)} aria-pressed={sev === s}
              className={cn("min-h-11 rounded-full border px-4 text-sm font-medium transition-colors", sev === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted")}>
              {s} <span className="ml-1 font-mono text-xs opacity-80">{count(s)}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg border border-border bg-card p-1" role="group" aria-label="Status filter">
            {(["Open", "Snoozed", "Done"] as const).map((s) => (
              <button key={s} onClick={() => setStatus(s)} aria-pressed={status === s}
                className={cn("min-h-9 rounded-md px-3 text-sm", status === s ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground")}>
                {s}
              </button>
            ))}
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="h-11 w-48 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="score">AI priority score</SelectItem>
              <SelectItem value="due">Due date</SelectItem>
              <SelectItem value="waiting">Time waiting</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="hidden grid-cols-[48px_1fr_200px_80px_120px_90px_48px] gap-4 border-b border-border px-5 py-3 label-mono md:grid">
          <span>Rank</span><span>Item</span><span>Owner · Project</span><span>Due</span><span>Score</span><span>Severity</span><span />
        </div>
        {list.length === 0 ? (
          <EmptyState title={`No ${status.toLowerCase()} items`} text="Try another filter." />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((i) => (
              <li key={i.id} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 px-4 py-4 hover:bg-muted/40 md:grid-cols-[48px_1fr_200px_80px_120px_90px_48px] md:gap-4 md:px-5">
                <span className="font-mono text-sm text-muted-foreground">{rankMap.get(i.id) ?? "—"}</span>
                <Link to="/item/$id" params={{ id: i.id }} className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium hover:text-primary">
                    <SourceChip source={i.source} /> <span className="font-mono text-xs text-muted-foreground">{i.id}</span>
                    {i.blockedBy && i.status !== "Done" && <Pill tone="Blocked">Waiting {i.blockedSince}h</Pill>}
                    {i.snoozed && <Pill tone="Info">Snoozed · {i.snoozed}</Pill>}
                  </p>
                  <p className="mt-1 font-medium">{i.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">AI: {i.aiReason}</p>
                  <p className="mt-1 text-sm text-muted-foreground md:hidden">{i.owner} · due {formatDue(i.due)} · score {i.priorityScore}</p>
                </Link>
                <div className="hidden text-sm md:block"><p>{i.owner}</p><p className="text-muted-foreground">{i.project}</p></div>
                <span className="hidden text-sm md:block">{formatDue(i.due)}</span>
                <div className="hidden items-center gap-2 md:flex"><span className="w-7 font-mono text-sm">{i.priorityScore}</span><ScoreBar value={i.priorityScore} /></div>
                <span className="hidden md:block"><SeverityBadge severity={i.severity} /></span>
                <ItemActionMenu item={i} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">Only work items are scored, never people.</p>
    </div>
  );
}
