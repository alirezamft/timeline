import type { Domain, Phase, Project, Role, Status, Workspace } from "@prisma/client";

export type Me = {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  workspaceId: string | null;
  workspace: { id: string; name: string; slug: string } | null;
  mustChangePassword: boolean;
};

export type ProjectWithRelations = Project & {
  domain: Pick<Domain, "id" | "name" | "color" | "order">;
  startPhase: Pick<Phase, "id" | "label" | "order">;
};

export type WorkspaceRoadmap = Workspace & {
  phases: Phase[];
  domains: Domain[];
  projects: ProjectWithRelations[];
};

export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  usersCount?: number;
  projectsCount?: number;
};

export type StatusValue = Status;
