export type Source = "Jira" | "Slack" | "GitHub" | "Email";
export type Status = "To do" | "In progress" | "Blocked" | "Done";
export type Severity = "High" | "Medium" | "Low";

export interface TimelineEvent {
  time: string;
  source: Source;
  text: string;
}

export interface WorkItem {
  id: string;
  title: string;
  project: string;
  source: Source;
  owner: string;
  status: Status;
  severity: Severity;
  due: string; // YYYY-MM-DD
  priorityScore: number;
  aiReason: string;
  blockedBy?: string;
  blockedSince?: number;
  attention?: string;
  factors: { urgency: number; impact: number; dependencies: number; age: number };
  related?: string[];
  nextStep: string;
  timeline: TimelineEvent[];
  snoozed?: string | null;
}

export const TODAY = "2026-10-16";
export const TEAM_NAME = "Product Platform";
export const MANAGER = "Priya Menon";
export const PROJECTS = ["Billing Revamp", "Mobile App v2"];

export const TEAM = [
  { name: "Priya Menon", role: "Manager" },
  { name: "Arjun Rao", role: "Senior Engineer" },
  { name: "Meera Iyer", role: "Backend Engineer" },
  { name: "Kabir Shah", role: "Backend Engineer" },
  { name: "Sana Khan", role: "Product Designer" },
  { name: "Rahul Nair", role: "DevOps Engineer" },
  { name: "Leo Fernandes", role: "Mobile Engineer" },
  { name: "Ana Gomes", role: "QA Engineer" },
  { name: "Dev Patel", role: "Frontend Engineer" },
];

export const COMPLETED_BASELINE = 12;

