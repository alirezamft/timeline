import { DeliveryHealth, ScopeState, WorkItemType } from "@prisma/client";
import { mapJiraStatus } from "@/lib/trade-portfolio";
import { prisma } from "@/lib/prisma";

export type JiraIssue = {
  id: string;
  key: string;
  self?: string;
  updated: string;
  fields: {
    summary: string;
    description?: string | null;
    issuetype?: { name?: string | null } | null;
    status?: { name?: string | null } | null;
    assignee?: { accountId?: string | null; displayName?: string | null } | null;
    parent?: { id?: string | null; key?: string | null } | null;
    duedate?: string | null;
    [key: string]: unknown;
  };
};

export type JiraPage = { issues: JiraIssue[]; nextCursor?: string; updatedAt?: string };

export interface JiraProvider {
  readonly name: string;
  listIssuesSince(updatedSince?: Date): Promise<JiraPage>;
}

export class FakeJiraProvider implements JiraProvider {
  readonly name = "fake-jira";

  constructor(private readonly issues: JiraIssue[] = []) {}

  async listIssuesSince(updatedSince?: Date) {
    const issues = this.issues.filter((issue) => !updatedSince || new Date(issue.updated) > updatedSince);
    const updatedAt = issues.reduce<string | undefined>((latest, issue) => (!latest || issue.updated > latest ? issue.updated : latest), undefined);
    return { issues, updatedAt };
  }
}

export type JiraFieldMapping = {
  productField: string;
  initiativeField: string;
  healthField: string;
  teamField: string;
  scopeStateField: string;
  storyPointsField: string;
  originalEstimateField: string;
};

export const defaultJiraFieldMapping: JiraFieldMapping = {
  productField: "customfield_trade_product",
  initiativeField: "customfield_trade_initiative",
  healthField: "customfield_delivery_health",
  teamField: "customfield_team",
  scopeStateField: "customfield_scope_state",
  storyPointsField: "story points",
  originalEstimateField: "timeoriginalestimate"
};

export type NormalizedJiraWorkItem = {
  jiraIssueId: string;
  jiraIssueKey: string;
  jiraUrl: string | null;
  title: string;
  description: string | null;
  type: WorkItemType;
  status: ReturnType<typeof mapJiraStatus>;
  health: DeliveryHealth;
  scopeState: ScopeState;
  parentJiraIssueId: string | null;
  productRef: string | null;
  initiativeRef: string | null;
  ownerRef: string | null;
  team: string | null;
  dueDate: Date | null;
  storyPoints: number | null;
  originalEstimate: number | null;
  updatedAt: Date;
};

function issueType(name?: string | null): WorkItemType {
  const normalized = name?.toLowerCase().replace(/[-_]/g, " ").trim();
  if (normalized === "epic") return WorkItemType.EPIC;
  if (normalized === "story" || normalized === "user story") return WorkItemType.STORY;
  if (normalized === "sub-task" || normalized === "sub task") return WorkItemType.SUBTASK;
  if (normalized === "bug") return WorkItemType.BUG;
  if (normalized === "milestone") return WorkItemType.MILESTONE;
  return WorkItemType.TASK;
}

function enumHealth(value: unknown): DeliveryHealth {
  const normalized = String(value ?? "").toUpperCase().replace(/\s+/g, "_");
  return normalized === "AT_RISK" || normalized === "OFF_TRACK" ? normalized as DeliveryHealth : DeliveryHealth.ON_TRACK;
}

function enumScope(value: unknown): ScopeState {
  const normalized = String(value ?? "").toUpperCase().replace(/\s+/g, "_");
  if (normalized === "CANDIDATE" || normalized === "CANCELED" || normalized === "OUT_OF_SCOPE") return normalized as ScopeState;
  return ScopeState.COMMITTED;
}

