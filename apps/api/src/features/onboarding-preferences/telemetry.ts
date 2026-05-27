/**
 * Onboarding Preferences - Telemetry
 * Privacy-safe events for preference management lifecycle
 */

export type OnboardingPreferencesTelemetryEvent = {
  feature: "onboarding-preferences";
  event:
    | "onboarding_viewed"
    | "onboarding_started"
    | "topic_selected"
    | "region_set"
    | "delivery_time_set"
    | "preferences_saved"
    | "preferences_updated"
    | "newsletter_paused"
    | "newsletter_resumed"
    | "validation_failed"
    | "save_failed"
    | "save_succeeded";
  occurredAt: string;
  userId: string; // Hashed or normalized
  metadata: Record<string, string | number | boolean>;
};

export type PreferencesTelemetrySink = (
  event: OnboardingPreferencesTelemetryEvent
) => void | Promise<void>;

export class OnboardingPreferencesTelemetry {
  constructor(
    private readonly sink: PreferencesTelemetrySink = (event) =>
      console.info(`[OnboardingPreferences] ${JSON.stringify(event)}`)
  ) {}

  async trackOnboardingViewed(userId: string, source: string): Promise<void> {
    await this.sink({
      feature: "onboarding-preferences",
      event: "onboarding_viewed",
      occurredAt: new Date().toISOString(),
      userId,
      metadata: { source }
    });
  }

  async trackOnboardingStarted(userId: string, source: string): Promise<void> {
    await this.sink({
      feature: "onboarding-preferences",
      event: "onboarding_started",
      occurredAt: new Date().toISOString(),
      userId,
      metadata: { source }
    });
  }

  async trackTopicSelected(
    userId: string,
    topicCount: number,
    source: string
  ): Promise<void> {
    await this.sink({
      feature: "onboarding-preferences",
      event: "topic_selected",
      occurredAt: new Date().toISOString(),
      userId,
      metadata: { topicCount, source }
    });
  }

  async trackRegionSet(userId: string, country: string, source: string): Promise<void> {
    await this.sink({
      feature: "onboarding-preferences",
      event: "region_set",
      occurredAt: new Date().toISOString(),
      userId,
      metadata: { country, source }
    });
  }

  async trackDeliveryTimeSet(userId: string, source: string): Promise<void> {
    await this.sink({
      feature: "onboarding-preferences",
      event: "delivery_time_set",
      occurredAt: new Date().toISOString(),
      userId,
      metadata: { source }
    });
  }

  async trackPreferencesSaved(
    userId: string,
    topicCount: number,
    source: string
  ): Promise<void> {
    await this.sink({
      feature: "onboarding-preferences",
      event: "preferences_saved",
      occurredAt: new Date().toISOString(),
      userId,
      metadata: { topicCount, source, action: "save" }
    });
  }

  async trackPreferencesUpdated(
    userId: string,
    changedFields: string[],
    source: string
  ): Promise<void> {
    await this.sink({
      feature: "onboarding-preferences",
      event: "preferences_updated",
      occurredAt: new Date().toISOString(),
      userId,
      metadata: {
        changedFieldCount: changedFields.length,
        source,
        action: "update"
      }
    });
  }

  async trackNewsletterPaused(userId: string, source: string): Promise<void> {
    await this.sink({
      feature: "onboarding-preferences",
      event: "newsletter_paused",
      occurredAt: new Date().toISOString(),
      userId,
      metadata: { source }
    });
  }

  async trackNewsletterResumed(userId: string, source: string): Promise<void> {
    await this.sink({
      feature: "onboarding-preferences",
      event: "newsletter_resumed",
      occurredAt: new Date().toISOString(),
      userId,
      metadata: { source }
    });
  }

  async trackValidationFailed(
    userId: string,
    reason: string,
    source: string
  ): Promise<void> {
    await this.sink({
      feature: "onboarding-preferences",
      event: "validation_failed",
      occurredAt: new Date().toISOString(),
      userId,
      metadata: { reason, source }
    });
  }

  async trackSaveFailed(userId: string, reason: string, source: string): Promise<void> {
    await this.sink({
      feature: "onboarding-preferences",
      event: "save_failed",
      occurredAt: new Date().toISOString(),
      userId,
      metadata: { reason, source }
    });
  }

  async trackSaveSucceeded(userId: string, source: string): Promise<void> {
    await this.sink({
      feature: "onboarding-preferences",
      event: "save_succeeded",
      occurredAt: new Date().toISOString(),
      userId,
      metadata: { source }
    });
  }
}
