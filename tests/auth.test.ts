import { describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { canAccessWorkspace, canManageWorkspace, hashSessionToken } from "@/lib/auth";

const baseUser = {
  id: "u1",
  username: "user",
  fullName: "User",
  mustChangePassword: false,
  workspace: null
};

describe("authorization helpers", () => {
  it("allows super admin to access and manage every workspace", () => {
    const user = { ...baseUser, role: Role.SUPER_ADMIN, workspaceId: null };
    expect(canAccessWorkspace(user, "workspace-a")).toBe(true);
    expect(canManageWorkspace(user, "workspace-a")).toBe(true);
  });

  it("keeps workspace admins inside their own workspace", () => {
    const user = { ...baseUser, role: Role.WORKSPACE_ADMIN, workspaceId: "workspace-a" };
    expect(canAccessWorkspace(user, "workspace-a")).toBe(true);
    expect(canManageWorkspace(user, "workspace-a")).toBe(true);
    expect(canAccessWorkspace(user, "workspace-b")).toBe(false);
    expect(canManageWorkspace(user, "workspace-b")).toBe(false);
  });

  it("allows viewers to read only their own workspace", () => {
    const user = { ...baseUser, role: Role.VIEWER, workspaceId: "workspace-a" };
    expect(canAccessWorkspace(user, "workspace-a")).toBe(true);
    expect(canManageWorkspace(user, "workspace-a")).toBe(false);
  });
});

describe("session hashing", () => {
  it("hashes tokens deterministically without storing raw tokens", () => {
    expect(hashSessionToken("token-a")).toBe(hashSessionToken("token-a"));
    expect(hashSessionToken("token-a")).not.toBe("token-a");
    expect(hashSessionToken("token-a")).not.toBe(hashSessionToken("token-b"));
  });
});
