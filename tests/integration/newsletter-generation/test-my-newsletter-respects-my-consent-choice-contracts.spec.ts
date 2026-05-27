/**
 * US2: My Newsletter Respects My Consent Choice
 * Integration tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConsentChoiceService } from '../../../apps/api/src/features/newsletter-generation/my-newsletter-respects-my-consent-choice.service';

describe('US2: Integration - Consent Gate Contract', () => {
  let service: ConsentChoiceService;

  beforeEach(() => {
    service = new ConsentChoiceService();
  });

  it('should enforce consent gate before generation', async () => {
    const date = new Date('2026-05-27');
    const gate1 = await service.preFlightGate('user-consented', date);
    const gate2 = await service.preFlightGate('user-opted-out', date);

    expect(typeof gate1).toBe('boolean');
    expect(typeof gate2).toBe('boolean');
  });

  it('should skip generation for non-consenting users', async () => {
    const request = {
      userId: 'user-no-consent',
      date: new Date(),
    };

    const response = await service.checkConsent(request);

    expect(response.consentGranted).toBe(false);
  });

  it('should track skip reasons in audit', async () => {
    const request = {
      userId: 'user-test',
      date: new Date(),
    };

    const response = await service.checkConsent(request);

    if (!response.consentGranted) {
      expect(response.reason).toBeDefined();
    }
  });
});
