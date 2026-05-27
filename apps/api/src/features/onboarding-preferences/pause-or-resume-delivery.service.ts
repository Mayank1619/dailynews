/**
 * Pause or Resume Delivery Service
 * Allows users to temporarily pause newsletter delivery without losing preferences
 */

import type { PreferenceProfile } from "./types";
import type { PauseOrResumeDeliveryRequest, PauseOrResumeDeliveryResponse } from "./pause-or-resume-delivery.types";
import type { IPreferencesRepository } from "./preferencesRepository";
import type { OnboardingPreferencesTelemetry } from "./telemetry";

export interface IPauseOrResumeDeliveryService {
  toggleDelivery(request: PauseOrResumeDeliveryRequest): Promise<PauseOrResumeDeliveryResponse>;
  getDeliveryStatus(userId: string): Promise<boolean>;
}

export class PauseOrResumeDeliveryService implements IPauseOrResumeDeliveryService {
  constructor(
    private readonly repository: IPreferencesRepository,
    private readonly telemetry: OnboardingPreferencesTelemetry
  ) {}

  async toggleDelivery(
    request: PauseOrResumeDeliveryRequest
  ): Promise<PauseOrResumeDeliveryResponse> {
    const { userId, enabled } = request;

    // Get existing profile
    const existing = await this.repository.getPreferenceProfile(userId);
    if (!existing) {
      throw new Error("User has no saved preferences");
    }

    const previouslyEnabled = existing.newsletterEnabled;

    // If already in desired state, just return
    if (previouslyEnabled === enabled) {
      return {
        profile: existing,
        deliveryEnabled: enabled,
        previouslyEnabled
      };
    }

    try {
      // Update newsletter enabled flag
      const updated = await this.repository.updatePreferenceProfile(userId, {
        newsletterEnabled: enabled
      });

      // Track the toggle
      if (enabled) {
        await this.telemetry.trackNewsletterResumed(userId, "delivery-toggle");
      } else {
        await this.telemetry.trackNewsletterPaused(userId, "delivery-toggle");
      }

      await this.telemetry.trackSaveSucceeded(userId, "delivery-toggle");

      return {
        profile: updated,
        deliveryEnabled: enabled,
        previouslyEnabled
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      await this.telemetry.trackSaveFailed(userId, reason, "delivery-toggle");
      throw error;
    }
  }

  async getDeliveryStatus(userId: string): Promise<boolean> {
    const profile = await this.repository.getPreferenceProfile(userId);
    return profile?.newsletterEnabled ?? false;
  }
}
