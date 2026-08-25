import { requireWorkspaceManager } from "@/lib/auth";
import { handleApiError, HttpError, jsonOk } from "@/lib/http";
import { createProgressSnapshots, getWorkspaceBySlug } from "@/lib/portfolio-server";
import { prisma } from "@/lib/prisma";
import { workItemSchema } from "@/lib/validators";

type Context = { params: Promise<{ slug: string }> };

async function assertWorkspaceLinks(workspaceId: string, payload: { productId?: string | null; initiativeId?: string | null; parentId?: string | null }) {
  if (payload.productId) {
    const product = await prisma.product.findFirst({ where: { id: payload.productId, workspaceId } });
    if (!product) throw new HttpError(422, "محصول انتخاب‌شده متعلق به این workspace نیست.");
  }
  if (payload.initiativeId) {
    const initiative = await prisma.initiative.findFirst({ where: { id: payload.initiativeId, workspaceId } });
    if (!initiative) throw new HttpError(422, "پروژه انتخاب‌شده متعلق به این workspace نیست.");
  }
  if (payload.parentId) {
    const parent = await prisma.workItem.findFirst({ where: { id: payload.parentId, workspaceId } });
    if (!parent) throw new HttpError(422, "والد انتخاب‌شده متعلق به این workspace نیست.");
  }
}

export async function GET(_request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const workspace = await getWorkspaceBySlug(slug);
    if (!workspace) throw new HttpError(404, "workspace پیدا نشد.");
    await requireWorkspaceManager(workspace.id);
    const workItems = await prisma.workItem.findMany({ where: { workspaceId: workspace.id }, orderBy: { createdAt: "asc" } });
    return jsonOk({ workItems });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const workspace = await getWorkspaceBySlug(slug);
    if (!workspace) throw new HttpError(404, "workspace پیدا نشد.");
    const auth = await requireWorkspaceManager(workspace.id);
    const payload = workItemSchema.parse(await request.json());
    await assertWorkspaceLinks(workspace.id, payload);

    const workItem = await prisma.$transaction(async (tx) => {
      const created = await tx.workItem.create({
        data: {
          ...payload,
          workspaceId: workspace.id,
          completedAt: payload.status === "DONE" ? new Date() : null
        }
      });
      await tx.statusHistory.create({
        data: {
          workspaceId: workspace.id,
          workItemId: created.id,
          toStatus: created.status,
          changedById: auth.user.id
        }
      });
      return created;
    });
    await createProgressSnapshots(workspace.id);
    return jsonOk({ workItem }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
