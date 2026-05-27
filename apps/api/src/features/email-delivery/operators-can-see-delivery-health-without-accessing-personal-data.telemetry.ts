/**
 * User Story 5: Operator Health Telemetry
 */

export class OperatorHealthTelemetry {
  private dashboardAccesses: Array<{ timestamp: Date; operatorId?: string; metricsRequested: string[] }> = [];

  recordDashboardAccess(metricsRequested: string[], operatorId?: string): void {
    this.dashboardAccesses.push({
      timestamp: new Date(),
      operatorId,
      metricsRequested,
    });
  }

  getAccessLog(): Array<{ timestamp: Date; operatorId?: string; metricsRequested: string[] }> {
    return [...this.dashboardAccesses];
  }
}
