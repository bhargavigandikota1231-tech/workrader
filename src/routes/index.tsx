import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, RefreshCw, Search, ThumbsDown, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, Card, SeverityBadge, SourceChip } from "@/components/wr/bits";
import { AiError, AttentionEmpty, BlockedEmpty, PartialDataBanner } from "@/components/wr/states";
import { TODAY_ACTIVITY, TEAM, TEAM_NAME } from "@/data/mockData";
import { blockedItems, compactItems, completedCount, formatDue, needsAttention, templateBrief, topWork } from "@/lib/derive";
import { useWork } from "@/lib/store";
import { useAi } from "@/lib/useAi";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · WorkRadar" },
      { name: "description", content: "Your team's day at a glance: AI morning brief, top work, blockers and what needs your attention." },
      { property: "og:title", content: "Dashboard · WorkRadar" },
      { property: "og:description", content: "Your team's day at a glance: AI morning brief, top work, blockers and what needs your attention." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { items, demo } = useWork();
  const navigate = useNavigate();
  const [nonce, setNonce] = useState(0);
  const [refreshed, setRefreshed] = useState("09:15");

  const top = topWork(items);
  const attention = demo === "empty" ? [] : needsAttention(items);
  const blocked = demo === "empty" ? [] : blockedItems(items);
  const done = completedCount(items);
  const highFlags = attention.filter((i) => i.severity === "High").length;

  const briefData = useMemo(
    () => JSON.stringify({ completedSinceYesterday: done, items: compactItems(items.filter((i) => !i.snoozed)) }),
    [items, done],
  );
  const ai = useAi("brief", briefData, { enabled: demo === "normal", nonce });
  const fallback = templateBrief(items);
  const failed = demo === "error" || (ai.data && !ai.data.ok) || ai.isError;
  const briefText = demo !== "normal" || failed ? fallback : ai.data?.text;

  const stats = [
    { label: "Top work today", value: top.length, sub: "ranked by AI score" },
    { label: "Completed since yesterday", value: done, sub: "across 4 tools" },
    { label: "Needs attention", value: attention.length, sub: `${highFlags} high` },
    { label: "Blocked people", value: blocked.length, sub: blocked[0] ? `longest ${blocked[0].blockedSince}h` : "none" },
  ];

  return (
    <div className="space-y-6">
      {demo === "error" && <PartialDataBanner onRetry={() => toast("GitHub still unreachable. Showing cached data.")} />}

      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label-mono">Friday, 16 October 2026 · {TEAM_NAME} team · {TEAM.length} people</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Good morning, Priya</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input readOnly onFocus={() => navigate({ to: "/search" })} onClick={() => navigate({ to: "/search" })} placeholder="Search work or ask…" className="h-11 w-full bg-card pl-9 sm:w-72" />
          </div>
          <Button variant="outline" className="bg-card" onClick={() => { const d = new Date(); setRefreshed(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`); toast("Updates refreshed"); }}>
            <RefreshCw /> Refreshed {refreshed}
          </Button>
        </div>
      </header>

      <section className="rounded-[var(--radius)] bg-navy p-6 text-navy-foreground">
        <p className="font-mono text-[11px] uppercase tracking-wider text-navy-muted">AI morning brief · built from 46 updates across 4 tools</p>
        {failed && <div className="mt-4"><AiError onRetry={() => setNonce((n) => n + 1)} /></div>}
        <p className="mt-3 max-w-4xl text-lg leading-relaxed">
          {demo === "normal" && ai.isLoading ? <span className="text-navy-muted">Writing today's brief…</span> : briefText}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Brief was helpful" className="text-navy-foreground hover:bg-navy-accent hover:text-navy-foreground" onClick={() => toast("Thanks — feedback recorded")}><ThumbsUp /></Button>
          <Button variant="ghost" size="icon" aria-label="Brief was not helpful" className="text-navy-foreground hover:bg-navy-accent hover:text-navy-foreground" onClick={() => toast("Thanks — we'll use this to improve")}><ThumbsDown /></Button>
          <Button variant="secondary" onClick={() => setNonce((n) => n + 1)} disabled={demo !== "normal" || ai.isFetching}>
            <RefreshCw className={ai.isFetching ? "animate-spin" : ""} /> Regenerate
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold">{s.value}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Top Work Today" action={<Link to="/feed" className="flex min-h-11 items-center gap-1 text-sm font-medium text-primary hover:underline">Open priority feed <ArrowRight className="h-4 w-4" /></Link>}>
          <ol className="divide-y divide-border">
            {top.map((i, n) => (
              <li key={i.id}>
                <Link to="/item/$id" params={{ id: i.id }} className="flex items-center gap-4 rounded-md py-3 hover:bg-muted/60">
                  <span className="w-6 text-center font-mono text-sm text-muted-foreground">{n + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{i.title}</p>
                    <p className="text-sm text-muted-foreground">{i.project} · {i.owner} · due {formatDue(i.due)}</p>
                  </div>
                  <SeverityBadge severity={i.severity} />
                </Link>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="What Happened Today">
          <ul className="space-y-3">
            {TODAY_ACTIVITY.map((a) => {
              const body = (
                <div className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm">{a.text}</p>
                    <p className="mt-1 flex items-center gap-2"><SourceChip source={a.source} /><span className="font-mono text-[11px] text-muted-foreground">{a.time}</span></p>
                  </div>
                </div>
              );
              return (
                <li key={a.id}>
                  {a.itemId ? <Link to="/item/$id" params={{ id: a.itemId }} className="block rounded-md p-1 hover:bg-muted/60">{body}</Link> : <div className="p-1">{body}</div>}
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="Needs Your Attention">
          {attention.length === 0 ? <AttentionEmpty /> : (
            <ul className="space-y-2">
              {attention.map((i) => (
                <li key={i.id}>
                  <Link to="/item/$id" params={{ id: i.id }} className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/60">
                    <SeverityBadge severity={i.severity} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{i.title}</p>
                      <p className="text-sm text-muted-foreground">{i.attention}</p>
                    </div>
                    <SourceChip source={i.source} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Who Is Blocked">
          {blocked.length === 0 ? <BlockedEmpty /> : (
            <ul className="divide-y divide-border">
              {blocked.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  <Avatar name={i.owner} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{i.owner} <span className="font-mono text-xs text-muted-foreground">{i.id}</span></p>
                    <p className="text-sm text-muted-foreground">Waiting on {i.blockedBy} · {i.blockedSince}h</p>
                  </div>
                  <Button variant="outline" asChild><Link to="/item/$id" params={{ id: i.id }}>Unblock</Link></Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">Every item links to its original source. AI summaries may be incomplete; rate them to improve accuracy.</p>
    </div>
  );
}
