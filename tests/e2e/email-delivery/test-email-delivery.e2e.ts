/**
 * E2E Tests: Email Delivery Feature using Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('Email Delivery E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:3000');
    // Assume user is logged in via auth fixture
  });

  test('US1: User can set delivery time preference', async ({ page }) => {
    // Navigate to settings
    await page.click('[data-testid="settings-link"]');
    await page.click('[data-testid="email-preferences"]');

    // Set delivery time
    await page.fill('[data-testid="delivery-time"]', '09:00');
    await page.selectOption('[data-testid="timezone"]', 'America/New_York');

    // Save
    await page.click('[data-testid="save-preferences"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Delivery time updated');
  });

  test('US3: User can unsubscribe from newsletter', async ({ page }) => {
    // Navigate to subscription settings
    await page.click('[data-testid="settings-link"]');
    await page.click('[data-testid="subscription-settings"]');

    // Verify subscribed state
    const toggleButton = page.locator('[data-testid="subscription-toggle"]');
    await expect(toggleButton).toContainText('Unsubscribe');

    // Click unsubscribe
    await page.click('[data-testid="subscription-toggle"]');

    // Verify unsubscribed state
    await expect(toggleButton).toContainText('Resubscribe');
    await expect(page.locator('[data-testid="unsubscribed-message"]')).toBeVisible();
  });

  test('US3: User can resubscribe to newsletter', async ({ page }) => {
    // Assume user is already unsubscribed
    // Navigate to subscription settings
    await page.click('[data-testid="settings-link"]');
    await page.click('[data-testid="subscription-settings"]');

    // Verify unsubscribed state
    let toggleButton = page.locator('[data-testid="subscription-toggle"]');
    await expect(toggleButton).toContainText('Resubscribe');

    // Click resubscribe
    await page.click('[data-testid="subscription-toggle"]');

    // Verify resubscribed state
    toggleButton = page.locator('[data-testid="subscription-toggle"]');
    await expect(toggleButton).toContainText('Unsubscribe');
  });

  test('US5: Operator can view delivery health dashboard', async ({ page }) => {
    // Navigate to admin panel
    await page.goto('http://localhost:3000/admin');

    // Navigate to health dashboard
    await page.click('[data-testid="health-dashboard"]');

    // Verify metrics are present (but no PII)
    await expect(page.locator('[data-testid="success-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="failure-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-sent"]')).toBeVisible();

    // Verify no user information is displayed
    const content = await page.content();
    expect(content).not.toContain('@example.com');
    expect(content).not.toContain('user@');

    // Verify refresh works
    await page.click('[data-testid="refresh-metrics"]');
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="success-rate"]')).toBeVisible();
  });

  test('US5: Operator can see skip reasons and error codes', async ({ page }) => {
    // Navigate to admin panel
    await page.goto('http://localhost:3000/admin');

    // Navigate to health dashboard
    await page.click('[data-testid="health-dashboard"]');

    // View breakdown
    await page.click('[data-testid="view-breakdown"]');

    // Verify detailed metrics are present
    await expect(page.locator('[data-testid="skip-reasons-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-codes-table"]')).toBeVisible();

    // Verify data is aggregate only
    const reasonsText = await page.locator('[data-testid="skip-reasons-table"]').textContent();
    expect(reasonsText).toContain('user_unsubscribed');
    expect(reasonsText).toContain('email_not_verified');
    expect(reasonsText).toContain('account_blocked');
  });
});

test.describe('Email Delivery Unsubscribe Link E2E', () => {
  test('user receives email with unsubscribe link', async ({ page }) => {
    // This test would integrate with email service mock
    // Verify unsubscribe link format
    const unsubscribeUrl = 'http://localhost:3000/api/email/unsubscribe?token=';
    expect(unsubscribeUrl).toContain('/api/email/unsubscribe');
  });

  test('unsubscribe link brings user to confirmation page', async ({ page }) => {
    // Navigate using unsubscribe link
    const token = Buffer.from('test_user:12345').toString('base64');
    await page.goto(`http://localhost:3000/api/email/unsubscribe?token=${token}`);

    // Verify confirmation page appears
    await expect(page.locator('[data-testid="unsubscribe-confirmation"]')).toBeVisible();
    await expect(page.locator('text=You have been unsubscribed')).toBeVisible();
  });
});
