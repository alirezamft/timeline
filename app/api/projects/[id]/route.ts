import { requireWorkspaceManager } from "@/lib/auth";
import { handleApiError, HttpError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validators";

type Context = {
  params: Promise<{ id: string }>;
};

async function getProject(id: string) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw new HttpError(404, "پروژه پیدا نشد.");
  }
  return project;
}

async function assertProjectLinks(workspaceId: string, domainId: string, phaseId: string) {
  const [domain, phase] = await Promise.all([
    prisma.domain.findFirst({ where: { id: domainId, workspaceId } }),
    prisma.phase.findFirst({ where: { id: phaseId, workspaceId } })
  ]);

  if (!domain) throw new HttpError(422, "دامین انتخاب‌شده برای این workspace نیست.");
  if (!phase) throw new HttpError(422, "فاز انتخاب‌شده برای این workspace نیست.");
}

export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const current = await getProject(id);
    await requireWorkspaceManager(current.workspaceId);

    const payload = projectSchema.parse(await request.json());
    await assertProjectLinks(current.workspaceId, payload.domainId, payload.startPhaseId);

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...payload,
        tag: payload.tag || null,
        note: payload.note || null
      },
      include: {
        domain: { select: { id: true, name: true, color: true, order: true } },
        startPhase: { select: { id: true, label: true, order: true } }
      }
    });

    return jsonOk({ project });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const project = await getProject(id);
    await requireWorkspaceManager(project.workspaceId);
    await prisma.project.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
