import { Role } from "@prisma/client";
import { requireAuth, requireRole } from "@/lib/auth";
import { handleApiError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { workspaceSchema } from "@/lib/validators";

export async function GET() {
  try {
    const auth = await requireAuth();
    const workspaces = await prisma.workspace.findMany({
      where:
        auth.user.role === Role.SUPER_ADMIN
          ? undefined
          : { id: auth.user.workspaceId ?? "__none__" },
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: { users: true, projects: true }
        }
      }
    });

    return jsonOk({
      workspaces: workspaces.map((workspace) => ({
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        createdAt: workspace.createdAt,
        usersCount: workspace._count.users,
        projectsCount: workspace._count.projects
      }))
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole([Role.SUPER_ADMIN]);
    const payload = workspaceSchema.parse(await request.json());
    const workspace = await prisma.workspace.create({
      data: payload
    });

    return jsonOk({ workspace }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
