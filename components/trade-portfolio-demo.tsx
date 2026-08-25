"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Blocks,
  Boxes,
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  FileBarChart,
  Gauge,
  Layers3,
  ListChecks,
  Network,
  OctagonAlert,
  PanelsTopLeft,
  PlugZap,
  Radar,
  Scale,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
  X,
  Zap
} from "lucide-react";
import {
  completion,
  type DemoProduct,
  type DemoProject,
  productTasks,
  projectTasks,
  statusLabels,
  timelineMonths,
  timelineQuarters,
  tradeProducts,
  velocityHistory,
  type WorkStatus
} from "@/lib/trade-portfolio-demo";

type View = "overview" | "timeline" | "reports";
type ReportRange = "daily" | "weekly" | "monthly";

const productIcons = {
  "advanced-market": Activity,
  otc: Zap,
  traz: Scale,
  "pricing-watchtower": Radar,
  "partner-api": PlugZap,
  "partner-software": PanelsTopLeft
};

const statusTone: Record<WorkStatus, string> = {
  TODO: "border-slate-500/25 bg-slate-500/10 text-slate-300",
  IN_PROGRESS: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  IN_QA: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  BLOCKED: "border-rose-400/35 bg-rose-400/10 text-rose-200",
  DONE: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
};

const healthLabel = {
  ON_TRACK: "روی برنامه",
  AT_RISK: "در معرض ریسک",
  OFF_TRACK: "خارج از برنامه"
};

