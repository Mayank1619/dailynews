/**
 * Unit Tests: Delivery Eligibility Service
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DeliveryEligibilityService } from '../../../apps/api/src/features/email-delivery/delivery-eligibility.service';
import { UserPreferences } from '../../../apps/api/src/features/email-delivery/email-delivery.types';

describe('DeliveryEligibilityService', () => {
  let service: DeliveryEligibilityService;

  beforeEach(() => {
    service = new DeliveryEligibilityService();
  });

  describe('checkEligibility', () => {
    it('should reject unverified users', () => {
      const prefs: UserPreferences = {
        userId: 'user1',
        deliveryTime: '09:00',
        timezone: 'UTC',
        newsletterEnabled: true,
        email: 'test@example.com',
        isVerified: false,
      };

      const result = service.checkEligibility(prefs);

      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('email_not_verified');
    });

    it('should reject blocked users', () => {
      const prefs: UserPreferences = {
        userId: 'user1',
        deliveryTime: '09:00',
        timezone: 'UTC',
        newsletterEnabled: true,
        email: 'test@example.com',
        isVerified: true,
      };

      const result = service.checkEligibility(prefs, true);

      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('account_blocked');
    });

    it('should reject unsubscribed users', () => {
      const prefs: UserPreferences = {
        userId: 'user1',
        deliveryTime: '09:00',
        timezone: 'UTC',
        newsletterEnabled: false,
        email: 'test@example.com',
        isVerified: true,
      };

      const result = service.checkEligibility(prefs, false);

      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('user_unsubscribed');
    });

    it('should accept eligible users', () => {
      const prefs: UserPreferences = {
        userId: 'user1',
        deliveryTime: '09:00',
        timezone: 'UTC',
        newsletterEnabled: true,
        email: 'test@example.com',
        isVerified: true,
      };

      const result = service.checkEligibility(prefs, false);

      expect(result.eligible).toBe(true);
      expect(result.reason).toBeUndefined();
    });
  });

  describe('checkEligibilityBatch', () => {
    it('should check multiple users', () => {
      const users: UserPreferences[] = [
        {
          userId: 'user1',
          deliveryTime: '09:00',
          timezone: 'UTC',
          newsletterEnabled: true,
          email: 'test1@example.com',
          isVerified: true,
        },
        {
          userId: 'user2',
          deliveryTime: '10:00',
          timezone: 'UTC',
          newsletterEnabled: true,
          email: 'test2@example.com',
          isVerified: false,
        },
      ];

      const results = service.checkEligibilityBatch(users);

      expect(results.get('user1')?.eligible).toBe(true);
      expect(results.get('user2')?.eligible).toBe(false);
    });
  });

  describe('isInDeliveryWindow', () => {
    it('should return true when current time is in delivery window', () => {
      // Test with UTC to avoid timezone issues
      const isInWindow = service.isInDeliveryWindow('09:00', 'UTC', new Date('2024-05-15T09:30:00Z'));

      expect(isInWindow).toBe(true);
    });

    it('should return false when current time is outside delivery window', () => {
      // Test with UTC to avoid timezone issues
      const isInWindow = service.isInDeliveryWindow('09:00', 'UTC', new Date('2024-05-15T14:00:00Z'));

      expect(isInWindow).toBe(false);
    });

    it('should handle edge cases at window boundaries', () => {
      // Right at start of window
      const isAtStart = service.isInDeliveryWindow('09:00', 'UTC', new Date('2024-05-15T09:00:00Z'));
      expect(isAtStart).toBe(true);

      // One minute before window
      const isBeforeStart = service.isInDeliveryWindow('09:00', 'UTC', new Date('2024-05-15T08:59:00Z'));
      expect(isBeforeStart).toBe(false);
    });
  });
});
