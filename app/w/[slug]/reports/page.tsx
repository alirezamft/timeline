import { notFound, redirect } from "next/navigation";
import { canAccessWorkspace, getAuthContext } from "@/lib/auth";
import { getWorkspaceBySlug, getWorkspaceReport } from "@/lib/portfolio-server";
import { PortfolioReports } from "@/components/portfolio-surface";

type PageProps = { params: Promise<{ slug: string }> };

function markdown(data: Awaited<ReturnType<typeof getWorkspaceReport>>) {
  return [
    "## گزارش هفتگی Trade Portfolio", "",
    `- پیشرفت فعلی: ${data.current.progress}٪`,
    `- تغییر پیشرفت: ${data.report.progressDelta >= 0 ? "+" : ""}${data.report.progressDelta}٪`,
    `- Done this period: ${data.report.doneThisPeriod}`,
    `- Scope Added: ${data.report.scopeAdded}`,
    `- Blockers created / resolved: ${data.report.blockersCreated} / ${data.report.blockersResolved}`,
    `- QA Rework Rate: ${data.report.qaReworkRate}٪`,
    `- Planned vs Actual: ${data.report.plannedVsActual >= 0 ? "+" : ""}${data.report.plannedVsActual}٪`
  ].join("\n");
}

export default async function ReportsPage({ params }: PageProps) {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  if (auth.user.mustChangePassword) redirect("/change-password");
  const { slug } = await params;
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace) notFound();
  if (!canAccessWorkspace(auth.user, workspace.id)) redirect("/");
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 7);
  const report = await getWorkspaceReport(workspace.id, from, now);
  return <PortfolioReports slug={slug} initial={JSON.parse(JSON.stringify({ ...report, markdown: markdown(report) }))} />;
}
