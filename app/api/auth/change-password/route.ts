import { compare, hash } from "bcryptjs";
import { requireAuth } from "@/lib/auth";
import { handleApiError, HttpError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    const payload = changePasswordSchema.parse(await request.json());
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: auth.user.id }
    });

    const currentOk = await compare(payload.currentPassword, user.passwordHash);
    if (!currentOk) {
      throw new HttpError(401, "رمز فعلی اشتباه است.");
    }

    const samePassword = await compare(payload.newPassword, user.passwordHash);
    if (samePassword) {
      throw new HttpError(422, "رمز جدید باید با رمز فعلی متفاوت باشد.");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hash(payload.newPassword, 12),
        mustChangePassword: false
      }
    });

    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
