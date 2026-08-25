import {
  BlockerStatus,
  DeliveryHealth,
  Prisma,
  WorkflowStatus
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildPeriodReport,
  rollupProgress,
  scopeChange,
  type RollupWorkItem
} from "@/lib/trade-portfolio";

const workItemSelect = {
  id: true,
  parentId: true,
  productId: true,
  initiativeId: true,
  type: true,
  title: true,
  description: true,
  status: true,
  health: true,
  scopeState: true,
  ownerId: true,
  team: true,
  startDate: true,
  dueDate: true,
  completedAt: true,
  storyPoints: true,
  originalEstimate: true,
  qaReworkCount: true,
  jiraIssueKey: true,
  jiraIssueId: true,
  jiraUrl: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.WorkItemSelect;

export type PortfolioWorkItem = Prisma.WorkItemGetPayload<{ select: typeof workItemSelect }>;

function asRollupItems(items: PortfolioWorkItem[]): RollupWorkItem[] {
  return items.map((item) => ({
    id: item.id,
    parentId: item.parentId,
    productId: item.productId,
    initiativeId: item.initiativeId,
    type: item.type,
    status: item.status,
    scopeState: item.scopeState,
    storyPoints: item.storyPoints
  }));
}

export async function getWorkspaceBySlug(slug: string) {
  return prisma.workspace.findUnique({ where: { slug } });
}

export async function getPortfolioOverview(workspaceId: string) {
  const [workspace, products, initiatives, workItems, blockers, dependencies, snapshots] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: workspaceId }, select: { id: true, name: true, slug: true } }),
    prisma.product.findMany({
      where: { workspaceId, isActive: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { metrics: { orderBy: { createdAt: "asc" } } }
    }),
    prisma.initiative.findMany({
      where: { workspaceId, product: { isActive: true } },
      orderBy: [{ plannedStart: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        productId: true,
        name: true,
        summary: true,
        goal: true,
        okr: true,
        ownerId: true,
        team: true,
        plannedStart: true,
        plannedEnd: true,
        actualStart: true,
        actualEnd: true,
        status: true,
        health: true,
        jiraUrl: true
      }
    }),
    prisma.workItem.findMany({ where: { workspaceId, product: { isActive: true } }, select: workItemSelect }),
    prisma.blocker.findMany({
      where: { workspaceId, status: BlockerStatus.OPEN, initiative: { product: { isActive: true } } },
      orderBy: [{ severity: "desc" }, { createdAt: "asc" }],
      include: { initiative: { select: { id: true, name: true, productId: true } } }
    }),
    prisma.dependency.findMany({
      where: { workspaceId, resolvedAt: null, fromInitiative: { product: { isActive: true } } },
      orderBy: { createdAt: "asc" },
      include: {
        fromInitiative: { select: { id: true, name: true, productId: true } },
        toInitiative: { select: { id: true, name: true, productId: true } }
      }
    }),
    prisma.progressSnapshot.findMany({
      where: { workspaceId },
      orderBy: { snapshotDate: "desc" },
      take: 30
    })
  ]);

  if (!workspace) return null;

  const rollupItems = asRollupItems(workItems);
  const domainProgress = rollupProgress(rollupItems);
  const productById = new Map(products.map((product) => [product.id, product]));

  return {
    workspace,
    progress: domainProgress,
    products: products.map((product) => ({
      ...product,
      progress: rollupProgress(rollupItems, { productId: product.id }),
      initiatives: initiatives
        .filter((initiative) => initiative.productId === product.id)
        .map((initiative) => ({
          ...initiative,
          progress: rollupProgress(rollupItems, { initiativeId: initiative.id })
        }))
    })),
    initiatives: initiatives.map((initiative) => ({
      ...initiative,
      product: productById.get(initiative.productId) ?? null,
      progress: rollupProgress(rollupItems, { initiativeId: initiative.id })
    })),
    workItems,
    blockers,
    dependencies,
    snapshots
  };
}

export async function getInitiativeDetail(workspaceId: string, initiativeId: string) {
  const [initiative, workItems, blockers, dependencies, metrics] = await Promise.all([
    prisma.initiative.findFirst({
      where: { id: initiativeId, workspaceId },
      include: { product: true }
    }),
    prisma.workItem.findMany({
      where: { initiativeId, workspaceId },
      orderBy: [{ type: "asc" }, { createdAt: "asc" }],
      select: workItemSelect
    }),
    prisma.blocker.findMany({ where: { workspaceId, initiativeId }, orderBy: { createdAt: "desc" } }),
    prisma.dependency.findMany({
      where: {
        workspaceId,
        OR: [{ fromInitiativeId: initiativeId }, { toInitiativeId: initiativeId }]
      },
      include: {
        fromInitiative: { select: { id: true, name: true } },
        toInitiative: { select: { id: true, name: true } }
      }
    }),
    prisma.metric.findMany({ where: { workspaceId, initiativeId }, include: { snapshots: { orderBy: { snapshotDate: "desc" }, take: 12 } } })
  ]);

  if (!initiative) return null;

  const progress = rollupProgress(asRollupItems(workItems));
  return { initiative, workItems, progress, blockers, dependencies, metrics };
}

