/**
 * Integration: US2 - Delivery Succeeds Even When First Attempt Fails
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DeliveryResilience } from '../../../apps/api/src/features/email-delivery/delivery-succeeds-even-when-the-first-attempt-fails.service';
import { DeliveryResult, EmailLog } from '../../../apps/api/src/features/email-delivery/email-delivery.types';

describe('Integration: US2 - Delivery Succeeds Despite Failures', () => {
  let service: DeliveryResilience;

  beforeEach(() => {
    service = new DeliveryResilience();
  });

  it('contract: transient failure triggers retry', () => {
    const failedResult: DeliveryResult = {
      success: false,
      shouldRetry: true,
      errorCode: 'TIMEOUT',
    };

    expect(service.shouldRetry(failedResult, 1)).toBe(true);
    expect(service.shouldRetry(failedResult, 2)).toBe(true);
  });

  it('contract: final attempt after retries creates failed log', () => {
    const finalResult: DeliveryResult = {
      success: false,
      shouldRetry: false,
      errorCode: 'PERMANENT_ERROR',
    };

    const log = service.recordDeliveryAttempt('run1', 'user1', 'news1', 3, finalResult);

    expect(log.status).toBe('failed');
    expect(log.attempt).toBe(3);
    expect(log.errorCode).toBe('PERMANENT_ERROR');
  });

  it('contract: idempotency prevents duplicate sends', () => {
    const existingLogs: EmailLog[] = [
      {
        id: 'log1',
        runId: 'run1',
        userId: 'user1',
        newsletterId: 'news1',
        status: 'sent',
        attempt: 2,
        providerMessageId: 'msg_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const isAlreadySent = service.isAlreadySent(existingLogs, 'user1', 'news1');
    expect(isAlreadySent).toBe(true);
  });

  it('contract: each delivery attempt increments attempt count', () => {
    const log1 = service.recordDeliveryAttempt(
      'run1',
      'user1',
      'news1',
      1,
      { success: false, shouldRetry: true, errorCode: 'TIMEOUT' },
    );

    const log2 = service.recordDeliveryAttempt(
      'run1',
      'user1',
      'news1',
      2,
      { success: false, shouldRetry: true, errorCode: 'TIMEOUT' },
    );

    const log3 = service.recordDeliveryAttempt('run1', 'user1', 'news1', 3, { success: true, shouldRetry: false });

    expect(log1.attempt).toBe(1);
    expect(log2.attempt).toBe(2);
    expect(log3.attempt).toBe(3);
    expect(log3.status).toBe('sent');
  });
});
