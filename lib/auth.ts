import { randomBytes, createHash } from "crypto";
import { cookies } from "next/headers";
import type { Role, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/http";

export const SESSION_COOKIE = "roadmap_session";
const SESSION_DAYS = 30;

type AuthUser = Pick<
  User,
  "id" | "username" | "fullName" | "role" | "workspaceId" | "mustChangePassword"
> & {
  workspace: { id: string; name: string; slug: string } | null;
};

export type AuthContext = {
  user: AuthUser;
  tokenHash: string;
};

function secret() {
  return process.env.SESSION_SECRET ?? "development-session-secret-change-me";
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(`${token}.${secret()}`).digest("hex");
}

export function sessionExpiresAt() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  return expiresAt;
}

export async function createSession(userId: string) {
  const token = randomBytes(48).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = sessionExpiresAt();

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt
    }
  });

  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          workspaceId: true,
          mustChangePassword: true,
          workspace: {
            select: { id: true, name: true, slug: true }
          }
        }
      }
    }
  });

  if (!session || session.expiresAt <= new Date()) {
    await prisma.session.deleteMany({ where: { tokenHash } });
    return null;
  }

  await prisma.session.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() }
  });

  return {
    tokenHash,
    user: session.user
  };
}

export async function requireAuth() {
  const auth = await getAuthContext();
  if (!auth) {
    throw new HttpError(401, "برای دسترسی ابتدا وارد شوید.");
  }
  return auth;
}

export async function requireRole(roles: Role[]) {
  const auth = await requireAuth();
  if (!roles.includes(auth.user.role)) {
    throw new HttpError(403, "شما مجوز انجام این عملیات را ندارید.");
  }
  return auth;
}

export function canAccessWorkspace(user: AuthUser, workspaceId: string) {
  return user.role === "SUPER_ADMIN" || user.workspaceId === workspaceId;
}

export function canManageWorkspace(user: AuthUser, workspaceId: string) {
  return (
    user.role === "SUPER_ADMIN" ||
    (user.role === "WORKSPACE_ADMIN" && user.workspaceId === workspaceId)
  );
}

export async function requireWorkspaceAccess(workspaceId: string) {
  const auth = await requireAuth();
  if (!canAccessWorkspace(auth.user, workspaceId)) {
    throw new HttpError(403, "به این workspace دسترسی ندارید.");
  }
  return auth;
}

export async function requireWorkspaceManager(workspaceId: string) {
  const auth = await requireAuth();
  if (!canManageWorkspace(auth.user, workspaceId)) {
    throw new HttpError(403, "برای ویرایش این workspace مجوز ندارید.");
  }
  return auth;
}

export function publicUser(user: AuthUser) {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    workspaceId: user.workspaceId,
    workspace: user.workspace ?? null,
    mustChangePassword: user.mustChangePassword
  };
}
