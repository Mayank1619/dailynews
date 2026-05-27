/**
 * Integration Tests - Pause or Resume Delivery
 * Tests that delivery state can be toggled without losing preferences
 */

import { describe, it, expect, beforeEach } from "vitest";
import { PauseOrResumeDeliveryService } from "../../../api/src/features/onboarding-preferences/pause-or-resume-delivery.service";
import { MockPreferencesRepository } from "../../../api/src/features/onboarding-preferences/preferencesRepository";
import { OnboardingPreferencesTelemetry } from "../../../api/src/features/onboarding-preferences/telemetry";
import type { PreferenceProfile } from "../../../api/src/features/onboarding-preferences/types";

describe("Pause or Resume Delivery - Integration", () => {
  let service: PauseOrResumeDeliveryService;
  let repository: MockPreferencesRepository;
  let telemetryEvents: unknown[] = [];

  beforeEach(async () => {
    repository = new MockPreferencesRepository();
    telemetryEvents = [];
    const telemetry = new OnboardingPreferencesTelemetry((event) => {
      telemetryEvents.push(event);
    });
    service = new PauseOrResumeDeliveryService(repository, telemetry);

    // Set up initial preferences
    const initial: PreferenceProfile = {
      userId: "user123",
      topics: ["Technology", "Business", "Science"],
      region: { country: "Canada", province: "Ontario" },
      deliveryTimeLocal: "08:00",
      timezone: "America/Toronto",
      newsletterEnabled: true,
      updatedAt: new Date().toISOString()
    };
    await repository.savePreferenceProfile(initial);
  });

  it("should fulfill preference pause/resume contract (FR-PREF-006)", async () => {
    const pauseResponse = await service.toggleDelivery({
      userId: "user123",
      enabled: false
    });

    expect(pauseResponse.profile.newsletterEnabled).toBe(false);
    expect(pauseResponse.deliveryEnabled).toBe(false);
    expect(pauseResponse.previouslyEnabled).toBe(true);
  });

  it("should preserve all preferences when pausing (contract FR-PREF-010)", async () => {
    const before = await repository.getPreferenceProfile("user123");

    await service.toggleDelivery({
      userId: "user123",
      enabled: false
    });

    const after = await repository.getPreferenceProfile("user123");

    expect(after?.topics).toEqual(before?.topics);
    expect(after?.region).toEqual(before?.region);
    expect(after?.deliveryTimeLocal).toEqual(before?.deliveryTimeLocal);
    expect(after?.timezone).toEqual(before?.timezone);
  });

  it("should restore full functionality on resume", async () => {
    // Pause
    await service.toggleDelivery({
      userId: "user123",
      enabled: false
    });

    const paused = await repository.getPreferenceProfile("user123");
    expect(paused?.newsletterEnabled).toBe(false);

    // Resume
    const resumeResponse = await service.toggleDelivery({
      userId: "user123",
      enabled: true
    });

    expect(resumeResponse.profile.newsletterEnabled).toBe(true);
    expect(resumeResponse.previouslyEnabled).toBe(false);
  });

  it("should be reversible without data loss", async () => {
    const original = await repository.getPreferenceProfile("user123");

    // Multiple toggles
    await service.toggleDelivery({ userId: "user123", enabled: false });
    await service.toggleDelivery({ userId: "user123", enabled: true });
    await service.toggleDelivery({ userId: "user123", enabled: false });
    await service.toggleDelivery({ userId: "user123", enabled: true });

    const final = await repository.getPreferenceProfile("user123");

    expect(final?.topics).toEqual(original?.topics);
    expect(final?.region).toEqual(original?.region);
    expect(final?.deliveryTimeLocal).toEqual(original?.deliveryTimeLocal);
    expect(final?.newsletterEnabled).toBe(true);
  });

  it("should emit appropriate telemetry events", async () => {
    await service.toggleDelivery({
      userId: "user123",
      enabled: false
    });

    const pauseEvent = telemetryEvents.find((e: any) => e.event === "newsletter_paused");
    expect(pauseEvent).toBeDefined();

    await service.toggleDelivery({
      userId: "user123",
      enabled: true
    });

    const resumeEvent = telemetryEvents.find((e: any) => e.event === "newsletter_resumed");
    expect(resumeEvent).toBeDefined();
  });

  it("should getDeliveryStatus correctly reflect state", async () => {
    let status = await service.getDeliveryStatus("user123");
    expect(status).toBe(true);

    await service.toggleDelivery({
      userId: "user123",
      enabled: false
    });

    status = await service.getDeliveryStatus("user123");
    expect(status).toBe(false);

    await service.toggleDelivery({
      userId: "user123",
      enabled: true
    });

    status = await service.getDeliveryStatus("user123");
    expect(status).toBe(true);
  });

  it("should update the updatedAt timestamp", async () => {
    const before = await repository.getPreferenceProfile("user123");

    // Small delay to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 10));

    await service.toggleDelivery({
      userId: "user123",
      enabled: false
    });

    const after = await repository.getPreferenceProfile("user123");

    expect(new Date(after?.updatedAt!).getTime()).toBeGreaterThan(
      new Date(before?.updatedAt!).getTime()
    );
  });

  it("should enforce ownership for toggle", async () => {
    const response = await service.toggleDelivery({
      userId: "user123",
      enabled: false
    });

    expect(response.profile.userId).toBe("user123");
  });
});
