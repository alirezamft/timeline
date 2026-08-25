"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Activity, ArrowLeft, Blocks, Clipboard, Gauge, Network, OctagonAlert, RefreshCw, Target, Users } from "lucide-react";
import { timelineMonths, timelineQuarters } from "@/lib/trade-portfolio-demo";

type DateValue = string | Date | null;
type Progress = { totalScope: number; doneScope: number; activeScope: number; blockedScope: number; progress: number };
type Metric = { id: string; name: string; unit: string | null; baseline: number | null; target: number | null; actual: number | null };
type ProductRef = { id: string; name: string; color: string; order: number } | null;
type Initiative = {
  id: string;
  productId: string;
  name: string;
  summary: string | null;
  goal: string | null;
  ownerId: string | null;
  team: string | null;
  okr?: string | null;
  plannedStart: DateValue;
  plannedEnd: DateValue;
  actualStart: DateValue;
  actualEnd: DateValue;
  status: string;
  health: string;
  jiraUrl: string | null;
  product?: ProductRef;
  progress: Progress;
};
type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  objective: string | null;
  northStarMetric: string | null;
  health: string;
  metrics: Metric[];
  initiatives: Initiative[];
  progress: Progress;
};
type WorkItem = {
  id: string;
  parentId: string | null;
  productId: string | null;
  initiativeId: string | null;
  type: string;
  title: string;
  description: string | null;
  status: string;
  health: string;
  team: string | null;
  dueDate: DateValue;
  jiraIssueKey: string | null;
  jiraUrl: string | null;
  qaReworkCount: number;
};
type Blocker = { id: string; title: string; severity: string; status: string; initiative: { id: string; name: string; productId: string } | null };
type Dependency = { id: string; label: string; fromInitiative: { id: string; name: string; productId: string } | null; toInitiative: { id: string; name: string; productId: string } | null };

export type PortfolioOverviewData = {
  workspace: { id: string; name: string; slug: string };
  progress: Progress;
  products: Product[];
  initiatives: Initiative[];
  workItems: WorkItem[];
  blockers: Blocker[];
  dependencies: Dependency[];
  snapshots: Array<{ progress: number; planProgress: number | null; snapshotDate: DateValue }>;
};

const statusLabels: Record<string, string> = {
  BACKLOG: "Backlog",
  READY_FOR_DEVELOPMENT: "Ready for Development",
  IN_PROGRESS: "In Progress",
  CODE_REVIEW: "Code Review",
  READY_FOR_QA: "Ready for QA",
  IN_QA: "In QA",
  REWORK: "Rework",
  READY_FOR_RELEASE: "Ready for Release",
  DONE: "Done",
  BLOCKED: "Blocked",
  PAUSED: "Paused",
  CANCELED: "Canceled",
  OUT_OF_SCOPE: "Out of Scope"
};
const healthLabels: Record<string, string> = { ON_TRACK: "روی برنامه", AT_RISK: "در معرض ریسک", OFF_TRACK: "خارج از برنامه" };
const statusTone: Record<string, string> = {
  DONE: "text-emerald-300 bg-emerald-400/10 border-emerald-300/20",
  IN_PROGRESS: "text-sky-300 bg-sky-400/10 border-sky-300/20",
  IN_QA: "text-violet-300 bg-violet-400/10 border-violet-300/20",
  BLOCKED: "text-rose-300 bg-rose-400/10 border-rose-300/20",
  REWORK: "text-amber-300 bg-amber-400/10 border-amber-300/20"
};

function formatDate(value: DateValue) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" }).format(new Date(value));
}

function ProgressBar({ value, color = "#C9A84C" }: { value: number; color?: string }) {
  return <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(value, 100))}%`, background: color }} /></div>;
}

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] ${className}`}>{children}</span>;
}

export function PortfolioNav({ slug, active }: { slug: string; active: "portfolio" | "roadmap" | "reports" | "team" }) {
  const links = [
    ["portfolio", "Overview", "📊"],
    ["roadmap", "18-Month Roadmap", "▦"],
    ["reports", "Reports", "▤"],
    ["team", "Team Execution", "◌"]
  ] as const;
  return (
    <nav className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
      {links.map(([id, label, icon]) => (
        <Link key={id} href={`/w/${slug}/${id}`} className={`rounded-xl border px-3 py-2 text-xs transition ${active === id ? "border-[#C9A84C]/45 bg-[#C9A84C]/12 text-[#FFE9A4]" : "border-white/8 bg-white/[0.025] text-slate-400 hover:border-white/20 hover:text-white"}`}>
          <span className="mr-1.5">{icon}</span>{label}
        </Link>
      ))}
      <Link href={`/w/${slug}`} className="mr-auto inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-200"><ArrowLeft size={14} /> رودمپ قدیمی</Link>
    </nav>
  );
}

