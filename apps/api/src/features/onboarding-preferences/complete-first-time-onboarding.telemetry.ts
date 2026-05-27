/**
 * Complete First-Time Onboarding - Telemetry & Audit
 */

import type { OnboardingPreferencesTelemetry } from "./telemetry";

export class CompleteFirstTimeOnboardingTelemetry {
  constructor(private readonly telemetry: OnboardingPreferencesTelemetry) {}

  async trackOnboardingFlow(userId: string, step: "started" | "step_viewed" | "step_completed", stepNumber?: number): Promise<void> {
    if (step === "started") {
      await this.telemetry.trackOnboardingStarted(userId, "onboarding-first-time");
    } else if (step === "step_viewed" || step === "step_completed") {
      // Track individual step navigation
      const source = `onboarding-step-${stepNumber}`;
      if (step === "step_completed") {
        await this.telemetry.trackOnboardingViewed(userId, source);
      }
    }
  }

  async trackPreferencesSaved(
    userId: string,
    topicCount: number,
    hasRegionDetails: boolean,
    deliveryTimeSet: boolean
  ): Promise<void> {
    await this.telemetry.trackPreferencesSaved(userId, topicCount, "onboarding-first-time");
    if (hasRegionDetails) {
      await this.telemetry.trackRegionSet(userId, "Canada", "onboarding-first-time");
    }
    if (deliveryTimeSet) {
      await this.telemetry.trackDeliveryTimeSet(userId, "onboarding-first-time");
    }
  }
}
