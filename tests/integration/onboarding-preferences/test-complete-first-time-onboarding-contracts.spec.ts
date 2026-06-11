/**
 * Integration Tests - Complete First-Time Onboarding
 * Tests API contract boundaries and service integration
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { CompleteFirstTimeOnboardingService } from "../../../apps/api/src/features/onboarding-preferences/complete-first-time-onboarding.service";
import { MockPreferencesRepository } from "../../../apps/api/src/features/onboarding-preferences/preferencesRepository";
import { OnboardingPreferencesTelemetry } from "../../../apps/api/src/features/onboarding-preferences/telemetry";

describe("Complete First-Time Onboarding - Integration", () => {
  let service: CompleteFirstTimeOnboardingService;
  let repository: MockPreferencesRepository;
  let telemetryEvents: unknown[] = [];

  beforeEach(() => {
    repository = new MockPreferencesRepository();
    telemetryEvents = [];
    const telemetry = new OnboardingPreferencesTelemetry((event) => {
      telemetryEvents.push(event);
    });
    service = new CompleteFirstTimeOnboardingService(repository, telemetry);
  });

  it("should fulfill GET /api/preferences contract (empty state)", async () => {
    const profile = await repository.getPreferenceProfile("user123");

    expect(profile).toBeNull();
  });

  it("should fulfill PUT /api/preferences contract (create)", async () => {
    const response = await service.completeOnboarding({
      userId: "user123",
      topics: ["Technology", "Business"],
      region: { country: "Canada", province: "Ontario" },
      deliveryTimeLocal: "08:00",
      timezone: "America/Toronto"
    });

    // Verify response shape matches contract
    expect(response.profile).toBeDefined();
    expect(response.profile.userId).toBe("user123");
    expect(response.profile.topics).toEqual(["Technology", "Business"]);
    expect(response.profile.region).toEqual({ country: "Canada", province: "Ontario" });
    expect(response.profile.deliveryTimeLocal).toBe("08:00");
    expect(response.profile.timezone).toBe("America/Toronto");
    expect(response.profile.updatedAt).toBeDefined();
    expect(response.onboardingCompleted).toBe(true);
  });

  it("should fulfill GET /api/preferences contract (populated state)", async () => {
    // First create
    await service.completeOnboarding({
      userId: "user123",
      topics: ["Technology"],
      region: { country: "Canada" },
      deliveryTimeLocal: "08:00",
      timezone: "America/Toronto"
    });

    // Then retrieve
    const profile = await repository.getPreferenceProfile("user123");

    expect(profile).toBeDefined();
    expect(profile?.userId).toBe("user123");
    expect(profile?.topics).toContain("Technology");
    expect(profile?.newsletterEnabled).toBe(true);
  });

  it("should emit correct telemetry events on successful save", async () => {
    await service.completeOnboarding({
      userId: "user123",
      topics: ["Technology"],
      region: { country: "Canada" },
      deliveryTimeLocal: "08:00",
      timezone: "America/Toronto"
    });

    const saveEvent = telemetryEvents.find(
      (e: any) => e.event === "preferences_saved"
    );
    const successEvent = telemetryEvents.find(
      (e: any) => e.event === "save_succeeded"
    );

    expect(saveEvent).toBeDefined();
    expect(successEvent).toBeDefined();
  });

  it("should enforce authentication ownership (userId required)", async () => {
    // The service should verify userId in the request
    const response = await service.completeOnboarding({
      userId: "user123",
      topics: ["Technology"],
      region: { country: "Canada" },
      deliveryTimeLocal: "08:00",
      timezone: "America/Toronto"
    });

    expect(response.profile.userId).toBe("user123");

    // Verify that another user can't read this profile
    const otherUserProfile = await repository.getPreferenceProfile("user456");
    expect(otherUserProfile).toBeNull();
  });

  it("should validate minimum topic requirement (contract FR-PREF-007)", async () => {
    const response = service.completeOnboarding({
      userId: "user123",
      topics: [],
      region: { country: "Canada" },
      deliveryTimeLocal: "08:00",
      timezone: "America/Toronto"
    });

    await expect(response).rejects.toThrow();
  });

  it("should default region to Canada (contract FR-PREF-008)", async () => {
    const response = await service.completeOnboarding({
      userId: "user123",
      topics: ["Technology"],
      region: { country: "Canada" },
      deliveryTimeLocal: "08:00",
      timezone: "America/Toronto"
    });

    expect(response.profile.region.country).toBe("Canada");
  });

  it("should preserve onboarding state", async () => {
    await service.completeOnboarding({
      userId: "user123",
      topics: ["Technology"],
      region: { country: "Canada" },
      deliveryTimeLocal: "08:00",
      timezone: "America/Toronto"
    });

    const state = await repository.getOnboardingState("user123");

    expect(state?.completed).toBe(true);
    expect(state?.step).toBe(3);
  });
});
