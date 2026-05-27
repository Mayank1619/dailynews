/**
 * User Story 2: Delivery Succeeds Even When the First Attempt Fails
 * Retry logic with exponential backoff
 */

import { SendAttempt, DeliveryResult, EmailLog } from './email-delivery.types';

export interface RetryStrategy {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  shouldRetry: (result: DeliveryResult, attempt: number) => boolean;
}

export const DEFAULT_RETRY_STRATEGY: RetryStrategy = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  shouldRetry: (result: DeliveryResult, attempt: number) => {
    return result.shouldRetry && attempt < 3;
  },
};

export class DeliveryResilience {
  private retryStrategy: RetryStrategy;

  constructor(strategy: Partial<RetryStrategy> = {}) {
    this.retryStrategy = { ...DEFAULT_RETRY_STRATEGY, ...strategy };
  }

  /**
   * Calculate delay for next retry attempt
   */
  calculateRetryDelay(attempt: number): number {
    const delay = this.retryStrategy.initialDelayMs * Math.pow(this.retryStrategy.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.retryStrategy.maxDelayMs);
  }

  /**
   * Determine if should retry based on result and attempt count
   */
  shouldRetry(result: DeliveryResult, attempt: number): boolean {
    return this.retryStrategy.shouldRetry(result, attempt);
  }

  /**
   * Classify error as transient or permanent
   */
  isTransientError(errorCode?: string): boolean {
    if (!errorCode) return true; // Assume transient if no code

    const transientErrors = ['TIMEOUT', 'RATE_LIMIT', 'SERVICE_UNAVAILABLE', 'NETWORK_ERROR', 'TEMPORARY_FAILURE'];

    return transientErrors.includes(errorCode);
  }

  /**
   * Create retry attempt from failed attempt
   */
  createRetryAttempt(original: SendAttempt, previousResult: DeliveryResult): SendAttempt | null {
    if (!this.shouldRetry(previousResult, original.attempt)) {
      return null;
    }

    return {
      ...original,
      attempt: original.attempt + 1,
      backoffMs: this.calculateRetryDelay(original.attempt),
    };
  }

  /**
   * Record delivery attempt
   */
  recordDeliveryAttempt(
    runId: string,
    userId: string,
    newsletterId: string,
    attempt: number,
    result: DeliveryResult,
  ): EmailLog {
    return {
      id: `log_${Date.now()}`,
      runId,
      userId,
      newsletterId,
      status: result.success ? 'sent' : 'failed',
      attempt,
      providerMessageId: result.messageId,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Check if delivery logging shows idempotency (already sent)
   */
  isAlreadySent(logs: EmailLog[], userId: string, newsletterId: string): boolean {
    return logs.some((log) => log.userId === userId && log.newsletterId === newsletterId && log.status === 'sent');
  }

  /**
   * Get latest attempt for a delivery
   */
  getLatestAttempt(logs: EmailLog[], userId: string, newsletterId: string): EmailLog | undefined {
    const relevant = logs.filter((log) => log.userId === userId && log.newsletterId === newsletterId);
    return relevant.length > 0 ? relevant[relevant.length - 1] : undefined;
  }
}
