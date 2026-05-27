/**
 * User Story 5: Operators Can See Delivery Health Without Accessing Personal Data
 * Privacy-safe health dashboard service
 */

import { DeliveryHealthMetrics, OperatorDashboard } from './operators-can-see-delivery-health-without-accessing-personal-data.types';
import { EmailLog } from './email-delivery.types';

export class OperatorsCanSeeDeliveryHealthService {
  /**
   * Generate privacy-safe metrics from logs
   * NOTE: Does NOT include user IDs, emails, or any PII
   */
  generateHealthMetrics(logs: EmailLog[], runId: string): DeliveryHealthMetrics {
    const sent = logs.filter((l) => l.status === 'sent').length;
    const failed = logs.filter((l) => l.status === 'failed').length;
    const skipped = logs.filter((l) => l.status === 'skipped').length;
    const total = logs.length;

    const successRate = total > 0 ? (sent / total) * 100 : 0;
    const failureRate = total > 0 ? (failed / total) * 100 : 0;

    const skippedReasons: Record<string, number> = {};
    const errorCodes: Record<string, number> = {};
    let totalAttempts = 0;

    logs.forEach((log) => {
      totalAttempts += log.attempt;

      if (log.status === 'skipped' && log.reason) {
        skippedReasons[log.reason] = (skippedReasons[log.reason] || 0) + 1;
      }

      if (log.status === 'failed' && log.errorCode) {
        errorCodes[log.errorCode] = (errorCodes[log.errorCode] || 0) + 1;
      }
    });

    const averageAttempts = sent > 0 ? totalAttempts / sent : 0;

    return {
      timestamp: new Date(),
      runId,
      successRate,
      failureRate,
      totalSent: sent,
      totalFailed: failed,
      totalSkipped: skipped,
      averageAttemptsPerSend: averageAttempts,
      skippedReasons,
      errorCodes,
    };
  }

  /**
   * Generate operator dashboard with aggregate metrics
   */
  generateDashboard(
    allLogs: EmailLog[],
    currentRuns: Array<{ runId: string; status: 'in_progress' | 'completed' }>,
  ): OperatorDashboard {
    const runMetrics = currentRuns.map((run) => {
      const runLogs = allLogs.filter((log) => log.runId === run.runId);
      return {
        runId: run.runId,
        status: run.status,
        metrics: this.generateHealthMetrics(runLogs, run.runId),
      };
    });

    // Calculate 24h averages
    const last24hAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogs = allLogs.filter((log) => log.createdAt.getTime() > last24hAgo.getTime());
    const recentSent = recentLogs.filter((l) => l.status === 'sent').length;
    const recentFailed = recentLogs.filter((l) => l.status === 'failed').length;
    const recentTotal = recentLogs.length;

    return {
      timestamp: new Date(),
      currentRuns: runMetrics,
      aggregatedMetrics: {
        last24hSuccessRate: recentTotal > 0 ? (recentSent / recentTotal) * 100 : 0,
        last24hFailureRate: recentTotal > 0 ? (recentFailed / recentTotal) * 100 : 0,
        alertCount: runMetrics.filter((r) => r.metrics.failureRate > 5).length,
      },
    };
  }

  /**
   * Sanitize metrics for public exposure
   * Ensure no PII leaks in dashboard
   */
  sanitizeMetrics(metrics: DeliveryHealthMetrics): Record<string, unknown> {
    return {
      runId: metrics.runId,
      timestamp: metrics.timestamp,
      successRate: `${metrics.successRate.toFixed(2)}%`,
      failureRate: `${metrics.failureRate.toFixed(2)}%`,
      totalSent: metrics.totalSent,
      totalFailed: metrics.totalFailed,
      totalSkipped: metrics.totalSkipped,
      averageAttemptsPerSend: metrics.averageAttemptsPerSend.toFixed(2),
      topSkipReasons: Object.entries(metrics.skippedReasons).slice(0, 5).map(([reason, count]) => ({ reason, count })),
      topErrorCodes: Object.entries(metrics.errorCodes).slice(0, 5).map(([code, count]) => ({ code, count })),
    };
  }
}
