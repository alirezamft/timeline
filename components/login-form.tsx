"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LockKeyhole, LogIn, UserRound } from "lucide-react";

type ApiUser = {
  mustChangePassword: boolean;
  role: string;
  workspace?: { slug: string } | null;
};

async function readError(response: Response) {
  const data = await response.json().catch(() => ({}));
  return data.error ?? "درخواست کامل نشد.";
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    setLoading(false);

    if (!response.ok) {
      setError(await readError(response));
      return;
    }

    const data = (await response.json()) as { user: ApiUser };
    const next = searchParams.get("next");

    if (data.user.mustChangePassword) {
      window.location.href = "/change-password";
      return;
    }

    window.location.href = next || "/";
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <section className="glass-strong w-full max-w-md rounded-lg p-6 md:p-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#C9A84C]">Timeline Roadmap</p>
          <h1 className="mt-3 text-3xl font-bold">ورود به رودمپ سازمانی</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">با حساب داخلی تیم وارد شوید.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">نام کاربری</span>
            <span className="flex items-center gap-2 rounded-md border border-white/10 bg-white/7 px-3 py-2 focus-within:border-[#C9A84C]/60">
              <UserRound size={18} className="text-slate-400" />
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                autoComplete="username"
                required
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">رمز عبور</span>
            <span className="flex items-center gap-2 rounded-md border border-white/10 bg-white/7 px-3 py-2 focus-within:border-[#C9A84C]/60">
              <LockKeyhole size={18} className="text-slate-400" />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                type="password"
                autoComplete="current-password"
                required
              />
            </span>
          </label>

          {error ? (
            <div className="rounded-md border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#C9A84C] px-4 py-3 text-sm font-bold text-[#111318] transition hover:bg-[#E2C86A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn size={18} />
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>
      </section>
    </main>
  );
}
