"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Edit3,
  Filter,
  Gauge,
  LayoutDashboard,
  Plus,
  Save,
  Search,
  Trash2,
  X
} from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { roleLabels, statusClasses, statusLabels } from "@/lib/labels";
import type { Me, ProjectWithRelations, WorkspaceRoadmap } from "@/types/roadmap";

type ProjectForm = {
  id?: string;
  domainId: string;
  startPhaseId: string;
  name: string;
  status: string;
  progress: number;
  span: number;
  tag: string;
  note: string;
};

const statusOptions = ["ACTIVE", "DONE", "SOON", "PLANNED", "PAUSED", "REVIEW"] as const;

async function readError(response: Response) {
  const data = await response.json().catch(() => ({}));
  return data.error ?? "درخواست کامل نشد.";
}

function emptyForm(workspace: WorkspaceRoadmap, domainId?: string, phaseId?: string): ProjectForm {
  return {
    domainId: domainId ?? workspace.domains[0]?.id ?? "",
    startPhaseId: phaseId ?? workspace.phases[0]?.id ?? "",
    name: "",
    status: "PLANNED",
    progress: 0,
    span: 1,
    tag: "",
    note: ""
  };
}

function formFromProject(project: ProjectWithRelations): ProjectForm {
  return {
    id: project.id,
    domainId: project.domainId,
    startPhaseId: project.startPhaseId,
    name: project.name,
    status: project.status,
    progress: project.progress,
    span: project.span,
    tag: project.tag ?? "",
    note: project.note ?? ""
  };
}

