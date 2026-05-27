/**
 * Unit Tests: Email Scheduler
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EmailScheduler, DEFAULT_SCHEDULER_CONFIG } from '../../../apps/api/src/features/email-delivery/email-scheduler';

describe('EmailScheduler', () => {
  let scheduler: EmailScheduler;

  beforeEach(() => {
    scheduler = new EmailScheduler();
  });

  describe('createDeliveryRun', () => {
    it('should create a new delivery run', () => {
      const run = scheduler.createDeliveryRun('09:00-10:00');

      expect(run.id).toBeTruthy();
      expect(run.scheduleWindow).toBe('09:00-10:00');
      expect(run.sentCount).toBe(0);
      expect(run.failedCount).toBe(0);
      expect(run.skippedCount).toBe(0);
    });
  });

  describe('enqueueForDelivery', () => {
    it('should enqueue a user for delivery', () => {
      scheduler.createDeliveryRun('09:00-10:00');

      const result = scheduler.enqueueForDelivery('user1', 'newsletter1', []);

      expect(result.queued).toBe(true);
      expect(result.alreadySent).toBe(false);
    });

    it('should not enqueue if already sent', () => {
      scheduler.createDeliveryRun('09:00-10:00');

      const existingLogs = [
        {
          id: 'log1',
          runId: 'run1',
          userId: 'user1',
          newsletterId: 'newsletter1',
          status: 'sent' as const,
          attempt: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = scheduler.enqueueForDelivery('user1', 'newsletter1', existingLogs);

      expect(result.queued).toBe(false);
      expect(result.alreadySent).toBe(true);
    });
  });

  describe('calculateBackoffMs', () => {
    it('should calculate exponential backoff', () => {
      const delay1 = scheduler.calculateBackoffMs(1);
      const delay2 = scheduler.calculateBackoffMs(2);
      const delay3 = scheduler.calculateBackoffMs(3);

      expect(delay1).toBe(DEFAULT_SCHEDULER_CONFIG.initialBackoffMs);
      expect(delay2).toBe(DEFAULT_SCHEDULER_CONFIG.initialBackoffMs * DEFAULT_SCHEDULER_CONFIG.backoffMultiplier);
      expect(delay3).toBeGreaterThan(delay2);
    });

    it('should cap backoff at max', () => {
      const delayX = scheduler.calculateBackoffMs(100);

      expect(delayX).toBeLessThanOrEqual(DEFAULT_SCHEDULER_CONFIG.maxBackoffMs);
    });
  });

  describe('shouldRetry', () => {
    it('should retry transient failures', () => {
      const result = { success: false, shouldRetry: true };

      expect(scheduler.shouldRetry(1, result)).toBe(true);
      expect(scheduler.shouldRetry(2, result)).toBe(true);
      expect(scheduler.shouldRetry(3, result)).toBe(false); // Max retries reached
    });

    it('should not retry non-retriable failures', () => {
      const result = { success: false, shouldRetry: false };

      expect(scheduler.shouldRetry(1, result)).toBe(false);
    });
  });
});
