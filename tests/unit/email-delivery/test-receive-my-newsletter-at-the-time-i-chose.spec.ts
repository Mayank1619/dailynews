/**
 * Unit Tests: US1 - Receive My Newsletter at Chosen Time
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ReceiveMyNewsletterAtTheTimeIChoseService } from '../../../apps/api/src/features/email-delivery/receive-my-newsletter-at-the-time-i-chose.service';
import { DeliveryEligibilityService } from '../../../apps/api/src/features/email-delivery/delivery-eligibility.service';
import { UserPreferences, Newsletter } from '../../../apps/api/src/features/email-delivery/email-delivery.types';

describe('US1: Receive My Newsletter at the Time I Chose', () => {
  let service: ReceiveMyNewsletterAtTheTimeIChoseService;
  let eligibilityService: DeliveryEligibilityService;

  beforeEach(() => {
    eligibilityService = new DeliveryEligibilityService();
    service = new ReceiveMyNewsletterAtTheTimeIChoseService(eligibilityService);
  });

  describe('scheduleDelivery', () => {
    it('should schedule delivery for eligible users', () => {
      const prefs: UserPreferences = {
        userId: 'user1',
        deliveryTime: '09:00',
        timezone: 'America/New_York',
        newsletterEnabled: true,
        email: 'test@example.com',
        isVerified: true,
      };

      const newsletter: Newsletter = {
        id: 'news1',
        status: 'generated',
        content: 'Test content',
        subject: 'Daily Paper',
        createdAt: new Date(),
        publishDate: new Date(),
      };

      const result = service.scheduleDelivery(prefs, newsletter);

      expect(result.scheduled).toBe(true);
      expect(result.deliveryId).toBe('user1_news1');
      expect(result.windowStart).toBeTruthy();
      expect(result.windowEnd).toBeTruthy();
    });

    it('should not schedule for ineligible users', () => {
      const prefs: UserPreferences = {
        userId: 'user1',
        deliveryTime: '09:00',
        timezone: 'America/New_York',
        newsletterEnabled: false,
        email: 'test@example.com',
        isVerified: true,
      };

      const newsletter: Newsletter = {
        id: 'news1',
        status: 'generated',
        content: 'Test content',
        subject: 'Daily Paper',
        createdAt: new Date(),
        publishDate: new Date(),
      };

      const result = service.scheduleDelivery(prefs, newsletter);

      expect(result.scheduled).toBe(false);
      expect(result.reason).toBe('user_unsubscribed');
    });

    it('should not schedule non-generated newsletters', () => {
      const prefs: UserPreferences = {
        userId: 'user1',
        deliveryTime: '09:00',
        timezone: 'America/New_York',
        newsletterEnabled: true,
        email: 'test@example.com',
        isVerified: true,
      };

      const newsletter: Newsletter = {
        id: 'news1',
        status: 'pending',
        content: 'Test content',
        subject: 'Daily Paper',
        createdAt: new Date(),
        publishDate: new Date(),
      };

      const result = service.scheduleDelivery(prefs, newsletter);

      expect(result.scheduled).toBe(false);
      expect(result.reason).toBe('newsletter_not_generated');
    });
  });

  describe('isWithinDeliveryWindow', () => {
    it('should detect when time is in delivery window', () => {
      const prefs: UserPreferences = {
        userId: 'user1',
        deliveryTime: '09:00',
        timezone: 'UTC',
        newsletterEnabled: true,
        email: 'test@example.com',
        isVerified: true,
      };

      const testTime = new Date('2024-05-15T09:30:00Z');
      const isInWindow = service.isWithinDeliveryWindow(prefs, testTime);

      expect(isInWindow).toBe(true);
    });
  });

  describe('calculateDeliveryWindow', () => {
    it('should calculate delivery window', () => {
      const window = service.calculateDeliveryWindow('UTC', '09:00');

      expect(window.start).toBeTruthy();
      expect(window.end).toBeTruthy();
      expect(window.end.getTime() - window.start.getTime()).toBe(60 * 60 * 1000); // 1 hour
    });
  });

  describe('getTimeZoneInfo', () => {
    it('should return timezone info', () => {
      const info = service.getTimeZoneInfo('America/New_York');

      expect(info.timezone).toBe('America/New_York');
      expect(typeof info.offset).toBe('number');
      expect(typeof info.isDST).toBe('boolean');
    });
  });
});