export function PortfolioShell({ slug, active, title, subtitle, children }: { slug: string; active: "portfolio" | "roadmap" | "reports" | "team"; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#08101c] px-4 py-6 text-slate-100 md:px-8">
      <div className="mx-auto max-w-[1800px]">
        <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-[#C9A84C]">TRADE PORTFOLIO CONTROL CENTER</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight md:text-4xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{subtitle}</p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3 text-right text-xs text-slate-400">
            <p className="text-[#FFE9A4]">دامین Trade</p>
            <p className="mt-1">خرداد ۱۴۰۵ تا آبان ۱۴۰۶ · ۱۸ ماه · ۶ فصل</p>
          </div>
        </header>
        <PortfolioNav slug={slug} active={active} />
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}

function StatCard({ label, value, hint, icon: Icon, tone = "gold" }: { label: string; value: string; hint: string; icon: typeof Gauge; tone?: "gold" | "green" | "blue" | "rose" }) {
  const colors = { gold: "text-[#F1D67C] border-[#C9A84C]/20 bg-[#C9A84C]/8", green: "text-emerald-300 border-emerald-300/20 bg-emerald-300/8", blue: "text-sky-300 border-sky-300/20 bg-sky-300/8", rose: "text-rose-300 border-rose-300/20 bg-rose-300/8" };
  return <article className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 shadow-[0_16px_60px_rgba(0,0,0,.16)]"><div className="flex items-start justify-between gap-4"><div><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-3xl font-black tracking-tight text-white">{value}</p></div><span className={`rounded-xl border p-2 ${colors[tone]}`}><Icon size={18} /></span></div><p className="mt-3 text-[11px] text-slate-500">{hint}</p></article>;
}

export function PortfolioOverview({ data }: { data: PortfolioOverviewData }) {
  const atRisk = data.initiatives.filter((initiative) => initiative.health !== "ON_TRACK");
  const lastSnapshot = data.snapshots[0];
  return (
    <PortfolioShell slug={data.workspace.slug} active="portfolio" title="Domain Overview" subtitle="تصمیم‌گیری در سطح دامین: Delivery Progress، Outcome Metric، ریسک، بلاکر و تغییر Scope در یک سطح قابل ارائه.">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="پیشرفت کل دامین" value={`${data.progress.progress}٪`} hint={`${data.progress.doneScope} از ${data.progress.totalScope} Leaf Task تحویل شده`} icon={Gauge} />
        <StatCard label="کارهای فعال" value={String(data.progress.activeScope)} hint="در مسیر توسعه، Review یا QA" icon={Activity} tone="blue" />
        <StatCard label="Blocker باز" value={String(data.blockers.length)} hint="موارد نیازمند تصمیم یا رفع وابستگی" icon={OctagonAlert} tone="rose" />
        <StatCard label="Plan vs Actual" value={`${lastSnapshot?.planProgress == null ? "—" : `${data.progress.progress - lastSnapshot.planProgress >= 0 ? "+" : ""}${data.progress.progress - lastSnapshot.planProgress}٪`}`} hint="فاصله برنامه با پیشرفت واقعی" icon={Target} tone="green" />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)]">
        <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs text-slate-500">شش محصول قطعی دامین Trade</p><h2 className="mt-1 text-xl font-bold">Delivery در کنار Outcome</h2></div><Pill className="border-[#C9A84C]/25 bg-[#C9A84C]/8 text-[#FFE9A4]">Roll-up سمت سرور</Pill></div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {data.products.map((product) => <Link key={product.id} href={`/w/${data.workspace.slug}/products/${product.id}`} className="rounded-2xl border border-white/8 bg-black/15 p-4 transition hover:-translate-y-0.5 hover:border-white/20">
              <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: product.color }} /><h3 className="font-bold">{product.name}</h3></div><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{product.objective ?? product.description}</p></div><span className="text-xl font-black text-white">{product.progress.progress}٪</span></div>
              <div className="mt-4"><ProgressBar value={product.progress.progress} color={product.color} /></div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-[10px]"><div><p className="text-slate-600">Scope</p><p className="mt-1 text-slate-300">{product.progress.totalScope}</p></div><div><p className="text-slate-600">Done</p><p className="mt-1 text-emerald-300">{product.progress.doneScope}</p></div><div><p className="text-slate-600">Outcome</p><p className="mt-1 text-[#F1D67C]">{product.metrics[0]?.actual ?? "—"}{product.metrics[0]?.unit ?? ""}</p></div></div>
            </Link>)}
          </div>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-white/8 bg-white/[0.025] p-5"><div className="flex items-center justify-between"><h2 className="font-bold">At Risk / Off Track</h2><Pill className="border-rose-300/20 bg-rose-400/8 text-rose-200">{atRisk.length} پروژه</Pill></div>{atRisk.length ? <div className="mt-4 space-y-3">{atRisk.map((initiative) => <Link key={initiative.id} href={`/w/${data.workspace.slug}/initiatives/${initiative.id}`} className="block rounded-xl border border-rose-300/10 bg-rose-400/[0.04] p-3 hover:border-rose-300/30"><div className="flex items-start justify-between gap-3"><span className="text-sm font-semibold">{initiative.name}</span><Pill className={initiative.health === "OFF_TRACK" ? "border-rose-300/30 bg-rose-400/10 text-rose-200" : "border-amber-300/30 bg-amber-400/10 text-amber-200"}>{healthLabels[initiative.health]}</Pill></div><p className="mt-2 text-[11px] text-slate-500">{initiative.progress.progress}٪ · {initiative.team ?? "تیم نامشخص"}</p></Link>)}</div> : <p className="mt-4 text-sm text-slate-500">در حال حاضر پروژه‌ی پرریسک ثبت نشده است.</p>}</section>
          <section className="rounded-2xl border border-white/8 bg-white/[0.025] p-5"><div className="flex items-center gap-2"><Blocks size={17} className="text-[#C9A84C]" /><h2 className="font-bold">Critical Blockers & Dependencies</h2></div><div className="mt-4 space-y-2">{data.blockers.slice(0, 4).map((blocker) => <div key={blocker.id} className="rounded-xl border border-white/8 bg-black/15 p-3"><div className="flex items-center justify-between gap-3"><span className="text-xs text-slate-200">{blocker.title}</span><span className="text-[10px] text-rose-300">{blocker.severity}</span></div><p className="mt-1 text-[10px] text-slate-600">{blocker.initiative?.name ?? "دامین"}</p></div>)}{data.dependencies.slice(0, 3).map((dependency) => <div key={dependency.id} className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/15 p-3 text-[11px] text-slate-400"><Network size={14} className="shrink-0 text-amber-300" /><span>{dependency.fromInitiative?.name ?? "—"} ← {dependency.label}</span></div>)}</div></section>
        </div>
      </section>
    </PortfolioShell>
  );
}

