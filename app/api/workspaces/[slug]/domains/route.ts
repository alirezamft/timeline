import { requireWorkspaceManager } from "@/lib/auth";
import { handleApiError, HttpError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { domainSchema } from "@/lib/validators";

type Context = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const workspace = await prisma.workspace.findUnique({ where: { slug } });
    if (!workspace) throw new HttpError(404, "workspace پیدا نشد.");

    await requireWorkspaceManager(workspace.id);
    const payload = domainSchema.parse(await request.json());
    const domain = await prisma.domain.create({
      data: {
        ...payload,
        workspaceId: workspace.id
      }
    });

    return jsonOk({ domain }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