const healthTone = {
  ON_TRACK: "bg-emerald-400",
  AT_RISK: "bg-amber-400",
  OFF_TRACK: "bg-rose-400"
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function ProgressBar({ value, color = "#C9A84C" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}

function MetricCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "gold"
}: {
  title: string;
  value: string;
  hint: string;
  icon: typeof Gauge;
  tone?: "gold" | "green" | "blue" | "rose";
}) {
  const tones = {
    gold: "border-[#C9A84C]/25 bg-[#C9A84C]/8 text-[#F1D67C]",
    green: "border-emerald-400/20 bg-emerald-400/8 text-emerald-300",
    blue: "border-sky-400/20 bg-sky-400/8 text-sky-300",
    rose: "border-rose-400/20 bg-rose-400/8 text-rose-300"
  };

  return (
    <article className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 shadow-[0_12px_40px_rgba(0,0,0,.16)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-white">{value}</p>
        </div>
        <span className={`rounded-xl border p-2 ${tones[tone]}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-[11px] text-slate-500">{hint}</p>
    </article>
  );
}

export function TradePortfolioDemo() {
  const [products, setProducts] = useState<DemoProduct[]>(tradeProducts);
  const [view, setView] = useState<View>("overview");
  const [productFilter, setProductFilter] = useState("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [reportRange, setReportRange] = useState<ReportRange>("weekly");

  const allProjects = useMemo(
    () => products.flatMap((product) => product.projects.map((project) => ({ product, project }))),
    [products]
  );
  const allTasks = useMemo(() => products.flatMap(productTasks), [products]);
  const domainProgress = completion(allTasks);
  const doneTasks = allTasks.filter((task) => task.status === "DONE");
  const blockedTasks = allTasks.filter((task) => task.status === "BLOCKED");
  const activeTasks = allTasks.filter((task) => ["IN_PROGRESS", "IN_QA"].includes(task.status));
  const addedTasks = allTasks.filter((task) => task.addedThisPeriod);
  const nextTasks = allTasks.filter((task) => task.nextPeriod && task.status !== "DONE");

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products
      .filter((product) => productFilter === "all" || product.id === productFilter)
      .map((product) => ({
        ...product,
        projects: product.projects.filter(
          (project) =>
            !normalizedQuery ||
            project.title.toLowerCase().includes(normalizedQuery) ||
            project.summary.toLowerCase().includes(normalizedQuery) ||
            project.owner.toLowerCase().includes(normalizedQuery)
        )
      }))
      .filter((product) => !normalizedQuery || product.projects.length > 0);
  }, [productFilter, products, query]);

  const selected = useMemo(
    () => allProjects.find(({ project }) => project.id === selectedProjectId) ?? null,
    [allProjects, selectedProjectId]
  );

  function toggleTask(taskId: string) {
    setProducts((current) =>
      current.map((product) => ({
        ...product,
        projects: product.projects.map((project) => ({
          ...project,
          epics: project.epics.map((epic) => ({
            ...epic,
            stories: epic.stories.map((story) => ({
              ...story,
              tasks: story.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, status: task.status === "DONE" ? "TODO" : "DONE", updatedAt: "همین حالا" }
                  : task
              )
            }))
          }))
        }))
      }))
    );
  }

  function focusProduct(productId: string, targetView: View = "timeline") {
    setProductFilter(productId);
    setView(targetView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-[#090C12] text-slate-100" dir="rtl">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_75%_0%,rgba(201,168,76,.16),transparent_38%),radial-gradient(circle_at_20%_10%,rgba(63,174,255,.11),transparent_34%)]" />

      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#090C12]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl border border-[#C9A84C]/35 bg-[#C9A84C]/12 text-[#EED271] shadow-[0_0_32px_rgba(201,168,76,.12)]">
              <Layers3 size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black tracking-tight">پورتفولیوی دامین Trade</h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/8 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                  LIVE
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">خرداد ۱۴۰۵ تا آبان ۱۴۰۶ · بازه ۱۸ماهه</p>
            </div>
          </div>

          <nav className="order-3 flex w-full items-center rounded-xl border border-white/8 bg-white/[0.035] p-1 lg:order-none lg:w-auto">
            {([
              ["overview", "نمای کلی", Blocks],
              ["timeline", "رودمپ", CalendarRange],
              ["reports", "گزارش‌ها", FileBarChart]
            ] as const).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition lg:flex-none ${
                  view === id ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 text-xs">
            <span className="hidden rounded-lg border border-white/8 bg-white/[0.035] px-3 py-2 text-slate-400 md:inline-flex">
              آخرین همگام‌سازی: همین حالا
            </span>
            <span className="rounded-lg border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-3 py-2 font-bold text-[#F1D67C]">
              پیشرفت کل {domainProgress}٪
            </span>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1680px] px-5 py-6 lg:px-8 lg:py-8">
        {view === "overview" ? (
          <OverviewView
            products={products}
            domainProgress={domainProgress}
            totalProjects={allProjects.length}
            doneCount={doneTasks.length}
            activeCount={activeTasks.length}
            blockedCount={blockedTasks.length}
            onProductClick={focusProduct}
            onProjectClick={setSelectedProjectId}
          />
        ) : null}

        {view === "timeline" ? (
          <TimelineView
            products={visibleProducts}
            productFilter={productFilter}
            query={query}
            onQueryChange={setQuery}
            onFilterChange={setProductFilter}
            onProjectClick={setSelectedProjectId}
          />
        ) : null}

        {view === "reports" ? (
          <ReportsView
            reportRange={reportRange}
            onRangeChange={setReportRange}
            doneTasks={doneTasks}
            nextTasks={nextTasks}
            blockedTasks={blockedTasks}
            addedTasks={addedTasks}
            domainProgress={domainProgress}
            products={products}
          />
        ) : null}
      </div>

      {selected ? (
        <ProjectDrawer
          product={selected.product}
          project={selected.project}
          onClose={() => setSelectedProjectId(null)}
          onToggleTask={toggleTask}
        />
      ) : null}
    </main>
  );
}

function OverviewView({
  products,
  domainProgress,
  totalProjects,
  doneCount,
  activeCount,
  blockedCount,
  onProductClick,
  onProjectClick
}: {
  products: DemoProduct[];
  domainProgress: number;
  totalProjects: number;
  doneCount: number;
  activeCount: number;
  blockedCount: number;
  onProductClick: (id: string, view?: View) => void;
  onProjectClick: (id: string) => void;
}) {
  const riskyProjects = products
    .flatMap((product) => product.projects.map((project) => ({ product, project })))
    .filter(({ project }) => project.health !== "ON_TRACK")
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="text-xs font-bold text-[#D9BD62]">TRADE PORTFOLIO CONTROL CENTER</p>
          <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-0.035em] text-white md:text-5xl">
            از هدف کل دامین تا آخرین تسک تیم،
            <span className="text-slate-500"> در یک نمای زنده.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            پیشرفت از Taskها محاسبه می‌شود؛ با بسته‌شدن یا Reopen شدن هر کار، Project، Product و کل دامین هم‌زمان به‌روزرسانی می‌شوند.
          </p>
        </div>
        <div className="rounded-2xl border border-[#C9A84C]/25 bg-[#C9A84C]/8 p-4 lg:w-80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">پیشرفت تجمیعی دامین</span>
            <span className="font-black text-[#F1D67C]">{domainProgress}٪</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={domainProgress} />
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
            <span>شروع: خرداد ۱۴۰۵</span>
            <span>پایان: آبان ۱۴۰۶</span>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="پیشرفت کل" value={`${domainProgress}٪`} hint="Roll-up از تمام Taskهای داخل Scope" icon={Gauge} tone="gold" />
        <MetricCard title="پروژه‌های داخلی" value={formatNumber(totalProjects)} hint="در ۶ محصول دامین Trade" icon={Network} tone="blue" />
        <MetricCard title="کارهای فعال" value={formatNumber(activeCount)} hint={`${formatNumber(doneCount)} کار تا امروز تحویل شده`} icon={Clock3} tone="green" />
        <MetricCard title="بلاکر فعال" value={formatNumber(blockedCount)} hint="نیازمند تصمیم یا رفع وابستگی" icon={OctagonAlert} tone="rose" />
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white">محصولات دامین</h3>
            <p className="mt-1 text-xs text-slate-500">برای دیدن پروژه‌ها و مسیر ۱۸ماهه روی هر محصول بزن.</p>
          </div>
          <button onClick={() => onProductClick("all")} className="hidden items-center gap-1 text-xs font-bold text-[#D9BD62] hover:text-[#F1D67C] md:flex">
            مشاهده رودمپ کامل
            <ChevronLeft size={14} />
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const Icon = productIcons[product.id as keyof typeof productIcons] ?? Boxes;
            const tasks = productTasks(product);
            const progress = completion(tasks);
            const blocked = tasks.filter((task) => task.status === "BLOCKED").length;
            return (
              <button
                key={product.id}
                onClick={() => onProductClick(product.id)}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-[#0E131D] p-5 text-right transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-[#111722]"
              >
                <span className="absolute inset-x-0 top-0 h-px opacity-80" style={{ background: product.color }} />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 place-items-center rounded-xl border" style={{ color: product.color, borderColor: `${product.color}35`, background: `${product.color}12` }}>
                      <Icon size={20} />
                    </span>
                    <div>
                      <h4 className="font-black text-white">{product.name}</h4>
                      <p className="mt-1 text-[11px] text-slate-500">{product.shortName}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black" style={{ color: product.color }}>{progress}٪</span>
                </div>
                <p className="mt-4 min-h-10 text-xs leading-5 text-slate-400">{product.description}</p>
                <div className="mt-5">
                  <ProgressBar value={progress} color={product.color} />
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{product.projects.length} پروژه</span>
                  <span>{tasks.filter((task) => task.status === "DONE").length}/{tasks.length} کار انجام‌شده</span>
                  <span className={blocked ? "text-rose-300" : "text-emerald-300"}>{blocked ? `${blocked} بلاکر` : "بدون بلاکر"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-2xl border border-white/8 bg-[#0E131D] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-white">متریک‌های کلیدی محصولات</h3>
              <p className="mt-1 text-xs text-slate-500">Delivery Progress کنار Product Outcome دیده می‌شود.</p>
            </div>
            <Target size={18} className="text-[#D9BD62]" />
          </div>
          <div className="mt-5 divide-y divide-white/6">
            {products.map((product) => (
              <div key={product.id} className="grid gap-3 py-4 first:pt-0 md:grid-cols-[1.1fr_repeat(3,1fr)] md:items-center">
                <div>
                  <p className="text-sm font-bold text-white">{product.name}</p>
                  <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">{product.objective}</p>
                </div>
                {product.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-lg border border-white/6 bg-white/[0.025] px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500">{metric.label}</span>
                      <span className="text-[10px] text-emerald-300">{metric.trend}</span>
                    </div>
                    <div className="mt-1 flex items-end justify-between gap-2">
                      <span className="text-sm font-black text-white">{metric.value}</span>
                      <span className="text-[9px] text-slate-600">هدف {metric.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#0E131D] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-white">ریسک‌ها و مسیر بحرانی</h3>
              <p className="mt-1 text-xs text-slate-500">مواردی که روی تاریخ تحویل اثر دارند.</p>
            </div>
            <TriangleAlert size={18} className="text-amber-300" />
          </div>
          <div className="mt-5 space-y-3">
            {riskyProjects.map(({ product, project }) => (
              <button key={project.id} onClick={() => onProjectClick(project.id)} className="w-full rounded-xl border border-white/7 bg-white/[0.025] p-3 text-right hover:border-white/15">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${healthTone[project.health]}`} />
                    <span className="text-xs font-bold text-white">{project.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{product.name}</span>
                </div>
                <p className="mt-2 line-clamp-1 text-[11px] text-slate-500">{project.blockers[0] ?? project.metric}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function TimelineView({
  products,
  productFilter,
  query,
  onQueryChange,
  onFilterChange,
  onProjectClick
}: {
  products: DemoProduct[];
  productFilter: string;
  query: string;
  onQueryChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onProjectClick: (id: string) => void;
}) {
  return (
    <section>
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D9BD62]">
            <CalendarRange size={15} />
            رودمپ ۱۸ماهه
          </div>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white">مسیر توسعه دامین Trade</h2>
          <p className="mt-2 text-sm text-slate-500">محصول → پروژه داخلی؛ برای ورود به Epic، Story و Task روی نوار پروژه کلیک کن.</p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <label className="flex min-w-64 items-center gap-2 rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2.5 text-slate-400 focus-within:border-[#C9A84C]/35">
            <Search size={15} />
            <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="جست‌وجوی پروژه یا مالک..." className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-600" />
          </label>
          <select value={productFilter} onChange={(event) => onFilterChange(event.target.value)} className="rounded-xl border border-white/8 bg-[#101620] px-3 py-2.5 text-xs text-slate-200 outline-none">
            <option value="all">همه محصولات</option>
            {tradeProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/8 bg-[#0D121B] shadow-[0_20px_70px_rgba(0,0,0,.24)]">
        <div className="overflow-x-auto scrollbar-soft">
          <div className="min-w-[1320px]">
            <div className="grid border-b border-white/8 bg-white/[0.025]" style={{ gridTemplateColumns: "260px repeat(18, minmax(48px, 1fr))" }}>
              <div className="sticky right-0 z-20 row-span-2 flex items-center border-l border-white/8 bg-[#111721] px-4 text-xs font-bold text-slate-300">محصول / پروژه</div>
              {timelineQuarters.map((quarter) => (
                <div key={quarter.title} className="border-l border-white/8 px-2 py-3 text-center" style={{ gridColumn: `${quarter.start + 2} / span 3` }}>
                  <p className="text-[11px] font-bold text-slate-300">{quarter.title}</p>
                  <p className="mt-1 text-[9px] text-slate-600">{quarter.range}</p>
                </div>
              ))}
              {timelineMonths.map((month, index) => (
                <div key={`${month}-${index}`} className={`border-l border-t border-white/6 px-1 py-2 text-center text-[9px] ${index === 3 ? "bg-[#C9A84C]/8 text-[#E9CB6A]" : "text-slate-600"}`} style={{ gridColumn: index + 2 }}>
                  {month.replace(/ ۱۴۰[۵۶]/, "")}
                </div>
              ))}
            </div>

            {products.map((product) => {
              const productProgress = completion(productTasks(product));
              return (
                <div key={product.id}>
                  <div className="grid border-b border-white/8 bg-white/[0.018]" style={{ gridTemplateColumns: "260px repeat(18, minmax(48px, 1fr))" }}>
                    <div className="sticky right-0 z-10 flex items-center gap-3 border-l border-white/8 bg-[#0F151F] px-4 py-3">
                      <span className="size-2.5 rounded-full" style={{ background: product.color, boxShadow: `0 0 16px ${product.color}` }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black text-white">{product.name}</p>
                        <p className="mt-0.5 text-[9px] text-slate-600">{product.projects.length} پروژه</p>
                      </div>
                      <span className="text-xs font-black" style={{ color: product.color }}>{productProgress}٪</span>
                    </div>
                    <div className="flex items-center px-4 text-[10px] text-slate-500" style={{ gridColumn: "2 / span 18" }}>{product.objective}</div>
                  </div>

                  {product.projects.map((project) => {
                    const progress = completion(projectTasks(project));
                    return (
                      <div key={project.id} className="relative grid min-h-16 border-b border-white/6" style={{ gridTemplateColumns: "260px repeat(18, minmax(48px, 1fr))" }}>
                        <button onClick={() => onProjectClick(project.id)} className="sticky right-0 z-10 border-l border-white/8 bg-[#0D121B] px-4 py-3 text-right hover:bg-[#121925]">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[11px] font-bold text-slate-200">{project.title}</p>
                            <span className={`size-1.5 shrink-0 rounded-full ${healthTone[project.health]}`} />
                          </div>
                          <p className="mt-1 truncate text-[9px] text-slate-600">{project.owner}</p>
                        </button>
                        {timelineMonths.map((_, index) => (
                          <span key={index} className={`border-l border-white/[0.045] ${index === 3 ? "bg-[#C9A84C]/[0.035]" : ""}`} style={{ gridColumn: index + 2, gridRow: 1 }} />
                        ))}
                        <button
                          onClick={() => onProjectClick(project.id)}
                          className="z-[2] my-3 overflow-hidden rounded-lg border px-3 text-right transition hover:brightness-110"
                          style={{
                            gridColumn: `${project.startMonth + 2} / span ${project.duration}`,
                            gridRow: 1,
                            color: product.color,
                            borderColor: `${product.color}36`,
                            background: `linear-gradient(90deg, ${product.color}19, ${product.color}0d)`
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-[10px] font-bold text-white">{project.stage}</span>
                            <span className="text-[10px] font-black">{progress}٪</span>
                          </div>
                          <div className="mt-1 h-1 overflow-hidden rounded-full bg-black/30">
                            <span className="block h-full rounded-full transition-all" style={{ width: `${progress}%`, background: product.color }} />
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-400" />روی برنامه</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-400" />در معرض ریسک</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose-400" />خارج از برنامه</span>
        <span className="mr-auto text-slate-600">ستون طلایی: ماه جاری</span>
      </div>
    </section>
  );
}

function ReportsView({
  reportRange,
  onRangeChange,
  doneTasks,
  nextTasks,
  blockedTasks,
  addedTasks,
  domainProgress,
  products
}: {
  reportRange: ReportRange;
  onRangeChange: (range: ReportRange) => void;
  doneTasks: ReturnType<typeof productTasks>;
  nextTasks: ReturnType<typeof productTasks>;
  blockedTasks: ReturnType<typeof productTasks>;
  addedTasks: ReturnType<typeof productTasks>;
  domainProgress: number;
  products: DemoProduct[];
}) {
  const maxVelocity = Math.max(...velocityHistory.flatMap((item) => [item.done, item.added]));
  const periodLabels = { daily: "امروز", weekly: "این هفته", monthly: "این ماه" };

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#D9BD62]"><FileBarChart size={15} />گزارش خودکار</div>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white">گزارش {periodLabels[reportRange]} دامین Trade</h2>
          <p className="mt-2 text-sm text-slate-500">تحویل‌ها، تغییر Scope، کارهای بعدی و بلاکرها از وضعیت زنده تسک‌ها ساخته می‌شوند.</p>
        </div>
        <div className="flex rounded-xl border border-white/8 bg-white/[0.035] p-1">
          {(["daily", "weekly", "monthly"] as const).map((range) => (
            <button key={range} onClick={() => onRangeChange(range)} className={`rounded-lg px-4 py-2 text-xs font-bold ${reportRange === range ? "bg-white/10 text-white" : "text-slate-500"}`}>
              {{ daily: "روزانه", weekly: "هفتگی", monthly: "ماهانه" }[range]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="پیشرفت پایان دوره" value={`${domainProgress}٪`} hint="۳ واحد درصد رشد نسبت به دوره قبل" icon={TrendingUp} tone="gold" />
        <MetricCard title="تحویل‌شده" value={formatNumber(doneTasks.length)} hint="Task و Sub-task بسته‌شده" icon={CheckCircle2} tone="green" />
        <MetricCard title="Scope جدید" value={`+${formatNumber(addedTasks.length)}`} hint="کار اضافه‌شده در این دوره" icon={Sparkles} tone="blue" />
        <MetricCard title="بلاکر" value={formatNumber(blockedTasks.length)} hint="۲ مورد نیازمند Escalation" icon={OctagonAlert} tone="rose" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <ReportList title="چه چیزهایی انجام شد؟" subtitle="آخرین خروجی‌های تحویل‌شده" icon={CheckCircle2} tone="text-emerald-300" tasks={doneTasks.slice(0, 7)} />
        <ReportList title="گام بعدی چیست؟" subtitle="کارهای Commit‌شده برای دوره بعد" icon={ListChecks} tone="text-sky-300" tasks={nextTasks.slice(0, 7)} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-2xl border border-white/8 bg-[#0E131D] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-black text-white">سرعت تحویل و تغییر Scope</h3>
              <p className="mt-1 text-xs text-slate-500">تعداد Taskهای Done در برابر Taskهای اضافه‌شده</p>
            </div>
            <BarChart3 size={18} className="text-[#D9BD62]" />
          </div>
          <div className="mt-8 grid h-56 grid-cols-6 items-end gap-3 border-b border-white/8">
            {velocityHistory.map((item) => (
              <div key={item.label} className="flex h-full flex-col justify-end">
                <div className="flex flex-1 items-end justify-center gap-1.5">
                  <div className="w-3 rounded-t bg-[#C9A84C] transition-all" style={{ height: `${(item.done / maxVelocity) * 100}%` }} title={`${item.done} انجام‌شده`} />
                  <div className="w-3 rounded-t bg-sky-400/55 transition-all" style={{ height: `${(item.added / maxVelocity) * 100}%` }} title={`${item.added} اضافه‌شده`} />
                </div>
                <p className="mt-3 text-center text-[9px] text-slate-600">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-5 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[#C9A84C]" />Done</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-sky-400/55" />Scope Added</span>
            <span className="mr-auto">میانگین Velocity: ۱۱.۷ کار در هفته</span>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-400/12 bg-[#0E131D] p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-black text-white">بلاکرها و تصمیم‌های لازم</h3>
              <p className="mt-1 text-xs text-slate-500">برای گزارش مدیریتی و Escalation</p>
            </div>
            <TriangleAlert size={18} className="text-rose-300" />
          </div>
          <div className="mt-5 space-y-3">
            {products.flatMap((product) => product.projects.map((project) => ({ product, project }))).filter(({ project }) => project.blockers.length).map(({ product, project }) => (
              <div key={project.id} className="rounded-xl border border-rose-400/10 bg-rose-400/[0.035] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold text-white">{project.title}</p>
                  <span className="shrink-0 text-[9px] text-slate-600">{product.name}</span>
                </div>
                <ul className="mt-2 space-y-1 text-[11px] leading-5 text-rose-200/75">
                  {project.blockers.map((blocker) => <li key={blocker}>• {blocker}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportList({
  title,
  subtitle,
  icon: Icon,
  tone,
  tasks
}: {
  title: string;
  subtitle: string;
  icon: typeof CheckCircle2;
  tone: string;
  tasks: ReturnType<typeof productTasks>;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#0E131D] p-5">
      <div className="flex items-start justify-between">
        <div><h3 className="font-black text-white">{title}</h3><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div>
        <Icon size={18} className={tone} />
      </div>
      <div className="mt-5 divide-y divide-white/6">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
            <div className="flex min-w-0 items-center gap-2">
              <span className={`size-1.5 shrink-0 rounded-full ${task.status === "DONE" ? "bg-emerald-400" : "bg-sky-400"}`} />
              <p className="truncate text-xs text-slate-300">{task.title}</p>
            </div>
            <span className="shrink-0 text-[10px] text-slate-600">{task.owner}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectDrawer({
  product,
  project,
  onClose,
  onToggleTask
}: {
  product: DemoProduct;
  project: DemoProject;
  onClose: () => void;
  onToggleTask: (taskId: string) => void;
}) {
  const tasks = projectTasks(project);
  const progress = completion(tasks);
  const done = tasks.filter((task) => task.status === "DONE").length;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm" dir="rtl" onMouseDown={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-drawer-title"
        className="mr-auto h-full w-full max-w-2xl overflow-y-auto border-r border-white/10 bg-[#0B1018] shadow-[-30px_0_100px_rgba(0,0,0,.45)] scrollbar-soft"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-white/8 bg-[#0B1018]/92 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold" style={{ color: product.color }}>
              <span className="size-2 rounded-full" style={{ background: product.color }} />
              {product.name}
              <ChevronLeft size={13} className="text-slate-600" />
              پروژه داخلی
            </div>
            <button onClick={onClose} className="grid size-9 place-items-center rounded-lg border border-white/8 bg-white/[0.035] text-slate-400 hover:text-white" aria-label="بستن جزئیات">
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="p-5 md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <h2 id="project-drawer-title" className="text-2xl font-black tracking-tight text-white">{project.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{project.summary}</p>
            </div>
            <div className="min-w-24 rounded-xl border border-white/8 bg-white/[0.035] p-3 text-center">
              <p className="text-2xl font-black" style={{ color: product.color }}>{progress}٪</p>
              <p className="mt-1 text-[9px] text-slate-600">{done} از {tasks.length} کار</p>
            </div>
          </div>

          <div className="mt-5"><ProgressBar value={progress} color={product.color} /></div>
          <p className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-600"><Sparkles size={12} />چک‌باکس یک Task را تغییر بده؛ درصد این پروژه، محصول و کل دامین Live محاسبه می‌شود.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Info title="هدف پروژه" value={project.goal} icon={Target} />
            <Info title="متریک موفقیت" value={project.metric} icon={Gauge} />
            <Info title="مالک و تیم" value={`${project.owner} · ${project.team}`} icon={Network} />
            <Info title="تاریخ هدف" value={project.target} icon={CalendarRange} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-[10px]">
            <span className="rounded-full border border-white/8 bg-white/[0.035] px-3 py-1.5 text-slate-300">{project.stage}</span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.035] px-3 py-1.5 text-slate-300"><span className={`size-1.5 rounded-full ${healthTone[project.health]}`} />{healthLabel[project.health]}</span>
            {project.dependencies.map((dependency) => <span key={dependency} className="rounded-full border border-sky-400/15 bg-sky-400/[0.04] px-3 py-1.5 text-sky-200/75">وابسته به {dependency}</span>)}
          </div>

          {project.blockers.length ? (
            <div className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/[0.055] p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-200"><OctagonAlert size={15} />بلاکر فعال</div>
              <ul className="mt-2 space-y-1 text-xs leading-6 text-rose-200/70">{project.blockers.map((blocker) => <li key={blocker}>• {blocker}</li>)}</ul>
            </div>
          ) : null}

          <div className="mt-8">
            <div className="mb-4 flex items-end justify-between">
              <div><h3 className="font-black text-white">ساختار اجرا</h3><p className="mt-1 text-xs text-slate-500">Epic → User Story → Task</p></div>
              <span className="text-[10px] text-slate-600">{project.epics.length} Epic</span>
            </div>
            <div className="space-y-3">
              {project.epics.map((epic) => {
                const epicTasks = epic.stories.flatMap((story) => story.tasks);
                return (
                  <details key={epic.id} open className="group overflow-hidden rounded-xl border border-white/8 bg-white/[0.025]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                      <div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg border border-violet-400/15 bg-violet-400/[0.05] text-violet-300"><Blocks size={15} /></span><div><p className="text-xs font-bold text-white">{epic.title}</p><p className="mt-1 text-[9px] text-slate-600">{epic.stories.length} Story · {epicTasks.length} Task</p></div></div>
                      <span className="text-xs font-black" style={{ color: product.color }}>{completion(epicTasks)}٪</span>
                    </summary>
                    <div className="border-t border-white/6 px-4 py-3">
                      {epic.stories.map((story) => (
                        <div key={story.id} className="py-2">
                          <div className="mb-2 flex items-center justify-between"><p className="text-[11px] font-bold text-slate-300">User Story: {story.title}</p><span className="text-[9px] text-slate-600">{completion(story.tasks)}٪</span></div>
                          <div className="space-y-1.5">
                            {story.tasks.map((task) => (
                              <button
                                key={task.id}
                                type="button"
                                aria-pressed={task.status === "DONE"}
                                aria-label={`${task.title} — ${statusLabels[task.status]}`}
                                onClick={() => onToggleTask(task.id)}
                                className="flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-right hover:border-white/7 hover:bg-white/[0.025]"
                              >
                                <span className={`grid size-5 shrink-0 place-items-center rounded-md border ${task.status === "DONE" ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300" : "border-white/15 bg-white/[0.025] text-transparent"}`}>
                                  <CheckCircle2 size={13} />
                                </span>
                                <span className={`min-w-0 flex-1 truncate text-[11px] ${task.status === "DONE" ? "text-slate-500 line-through" : "text-slate-300"}`}>{task.title}</span>
                                <span className={`shrink-0 rounded-full border px-2 py-1 text-[8px] ${statusTone[task.status]}`}>{statusLabels[task.status]}</span>
                                <span className="hidden w-14 shrink-0 text-[9px] text-slate-600 sm:block">{task.owner}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Info({ title, value, icon: Icon }: { title: string; value: string; icon: typeof Target }) {
  return (
    <div className="rounded-xl border border-white/7 bg-white/[0.025] p-3">
      <div className="flex items-center gap-2 text-[10px] text-slate-600"><Icon size={13} />{title}</div>
      <p className="mt-2 text-xs leading-5 text-slate-300">{value}</p>
    </div>
  );
}
