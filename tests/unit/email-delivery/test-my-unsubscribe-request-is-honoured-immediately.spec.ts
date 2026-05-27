/**
 * Unit Tests: US3 - Unsubscribe Honored Immediately
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MyUnsubscribeRequestIsHonouredImmediatelyService } from '../../../apps/api/src/features/email-delivery/my-unsubscribe-request-is-honoured-immediately.service';
import { UserPreferences } from '../../../apps/api/src/features/email-delivery/email-delivery.types';

describe('US3: My Unsubscribe Request Is Honoured Immediately', () => {
  let service: MyUnsubscribeRequestIsHonouredImmediatelyService;

  beforeEach(() => {
    service = new MyUnsubscribeRequestIsHonouredImmediatelyService();
  });

  describe('processUnsubscribe', () => {
    it('should process unsubscribe request', () => {
      const prefs: UserPreferences = {
        userId: 'user1',
        email: 'test@example.com',
        deliveryTime: '09:00',
        timezone: 'UTC',
        newsletterEnabled: true,
        isVerified: true,
      };

      const result = service.processUnsubscribe(
        {
          userId: 'user1',
          requestedAt: new Date(),
          source: 'email_link',
        },
        prefs,
      );

      expect(result.success).toBe(true);
      expect(result.unsubscribed).toBe(true);
      expect(result.previousState).toBe(true);
    });
  });

  describe('processResubscribe', () => {
    it('should process resubscribe request', () => {
      const prefs: UserPreferences = {
        userId: 'user1',
        email: 'test@example.com',
        deliveryTime: '09:00',
        timezone: 'UTC',
        newsletterEnabled: false,
        isVerified: true,
      };

      const result = service.processResubscribe('user1', prefs);

      expect(result.success).toBe(true);
      expect(result.unsubscribed).toBe(false);
      expect(result.previousState).toBe(false);
    });
  });

  describe('generateUnsubscribeLink', () => {
    it('should generate valid unsubscribe link', () => {
      const link = service.generateUnsubscribeLink('user1', 'https://example.com');

      expect(link).toContain('https://example.com');
      expect(link).toContain('/api/email/unsubscribe');
      expect(link).toContain('token=');
    });
  });

  describe('validateUnsubscribeToken', () => {
    it('should validate unsubscribe token', () => {
      const token = Buffer.from('user1:1234567890').toString('base64');
      const isValid = service.validateUnsubscribeToken(token, 'user1');

      expect(isValid).toBe(true);
    });

    it('should reject invalid tokens', () => {
      const token = Buffer.from('user2:1234567890').toString('base64');
      const isValid = service.validateUnsubscribeToken(token, 'user1');

      expect(isValid).toBe(false);
    });
  });
});
