import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getAuthContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminWorkspaces } from "@/components/admin-workspaces";

export default async function AdminWorkspacesPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  if (auth.user.mustChangePassword) redirect("/change-password");
  if (auth.user.role !== Role.SUPER_ADMIN) redirect("/");

  const workspaces = await prisma.workspace.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { users: true, projects: true } } }
  });

  return <AdminWorkspaces initialWorkspaces={JSON.parse(JSON.stringify(workspaces))} user={auth.user} />;
}
