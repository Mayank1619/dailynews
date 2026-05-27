/**
 * Complete First-Time Onboarding Service
 * Guides new users through preference capture
 */

import type { PreferenceProfile } from "./types";
import type { CompleteFirstTimeOnboardingRequest, CompleteFirstTimeOnboardingResponse } from "./complete-first-time-onboarding.types";
import type { IPreferencesRepository } from "./preferencesRepository";
import { PreferenceValidator } from "./validator";
import type { OnboardingPreferencesTelemetry } from "./telemetry";

export interface ICompleteFirstTimeOnboardingService {
  completeOnboarding(
    request: CompleteFirstTimeOnboardingRequest
  ): Promise<CompleteFirstTimeOnboardingResponse>;
  getOnboardingProgress(userId: string): Promise<{ step: number; completed: boolean }>;
}

export class CompleteFirstTimeOnboardingService implements ICompleteFirstTimeOnboardingService {
  constructor(
    private readonly repository: IPreferencesRepository,
    private readonly telemetry: OnboardingPreferencesTelemetry,
    private readonly validator: PreferenceValidator = new PreferenceValidator()
  ) {}

  async completeOnboarding(
    request: CompleteFirstTimeOnboardingRequest
  ): Promise<CompleteFirstTimeOnboardingResponse> {
    const { userId, topics, region, deliveryTimeLocal, timezone } = request;

    // Validate all inputs
    const validation = this.validator.validateCompletePreferences({
      topics,
      region,
      deliveryTime: deliveryTimeLocal,
      timezone
    });

    if (!validation.valid) {
      const errorMessages = validation.errors.map((e) => e.message).join("; ");
      await this.telemetry.trackValidationFailed(
        userId,
        errorMessages,
        "onboarding-complete"
      );
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    // Check if user already has preferences (should be first-time, but verify)
    const existing = await this.repository.getPreferenceProfile(userId);
    if (existing && existing.topics.length > 0) {
      throw new Error("User already has saved preferences");
    }

    try {
      // Create preference profile
      const profile: PreferenceProfile = {
        userId,
        topics,
        region,
        deliveryTimeLocal,
        timezone,
        newsletterEnabled: true,
        updatedAt: new Date().toISOString()
      };

      // Save profile
      await this.repository.savePreferenceProfile(profile);

      // Update onboarding state to completed
      await this.repository.updateOnboardingState(userId, {
        completed: true,
        step: 3
      });

      // Track successful save
      await this.telemetry.trackPreferencesSaved(userId, topics.length, "onboarding-complete");
      await this.telemetry.trackSaveSucceeded(userId, "onboarding-complete");

      return {
        profile,
        onboardingCompleted: true
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      await this.telemetry.trackSaveFailed(userId, reason, "onboarding-complete");
      throw error;
    }
  }

  async getOnboardingProgress(userId: string): Promise<{ step: number; completed: boolean }> {
    try {
      const state = await this.repository.getOnboardingStateOrDefault(userId);
      return {
        step: state.step,
        completed: state.completed
      };
    } catch (error) {
      // If error getting state, return default
      return {
        step: 1,
        completed: false
      };
    }
  }
}
