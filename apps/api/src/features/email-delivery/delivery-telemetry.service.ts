/**
 * Delivery Telemetry Service
 * Aggregate telemetry and audit logging - privacy-safe metrics only
 * All PII is excluded (Constitutional Principle IV)
 */

import { EmailLog, DeliveryRun } from './email-delivery.types';

export interface DeliveryMetrics {
  timestamp: Date;
  runId: string;
  totalAttempted: number;
  totalSent: number;
  totalFailed: number;
  totalSkipped: number;
  skippedReasons: Record<string, number>;
  errorCodes: Record<string, number>;
  averageAttemptsPerSend: number;
}

export interface AuditEvent {
  timestamp: Date;
  runId: string;
  eventType: 'delivery_started' | 'delivery_completed' | 'user_eligible' | 'user_skipped' | 'send_attempted' | 'send_succeeded' | 'send_failed' | 'alert_raised';
  context: Record<string, unknown>;
}

export class DeliveryTelemetryService {
  private metrics: Map<string, DeliveryMetrics> = new Map();
  private auditLog: AuditEvent[] = [];

  /**
   * Record an email log event (privacy-safe)
   * NOTE: No PII is stored - only aggregates and non-identifying info
   */
  recordEmailLog(log: EmailLog): void {
    this.auditLog.push({
      timestamp: log.createdAt,
      runId: log.runId,
      eventType: this.getEventTypeFromLog(log),
      context: {
        status: log.status,
        attempt: log.attempt,
        reason: log.reason,
        errorCode: log.errorCode,
        // Explicitly exclude: userId, email, newsletterId content
      },
    });
  }

  /**
   * Calculate aggregated metrics for a delivery run
   */
  calculateRunMetrics(logs: EmailLog[], runId: string): DeliveryMetrics {
    const skippedReasons: Record<string, number> = {};
    const errorCodes: Record<string, number> = {};
    let totalSent = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    let totalAttempts = 0;
    let successfulSends = 0;

    for (const log of logs) {
      if (log.status === 'sent') {
        totalSent++;
        totalAttempts += log.attempt;
        successfulSends++;
      } else if (log.status === 'failed') {
        totalFailed++;
        totalAttempts += log.attempt;
        if (log.errorCode) {
          errorCodes[log.errorCode] = (errorCodes[log.errorCode] || 0) + 1;
        }
      } else if (log.status === 'skipped') {
        totalSkipped++;
        if (log.reason) {
          skippedReasons[log.reason] = (skippedReasons[log.reason] || 0) + 1;
        }
      }
    }

    const metrics: DeliveryMetrics = {
      timestamp: new Date(),
      runId,
      totalAttempted: logs.length,
      totalSent,
      totalFailed,
      totalSkipped,
      skippedReasons,
      errorCodes,
      averageAttemptsPerSend: successfulSends > 0 ? totalAttempts / successfulSends : 0,
    };

    this.metrics.set(runId, metrics);
    return metrics;
  }

  /**
   * Get metrics for a delivery run
   */
  getRunMetrics(runId: string): DeliveryMetrics | undefined {
    return this.metrics.get(runId);
  }

  /**
   * Record an audit event
   */
  recordAuditEvent(event: Omit<AuditEvent, 'timestamp'>): void {
    this.auditLog.push({
      ...event,
      timestamp: new Date(),
    });
  }

  /**
   * Get audit log for a delivery run
   */
  getAuditLog(runId: string): AuditEvent[] {
    return this.auditLog.filter((event) => event.runId === runId);
  }

  /**
   * Generate health report (operators-safe)
   */
  generateHealthReport(metrics: DeliveryMetrics): Record<string, unknown> {
    const successRate = metrics.totalAttempted > 0 ? (metrics.totalSent / metrics.totalAttempted) * 100 : 0;
    const failureRate = metrics.totalAttempted > 0 ? (metrics.totalFailed / metrics.totalAttempted) * 100 : 0;

    return {
      runId: metrics.runId,
      timestamp: metrics.timestamp,
      summary: {
        totalAttempted: metrics.totalAttempted,
        totalSent: metrics.totalSent,
        totalFailed: metrics.totalFailed,
        totalSkipped: metrics.totalSkipped,
        successRate: `${successRate.toFixed(2)}%`,
        failureRate: `${failureRate.toFixed(2)}%`,
        averageAttemptsPerSend: metrics.averageAttemptsPerSend.toFixed(2),
      },
      breakdown: {
        skippedByReason: metrics.skippedReasons,
        failuresByErrorCode: metrics.errorCodes,
      },
    };
  }

  /**
   * Check if alert should be raised
   */
  shouldRaiseAlert(metrics: DeliveryMetrics): boolean {
    const failureRate = metrics.totalAttempted > 0 ? (metrics.totalFailed / metrics.totalAttempted) * 100 : 0;

    // Alert if failure rate > 5%
    if (failureRate > 5) {
      return true;
    }

    // Alert if more than 10 failures
    if (metrics.totalFailed > 10) {
      return true;
    }

    return false;
  }

  private getEventTypeFromLog(log: EmailLog): AuditEvent['eventType'] {
    if (log.status === 'sent') {
      return 'send_succeeded';
    } else if (log.status === 'failed') {
      return 'send_failed';
    } else {
      return 'user_skipped';
    }
  }
}
