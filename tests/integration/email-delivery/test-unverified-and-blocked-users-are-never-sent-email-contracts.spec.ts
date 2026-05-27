/**
 * Integration: US4 - Unverified and Blocked Users Never Sent
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UnverifiedAndBlockedUsersAreNeverSentEmailService } from '../../../apps/api/src/features/email-delivery/unverified-and-blocked-users-are-never-sent-email.service';
import { DeliveryEligibilityService } from '../../../apps/api/src/features/email-delivery/delivery-eligibility.service';
import { UserPreferences } from '../../../apps/api/src/features/email-delivery/email-delivery.types';

describe('Integration: US4 - Unverified/Blocked Never Sent', () => {
  let service: UnverifiedAndBlockedUsersAreNeverSentEmailService;

  beforeEach(() => {
    service = new UnverifiedAndBlockedUsersAreNeverSentEmailService(new DeliveryEligibilityService());
  });

  it('contract: unverified users rejected with clear reason', () => {
    const prefs: UserPreferences = {
      userId: 'unverified_user',
      email: 'unverified@example.com',
      deliveryTime: '09:00',
      timezone: 'UTC',
      newsletterEnabled: true,
      isVerified: false,
    };

    const check = service.enforceEligibility(prefs);

    expect(check.pass).toBe(false);
    expect(check.reason).toBe('email_not_verified');
  });

  it('contract: blocked users rejected with clear reason', () => {
    const prefs: UserPreferences = {
      userId: 'blocked_user',
      email: 'blocked@example.com',
      deliveryTime: '09:00',
      timezone: 'UTC',
      newsletterEnabled: true,
      isVerified: true,
    };

    const check = service.enforceEligibility(prefs, true);

    expect(check.pass).toBe(false);
    expect(check.reason).toBe('account_blocked');
  });

  it('contract: batch verify provides uniform checks', () => {
    const users: UserPreferences[] = [
      {
        userId: 'verified_user',
        email: 'verified@example.com',
        deliveryTime: '09:00',
        timezone: 'UTC',
        newsletterEnabled: true,
        isVerified: true,
      },
      {
        userId: 'unverified_user',
        email: 'unverified@example.com',
        deliveryTime: '09:00',
        timezone: 'UTC',
        newsletterEnabled: true,
        isVerified: false,
      },
    ];

    const results = service.batchVerifyUsers(users);
    const validation = service.validateZeroTolerance(results);

    expect(validation.isValid).toBe(true);
    expect(validation.failedChecks.length).toBe(1);
  });

  it('contract: zero tolerance enforced', () => {
    const checks = new Map([
      ['user1', { userId: 'user1', isVerified: true, isBlocked: false, newsletterEnabled: true, pass: true }],
      ['user2', { userId: 'user2', isVerified: false, isBlocked: false, newsletterEnabled: true, pass: false, reason: 'email_not_verified' }],
    ]);

    const validation = service.validateZeroTolerance(checks);

    expect(validation.isValid).toBe(true);
    // Should have exactly 1 failed check
    expect(validation.failedChecks.length).toBe(1);
  });
});
