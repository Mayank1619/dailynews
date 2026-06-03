import { expect, test } from "@playwright/test";
import { enableE2EAuth } from "../helpers/e2e-auth";

test.describe("Read my personal paper", () => {
  test("generates a personalized in-app paper from saved preferences", async ({ page }) => {
    await enableE2EAuth(page, {
      topics: ["New in AI", "Markets", "Politics"],
      province: "Ontario"
    });

    await page.goto("/dashboard/paper");
    await expect(page.getByRole("heading", { name: "Read Your Daily Paper" })).toBeVisible();
    await expect(page.getByText("New in AI, Markets, Politics")).toBeVisible();

    await page.getByTestId("generate-my-paper").click();

    await expect(page.getByRole("status")).toContainText("Your paper is ready to read.");
    await expect(page.getByTestId("my-paper-reader")).toBeVisible();
    await expect(page.getByRole("heading", { name: "New in AI", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Markets", exact: true })).toBeVisible();
    await expect(page.getByText("Why it matters:").first()).toBeVisible();
  });

  test("applies improvement feedback and regenerates with deeper news", async ({ page }) => {
    await enableE2EAuth(page, {
      topics: ["Business", "Local News"],
      province: "Ontario"
    });

    await page.goto("/dashboard/paper");
    await page.getByText("More detailed").click();
    await page.getByRole("button", { name: "Less high-level summary" }).click();
    await page.getByRole("button", { name: "More local context" }).click();
    await page.getByLabel("Additional instruction").fill("Give me more detail and regional implications.");
    await page.getByTestId("apply-paper-feedback").click();

    await expect(page.getByTestId("my-paper-reader")).toContainText("More detailed depth");
    await expect(page.getByTestId("my-paper-reader")).toContainText("Ontario lens");
    await expect(page.getByTestId("my-paper-reader")).toContainText("deeper brief adds background");
  });

  test("prompts users to choose topics before creating a paper", async ({ page }) => {
    await enableE2EAuth(page, { topics: [] });

    await page.goto("/dashboard/paper");

    await expect(page.getByText("Choose topics to build your paper")).toBeVisible();
    await expect(page.getByRole("link", { name: "Choose Topics" })).toBeVisible();
  });
});
