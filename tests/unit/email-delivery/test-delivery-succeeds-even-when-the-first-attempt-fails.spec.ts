/**
 * Unit Tests: US2 - Delivery Succeeds Even When First Attempt Fails
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DeliveryResilience } from '../../../apps/api/src/features/email-delivery/delivery-succeeds-even-when-the-first-attempt-fails.service';
import { DeliveryResult } from '../../../apps/api/src/features/email-delivery/email-delivery.types';

describe('US2: Delivery Succeeds Even When First Attempt Fails', () => {
  let service: DeliveryResilience;

  beforeEach(() => {
    service = new DeliveryResilience();
  });

  describe('calculateRetryDelay', () => {
    it('should calculate exponential backoff', () => {
      const delay1 = service.calculateRetryDelay(1);
      const delay2 = service.calculateRetryDelay(2);

      expect(delay2).toBeGreaterThan(delay1);
    });
  });

  describe('shouldRetry', () => {
    it('should retry transient failures', () => {
      const result: DeliveryResult = {
        success: false,
        shouldRetry: true,
        errorCode: 'TIMEOUT',
      };

      expect(service.shouldRetry(result, 1)).toBe(true);
      expect(service.shouldRetry(result, 2)).toBe(true);
      expect(service.shouldRetry(result, 3)).toBe(false);
    });

    it('should not retry permanent failures', () => {
      const result: DeliveryResult = {
        success: false,
        shouldRetry: false,
        errorCode: 'INVALID_EMAIL',
      };

      expect(service.shouldRetry(result, 1)).toBe(false);
    });
  });

  describe('isTransientError', () => {
    it('should classify transient errors', () => {
      expect(service.isTransientError('TIMEOUT')).toBe(true);
      expect(service.isTransientError('RATE_LIMIT')).toBe(true);
      expect(service.isTransientError('SERVICE_UNAVAILABLE')).toBe(true);
    });

    it('should classify permanent errors', () => {
      expect(service.isTransientError('INVALID_EMAIL')).toBe(false);
      expect(service.isTransientError('UNKNOWN_ERROR')).toBe(false);
    });
  });

  describe('isAlreadySent', () => {
    it('should detect if delivery already sent', () => {
      const logs = [
        {
          id: 'log1',
          runId: 'run1',
          userId: 'user1',
          newsletterId: 'news1',
          status: 'sent' as const,
          attempt: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      expect(service.isAlreadySent(logs, 'user1', 'news1')).toBe(true);
      expect(service.isAlreadySent(logs, 'user2', 'news1')).toBe(false);
    });
  });
});
