import { requireWorkspaceAccess } from "@/lib/auth";
import { handleApiError, HttpError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const workspace = await prisma.workspace.findUnique({
      where: { slug },
      include: {
        phases: { orderBy: { order: "asc" } },
        domains: { orderBy: { order: "asc" } },
        projects: {
          orderBy: [{ domain: { order: "asc" } }, { startPhase: { order: "asc" } }, { createdAt: "asc" }],
          include: {
            domain: {
              select: { id: true, name: true, color: true, order: true }
            },
            startPhase: {
              select: { id: true, label: true, order: true }
            }
          }
        }
      }
    });

    if (!workspace) {
      throw new HttpError(404, "workspace پیدا نشد.");
    }

    await requireWorkspaceAccess(workspace.id);
    return jsonOk({ workspace });
  } catch (error) {
    return handleApiError(error);
  }
}
