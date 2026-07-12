import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { Building2, CalendarRange, Shield, Users } from "lucide-react";
import { getAuthContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/logout-button";
import { roleLabels } from "@/lib/labels";

export default async function HomePage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  if (auth.user.mustChangePassword) redirect("/change-password");

  if (auth.user.role !== Role.SUPER_ADMIN) {
    if (!auth.user.workspace?.slug) redirect("/login");
    redirect(`/w/${auth.user.workspace.slug}`);
  }

  const workspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { users: true, projects: true }
      }
    }
  });

  return (
    <main className="min-h-screen px-5 py-6 md:px-8">
      <header className="mx-auto flex max-w-7xl flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-[#C9A84C]">داشبورد مدیریت</p>
          <h1 className="mt-2 text-2xl font-bold md:text-4xl">Workspaceهای سازمان</h1>
          <p className="mt-2 text-sm text-slate-300">
            {auth.user.fullName}، {roleLabels[auth.user.role]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/8 px-4 py-2 text-sm text-slate-100 hover:border-[#C9A84C]/50"
          >
            <Users size={17} />
            کاربران
          </Link>
          <Link
            href="/admin/workspaces"
            className="inline-flex items-center gap-2 rounded-md border border-[#C9A84C]/35 bg-[#C9A84C]/15 px-4 py-2 text-sm text-[#FFE9A4] hover:bg-[#C9A84C]/25"
          >
            <Building2 size={17} />
            Workspaceها
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section className="mx-auto mt-8 grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workspaces.map((workspace) => (
          <Link
            key={workspace.id}
            href={`/w/${workspace.slug}`}
            className="glass group rounded-lg p-5 transition hover:-translate-y-0.5 hover:border-[#C9A84C]/45"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{workspace.name}</h2>
                <p className="mt-1 text-sm text-slate-400">{workspace.slug}</p>
              </div>
              <Shield className="text-[#C9A84C]" size={22} />
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border border-white/10 bg-white/6 p-3">
                <p className="text-slate-400">پروژه‌ها</p>
                <p className="mt-1 text-2xl font-bold">{workspace._count.projects}</p>
              </div>
              <div className="rounded-md border border-white/10 bg-white/6 p-3">
                <p className="text-slate-400">کاربران</p>
                <p className="mt-1 text-2xl font-bold">{workspace._count.users}</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">
              <CalendarRange size={16} />
              <span>ورود به رودمپ</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
