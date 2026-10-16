import { COMPLETED_BASELINE, TODAY, WORK_ITEMS, type WorkItem } from "@/data/mockData";

export const isOpen = (i: WorkItem) => i.status !== "Done" && !i.snoozed;
export const byScore = (a: WorkItem, b: WorkItem) => b.priorityScore - a.priorityScore;
export const isOverdue = (i: WorkItem) => i.status !== "Done" && i.due < TODAY;

export function rankOf(items: WorkItem[], id: string) {
  const ranked = [...items].filter(isOpen).sort(byScore);
  const idx = ranked.findIndex((i) => i.id === id);
  return idx === -1 ? null : idx + 1;
}

export function topWork(items: WorkItem[]) {
  return items.filter(isOpen).sort(byScore).slice(0, 5);
}

export function needsAttention(items: WorkItem[]) {
  return items.filter((i) => isOpen(i) && i.attention).sort(byScore);
}

export function blockedItems(items: WorkItem[]) {
  return items
    .filter((i) => isOpen(i) && i.blockedBy)
    .sort((a, b) => (b.blockedSince ?? 0) - (a.blockedSince ?? 0));
}

export function completedCount(items: WorkItem[]) {
  const originallyDone = new Set(WORK_ITEMS.filter((i) => i.status === "Done").map((i) => i.id));
  return COMPLETED_BASELINE + items.filter((i) => i.status === "Done" && !originallyDone.has(i.id)).length;
}

export function formatDue(due: string) {
  const d = new Date(due + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

export function compactItems(items: WorkItem[]) {
  return items.map((i) => ({
    id: i.id,
    title: i.title,
    project: i.project,
    source: i.source,
    owner: i.owner,
    status: i.snoozed ? `Snoozed (${i.snoozed})` : i.status,
    severity: i.severity,
    due: i.due,
    score: i.priorityScore,
    blockedBy: i.blockedBy,
    blockedHours: i.blockedSince,
    flag: i.attention,
  }));
}

export function templateBrief(items: WorkItem[]) {
  const top = topWork(items);
  const blocked = blockedItems(items);
  const done = completedCount(items);
  const attention = needsAttention(items);
  if (top.length === 0) return `All tracked work is done or snoozed. The team completed ${done} items since yesterday.`;
  const highRisk = top.filter((i) => i.severity === "High");
  const parts: string[] = [];
  parts.push(
    highRisk.length
      ? `${highRisk.length} high-severity item${highRisk.length > 1 ? "s are" : " is"} at risk today: ${highRisk.map((i) => `${i.title} (${i.id})`).join(", ")}.`
      : `Top priority today is ${top[0]!.title} (${top[0]!.id}).`,
  );
  if (blocked[0])
    parts.push(
      `${blocked[0].owner} has been blocked longest, ${blocked[0].blockedSince}h waiting on ${blocked[0].blockedBy} (${blocked[0].id}).`,
    );
  parts.push(`The team completed ${done} items since yesterday; ${attention.length} flag${attention.length === 1 ? "" : "s"} need your attention.`);
  return parts.join(" ");
}

export function templateSummary(i: WorkItem) {
  const blocked = i.blockedBy ? ` It has been waiting on ${i.blockedBy} for ${i.blockedSince}h.` : "";
  const last = i.timeline[i.timeline.length - 1]!;
  return `${i.id} — "${i.title}" — is a ${i.severity.toLowerCase()}-severity ${i.project} item owned by ${i.owner}, currently ${i.status.toLowerCase()} and due ${formatDue(i.due)}.${blocked} ${i.aiReason} Latest update (${last.source}): ${last.text}`;
}

export function searchItems(items: WorkItem[], q: string) {
  const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 1 && !STOP.has(t));
  if (!terms.length) return [];
  return items
    .map((i) => {
      const hay = [i.id, i.title, i.owner, i.project, i.source, i.status, i.blockedBy ?? "", ...i.timeline.map((t) => t.text)]
        .join(" ")
        .toLowerCase();
      const score = terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
      return { item: i, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || byScore(a.item, b.item))
    .map((r) => r.item);
}

const STOP = new Set(["the", "who", "what", "has", "been", "for", "is", "are", "did", "this", "week", "a", "an", "of", "to", "on", "in", "and", "waiting", "longest", "ship"]);

export function sourcesForQuestion(items: WorkItem[], q: string): WorkItem[] {
  const ql = q.toLowerCase();
  if (ql.includes("blocked")) return blockedItems(items);
  if (ql.includes("pr") || ql.includes("review")) return items.filter((i) => i.id.startsWith("PR") && i.status !== "Done");
  const proj = ["billing", "mobile"].find((p) => ql.includes(p));
  if (proj) return items.filter((i) => i.project.toLowerCase().includes(proj)).sort(byScore).slice(0, 6);
  return searchItems(items, q).slice(0, 6);
}

export function templateAnswer(q: string, sources: WorkItem[]) {
  if (!sources.length) return "I couldn't find anything in your team's data that answers this. Try a ticket ID, a teammate's name or a project.";
  const ql = q.toLowerCase();
  if (ql.includes("blocked")) {
    const b = sources[0]!;
    return `${b.owner} has been blocked the longest: ${b.blockedSince}h on ${b.id}, waiting on ${b.blockedBy} [1].` +
      (sources[1] ? ` Next is ${sources[1].owner} at ${sources[1].blockedSince}h on ${sources[1].id} [2].` : "");
  }
  return sources
    .slice(0, 3)
    .map((s, n) => `${s.id} "${s.title}" (${s.owner}, ${s.status.toLowerCase()}) [${n + 1}].`)
    .join(" ");
}
