/**
 * Integration: US5 - Operators See Health Without PII
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { OperatorsCanSeeDeliveryHealthService } from '../../../apps/api/src/features/email-delivery/operators-can-see-delivery-health-without-accessing-personal-data.service';
import { EmailLog } from '../../../apps/api/src/features/email-delivery/email-delivery.types';

describe('Integration: US5 - Operators See Health Without PII', () => {
  let service: OperatorsCanSeeDeliveryHealthService;

  beforeEach(() => {
    service = new OperatorsCanSeeDeliveryHealthService();
  });

  it('contract: metrics are privacy-safe', () => {
    const logs: EmailLog[] = [
      {
        id: 'log1',
        runId: 'run1',
        userId: 'user_sensitive_data',
        newsletterId: 'news1',
        status: 'sent',
        attempt: 1,
        providerMessageId: 'msg_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'log2',
        runId: 'run1',
        userId: 'another_secret_user',
        newsletterId: 'news1',
        status: 'failed',
        attempt: 2,
        errorCode: 'TIMEOUT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const metrics = service.generateHealthMetrics(logs, 'run1');
    const sanitized = service.sanitizeMetrics(metrics);

    // Verify no PII in sanitized output
    const outputStr = JSON.stringify(sanitized);
    expect(outputStr).not.toContain('user_sensitive_data');
    expect(outputStr).not.toContain('another_secret_user');
    expect(outputStr).not.toContain('msg_123');

    // Verify aggregate counts are present
    expect(sanitized.totalSent).toBe(1);
    expect(sanitized.totalFailed).toBe(1);
  });

  it('contract: dashboard aggregates across runs', () => {
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
        runId: 'run2',
        userId: 'user2',
        newsletterId: 'news1',
        status: 'sent',
        attempt: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const dashboard = service.generateDashboard(logs, [
      { runId: 'run1', status: 'completed' },
      { runId: 'run2', status: 'completed' },
    ]);

    expect(dashboard.currentRuns.length).toBe(2);
    expect(dashboard.aggregatedMetrics.last24hSuccessRate).toBe(100);
  });

  it('contract: operator dashboard alerts on high failure rate', () => {
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
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `log_fail_${i}`,
        runId: 'run1',
        userId: `user_${i}`,
        newsletterId: 'news1',
        status: 'failed' as const,
        attempt: 2,
        errorCode: 'ERROR',
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    ];

    const dashboard = service.generateDashboard(logs, [{ runId: 'run1', status: 'completed' }]);

    // High failure rate should trigger alert
    const failureRate = dashboard.currentRuns[0].metrics.failureRate;
    expect(failureRate).toBeGreaterThan(5); // Greater than 5% threshold
    expect(dashboard.aggregatedMetrics.alertCount).toBeGreaterThan(0);
  });
});
