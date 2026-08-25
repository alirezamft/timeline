import { expect, test } from "@playwright/test";

test("approved demo preserves the executive drill-down surface", async ({ page }) => {
  await page.goto("/demo");
  await expect(page).toHaveTitle(/Trade Portfolio Demo/);
  await expect(page.getByText("بازار پیشرفته", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Timeline|Roadmap/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /گزارش|Reports/i })).toBeVisible();
});

test("authenticated overview to report flow", async ({ page }) => {
  test.skip(!process.env.E2E_WORKSPACE_SLUG, "Set E2E_WORKSPACE_SLUG after seeding a test database.");
  const slug = process.env.E2E_WORKSPACE_SLUG as string;
  await page.goto(`/w/${slug}/portfolio`);
  await expect(page.getByText("Domain Overview")).toBeVisible();
  await page.getByRole("link", { name: /18-Month Roadmap/ }).click();
  await expect(page.getByText("18-Month Roadmap")).toBeVisible();
  await page.getByRole("link", { name: /Reports/ }).click();
  await expect(page.getByText("Reports")).toBeVisible();
  await expect(page.getByRole("button", { name: /Copy Markdown/ })).toBeVisible();
});
