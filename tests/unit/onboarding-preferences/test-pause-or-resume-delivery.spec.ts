/**
 * Unit Tests - Pause or Resume Delivery
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { PauseOrResumeDeliveryService } from "../../../api/src/features/onboarding-preferences/pause-or-resume-delivery.service";
import { MockPreferencesRepository } from "../../../api/src/features/onboarding-preferences/preferencesRepository";
import { OnboardingPreferencesTelemetry } from "../../../api/src/features/onboarding-preferences/telemetry";
import type { PreferenceProfile } from "../../../api/src/features/onboarding-preferences/types";

describe("Pause or Resume Delivery Service", () => {
  let service: PauseOrResumeDeliveryService;
  let repository: MockPreferencesRepository;
  let telemetry: OnboardingPreferencesTelemetry;

  beforeEach(() => {
    repository = new MockPreferencesRepository();
    telemetry = new OnboardingPreferencesTelemetry(vi.fn());
    service = new PauseOrResumeDeliveryService(repository, telemetry);
  });

  describe("toggleDelivery", () => {
    beforeEach(async () => {
      // Set up existing preferences
      const existing: PreferenceProfile = {
        userId: "user123",
        topics: ["Technology"],
        region: { country: "Canada" },
        deliveryTimeLocal: "08:00",
        timezone: "America/Toronto",
        newsletterEnabled: true,
        updatedAt: new Date().toISOString()
      };
      await repository.savePreferenceProfile(existing);
    });

    it("should pause newsletter delivery", async () => {
      const response = await service.toggleDelivery({
        userId: "user123",
        enabled: false
      });

      expect(response.profile.newsletterEnabled).toBe(false);
      expect(response.deliveryEnabled).toBe(false);
      expect(response.previouslyEnabled).toBe(true);
    });

    it("should resume newsletter delivery", async () => {
      // First pause
      await service.toggleDelivery({
        userId: "user123",
        enabled: false
      });

      // Then resume
      const response = await service.toggleDelivery({
        userId: "user123",
        enabled: true
      });

      expect(response.profile.newsletterEnabled).toBe(true);
      expect(response.deliveryEnabled).toBe(true);
      expect(response.previouslyEnabled).toBe(false);
    });

    it("should preserve preferences when pausing", async () => {
      const before = await repository.getPreferenceProfile("user123");

      await service.toggleDelivery({
        userId: "user123",
        enabled: false
      });

      const after = await repository.getPreferenceProfile("user123");

      // Topics, region, and delivery time should remain unchanged
      expect(after?.topics).toEqual(before?.topics);
      expect(after?.region).toEqual(before?.region);
      expect(after?.deliveryTimeLocal).toEqual(before?.deliveryTimeLocal);
    });

    it("should return existing state if already in desired state", async () => {
      const response = await service.toggleDelivery({
        userId: "user123",
        enabled: true
      });

      expect(response.profile.newsletterEnabled).toBe(true);
      expect(response.changedFields || response.previouslyEnabled).toBeDefined();
    });

    it("should reject toggle if no preferences exist", async () => {
      await expect(
        service.toggleDelivery({
          userId: "nonexistent",
          enabled: false
        })
      ).rejects.toThrow(/no saved preferences/);
    });
  });

  describe("getDeliveryStatus", () => {
    it("should return enabled status", async () => {
      const profile: PreferenceProfile = {
        userId: "user123",
        topics: ["Technology"],
        region: { country: "Canada" },
        deliveryTimeLocal: "08:00",
        timezone: "America/Toronto",
        newsletterEnabled: true,
        updatedAt: new Date().toISOString()
      };
      await repository.savePreferenceProfile(profile);

      const status = await service.getDeliveryStatus("user123");

      expect(status).toBe(true);
    });

    it("should return disabled status", async () => {
      const profile: PreferenceProfile = {
        userId: "user123",
        topics: ["Technology"],
        region: { country: "Canada" },
        deliveryTimeLocal: "08:00",
        timezone: "America/Toronto",
        newsletterEnabled: false,
        updatedAt: new Date().toISOString()
      };
      await repository.savePreferenceProfile(profile);

      const status = await service.getDeliveryStatus("user123");

      expect(status).toBe(false);
    });

    it("should return false for non-existent user", async () => {
      const status = await service.getDeliveryStatus("nonexistent");

      expect(status).toBe(false);
    });
  });
});
