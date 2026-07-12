import { expect, test } from "@playwright/test";

test("login page renders in Persian", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "ورود به رودمپ سازمانی" })).toBeVisible();
  await expect(page.getByRole("button", { name: "ورود" })).toBeVisible();
});
