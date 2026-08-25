import { notFound, redirect } from "next/navigation";
import { canAccessWorkspace, getAuthContext } from "@/lib/auth";
import { getPortfolioOverview, getWorkspaceBySlug } from "@/lib/portfolio-server";
import { TeamExecution } from "@/components/portfolio-surface";

type PageProps = { params: Promise<{ slug: string }> };

export default async function TeamPage({ params }: PageProps) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  if (auth.user.mustChangePassword) redirect("/change-password");
  const { slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();
  if (!canAccessWorkspace(auth.user, workspace.id)) redirect("/");
  const data = await getPortfolioOverview(workspace.id);
  if (!data) notFound();
  return <TeamExecution data={JSON.parse(JSON.stringify(data))} />;
}
