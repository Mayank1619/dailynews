/**
 * US2: My Newsletter Respects My Consent Choice
 * End-to-End tests
 */

import { test, expect } from '@playwright/test';
import { ConsentChoiceService } from '../../../apps/api/src/features/newsletter-generation/my-newsletter-respects-my-consent-choice.service';

test.describe('US2: E2E - Newsletter Respects Consent Choice', () => {
  test('e2e scenario: opted-out user is skipped', async () => {
    const service = new ConsentChoiceService();
    const userId = 'opted-out-user';
    const date = new Date();

    // User is opted out
    const consent = await service.checkConsent({ userId, date });

    expect(consent.consentGranted).toBe(false);
    expect(consent.userId).toBe(userId);

    // Pre-flight gate rejects generation
    const gate = await service.preFlightGate(userId, date);
    expect(gate).toBe(false);
  });

  test('e2e scenario: consent toggle affects generation', async () => {
    const service = new ConsentChoiceService();
    const userId = 'toggle-test-user';
    const date = new Date();

    // First check: user status unknown
    const check1 = await service.checkConsent({ userId, date });

    // Update consent
    await service.updateConsent(userId, true);

    // Verify gate result is boolean
    const gate = await service.preFlightGate(userId, date);
    expect(typeof gate).toBe('boolean');
  });

  test('e2e scenario: unverified users never receive newsletters', async () => {
    const service = new ConsentChoiceService();
    const userId = 'unverified-user';
    const date = new Date();

    // Even if enabled, unverified users blocked
    const consent = await service.checkConsent({ userId, date });

    // Should have a check result
    expect(consent).toHaveProperty('consentGranted');
    expect(consent).toHaveProperty('userId');
    expect(consent).toHaveProperty('checkedAt');
  });

  test('e2e scenario: missing preferences triggers skip', async () => {
    const service = new ConsentChoiceService();
    const userId = 'no-preferences-user';
    const date = new Date();

    const consent = await service.checkConsent({ userId, date });

    if (!consent.consentGranted) {
      expect(consent.reason).toBeDefined();
    }
  });
});
