/**
 * End-to-End Tests - Update Preferences Anytime
 * Simulates preference updates in dashboard
 */

import { test, expect } from "@playwright/test";
import { enableE2EAuth } from "../helpers/e2e-auth";

test.describe("Update Preferences Anytime (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    await enableE2EAuth(page);
    await page.goto("/dashboard/preferences");
  });

  test("should load and display current preferences", async ({ page }) => {
    // Wait for preferences to load
    await page.waitForLoadState("networkidle");

    // Should show preferences form
    await expect(page.getByRole("heading", { name: /Update Your Preferences/i })).toBeVisible();

    // Should have form controls
    await expect(page.getByRole("group", { name: /Topics/i })).toBeVisible();
    await expect(page.getByLabel("Region", { exact: false })).toBeVisible();
    await expect(page.getByLabel("Time", { exact: true })).toBeVisible();
  });

  test("should update single field", async ({ page }) => {
    // Change delivery time
    const timeInput = page.getByLabel("Time", { exact: true });
    await timeInput.clear();
    await timeInput.fill("18:00");

    // Save should be visible and enabled
    const saveButton = page.getByRole("button", { name: /Save Changes/i });
    await expect(saveButton).not.toBeDisabled();

    // Click save
    await saveButton.click();

    // Should show success message
    await expect(page.getByText(/Preferences updated successfully/i)).toBeVisible();

    // Verify after refresh
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(timeInput).toHaveValue("18:00");
  });

  test("should update multiple fields", async ({ page }) => {
    // Select different topics
    const techButton = page.getByRole("button", { name: "New in Technology" });
    const scienceButton = page.getByRole("button", { name: "Science" });

    // Deselect if selected, select if not
    await techButton.click();
    await scienceButton.click();

    // Change region
    const provinceInput = page.getByPlaceholder("e.g., Ontario");
    await provinceInput.clear();
    await provinceInput.fill("British Columbia");

    // Change delivery time
    const timeInput = page.getByLabel("Time", { exact: true });
    await timeInput.clear();
    await timeInput.fill("09:00");

    // Save
    const saveButton = page.getByRole("button", { name: /Save Changes/i });
    await saveButton.click();

    // Verify success
    await expect(page.getByText(/successfully/i)).toBeVisible();
  });

  test("should reset changes", async ({ page }) => {
    const timeInput = page.getByLabel("Time", { exact: true });
    const originalValue = await timeInput.inputValue();

    // Change value
    await timeInput.clear();
    await timeInput.fill("14:00");

    // Click reset
    const resetButton = page.getByRole("button", { name: "Reset" });
    await resetButton.click();

    // Should revert to original
    await expect(timeInput).toHaveValue(originalValue);
  });

  test("should disable save when no changes", async ({ page }) => {
    const saveButton = page.getByRole("button", { name: /Save Changes/i });

    // Initially should be disabled (no changes)
    await expect(saveButton).toBeDisabled();

    // Make a change
    const timeInput = page.getByLabel("Time", { exact: true });
    await timeInput.clear();
    await timeInput.fill("12:00");

    // Now should be enabled
    await expect(saveButton).not.toBeDisabled();

    // Reset - should disable again
    const resetButton = page.getByRole("button", { name: "Reset" });
    await resetButton.click();

    await expect(saveButton).toBeDisabled();
  });

  test("should validate required fields", async ({ page }) => {
    await expect(page.getByRole("button", { name: "New in Technology" })).toHaveAttribute("aria-pressed", "true");

    for (const topicName of ["New in Technology", "Markets", "Science"]) {
      const topic = page.getByRole("button", { name: topicName });
      if ((await topic.getAttribute("aria-pressed")) === "true") {
        await topic.click();
        await expect(topic).toHaveAttribute("aria-pressed", "false");
      }
    }

    // Try to save
    const saveButton = page.getByRole("button", { name: /Save Changes/i });
    await expect(saveButton).not.toBeDisabled();
    await saveButton.click();

    // Should show error
    await expect(page.getByText(/Please select at least one topic/i)).toBeVisible();
  });

  test("should show change summary in preferences card", async ({ page }) => {
    // Update a preference
    const timeInput = page.getByLabel("Time", { exact: true });
    await timeInput.clear();
    await timeInput.fill("15:00");

    // Look for visual indication of change
    const timeField = page.locator("div").filter({ has: page.getByLabel("Time", { exact: true }) }).last();
    await expect(timeField).toBeVisible();

    // Save changes
    const saveButton = page.getByRole("button", { name: /Save Changes/i });
    await saveButton.click();

    // Wait for success
    await page.waitForTimeout(500);

    // Should show confirmation
    await expect(page.getByText(/updated successfully/i)).toBeVisible();
  });

  test("should support keyboard navigation", async ({ page }) => {
    // Tab to first field
    await page.keyboard.press("Tab");

    // Should focus on first interactive element
    const focused = await page.evaluate(() => {
      return (document.activeElement as HTMLElement)?.tagName;
    });

    expect(["A", "BUTTON", "INPUT", "SELECT"]).toContain(focused);

    // Tab through form
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
    }

    // Should still be in the form
    const inViewport = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.left >= 0;
    });

    expect(inViewport).toBe(true);
  });

  test("should persist changes across page reload", async ({ page }) => {
    // Update preference
    const timeInput = page.getByLabel("Time", { exact: true });
    await timeInput.clear();
    await timeInput.fill("20:00");

    const saveButton = page.getByRole("button", { name: /Save Changes/i });
    await saveButton.click();

    // Wait for save to complete
    await expect(page.getByText(/updated successfully/i)).toBeVisible();

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Verify preference persisted
    await expect(timeInput).toHaveValue("20:00");
  });
});
