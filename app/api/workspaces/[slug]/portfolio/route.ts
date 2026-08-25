import { requireWorkspaceAccess } from "@/lib/auth";
import { handleApiError, HttpError, jsonOk } from "@/lib/http";
import { getPortfolioOverview, getWorkspaceBySlug } from "@/lib/portfolio-server";

type Context = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const workspace = await getWorkspaceBySlug(slug);
    if (!workspace) throw new HttpError(404, "workspace پیدا نشد.");
    await requireWorkspaceAccess(workspace.id);
    const overview = await getPortfolioOverview(workspace.id);
    return jsonOk({ overview });
  } catch (error) {
    return handleApiError(error);
  }
}
