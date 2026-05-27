/**
 * Update Preferences Anytime - Telemetry & Audit
 */

import type { OnboardingPreferencesTelemetry } from "./telemetry";

export class UpdatePreferencesAnytimeTelemetry {
  constructor(private readonly telemetry: OnboardingPreferencesTelemetry) {}

  async trackUpdate(
    userId: string,
    changedFields: string[],
    previousValues?: Record<string, unknown>
  ): Promise<void> {
    // Track audit event for compliance
    // previousValues are stored locally, not sent to telemetry (privacy-safe)
    await this.telemetry.trackPreferencesUpdated(userId, changedFields, "preferences-update");
  }

  async trackDashboardUpdate(userId: string, updatedFields: string[]): Promise<void> {
    await this.telemetry.trackPreferencesUpdated(userId, updatedFields, "dashboard-preferences");
  }
}