function numericValue(value: unknown) {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function mapJiraIssue(issue: JiraIssue, mapping: JiraFieldMapping = defaultJiraFieldMapping): NormalizedJiraWorkItem {
  const fields = issue.fields;
  return {
    jiraIssueId: issue.id,
    jiraIssueKey: issue.key,
    jiraUrl: issue.self ?? null,
    title: fields.summary,
    description: fields.description ?? null,
    type: issueType(fields.issuetype?.name),
    status: mapJiraStatus(fields.status?.name ?? "Backlog"),
    health: enumHealth(fields[mapping.healthField]),
    scopeState: enumScope(fields[mapping.scopeStateField]),
    parentJiraIssueId: fields.parent?.id ?? null,
    productRef: typeof fields[mapping.productField] === "string" ? fields[mapping.productField] as string : null,
    initiativeRef: typeof fields[mapping.initiativeField] === "string" ? fields[mapping.initiativeField] as string : null,
    ownerRef: fields.assignee?.accountId ?? fields.assignee?.displayName ?? null,
    team: typeof fields[mapping.teamField] === "string" ? fields[mapping.teamField] as string : null,
    dueDate: fields.duedate ? new Date(fields.duedate) : null,
    storyPoints: numericValue(fields[mapping.storyPointsField]),
    originalEstimate: numericValue(fields[mapping.originalEstimateField]),
    updatedAt: new Date(issue.updated)
  };
}

export async function syncWorkspaceFromJira(options: {
  workspaceId: string;
  provider: JiraProvider;
  mapping?: JiraFieldMapping;
}) {
  const { workspaceId, provider, mapping = defaultJiraFieldMapping } = options;
  const previousRun = await prisma.syncRun.findFirst({ where: { workspaceId, provider: provider.name, status: { in: ["SUCCEEDED", "PARTIAL"] } }, orderBy: { startedAt: "desc" } });
  const run = await prisma.syncRun.create({ data: { workspaceId, provider: provider.name, status: "RUNNING", cursor: previousRun?.cursor ?? null } });

  try {
    const page = await provider.listIssuesSince(previousRun?.cursor ?? undefined);
    const normalized = page.issues.map((issue) => mapJiraIssue(issue, mapping));
    const ids = new Map<string, string>();
    let recordsUpserted = 0;

    for (const item of normalized) {
      const product = item.productRef
        ? await prisma.product.findFirst({ where: { workspaceId, OR: [{ id: item.productRef }, { slug: item.productRef }, { name: item.productRef }] }, select: { id: true } })
        : null;
      const initiative = item.initiativeRef
        ? await prisma.initiative.findFirst({ where: { workspaceId, OR: [{ id: item.initiativeRef }, { name: item.initiativeRef }], ...(product ? { productId: product.id } : {}) }, select: { id: true } })
        : null;
      const existing = await prisma.workItem.findFirst({ where: { workspaceId, jiraIssueId: item.jiraIssueId }, select: { id: true, status: true } });
      const workItem = existing
        ? await prisma.workItem.update({
            where: { id: existing.id },
            data: {
              productId: product?.id ?? null,
              initiativeId: initiative?.id ?? null,
              type: item.type,
              title: item.title,
              description: item.description,
              status: item.status,
              health: item.health,
              scopeState: item.scopeState,
              team: item.team,
              dueDate: item.dueDate,
              storyPoints: item.storyPoints,
              originalEstimate: item.originalEstimate,
              jiraIssueKey: item.jiraIssueKey,
              jiraUrl: item.jiraUrl,
              completedAt: item.status === "DONE" ? existing.status === "DONE" ? undefined : new Date() : null
            }
          })
        : await prisma.workItem.create({
            data: {
              workspaceId,
              productId: product?.id ?? null,
              initiativeId: initiative?.id ?? null,
              type: item.type,
              title: item.title,
              description: item.description,
              status: item.status,
              health: item.health,
              scopeState: item.scopeState,
              team: item.team,
              dueDate: item.dueDate,
              storyPoints: item.storyPoints,
              originalEstimate: item.originalEstimate,
              jiraIssueId: item.jiraIssueId,
              jiraIssueKey: item.jiraIssueKey,
              jiraUrl: item.jiraUrl,
              completedAt: item.status === "DONE" ? new Date() : null
            }
          });
      ids.set(item.jiraIssueId, workItem.id);
      recordsUpserted += 1;

      if (existing && existing.status !== item.status) {
        await prisma.statusHistory.create({ data: { workspaceId, workItemId: workItem.id, fromStatus: existing.status, toStatus: item.status, note: "Jira read-only sync" } });
      }
    }

    for (const item of normalized) {
      if (item.parentJiraIssueId && ids.has(item.jiraIssueId) && ids.has(item.parentJiraIssueId)) {
        await prisma.workItem.update({ where: { id: ids.get(item.jiraIssueId) }, data: { parentId: ids.get(item.parentJiraIssueId) } });
      }
    }

    const cursor = page.updatedAt ? new Date(page.updatedAt) : previousRun?.cursor ?? new Date();
    const reconciliation = { sourceIssueCount: normalized.length, upserted: recordsUpserted, unresolvedParentCount: normalized.filter((item) => item.parentJiraIssueId && !ids.has(item.parentJiraIssueId)).length };
    const finished = await prisma.syncRun.update({ where: { id: run.id }, data: { status: "SUCCEEDED", finishedAt: new Date(), cursor, recordsRead: normalized.length, recordsUpserted, reconciliation } });
    return { run: finished, reconciliation };
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطای ناشناخته در Jira sync";
    const failed = await prisma.syncRun.update({ where: { id: run.id }, data: { status: "FAILED", finishedAt: new Date(), error: message } });
    return { run: failed, reconciliation: { error: message } };
  }
}
