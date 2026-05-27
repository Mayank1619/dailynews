/**
 * Newsletter Generation Telemetry & Audit
 * Tracks generation events without logging PII
 */

export interface GenerationAuditEvent {
  timestamp: Date;
  eventType: 'generation_started' | 'generation_completed' | 'generation_failed' | 'user_skipped';
  userId?: string;
  date: Date;
  details?: Record<string, any>;
}

export interface GenerationMetrics {
  totalUsers: number;
  successCount: number;
  skipCount: number;
  fallbackCount: number;
  failureCount: number;
  averageGenerationTime: number;
  startedAt: Date;
  finishedAt?: Date;
}

/**
 * Telemetry service for generation pipeline
 * Ensures PII integrity: never log userId directly, use anonymous IDs if needed
 */
export class GenerationTelemetryService {
  private events: GenerationAuditEvent[] = [];
  private metrics: GenerationMetrics;

  constructor() {
    this.metrics = {
      totalUsers: 0,
      successCount: 0,
      skipCount: 0,
      fallbackCount: 0,
      failureCount: 0,
      averageGenerationTime: 0,
      startedAt: new Date(),
    };
  }

  /**
   * Start generation run
   */
  startGeneration(date: Date): void {
    this.metrics.startedAt = new Date();
    this.logEvent({
      timestamp: new Date(),
      eventType: 'generation_started',
      date,
      details: { runId: this.generateRunId() },
    });
  }

  /**
   * Record successful generation for a user
   * Note: Never log actual userId, use hashed/anonymous ID for privacy
   */
  recordSuccess(userId: string, date: Date, generationTimeMs: number): void {
    this.metrics.successCount++;
    this.logEvent({
      timestamp: new Date(),
      eventType: 'generation_completed',
      userId: this.hashUserId(userId),
      date,
      details: { generationTimeMs },
    });
  }

  /**
   * Record skipped user (consent, no preferences, etc)
   */
  recordSkip(reason: string, date: Date): void {
    this.metrics.skipCount++;
    this.logEvent({
      timestamp: new Date(),
      eventType: 'user_skipped',
      date,
      details: { reason },
    });
  }

  /**
   * Record fallback content usage
   */
  recordFallback(): void {
    this.metrics.fallbackCount++;
  }

  /**
   * Record generation failure
   */
  recordFailure(error: string, date: Date): void {
    this.metrics.failureCount++;
    this.logEvent({
      timestamp: new Date(),
      eventType: 'generation_failed',
      date,
      details: { errorMessage: error },
    });
  }

  /**
   * Complete generation run
   */
  completeGeneration(date: Date): void {
    this.metrics.finishedAt = new Date();
    const totalProcessed = this.metrics.successCount + this.metrics.skipCount + this.metrics.failureCount;
    if (totalProcessed > 0) {
      const totalTime = this.metrics.finishedAt.getTime() - this.metrics.startedAt.getTime();
      this.metrics.averageGenerationTime = totalTime / totalProcessed;
    }
  }

  /**
   * Get metrics summary (no PII)
   */
  getMetrics(): GenerationMetrics {
    return { ...this.metrics };
  }

  /**
   * Get audit trail (anonymized)
   */
  getAuditTrail(): GenerationAuditEvent[] {
    return [...this.events];
  }

  /**
   * Log internal event
   */
  private logEvent(event: GenerationAuditEvent): void {
    this.events.push(event);
  }

  /**
   * Generate run ID for correlation
   */
  private generateRunId(): string {
    return `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Hash userId for privacy (never log raw ID)
   * In production, use crypto.createHash
   */
  private hashUserId(userId: string): string {
    // Simple hash for demo - in production use proper crypto
    return `user_${userId.substring(0, 4)}...${userId.substring(userId.length - 4)}`;
  }
}

/**
 * Global telemetry instance
 */
export const telemetryService = new GenerationTelemetryService();
