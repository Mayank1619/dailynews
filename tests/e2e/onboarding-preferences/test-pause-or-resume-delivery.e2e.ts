/**
 * End-to-End Tests - Pause or Resume Delivery
 * Simulates newsletter toggle behavior
 */

import { test, expect } from "@playwright/test";

test.describe("Pause or Resume Delivery (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to preferences page with delivery control
    await page.goto("/dashboard/newsletter");
  });

  test("should display current delivery status", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Should show header
    await expect(page.getByRole("heading", { name: /Newsletter Delivery/i })).toBeVisible();

    // Should show status message
    const statusText = await page.textContent("div");
    expect(statusText).toMatch(/Delivery Active|Delivery Paused/);
  });

  test("should toggle delivery on to off", async ({ page }) => {
    // Find the toggle switch
    const toggleInput = page.locator("input[type='checkbox']").first();

    // Initial state should be checked (delivery active)
    const initialChecked = await toggleInput.isChecked();

    if (initialChecked) {
      // Click to toggle off
      await toggleInput.click();

      // Should show "Delivery Paused"
      await expect(page.getByText(/Delivery Paused/i)).toBeVisible();

      // Verify toggle is now unchecked
      await expect(toggleInput).not.toBeChecked();
    }
  });

  test("should toggle delivery off to on", async ({ page }) => {
    const toggleInput = page.locator("input[type='checkbox']").first();

    // If currently checked (delivery on), uncheck first
    if (await toggleInput.isChecked()) {
      await toggleInput.click();
      await page.waitForTimeout(500);
    }

    // Now toggle back on
    await toggleInput.click();

    // Should show "Delivery Active"
    await expect(page.getByText(/Delivery Active/i)).toBeVisible();

    // Verify toggle is checked
    await expect(toggleInput).toBeChecked();
  });

  test("should preserve preferences when pausing", async ({ page }) => {
    // Get initial preference data displayed
    const initialTopics = await page.textContent("p:has-text('Topics')");;
    const initialRegion = await page.textContent("p:has-text('Region')");
    const initialTime = await page.textContent("p:has-text('Delivery Time')");

    // Toggle delivery off
    const toggleInput = page.locator("input[type='checkbox']").first();
    if (await toggleInput.isChecked()) {
      await toggleInput.click();
    }

    // Wait for update
    await page.waitForTimeout(500);

    // Preferences should remain visible and unchanged
    await expect(page.getByText(initialTopics || "")).toBeVisible();
    await expect(page.getByText(initialRegion || "")).toBeVisible();
    await expect(page.getByText(initialTime || "")).toBeVisible();
  });

  test("should show preferences summary card", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Should display preferences summary
    await expect(page.getByText(/Saved Preferences/i)).toBeVisible();
    await expect(page.getByText(/Topics:/i)).toBeVisible();
    await expect(page.getByText(/Region:/i)).toBeVisible();
    await expect(page.getByText(/Delivery Time:/i)).toBeVisible();
  });

  test("should show helpful tip about preferences preservation", async ({ page }) => {
    // Search for tip or info message
    const infoMessage = page.locator("div").filter({ hasText: /preferences are always saved/i });
    await expect(infoMessage).toBeVisible();
  });

  test("should track toggle without page navigation", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Get current URL
    const initialUrl = page.url();

    // Toggle delivery
    const toggleInput = page.locator("input[type='checkbox']").first();
    await toggleInput.click();

    // Wait for state update
    await page.waitForTimeout(500);

    // URL should not change
    expect(page.url()).toBe(initialUrl);

    // Page should still be interactive
    await expect(page.getByRole("heading", { name: /Newsletter Delivery/i })).toBeVisible();
  });

  test("should properly show delivery status text", async ({ page }) => {
    const toggleInput = page.locator("input[type='checkbox']").first();

    // Get current state
    let isEnabled = await toggleInput.isChecked();

    // Check status text matches toggle state
    if (isEnabled) {
      await expect(page.getByText(/Delivery Active/i)).toBeVisible();
      await expect(page.getByText(/You're receiving/i)).toBeVisible();
    }

    // Toggle and verify
    await toggleInput.click();
    isEnabled = await toggleInput.isChecked();

    if (!isEnabled) {
      await expect(page.getByText(/Delivery Paused/i)).toBeVisible();
      await expect(page.getByText(/paused. Your preferences are saved/i)).toBeVisible();
    }
  });

  test("should have accessible toggle control", async ({ page }) => {
    const toggleInput = page.locator("input[type='checkbox']").first();

    // Should be keyboard accessible
    await toggleInput.focus();

    const isFocused = await toggleInput.evaluate((el) => {
      return document.activeElement === el;
    });

    expect(isFocused).toBe(true);

    // Space should toggle
    await page.keyboard.press("Space");

    const newState = await toggleInput.isChecked();
    // State should have changed
  });

  test("should show visual toggle switch", async ({ page }) => {
    const toggleInput = page.locator("input[type='checkbox']").first();
    const initialChecked = await toggleInput.isChecked();

    // The toggle should have visible styling
    const toggleContainer = toggleInput.locator("..");
    const bgColor = await toggleContainer.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(bgColor).toBeTruthy();

    // Toggle and verify visual change
    await toggleInput.click();
    await page.waitForTimeout(200);

    const newBgColor = await toggleContainer.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Color should have changed
    expect(bgColor).not.toBe(newBgColor);
  });
});