function monthIndex(value: DateValue) {
  if (!value) return 0;
  const date = new Date(value);
  return Math.max(0, Math.min(17, (date.getUTCFullYear() - 2026) * 12 + date.getUTCMonth() - 5));
}

export function PortfolioRoadmap({ data }: { data: PortfolioOverviewData }) {
  const [product, setProduct] = useState("all");
  const [owner, setOwner] = useState("all");
  const [team, setTeam] = useState("all");
  const [status, setStatus] = useState("all");
  const [health, setHealth] = useState("all");
  const [okr, setOkr] = useState("all");
  const owners = useMemo(() => Array.from(new Set(data.initiatives.map((item) => item.ownerId).filter((value): value is string => Boolean(value)))), [data.initiatives]);
  const teams = useMemo(() => Array.from(new Set(data.initiatives.map((item) => item.team).filter((value): value is string => Boolean(value)))), [data.initiatives]);
  const okrs = useMemo(() => Array.from(new Set(data.initiatives.map((item) => item.okr).filter((value): value is string => Boolean(value)))), [data.initiatives]);
  const filtered = data.initiatives.filter((item) => (product === "all" || item.productId === product) && (owner === "all" || item.ownerId === owner) && (team === "all" || item.team === team) && (status === "all" || item.status === status) && (health === "all" || item.health === health) && (okr === "all" || item.okr === okr));
  const currentMonth = new Date();
  const currentMonthIndex = Math.max(0, Math.min(17, (currentMonth.getFullYear() - 2026) * 12 + currentMonth.getMonth() - 5));
  type FilterConfig = { label: string; value: string; setter: (value: string) => void; options: Array<[string, string]> };
  const filters: FilterConfig[] = [
    { label: "Product", value: product, setter: setProduct, options: data.products.map((item) => [item.id, item.name]) },
    { label: "Owner", value: owner, setter: setOwner, options: owners.map((item) => [item, item]) },
    { label: "Team", value: team, setter: setTeam, options: teams.map((item) => [item, item]) },
    { label: "Status", value: status, setter: setStatus, options: Object.entries(statusLabels) },
    { label: "Health", value: health, setter: setHealth, options: Object.entries(healthLabels) },
    { label: "OKR", value: okr, setter: setOkr, options: okrs.map((item) => [item, item]) }
  ];
  return <PortfolioShell slug={data.workspace.slug} active="roadmap" title="18-Month Roadmap" subtitle="نمایش برنامه‌ای و واقعی Initiativeها با drill-down تا Task، وابستگی‌ها و نشانگر ماه جاری.">
    <section className="rounded-2xl border border-white/8 bg-white/[0.025] p-4"><div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">{filters.map(({ label, value, setter, options }) => <label key={label} className="text-[10px] text-slate-500">{label}<select value={value} onChange={(event) => setter(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#101a29] px-3 py-2 text-xs text-slate-200 outline-none"><option value="all">همه</option>{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>)}</div></section>
    <section className="mt-5 overflow-x-auto rounded-2xl border border-white/8 bg-black/15"><div className="min-w-[1250px] p-4"><div className="relative grid grid-cols-[280px_minmax(0,1fr)]"><div className="border-b border-white/10 pb-3 text-xs text-slate-500">Product / Initiative</div><div className="grid grid-cols-18 border-b border-white/10 pb-3">{timelineMonths.map((month, index) => <div key={`${month}-${index}`} className="border-r border-white/5 px-2 text-center text-[10px] text-slate-500">{month}</div>)}</div><div className="pointer-events-none absolute bottom-0 top-0 z-10 border-l border-dashed border-[#C9A84C]/60" style={{ left: `calc(280px + (100% - 280px) * ${(currentMonthIndex + 0.5) / 18})` }}><span className="absolute -top-1 right-0 whitespace-nowrap rounded bg-[#C9A84C] px-2 py-1 text-[9px] text-[#08101c]">ماه جاری</span></div></div>{timelineQuarters.map((quarter) => <div key={quarter.title} className="mt-3 grid grid-cols-[280px_minmax(0,1fr)]"><div className="py-2 text-xs font-semibold text-[#FFE9A4]">{quarter.title}<span className="mr-2 text-[10px] font-normal text-slate-600">{quarter.range}</span></div><div className="grid grid-cols-3 border-b border-white/5 pb-2">{[0, 1, 2].map((offset) => <div key={offset} className="border-r border-white/5" />)}</div></div>)}{filtered.map((initiative) => { const start = monthIndex(initiative.plannedStart); const end = Math.max(start + 1, monthIndex(initiative.plannedEnd) + 1); const productInfo = data.products.find((item) => item.id === initiative.productId); return <div key={initiative.id} className="grid grid-cols-[280px_minmax(0,1fr)] border-b border-white/[0.04] py-2"><div className="min-w-0 pr-4"><div className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: productInfo?.color }} /><Link href={`/w/${data.workspace.slug}/initiatives/${initiative.id}`} className="truncate text-xs font-semibold hover:text-[#FFE9A4]">{initiative.name}</Link></div><p className="mt-1 text-[10px] text-slate-600">{productInfo?.name} · {initiative.team ?? "تیم نامشخص"}</p></div><div className="relative grid grid-cols-18 items-center"><div className="absolute h-8 rounded-xl border px-3 shadow-lg" style={{ left: `${(start / 18) * 100}%`, width: `${((end - start) / 18) * 100}%`, borderColor: `${productInfo?.color ?? "#C9A84C"}66`, background: `${productInfo?.color ?? "#C9A84C"}20` }}><div className="flex h-full items-center justify-between gap-2"><span className="truncate text-[10px] text-slate-200">{initiative.progress.progress}٪</span><Pill className={initiative.health === "ON_TRACK" ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200" : "border-amber-300/20 bg-amber-400/10 text-amber-200"}>{healthLabels[initiative.health]}</Pill></div></div>{Array.from({ length: 18 }, (_, index) => <div key={index} className="h-10 border-r border-white/[0.04]" />)}</div></div>})}</div></section>
  </PortfolioShell>;
}

type ReportData = { report: { doneThisPeriod: number; nextPeriod: number; progressDelta: number; scopeAdded: number; scopeRemoved: number; blockersCreated: number; blockersResolved: number; velocity: number; qaReworkRate: number; plannedVsActual: number }; current: Progress; markdown: string };

export function PortfolioReports({ slug, initial }: { slug: string; initial: ReportData }) {
  const [range, setRange] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [report, setReport] = useState(initial);
  const [copied, setCopied] = useState(false);
  async function changeRange(nextRange: "daily" | "weekly" | "monthly") { setRange(nextRange); const response = await fetch(`/api/workspaces/${slug}/reports?range=${nextRange}`, { cache: "no-store" }); if (response.ok) setReport(await response.json()); }
  async function copyMarkdown() { await navigator.clipboard?.writeText(report.markdown); setCopied(true); setTimeout(() => setCopied(false), 1600); }
  return <PortfolioShell slug={slug} active="reports" title="Reports" subtitle="گزارش قابل Copy برای Daily، Weekly و Monthly؛ شامل Done، Next، Scope Change، بلاکر، Velocity و QA Rework.">
    <div className="flex flex-wrap items-center gap-2"><div className="inline-flex rounded-xl border border-white/8 bg-white/[0.025] p-1">{([["daily", "Daily"], ["weekly", "Weekly"], ["monthly", "Monthly"]] as const).map(([id, label]) => <button key={id} onClick={() => void changeRange(id)} className={`rounded-lg px-3 py-2 text-xs ${range === id ? "bg-[#C9A84C]/15 text-[#FFE9A4]" : "text-slate-500"}`}>{label}</button>)}</div><button onClick={() => void changeRange(range)} className="inline-flex items-center gap-2 rounded-xl border border-white/8 px-3 py-2 text-xs text-slate-400 hover:text-white"><RefreshCw size={14} /> Refresh</button><button onClick={() => void copyMarkdown()} className="mr-auto inline-flex items-center gap-2 rounded-xl border border-[#C9A84C]/25 bg-[#C9A84C]/8 px-3 py-2 text-xs text-[#FFE9A4]"><Clipboard size={14} /> {copied ? "کپی شد" : "Copy Markdown"}</button></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[["Done this period", report.report.doneThisPeriod, "text-emerald-300"], ["Progress delta", `${report.report.progressDelta >= 0 ? "+" : ""}${report.report.progressDelta}٪`, "text-sky-300"], ["Scope Added", report.report.scopeAdded, "text-amber-300"], ["Blockers", `${report.report.blockersCreated}/${report.report.blockersResolved}`, "text-rose-300"], ["QA Rework Rate", `${report.report.qaReworkRate}٪`, "text-violet-300"]].map(([label, value, tone]) => <div key={String(label)} className="rounded-2xl border border-white/8 bg-white/[0.035] p-4"><p className="text-xs text-slate-500">{label}</p><p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p></div>)}</div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,.8fr)]"><section className="rounded-2xl border border-white/8 bg-white/[0.025] p-5"><h2 className="font-bold">Report Preview</h2><pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/8 bg-black/20 p-4 text-xs leading-7 text-slate-300">{report.markdown}</pre></section><section className="rounded-2xl border border-white/8 bg-white/[0.025] p-5"><h2 className="font-bold">Plan vs Actual</h2><div className="mt-5 flex items-center gap-4"><div className="grid size-24 place-items-center rounded-full border-8 border-[#C9A84C]/40 text-xl font-black text-[#FFE9A4]">{report.current.progress}٪</div><div className="text-xs leading-6 text-slate-400">{report.report.plannedVsActual >= 0 ? "جلوتر از برنامه" : "عقب‌تر از برنامه"}<br />Velocity: <span className="text-white">{report.report.velocity}</span><br />Scope Removed: <span className="text-white">{report.report.scopeRemoved}</span></div></div></section></div>
  </PortfolioShell>;
}