export function RoadmapClient({
  initialWorkspace,
  user
}: {
  initialWorkspace: WorkspaceRoadmap;
  user: Me;
}) {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [domainFilter, setDomainFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<ProjectForm | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const canEdit = user.role === "SUPER_ADMIN" || user.role === "WORKSPACE_ADMIN";

  const phaseIndex = useMemo(
    () => new Map(workspace.phases.map((phase, index) => [phase.id, index])),
    [workspace.phases]
  );

  const projects = useMemo(() => {
    const term = query.trim().toLowerCase();
    return workspace.projects.filter((project) => {
      const domainOk = domainFilter === "all" || project.domainId === domainFilter;
      const statusOk = statusFilter === "all" || project.status === statusFilter;
      const queryOk =
        !term ||
        project.name.toLowerCase().includes(term) ||
        project.tag?.toLowerCase().includes(term) ||
        project.note?.toLowerCase().includes(term);
      return domainOk && statusOk && queryOk;
    });
  }, [domainFilter, query, statusFilter, workspace.projects]);

  async function reloadWorkspace() {
    const response = await fetch(`/api/workspaces/${workspace.slug}`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setWorkspace(data.workspace);
    }
  }

  function projectsForDomain(domainId: string) {
    return projects.filter((project) => project.domainId === domainId);
  }

  function phaseProgress(phaseId: string) {
    const index = phaseIndex.get(phaseId) ?? 0;
    const inPhase = workspace.projects.filter((project) => {
      const start = phaseIndex.get(project.startPhaseId) ?? 0;
      return index >= start && index < start + project.span;
    });
    if (!inPhase.length) return 0;
    return Math.round(inPhase.reduce((sum, project) => sum + project.progress, 0) / inPhase.length);
  }

  async function saveProject(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");

    const url = form.id ? `/api/projects/${form.id}` : `/api/workspaces/${workspace.slug}/projects`;
    const response = await fetch(url, {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domainId: form.domainId,
        startPhaseId: form.startPhaseId,
        name: form.name,
        status: form.status,
        progress: Number(form.progress),
        span: Number(form.span),
        tag: form.tag || null,
        note: form.note || null
      })
    });

    setSaving(false);

    if (!response.ok) {
      setError(await readError(response));
      return;
    }

    await reloadWorkspace();
    setForm(null);
    setConfirmDelete(false);
    setToast(form.id ? "پروژه ویرایش شد." : "پروژه جدید ساخته شد.");
  }

  async function deleteProject() {
    if (!form?.id) return;
    setSaving(true);
    setError("");

    const response = await fetch(`/api/projects/${form.id}`, { method: "DELETE" });
    setSaving(false);

    if (!response.ok) {
      setError(await readError(response));
      return;
    }

    await reloadWorkspace();
    setForm(null);
    setConfirmDelete(false);
    setToast("پروژه حذف شد.");
  }

  return (
    <main className="min-h-screen px-4 py-5 md:px-6">
      <header className="mx-auto flex max-w-[1800px] flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/"
            className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/8 text-slate-100 hover:border-[#C9A84C]/50"
            title="بازگشت"
          >
            <ArrowRight size={18} />
          </Link>
          <div>
            <p className="text-sm text-[#C9A84C]">رودمپ workspace</p>
            <h1 className="mt-1 text-2xl font-bold md:text-4xl">{workspace.name}</h1>
            <p className="mt-2 text-sm text-slate-300">
              {user.fullName}، {roleLabels[user.role]} {user.workspace ? `در ${user.workspace.name}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user.role === "SUPER_ADMIN" ? (
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/8 px-4 py-2 text-sm text-slate-100 hover:border-[#C9A84C]/50"
            >
              <LayoutDashboard size={17} />
              مدیریت
            </Link>
          ) : null}
          {canEdit ? (
            <button
              type="button"
              onClick={() => {
                setConfirmDelete(false);
                setError("");
                setForm(emptyForm(workspace));
              }}
              className="inline-flex items-center gap-2 rounded-md bg-[#C9A84C] px-4 py-2 text-sm font-bold text-[#111318] hover:bg-[#E2C86A]"
            >
              <Plus size={18} />
              پروژه جدید
            </button>
          ) : null}
          <LogoutButton />
        </div>
      </header>

      {toast ? (
        <div className="fixed left-5 top-5 z-50 rounded-md border border-emerald-300/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100 shadow-2xl">
          <button className="ml-3 text-emerald-100/70" onClick={() => setToast("")}>
            <X size={14} />
          </button>
          {toast}
        </div>
      ) : null}

      <section className="mx-auto mt-6 grid max-w-[1800px] gap-5 xl:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="glass h-fit rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Filter size={18} className="text-[#C9A84C]" />
            فیلترها
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-xs text-slate-400">جست‌وجو</span>
            <span className="flex items-center gap-2 rounded-md border border-white/10 bg-white/7 px-3 py-2 focus-within:border-[#C9A84C]/60">
              <Search size={16} className="text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="نام، تگ، یادداشت"
              />
            </span>
          </label>

          <div className="mt-5">
            <p className="mb-2 text-xs text-slate-400">دامین</p>
            <div className="space-y-2">
              <FilterButton active={domainFilter === "all"} onClick={() => setDomainFilter("all")}>
                همه دامین‌ها
              </FilterButton>
              {workspace.domains.map((domain) => (
                <FilterButton
                  key={domain.id}
                  active={domainFilter === domain.id}
                  onClick={() => setDomainFilter(domain.id)}
                  color={domain.color}
                >
                  {domain.name}
                </FilterButton>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs text-slate-400">وضعیت</p>
            <div className="grid grid-cols-2 gap-2">
              <FilterButton active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
                همه
              </FilterButton>
              {statusOptions.map((status) => (
                <FilterButton
                  key={status}
                  active={statusFilter === status}
                  onClick={() => setStatusFilter(status)}
                >
                  {statusLabels[status]}
                </FilterButton>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-md border border-white/10 bg-white/6 p-3">
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <Gauge size={17} className="text-[#C9A84C]" />
              میانگین کل
            </div>
            <p className="mt-2 text-3xl font-bold">
              {workspace.projects.length
                ? Math.round(workspace.projects.reduce((sum, project) => sum + project.progress, 0) / workspace.projects.length)
                : 0}
              %
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="scrollbar-soft overflow-x-auto rounded-lg border border-white/10 bg-black/18">
            <div className="min-w-[980px]">
              <div
                className="grid border-b border-white/10 bg-white/6"
                style={{ gridTemplateColumns: `180px repeat(${workspace.phases.length}, minmax(190px, 1fr))` }}
              >
                <div className="border-l border-white/10 p-4 text-sm text-slate-400">اسکوآد</div>
                {workspace.phases.map((phase) => (
                  <div key={phase.id} className="border-l border-white/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold" style={{ color: phase.color }}>
                          {phase.label}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">{phase.subtitle}</p>
                      </div>
                      <span className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs">
                        {phaseProgress(phase.id)}%
                      </span>
                    </div>
                    {phase.goal ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300">{phase.goal}</p> : null}
                  </div>
                ))}
              </div>

              {workspace.domains.map((domain) => {
                const domainProjects = projectsForDomain(domain.id);
                return (
                  <div
                    key={domain.id}
                    className="grid border-b border-white/10 last:border-b-0"
                    style={{ gridTemplateColumns: `180px repeat(${workspace.phases.length}, minmax(190px, 1fr))` }}
                  >
                    <div className="border-l border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ background: domain.color }} />
                        <h3 className="text-sm font-bold">{domain.name}</h3>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">{domainProjects.length} پروژه</p>
                      {canEdit ? (
                        <button
                          type="button"
                          title="افزودن پروژه"
                          onClick={() => {
                            setConfirmDelete(false);
                            setError("");
                            setForm(emptyForm(workspace, domain.id));
                          }}
                          className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/8 text-[#C9A84C] hover:border-[#C9A84C]/50"
                        >
                          <Plus size={17} />
                        </button>
                      ) : null}
                    </div>

                    <div
                      className="grid min-h-[136px] auto-rows-min gap-3 p-3"
                      style={{
                        gridColumn: "2 / -1",
                        gridTemplateColumns: `repeat(${workspace.phases.length}, minmax(190px, 1fr))`
                      }}
                    >
                      {domainProjects.map((project) => {
                        const start = phaseIndex.get(project.startPhaseId) ?? 0;
                        const span = Math.max(1, Math.min(project.span, workspace.phases.length - start));
                        return (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            canEdit={canEdit}
                            onClick={() => {
                              if (!canEdit) return;
                              setConfirmDelete(false);
                              setError("");
                              setForm(formFromProject(project));
                            }}
                            style={{ gridColumn: `${start + 1} / span ${span}` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </section>

      {form ? (
        <ProjectModal
          form={form}
          setForm={setForm}
          workspace={workspace}
          error={error}
          saving={saving}
          confirmDelete={confirmDelete}
          onClose={() => {
            setForm(null);
            setConfirmDelete(false);
            setError("");
          }}
          onSubmit={saveProject}
          onDeleteRequest={() => setConfirmDelete(true)}
          onCancelDelete={() => setConfirmDelete(false)}
          onDelete={deleteProject}
        />
      ) : null}
    </main>
  );
}

function FilterButton({
  children,
  active,
  onClick,
  color
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-start gap-2 rounded-md border px-3 py-2 text-sm transition ${
        active ? "border-[#C9A84C]/50 bg-[#C9A84C]/15 text-[#FFE9A4]" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/8"
      }`}
    >
      {color ? <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} /> : null}
      {children}
    </button>
  );
}

