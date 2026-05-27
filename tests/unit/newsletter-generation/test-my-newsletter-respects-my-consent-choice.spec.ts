/**
 * US2: My Newsletter Respects My Consent Choice
 * Unit tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConsentChoiceService } from '../../../apps/api/src/features/newsletter-generation/my-newsletter-respects-my-consent-choice.service';

describe('US2: My Newsletter Respects My Consent Choice - Unit Tests', () => {
  let service: ConsentChoiceService;

  beforeEach(() => {
    service = new ConsentChoiceService();
  });

  it('should deny consent when newsletter is disabled', async () => {
    const request = {
      userId: 'user-disabled',
      date: new Date(),
    };

    const response = await service.checkConsent(request);

    expect(response.consentGranted).toBe(false);
  });

  it('should deny consent when user preferences are missing', async () => {
    const request = {
      userId: 'user-no-prefs',
      date: new Date(),
    };

    const response = await service.checkConsent(request);

    expect(response.consentGranted).toBe(false);
  });

  it('should deny consent when email is unverified', async () => {
    const request = {
      userId: 'user-unverified',
      date: new Date(),
    };

    const response = await service.checkConsent(request);

    expect(response.consentGranted).toBe(false);
  });

  it('should have valid consent response structure', async () => {
    const request = {
      userId: 'test-user',
      date: new Date(),
    };

    const response = await service.checkConsent(request);

    expect(response).toHaveProperty('userId');
    expect(response).toHaveProperty('consentGranted');
    expect(response).toHaveProperty('checkedAt');
  });

  it('should skip user without generating newsletter', async () => {
    const gate = await service.preFlightGate('user-disabled', new Date());
    expect(gate).toBe(false);
  });
});
