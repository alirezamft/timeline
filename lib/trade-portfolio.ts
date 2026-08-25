export const LEAF_WORK_ITEM_TYPES = ["TASK", "SUBTASK", "BUG"] as const;

export type LeafWorkItemType = (typeof LEAF_WORK_ITEM_TYPES)[number];
export type WorkItemType = "EPIC" | "STORY" | "TASK" | "SUBTASK" | "BUG" | "MILESTONE";
export type WorkflowStatus =
  | "BACKLOG"
  | "READY_FOR_DEVELOPMENT"
  | "IN_PROGRESS"
  | "CODE_REVIEW"
  | "READY_FOR_QA"
  | "IN_QA"
  | "REWORK"
  | "READY_FOR_RELEASE"
  | "DONE"
  | "BLOCKED"
  | "PAUSED"
  | "CANCELED"
  | "OUT_OF_SCOPE";
export type ScopeState = "COMMITTED" | "CANDIDATE" | "CANCELED" | "OUT_OF_SCOPE";

export type RollupWorkItem = {
  id: string;
  parentId: string | null;
  productId?: string | null;
  initiativeId?: string | null;
  type: WorkItemType;
  status: WorkflowStatus;
  scopeState?: ScopeState | null;
  storyPoints?: number | null;
};

export type RollupScope = {
  productId?: string;
  initiativeId?: string;
};

export type ProgressRollup = {
  totalScope: number;
  doneScope: number;
  activeScope: number;
  blockedScope: number;
  progress: number;
};

function isCanceled(item: RollupWorkItem) {
  return item.status === "CANCELED" || item.status === "OUT_OF_SCOPE" || item.scopeState === "CANCELED" || item.scopeState === "OUT_OF_SCOPE";
}

function matchesScope(item: RollupWorkItem, scope?: RollupScope) {
  if (scope?.initiativeId && item.initiativeId !== scope.initiativeId) return false;
  if (scope?.productId && item.productId !== scope.productId) return false;
  return true;
}

export function isLeafWorkItem(item: RollupWorkItem, items: RollupWorkItem[]) {
  if (!LEAF_WORK_ITEM_TYPES.includes(item.type as LeafWorkItemType)) return false;
  return !items.some((candidate) => candidate.parentId === item.id);
}

export function eligibleLeafWorkItems(items: RollupWorkItem[], scope?: RollupScope) {
  return items.filter((item) => matchesScope(item, scope) && !isCanceled(item) && isLeafWorkItem(item, items));
}

export function rollupProgress(items: RollupWorkItem[], scope?: RollupScope): ProgressRollup {
  const leaves = eligibleLeafWorkItems(items, scope);
  const doneScope = leaves.filter((item) => item.status === "DONE").length;
  const blockedScope = leaves.filter((item) => item.status === "BLOCKED").length;
  const activeScope = leaves.filter((item) => !["DONE", "BLOCKED", "BACKLOG", "READY_FOR_DEVELOPMENT"].includes(item.status)).length;
  const totalScope = leaves.length;

  return {
    totalScope,
    doneScope,
    activeScope,
    blockedScope,
    progress: totalScope ? Math.round((doneScope / totalScope) * 100) : 0
  };
}

export function scopeChange(currentTotal: number, previousTotal: number) {
  const delta = currentTotal - previousTotal;
  return {
    added: Math.max(0, delta),
    removed: Math.max(0, -delta),
    delta
  };
}

const statusAliases: Record<string, WorkflowStatus> = {
  BACKLOG: "BACKLOG",
  TODO: "BACKLOG",
  "TO DO": "BACKLOG",
  READY: "READY_FOR_DEVELOPMENT",
  "READY FOR DEVELOPMENT": "READY_FOR_DEVELOPMENT",
  IN_PROGRESS: "IN_PROGRESS",
  "IN PROGRESS": "IN_PROGRESS",
  "CODE REVIEW": "CODE_REVIEW",
  CODE_REVIEW: "CODE_REVIEW",
  "READY FOR QA": "READY_FOR_QA",
  READY_FOR_QA: "READY_FOR_QA",
  "IN QA": "IN_QA",
  IN_QA: "IN_QA",
  REWORK: "REWORK",
  "READY FOR RELEASE": "READY_FOR_RELEASE",
  READY_FOR_RELEASE: "READY_FOR_RELEASE",
  DONE: "DONE",
  BLOCKED: "BLOCKED",
  PAUSED: "PAUSED",
  CANCELED: "CANCELED",
  CANCELLED: "CANCELED",
  "OUT OF SCOPE": "OUT_OF_SCOPE",
  OUT_OF_SCOPE: "OUT_OF_SCOPE"
};

export function mapJiraStatus(status: string): WorkflowStatus {
  const normalized = status.trim().toUpperCase().replace(/\s+/g, " ");
  return statusAliases[normalized] ?? "BACKLOG";
}

export function isDelivered(status: WorkflowStatus) {
  return status === "DONE";
}

export type PeriodReport = {
  doneThisPeriod: number;
  nextPeriod: number;
  progressDelta: number;
  scopeAdded: number;
  scopeRemoved: number;
  blockersCreated: number;
  blockersResolved: number;
  velocity: number;
  qaReworkRate: number;
  plannedVsActual: number;
};

export function buildPeriodReport(input: {
  current: ProgressRollup;
  previous?: ProgressRollup;
  scopeAdded?: number;
  scopeRemoved?: number;
  doneThisPeriod?: number;
  nextPeriod?: number;
  blockersCreated?: number;
  blockersResolved?: number;
  reworkCount?: number;
  plannedProgress?: number;
}) : PeriodReport {
  const previousProgress = input.previous?.progress ?? 0;
  const velocity = input.doneThisPeriod ?? input.current.doneScope - (input.previous?.doneScope ?? 0);
  const reworkRate = velocity + (input.reworkCount ?? 0) > 0
    ? Math.round(((input.reworkCount ?? 0) / (velocity + (input.reworkCount ?? 0))) * 100)
    : 0;

  return {
    doneThisPeriod: velocity,
    nextPeriod: input.nextPeriod ?? 0,
    progressDelta: input.current.progress - previousProgress,
    scopeAdded: input.scopeAdded ?? 0,
    scopeRemoved: input.scopeRemoved ?? 0,
    blockersCreated: input.blockersCreated ?? 0,
    blockersResolved: input.blockersResolved ?? 0,
    velocity,
    qaReworkRate: reworkRate,
    plannedVsActual: input.plannedProgress == null ? 0 : input.current.progress - input.plannedProgress
  };
}
