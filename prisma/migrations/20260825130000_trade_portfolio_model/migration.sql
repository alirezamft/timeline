-- Trade Portfolio normalized read model.
-- The legacy Domain/Project tables intentionally remain in place during the
-- migration window. Their rows are copied into Product/Initiative below so
-- existing admin CRUD and rollback paths keep working.

CREATE TYPE "DeliveryHealth" AS ENUM ('ON_TRACK', 'AT_RISK', 'OFF_TRACK');
CREATE TYPE "WorkItemType" AS ENUM ('EPIC', 'STORY', 'TASK', 'SUBTASK', 'BUG', 'MILESTONE');
CREATE TYPE "WorkflowStatus" AS ENUM (
  'BACKLOG', 'READY_FOR_DEVELOPMENT', 'IN_PROGRESS', 'CODE_REVIEW',
  'READY_FOR_QA', 'IN_QA', 'REWORK', 'READY_FOR_RELEASE', 'DONE',
  'BLOCKED', 'PAUSED', 'CANCELED', 'OUT_OF_SCOPE'
);
CREATE TYPE "ScopeState" AS ENUM ('COMMITTED', 'CANDIDATE', 'CANCELED', 'OUT_OF_SCOPE');
CREATE TYPE "MetricDirection" AS ENUM ('HIGHER_IS_BETTER', 'LOWER_IS_BETTER');
CREATE TYPE "DependencyKind" AS ENUM ('BLOCKS', 'RELATES_TO');
CREATE TYPE "BlockerStatus" AS ENUM ('OPEN', 'RESOLVED');
CREATE TYPE "BlockerSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "SyncStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED');

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "legacyDomainId" TEXT,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "objective" TEXT,
  "northStarMetric" TEXT,
  "health" "DeliveryHealth" NOT NULL DEFAULT 'ON_TRACK',
  "ownerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Initiative" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "legacyProjectId" TEXT,
  "name" TEXT NOT NULL,
  "summary" TEXT,
  "goal" TEXT,
  "ownerId" TEXT,
  "team" TEXT,
  "plannedStart" TIMESTAMP(3),
  "plannedEnd" TIMESTAMP(3),
  "actualStart" TIMESTAMP(3),
  "actualEnd" TIMESTAMP(3),
  "status" "WorkflowStatus" NOT NULL DEFAULT 'BACKLOG',
  "health" "DeliveryHealth" NOT NULL DEFAULT 'ON_TRACK',
  "scopeBaseline" INTEGER,
  "jiraIssueKey" TEXT,
  "jiraIssueId" TEXT,
  "jiraUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Initiative_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkItem" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "productId" TEXT,
  "initiativeId" TEXT,
  "parentId" TEXT,
  "type" "WorkItemType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "WorkflowStatus" NOT NULL DEFAULT 'BACKLOG',
  "health" "DeliveryHealth" NOT NULL DEFAULT 'ON_TRACK',
  "scopeState" "ScopeState" NOT NULL DEFAULT 'COMMITTED',
  "ownerId" TEXT,
  "team" TEXT,
  "startDate" TIMESTAMP(3),
  "dueDate" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "storyPoints" DOUBLE PRECISION,
  "originalEstimate" INTEGER,
  "qaReworkCount" INTEGER NOT NULL DEFAULT 0,
  "jiraIssueKey" TEXT,
  "jiraIssueId" TEXT,
  "jiraUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WorkItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Metric" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "productId" TEXT,
  "initiativeId" TEXT,
  "name" TEXT NOT NULL,
  "unit" TEXT,
  "direction" "MetricDirection" NOT NULL DEFAULT 'HIGHER_IS_BETTER',
  "baseline" DOUBLE PRECISION,
  "target" DOUBLE PRECISION,
  "actual" DOUBLE PRECISION,
  "ownerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Metric_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MetricSnapshot" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "metricId" TEXT NOT NULL,
  "snapshotDate" DATE NOT NULL,
  "actual" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MetricSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Dependency" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "fromInitiativeId" TEXT,
  "toInitiativeId" TEXT,
  "fromWorkItemId" TEXT,
  "toWorkItemId" TEXT,
  "kind" "DependencyKind" NOT NULL DEFAULT 'BLOCKS',
  "label" TEXT NOT NULL,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Dependency_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Blocker" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "initiativeId" TEXT,
  "workItemId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "owner" TEXT,
  "severity" "BlockerSeverity" NOT NULL DEFAULT 'MEDIUM',
  "status" "BlockerStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Blocker_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StatusHistory" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "workItemId" TEXT NOT NULL,
  "fromStatus" "WorkflowStatus",
  "toStatus" "WorkflowStatus" NOT NULL,
  "changedById" TEXT,
  "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "note" TEXT,
  CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProgressSnapshot" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "productId" TEXT,
  "initiativeId" TEXT,
  "snapshotDate" DATE NOT NULL,
  "totalScope" INTEGER NOT NULL,
  "doneScope" INTEGER NOT NULL,
  "activeScope" INTEGER NOT NULL,
  "blockedScope" INTEGER NOT NULL,
  "progress" DOUBLE PRECISION NOT NULL,
  "scopeAdded" INTEGER NOT NULL DEFAULT 0,
  "scopeRemoved" INTEGER NOT NULL DEFAULT 0,
  "velocity" DOUBLE PRECISION,
  "reworkCount" INTEGER NOT NULL DEFAULT 0,
  "health" "DeliveryHealth",
  "planProgress" DOUBLE PRECISION,
  "actualProgress" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProgressSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SyncRun" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "status" "SyncStatus" NOT NULL DEFAULT 'RUNNING',
  "cursor" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  "recordsRead" INTEGER NOT NULL DEFAULT 0,
  "recordsUpserted" INTEGER NOT NULL DEFAULT 0,
  "recordsSkipped" INTEGER NOT NULL DEFAULT 0,
  "error" TEXT,
  "reconciliation" JSONB,
  CONSTRAINT "SyncRun_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Product_legacyDomainId_key" ON "Product"("legacyDomainId");
