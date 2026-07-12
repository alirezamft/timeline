import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { handleApiError, HttpError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { userUpdateSchema } from "@/lib/validators";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: Context) {
  try {
    await requireRole([Role.SUPER_ADMIN]);
    const { id } = await context.params;
    const current = await prisma.user.findUnique({ where: { id } });
    if (!current) throw new HttpError(404, "کاربر پیدا نشد.");

    const payload = userUpdateSchema.parse(await request.json());
    const nextRole = payload.role ?? current.role;
    const nextWorkspaceId =
      nextRole === Role.SUPER_ADMIN
        ? null
        : payload.workspaceId !== undefined
          ? payload.workspaceId
          : current.workspaceId;

    if (nextRole !== Role.SUPER_ADMIN && !nextWorkspaceId) {
      throw new HttpError(422, "برای این نقش باید workspace انتخاب شود.");
    }

    if (nextWorkspaceId) {
      const workspace = await prisma.workspace.findUnique({ where: { id: nextWorkspaceId } });
      if (!workspace) throw new HttpError(422, "workspace انتخاب‌شده معتبر نیست.");
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName: payload.fullName,
        role: payload.role,
        workspaceId: nextWorkspaceId,
        mustChangePassword: payload.mustChangePassword,
        ...(payload.password
          ? {
              passwordHash: await hash(payload.password, 12),
              mustChangePassword: true
            }
          : {})
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        workspaceId: true,
        mustChangePassword: true,
        createdAt: true,
        lastLogin: true,
        workspace: { select: { id: true, name: true, slug: true } }
      }
    });

    return jsonOk({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const auth = await requireRole([Role.SUPER_ADMIN]);
    const { id } = await context.params;

    if (id === auth.user.id) {
      throw new HttpError(422, "نمی‌توانید حساب خودتان را حذف کنید.");
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new HttpError(404, "کاربر پیدا نشد.");

    await prisma.$transaction([
      prisma.project.updateMany({
        where: { createdById: id },
        data: { createdById: auth.user.id }
      }),
      prisma.user.delete({ where: { id } })
    ]);

    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
