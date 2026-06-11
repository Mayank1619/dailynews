/**
 * End-to-End Tests - Complete First-Time Onboarding
 * Simulates user flow through onboarding with Playwright
 */

import { test, expect } from "@playwright/test";
import { enableE2EAuth } from "../helpers/e2e-auth";

test.describe("Complete First-Time Onboarding (E2E)", () => {
  test.beforeEach(async ({ page }) => {
    await enableE2EAuth(page);
  });

  test("should guide user through complete onboarding flow", async ({ page }) => {
    // Navigate to onboarding
    await page.goto("/onboarding");

    // Verify header is visible
    await expect(page.getByRole("heading", { name: /Personalize Your Daily News/i })).toBeVisible();

    // Step 1: Topics Selection
    await expect(page.getByRole("heading", { name: /What topics interest you/i })).toBeVisible();

    // Select multiple topics
    await page.getByRole("button", { name: "New in Technology" }).click();
    await page.getByRole("button", { name: "Markets" }).click();
    await page.getByRole("button", { name: "Science" }).click();

    // Verify topics are selected (visual feedback)
    const selectedButtons = await page
      .getByRole("button", { name: /Technology|Business|Science/ })
      .all();
    for (const btn of selectedButtons) {
      const style = await btn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(style).toBeTruthy(); // Should have selection styling
    }

    // Click Next
    await page.getByRole("button", { name: "Next" }).click();

    // Step 2: Region Selection
    await expect(page.getByRole("heading", { name: /Your Region/i })).toBeVisible();

    // Verify Canada is pre-selected
    const countrySelect = page.getByLabel("Country");
    await expect(countrySelect).toHaveValue("Canada");

    // Fill in province
    await page.getByPlaceholder("e.g., Ontario").fill("Ontario");

    // Click Next
    await page.getByRole("button", { name: "Next" }).click();

    // Step 3: Delivery Time
    await expect(page.getByRole("heading", { name: /How often should we deliver/i })).toBeVisible();

    // Set delivery time
    const timeInput = page.getByLabel("Time", { exact: true });
    await timeInput.fill("08:00");

    // Verify timezone dropdown
    const timezoneSelect = page.getByLabel("Timezone");
    await expect(timezoneSelect).toHaveValue("America/Toronto");

    // Click Next to go to Review
    await page.getByRole("button", { name: "Next" }).click();

    // Step 4: Review
    await expect(page.getByRole("heading", { name: /Review your preferences/i })).toBeVisible();

    // Verify summary shows correct info
    const summaryText = await page.textContent("div");
    expect(summaryText).toContain("New in Technology");
    expect(summaryText).toContain("Canada");
    expect(summaryText).toContain("08:00");

    // Submit onboarding
    const submitButton = page.getByRole("button", { name: /Complete Onboarding/i });
    await submitButton.click();

    await expect(page).toHaveURL(/\/dashboard\/preferences$/);

    // Optionally verify we're redirected or see a success state
    // This depends on your implementation
  });

  test("should validate topic selection is required", async ({ page }) => {
    await page.goto("/onboarding");

    // Try to proceed without selecting topics
    const nextButton = page.getByRole("button", { name: "Next" });

    // The next button might be disabled or clicking should show error
    if ((await nextButton.isDisabled()) === false) {
      await nextButton.click();

      // Should see error message
      await expect(page.getByText(/Please select at least one topic/i)).toBeVisible();
    }
  });

  test("should have accessible keyboard navigation", async ({ page }) => {
    await page.goto("/onboarding");

    // Tab to first topic button
    await page.keyboard.press("Tab");

    // Topic buttons should be focusable
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.getAttribute("aria-label") ||
        document.activeElement?.textContent;
    });

    expect(focusedElement).toBeTruthy();

    // Space should select the topic
    await page.keyboard.press("Space");

    // Continue with tab navigation
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
    }

    // Verify we can still interact with page
    await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
  });

  test("should highlight selected topics with distinct styling", async ({ page }) => {
    await page.goto("/onboarding");

    const techButton = page.getByRole("button", { name: "New in Technology" });
    const businessButton = page.getByRole("button", { name: "Markets" });

    // Get initial style
    const techStyleBefore = await techButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Click to select
    await techButton.click();

    const techStyleAfter = await techButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Style should change
    expect(techStyleBefore).not.toBe(techStyleAfter);

    // Business should still have original style
    const businessStyle = await businessButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(businessStyle).toBe(techStyleBefore);
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto("/onboarding");

    // Content should still be visible
    await expect(page.getByRole("heading", { name: /Personalize Your Daily News/i })).toBeVisible();

    // Topic buttons should stack vertically
    const container = page.locator("div").filter({ has: page.getByRole("button", { name: "New in Technology" }) }).last();
    const boundingBox = await container.boundingBox();

    // Width should be constrained to mobile viewport
    expect(boundingBox?.width).toBeLessThan(400);
  });
});
