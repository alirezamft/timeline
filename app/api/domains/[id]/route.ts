import { requireWorkspaceManager } from "@/lib/auth";
import { handleApiError, HttpError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { domainSchema } from "@/lib/validators";

type Context = {
  params: Promise<{ id: string }>;
};

async function getDomain(id: string) {
  const domain = await prisma.domain.findUnique({ where: { id } });
  if (!domain) throw new HttpError(404, "دامین پیدا نشد.");
  return domain;
}

export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const current = await getDomain(id);
    await requireWorkspaceManager(current.workspaceId);
    const payload = domainSchema.parse(await request.json());
    const domain = await prisma.domain.update({
      where: { id },
      data: payload
    });
    return jsonOk({ domain });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const domain = await getDomain(id);
    await requireWorkspaceManager(domain.workspaceId);
    await prisma.domain.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
