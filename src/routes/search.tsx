import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, SourceChip } from "@/components/wr/bits";
import { NoResults } from "@/components/wr/states";
import type { Source, WorkItem } from "@/data/mockData";
import { compactItems, searchItems, sourcesForQuestion, templateAnswer } from "@/lib/derive";
import { useWork } from "@/lib/store";
import { useAi } from "@/lib/useAi";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search & Ask · WorkRadar" },
      { name: "description", content: "Search your team's work across Jira, Slack, GitHub and Email, or ask a question." },
      { property: "og:title", content: "Search & Ask · WorkRadar" },
      { property: "og:description", content: "Search your team's work across Jira, Slack, GitHub and Email, or ask a question." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

const SUGGESTIONS = ["Who has been blocked the longest?", "PRs waiting for review", "What did Billing Revamp ship this week?"];
const TABS: ("All" | Source)[] = ["All", "Jira", "GitHub", "Slack", "Email"];

function Cited({ text, sources }: { text: string; sources: WorkItem[] }) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <p className="leading-relaxed">
      {parts.map((p, n) => {
        const m = p.match(/^\[(\d+)\]$/);
        const src = m ? sources[Number(m[1]) - 1] : undefined;
        return src ? (
          <Link key={n} to="/item/$id" params={{ id: src.id }} className="mx-0.5 rounded bg-info px-1 font-mono text-xs text-primary hover:underline">{p}</Link>
        ) : <Fragment key={n}>{p}</Fragment>;
      })}
    </p>
  );
}

function SearchPage() {
  const { items } = useWork();
  const [query, setQuery] = useState("");
  const [asked, setAsked] = useState("");
  const [tab, setTab] = useState<"All" | Source>("All");

  const results = useMemo(() => searchItems(items, query), [items, query]);
  const sources = useMemo(() => (asked ? sourcesForQuestion(items, asked) : []), [items, asked]);
  const data = useMemo(
    () => JSON.stringify({ sources: compactItems(sources).map((s, n) => ({ n: n + 1, ...s, timeline: sources[n].timeline })) }),
    [sources],
  );
  const ai = useAi("answer", data, { question: asked, enabled: !!asked && sources.length > 0 });
  const answer = !sources.length ? templateAnswer(asked, sources) : ai.data?.ok ? ai.data.text : templateAnswer(asked, sources);

  const ask = (q: string) => { setQuery(q); setAsked(q.trim()); };
  const filtered = results.filter((r) => tab === "All" || r.source === tab);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Search & Ask</h1>
        <p className="mt-1 text-muted-foreground">Find any ticket, PR, thread or email — or ask a question about your team's work.</p>
      </header>

      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); if (query.trim()) setAsked(query.trim()); }}>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search work or ask a question…" className="h-14 bg-card pl-12 text-base" aria-label="Search work or ask a question" />
        </div>
        <Button type="submit" size="lg" className="h-14" disabled={!query.trim()}><Sparkles /> Ask</Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => ask(s)} className="min-h-11 rounded-full border border-border bg-card px-4 text-sm hover:border-primary hover:text-primary">{s}</button>
        ))}
      </div>

      {asked && (
        <Card title="Answer" action={<span className="label-mono">{asked}</span>}>
          {ai.isLoading ? <p className="text-muted-foreground">Looking through your team's data…</p> : <Cited text={answer} sources={sources} />}
          {ai.data && !ai.data.ok && <p className="mt-2 text-xs text-sev-high-fg">AI unavailable — answer computed directly from the data.</p>}
          {sources.length > 0 && (
            <ol className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
              {sources.map((s, n) => (
                <li key={s.id}>
                  <Link to="/item/$id" params={{ id: s.id }} className="flex min-h-9 items-center gap-2 hover:text-primary">
                    <span className="font-mono text-xs text-muted-foreground">[{n + 1}]</span><SourceChip source={s.source} /><span className="font-mono text-xs">{s.id}</span><span className="truncate">{s.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-4 text-xs text-muted-foreground">Answers use only your team's data. If data is missing, WorkRadar says so instead of guessing.</p>
        </Card>
      )}

      {query.trim() && (
        <section className="space-y-4">
          <div className="flex flex-wrap gap-1 border-b border-border" role="tablist">
            {TABS.map((t) => {
              const c = results.filter((r) => t === "All" || r.source === t).length;
              return (
                <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                  className={cn("min-h-11 border-b-2 px-4 text-sm", tab === t ? "border-primary font-medium text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
                  {t} <span className="font-mono text-xs">{c}</span>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 ? (
            results.length === 0 ? <NoResults query={query} onClear={() => { setQuery(""); setAsked(""); }} /> : <p className="text-sm text-muted-foreground">No {tab} results.</p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((r) => {
                const last = r.timeline[r.timeline.length - 1];
                return (
                  <li key={r.id}>
                    <Link to="/item/$id" params={{ id: r.id }} className="card-surface block p-4 hover:border-primary">
                      <p className="flex items-center gap-2"><SourceChip source={r.source} /><span className="font-mono text-xs text-muted-foreground">{r.id}</span></p>
                      <p className="mt-2 font-medium">{r.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{r.owner} · {r.project} — {last.text}</p>
                      <p className="mt-1 font-mono text-[11px] text-muted-foreground">{last.time}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
