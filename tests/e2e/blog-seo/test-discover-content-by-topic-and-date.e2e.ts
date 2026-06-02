import { expect, test } from "@playwright/test";

test("US3 e2e: filtered by tag shows only matching posts", async ({ page }) => {
  await page.goto("/blog?tag=climate");

  await expect(page.getByRole("heading", { name: "Discover" })).toBeVisible();
  await expect(page.getByTestId("active-filters")).toContainText("climate");
  await expect(page.getByRole("link", { name: /climate-signals-this-week/i })).toBeVisible();
});

test("US3 e2e: empty results show appropriate message", async ({ page }) => {
  await page.goto("/blog?tag=nonexistent-topic");

  await expect(page.getByText("No posts match the selected filters.")).toBeVisible();
});
