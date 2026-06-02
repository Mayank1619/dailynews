/**
 * Unit Tests - Complete First-Time Onboarding
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { CompleteFirstTimeOnboardingService } from "../../../apps/api/src/features/onboarding-preferences/complete-first-time-onboarding.service";
import { MockPreferencesRepository } from "../../../apps/api/src/features/onboarding-preferences/preferencesRepository";
import { OnboardingPreferencesTelemetry } from "../../../apps/api/src/features/onboarding-preferences/telemetry";
import { PreferenceValidator } from "../../../apps/api/src/features/onboarding-preferences/validator";
import type { CompleteFirstTimeOnboardingRequest } from "../../../apps/api/src/features/onboarding-preferences/complete-first-time-onboarding.types";

describe("Complete First-Time Onboarding Service", () => {
  let service: CompleteFirstTimeOnboardingService;
  let repository: MockPreferencesRepository;
  let telemetry: OnboardingPreferencesTelemetry;
  let validator: PreferenceValidator;

  beforeEach(() => {
    repository = new MockPreferencesRepository();
    telemetry = new OnboardingPreferencesTelemetry(vi.fn());
    validator = new PreferenceValidator();
    service = new CompleteFirstTimeOnboardingService(repository, telemetry, validator);
  });

  describe("completeOnboarding", () => {
    it("should save preferences successfully for a new user", async () => {
      const request: CompleteFirstTimeOnboardingRequest = {
        userId: "user123",
        topics: ["Technology", "Business"],
        region: { country: "Canada", province: "Ontario" },
        deliveryTimeLocal: "08:00",
        timezone: "America/Toronto"
      };

      const response = await service.completeOnboarding(request);

      expect(response.profile.userId).toBe("user123");
      expect(response.profile.topics).toEqual(["Technology", "Business"]);
      expect(response.profile.newsletterEnabled).toBe(true);
      expect(response.onboardingCompleted).toBe(true);
    });

    it("should reject onboarding with no topics selected", async () => {
      const request: CompleteFirstTimeOnboardingRequest = {
        userId: "user123",
        topics: [],
        region: { country: "Canada" },
        deliveryTimeLocal: "08:00",
        timezone: "America/Toronto"
      };

      await expect(service.completeOnboarding(request)).rejects.toThrow(
        /At least one topic must be selected/
      );
    });

    it("should reject onboarding with invalid delivery time", async () => {
      const request: CompleteFirstTimeOnboardingRequest = {
        userId: "user123",
        topics: ["Technology"],
        region: { country: "Canada" },
        deliveryTimeLocal: "25:00",
        timezone: "America/Toronto"
      };

      await expect(service.completeOnboarding(request)).rejects.toThrow(
        /Delivery time must be in HH:MM format/
      );
    });

    it("should reject onboarding if user already has preferences", async () => {
      const userId = "user123";
      
      // Create initial preferences
      await repository.savePreferenceProfile({
        userId,
        topics: ["Technology"],
        region: { country: "Canada" },
        deliveryTimeLocal: "08:00",
        timezone: "America/Toronto",
        newsletterEnabled: true,
        updatedAt: new Date().toISOString()
      });

      const request: CompleteFirstTimeOnboardingRequest = {
        userId,
        topics: ["Business"],
        region: { country: "Canada" },
        deliveryTimeLocal: "09:00",
        timezone: "America/Toronto"
      };

      await expect(service.completeOnboarding(request)).rejects.toThrow(
        /User already has saved preferences/
      );
    });
  });

  describe("getOnboardingProgress", () => {
    it("should return current onboarding progress", async () => {
      const userId = "user123";
      
      // Set up partial onboarding
      await repository.updateOnboardingState(userId, { step: 2, completed: false });

      const progress = await service.getOnboardingProgress(userId);

      expect(progress.step).toBe(2);
      expect(progress.completed).toBe(false);
    });

    it("should return default progress for new user", async () => {
      const progress = await service.getOnboardingProgress("newUser");

      expect(progress.step).toBe(1);
      expect(progress.completed).toBe(false);
    });
  });

  describe("Validation", () => {
    it("should validate topic format correctly", () => {
      const validationValid = validator.validateTopicSelection(["Technology", "Business"]);
      expect(validationValid.valid).toBe(true);

      const validationInvalid = validator.validateTopicSelection(["InvalidTopic"]);
      expect(validationInvalid.valid).toBe(false);
      expect(validationInvalid.errors.length).toBeGreaterThan(0);
    });

    it("should validate delivery time format", () => {
      const validTime = validator.validateDeliveryTime("08:00");
      expect(validTime.valid).toBe(true);

      const invalidTime = validator.validateDeliveryTime("25:00");
      expect(invalidTime.valid).toBe(false);

      const invalidFormat = validator.validateDeliveryTime("8am");
      expect(invalidFormat.valid).toBe(false);
    });

    it("should validate region correctly", () => {
      const validRegion = validator.validateRegion({ country: "Canada", province: "Ontario" });
      expect(validRegion.valid).toBe(true);

      const invalidRegion = validator.validateRegion(null);
      expect(invalidRegion.valid).toBe(false);
    });
  });
});