export function ProductDetail({ data, product }: { data: PortfolioOverviewData; product: Product }) {
  return <PortfolioShell slug={data.workspace.slug} active="portfolio" title={product.name} subtitle={product.objective ?? product.description ?? "جزئیات محصول، outcome metric و initiativeهای داخلی."}><div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,.6fr)]"><section className="rounded-2xl border border-white/8 bg-white/[0.025] p-5"><div className="flex items-center gap-3"><span className="size-4 rounded-full" style={{ background: product.color }} /><div><p className="text-xs text-slate-500">Delivery Progress</p><p className="text-4xl font-black">{product.progress.progress}٪</p></div></div><div className="mt-4"><ProgressBar value={product.progress.progress} color={product.color} /></div><div className="mt-6 space-y-3">{product.initiatives.map((initiative) => <Link key={initiative.id} href={`/w/${data.workspace.slug}/initiatives/${initiative.id}`} className="block rounded-xl border border-white/8 bg-black/15 p-4 hover:border-white/20"><div className="flex items-center justify-between gap-4"><span className="font-semibold">{initiative.name}</span><Pill className={statusTone[initiative.status] ?? "border-white/10 text-slate-400"}>{statusLabels[initiative.status] ?? initiative.status}</Pill></div><div className="mt-3"><ProgressBar value={initiative.progress.progress} color={product.color} /></div><p className="mt-2 text-[11px] text-slate-500">{initiative.progress.progress}٪ · {initiative.team ?? "تیم نامشخص"} · {formatDate(initiative.plannedEnd)}</p></Link>)}</div></section><section className="rounded-2xl border border-white/8 bg-white/[0.025] p-5"><div className="flex items-center gap-2"><Target size={17} className="text-[#C9A84C]" /><h2 className="font-bold">Outcome Metrics</h2></div><div className="mt-4 space-y-3">{product.metrics.map((metric) => <div key={metric.id} className="rounded-xl border border-white/8 bg-black/15 p-3"><p className="text-xs text-slate-300">{metric.name}</p><div className="mt-2 flex items-end justify-between"><span className="text-xl font-black text-[#F1D67C]">{metric.actual ?? "—"}{metric.unit ?? ""}</span><span className="text-[10px] text-slate-600">Target {metric.target ?? "—"}</span></div></div>)}</div></section></div></PortfolioShell>;
}

