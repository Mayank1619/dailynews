/**
 * Integration: US3 - Unsubscribe Honored Immediately
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MyUnsubscribeRequestIsHonouredImmediatelyService } from '../../../apps/api/src/features/email-delivery/my-unsubscribe-request-is-honoured-immediately.service';
import { UserPreferences } from '../../../apps/api/src/features/email-delivery/email-delivery.types';

describe('Integration: US3 - Unsubscribe Honored Immediately', () => {
  let service: MyUnsubscribeRequestIsHonouredImmediatelyService;

  beforeEach(() => {
    service = new MyUnsubscribeRequestIsHonouredImmediatelyService();
  });

  it('contract: unsubscribe from email link works', () => {
    const prefs: UserPreferences = {
      userId: 'user1',
      email: 'test@example.com',
      deliveryTime: '09:00',
      timezone: 'UTC',
      newsletterEnabled: true,
      isVerified: true,
    };

    const link = service.generateUnsubscribeLink(prefs.userId, 'https://app.example.com');
    expect(link).toContain('token=');

    // Extract token and validate
    const tokenMatch = link.match(/token=(.+)$/);
    if (tokenMatch) {
      const token = tokenMatch[1];
      const isValid = service.validateUnsubscribeToken(token, prefs.userId);
      expect(isValid).toBe(true);
    }
  });

  it('contract: user unsubscribe honored in next run', () => {
    const prefs: UserPreferences = {
      userId: 'user2',
      email: 'test2@example.com',
      deliveryTime: '09:00',
      timezone: 'UTC',
      newsletterEnabled: true,
      isVerified: true,
    };

    // Unsubscribe
    const result = service.processUnsubscribe(
      {
        userId: 'user2',
        requestedAt: new Date(),
        source: 'email_link',
      },
      prefs,
    );

    expect(result.unsubscribed).toBe(true);
    expect(result.previousState).toBe(true);
  });

  it('contract: re-subscribe from dashboard works', () => {
    const prefs: UserPreferences = {
      userId: 'user3',
      email: 'test3@example.com',
      deliveryTime: '09:00',
      timezone: 'UTC',
      newsletterEnabled: false,
      isVerified: true,
    };

    const result = service.processResubscribe('user3', prefs);

    expect(result.unsubscribed).toBe(false);
    expect(result.previousState).toBe(false);
  });
});