function ProjectCard({
  project,
  canEdit,
  onClick,
  style
}: {
  project: ProjectWithRelations;
  canEdit: boolean;
  onClick: () => void;
  style: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      disabled={!canEdit}
      onClick={onClick}
      className="group relative min-h-[96px] rounded-md border p-3 text-right shadow-xl transition enabled:hover:-translate-y-0.5 disabled:cursor-default"
      style={{
        ...style,
        borderColor: `${project.domain.color}77`,
        background: `linear-gradient(135deg, ${project.domain.color}2A, rgba(14,18,27,.92))`
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="line-clamp-2 text-sm font-bold leading-6">{project.name}</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={`rounded-md border px-2 py-1 text-[11px] ${statusClasses[project.status]}`}>
              {statusLabels[project.status]}
            </span>
            {project.tag ? (
              <span className="rounded-md border border-white/10 bg-white/8 px-2 py-1 text-[11px] text-slate-200">
                {project.tag}
              </span>
            ) : null}
          </div>
        </div>
        {canEdit ? <Edit3 size={15} className="shrink-0 text-[#C9A84C]/80 opacity-0 transition group-hover:opacity-100" /> : null}
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/30">
        <div className="h-full rounded-full" style={{ width: `${project.progress}%`, background: project.domain.color }} />
      </div>
      <p className="mt-1 text-left text-xs text-slate-300">{project.progress}%</p>

      <div className="pointer-events-none absolute right-3 top-full z-20 mt-2 hidden w-64 rounded-md border border-white/10 bg-[#111722] p-3 text-right text-xs leading-6 text-slate-200 shadow-2xl group-hover:block">
        <p className="font-bold text-white">{project.name}</p>
        <p className="mt-1 text-slate-400">شروع: {project.startPhase.label}</p>
        <p className="text-slate-400">طول: {project.span} فاز</p>
        {project.note ? <p className="mt-2 text-slate-300">{project.note}</p> : null}
      </div>
    </button>
  );
}

function ProjectModal({
  form,
  setForm,
  workspace,
  error,
  saving,
  confirmDelete,
  onClose,
  onSubmit,
  onDeleteRequest,
  onCancelDelete,
  onDelete
}: {
  form: ProjectForm;
  setForm: (form: ProjectForm) => void;
  workspace: WorkspaceRoadmap;
  error: string;
  saving: boolean;
  confirmDelete: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  onDeleteRequest: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 px-4 py-8 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="glass-strong scrollbar-soft max-h-full w-full max-w-2xl overflow-y-auto rounded-lg p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[#C9A84C]">{form.id ? "ویرایش پروژه" : "پروژه جدید"}</p>
            <h2 className="mt-1 text-2xl font-bold">جزئیات پروژه</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/8"
          >
            <X size={17} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">نام پروژه</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-md border border-white/10 bg-white/7 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]/60"
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-slate-300">دامین</span>
            <select
              value={form.domainId}
              onChange={(event) => setForm({ ...form, domainId: event.target.value })}
              className="w-full rounded-md border border-white/10 bg-[#151a25] px-3 py-2 text-sm outline-none focus:border-[#C9A84C]/60"
            >
              {workspace.domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm text-slate-300">فاز شروع</span>
            <select
              value={form.startPhaseId}
              onChange={(event) => setForm({ ...form, startPhaseId: event.target.value })}
              className="w-full rounded-md border border-white/10 bg-[#151a25] px-3 py-2 text-sm outline-none focus:border-[#C9A84C]/60"
            >
              {workspace.phases.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {phase.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm text-slate-300">وضعیت</span>
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              className="w-full rounded-md border border-white/10 bg-[#151a25] px-3 py-2 text-sm outline-none focus:border-[#C9A84C]/60"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm text-slate-300">طول پروژه بر حسب فاز</span>
            <input
              value={form.span}
              onChange={(event) => setForm({ ...form, span: Number(event.target.value) })}
              className="w-full rounded-md border border-white/10 bg-white/7 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]/60"
              type="number"
              min={1}
              max={workspace.phases.length}
              required
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 flex items-center justify-between text-sm text-slate-300">
              پیشرفت
              <span className="text-[#C9A84C]">{form.progress}%</span>
            </span>
            <input
              value={form.progress}
              onChange={(event) => setForm({ ...form, progress: Number(event.target.value) })}
              className="w-full accent-[#C9A84C]"
              type="range"
              min={0}
              max={100}
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">تگ</span>
            <input
              value={form.tag}
              onChange={(event) => setForm({ ...form, tag: event.target.value })}
              className="w-full rounded-md border border-white/10 bg-white/7 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]/60"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">یادداشت</span>
            <textarea
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
              className="min-h-28 w-full resize-y rounded-md border border-white/10 bg-white/7 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]/60"
            />
          </label>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {form.id ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled={saving}
                onClick={confirmDelete ? onDelete : onDeleteRequest}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-rose-300/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-100 hover:bg-rose-500/20 disabled:opacity-60"
              >
                <Trash2 size={17} />
                {confirmDelete ? "تایید حذف" : "حذف پروژه"}
              </button>
              {confirmDelete ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={onCancelDelete}
                  className="inline-flex items-center justify-center rounded-md border border-white/10 px-4 py-2 text-sm text-slate-200 hover:border-[#C9A84C]/50 disabled:opacity-60"
                >
                  انصراف از حذف
                </button>
              ) : null}
            </div>
          ) : (
            <span />
          )}
          <button
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#C9A84C] px-5 py-2.5 text-sm font-bold text-[#111318] hover:bg-[#E2C86A] disabled:opacity-60"
          >
            <Save size={17} />
            {saving ? "در حال ذخیره..." : "ذخیره"}
          </button>
        </div>
      </form>
    </div>
  );
}
