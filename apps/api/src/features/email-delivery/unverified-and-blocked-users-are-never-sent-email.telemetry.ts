/**
 * User Story 4: Eligibility Enforcement Telemetry
 */

export class EligibilityTelemetry {
  private checks: Array<{ userId: string; passed: boolean; reason?: string; timestamp: Date }> = [];

  recordCheck(userId: string, passed: boolean, reason?: string): void {
    this.checks.push({
      userId,
      passed,
      reason,
      timestamp: new Date(),
    });
  }

  getSummary(): Record<string, unknown> {
    const passed = this.checks.filter((c) => c.passed).length;
    const failed = this.checks.length - passed;
    const failureReasons: Record<string, number> = {};

    this.checks.forEach((c) => {
      if (!c.passed && c.reason) {
        failureReasons[c.reason] = (failureReasons[c.reason] || 0) + 1;
      }
    });

    return {
      totalChecks: this.checks.length,
      passed,
      failed,
      passRate: this.checks.length > 0 ? `${(passed / this.checks.length) * 100}%` : 'N/A',
      failureReasons,
    };
  }
}
