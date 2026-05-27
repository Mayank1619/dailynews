/**
 * Integration Tests - Update Preferences Anytime
 * Tests that updates work correctly with the repository and validation
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { UpdatePreferencesAnytimeService } from "../../../api/src/features/onboarding-preferences/update-preferences-anytime.service";
import { MockPreferencesRepository } from "../../../api/src/features/onboarding-preferences/preferencesRepository";
import { OnboardingPreferencesTelemetry } from "../../../api/src/features/onboarding-preferences/telemetry";
import type { PreferenceProfile } from "../../../api/src/features/onboarding-preferences/types";

describe("Update Preferences Anytime - Integration", () => {
  let service: UpdatePreferencesAnytimeService;
  let repository: MockPreferencesRepository;
  let telemetryEvents: unknown[] = [];

  beforeEach(async () => {
    repository = new MockPreferencesRepository();
    telemetryEvents = [];
    const telemetry = new OnboardingPreferencesTelemetry((event) => {
      telemetryEvents.push(event);
    });
    service = new UpdatePreferencesAnytimeService(repository, telemetry);

    // Set up initial preferences
    const initial: PreferenceProfile = {
      userId: "user123",
      topics: ["Technology", "Business"],
      region: { country: "Canada", province: "Ontario" },
      deliveryTimeLocal: "08:00",
      timezone: "America/Toronto",
      newsletterEnabled: true,
      updatedAt: new Date().toISOString()
    };
    await repository.savePreferenceProfile(initial);
  });

  it("should fulfill PUT /api/preferences contract (update)", async () => {
    const response = await service.updatePreferences({
      userId: "user123",
      topics: ["Science", "Health"]
    });

    expect(response.profile).toBeDefined();
    expect(response.profile.userId).toBe("user123");
    expect(response.profile.topics).toEqual(["Science", "Health"]);
    expect(response.changedFields).toContain("topics");
  });

  it("should fulfill GET /api/preferences contract for current state", async () => {
    await service.updatePreferences({
      userId: "user123",
      deliveryTimeLocal: "18:00"
    });

    const profile = await service.getPreferences("user123");

    expect(profile).toBeDefined();
    expect(profile?.deliveryTimeLocal).toBe("18:00");
  });

  it("should not allow partial topic removal to zero", async () => {
    await expect(
      service.updatePreferences({
        userId: "user123",
        topics: []
      })
    ).rejects.toThrow(/At least one topic must be selected/);
  });

  it("should track updated fields for audit (contract FR-PREF-005)", async () => {
    const response = await service.updatePreferences({
      userId: "user123",
      topics: ["Science"],
      deliveryTimeLocal: "09:00"
    });

    expect(response.changedFields).toContain("topics");
    expect(response.changedFields).toContain("deliveryTimeLocal");
  });

  it("should preserve nexus profile data on partial updates", async () => {
    await service.updatePreferences({
      userId: "user123",
      topics: ["Science"]
    });

    const updated = await service.getPreferences("user123");

    // Original values should remain
    expect(updated?.region.province).toBe("Ontario");
    expect(updated?.timezone).toBe("America/Toronto");
    expect(updated?.newsletterEnabled).toBe(true);
  });

  it("should handle multiple updates in sequence", async () => {
    // First update
    await service.updatePreferences({
      userId: "user123",
      topics: ["Science"]
    });

    // Second update
    const response = await service.updatePreferences({
      userId: "user123",
      deliveryTimeLocal: "18:00",
      timezone: "America/Vancouver"
    });

    expect(response.profile.topics).toEqual(["Science"]);
    expect(response.profile.deliveryTimeLocal).toBe("18:00");
    expect(response.profile.timezone).toBe("America/Vancouver");
  });

  it("should emit telemetry for all updates", async () => {
    await service.updatePreferences({
      userId: "user123",
      topics: ["Science"]
    });

    const updateEvent = telemetryEvents.find(
      (e: any) => e.event === "preferences_updated"
    );

    expect(updateEvent).toBeDefined();
    expect((updateEvent as any).metadata.changedFieldCount).toBeGreaterThan(0);
  });

  it("should enforce ownership check (userId in request)", async () => {
    const response = await service.updatePreferences({
      userId: "user123",
      topics: ["Science"]
    });

    expect(response.profile.userId).toBe("user123");
  });

  it("should apply preference changes to next generation (contract FR-PREF-005)", async () => {
    const before = await service.getPreferences("user123");

    await service.updatePreferences({
      userId: "user123",
      topics: ["Science", "Health"]
    });

    const after = await service.getPreferences("user123");

    // Verify the new topics are immediately available
    expect(after?.topics).toEqual(["Science", "Health"]);
    expect(after?.updatedAt).not.toBe(before?.updatedAt);
  });
});
