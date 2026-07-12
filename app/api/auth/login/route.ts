import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, publicUser, setSessionCookie } from "@/lib/auth";
import { handleApiError, HttpError, jsonOk } from "@/lib/http";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { username: payload.username },
      include: {
        workspace: {
          select: { id: true, name: true, slug: true }
        }
      }
    });

    if (!user) {
      throw new HttpError(401, "نام کاربری یا رمز عبور اشتباه است.");
    }

    const passwordOk = await compare(payload.password, user.passwordHash);
    if (!passwordOk) {
      throw new HttpError(401, "نام کاربری یا رمز عبور اشتباه است.");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const session = await createSession(user.id);
    await setSessionCookie(session.token, session.expiresAt);

    return jsonOk({ user: publicUser(user) });
  } catch (error) {
    return handleApiError(error);
  }
}
