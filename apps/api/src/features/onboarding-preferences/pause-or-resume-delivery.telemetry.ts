/**
 * Pause or Resume Delivery - Telemetry & Audit
 */

import type { OnboardingPreferencesTelemetry } from "./telemetry";

export class PauseOrResumeDeliveryTelemetry {
  constructor(private readonly telemetry: OnboardingPreferencesTelemetry) {}

  async trackToggle(userId: string, isNowEnabled: boolean, source: string): Promise<void> {
    if (isNowEnabled) {
      await this.telemetry.trackNewsletterResumed(userId, source);
    } else {
      await this.telemetry.trackNewsletterPaused(userId, source);
    }
  }

  async trackToggleFailure(userId: string, reason: string): Promise<void> {
    await this.telemetry.trackSaveFailed(userId, reason, "delivery-toggle");
  }
}
