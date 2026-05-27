/**
 * Update Preferences Anytime Service
 * Allows users to modify saved preferences at any time
 */

import type { PreferenceProfile } from "./types";
import type { UpdatePreferencesAnytimeRequest, UpdatePreferencesAnytimeResponse } from "./update-preferences-anytime.types";
import type { IPreferencesRepository } from "./preferencesRepository";
import { PreferenceValidator } from "./validator";
import type { OnboardingPreferencesTelemetry } from "./telemetry";

export interface IUpdatePreferencesAnytimeService {
  updatePreferences(
    request: UpdatePreferencesAnytimeRequest
  ): Promise<UpdatePreferencesAnytimeResponse>;
  getPreferences(userId: string): Promise<PreferenceProfile | null>;
}

export class UpdatePreferencesAnytimeService implements IUpdatePreferencesAnytimeService {
  constructor(
    private readonly repository: IPreferencesRepository,
    private readonly telemetry: OnboardingPreferencesTelemetry,
    private readonly validator: PreferenceValidator = new PreferenceValidator()
  ) {}

  async updatePreferences(
    request: UpdatePreferencesAnytimeRequest
  ): Promise<UpdatePreferencesAnytimeResponse> {
    const { userId, topics, region, deliveryTimeLocal, timezone } = request;

    // Get existing profile
    const existing = await this.repository.getPreferenceProfile(userId);
    if (!existing) {
      throw new Error("User has no saved preferences to update");
    }

    // Track what will change
    const changedFields: (keyof PreferenceProfile)[] = [];

    // Validate partial updates - only validate fields that are being updated
    if (topics !== undefined) {
      const topicsValidation = this.validator.validateTopicSelection(topics);
      if (!topicsValidation.valid) {
        const errorMessages = topicsValidation.errors.map((e) => e.message).join("; ");
        await this.telemetry.trackValidationFailed(userId, errorMessages, "preferences-update");
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      if (JSON.stringify(topics) !== JSON.stringify(existing.topics)) {
        changedFields.push("topics");
      }
    }

    if (region !== undefined) {
      const regionValidation = this.validator.validateRegion(region);
      if (!regionValidation.valid) {
        const errorMessages = regionValidation.errors.map((e) => e.message).join("; ");
        await this.telemetry.trackValidationFailed(userId, errorMessages, "preferences-update");
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      if (JSON.stringify(region) !== JSON.stringify(existing.region)) {
        changedFields.push("region");
      }
    }

    if (deliveryTimeLocal !== undefined) {
      const timeValidation = this.validator.validateDeliveryTime(deliveryTimeLocal);
      if (!timeValidation.valid) {
        const errorMessages = timeValidation.errors.map((e) => e.message).join("; ");
        await this.telemetry.trackValidationFailed(userId, errorMessages, "preferences-update");
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      if (deliveryTimeLocal !== existing.deliveryTimeLocal) {
        changedFields.push("deliveryTimeLocal");
      }
    }

    if (timezone !== undefined) {
      const tzValidation = this.validator.validateTimezone(timezone);
      if (!tzValidation.valid) {
        const errorMessages = tzValidation.errors.map((e) => e.message).join("; ");
        await this.telemetry.trackValidationFailed(userId, errorMessages, "preferences-update");
        throw new Error(`Validation failed: ${errorMessages}`);
      }
      if (timezone !== existing.timezone) {
        changedFields.push("timezone");
      }
    }

    try {
      // If no fields actually changed, just return existing
      if (changedFields.length === 0) {
        return {
          profile: existing,
          changedFields: []
        };
      }

      // Build update object
      const updates: Partial<PreferenceProfile> = {};
      if (topics !== undefined) {
        updates.topics = topics;
      }
      if (region !== undefined) {
        updates.region = region;
      }
      if (deliveryTimeLocal !== undefined) {
        updates.deliveryTimeLocal = deliveryTimeLocal;
      }
      if (timezone !== undefined) {
        updates.timezone = timezone;
      }

      // Perform update
      const updated = await this.repository.updatePreferenceProfile(userId, updates);

      // Track the update
      await this.telemetry.trackPreferencesUpdated(
        userId,
        changedFields as string[],
        "preferences-update"
      );
      await this.telemetry.trackSaveSucceeded(userId, "preferences-update");

      return {
        profile: updated,
        changedFields: changedFields as (keyof PreferenceProfile)[]
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      await this.telemetry.trackSaveFailed(userId, reason, "preferences-update");
      throw error;
    }
  }

  async getPreferences(userId: string): Promise<PreferenceProfile | null> {
    return this.repository.getPreferenceProfile(userId);
  }
}
