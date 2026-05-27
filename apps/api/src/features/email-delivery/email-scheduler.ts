/**
 * Email Delivery Scheduler
 * Orchestrates newsletter delivery and retry scheduling
 */

import { EmailLog, SendAttempt, Newsletter, DeliveryResult, DeliveryRun } from './email-delivery.types';

export interface SchedulerConfig {
  maxRetries: number;
  initialBackoffMs: number;
  maxBackoffMs: number;
  backoffMultiplier: number;
}

export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  maxRetries: 3,
  initialBackoffMs: 1000,
  maxBackoffMs: 60000,
  backoffMultiplier: 2,
};

export class EmailScheduler {
  private config: SchedulerConfig;
  private queue: Map<string, SendAttempt[]> = new Map();
  private currentRunId: string | null = null;

  constructor(config: Partial<SchedulerConfig> = {}) {
    this.config = { ...DEFAULT_SCHEDULER_CONFIG, ...config };
  }

  /**
   * Create a new delivery run
   */
  createDeliveryRun(scheduleWindow: string): DeliveryRun {
    this.currentRunId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: this.currentRunId,
      scheduleWindow,
      startedAt: new Date(),
      sentCount: 0,
      failedCount: 0,
      skippedCount: 0,
    };
  }

  /**
   * Enqueue a user for delivery
   * Returns idempotency check: true if already sent, false if queued
   */
  enqueueForDelivery(userId: string, newsletterId: string, existingLogs: EmailLog[]): { queued: boolean; alreadySent: boolean } {
    if (!this.currentRunId) {
      throw new Error('No active delivery run');
    }

    const key = `${userId}_${newsletterId}`;

    // Check idempotency: has this user already received this newsletter?
    const existingSent = existingLogs.find((log) => log.userId === userId && log.newsletterId === newsletterId && log.status === 'sent');

    if (existingSent) {
      return { queued: false, alreadySent: true };
    }

    // Queue for delivery with initial attempt
    const attempt: SendAttempt = {
      userId,
      newsletterId,
      email: '', // Will be filled in by caller
      attempt: 1,
      maxRetries: this.config.maxRetries,
      backoffMs: this.config.initialBackoffMs,
    };

    if (!this.queue.has(this.currentRunId)) {
      this.queue.set(this.currentRunId, []);
    }

    this.queue.get(this.currentRunId)!.push(attempt);

    return { queued: true, alreadySent: false };
  }

  /**
   * Get next batch of items to send
   */
  getNextBatch(runId: string, batchSize: number = 10): SendAttempt[] {
    const queue = this.queue.get(runId) || [];
    return queue.splice(0, batchSize);
  }

  /**
   * Calculate backoff time for retry
   */
  calculateBackoffMs(attempt: number): number {
    const backoffMs = this.config.initialBackoffMs * Math.pow(this.config.backoffMultiplier, attempt - 1);
    return Math.min(backoffMs, this.config.maxBackoffMs);
  }

  /**
   * Record delivery attempt result
   */
  recordDeliveryResult(runId: string, userId: string, newsletterId: string, result: DeliveryResult, attempt: number): EmailLog {
    const log: EmailLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

    return log;
  }

  /**
   * Check if should retry
   */
  shouldRetry(attempt: number, result: DeliveryResult): boolean {
    if (!result.shouldRetry || attempt >= this.config.maxRetries) {
      return false;
    }

    return true;
  }

  /**
   * Queue retry for failed delivery
   */
  queueRetry(runId: string, userId: string, newsletterId: string, email: string, attempt: number): void {
    const retryAttempt: SendAttempt = {
      userId,
      newsletterId,
      email,
      attempt: attempt + 1,
      maxRetries: this.config.maxRetries,
      backoffMs: this.calculateBackoffMs(attempt + 1),
    };

    if (!this.queue.has(runId)) {
      this.queue.set(runId, []);
    }

    this.queue.get(runId)!.push(retryAttempt);
  }

  /**
   * Get queue size for a run
   */
  getQueueSize(runId: string): number {
    return this.queue.get(runId)?.length || 0;
  }

  /**
   * Clear queue for a run
   */
  clearQueue(runId: string): void {
    this.queue.delete(runId);
  }

  /**
   * Get current run ID
   */
  getCurrentRunId(): string | null {
    return this.currentRunId;
  }
}
