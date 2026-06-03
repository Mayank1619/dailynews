import { expect, test } from "@playwright/test";

test.describe("Product information pages", () => {
  test("about page explains the personal newspaper concept", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByRole("heading", { name: "A personal newspaper for people who still like to read" })).toBeVisible();
    await expect(page.getByText("Physical newspapers are harder to get")).toBeVisible();
    await expect(page.getByRole("link", { name: "Create My Paper" })).toBeVisible();
  });

  test("how it works page explains topic selection and improvement controls", async ({ page }) => {
    await page.goto("/how-it-works");

    await expect(page.getByRole("heading", { name: "From topic choices to a personal newspaper" })).toBeVisible();
    await expect(page.getByText("Choose your sections")).toBeVisible();
    await expect(page.getByText("Improve the result")).toBeVisible();
  });

  test("pricing page describes trial, Plus, and refinement features", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByRole("heading", { name: "Start free, then keep your personal paper" })).toBeVisible();
    await expect(page.getByText("15-day free trial")).toBeVisible();
    await expect(page.getByText("deeper newsletter refinement")).toBeVisible();
  });
});