export const WORK_ITEMS: WorkItem[] = [
  {
    id: "BIL-214",
    title: "Fix payment gateway timeout at checkout",
    project: "Billing Revamp",
    source: "Jira",
    owner: "Meera Iyer",
    status: "Blocked",
    severity: "High",
    due: "2026-10-17",
    priorityScore: 94,
    aiReason: "Customer-facing checkout failures; blocked 26h on an external dependency.",
    blockedBy: "vendor sandbox API key",
    blockedSince: 26,
    factors: { urgency: 95, impact: 92, dependencies: 88, age: 70 },
    related: ["PR #482", "BIL-231"],
    nextStep: "Escalate the sandbox API key request to the vendor account manager today and ask Meera to test against the staging key meanwhile.",
    timeline: [
      { time: "Oct 15 · 07:10", source: "Jira", text: "Ticket moved to Blocked by Meera Iyer." },
      { time: "Oct 15 · 07:25", source: "Email", text: "Meera emailed the vendor requesting a sandbox API key." },
      { time: "Oct 15 · 16:40", source: "Slack", text: "#billing: 'Still no reply from the vendor, checkout timeouts at 3.1%'." },
      { time: "Oct 16 · 08:05", source: "Jira", text: "Support linked 4 new customer reports to this ticket." },
    ],
  },
  {
    id: "PR #482",
    title: "Review invoice calculation logic",
    project: "Billing Revamp",
    source: "GitHub",
    owner: "Kabir Shah",
    status: "In progress",
    severity: "High",
    due: "2026-10-16",
    priorityScore: 91,
    aiReason: "Waiting for review 30h and blocks the invoice release.",
    blockedBy: "code review",
    blockedSince: 30,
    attention: "Pull request waiting for review for more than 24h.",
    factors: { urgency: 88, impact: 90, dependencies: 92, age: 80 },
    related: ["BIL-214", "BIL-231"],
    nextStep: "Ask Arjun Rao to review PR #482 this morning; it is the last blocker for the invoice release.",
    timeline: [
      { time: "Oct 15 · 03:12", source: "GitHub", text: "Kabir Shah opened PR #482 (+412 / −96)." },
      { time: "Oct 15 · 03:20", source: "GitHub", text: "Review requested from Arjun Rao." },
      { time: "Oct 15 · 14:02", source: "Slack", text: "Kabir: 'Can someone take a look at #482? Needed for invoices.'" },
      { time: "Oct 16 · 08:30", source: "GitHub", text: "CI checks passing, still no approving review." },
    ],
  },
  {
    id: "BUILD-1182",
    title: "billing-service build failing",
    project: "Billing Revamp",
    source: "GitHub",
    owner: "Rahul Nair",
    status: "In progress",
    severity: "High",
    due: "2026-10-16",
    priorityScore: 88,
    aiReason: "Main branch build failing for 3h; blocks all billing merges.",
    attention: "Main branch build failing for 3 hours.",
    factors: { urgency: 96, impact: 85, dependencies: 80, age: 30 },
    related: ["PR #482"],
    nextStep: "Have Rahul pin the broken dependency version and re-run the pipeline before more PRs pile up.",
    timeline: [
      { time: "Oct 16 · 06:12", source: "GitHub", text: "Build #1182 failed on main: dependency resolution error." },
      { time: "Oct 16 · 06:40", source: "Slack", text: "#deploys: Rahul is investigating the failure." },
      { time: "Oct 16 · 08:55", source: "GitHub", text: "Retry #2 failed with the same error." },
    ],
  },
  {
    id: "MOB-97",
    title: "Finalise push-notification retry spec",
    project: "Mobile App v2",
    source: "Jira",
    owner: "Arjun Rao",
    status: "In progress",
    severity: "Medium",
    due: "2026-10-18",
    priorityScore: 76,
    aiReason: "Mobile v2 sprint depends on this spec; due in 2 days.",
    factors: { urgency: 70, impact: 78, dependencies: 75, age: 45 },
    related: ["MOB-105", "MOB-112"],
    nextStep: "Book a 20-minute review with Leo and Sana to close the open retry-interval question.",
    timeline: [
      { time: "Oct 13 · 10:00", source: "Jira", text: "Spec draft attached by Arjun Rao." },
      { time: "Oct 15 · 11:30", source: "Slack", text: "Decision: use exponential backoff capped at 3 retries." },
      { time: "Oct 16 · 09:00", source: "Jira", text: "Arjun updated acceptance criteria." },
    ],
  },
  {
    id: "EMAIL-3021",
    title: "Reply to enterprise customer escalation on downtime",
    project: "Billing Revamp",
    source: "Email",
    owner: "Priya Menon",
    status: "To do",
    severity: "Medium",
    due: "2026-10-16",
    priorityScore: 72,
    aiReason: "Enterprise customer expects a reply today about Tuesday's downtime.",
    attention: "Customer escalation from Northwind Corp awaiting your reply.",
    factors: { urgency: 85, impact: 70, dependencies: 30, age: 40 },
    related: ["BIL-214"],
    nextStep: "Send Northwind a short reply with the root cause and the BIL-214 fix timeline.",
    timeline: [
      { time: "Oct 15 · 18:22", source: "Email", text: "Northwind Corp CTO wrote about 40 minutes of downtime on Tuesday." },
      { time: "Oct 16 · 07:45", source: "Slack", text: "Account manager asked Priya to respond by end of day." },
      { time: "Oct 16 · 08:10", source: "Email", text: "Follow-up from Northwind asking for an incident report." },
    ],
  },
  {
    id: "MOB-105",
    title: "Legal sign-off on new terms screen",
    project: "Mobile App v2",
    source: "Jira",
    owner: "Leo Fernandes",
    status: "Blocked",
    severity: "Medium",
    due: "2026-10-20",
    priorityScore: 58,
    aiReason: "Blocked 5h waiting on Legal; release gate for Mobile v2.",
    blockedBy: "Legal team review",
    blockedSince: 5,
    factors: { urgency: 55, impact: 65, dependencies: 70, age: 20 },
    related: ["MOB-97"],
    nextStep: "Ping the Legal contact with the final copy and a target date of Monday.",
    timeline: [
      { time: "Oct 16 · 04:30", source: "Jira", text: "Leo moved ticket to Blocked: awaiting Legal." },
      { time: "Oct 16 · 04:35", source: "Email", text: "Final terms copy sent to legal@company.com." },
      { time: "Oct 16 · 08:20", source: "Slack", text: "Sana shared updated screen mockups." },
    ],
  },
  {
    id: "BIL-231",
    title: "Audit-log export for finance team",
    project: "Billing Revamp",
    source: "Jira",
    owner: "Dev Patel",
    status: "In progress",
    severity: "Medium",
    due: "2026-10-14",
    priorityScore: 64,
    aiReason: "Overdue by 2 days; finance needs it for month-end close.",
    attention: "Ticket overdue by 2 days.",
    factors: { urgency: 75, impact: 55, dependencies: 40, age: 65 },
    related: ["PR #482"],
    nextStep: "Check with Dev whether the CSV format is final and agree on a new date with Finance.",
    timeline: [
      { time: "Oct 10 · 09:00", source: "Jira", text: "Ticket created by Finance." },
      { time: "Oct 14 · 17:00", source: "Jira", text: "Due date passed." },
      { time: "Oct 15 · 12:10", source: "Slack", text: "Dev: 'CSV export works, PDF still pending.'" },
    ],
  },
  {
    id: "BIL-240",
    title: "Load test new billing API",
    project: "Billing Revamp",
    source: "Jira",
    owner: "Ana Gomes",
    status: "To do",
    severity: "Medium",
    due: "2026-10-21",
    priorityScore: 54,
    aiReason: "Required before launch; waiting on build to be green.",
    factors: { urgency: 50, impact: 62, dependencies: 60, age: 15 },
    related: ["BUILD-1182"],
    nextStep: "Start the load-test plan once the billing-service build is fixed.",
    timeline: [
      { time: "Oct 14 · 10:00", source: "Jira", text: "Ana created the test plan." },
      { time: "Oct 16 · 07:00", source: "Slack", text: "Ana: 'Waiting for main to be green.'" },
      { time: "Oct 16 · 07:05", source: "Jira", text: "Target load set to 2,000 req/s." },
    ],
  },
  {
    id: "MOB-112",
    title: "Update onboarding copy for v2",
    project: "Mobile App v2",
    source: "Jira",
    owner: "Sana Khan",
    status: "In progress",
    severity: "Low",
    due: "2026-10-22",
    priorityScore: 41,
    aiReason: "Low risk; on track for next week.",
    factors: { urgency: 35, impact: 40, dependencies: 30, age: 20 },
    related: ["MOB-97"],
    nextStep: "No action needed; review the copy when Sana shares it.",
    timeline: [
      { time: "Oct 14 · 13:00", source: "Jira", text: "Sana started copy revisions." },
      { time: "Oct 15 · 15:30", source: "Slack", text: "Copy draft shared in #mobile-v2." },
      { time: "Oct 16 · 09:10", source: "Jira", text: "3 of 5 screens updated." },
    ],
  },
  {
    id: "PR #477",
    title: "Feature-flag cleanup in checkout",
    project: "Billing Revamp",
    source: "GitHub",
    owner: "Dev Patel",
    status: "In progress",
    severity: "Low",
    due: "2026-10-23",
    priorityScore: 36,
    aiReason: "Tech-debt cleanup; no deadline pressure.",
    factors: { urgency: 25, impact: 35, dependencies: 20, age: 45 },
    nextStep: "Let Dev merge after the build is green.",
    timeline: [
      { time: "Oct 13 · 16:00", source: "GitHub", text: "Dev opened PR #477 removing 6 stale flags." },
      { time: "Oct 14 · 10:20", source: "GitHub", text: "Ana approved the PR." },
      { time: "Oct 16 · 06:15", source: "GitHub", text: "Checks failing due to main build." },
    ],
  },
  {
    id: "MOB-118",
    title: "Crash on Android 12 when opening settings",
    project: "Mobile App v2",
    source: "Slack",
    owner: "Leo Fernandes",
    status: "To do",
    severity: "Medium",
    due: "2026-10-19",
    priorityScore: 62,
    aiReason: "Reported by beta testers; affects ~4% of Android beta users.",
    factors: { urgency: 60, impact: 64, dependencies: 25, age: 25 },
    related: ["MOB-105"],
    nextStep: "Ask Ana to reproduce on Android 12 and attach logs for Leo.",
    timeline: [
      { time: "Oct 15 · 19:40", source: "Slack", text: "#beta-feedback: 3 testers report a crash in settings." },
      { time: "Oct 16 · 08:00", source: "Jira", text: "Ticket MOB-118 created from Slack thread." },
      { time: "Oct 16 · 08:45", source: "Slack", text: "Leo: 'Looks like a null preference key.'" },
    ],
  },
  {
    id: "EMAIL-3018",
    title: "Confirm Q4 roadmap dates with Sales",
    project: "Mobile App v2",
    source: "Email",
    owner: "Priya Menon",
    status: "To do",
    severity: "Low",
    due: "2026-10-23",
    priorityScore: 33,
    aiReason: "Informational request; due next week.",
    factors: { urgency: 30, impact: 40, dependencies: 15, age: 20 },
    nextStep: "Reply with the Mobile v2 beta date once MOB-105 is unblocked.",
    timeline: [
      { time: "Oct 15 · 11:00", source: "Email", text: "Sales asked for Q4 release dates." },
      { time: "Oct 15 · 17:30", source: "Slack", text: "Sales lead pinged in #product." },
      { time: "Oct 16 · 08:00", source: "Email", text: "Reminder email received." },
    ],
  },
];

export interface ActivityEvent {
  id: string;
  time: string;
  source: Source;
  text: string;
  itemId?: string;
}

export const TODAY_ACTIVITY: ActivityEvent[] = [
  { id: "a1", time: "08:58", source: "Jira", text: "Ana Gomes closed 4 QA tickets for Billing Revamp." },
  { id: "a2", time: "08:40", source: "GitHub", text: "PR #474 'Tax rounding fix' merged by Kabir Shah." },
  { id: "a3", time: "08:15", source: "Slack", text: "Decision in #mobile-v2: push retries capped at 3.", itemId: "MOB-97" },
  { id: "a4", time: "08:10", source: "Email", text: "Northwind Corp requested an incident report.", itemId: "EMAIL-3021" },
  { id: "a5", time: "06:12", source: "GitHub", text: "billing-service build #1182 failed on main.", itemId: "BUILD-1182" },
];
