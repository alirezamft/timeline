import { notFound, redirect } from "next/navigation";
import { canAccessWorkspace, getAuthContext } from "@/lib/auth";
import { getPortfolioOverview } from "@/lib/portfolio-server";
import { PortfolioOverview } from "@/components/portfolio-surface";

type PageProps = { params: Promise<{ slug: string }> };

export default async function PortfolioPage({ params }: PageProps) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  if (auth.user.mustChangePassword) redirect("/change-password");
  const { slug } = await params;
  const data = await getPortfolioOverviewBySlug(slug);
  if (!data) notFound();
  if (!canAccessWorkspace(auth.user, data.workspace.id)) redirect("/");
  return <PortfolioOverview data={JSON.parse(JSON.stringify(data))} />;
}

async function getPortfolioOverviewBySlug(slug: string) {
  const { getWorkspaceBySlug } = await import("@/lib/portfolio-server");
  const workspace = await getWorkspaceBySlug(slug);
  return workspace ? getPortfolioOverview(workspace.id) : null;
}
