import { expect, test } from "@playwright/test";
import { enableE2EAuth } from "../helpers/e2e-auth";

test.describe("Plus paper preview", () => {
  test.beforeEach(async ({ page }) => {
    await enableE2EAuth(page);
  });

  test("shows a full paid-newsletter preview for signed-in users", async ({ page }) => {
    await page.goto("/dashboard/preview");

    await expect(page.getByRole("heading", { name: "Preview the Newspaper You're Paying For" })).toBeVisible();
    await expect(page.getByText("Daily Paper Plus preview")).toBeVisible();
    await expect(page.getByTestId("my-paper-reader")).toBeVisible();
    await expect(page.getByRole("heading", { name: "New in AI", exact: true })).toBeVisible();
    await expect(page.getByText("Why it matters:").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "View Plans" })).toHaveAttribute("href", "/billing");
  });

  test("links to the preview from dashboard home", async ({ page }) => {
    await page.goto("/settings");

    await expect(page.getByTestId("paid-paper-preview-card")).toBeVisible();
    await expect(page.getByTestId("preview-plus-paper")).toHaveAttribute("href", "/dashboard/preview");

    await page.getByTestId("preview-plus-paper").click();
    await expect(page).toHaveURL(/\/dashboard\/preview$/);
  });

  test("shows the preview before plan selection on billing", async ({ page }) => {
    await page.goto("/billing");

    await expect(page.getByTestId("paid-paper-preview-card")).toBeVisible();
    await expect(page.getByRole("link", { name: "Open Full Preview" })).toHaveAttribute("href", "/dashboard/preview");
    await expect(page.getByRole("heading", { name: "Your plan" })).toBeVisible();
  });
});