export function InitiativeDetail({ data, initiative, workItems, blockers, dependencies }: { data: PortfolioOverviewData; initiative: Initiative; workItems: WorkItem[]; blockers: Array<{ id: string; title: string; severity: string; status: string }>; dependencies: Array<{ id: string; label: string }> }) {
  const itemById = new Map(workItems.map((item) => [item.id, item]));
  return <PortfolioShell slug={data.workspace.slug} active="roadmap" title={initiative.name} subtitle={initiative.goal ?? initiative.summary ?? "جزئیات Initiative و execution hierarchy."}><div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,.7fr)]"><section className="rounded-2xl border border-white/8 bg-white/[0.025] p-5"><div className="flex flex-wrap items-center gap-2"><Pill className={initiative.health === "ON_TRACK" ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200" : "border-amber-300/20 bg-amber-400/10 text-amber-200"}>{healthLabels[initiative.health]}</Pill><Pill className={statusTone[initiative.status] ?? "border-white/10 text-slate-400"}>{statusLabels[initiative.status] ?? initiative.status}</Pill><span className="text-xs text-slate-500">{formatDate(initiative.plannedStart)} تا {formatDate(initiative.plannedEnd)}</span>{initiative.jiraUrl ? <a href={initiative.jiraUrl} target="_blank" rel="noreferrer" className="mr-auto text-xs text-[#FFE9A4]">بازکردن در Jira ↗</a> : null}</div><div className="mt-5 flex items-end justify-between gap-4"><div><p className="text-xs text-slate-500">Server Roll-up</p><p className="text-4xl font-black">{initiative.progress.progress}٪</p></div><div className="text-left text-xs text-slate-500">{initiative.progress.doneScope} Done<br />{initiative.progress.totalScope} In scope</div></div><div className="mt-4"><ProgressBar value={initiative.progress.progress} color="#C9A84C" /></div><div className="mt-6 overflow-x-auto"><table className="w-full min-w-[700px] text-right text-xs"><thead className="text-slate-600"><tr><th className="pb-3">Type</th><th className="pb-3">Work item</th><th className="pb-3">Status</th><th className="pb-3">Team</th><th className="pb-3">Due</th></tr></thead><tbody>{workItems.filter((item) => ["EPIC", "STORY", "TASK", "SUBTASK", "BUG"].includes(item.type)).map((item) => <tr key={item.id} className="border-t border-white/[0.05]"><td className="py-3 text-slate-600">{item.type}</td><td className="py-3"><span style={{ paddingRight: `${Math.min(3, itemById.get(item.parentId ?? "") ? 1 : 0) * 14}px` }} className="text-slate-200">{item.title}</span>{item.jiraIssueKey ? <span className="mr-2 text-[10px] text-slate-600">{item.jiraIssueKey}</span> : null}</td><td className="py-3"><Pill className={statusTone[item.status] ?? "border-white/10 text-slate-400"}>{statusLabels[item.status] ?? item.status}</Pill></td><td className="py-3 text-slate-500">{item.team ?? "—"}</td><td className="py-3 text-slate-500">{formatDate(item.dueDate)}</td></tr>)}</tbody></table></div></section><aside className="space-y-5"><section className="rounded-2xl border border-white/8 bg-white/[0.025] p-5"><div className="flex items-center gap-2"><OctagonAlert size={17} className="text-rose-300" /><h2 className="font-bold">Blockers</h2></div><div className="mt-4 space-y-2">{blockers.map((blocker) => <div key={blocker.id} className="rounded-xl border border-rose-300/10 bg-rose-400/[0.04] p-3 text-xs"><div className="flex justify-between gap-2"><span>{blocker.title}</span><span className="text-rose-300">{blocker.severity}</span></div></div>)}{!blockers.length ? <p className="text-xs text-slate-600">بلاکر ثبت نشده است.</p> : null}</div></section><section className="rounded-2xl border border-white/8 bg-white/[0.025] p-5"><div className="flex items-center gap-2"><Network size={17} className="text-amber-300" /><h2 className="font-bold">Dependencies</h2></div><div className="mt-4 space-y-2">{dependencies.map((dependency) => <div key={dependency.id} className="rounded-xl border border-white/8 bg-black/15 p-3 text-xs text-slate-400">{dependency.label}</div>)}{!dependencies.length ? <p className="text-xs text-slate-600">وابستگی ثبت نشده است.</p> : null}</div></section></aside></div></PortfolioShell>;
}

