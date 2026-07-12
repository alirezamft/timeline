import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { getAuthContext, canAccessWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoadmapClient } from "@/components/roadmap-client";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function WorkspacePage({ params }: PageProps) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  if (auth.user.mustChangePassword) redirect("/change-password");

  const { slug } = await params;
  const workspace = await prisma.workspace.findUnique({
    where: { slug },
    include: {
      phases: { orderBy: { order: "asc" } },
      domains: { orderBy: { order: "asc" } },
      projects: {
        orderBy: [{ domain: { order: "asc" } }, { startPhase: { order: "asc" } }, { createdAt: "asc" }],
        include: {
          domain: { select: { id: true, name: true, color: true, order: true } },
          startPhase: { select: { id: true, label: true, order: true } }
        }
      }
    }
  });

  if (!workspace) notFound();
  if (!canAccessWorkspace(auth.user, workspace.id)) redirect("/");

  return (
    <RoadmapClient
      initialWorkspace={JSON.parse(JSON.stringify(workspace))}
      user={JSON.parse(JSON.stringify(auth.user))}
    />
  );
}
