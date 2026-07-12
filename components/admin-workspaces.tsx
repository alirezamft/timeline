"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Building2, Plus, RefreshCw } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  _count?: { users: number; projects: number };
  usersCount?: number;
  projectsCount?: number;
};

async function readError(response: Response) {
  const data = await response.json().catch(() => ({}));
  return data.error ?? "درخواست کامل نشد.";
}

export function AdminWorkspaces({
  initialWorkspaces
}: {
  initialWorkspaces: WorkspaceRow[];
  user: { fullName: string };
}) {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function reload() {
    const response = await fetch("/api/workspaces", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setWorkspaces(data.workspaces);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug })
    });

    setLoading(false);

    if (!response.ok) {
      setError(await readError(response));
      return;
    }

    setName("");
    setSlug("");
    await reload();
  }

  return (
    <main className="min-h-screen px-5 py-6 md:px-8">
      <header className="mx-auto flex max-w-6xl flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-[#C9A84C]">مدیریت</p>
          <h1 className="mt-2 text-3xl font-bold">Workspaceها</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/8 px-4 py-2 text-sm hover:border-[#C9A84C]/50"
          >
            داشبورد
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/8 px-4 py-2 text-sm hover:border-[#C9A84C]/50"
          >
            کاربران
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section className="mx-auto mt-8 grid max-w-6xl gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <form onSubmit={submit} className="glass h-fit rounded-lg p-5">
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="text-[#C9A84C]" size={20} />
            <h2 className="font-bold">Workspace جدید</h2>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">نام تیم</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/7 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]/60"
              placeholder="دامین عملیات"
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm text-slate-300">slug</span>
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/7 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]/60"
              placeholder="operations"
              dir="ltr"
              required
            />
          </label>

          {error ? (
            <div className="mt-4 rounded-md border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#C9A84C] px-4 py-2.5 text-sm font-bold text-[#111318] hover:bg-[#E2C86A] disabled:opacity-60"
          >
            <Plus size={18} />
            {loading ? "در حال ساخت..." : "ساخت workspace"}
          </button>
        </form>

        <div className="glass rounded-lg p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-bold">لیست workspaceها</h2>
            <button
              type="button"
              onClick={reload}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/8"
              title="به‌روزرسانی"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-separate border-spacing-y-2 text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-right">نام</th>
                  <th className="px-3 py-2 text-right">slug</th>
                  <th className="px-3 py-2 text-right">کاربران</th>
                  <th className="px-3 py-2 text-right">پروژه‌ها</th>
                  <th className="px-3 py-2 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {workspaces.map((workspace) => (
                  <tr key={workspace.id} className="bg-white/6">
                    <td className="rounded-r-md px-3 py-3 font-semibold">{workspace.name}</td>
                    <td className="px-3 py-3 text-slate-300" dir="ltr">
                      {workspace.slug}
                    </td>
                    <td className="px-3 py-3">{workspace._count?.users ?? workspace.usersCount ?? 0}</td>
                    <td className="px-3 py-3">{workspace._count?.projects ?? workspace.projectsCount ?? 0}</td>
                    <td className="rounded-l-md px-3 py-3">
                      <Link className="text-[#FFE9A4] hover:underline" href={`/w/${workspace.slug}`}>
                        رودمپ
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
