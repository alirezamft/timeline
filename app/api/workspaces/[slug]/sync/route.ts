import { requireWorkspaceAccess } from "@/lib/auth";
import { handleApiError, HttpError, jsonOk } from "@/lib/http";
import { FakeJiraProvider, syncWorkspaceFromJira } from "@/lib/jira";
import { getWorkspaceBySlug } from "@/lib/portfolio-server";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const workspace = await getWorkspaceBySlug(slug);
    if (!workspace) throw new HttpError(404, "workspace پیدا نشد.");
    await requireWorkspaceAccess(workspace.id);
    const latest = await prisma.syncRun.findFirst({ where: { workspaceId: workspace.id }, orderBy: { startedAt: "desc" } });
    return jsonOk({ latest });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const workspace = await getWorkspaceBySlug(slug);
    if (!workspace) throw new HttpError(404, "workspace پیدا نشد.");
    await requireWorkspaceAccess(workspace.id);

    // V1 deliberately wires only a fake provider. A real Jira provider can be
    // injected by the deployment without putting credentials in source code.
    const result = await syncWorkspaceFromJira({ workspaceId: workspace.id, provider: new FakeJiraProvider() });
    return jsonOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}
