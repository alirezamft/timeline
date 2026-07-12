import { requireWorkspaceManager } from "@/lib/auth";
import { handleApiError, HttpError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validators";

type Context = {
  params: Promise<{ slug: string }>;
};

async function assertProjectLinks(workspaceId: string, domainId: string, phaseId: string) {
  const [domain, phase] = await Promise.all([
    prisma.domain.findFirst({ where: { id: domainId, workspaceId } }),
    prisma.phase.findFirst({ where: { id: phaseId, workspaceId } })
  ]);

  if (!domain) throw new HttpError(422, "دامین انتخاب‌شده برای این workspace نیست.");
  if (!phase) throw new HttpError(422, "فاز انتخاب‌شده برای این workspace نیست.");
}

export async function POST(request: Request, context: Context) {
  try {
    const { slug } = await context.params;
    const workspace = await prisma.workspace.findUnique({ where: { slug } });
    if (!workspace) throw new HttpError(404, "workspace پیدا نشد.");

    const auth = await requireWorkspaceManager(workspace.id);
    const payload = projectSchema.parse(await request.json());
    await assertProjectLinks(workspace.id, payload.domainId, payload.startPhaseId);

    const project = await prisma.project.create({
      data: {
        ...payload,
        tag: payload.tag || null,
        note: payload.note || null,
        workspaceId: workspace.id,
        createdById: auth.user.id
      },
      include: {
        domain: { select: { id: true, name: true, color: true, order: true } },
        startPhase: { select: { id: true, label: true, order: true } }
      }
    });

    return jsonOk({ project }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
