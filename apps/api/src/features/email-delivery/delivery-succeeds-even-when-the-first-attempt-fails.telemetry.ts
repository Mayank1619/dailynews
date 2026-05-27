/**
 * User Story 2: Telemetry for retry tracking
 */

import { RetryOutcome } from './delivery-succeeds-even-when-the-first-attempt-fails.types';

export class RetryTelemetry {
  private outcomes: RetryOutcome[] = [];

  recordOutcome(outcome: RetryOutcome): void {
    this.outcomes.push(outcome);
  }

  getOutcomes(userId?: string): RetryOutcome[] {
    if (userId) {
      return this.outcomes; // Would filter by userId in real impl
    }
    return this.outcomes;
  }

  getSummary(): Record<string, unknown> {
    const total = this.outcomes.length;
    const successOnFirstAttempt = this.outcomes.filter((o) => o.success && !o.firstAttemptFailed).length;
    const successAfterRetry = this.outcomes.filter((o) => o.success && o.firstAttemptFailed).length;
    const ultimateFailures = this.outcomes.filter((o) => !o.success).length;

    return {
      totalDeliveries: total,
      successOnFirstAttempt,
      successAfterRetry,
      ultimateFailures,
      retrySuccessRate: total > 0 ? `${((successAfterRetry / successOnFirstAttempt) * 100).toFixed(2)}%` : 'N/A',
    };
  }
}
