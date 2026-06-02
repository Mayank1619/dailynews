import { expect, test } from "@playwright/test";

test("US1 e2e: blog index renders published post cards and pagination", async ({ page }) => {
  await page.goto("/blog");

  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  await expect(page.getByRole("link", { name: /daily-ai-news-briefing/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /markets-without-the-noise/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Next page/i })).toBeVisible();
});
