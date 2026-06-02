import { expect, test } from "@playwright/test";

test("US2 e2e: blog post page renders full content and metadata", async ({ page }) => {
  await page.goto("/blog/daily-ai-news-briefing");

  await expect(page.getByRole("heading", { name: /Daily Ai News Briefing/i })).toBeVisible();
  await expect(page.getByTestId("excerpt")).toBeVisible();
  await expect(page.getByTestId("body")).toBeVisible();
  await expect(page.getByRole("link", { name: "ai", exact: true })).toBeVisible();
});

test("US2 e2e: unknown slug shows not-found message and back link", async ({ page }) => {
  await page.goto("/blog/unknown");

  await expect(page.getByRole("heading", { name: "Post not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to blog" })).toBeVisible();
});
