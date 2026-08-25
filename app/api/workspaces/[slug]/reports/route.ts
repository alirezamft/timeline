import { requireWorkspaceAccess } from "@/lib/auth";
import { handleApiError, HttpError, jsonOk } from "@/lib/http";
import { getWorkspaceBySlug, getWorkspaceReport } from "@/lib/portfolio-server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ slug: string }> };
type ReportRange = "daily" | "weekly" | "monthly";

function reportWindow(range: ReportRange) {
  const to = new Date();
  const from = new Date(to);
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (range === "daily" ? 1 : range === "weekly" ? 7 : 30));
  return { from, to };
}

function markdownReport(range: ReportRange, data: Awaited<ReturnType<typeof getWorkspaceReport>>, doneTitles: string[]) {
  const lines = [
    `## گزارش ${range === "daily" ? "روزانه" : range === "weekly" ? "هفتگی" : "ماهانه"} Trade Portfolio`,
    "",
    `- پیشرفت فعلی: ${data.current.progress}٪`,
    `- تغییر پیشرفت: ${data.report.progressDelta >= 0 ? "+" : ""}${data.report.progressDelta}٪`,
    `- Velocity: ${data.report.velocity}`,
    `- Scope اضافه‌شده: ${data.report.scopeAdded}`,
    `- Scope حذف‌شده: ${data.report.scopeRemoved}`,
    `- بلاکر ایجادشده / رفع‌شده: ${data.report.blockersCreated} / ${data.report.blockersResolved}`,
    `- QA Rework Rate: ${data.report.qaReworkRate}٪`,
    `- Plan vs Actual: ${data.report.plannedVsActual >= 0 ? "+" : ""}${data.report.plannedVsActual}٪`,
    "",
    "### انجام‌شده در این دوره",
    ...(doneTitles.length ? doneTitles.map((title) => `- ${title}`) : ["- موردی ثبت نشده است"]),
    "",
    "### گام بعدی",
    "- ادامه کارهای باز در Jira و بررسی بلاکرهای بحرانی"
  ];
  return lines.join("\n");
}

export async function GET(request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const workspace = await getWorkspaceBySlug(slug);
    if (!workspace) throw new HttpError(404, "workspace پیدا نشد.");
    await requireWorkspaceAccess(workspace.id);
    const query = new URL(request.url).searchParams;
    const requestedRange = query.get("range");
    const range: ReportRange = requestedRange === "daily" || requestedRange === "monthly" ? requestedRange : "weekly";
    const { from, to } = reportWindow(range);
    const data = await getWorkspaceReport(workspace.id, from, to);
    const doneItems = await prisma.workItem.findMany({ where: { id: { in: data.doneThisPeriodIds } }, select: { title: true }, orderBy: { updatedAt: "desc" } });
    const markdown = markdownReport(range, data, doneItems.map((item) => item.title));
    return jsonOk({ range, from, to, ...data, markdown });
  } catch (error) {
    return handleApiError(error);
  }
}
