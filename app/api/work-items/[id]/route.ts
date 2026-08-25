import { requireWorkspaceManager } from "@/lib/auth";
import { handleApiError, HttpError, jsonOk } from "@/lib/http";
import { createProgressSnapshots } from "@/lib/portfolio-server";
import { prisma } from "@/lib/prisma";
import { workItemUpdateSchema } from "@/lib/validators";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const current = await prisma.workItem.findUnique({ where: { id } });
    if (!current) throw new HttpError(404, "آیتم کاری پیدا نشد.");
    const auth = await requireWorkspaceManager(current.workspaceId);
    const payload = workItemUpdateSchema.parse(await request.json());

    if (payload.productId) {
      const product = await prisma.product.findFirst({ where: { id: payload.productId, workspaceId: current.workspaceId } });
      if (!product) throw new HttpError(422, "محصول انتخاب‌شده متعلق به این workspace نیست.");
    }
    if (payload.initiativeId) {
      const initiative = await prisma.initiative.findFirst({ where: { id: payload.initiativeId, workspaceId: current.workspaceId } });
      if (!initiative) throw new HttpError(422, "پروژه انتخاب‌شده متعلق به این workspace نیست.");
    }

    const nextStatus = payload.status ?? current.status;
    const reopened = current.status === "DONE" && nextStatus !== "DONE";
    const statusChanged = payload.status != null && payload.status !== current.status;
    const workItem = await prisma.$transaction(async (tx) => {
      const updated = await tx.workItem.update({
        where: { id },
        data: {
          ...payload,
          completedAt: nextStatus === "DONE" ? current.completedAt ?? new Date() : reopened ? null : current.completedAt,
          qaReworkCount: nextStatus === "REWORK" && current.status !== "REWORK" ? { increment: 1 } : undefined
        }
      });
      if (statusChanged) {
        await tx.statusHistory.create({
          data: {
            workspaceId: current.workspaceId,
            workItemId: id,
            fromStatus: current.status,
            toStatus: nextStatus,
            changedById: auth.user.id
          }
        });
      }
      return updated;
    });

    await createProgressSnapshots(current.workspaceId);
    return jsonOk({ workItem });
  } catch (error) {
    return handleApiError(error);
  }
}
