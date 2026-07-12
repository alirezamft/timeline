import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { handleApiError, HttpError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { userCreateSchema } from "@/lib/validators";

export async function GET() {
  try {
    await requireRole([Role.SUPER_ADMIN]);
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
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

    return jsonOk({ users });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole([Role.SUPER_ADMIN]);
    const payload = userCreateSchema.parse(await request.json());
    const workspaceId = payload.role === Role.SUPER_ADMIN ? null : payload.workspaceId ?? null;

    if (workspaceId) {
      const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
      if (!workspace) throw new HttpError(422, "workspace انتخاب‌شده معتبر نیست.");
    }

    const user = await prisma.user.create({
      data: {
        username: payload.username,
        fullName: payload.fullName,
        role: payload.role,
        workspaceId,
        passwordHash: await hash(payload.password, 12),
        mustChangePassword: payload.mustChangePassword ?? true
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

    return jsonOk({ user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
