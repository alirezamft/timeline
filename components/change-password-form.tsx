"use client";

import { FormEvent, useState } from "react";
import { KeyRound, Save } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import type { Me } from "@/types/roadmap";

async function readError(response: Response) {
  const data = await response.json().catch(() => ({}));
  return data.error ?? "درخواست کامل نشد.";
}

export function ChangePasswordForm({ user }: { user: Me }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    setLoading(false);

    if (!response.ok) {
      setError(await readError(response));
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <section className="glass-strong w-full max-w-lg rounded-lg p-6 md:p-8">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#C9A84C]">{user.fullName}</p>
            <h1 className="mt-3 text-2xl font-bold">تغییر رمز اجباری</h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              رمز اولیه فقط برای ورود اول است. یک رمز جدید و امن انتخاب کنید.
            </p>
          </div>
          <KeyRound className="text-[#C9A84C]" size={26} />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">رمز فعلی</span>
            <input
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/7 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]/60"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">رمز جدید</span>
            <input
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-md border border-white/10 bg-white/7 px-3 py-2 text-sm outline-none focus:border-[#C9A84C]/60"
              type="password"
              autoComplete="new-password"
              required
            />
          </label>

          {error ? (
            <div className="rounded-md border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#C9A84C] px-4 py-3 text-sm font-bold text-[#111318] hover:bg-[#E2C86A] disabled:opacity-60"
            >
              <Save size={18} />
              {loading ? "در حال ذخیره..." : "ذخیره رمز جدید"}
            </button>
            <LogoutButton />
          </div>
        </form>
      </section>
    </main>
  );
}
