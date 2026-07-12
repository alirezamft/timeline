import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getAuthContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminUsers } from "@/components/admin-users";

export default async function AdminUsersPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  if (auth.user.mustChangePassword) redirect("/change-password");
  if (auth.user.role !== Role.SUPER_ADMIN) redirect("/");

  const [users, workspaces] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        workspaceId: true,
        mustChangePassword: true,
        createdAt: true,
        lastLogin: true,
        workspace: { select: { id: true, name: true, slug: true } }
      }
    }),
    prisma.workspace.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, slug: true }
    })
  ]);

  return (
    <AdminUsers
      initialUsers={JSON.parse(JSON.stringify(users))}
      workspaces={JSON.parse(JSON.stringify(workspaces))}
      currentUserId={auth.user.id}
    />
  );
}
