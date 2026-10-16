import { createFileRoute, Link } from "@tanstack/react-router";
import { Lightbulb, ThumbsDown, ThumbsUp } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ItemActionButtons } from "@/components/wr/ItemActions";
import { Card, Pill, ScoreBar, SeverityBadge, SourceChip, StatusBadge } from "@/components/wr/bits";
import { EmptyState } from "@/components/wr/states";
import { compactItems, formatDue, rankOf, templateSummary } from "@/lib/derive";
import { useWork } from "@/lib/store";
import { useAi } from "@/lib/useAi";

export const Route = createFileRoute("/item/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} · WorkRadar` },
      { name: "description", content: `AI summary, timeline and priority breakdown for ${params.id}.` },
      { property: "og:title", content: `${params.id} · WorkRadar` },
      { property: "og:description", content: `AI summary, timeline and priority breakdown for ${params.id}.` },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ItemDetail,
});

function ItemDetail() {
  const { id } = Route.useParams();
  const { items, getItem } = useWork();
  const item = getItem(id);
  const data = useMemo(() => (item ? JSON.stringify({ item: { ...compactItems([item])[0], reason: item.aiReason, timeline: item.timeline } }) : ""), [item]);
  const ai = useAi("summary", data, { enabled: !!item });

  if (!item) {
    return (
      <div className="card-surface p-8">
        <EmptyState title="Item not found" text={`We couldn't find "${id}" in your team's work.`} />
        <div className="text-center"><Button asChild variant="outline"><Link to="/feed">Back to Priority Feed</Link></Button></div>
      </div>
    );
  }

  const rank = rankOf(items, item.id);
  const failed = (ai.data && !ai.data.ok) || ai.isError;
  const summary = ai.data?.ok ? ai.data.text : templateSummary(item);

  const details: [string, React.ReactNode][] = [
    ["Status", <StatusBadge key="s" status={item.status} />],
    ["Owner", item.owner],
    ["Waiting on", item.blockedBy ? `${item.blockedBy} · ${item.blockedSince}h` : "—"],
    ["Project", item.project],
    ["Due", formatDue(item.due)],
    ["Priority score", <span key="p" className="font-mono">{item.priorityScore}</span>],
  ];

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/feed" className="hover:text-primary">Priority Feed</Link> <span className="mx-1">/</span> <span className="font-mono text-foreground">{item.id}</span>
      </nav>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={item.severity} />
          {rank && <Pill tone="Info">Rank #{rank}</Pill>}
          {item.status === "Blocked" && <Pill tone="Blocked">Blocked {item.blockedSince}h</Pill>}
          {item.status === "Done" && <Pill tone="Done">Done</Pill>}
          {item.snoozed && <Pill tone="Neutral">Snoozed · {item.snoozed}</Pill>}
          <SourceChip source={item.source} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{item.title}</h1>
        <p className="text-muted-foreground">{item.project} · {item.owner} · due {formatDue(item.due)}</p>
        <ItemActionButtons item={item} />
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <Card title="AI Summary">
            {ai.isLoading ? <p className="text-muted-foreground">Summarising updates…</p> : <p className="leading-relaxed">{summary}</p>}
            {failed && <p className="mt-2 text-xs text-sev-high-fg">AI unavailable — showing a summary computed from the raw data.</p>}
            <div className="mt-4 flex gap-3 rounded-lg bg-info p-4">
              <Lightbulb className="h-5 w-5 shrink-0 text-primary" />
              <div><p className="text-sm font-semibold text-primary">Suggested next step</p><p className="mt-1 text-sm">{item.nextStep}</p></div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              Was this summary accurate?
              <Button variant="outline" onClick={() => toast("Thanks — feedback recorded")}><ThumbsUp /> Yes</Button>
              <Button variant="outline" onClick={() => toast("Thanks — we'll use this to improve")}><ThumbsDown /> No</Button>
            </div>
          </Card>

          <Card title="Activity Timeline">
            <ol className="relative space-y-5 border-l border-border pl-5">
              {item.timeline.map((t, n) => (
                <li key={n} className="relative">
                  <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
                  <p className="flex items-center gap-2"><span className="font-mono text-xs text-muted-foreground">{t.time}</span><SourceChip source={t.source} /></p>
                  <p className="mt-1 text-sm">{t.text}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Details">
            <dl className="space-y-3 text-sm">
              {details.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right">{v}</dd></div>
              ))}
            </dl>
          </Card>
          <Card title={rank ? `Why it ranks #${rank}` : "Score breakdown"}>
            <div className="space-y-3">
              {(Object.entries(item.factors) as [string, number][]).map(([k, v]) => (
                <div key={k}>
                  <div className="mb-1 flex justify-between text-sm"><span className="capitalize">{k}</span><span className="font-mono text-muted-foreground">{v}</span></div>
                  <ScoreBar value={v} />
                </div>
              ))}
            </div>
          </Card>
          {item.related?.length ? (
            <Card title="Related items">
              <ul className="space-y-1">
                {item.related.map((r) => {
                  const rel = getItem(r);
                  return rel ? (
                    <li key={r}>
                      <Link to="/item/$id" params={{ id: r }} className="flex min-h-11 items-center gap-2 rounded-md px-2 text-sm hover:bg-muted">
                        <span className="font-mono text-xs text-muted-foreground">{r}</span><span className="truncate">{rel.title}</span>
                      </Link>
                    </li>
                  ) : null;
                })}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
