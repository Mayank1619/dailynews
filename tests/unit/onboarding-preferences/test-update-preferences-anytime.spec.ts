/**
 * Unit Tests - Update Preferences Anytime
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { UpdatePreferencesAnytimeService } from "../../../api/src/features/onboarding-preferences/update-preferences-anytime.service";
import { MockPreferencesRepository } from "../../../api/src/features/onboarding-preferences/preferencesRepository";
import { OnboardingPreferencesTelemetry } from "../../../api/src/features/onboarding-preferences/telemetry";
import { PreferenceValidator } from "../../../api/src/features/onboarding-preferences/validator";
import type { PreferenceProfile } from "../../../api/src/features/onboarding-preferences/types";

describe("Update Preferences Anytime Service", () => {
  let service: UpdatePreferencesAnytimeService;
  let repository: MockPreferencesRepository;
  let telemetry: OnboardingPreferencesTelemetry;

  beforeEach(() => {
    repository = new MockPreferencesRepository();
    telemetry = new OnboardingPreferencesTelemetry(vi.fn());
    service = new UpdatePreferencesAnytimeService(repository, telemetry);
  });

  describe("updatePreferences", () => {
    beforeEach(async () => {
      // Set up existing preferences
      const existing: PreferenceProfile = {
        userId: "user123",
        topics: ["Technology", "Business"],
        region: { country: "Canada", province: "Ontario" },
        deliveryTimeLocal: "08:00",
        timezone: "America/Toronto",
        newsletterEnabled: true,
        updatedAt: new Date().toISOString()
      };
      await repository.savePreferenceProfile(existing);
    });

    it("should update topics successfully", async () => {
      const response = await service.updatePreferences({
        userId: "user123",
        topics: ["Science", "Health"]
      });

      expect(response.profile.topics).toEqual(["Science", "Health"]);
      expect(response.changedFields).toContain("topics");
    });

    it("should update delivery time successfully", async () => {
      const response = await service.updatePreferences({
        userId: "user123",
        deliveryTimeLocal: "18:00"
      });

      expect(response.profile.deliveryTimeLocal).toBe("18:00");
      expect(response.changedFields).toContain("deliveryTimeLocal");
    });

    it("should update region with province", async () => {
      const response = await service.updatePreferences({
        userId: "user123",
        region: { country: "Canada", province: "British Columbia" }
      });

      expect(response.profile.region.province).toBe("British Columbia");
      expect(response.changedFields).toContain("region");
    });

    it("should support partial updates without losing data", async () => {
      const response = await service.updatePreferences({
        userId: "user123",
        topics: ["Sports"]
      });

      // Other fields should remain unchanged
      expect(response.profile.region.province).toBe("Ontario");
      expect(response.profile.deliveryTimeLocal).toBe("08:00");
      expect(response.profile.timezone).toBe("America/Toronto");
    });

    it("should return empty changedFields if no actual changes", async () => {
      const response = await service.updatePreferences({
        userId: "user123",
        topics: ["Technology", "Business"] // Same as original
      });

      expect(response.changedFields.length).toBe(0);
    });

    it("should reject update if no profiles exist", async () => {
      await expect(
        service.updatePreferences({
          userId: "nonexistent",
          topics: ["Technology"]
        })
      ).rejects.toThrow(/no saved preferences to update/);
    });

    it("should reject update with invalid topics", async () => {
      await expect(
        service.updatePreferences({
          userId: "user123",
          topics: ["InvalidTopic"]
        })
      ).rejects.toThrow(/Invalid topics selected/);
    });

    it("should reject update with no topics", async () => {
      await expect(
        service.updatePreferences({
          userId: "user123",
          topics: []
        })
      ).rejects.toThrow(/At least one topic must be selected/);
    });
  });

  describe("getPreferences", () => {
    it("should retrieve existing preferences", async () => {
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

      const retrieved = await service.getPreferences("user123");

      expect(retrieved).toEqual(profile);
    });

    it("should return null for non-existent user", async () => {
      const result = await service.getPreferences("nonexistent");

      expect(result).toBeNull();
    });
  });
});