CREATE UNIQUE INDEX "Product_workspaceId_name_key" ON "Product"("workspaceId", "name");
CREATE UNIQUE INDEX "Product_workspaceId_slug_key" ON "Product"("workspaceId", "slug");
CREATE INDEX "Product_workspaceId_order_idx" ON "Product"("workspaceId", "order");
CREATE UNIQUE INDEX "Initiative_legacyProjectId_key" ON "Initiative"("legacyProjectId");
CREATE INDEX "Initiative_workspaceId_productId_idx" ON "Initiative"("workspaceId", "productId");
CREATE INDEX "Initiative_workspaceId_plannedStart_plannedEnd_idx" ON "Initiative"("workspaceId", "plannedStart", "plannedEnd");
CREATE INDEX "WorkItem_workspaceId_initiativeId_type_idx" ON "WorkItem"("workspaceId", "initiativeId", "type");
CREATE INDEX "WorkItem_workspaceId_productId_status_idx" ON "WorkItem"("workspaceId", "productId", "status");
CREATE INDEX "WorkItem_parentId_idx" ON "WorkItem"("parentId");
CREATE UNIQUE INDEX "WorkItem_workspaceId_jiraIssueId_key" ON "WorkItem"("workspaceId", "jiraIssueId");
CREATE INDEX "Metric_workspaceId_productId_idx" ON "Metric"("workspaceId", "productId");
CREATE INDEX "Metric_workspaceId_initiativeId_idx" ON "Metric"("workspaceId", "initiativeId");
CREATE UNIQUE INDEX "MetricSnapshot_metricId_snapshotDate_key" ON "MetricSnapshot"("metricId", "snapshotDate");
CREATE INDEX "MetricSnapshot_workspaceId_snapshotDate_idx" ON "MetricSnapshot"("workspaceId", "snapshotDate");
CREATE INDEX "Dependency_workspaceId_resolvedAt_idx" ON "Dependency"("workspaceId", "resolvedAt");
CREATE INDEX "Blocker_workspaceId_status_severity_idx" ON "Blocker"("workspaceId", "status", "severity");
CREATE INDEX "StatusHistory_workspaceId_workItemId_changedAt_idx" ON "StatusHistory"("workspaceId", "workItemId", "changedAt");
CREATE INDEX "ProgressSnapshot_workspaceId_snapshotDate_idx" ON "ProgressSnapshot"("workspaceId", "snapshotDate");
CREATE INDEX "ProgressSnapshot_workspaceId_productId_snapshotDate_idx" ON "ProgressSnapshot"("workspaceId", "productId", "snapshotDate");
CREATE INDEX "ProgressSnapshot_workspaceId_initiativeId_snapshotDate_idx" ON "ProgressSnapshot"("workspaceId", "initiativeId", "snapshotDate");
CREATE INDEX "SyncRun_workspaceId_startedAt_idx" ON "SyncRun"("workspaceId", "startedAt");

