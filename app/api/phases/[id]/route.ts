import { requireWorkspaceManager } from "@/lib/auth";
import { handleApiError, HttpError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { phaseSchema } from "@/lib/validators";

type Context = {
  params: Promise<{ id: string }>;
};

async function getPhase(id: string) {
  const phase = await prisma.phase.findUnique({ where: { id } });
  if (!phase) throw new HttpError(404, "فاز پیدا نشد.");
  return phase;
}

export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const current = await getPhase(id);
    await requireWorkspaceManager(current.workspaceId);
    const payload = phaseSchema.parse(await request.json());
    const phase = await prisma.phase.update({
      where: { id },
      data: {
        ...payload,
        subtitle: payload.subtitle || null,
        goal: payload.goal || null
      }
    });
    return jsonOk({ phase });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const phase = await getPhase(id);
    await requireWorkspaceManager(phase.workspaceId);
    await prisma.phase.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