export function TeamExecution({ data }: { data: PortfolioOverviewData }) {
  const teams = useMemo(() => { const grouped = new Map<string, WorkItem[]>(); for (const item of data.workItems) { const key = item.team ?? "تیم نامشخص"; grouped.set(key, [...(grouped.get(key) ?? []), item]); } return Array.from(grouped.entries()).sort((a, b) => b[1].length - a[1].length); }, [data.workItems]);
  return <PortfolioShell slug={data.workspace.slug} active="team" title="Team Execution View" subtitle="صف کار هر تیم، QA Queue، Blocked Queue و deadlineهای نزدیک در یک working surface اجرایی."><div className="grid gap-4 xl:grid-cols-3">{teams.map(([team, items]) => <section key={team} className="rounded-2xl border border-white/8 bg-white/[0.025] p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Users size={17} className="text-[#C9A84C]" /><h2 className="font-bold">{team}</h2></div><span className="text-xs text-slate-500">{items.length} کار</span></div><div className="mt-4 space-y-2">{items.slice(0, 10).map((item) => <div key={item.id} className="rounded-xl border border-white/8 bg-black/15 p-3"><div className="flex items-start justify-between gap-3"><span className="line-clamp-2 text-xs text-slate-200">{item.title}</span><Pill className={statusTone[item.status] ?? "border-white/10 text-slate-400"}>{statusLabels[item.status] ?? item.status}</Pill></div>{item.dueDate ? <p className="mt-2 text-[10px] text-slate-600">Deadline: {formatDate(item.dueDate)}</p> : null}</div>)}</div></section>)}</div></PortfolioShell>;
}
