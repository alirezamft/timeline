import { describe, expect, it } from "vitest";
import {
  completion,
  productTasks,
  projectTasks,
  timelineMonths,
  tradeProducts
} from "@/lib/trade-portfolio-demo";

describe("Trade portfolio demo", () => {
  it("covers the approved six products and full 18-month horizon", () => {
    expect(tradeProducts.map((product) => product.name)).toEqual([
      "بازار پیشرفته",
      "OTC",
      "تراز",
      "پرایسر و دیده‌بان",
      "API همکاران",
      "نرم‌افزار همکاران"
    ]);
    expect(timelineMonths).toHaveLength(18);
  });

  it("keeps every project inside the roadmap horizon", () => {
    for (const product of tradeProducts) {
      for (const project of product.projects) {
        expect(project.startMonth).toBeGreaterThanOrEqual(0);
        expect(project.startMonth + project.duration).toBeLessThanOrEqual(18);
      }
    }
  });

  it("calculates roll-up progress only from leaf tasks", () => {
    const firstProject = tradeProducts[0].projects[0];
    const tasks = projectTasks(firstProject);
    const expected = Math.round((tasks.filter((task) => task.status === "DONE").length / tasks.length) * 100);

    expect(completion(tasks)).toBe(expected);
    expect(completion(productTasks(tradeProducts[0]))).toBeGreaterThan(0);
    expect(completion(productTasks(tradeProducts[0]))).toBeLessThan(100);
  });

  it("uses unique task identifiers for live updates", () => {
    const ids = tradeProducts.flatMap(productTasks).map((task) => task.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