export async function createProgressSnapshots(workspaceId: string, snapshotDate = new Date()) {
  const [products, initiatives, workItems] = await Promise.all([
    prisma.product.findMany({ where: { workspaceId, isActive: true }, select: { id: true, health: true } }),
    prisma.initiative.findMany({ where: { workspaceId, product: { isActive: true } }, select: { id: true, productId: true, health: true } }),
    prisma.workItem.findMany({ where: { workspaceId, product: { isActive: true } }, select: workItemSelect })
  ]);
  const items = asRollupItems(workItems);
  const date = new Date(snapshotDate);
  date.setHours(0, 0, 0, 0);

  const snapshots = [
    {
      productId: null,
      initiativeId: null,
      health: DeliveryHealth.ON_TRACK,
      rollup: rollupProgress(items)
    },
    ...products.map((product) => ({
      productId: product.id,
      initiativeId: null,
      health: product.health,
      rollup: rollupProgress(items, { productId: product.id })
    })),
    ...initiatives.map((initiative) => ({
      productId: initiative.productId,
      initiativeId: initiative.id,
      health: initiative.health,
      rollup: rollupProgress(items, { initiativeId: initiative.id })
    }))
  ];

  const result = [];
  for (const snapshot of snapshots) {
    const previous = await prisma.progressSnapshot.findFirst({
      where: {
        workspaceId,
        productId: snapshot.productId,
        initiativeId: snapshot.initiativeId,
        snapshotDate: { lt: date }
      },
      orderBy: { snapshotDate: "desc" }
    });
    const change = scopeChange(snapshot.rollup.totalScope, previous?.totalScope ?? 0);
    await prisma.progressSnapshot.deleteMany({
      where: {
        workspaceId,
        productId: snapshot.productId,
        initiativeId: snapshot.initiativeId,
        snapshotDate: date
      }
    });
    result.push(await prisma.progressSnapshot.create({
      data: {
        workspaceId,
        productId: snapshot.productId,
        initiativeId: snapshot.initiativeId,
        snapshotDate: date,
        totalScope: snapshot.rollup.totalScope,
        doneScope: snapshot.rollup.doneScope,
        activeScope: snapshot.rollup.activeScope,
        blockedScope: snapshot.rollup.blockedScope,
        progress: snapshot.rollup.progress,
        scopeAdded: change.added,
        scopeRemoved: change.removed,
        velocity: snapshot.rollup.doneScope - (previous?.doneScope ?? 0),
        health: snapshot.health
      }
    }));
  }

  return result;
}

export async function getWorkspaceReport(workspaceId: string, from: Date, to: Date) {
  const [workItems, currentSnapshot, previousSnapshot, statusChanges, blockersCreated, blockersResolved] = await Promise.all([
    prisma.workItem.findMany({ where: { workspaceId }, select: workItemSelect }),
    prisma.progressSnapshot.findFirst({ where: { workspaceId, snapshotDate: { lte: to } }, orderBy: { snapshotDate: "desc" } }),
    prisma.progressSnapshot.findFirst({ where: { workspaceId, snapshotDate: { lt: from } }, orderBy: { snapshotDate: "desc" } }),
    prisma.statusHistory.findMany({
      where: { workspaceId, changedAt: { gte: from, lte: to } },
      select: { workItemId: true, toStatus: true }
    }),
    prisma.blocker.count({ where: { workspaceId, createdAt: { gte: from, lte: to } } }),
    prisma.blocker.count({ where: { workspaceId, resolvedAt: { gte: from, lte: to } } })
  ]);

  const current = currentSnapshot
    ? {
        totalScope: currentSnapshot.totalScope,
        doneScope: currentSnapshot.doneScope,
        activeScope: currentSnapshot.activeScope,
        blockedScope: currentSnapshot.blockedScope,
        progress: currentSnapshot.progress
      }
    : rollupProgress(asRollupItems(workItems));
  const previous = previousSnapshot
    ? {
        totalScope: previousSnapshot.totalScope,
        doneScope: previousSnapshot.doneScope,
        activeScope: previousSnapshot.activeScope,
        blockedScope: previousSnapshot.blockedScope,
        progress: previousSnapshot.progress
      }
    : undefined;
  const doneThisPeriod = statusChanges.filter((change) => change.toStatus === WorkflowStatus.DONE).length;
  const scope = scopeChange(current.totalScope, previous?.totalScope ?? 0);
  const nextPeriodEnd = new Date(to);
  nextPeriodEnd.setDate(nextPeriodEnd.getDate() + 7);
  const excludedFromNextPeriod: WorkflowStatus[] = [WorkflowStatus.DONE, WorkflowStatus.CANCELED, WorkflowStatus.OUT_OF_SCOPE];
  const nextPeriod = workItems.filter((item) => item.dueDate && item.dueDate > to && item.dueDate <= nextPeriodEnd && !excludedFromNextPeriod.includes(item.status)).length;
  const report = buildPeriodReport({
    current,
    previous,
    scopeAdded: scope.added,
    scopeRemoved: scope.removed,
    doneThisPeriod,
    nextPeriod,
    blockersCreated,
    blockersResolved,
    reworkCount: workItems.reduce((sum, item) => sum + item.qaReworkCount, 0),
    plannedProgress: previousSnapshot?.progress
  });

  return { report, current, previous, doneThisPeriodIds: statusChanges.filter((change) => change.toStatus === WorkflowStatus.DONE).map((change) => change.workItemId) };
}
