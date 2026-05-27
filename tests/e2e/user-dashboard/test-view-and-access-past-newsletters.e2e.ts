import { expect, test } from "@playwright/test";

test("US4 e2e placeholder: sent newsletter row includes View link", async ({ page }) => {
  await page.setContent(
    `<ul><li><span>2026-05-27</span> <strong>sent</strong> <a href="/newsletter/1">View</a></li></ul>`,
    { waitUntil: "domcontentloaded" }
  );

  await expect(page.getByText("sent")).toBeVisible();
  await expect(page.getByRole("link", { name: "View" })).toBeVisible();
});

test("US4 e2e placeholder: failed row does not include View link", async ({ page }) => {
  await page.setContent(`<ul><li><span>2026-05-26</span> <strong>failed</strong></li></ul>`, {
    waitUntil: "domcontentloaded"
  });

  await expect(page.getByText("failed")).toBeVisible();
  await expect(page.getByRole("link", { name: "View" })).toHaveCount(0);
});
