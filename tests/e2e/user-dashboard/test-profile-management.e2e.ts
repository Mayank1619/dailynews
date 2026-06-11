import { expect, test } from "@playwright/test";
import { enableE2EAuth } from "../helpers/e2e-auth";

test.describe("User profile management", () => {
  test.beforeEach(async ({ page }) => {
    await enableE2EAuth(page);
  });

  test("shows profile actions and plan from the top-right account menu", async ({ page }) => {
    await page.goto("/settings");

    await page.getByTestId("profile-menu-summary").click();

    await expect(page.getByRole("menu", { name: "Profile menu" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "My Profile" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "My Plan" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Preferences" })).toBeVisible();
    await expect(page.getByText(/trial days left/i)).toBeVisible();

    await page.getByRole("menuitem", { name: "My Profile" }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("heading", { name: "Your Profile" })).toBeVisible();
  });

  test("saves profile details and updates the profile preview", async ({ page }) => {
    await page.goto("/profile");

    await page.getByLabel("Display name").fill("Mayank Reader");
    await page.getByLabel("Headline").fill("AI news power user");
    await page.getByLabel("Location").fill("Toronto");
    await page.getByLabel("Photo URL").fill("https://example.com/profile.png");
    await page.getByTestId("save-profile").click();

    await expect(page.getByRole("status")).toContainText("Profile updated.");
    await expect(page.getByTestId("profile-preview")).toContainText("Mayank Reader");
    await expect(page.getByTestId("profile-preview")).toContainText("AI news power user");
    await expect(page.getByTestId("profile-preview")).toContainText("Toronto");
    await expect(page.getByTestId("profile-preview").getByAltText("Mayank Reader profile picture")).toHaveAttribute("src", "https://example.com/profile.png");

    await page.goto("/settings");
    await expect(page.getByTestId("profile-menu-summary")).toContainText("Mayank Reader");
  });

  test("validates and completes password changes with safe messages", async ({ page }) => {
    await page.goto("/profile");

    await page.getByLabel("New password", { exact: true }).fill("short");
    await page.getByLabel("Confirm new password").fill("short");
    await page.getByTestId("change-password").click();
    await expect(page.getByRole("alert")).toContainText("Use at least 12 characters");

    await page.getByLabel("New password", { exact: true }).fill("DailyPaper!2026");
    await page.getByLabel("Confirm new password").fill("DailyPaper!2027");
    await page.getByTestId("change-password").click();
    await expect(page.getByRole("alert")).toContainText("does not match");

    await page.getByLabel("New password", { exact: true }).fill("DailyPaper!2026");
    await page.getByLabel("Confirm new password").fill("DailyPaper!2026");
    await page.getByTestId("change-password").click();
    await expect(page.getByRole("status")).toContainText("Password updated.");
    await expect(page.getByLabel("New password", { exact: true })).toHaveValue("");
    await expect(page.getByLabel("Confirm new password")).toHaveValue("");
  });
});
