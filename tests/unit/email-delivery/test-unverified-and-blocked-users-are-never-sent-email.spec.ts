/**
 * Unit Tests: US4 - Unverified and Blocked Users Never Sent
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UnverifiedAndBlockedUsersAreNeverSentEmailService } from '../../../apps/api/src/features/email-delivery/unverified-and-blocked-users-are-never-sent-email.service';
import { DeliveryEligibilityService } from '../../../apps/api/src/features/email-delivery/delivery-eligibility.service';
import { UserPreferences } from '../../../apps/api/src/features/email-delivery/email-delivery.types';

describe('US4: Unverified and Blocked Users Are Never Sent Email', () => {
  let service: UnverifiedAndBlockedUsersAreNeverSentEmailService;

  beforeEach(() => {
    const eligibilityService = new DeliveryEligibilityService();
    service = new UnverifiedAndBlockedUsersAreNeverSentEmailService(eligibilityService);
  });

  describe('enforceEligibility', () => {
    it('should fail unverified users', () => {
      const prefs: UserPreferences = {
        userId: 'user1',
        email: 'test@example.com',
        deliveryTime: '09:00',
        timezone: 'UTC',
        newsletterEnabled: true,
        isVerified: false,
      };

      const check = service.enforceEligibility(prefs);

      expect(check.pass).toBe(false);
      expect(check.reason).toBe('email_not_verified');
    });

    it('should fail blocked users', () => {
      const prefs: UserPreferences = {
        userId: 'user1',
        email: 'test@example.com',
        deliveryTime: '09:00',
        timezone: 'UTC',
        newsletterEnabled: true,
        isVerified: true,
      };

      const check = service.enforceEligibility(prefs, true);

      expect(check.pass).toBe(false);
      expect(check.reason).toBe('account_blocked');
    });

    it('should pass eligible users', () => {
      const prefs: UserPreferences = {
        userId: 'user1',
        email: 'test@example.com',
        deliveryTime: '09:00',
        timezone: 'UTC',
        newsletterEnabled: true,
        isVerified: true,
      };

      const check = service.enforceEligibility(prefs, false);

      expect(check.pass).toBe(true);
      expect(check.reason).toBe('all_checks_passed');
    });
  });

  describe('batchVerifyUsers', () => {
    it('should verify multiple users', () => {
      const users: UserPreferences[] = [
        {
          userId: 'user1',
          email: 'test1@example.com',
          deliveryTime: '09:00',
          timezone: 'UTC',
          newsletterEnabled: true,
          isVerified: true,
        },
        {
          userId: 'user2',
          email: 'test2@example.com',
          deliveryTime: '09:00',
          timezone: 'UTC',
          newsletterEnabled: true,
          isVerified: false,
        },
      ];

      const results = service.batchVerifyUsers(users);

      expect(results.get('user1')?.pass).toBe(true);
      expect(results.get('user2')?.pass).toBe(false);
    });
  });

  describe('validateZeroTolerance', () => {
    it('should validate zero tolerance', () => {
      const checks = new Map([
        ['user1', { userId: 'user1', isVerified: true, isBlocked: false, newsletterEnabled: true, pass: true, reason: 'all_checks_passed' }],
        ['user2', { userId: 'user2', isVerified: false, isBlocked: false, newsletterEnabled: true, pass: false, reason: 'email_not_verified' }],
      ]);

      const validation = service.validateZeroTolerance(checks);

      expect(validation.isValid).toBe(true);
      expect(validation.failedChecks.length).toBe(1);
    });
  });
});
