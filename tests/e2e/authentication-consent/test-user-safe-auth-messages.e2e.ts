import { expect, test } from "@playwright/test";

test("login shows user-safe validation before authentication is attempted", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toHaveText("Enter your email address.");

  await page.getByLabel("Email").fill("not-an-email");
  await page.getByLabel("Password").fill("any-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toHaveText("Enter a valid email address.");

  await expect(page.getByRole("alert")).not.toContainText("Firebase");
  await expect(page.getByRole("alert")).not.toContainText("auth/");
});

test("signup shows meaningful validation before account creation is attempted", async ({ page }) => {
  await page.goto("/signup");

  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("status")).toHaveText("Enter your email address.");

  await page.getByLabel("Email").fill("reader@example.com");
  await page.getByLabel("Password").fill("short");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("status")).toHaveText("Use at least 12 characters for your password.");

  await expect(page.getByRole("status")).not.toContainText("Firebase");
  await expect(page.getByRole("status")).not.toContainText("auth/");
});
