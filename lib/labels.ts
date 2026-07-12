import type { Role, Status } from "@prisma/client";

export const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: "مدیر کل",
  WORKSPACE_ADMIN: "ادمین تیم",
  VIEWER: "مشاهده‌گر"
};

export const statusLabels: Record<Status, string> = {
  ACTIVE: "فعال",
  DONE: "انجام‌شده",
  SOON: "به‌زودی",
  PLANNED: "برنامه‌ریزی",
  PAUSED: "متوقف",
  REVIEW: "بازبینی"
};

export const statusClasses: Record<Status, string> = {
  ACTIVE: "border-emerald-300/40 bg-emerald-400/15 text-emerald-100",
  DONE: "border-sky-300/40 bg-sky-400/15 text-sky-100",
  SOON: "border-amber-300/40 bg-amber-400/15 text-amber-100",
  PLANNED: "border-slate-300/30 bg-slate-400/10 text-slate-100",
  PAUSED: "border-rose-300/40 bg-rose-400/15 text-rose-100",
  REVIEW: "border-violet-300/40 bg-violet-400/15 text-violet-100"
};
