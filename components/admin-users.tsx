"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Plus, Save, Trash2, Users } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { roleLabels } from "@/lib/labels";

type WorkspaceOption = {
  id: string;
  name: string;
  slug: string;
};

type UserRow = {
  id: string;
  username: string;
  fullName: string;
  role: "SUPER_ADMIN" | "WORKSPACE_ADMIN" | "VIEWER";
  workspaceId: string | null;
  mustChangePassword: boolean;
  lastLogin: string | null;
  workspace: WorkspaceOption | null;
};

type UserForm = {
  id?: string;
  fullName: string;
  username: string;
  password: string;
  role: UserRow["role"];
  workspaceId: string;
  mustChangePassword: boolean;
};

const roleOptions: UserRow["role"][] = ["SUPER_ADMIN", "WORKSPACE_ADMIN", "VIEWER"];

async function readError(response: Response) {
  const data = await response.json().catch(() => ({}));
  return data.error ?? "درخواست کامل نشد.";
}

function emptyForm(workspaces: WorkspaceOption[]): UserForm {
  return {
    fullName: "",
    username: "",
    password: "",
    role: "VIEWER",
    workspaceId: workspaces[0]?.id ?? "",
    mustChangePassword: true
  };
}

function formFromUser(user: UserRow, workspaces: WorkspaceOption[]): UserForm {
  return {
    id: user.id,
    fullName: user.fullName,
    username: user.username,
    password: "",
    role: user.role,
    workspaceId: user.workspaceId ?? workspaces[0]?.id ?? "",
    mustChangePassword: user.mustChangePassword
  };
}

export function AdminUsers({
  initialUsers,
  workspaces,
  currentUserId
}: {
  initialUsers: UserRow[];
  workspaces: WorkspaceOption[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState<UserForm>(() => emptyForm(workspaces));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function reload() {
    const response = await fetch("/api/users", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setUsers(data.users);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const isEdit = Boolean(form.id);
    const response = await fetch(isEdit ? `/api/users/${form.id}` : "/api/users", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.fullName,
        username: form.username,
        password: form.password,
        role: form.role,
        workspaceId: form.role === "SUPER_ADMIN" ? null : form.workspaceId,
        mustChangePassword: form.mustChangePassword
      })
    });

    setLoading(false);

    if (!response.ok) {
      setError(await readError(response));
      return;
    }

    await reload();
    setForm(emptyForm(workspaces));
  }

  async function deleteUser(id: string) {
    const confirmed = window.confirm("این کاربر حذف شود؟");
    if (!confirmed) return;

    const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    await reload();
  }

  return (
    <main className="min-h-screen px-5 py-6 md:px-8">
      <header className="mx-auto flex max-w-7xl flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-[#C9A84C]">مدیریت</p>
          <h1 className="mt-2 text-3xl font-bold">کاربران</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/8 px-4 py-2 text-sm hover:border-[#C9A84C]/50"
          >
            داشبورد
          </Link>
          <Link
            href="/admin/workspaces"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/8 px-4 py-2 text-sm hover:border-[#C9A84C]/50"
          >
            Workspaceها
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section className="mx-auto mt-8 grid max-w-7xl gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={submit} className="glass h-fit rounded-lg p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="text-[#C9A84C]" size={20} />
              <h2 className="font-bold">{form.id ? "ویرایش کاربر" : "کاربر جدید"}</h2>
            </div>
            {form.id ? (
              <button
                type="button"
                onClick={() => setForm(emptyForm(workspaces))}
                className="text-sm text-slate-300 hover:text-white"
              >
                فرم جدید
              </button>
            ) : null}
          </div>

          <div className="grid gap-4">
            <label>
              <span className="mb-2 block text-sm text-slate-300">نام نمایشی</span>
              <input
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                className="w-full rounded-md border border-white/10 bg-white/7 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]/60"
                required
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-slate-300">نام کاربری</span>
              <input
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
                disabled={Boolean(form.id)}
                className="w-full rounded-md border border-white/10 bg-white/7 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]/60 disabled:opacity-60"
                dir="ltr"
                required
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-slate-300">
                رمز عبور {form.id ? "(در صورت نیاز به تغییر پر کنید)" : ""}
              </span>
              <input
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="w-full rounded-md border border-white/10 bg-white/7 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]/60"
                type="password"
                required={!form.id}
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-slate-300">نقش</span>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm({
                    ...form,
                    role: event.target.value as UserRow["role"]
                  })
                }
                className="w-full rounded-md border border-white/10 bg-[#151a25] px-3 py-2 text-sm outline-none focus:border-[#C9A84C]/60"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </select>
            </label>

            {form.role !== "SUPER_ADMIN" ? (
              <label>
                <span className="mb-2 block text-sm text-slate-300">Workspace</span>
                <select
                  value={form.workspaceId}
                  onChange={(event) => setForm({ ...form, workspaceId: event.target.value })}
                  className="w-full rounded-md border border-white/10 bg-[#151a25] px-3 py-2 text-sm outline-none focus:border-[#C9A84C]/60"
                >
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <label className="flex items-center gap-2 rounded-md border border-white/10 bg-white/6 px-3 py-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={form.mustChangePassword}
                onChange={(event) => setForm({ ...form, mustChangePassword: event.target.checked })}
                className="accent-[#C9A84C]"
              />
              تغییر رمز در ورود بعدی الزامی باشد
            </label>
          </div>

          {error ? (
            <div className="mt-4 rounded-md border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#C9A84C] px-4 py-2.5 text-sm font-bold text-[#111318] hover:bg-[#E2C86A] disabled:opacity-60"
          >
            {form.id ? <Save size={18} /> : <Plus size={18} />}
            {loading ? "در حال ذخیره..." : form.id ? "ذخیره تغییرات" : "ساخت کاربر"}
          </button>
        </form>

        <div className="glass rounded-lg p-5">
          <h2 className="mb-4 font-bold">لیست کاربران</h2>
          <div className="scrollbar-soft overflow-x-auto">
            <table className="w-full min-w-[900px] border-separate border-spacing-y-2 text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-right">نام</th>
                  <th className="px-3 py-2 text-right">نام کاربری</th>
                  <th className="px-3 py-2 text-right">نقش</th>
                  <th className="px-3 py-2 text-right">Workspace</th>
                  <th className="px-3 py-2 text-right">تغییر رمز</th>
                  <th className="px-3 py-2 text-right">آخرین ورود</th>
                  <th className="px-3 py-2 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="bg-white/6">
                    <td className="rounded-r-md px-3 py-3 font-semibold">{user.fullName}</td>
                    <td className="px-3 py-3 text-slate-300" dir="ltr">
                      {user.username}
                    </td>
                    <td className="px-3 py-3">{roleLabels[user.role]}</td>
                    <td className="px-3 py-3">{user.workspace?.name ?? "همه"}</td>
                    <td className="px-3 py-3">{user.mustChangePassword ? "بله" : "خیر"}</td>
                    <td className="px-3 py-3">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("fa-IR") : "—"}
                    </td>
                    <td className="rounded-l-md px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setForm(formFromUser(user, workspaces))}
                          className="rounded-md border border-white/10 bg-white/8 px-3 py-1.5 text-xs hover:border-[#C9A84C]/50"
                        >
                          ویرایش
                        </button>
                        <button
                          type="button"
                          disabled={user.id === currentUserId}
                          onClick={() => deleteUser(user.id)}
                          className="inline-flex items-center rounded-md border border-rose-300/25 bg-rose-500/10 px-2 py-1.5 text-xs text-rose-100 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
