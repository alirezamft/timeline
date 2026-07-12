import { publicUser, requireAuth } from "@/lib/auth";
import { handleApiError, jsonOk } from "@/lib/http";

export async function GET() {
  try {
    const auth = await requireAuth();
    return jsonOk({ user: publicUser(auth.user) });
  } catch (error) {
    return handleApiError(error);
  }
}
