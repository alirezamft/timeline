import { describe, expect, it } from "vitest";
import { FakeJiraProvider, mapJiraIssue } from "@/lib/jira";
import { mapJiraStatus, rollupProgress, scopeChange } from "@/lib/trade-portfolio";

const items = [
  { id: "story-1", parentId: null, productId: "p1", initiativeId: "i1", type: "STORY" as const, status: "DONE" as const },
  { id: "task-1", parentId: "story-1", productId: "p1", initiativeId: "i1", type: "TASK" as const, status: "DONE" as const },
  { id: "task-2", parentId: "story-1", productId: "p1", initiativeId: "i1", type: "TASK" as const, status: "IN_PROGRESS" as const },
  { id: "task-3", parentId: null, productId: "p1", initiativeId: "i1", type: "TASK" as const, status: "CANCELED" as const },
  { id: "task-4", parentId: null, productId: "p2", initiativeId: "i2", type: "BUG" as const, status: "DONE" as const }
];

describe("Trade portfolio server roll-ups", () => {
  it("counts only leaf task-like items and excludes canceled work", () => {
    expect(rollupProgress(items, { productId: "p1" })).toMatchObject({ totalScope: 2, doneScope: 1, progress: 50 });
    expect(rollupProgress(items)).toMatchObject({ totalScope: 3, doneScope: 2, progress: 67 });
  });

  it("reduces progress when a completed task is reopened", () => {
    const reopened = items.map((item) => item.id === "task-1" ? { ...item, status: "REWORK" as const } : item);
    expect(rollupProgress(items, { initiativeId: "i1" }).progress).toBe(50);
    expect(rollupProgress(reopened, { initiativeId: "i1" }).progress).toBe(0);
  });

  it("tracks scope growth and removal", () => {
    expect(scopeChange(12, 10)).toEqual({ added: 2, removed: 0, delta: 2 });
    expect(scopeChange(8, 10)).toEqual({ added: 0, removed: 2, delta: -2 });
  });

  it("isolates product and initiative roll-ups", () => {
    expect(rollupProgress(items, { productId: "p2" }).progress).toBe(100);
    expect(rollupProgress(items, { initiativeId: "i2" }).totalScope).toBe(1);
  });
});

describe("Jira read-only mapping", () => {
  it("maps Jira fields to the normalized work item contract", () => {
    const issue = mapJiraIssue({
      id: "10001",
      key: "TRADE-42",
      self: "https://jira.example.test/browse/TRADE-42",
      updated: "2026-08-25T10:00:00.000Z",
      fields: {
        summary: "QA سفارش",
        issuetype: { name: "Bug" },
        status: { name: "Ready for QA" },
        assignee: { displayName: "QA" },
        customfield_trade_product: "advanced-market",
        customfield_trade_initiative: "tami-transition",
        customfield_delivery_health: "At Risk",
        customfield_scope_state: "Committed",
        "story points": 3,
        customfield_team: "QA"
      }
    });
    expect(issue).toMatchObject({ jiraIssueKey: "TRADE-42", type: "BUG", status: "READY_FOR_QA", health: "AT_RISK", scopeState: "COMMITTED", storyPoints: 3 });
  });

  it("keeps unknown Jira statuses safe and provider incremental", async () => {
    expect(mapJiraStatus("Unknown Jira status")).toBe("BACKLOG");
    const provider = new FakeJiraProvider([
      { id: "1", key: "T-1", updated: "2026-08-20T00:00:00.000Z", fields: { summary: "old" } },
      { id: "2", key: "T-2", updated: "2026-08-25T00:00:00.000Z", fields: { summary: "new" } }
    ]);
    expect((await provider.listIssuesSince(new Date("2026-08-21T00:00:00.000Z"))).issues.map((issue) => issue.key)).toEqual(["T-2"]);
  });
});
