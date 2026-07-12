import { describe, expect, it } from "vitest";
import { Role, Status } from "@prisma/client";
import { projectSchema, userCreateSchema, workspaceSchema } from "@/lib/validators";

describe("validators", () => {
  it("accepts clean workspace slugs", () => {
    expect(workspaceSchema.parse({ name: "دامین تست", slug: "test-domain" }).slug).toBe("test-domain");
  });

  it("rejects invalid workspace slugs", () => {
    expect(() => workspaceSchema.parse({ name: "دامین تست", slug: "Test Domain" })).toThrow();
  });

  it("requires workspace for non-super users", () => {
    expect(() =>
      userCreateSchema.parse({
        fullName: "مشاهده‌گر",
        username: "viewer",
        password: "StrongPass123",
        role: Role.VIEWER,
        workspaceId: null
      })
    ).toThrow();
  });

  it("validates project progress and span", () => {
    const parsed = projectSchema.parse({
      domainId: "clx0000000000000000000000",
      startPhaseId: "clx0000000000000000000001",
      name: "پروژه تست",
      status: Status.ACTIVE,
      progress: 42,
      span: 2
    });

    expect(parsed.progress).toBe(42);
    expect(parsed.span).toBe(2);
  });
});
