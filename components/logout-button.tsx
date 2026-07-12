"use client";

import { LogOut } from "lucide-react";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/8 px-4 py-2 text-sm text-slate-100 hover:border-rose-300/50 hover:text-rose-100"
    >
      <LogOut size={17} />
      خروج
    </button>
  );
}
