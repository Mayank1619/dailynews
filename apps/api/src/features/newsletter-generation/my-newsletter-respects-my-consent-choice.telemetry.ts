/**
 * US2: My Newsletter Respects My Consent Choice
 * Telemetry and audit tracking
 */

import { GenerationTelemetryService } from './telemetry';

export class ConsentChoiceTelemetry {
  constructor(private telemetry: GenerationTelemetryService) {}

  /**
   * Track consent check performed
   */
  trackConsentCheck(userId: string, granted: boolean, reason?: string): void {
    if (!granted) {
      this.telemetry.recordSkip(reason || 'unknown', new Date());
    }
    // In production, send to analytics service
    console.log(`Consent check: granted=${granted}, reason=${reason}`);
  }

  /**
   * Track consent status change
   */
  trackConsentUpdate(userId: string, enabled: boolean): void {
    // In production, send to analytics service
    console.log(`Consent updated: ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Track pre-flight gate result
   */
  trackPreFlightGate(userId: string, passed: boolean, reason?: string): void {
    if (!passed) {
      console.log(`Pre-flight gate failed: ${reason}`);
    } else {
      console.log('Pre-flight gate passed');
    }
  }
}