ALTER TABLE "Product" ADD CONSTRAINT "Product_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Initiative" ADD CONSTRAINT "Initiative_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Initiative" ADD CONSTRAINT "Initiative_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Initiative" ADD CONSTRAINT "Initiative_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "WorkItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Metric" ADD CONSTRAINT "Metric_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Metric" ADD CONSTRAINT "Metric_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Metric" ADD CONSTRAINT "Metric_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MetricSnapshot" ADD CONSTRAINT "MetricSnapshot_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MetricSnapshot" ADD CONSTRAINT "MetricSnapshot_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "Metric"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_fromInitiativeId_fkey" FOREIGN KEY ("fromInitiativeId") REFERENCES "Initiative"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_toInitiativeId_fkey" FOREIGN KEY ("toInitiativeId") REFERENCES "Initiative"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_fromWorkItemId_fkey" FOREIGN KEY ("fromWorkItemId") REFERENCES "WorkItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_toWorkItemId_fkey" FOREIGN KEY ("toWorkItemId") REFERENCES "WorkItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Blocker" ADD CONSTRAINT "Blocker_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Blocker" ADD CONSTRAINT "Blocker_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Blocker" ADD CONSTRAINT "Blocker_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StatusHistory" ADD CONSTRAINT "StatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProgressSnapshot" ADD CONSTRAINT "ProgressSnapshot_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgressSnapshot" ADD CONSTRAINT "ProgressSnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgressSnapshot" ADD CONSTRAINT "ProgressSnapshot_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SyncRun" ADD CONSTRAINT "SyncRun_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Extend the legacy roadmap to the approved 18-month / six-quarter horizon.
UPDATE "Phase" SET "subtitle" = CASE "order"
  WHEN 1 THEN 'خرداد تا مرداد ۱۴۰۵'
  WHEN 2 THEN 'شهریور تا آبان ۱۴۰۵'
  WHEN 3 THEN 'آذر تا بهمن ۱۴۰۵'
  WHEN 4 THEN 'اسفند ۱۴۰۵ تا اردیبهشت ۱۴۰۶'
  ELSE "subtitle"
END;
INSERT INTO "Phase" ("id", "workspaceId", "label", "subtitle", "goal", "color", "order")
SELECT md5(w."id" || '-phase-5'), w."id", 'فصل پنجم', 'خرداد تا مرداد ۱۴۰۶', 'تحویل موج دوم قابلیت‌های Trade و افزایش مقیاس‌پذیری', '#7CE38B', 5
FROM "Workspace" w
WHERE NOT EXISTS (SELECT 1 FROM "Phase" p WHERE p."workspaceId" = w."id" AND p."order" = 5);
INSERT INTO "Phase" ("id", "workspaceId", "label", "subtitle", "goal", "color", "order")
SELECT md5(w."id" || '-phase-6'), w."id", 'فصل ششم', 'شهریور تا آبان ۱۴۰۶', 'تثبیت نهایی، گزارش‌دهی مدیریتی و آماده‌سازی رشد بعدی', '#A78BFA', 6
FROM "Workspace" w
WHERE NOT EXISTS (SELECT 1 FROM "Phase" p WHERE p."workspaceId" = w."id" AND p."order" = 6);

-- Copy legacy entities without deleting or overwriting their source rows.
INSERT INTO "Product" ("id", "workspaceId", "legacyDomainId", "name", "slug", "color", "order", "health", "createdAt", "updatedAt")
SELECT d."id", d."workspaceId", d."id", d."name", 'legacy-' || d."id", d."color", d."order", 'ON_TRACK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Domain" d
WHERE NOT EXISTS (SELECT 1 FROM "Product" p WHERE p."legacyDomainId" = d."id");

INSERT INTO "Initiative" ("id", "workspaceId", "productId", "legacyProjectId", "name", "summary", "plannedStart", "plannedEnd", "status", "health", "ownerId", "createdAt", "updatedAt")
SELECT p."id", p."workspaceId", p."domainId", p."id", p."name", p."note",
  TIMESTAMP '2026-06-01' + ((ph."order" - 1) * INTERVAL '3 months'),
  TIMESTAMP '2026-06-01' + (((ph."order" - 1) + p."span") * INTERVAL '3 months') - INTERVAL '1 day',
  CASE p."status"
    WHEN 'DONE' THEN 'DONE'::"WorkflowStatus"
    WHEN 'ACTIVE' THEN 'IN_PROGRESS'::"WorkflowStatus"
    WHEN 'REVIEW' THEN 'READY_FOR_QA'::"WorkflowStatus"
    WHEN 'PAUSED' THEN 'PAUSED'::"WorkflowStatus"
    ELSE 'BACKLOG'::"WorkflowStatus"
  END,
  'ON_TRACK'::"DeliveryHealth", p."createdById", p."createdAt", p."updatedAt"
FROM "Project" p
JOIN "Phase" ph ON ph."id" = p."startPhaseId"
WHERE NOT EXISTS (SELECT 1 FROM "Initiative" i WHERE i."legacyProjectId" = p."id");
