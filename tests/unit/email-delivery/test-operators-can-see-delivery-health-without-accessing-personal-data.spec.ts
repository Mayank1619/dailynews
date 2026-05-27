/**
 * Unit Tests: US5 - Operators Can See Health Without PII
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { OperatorsCanSeeDeliveryHealthService } from '../../../apps/api/src/features/email-delivery/operators-can-see-delivery-health-without-accessing-personal-data.service';
import { EmailLog } from '../../../apps/api/src/features/email-delivery/email-delivery.types';

describe('US5: Operators Can See Delivery Health Without Accessing Personal Data', () => {
  let service: OperatorsCanSeeDeliveryHealthService;

  beforeEach(() => {
    service = new OperatorsCanSeeDeliveryHealthService();
  });

  describe('generateHealthMetrics', () => {
    it('should generate privacy-safe metrics', () => {
      const logs: EmailLog[] = [
        {
          id: 'log1',
          runId: 'run1',
          userId: 'user1',
          newsletterId: 'news1',
          status: 'sent',
          attempt: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'log2',
          runId: 'run1',
          userId: 'user2',
          newsletterId: 'news1',
          status: 'failed',
          attempt: 2,
          errorCode: 'TIMEOUT',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'log3',
          runId: 'run1',
          userId: 'user3',
          newsletterId: 'news1',
          status: 'skipped',
          attempt: 1,
          reason: 'user_unsubscribed',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const metrics = service.generateHealthMetrics(logs, 'run1');

      expect(metrics.totalSent).toBe(1);
      expect(metrics.totalFailed).toBe(1);
      expect(metrics.totalSkipped).toBe(1);
      expect(Math.round(metrics.successRate)).toBe(33);
      expect(metrics.errorCodes['TIMEOUT']).toBe(1);
      expect(metrics.skippedReasons['user_unsubscribed']).toBe(1);
    });
  });

  describe('generateDashboard', () => {
    it('should generate operator dashboard', () => {
      const logs: EmailLog[] = [
        {
          id: 'log1',
          runId: 'run1',
          userId: 'user1',
          newsletterId: 'news1',
          status: 'sent',
          attempt: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const dashboard = service.generateDashboard(logs, [{ runId: 'run1', status: 'completed' }]);

      expect(dashboard.currentRuns.length).toBe(1);
      expect(dashboard.aggregatedMetrics).toBeTruthy();
    });
  });

  describe('sanitizeMetrics', () => {
    it('should ensure no PII in sanitized metrics', () => {
      const logs: EmailLog[] = [
        {
          id: 'log1',
          runId: 'run1',
          userId: 'user1',
          newsletterId: 'news1',
          status: 'sent',
          attempt: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const metrics = service.generateHealthMetrics(logs, 'run1');
      const sanitized = service.sanitizeMetrics(metrics);

      // Ensure no user IDs or emails in sanitized output
      expect(JSON.stringify(sanitized)).not.toContain('user');
      expect(JSON.stringify(sanitized)).not.toContain('@');
      expect(sanitized.runId).toBe('run1');
      expect(sanitized.successRate).toBe('100.00%');
    });
  });
});
