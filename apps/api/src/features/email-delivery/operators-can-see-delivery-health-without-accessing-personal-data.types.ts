/**
 * User Story 5: Operators Can See Delivery Health Without Accessing Personal Data
 * Types for privacy-safe metrics
 */

export interface DeliveryHealthMetrics {
  timestamp: Date;
  runId: string;
  successRate: number;
  failureRate: number;
  totalSent: number;
  totalFailed: number;
  totalSkipped: number;
  averageAttemptsPerSend: number;
  skippedReasons: Record<string, number>;
  errorCodes: Record<string, number>;
}

export interface OperatorDashboard {
  timestamp: Date;
  currentRuns: Array<{ runId: string; status: 'in_progress' | 'completed'; metrics: DeliveryHealthMetrics }>;
  aggregatedMetrics: {
    last24hSuccessRate: number;
    last24hFailureRate: number;
    alertCount: number;
  };
}
