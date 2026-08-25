import { notFound, redirect } from "next/navigation";
import { canAccessWorkspace, getAuthContext } from "@/lib/auth";
import { getInitiativeDetail, getPortfolioOverview, getWorkspaceBySlug } from "@/lib/portfolio-server";
import { InitiativeDetail } from "@/components/portfolio-surface";

type PageProps = { params: Promise<{ slug: string; initiativeId: string }> };

export default async function InitiativePage({ params }: PageProps) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  if (auth.user.mustChangePassword) redirect("/change-password");
  const { slug, initiativeId } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();
  if (!canAccessWorkspace(auth.user, workspace.id)) redirect("/");
  const [data, detail] = await Promise.all([getPortfolioOverview(workspace.id), getInitiativeDetail(workspace.id, initiativeId)]);
  if (!data || !detail) notFound();
  const initiative = { ...detail.initiative, progress: detail.progress };
  return <InitiativeDetail data={JSON.parse(JSON.stringify(data))} initiative={JSON.parse(JSON.stringify(initiative))} workItems={JSON.parse(JSON.stringify(detail.workItems))} blockers={JSON.parse(JSON.stringify(detail.blockers))} dependencies={JSON.parse(JSON.stringify(detail.dependencies))} />;
}
