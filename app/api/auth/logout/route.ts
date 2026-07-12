import { clearSessionCookie, getAuthContext } from "@/lib/auth";
import { handleApiError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const auth = await getAuthContext();
    if (auth) {
      await prisma.session.deleteMany({ where: { tokenHash: auth.tokenHash } });
    }
    await clearSessionCookie();
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
